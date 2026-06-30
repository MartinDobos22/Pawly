import { Box, IconButton, TextField, Tooltip, useTheme } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { NodeViewWrapper, type NodeViewProps } from '@tiptap/react';

export default function ImageNodeView({ node, updateAttributes, deleteNode }: NodeViewProps) {
  const theme = useTheme();
  const src = (node.attrs.src as string) ?? '';
  const alt = (node.attrs.alt as string) ?? '';

  return (
    <NodeViewWrapper>
      <Box contentEditable={false} sx={{ my: theme.spacing(2) }}>
        <Box sx={{ position: 'relative' }}>
          {src && (
            <Box
              component="img"
              src={src}
              alt={alt}
              sx={{
                display: 'block',
                maxWidth: '100%',
                height: 'auto',
                borderRadius: `${theme.shape.borderRadius}px`,
              }}
            />
          )}
          <Tooltip title="Zmazať obrázok">
            <IconButton
              size="small"
              aria-label="Zmazať obrázok"
              onClick={deleteNode}
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
          </Tooltip>
        </Box>
        <TextField
          value={alt}
          onChange={(e) => updateAttributes({ alt: e.target.value })}
          placeholder="Alt text (popis obrázka pre prístupnosť a SEO)"
          size="small"
          variant="standard"
          fullWidth
          sx={{ mt: theme.spacing(0.5) }}
        />
      </Box>
    </NodeViewWrapper>
  );
}
