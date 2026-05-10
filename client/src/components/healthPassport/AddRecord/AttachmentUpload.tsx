import { useId, useRef } from 'react';
import { Alert, Box, Button, Chip, Stack, TextField, Typography } from '@mui/material';
import {
  AttachFile as AttachFileIcon,
  Close as CloseIcon,
  UploadFile as UploadFileIcon,
} from '@mui/icons-material';

import { MAX_FILE_SIZE_BYTES, SUPPORTED_FILE_TYPES } from '../constants';

interface AttachmentUploadProps {
  file: File | null;
  previewUrl: string;
  error: string;
  label: string;
  onLabelChange: (value: string) => void;
  onFileChange: (file: File | null) => void;
}

const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export default function AttachmentUpload({
  file,
  previewUrl,
  error,
  label,
  onLabelChange,
  onFileChange,
}: AttachmentUploadProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handlePick = () => inputRef.current?.click();

  return (
    <Stack spacing={1.5}>
      <TextField
        size="small"
        label="Popis dokumentu (voliteľné)"
        placeholder="napr. Výsledok krvného testu"
        value={label}
        onChange={(e) => onLabelChange(e.target.value)}
        fullWidth
      />

      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={SUPPORTED_FILE_TYPES.join(',')}
        style={{ display: 'none' }}
        onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
      />

      {!file ? (
        <Button
          variant="outlined"
          startIcon={<UploadFileIcon />}
          onClick={handlePick}
          sx={{ alignSelf: 'flex-start' }}
        >
          Vybrať súbor
        </Button>
      ) : (
        <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 1.5 }}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            {previewUrl && file.type.startsWith('image/') ? (
              <Box
                component="img"
                src={previewUrl}
                alt={file.name}
                sx={{ width: 48, height: 48, borderRadius: 1, objectFit: 'cover' }}
              />
            ) : (
              <AttachFileIcon color="action" />
            )}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="body2" sx={{ fontWeight: 500 }} noWrap>
                {file.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formatBytes(file.size)}
              </Typography>
            </Box>
            <Chip
              size="small"
              icon={<CloseIcon />}
              label="Odstrániť"
              onClick={() => onFileChange(null)}
              variant="outlined"
            />
          </Stack>
        </Box>
      )}

      {error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <Typography variant="caption" color="text.secondary">
          Podporované formáty: PDF, JPEG, PNG, WebP. Max{' '}
          {Math.round(MAX_FILE_SIZE_BYTES / (1024 * 1024))} MB.
        </Typography>
      )}
    </Stack>
  );
}
