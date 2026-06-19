import { Link as RouterLink } from 'react-router-dom';
import { Box, Link as MuiLink, Stack, Typography } from '@mui/material';
import type { RelatedLink } from '../../content/relatedContent';

interface Props {
  links: RelatedLink[];
}

export default function ArticleRelatedLinks({ links }: Props) {
  if (links.length === 0) return null;

  return (
    <Box>
      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
        Súvisiace články
      </Typography>
      <Stack spacing={0.5}>
        {links.map((link) => (
          <MuiLink key={link.path} component={RouterLink} to={link.path} underline="hover">
            {link.title}
          </MuiLink>
        ))}
      </Stack>
    </Box>
  );
}
