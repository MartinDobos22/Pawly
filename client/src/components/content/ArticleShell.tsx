import type { ReactNode } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Container, Link as MuiLink } from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';

interface Props {
  backHref: string;
  backLabel: string;
  children: ReactNode;
}

export default function ArticleShell({ backHref, backLabel, children }: Props) {
  return (
    <Container maxWidth="md" sx={{ py: { xs: 4, md: 6 } }}>
      <Box sx={{ maxWidth: 760, mx: 'auto' }}>
        <MuiLink
          component={RouterLink}
          to={backHref}
          underline="hover"
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.5,
            color: 'text.secondary',
            fontSize: '0.9rem',
            mb: 3,
          }}
        >
          <ArrowBackIcon fontSize="small" />
          {backLabel}
        </MuiLink>
        {children}
      </Box>
    </Container>
  );
}
