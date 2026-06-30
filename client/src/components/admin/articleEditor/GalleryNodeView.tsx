import { useRef, useState } from 'react';
import { Box, Button, IconButton, Stack, TextField, Typography, useTheme } from '@mui/material';
import { AddPhotoAlternateOutlined as AddIcon, Close as CloseIcon } from '@mui/icons-material';
import { NodeViewWrapper, type NodeViewProps } from '@tiptap/react';
import { uploadArticleImage } from '../../../services/adminApi';
import type { GalleryImage } from './GalleryNode';

export default function GalleryNodeView({ node, updateAttributes }: NodeViewProps) {
  const theme = useTheme();
  const images = (node.attrs.images as GalleryImage[]) ?? [];
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addImage = async (file: File) => {
    setUploading(true);
    try {
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result).split(',')[1] ?? '');
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
      });
      const { url } = await uploadArticleImage({ mimeType: file.type, base64Data });
      updateAttributes({ images: [...images, { src: url }] });
    } catch {
      /* admin uvidí, že sa obrázok nepridal */
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) =>
    updateAttributes({ images: images.filter((_, i) => i !== index) });

  const setAlt = (index: number, alt: string) =>
    updateAttributes({
      images: images.map((img, i) => (i === index ? { ...img, alt } : img)),
    });

  return (
    <NodeViewWrapper>
      <Box
        contentEditable={false}
        sx={{
          my: theme.spacing(2),
          p: theme.spacing(2),
          border: `1px dashed ${theme.palette.divider}`,
          borderRadius: `${theme.shape.borderRadius}px`,
          bgcolor: theme.palette.action.hover,
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ mb: theme.spacing(1.5) }}
        >
          <Typography variant="caption" color="text.secondary">
            Galéria ({images.length})
          </Typography>
          <Button
            size="small"
            startIcon={<AddIcon fontSize="small" />}
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? 'Nahrávam…' : 'Pridať obrázok'}
          </Button>
        </Stack>

        {images.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            Zatiaľ žiadne obrázky — pridaj prvý.
          </Typography>
        ) : (
          <Box
            sx={{
              display: 'grid',
              gap: theme.spacing(1),
              gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
            }}
          >
            {images.map((img, i) => (
              <Box key={`${img.src}-${i}`}>
                <Box sx={{ position: 'relative' }}>
                  <Box
                    component="img"
                    src={img.src}
                    alt={img.alt ?? ''}
                    sx={{
                      width: '100%',
                      aspectRatio: '1 / 1',
                      objectFit: 'cover',
                      borderRadius: `${theme.shape.borderRadius}px`,
                      display: 'block',
                    }}
                  />
                  <IconButton
                    size="small"
                    aria-label="Odstrániť obrázok"
                    onClick={() => removeImage(i)}
                    sx={{
                      position: 'absolute',
                      top: 4,
                      right: 4,
                      bgcolor: 'background.paper',
                      '&:hover': { bgcolor: 'background.paper' },
                    }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Box>
                <TextField
                  value={img.alt ?? ''}
                  onChange={(e) => setAlt(i, e.target.value)}
                  placeholder="Alt text"
                  size="small"
                  variant="standard"
                  fullWidth
                  sx={{ mt: 0.5 }}
                />
              </Box>
            ))}
          </Box>
        )}

        <input
          ref={inputRef}
          type="file"
          hidden
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void addImage(f);
            e.target.value = '';
          }}
        />
      </Box>
    </NodeViewWrapper>
  );
}
