import type { ReactNode } from 'react';
import { Box, Stack, Typography } from '@mui/material';
import IconTile from './IconTile';

interface Props {
  icon: ReactNode;
  /** Akcentová farba (theme token). Default: primary.main. */
  accent?: string;
  title: string;
  description?: string;
  /** Voliteľná akcia vpravo (primárne CTA stránky). */
  action?: ReactNode;
}

/**
 * Jednotná hlavička stránky: ikonová dlaždica + nadpis + popis + voliteľná akcia.
 * Nahrádza ručne skladané hlavičky (Stack + Box + Typography) po stránkach.
 */
export default function PageHeader({ icon, accent, title, description, action }: Props) {
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={2}
      alignItems={{ xs: 'flex-start', sm: 'center' }}
      justifyContent="space-between"
      sx={{ mb: 3 }}
    >
      <Stack direction="row" spacing={2} alignItems="center" sx={{ minWidth: 0 }}>
        <IconTile icon={icon} accent={accent} size={44} />
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h4">{title}</Typography>
          {description && (
            <Typography variant="body2" color="text.secondary">
              {description}
            </Typography>
          )}
        </Box>
      </Stack>
      {action && (
        <Box sx={{ flexShrink: 0, alignSelf: { xs: 'stretch', sm: 'auto' } }}>{action}</Box>
      )}
    </Stack>
  );
}
