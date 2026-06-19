import { Box, Link as MuiLink, Stack, Typography } from '@mui/material';
import type { ContentSource } from '../../content/foodSafety/types';

interface Props {
  sources: ContentSource[];
  lastReviewed: string;
}

export default function ArticleSources({ sources, lastReviewed }: Props) {
  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
        Zdroje
      </Typography>
      <Stack component="ul" spacing={0.5} sx={{ pl: 2.5, m: 0 }}>
        {sources.map((s) => (
          <Typography key={s.url} component="li" variant="body2">
            <MuiLink href={s.url} target="_blank" rel="noopener noreferrer">
              {s.label}
            </MuiLink>
          </Typography>
        ))}
      </Stack>
      <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block', mt: 1 }}>
        Posledná kontrola: {lastReviewed}
      </Typography>
    </Box>
  );
}
