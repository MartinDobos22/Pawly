import { Box, TextField, useTheme } from '@mui/material';
import { NodeViewWrapper, type NodeViewProps } from '@tiptap/react';

export default function ImageNodeView({ node, updateAttributes }: NodeViewProps) {
  const theme = useTheme();
  const src = (node.attrs.src as string) ?? '';
  const alt = (node.attrs.alt as string) ?? '';

  return (
    <NodeViewWrapper>
      <Box contentEditable={false} sx={{ my: theme.spacing(2) }}>
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
