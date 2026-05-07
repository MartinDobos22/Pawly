export interface DownscaleResult {
  dataUrl: string;
  bytes: number;
  mimeType: string;
}

export async function downscaleImage(
  file: File,
  maxWidth = 1024,
  mimeType: 'image/jpeg' | 'image/webp' | 'image/png' = 'image/jpeg',
  quality = 0.85
): Promise<DownscaleResult> {
  const bitmap = await loadBitmap(file);

  const scale = bitmap.width > maxWidth ? maxWidth / bitmap.width : 1;
  const targetWidth = Math.round(bitmap.width * scale);
  const targetHeight = Math.round(bitmap.height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2D kontext nie je dostupný.');
  }
  ctx.drawImage(bitmap, 0, 0, targetWidth, targetHeight);

  const dataUrl = canvas.toDataURL(mimeType, quality);
  const bytes = estimateDataUrlBytes(dataUrl);

  return { dataUrl, bytes, mimeType };
}

function estimateDataUrlBytes(dataUrl: string): number {
  const commaIndex = dataUrl.indexOf(',');
  const base64 = commaIndex >= 0 ? dataUrl.slice(commaIndex + 1) : dataUrl;
  const padding = base64.endsWith('==') ? 2 : base64.endsWith('=') ? 1 : 0;
  return Math.floor((base64.length * 3) / 4) - padding;
}

async function loadBitmap(file: File): Promise<ImageBitmap | HTMLImageElement> {
  if (typeof createImageBitmap === 'function') {
    try {
      return await createImageBitmap(file);
    } catch {
      // fall through to HTMLImageElement
    }
  }

  return await new Promise<HTMLImageElement>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Obrázok sa nepodarilo načítať.'));
    };
    img.src = url;
  });
}

export async function fileToDataUrl(file: File): Promise<string> {
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
    reader.onerror = () => reject(reader.error ?? new Error('Súbor sa nepodarilo načítať.'));
    reader.readAsDataURL(file);
  });
}
