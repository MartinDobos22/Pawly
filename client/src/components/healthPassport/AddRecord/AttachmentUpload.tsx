import { useId, useRef } from 'react';
import { Alert, Box, Button, IconButton, Stack, TextField, Typography } from '@mui/material';
import {
  AttachFile as AttachFileIcon,
  Close as CloseIcon,
  PhotoLibrary as PhotoLibraryIcon,
  UploadFile as UploadFileIcon,
} from '@mui/icons-material';

import { MAX_FILE_SIZE_BYTES } from '../constants';
import type { AiAttachmentEntry } from './formTypes';

interface AttachmentUploadProps {
  attachments: AiAttachmentEntry[];
  error: string;
  label: string;
  maxFiles: number;
  onLabelChange: (value: string) => void;
  onAddFiles: (files: File[]) => void;
  onRemove: (id: string) => void;
}

const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export default function AttachmentUpload({
  attachments,
  error,
  label,
  maxFiles,
  onLabelChange,
  onAddFiles,
  onRemove,
}: AttachmentUploadProps) {
  const imageInputId = useId();
  const fileInputId = useId();
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = '';
    if (files.length > 0) onAddFiles(files);
  };

  const remaining = Math.max(0, maxFiles - attachments.length);
  const limitReached = remaining === 0;

  return (
    <Stack spacing={1.5}>
      <TextField
        size="small"
        label="Popis dokumentu (voliteľné)"
        placeholder="napr. Zdravotný pas — Aiko"
        value={label}
        onChange={(e) => onLabelChange(e.target.value)}
        fullWidth
      />

      <input
        ref={imageInputRef}
        id={imageInputId}
        type="file"
        multiple
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleChange}
      />
      <input
        ref={fileInputRef}
        id={fileInputId}
        type="file"
        multiple
        accept="application/pdf"
        style={{ display: 'none' }}
        onChange={handleChange}
      />

      <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
        <Button
          variant="outlined"
          startIcon={<PhotoLibraryIcon />}
          onClick={() => imageInputRef.current?.click()}
          disabled={limitReached}
        >
          Fotka / galéria
        </Button>
        <Button
          variant="outlined"
          startIcon={<UploadFileIcon />}
          onClick={() => fileInputRef.current?.click()}
          disabled={limitReached}
        >
          PDF / súbor
        </Button>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ textTransform: 'none', letterSpacing: 0, fontSize: '0.75rem', fontWeight: 400 }}
        >
          {attachments.length} / {maxFiles} strán
        </Typography>
      </Stack>

      {attachments.length > 0 && (
        <Stack spacing={0.75}>
          {attachments.map((entry, index) => (
            <Box
              key={entry.id}
              sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 1 }}
            >
              <Stack direction="row" alignItems="center" spacing={1.5}>
                {entry.previewUrl && entry.file.type.startsWith('image/') ? (
                  <Box
                    component="img"
                    src={entry.previewUrl}
                    alt={entry.file.name}
                    sx={{ width: 40, height: 40, borderRadius: 1, objectFit: 'cover' }}
                  />
                ) : (
                  <AttachFileIcon color="action" />
                )}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" sx={{ fontWeight: 500 }} noWrap>
                    Strana {index + 1} · {entry.file.name}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      textTransform: 'none',
                      letterSpacing: 0,
                      fontSize: '0.75rem',
                      fontWeight: 400,
                    }}
                  >
                    {formatBytes(entry.file.size)}
                  </Typography>
                </Box>
                <IconButton
                  size="small"
                  onClick={() => onRemove(entry.id)}
                  aria-label="Odstrániť stranu"
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Stack>
            </Box>
          ))}
        </Stack>
      )}

      {error ? (
        <Alert severity="warning">{error}</Alert>
      ) : (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ textTransform: 'none', letterSpacing: 0, fontSize: '0.75rem', fontWeight: 400 }}
        >
          Podporované formáty: PDF, JPEG, PNG, WebP. Max{' '}
          {Math.round(MAX_FILE_SIZE_BYTES / (1024 * 1024))} MB per stranu, max {maxFiles} strán.
        </Typography>
      )}
    </Stack>
  );
}
