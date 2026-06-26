import { useMemo } from 'react';
import { Alert, Box, List, ListItem, ListItemIcon, ListItemText, useTheme } from '@mui/material';
import {
  CheckCircleOutline as OkIcon,
  WarningAmberOutlined as WarningIcon,
  ErrorOutline as ErrorIcon,
  InfoOutlined as InfoIcon,
} from '@mui/icons-material';
import { analyzeSeo, seoSummary, type SeoCheckStatus } from '../../utils/articleSeo';
import type { AdminArticle } from '../../content/poradna/types';

interface Props {
  article: AdminArticle;
}

const ICONS: Record<SeoCheckStatus, { Icon: typeof OkIcon; color: string }> = {
  ok: { Icon: OkIcon, color: 'success.main' },
  warning: { Icon: WarningIcon, color: 'warning.main' },
  error: { Icon: ErrorIcon, color: 'error.main' },
  info: { Icon: InfoIcon, color: 'text.secondary' },
};

export default function ArticleSeoPanel({ article }: Props) {
  const theme = useTheme();
  const checks = useMemo(() => analyzeSeo(article), [article]);
  const { errors, warnings } = useMemo(() => seoSummary(checks), [checks]);

  const summary =
    errors > 0
      ? {
          severity: 'error' as const,
          text: `${errors} kritických problémov treba opraviť pred publikovaním.`,
        }
      : warnings > 0
        ? {
            severity: 'warning' as const,
            text: `${warnings} odporúčaní na zlepšenie. Publikovať môžeš, ale zváž úpravy.`,
          }
        : { severity: 'success' as const, text: 'SEO vyzerá dobre.' };

  return (
    <Box sx={{ maxWidth: 720, mx: 'auto' }}>
      <Alert severity={summary.severity} sx={{ mb: theme.spacing(2) }}>
        {summary.text}
      </Alert>
      <List disablePadding>
        {checks.map((check) => {
          const { Icon, color } = ICONS[check.status];
          return (
            <ListItem key={check.id} divider alignItems="flex-start">
              <ListItemIcon sx={{ minWidth: theme.spacing(5), color, mt: 0.5 }}>
                <Icon />
              </ListItemIcon>
              <ListItemText primary={check.label} secondary={check.detail} />
            </ListItem>
          );
        })}
      </List>
    </Box>
  );
}
