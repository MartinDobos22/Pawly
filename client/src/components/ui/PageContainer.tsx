import type { ReactNode } from 'react';
import { Box } from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';
import { PAGE_WIDTHS, type PageWidth } from './layout';

interface Props {
  children: ReactNode;
  /** Šírkový preset z `layout.ts`. Default 'page' (1024). */
  width?: PageWidth;
  sx?: SxProps<Theme>;
}

/**
 * Štandardný obsahový kontajner stránky — centrovaný, s jednotnou max šírkou.
 * Nahrádza hardcoded `<Box sx={{ maxWidth: 1024, mx: 'auto' }}>` po stránkach.
 */
export default function PageContainer({ children, width = 'page', sx }: Props) {
  return <Box sx={{ maxWidth: PAGE_WIDTHS[width], mx: 'auto', ...sx }}>{children}</Box>;
}
