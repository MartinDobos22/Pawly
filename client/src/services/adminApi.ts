import type { AdminArticle } from '../content/poradna/types';
import { getAuthHeader, handleUnauthorized } from './authToken';
import { logger } from '../utils/logger';

const BASE_URL = import.meta.env.VITE_API_URL ?? '';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const method = init?.method ?? 'GET';
  const url = `${BASE_URL}/api/admin${path}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(await getAuthHeader()),
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    await handleUnauthorized(res.status, res);
    const body = (await res.json().catch(() => null)) as {
      error?: { message?: string; code?: string };
    } | null;
    logger.error('Admin API zlyhal', { method, url, status: res.status, code: body?.error?.code });
    throw new Error(body?.error?.message ?? `Chyba servera (${res.status})`);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export async function getAdminStatus(): Promise<boolean> {
  const data = await request<{ isAdmin: boolean }>('/status');
  return data.isAdmin === true;
}

export async function listAdminArticles(): Promise<AdminArticle[]> {
  const data = await request<{ articles: AdminArticle[] }>('/articles');
  return data.articles;
}

export async function getAdminArticle(slug: string): Promise<AdminArticle> {
  const data = await request<{ article: AdminArticle }>(`/articles/${encodeURIComponent(slug)}`);
  return data.article;
}

export async function createAdminArticle(article: AdminArticle): Promise<AdminArticle> {
  const data = await request<{ article: AdminArticle }>('/articles', {
    method: 'POST',
    body: JSON.stringify(article),
  });
  return data.article;
}

export async function updateAdminArticle(slug: string, article: AdminArticle): Promise<AdminArticle> {
  const data = await request<{ article: AdminArticle }>(`/articles/${encodeURIComponent(slug)}`, {
    method: 'PUT',
    body: JSON.stringify(article),
  });
  return data.article;
}

export async function deleteAdminArticle(slug: string): Promise<void> {
  await request<void>(`/articles/${encodeURIComponent(slug)}`, { method: 'DELETE' });
}
