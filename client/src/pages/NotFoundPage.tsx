import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Box, Button, Stack, Typography, alpha, useTheme } from '@mui/material';
import {
  SentimentDissatisfied as SentimentDissatisfiedIcon,
  PetsOutlined as PetsOutlinedIcon,
  ScienceOutlined as ScienceOutlinedIcon,
} from '@mui/icons-material';

export default function NotFoundPage() {
  const theme = useTheme();
  const { t } = useTranslation();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Box
      sx={{
        maxWidth: 640,
        mx: 'auto',
        textAlign: 'center',
        py: { xs: 4, md: 8 },
      }}
    >
      <Box
        sx={{
          width: 96,
          height: 96,
          borderRadius: '50%',
          mx: 'auto',
          mb: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: alpha(theme.palette.primary.main, isDark ? 0.18 : 0.12),
          color: 'primary.main',
        }}
      >
        <SentimentDissatisfiedIcon sx={{ fontSize: 56 }} />
      </Box>
      <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
        404
      </Typography>
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 1.5 }}>
        {t('notFound.title')}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        {t('notFound.subtitle')}
      </Typography>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        gap={1.5}
        justifyContent="center"
        alignItems="center"
      >
        <Button
          component={RouterLink}
          to="/zdravotny-pas"
          variant="contained"
          startIcon={<PetsOutlinedIcon />}
        >
          {t('notFound.backHome')}
        </Button>
        <Button
          component={RouterLink}
          to="/analyza"
          variant="outlined"
          startIcon={<ScienceOutlinedIcon />}
        >
          {t('notFound.backAnalyze')}
        </Button>
      </Stack>
    </Box>
  );
}
