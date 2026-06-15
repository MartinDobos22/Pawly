import { useTranslation } from 'react-i18next';
import { Box, Card, Chip, Stack, Typography, alpha, useTheme } from '@mui/material';
import {
  MedicalInformation as RecordsIcon,
  Payments as ExpensesIcon,
  FolderOpen as DocumentsIcon,
  Shield as InsuranceIcon,
} from '@mui/icons-material';

interface Props {
  onOpenRecords?: () => void;
  onOpenExpenses?: () => void;
}

interface Tile {
  key: string;
  icon: React.ReactElement;
  label: string;
  caption: string;
  onClick?: () => void;
  soon?: boolean;
}

export default function QuickLinksRow({ onOpenRecords, onOpenExpenses }: Props) {
  const { t } = useTranslation('healthPassport');
  const theme = useTheme();

  const tiles: Tile[] = [
    {
      key: 'medical',
      icon: <RecordsIcon />,
      label: t('quickLinks.medical'),
      caption: t('quickLinks.medicalCaption'),
      onClick: onOpenRecords,
    },
    {
      key: 'expenses',
      icon: <ExpensesIcon />,
      label: t('quickLinks.expenses'),
      caption: t('quickLinks.expensesCaption'),
      onClick: onOpenExpenses,
    },
    {
      key: 'documents',
      icon: <DocumentsIcon />,
      label: t('quickLinks.documents'),
      caption: t('quickLinks.documentsCaption'),
      soon: true,
    },
    {
      key: 'insurance',
      icon: <InsuranceIcon />,
      label: t('quickLinks.insurance'),
      caption: t('quickLinks.insuranceCaption'),
      soon: true,
    },
  ];

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
        gap: 1.5,
      }}
    >
      {tiles.map((tile) => {
        const interactive = Boolean(tile.onClick) && !tile.soon;
        return (
          <Card
            key={tile.key}
            role={interactive ? 'button' : undefined}
            tabIndex={interactive ? 0 : undefined}
            onClick={interactive ? tile.onClick : undefined}
            onKeyDown={
              interactive
                ? (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      tile.onClick?.();
                    }
                  }
                : undefined
            }
            sx={{
              p: 2,
              opacity: tile.soon ? 0.7 : 1,
              cursor: interactive ? 'pointer' : 'default',
              transition: 'transform 120ms ease, box-shadow 120ms ease',
              '&:hover': interactive
                ? { transform: 'translateY(-2px)', boxShadow: theme.shadows[3] }
                : undefined,
              '&:focus-visible': interactive
                ? { outline: `2px solid ${theme.palette.primary.main}`, outlineOffset: 2 }
                : undefined,
            }}
          >
            <Stack spacing={1}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: 'primary.main',
                  }}
                >
                  {tile.icon}
                </Box>
                {tile.soon && (
                  <Chip
                    label={t('quickLinks.soon')}
                    size="small"
                    sx={{ height: 20, fontSize: '0.65rem', fontWeight: 600 }}
                  />
                )}
              </Stack>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                {tile.label}
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: 'text.secondary', textTransform: 'none', letterSpacing: 0 }}
              >
                {tile.caption}
              </Typography>
            </Stack>
          </Card>
        );
      })}
    </Box>
  );
}
