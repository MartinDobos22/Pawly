import { randomUUID } from 'crypto';
import { getSupabase } from '../config/supabase';
import { httpError } from '../utils/httpError';
import { assertPetOwned } from './petOwnership';

const BUCKET = 'health-attachments';
const SIGNED_URL_TTL_SECONDS = 5 * 60;
const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;

export interface HealthAttachmentMeta {
  objectPath: string;
  mimeType: string;
  size: number;
  caption?: string;
  createdAt: string;
}

function sanitizeFileName(fileName: string): string {
  const normalized = fileName.normalize('NFKD').replace(/[\u0300-\u036f]/g, '');
  const safe = normalized
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return safe.slice(0, 120) || 'attachment';
}

function decodeBase64(base64Data: unknown): Buffer {
  if (typeof base64Data !== 'string' || base64Data.trim().length === 0) {
    throw httpError(400, 'Chýbajú dáta prílohy.', 'INVALID_ATTACHMENT');
  }
  const cleaned = base64Data.includes(',') ? base64Data.split(',').pop() : base64Data;
  const buffer = Buffer.from(cleaned ?? '', 'base64');
  if (buffer.length === 0) throw httpError(400, 'Príloha je prázdna.', 'INVALID_ATTACHMENT');
  if (buffer.length > MAX_ATTACHMENT_BYTES) {
    throw httpError(413, 'Príloha je príliš veľká.', 'ATTACHMENT_TOO_LARGE');
  }
  return buffer;
}

function assertObjectPathForPet(objectPath: string, petId: string): void {
  if (!objectPath.startsWith(`${petId}/`)) {
    throw httpError(403, 'Príloha nepatrí k tomuto zvieraťu.', 'FORBIDDEN_ATTACHMENT');
  }
}

export async function uploadHealthAttachment(
  appUserId: string,
  input: {
    petId?: unknown;
    fileName?: unknown;
    mimeType?: unknown;
    base64Data?: unknown;
    caption?: unknown;
  }
): Promise<HealthAttachmentMeta> {
  const petId = typeof input.petId === 'string' ? input.petId : '';
  if (!petId) throw httpError(400, 'Chýba petId.', 'INVALID_INPUT');
  await assertPetOwned(appUserId, petId);

  const mimeType =
    typeof input.mimeType === 'string' && input.mimeType
      ? input.mimeType
      : 'application/octet-stream';
  const fileName = sanitizeFileName(
    typeof input.fileName === 'string' ? input.fileName : 'attachment'
  );
  const buffer = decodeBase64(input.base64Data);
  const objectPath = `${petId}/${randomUUID()}-${fileName}`;

  const { error } = await getSupabase().storage.from(BUCKET).upload(objectPath, buffer, {
    contentType: mimeType,
    upsert: false,
  });
  if (error) throw error;

  const caption =
    typeof input.caption === 'string' && input.caption.trim() ? input.caption.trim() : undefined;
  return {
    objectPath,
    mimeType,
    size: buffer.length,
    caption,
    createdAt: new Date().toISOString(),
  };
}

export async function createHealthAttachmentSignedUrls(
  appUserId: string,
  input: { petId?: unknown; objectPaths?: unknown }
): Promise<Record<string, string>> {
  const petId = typeof input.petId === 'string' ? input.petId : '';
  if (!petId) throw httpError(400, 'Chýba petId.', 'INVALID_INPUT');
  await assertPetOwned(appUserId, petId);

  const objectPaths = Array.isArray(input.objectPaths)
    ? input.objectPaths.filter((p): p is string => typeof p === 'string' && p.length > 0)
    : [];
  for (const objectPath of objectPaths) assertObjectPathForPet(objectPath, petId);
  if (objectPaths.length === 0) return {};

  const { data, error } = await getSupabase()
    .storage.from(BUCKET)
    .createSignedUrls(objectPaths, SIGNED_URL_TTL_SECONDS);
  if (error) throw error;

  const urls: Record<string, string> = {};
  for (const item of data ?? []) {
    if (item.error) continue;
    if (item.path && item.signedUrl) urls[item.path] = item.signedUrl;
  }
  return urls;
}

export async function deleteHealthAttachment(
  appUserId: string,
  input: { petId?: unknown; objectPath?: unknown }
): Promise<void> {
  const petId = typeof input.petId === 'string' ? input.petId : '';
  const objectPath = typeof input.objectPath === 'string' ? input.objectPath : '';
  if (!petId || !objectPath) throw httpError(400, 'Chýba petId alebo objectPath.', 'INVALID_INPUT');
  await assertPetOwned(appUserId, petId);
  assertObjectPathForPet(objectPath, petId);

  const { error } = await getSupabase().storage.from(BUCKET).remove([objectPath]);
  if (error) throw error;
}
