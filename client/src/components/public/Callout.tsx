import { Box, Stack, Typography, useTheme } from '@mui/material';
import {
  LightbulbOutlined as TipIcon,
  WarningAmberOutlined as WarningIcon,
  InfoOutlined as InfoIcon,
} from '@mui/icons-material';
import RichText from './RichText';
import type { CalloutVariant } from '../../content/poradna/types';

interface Props {
  variant: CalloutVariant;
  title?: string;
  text: string;
}

const CONFIG: Record<
  CalloutVariant,
  { color: 'success' | 'error' | 'info'; icon: typeof TipIcon; defaultTitle: string }
> = {
  tip: { color: 'success', icon: TipIcon, defaultTitle: 'Tip' },
  warning: { color: 'error', icon: WarningIcon, defaultTitle: 'Pozor' },
  info: { color: 'info', icon: InfoIcon, defaultTitle: 'Zaujímavosť' },
};

export default function Callout({ variant, title, text }: Props) {
  const theme = useTheme();
  const { color, icon: Icon, defaultTitle } = CONFIG[variant];
  const accent = theme.palette[color].main;

  return (
    <Box
      sx={{
        my: theme.spacing(3),
        p: theme.spacing(2.5),
        borderRadius: `${theme.shape.borderRadius}px`,
        borderLeft: `4px solid ${accent}`,
        bgcolor: theme.palette.action.hover,
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: theme.spacing(1) }}>
        <Icon sx={{ color: accent, fontSize: theme.typography.h6.fontSize }} />
        <Typography variant="subtitle2" sx={{ color: accent }}>
          {title ?? defaultTitle}
        </Typography>
      </Stack>
      <Typography variant="body1" color="text.primary" sx={{ lineHeight: 1.8 }}>
        <RichText text={text} />
      </Typography>
    </Box>
  );
}
