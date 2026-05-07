import { useRef, useState, type ChangeEvent } from 'react';
import { Alert, Box, Button, IconButton, TextField, Typography, useTheme } from '@mui/material';
import { AddPhotoAlternate as AddPhotoIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { downscaleImage, fileToDataUrl } from '../../utils/imageDownscale';
import type { EpisodeAttachment } from '../../types/healthEpisode';
import { logger } from '../../utils/logger';

const MAX_ORIGINAL_FALLBACK_BYTES = 500 * 1024;

interface AttachmentGalleryProps {
  attachments: EpisodeAttachment[];
  onChange: (next: EpisodeAttachment[]) => void;
  disabled?: boolean;
}

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

export default function AttachmentGallery({
  attachments,
  onChange,
  disabled = false,
}: AttachmentGalleryProps) {
  const theme = useTheme();
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleAdd = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setError(null);
    setBusy(true);

    try {
      const next: EpisodeAttachment[] = [...attachments];
      for (const file of Array.from(files)) {
        if (!file.type.startsWith('image/')) {
          setError('Podporované sú len obrázky (JPG, PNG, WEBP).');
          continue;
        }

        try {
          const downscaled = await downscaleImage(file);
          next.push({
            id: uid(),
            dataUrl: downscaled.dataUrl,
            mimeType: downscaled.mimeType,
          });
          logger.info('Príloha downscalnutá', {
            originalBytes: file.size,
            resultBytes: downscaled.bytes,
            mimeType: downscaled.mimeType,
          });
        } catch (err) {
          logger.warn('Image downscale zlyhal, skúšam fallback', {
            error: err instanceof Error ? err.message : 'unknown',
          });
          if (file.size <= MAX_ORIGINAL_FALLBACK_BYTES) {
            const dataUrl = await fileToDataUrl(file);
            next.push({
              id: uid(),
              dataUrl,
              mimeType: file.type,
            });
          } else {
            setError(
              'Obrázok je príliš veľký a nepodarilo sa ho zmenšiť. Skúste menšie rozlíšenie.'
            );
          }
        }
      }
      onChange(next);
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const handleCaptionChange = (id: string, caption: string) => {
    onChange(attachments.map((a) => (a.id === id ? { ...a, caption } : a)));
  };

  const handleDelete = (id: string) => {
    onChange(attachments.filter((a) => a.id !== id));
  };

  const onFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    void handleAdd(e.target.files);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, flex: 1 }}>
          Foto prílohy
        </Typography>
        <Button
          size="small"
          variant="outlined"
          startIcon={<AddPhotoIcon />}
          onClick={() => inputRef.current?.click()}
          disabled={disabled || busy}
        >
          Pridať
        </Button>
        <input ref={inputRef} type="file" accept="image/*" multiple hidden onChange={onFileInput} />
      </Box>

      {error && (
        <Alert severity="warning" onClose={() => setError(null)} sx={{ mb: 1 }}>
          {error}
        </Alert>
      )}

      {attachments.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          Žiadne prílohy.
        </Typography>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gap: 1.5,
            gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)' },
          }}
        >
          {attachments.map((attachment) => (
            <Box
              key={attachment.id}
              sx={{
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 2,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Box
                component="img"
                src={attachment.dataUrl}
                alt={attachment.caption ?? 'Príloha'}
                sx={{ width: '100%', height: 120, objectFit: 'cover' }}
              />
              <Box sx={{ p: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <TextField
                  size="small"
                  fullWidth
                  variant="standard"
                  placeholder="Popis (voliteľné)"
                  value={attachment.caption ?? ''}
                  onChange={(e) => handleCaptionChange(attachment.id, e.target.value)}
                  disabled={disabled}
                />
                <IconButton
                  size="small"
                  onClick={() => handleDelete(attachment.id)}
                  disabled={disabled}
                  aria-label="Zmazať prílohu"
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}
