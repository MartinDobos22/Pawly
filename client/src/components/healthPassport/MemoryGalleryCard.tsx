import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Box, Button, Card, Stack, Typography, alpha, useTheme } from '@mui/material';
import {
  AddPhotoAlternateOutlined as AddPhotoIcon,
  PhotoLibrary as GalleryIcon,
} from '@mui/icons-material';

interface Props {
  petName: string;
  photoUrl?: string;
}

export default function MemoryGalleryCard({ petName, photoUrl }: Props) {
  const { t } = useTranslation('healthPassport');
  const theme = useTheme();
  const navigate = useNavigate();

  return (
    <Card sx={{ p: { xs: 2, md: 2.5 } }}>
      <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 2 }}>
        <GalleryIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
        <Box sx={{ flex: 1 }}>
          <Typography variant="h3" sx={{ fontSize: '1.25rem', fontWeight: 700 }}>
            {t('gallery.title')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('gallery.subtitle')}
          </Typography>
        </Box>
        <Button size="small" onClick={() => navigate('/profily')}>
          {t('gallery.viewAll')}
        </Button>
      </Stack>

      {photoUrl ? (
        <Box
          component="img"
          src={photoUrl}
          alt={petName}
          sx={{
            width: '100%',
            maxHeight: 220,
            objectFit: 'cover',
            borderRadius: 3,
            display: 'block',
          }}
        />
      ) : (
        <Stack
          alignItems="center"
          spacing={1.5}
          sx={{
            py: 5,
            textAlign: 'center',
            borderRadius: 3,
            border: `1px dashed ${theme.palette.divider}`,
            color: 'text.secondary',
          }}
        >
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: 'primary.main',
            }}
          >
            <AddPhotoIcon />
          </Box>
          <Typography variant="body2" sx={{ maxWidth: 280 }}>
            {t('gallery.empty')}
          </Typography>
          <Button size="small" variant="outlined" onClick={() => navigate('/profily')}>
            {t('gallery.add')}
          </Button>
        </Stack>
      )}
    </Card>
  );
}
