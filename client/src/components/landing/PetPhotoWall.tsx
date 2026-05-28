import { Box, Chip, Stack, Typography, alpha, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';

const PET_PHOTOS = [
  { id: 'photo-1517849845537-4d257902454a', ratio: 1 },
  { id: 'photo-1514888286974-6c03e2ca1dba', ratio: 1.3 },
  { id: 'photo-1585110396000-c9ffd4e4b308', ratio: 0.85 },
  { id: 'photo-1552728089-57bdde30beb3', ratio: 1.2 },
  { id: 'photo-1425082661705-1834bfd09dca', ratio: 1 },
  { id: 'photo-1553284965-83fd3e82fa5a', ratio: 0.9 },
  { id: 'photo-1437622368342-7a3d73a34c8f', ratio: 1.25 },
  { id: 'photo-1561037404-61cd46aa615b', ratio: 1.1 },
];

const srcFor = (id: string, w = 500) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

export default function PetPhotoWall() {
  const theme = useTheme();
  const { t } = useTranslation('landing');
  const petLabels = t('photoWall.pets', { returnObjects: true }) as Array<{ label: string }>;

  return (
    <Box sx={{ py: { xs: 8, md: 14 } }}>
      <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2.5, md: 4 } }}>
        <Stack alignItems="center" spacing={2} sx={{ mb: { xs: 5, md: 7 }, textAlign: 'center' }}>
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: '2rem', md: '3rem' },
              fontWeight: 700,
              letterSpacing: '-0.025em',
              lineHeight: 1.1,
            }}
          >
            {t('photoWall.title1')}{' '}
            <Box
              component="span"
              sx={{
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {t('photoWall.title2')}
            </Box>
          </Typography>
          <Typography
            variant="body1"
            sx={{ color: 'text.secondary', maxWidth: 540, fontSize: { xs: '1rem', md: '1.1rem' } }}
          >
            {t('photoWall.subtitle')}
          </Typography>
        </Stack>

        <Box
          sx={{
            columnCount: { xs: 2, sm: 3, md: 4 },
            columnGap: { xs: 1.5, md: 2 },
          }}
        >
          {PET_PHOTOS.map((pet, idx) => (
            <Box
              key={`${pet.id}-${idx}`}
              sx={{
                position: 'relative',
                mb: { xs: 1.5, md: 2 },
                borderRadius: 4,
                overflow: 'hidden',
                breakInside: 'avoid',
                '&:hover .pet-label': { opacity: 1 },
                '&:hover img': { transform: 'scale(1.06)' },
              }}
            >
              <Box
                component="img"
                src={srcFor(pet.id)}
                alt={petLabels[idx]?.label ?? ''}
                loading="lazy"
                sx={{
                  width: '100%',
                  aspectRatio: String(pet.ratio),
                  objectFit: 'cover',
                  transition: 'transform 500ms ease',
                }}
              />
              <Chip
                className="pet-label"
                label={petLabels[idx]?.label}
                size="small"
                sx={{
                  position: 'absolute',
                  bottom: 10,
                  left: 10,
                  bgcolor: alpha('#000', 0.55),
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: '0.72rem',
                  backdropFilter: 'blur(4px)',
                  opacity: 0.85,
                  transition: 'opacity 300ms ease',
                }}
              />
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
