import { Box, alpha, useTheme } from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';

type PawlyLogoSize = 'sm' | 'md' | 'lg' | 'xl';

interface Props {
  size?: PawlyLogoSize;
  onClick?: () => void;
  glow?: boolean;
  forceVariant?: 'light' | 'dark';
  sx?: SxProps<Theme>;
  alt?: string;
}

const HEIGHTS: Record<PawlyLogoSize, number | { xs: number; md: number }> = {
  sm: 28,
  md: { xs: 40, md: 48 },
  lg: { xs: 64, md: 88 },
  xl: { xs: 96, md: 128 },
};

export default function PawlyLogo({
  size = 'md',
  onClick,
  glow = false,
  forceVariant,
  sx,
  alt = 'Pawly',
}: Props) {
  const theme = useTheme();
  const variant = forceVariant ?? (theme.palette.mode === 'dark' ? 'dark' : 'light');
  const src =
    variant === 'dark' ? '/branding/pawly-logo-dark.png' : '/branding/pawly-logo-light.png';

  return (
    <Box
      component="img"
      src={src}
      alt={alt}
      onClick={onClick}
      sx={{
        height: HEIGHTS[size],
        width: 'auto',
        maxWidth: '100%',
        display: 'block',
        backgroundColor: 'transparent',
        cursor: onClick ? 'pointer' : 'default',
        filter:
          glow && variant === 'dark'
            ? `drop-shadow(0 0 10px ${alpha(theme.palette.primary.main, 0.4)})`
            : 'none',
        ...sx,
      }}
    />
  );
}
