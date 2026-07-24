import { useState, type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Button, Card, Stack, Typography, alpha, useTheme } from '@mui/material';
import { EventAvailable as UpcomingIcon, ExpandMore as ExpandMoreIcon } from '@mui/icons-material';

import { relativeDate, formatDateShort } from '../../utils/relativeDate';

const COLLAPSED_LIMIT = 4;

export interface UpcomingReminderItem {
  key: string;
  icon: ReactElement;
  label: string;
  detail?: string;
  /** ISO date the reminder is due. */
  date: string;
  accentColor: string;
  onClick?: () => void;
}

interface Props {
  items: UpcomingReminderItem[];
}

export default function UpcomingRemindersCard({ items }: Props) {
  const theme = useTheme();
  const { t } = useTranslation('healthPassport');
  const [expanded, setExpanded] = useState(false);

  const rows = items
    .map((item) => {
      const rel = relativeDate(item.date);
      return rel ? { ...item, rel } : null;
    })
    .filter(
      (x): x is UpcomingReminderItem & { rel: NonNullable<ReturnType<typeof relativeDate>> } =>
        x !== null
    )
    .sort((a, b) => a.rel.diffDays - b.rel.diffDays);

  const hasOverflow = rows.length > COLLAPSED_LIMIT;
  const visibleRows = expanded ? rows : rows.slice(0, COLLAPSED_LIMIT);

  return (
    <Card
      sx={{
        p: { xs: 2, md: 3 },
        mb: 2.5,
        borderRadius: 0,
        borderTopWidth: 0,
        borderBottomWidth: 0,
        bgcolor: 'background.default',
      }}
    >
      <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 2 }}>
        <UpcomingIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
        <Typography variant="h3" sx={{ fontSize: '1.05rem', fontWeight: 700 }}>
          {t('upcoming.title')}
        </Typography>
      </Stack>

      {rows.length === 0 ? (
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {t('upcoming.empty')}
        </Typography>
      ) : (
        <Stack spacing={1}>
          {visibleRows.map((item) => {
            const overdue = item.rel.diffDays < 0;
            const color = overdue ? theme.palette.error.main : item.accentColor;
            return (
              <Box
                key={item.key}
                onClick={item.onClick}
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 1.5,
                  py: 1,
                  px: 1,
                  borderRadius: 2,
                  cursor: item.onClick ? 'pointer' : 'default',
                  transition: 'background-color 120ms ease',
                  '&:hover': item.onClick
                    ? { bgcolor: alpha(theme.palette.text.primary, 0.04) }
                    : undefined,
                }}
              >
                <Box
                  sx={{
                    width: 34,
                    height: 34,
                    borderRadius: 2,
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: alpha(color, 0.12),
                    color,
                    '& svg': { fontSize: 18 },
                  }}
                >
                  {item.icon}
                </Box>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {item.label}
                  </Typography>
                  {item.detail && (
                    <Typography
                      variant="caption"
                      sx={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        color: 'text.secondary',
                      }}
                    >
                      {item.detail}
                    </Typography>
                  )}
                </Box>
                <Box sx={{ flexShrink: 0, textAlign: 'right' }}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 700,
                      color: overdue ? 'error.main' : 'text.primary',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {item.rel.text}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: 'text.secondary', whiteSpace: 'nowrap' }}
                  >
                    {formatDateShort(item.date)}
                  </Typography>
                </Box>
              </Box>
            );
          })}
          {hasOverflow && (
            <Button
              variant="text"
              size="small"
              onClick={() => setExpanded((v) => !v)}
              endIcon={
                <ExpandMoreIcon
                  sx={{
                    transition: 'transform 150ms ease',
                    transform: expanded ? 'rotate(180deg)' : 'none',
                  }}
                />
              }
              sx={{ alignSelf: 'center', color: 'text.secondary', mt: 0.5 }}
            >
              {expanded
                ? t('upcoming.showLess')
                : t('upcoming.showAll', { count: rows.length - COLLAPSED_LIMIT })}
            </Button>
          )}
        </Stack>
      )}
    </Card>
  );
}
