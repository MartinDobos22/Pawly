import { Box, Chip, Stack, Typography, alpha, useTheme } from '@mui/material';

interface Pet {
  id: string;
  label: string;
  ratio: number;
}

const PETS: Pet[] = [
  { id: 'photo-1517849845537-4d257902454a', label: 'Pes', ratio: 1 },
  { id: 'photo-1514888286974-6c03e2ca1dba', label: 'Mačka', ratio: 1.3 },
  { id: 'photo-1585110396000-c9ffd4e4b308', label: 'Králik', ratio: 0.85 },
  { id: 'photo-1552728089-57bdde30beb3', label: 'Papagáj', ratio: 1.2 },
  { id: 'photo-1425082661705-1834bfd09dca', label: 'Škrečok', ratio: 1 },
  { id: 'photo-1553284965-83fd3e82fa5a', label: 'Kôň', ratio: 0.9 },
  { id: 'photo-1437622368342-7a3d73a34c8f', label: 'Korytnačka', ratio: 1.25 },
  { id: 'photo-1561037404-61cd46aa615b', label: 'Pes', ratio: 1.1 },
];

const srcFor = (id: string, w = 500) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

export default function PetPhotoWall() {
  const theme = useTheme();

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
            Pre každého chlpáča{' '}
            <Box
              component="span"
              sx={{
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              aj nechlpáča
            </Box>
          </Typography>
          <Typography
            variant="body1"
            sx={{ color: 'text.secondary', maxWidth: 540, fontSize: { xs: '1rem', md: '1.1rem' } }}
          >
            Psy, mačky, králiky, vtáky, plazy aj kone — Pawport zvládne zdravotnú kartu pre každé
            domáce zviera.
          </Typography>
        </Stack>

        <Box
          sx={{
            columnCount: { xs: 2, sm: 3, md: 4 },
            columnGap: { xs: 1.5, md: 2 },
          }}
        >
          {PETS.map((pet, idx) => (
            <Box
              key={`${pet.id}-${idx}`}
              sx={{
                position: 'relative',
                mb: { xs: 1.5, md: 2 },
                borderRadius: 4,
                overflow: 'hidden',
                breakInside: 'avoid',
                boxShadow: '0 8px 24px rgba(15,76,92,0.12)',
                cursor: 'default',
                '&:hover img': { transform: 'scale(1.05)' },
                '&:hover .pet-label': { opacity: 1 },
              }}
            >
              <Box
                component="img"
                src={srcFor(pet.id)}
                alt={pet.label}
                loading="lazy"
                sx={{
                  display: 'block',
                  width: '100%',
                  aspectRatio: String(pet.ratio),
                  objectFit: 'cover',
                  transition: 'transform 500ms ease',
                }}
              />
              <Chip
                className="pet-label"
                label={pet.label}
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
