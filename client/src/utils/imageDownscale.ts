export interface DownscaleResult {
  dataUrl: string;
  bytes: number;
  mimeType: string;
}

export interface DownscaleOptions {
  maxWidth?: number;
  mimeType?: 'image/jpeg' | 'image/webp' | 'image/png';
  quality?: number;
  enhanceForOcr?: boolean;
}

export async function downscaleImage(
  file: File,
  maxWidthOrOptions: number | DownscaleOptions = 1600,
  mimeType: 'image/jpeg' | 'image/webp' | 'image/png' = 'image/jpeg',
  quality = 0.85
): Promise<DownscaleResult> {
  const options: Required<DownscaleOptions> =
    typeof maxWidthOrOptions === 'number'
      ? { maxWidth: maxWidthOrOptions, mimeType, quality, enhanceForOcr: false }
      : {
          maxWidth: maxWidthOrOptions.maxWidth ?? 1600,
          mimeType: maxWidthOrOptions.mimeType ?? mimeType,
          quality: maxWidthOrOptions.quality ?? quality,
          enhanceForOcr: maxWidthOrOptions.enhanceForOcr ?? false,
        };

  const bitmap = await loadBitmap(file);

  const scale = bitmap.width > options.maxWidth ? options.maxWidth / bitmap.width : 1;
  const targetWidth = Math.round(bitmap.width * scale);
  const targetHeight = Math.round(bitmap.height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2D kontext nie je dostupný.');
  }
  if (options.enhanceForOcr) {
    ctx.filter = 'contrast(1.15) brightness(1.05)';
  }
  ctx.drawImage(bitmap, 0, 0, targetWidth, targetHeight);

  // Uvoľni dekódovaný bitmap hneď — bez toho sa pri dávke veľkých fotiek z mobilu
  // nahromadí pamäť a ďalšie createImageBitmap/toDataURL volania zlyhajú.
  if (typeof ImageBitmap !== 'undefined' && bitmap instanceof ImageBitmap) {
    bitmap.close();
  }

  const dataUrl = canvas.toDataURL(options.mimeType, options.quality);
  // Uvoľni plátno (niektoré mobilné prehliadače držia GPU pamäť inak dlho).
  canvas.width = 0;
  canvas.height = 0;
  const bytes = estimateDataUrlBytes(dataUrl);

  return { dataUrl, bytes, mimeType: options.mimeType };
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
      return await createImageBitmap(file, { imageOrientation: 'from-image' });
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
