import { type ReactElement, type ReactNode } from 'react';
import { Box, Button, Card, Stack, Typography, alpha, useTheme } from '@mui/material';

interface Props {
  icon: ReactElement;
  title: string;
  description?: ReactNode;
  primaryAction?: { label: string; onClick: () => void; icon?: ReactElement };
  secondaryAction?: { label: string; onClick: () => void; icon?: ReactElement };
  variant?: 'card' | 'inline';
}

export default function EmptyState({
  icon,
  title,
  description,
  primaryAction,
  secondaryAction,
  variant = 'card',
}: Props) {
  const theme = useTheme();

  const content = (
    <Stack alignItems="center" spacing={1.5} sx={{ textAlign: 'center', py: 2 }}>
      <Box
        sx={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          bgcolor: alpha(theme.palette.primary.main, 0.1),
          color: 'primary.main',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          '& svg': { fontSize: 32 },
        }}
      >
        {icon}
      </Box>
      <Typography variant="h3" sx={{ fontSize: '1.15rem', fontWeight: 700 }}>
        {title}
      </Typography>
      {description && (
        <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 380 }}>
          {description}
        </Typography>
      )}
      {(primaryAction || secondaryAction) && (
        <Stack direction="row" gap={1} sx={{ pt: 1 }} flexWrap="wrap" justifyContent="center">
          {primaryAction && (
            <Button
              variant="contained"
              startIcon={primaryAction.icon}
              onClick={primaryAction.onClick}
            >
              {primaryAction.label}
            </Button>
          )}
          {secondaryAction && (
            <Button
              variant="text"
              startIcon={secondaryAction.icon}
              onClick={secondaryAction.onClick}
            >
              {secondaryAction.label}
            </Button>
          )}
        </Stack>
      )}
    </Stack>
  );

  if (variant === 'inline') return <Box sx={{ py: 3 }}>{content}</Box>;

  return (
    <Card
      sx={{
        p: { xs: 3, md: 4 },
        borderStyle: 'dashed',
        bgcolor: 'background.default',
        maxWidth: 560,
        mx: 'auto',
      }}
    >
      {content}
    </Card>
  );
}
