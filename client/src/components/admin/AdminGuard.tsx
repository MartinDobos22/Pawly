import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useIsAdmin } from '../../hooks/useIsAdmin';

interface Props {
  children: ReactNode;
}

// Vpustí len admina; inak presmeruje na dashboard. Server vynucuje rovnaký
// gate na /api/admin/articles (UI je len pohodlie, nie bezpečnostná hranica).
export default function AdminGuard({ children }: Props) {
  const { isAdmin, loading } = useIsAdmin();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }
  if (!isAdmin) return <Navigate to="/prehlad" replace />;
  return <>{children}</>;
}
