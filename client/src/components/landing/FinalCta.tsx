import { Box, Button, Stack, Typography, alpha, useTheme } from '@mui/material';
import { ArrowForward as ArrowIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const CTA_PHOTO =
  'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=1400&q=80';

export default function FinalCta() {
  const theme = useTheme();
  const navigate = useNavigate();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Box sx={{ py: { xs: 6, md: 10 } }}>
      <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2.5, md: 4 } }}>
        <Box
          sx={{
            position: 'relative',
            overflow: 'hidden',
            borderRadius: 6,
            minHeight: { xs: 320, md: 380 },
            display: 'flex',
            alignItems: 'center',
            isolation: 'isolate',
          }}
        >
          <Box
            component="img"
            src={CTA_PHOTO}
            alt="Veterinárna kontrola domáceho zvieraťa"
            loading="lazy"
            sx={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              zIndex: -2,
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              background: isDark
                ? `linear-gradient(135deg, ${alpha('#000', 0.85)} 0%, ${alpha(theme.palette.primary.dark, 0.7)} 100%)`
                : `linear-gradient(135deg, ${alpha(theme.palette.primary.dark, 0.92)} 0%, ${alpha(theme.palette.primary.main, 0.78)} 100%)`,
              zIndex: -1,
            }}
          />

          <Stack
            spacing={3}
            sx={{
              p: { xs: 3, md: 6 },
              maxWidth: 640,
              color: '#fff',
            }}
          >
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: '1.75rem', md: '2.5rem' },
                fontWeight: 700,
                lineHeight: 1.1,
                letterSpacing: '-0.02em',
                color: 'inherit',
              }}
            >
              Začni sa starať o zdravie tvojho miláčika ešte dnes
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: alpha('#fff', 0.85),
                fontSize: { xs: '1rem', md: '1.1rem' },
                maxWidth: 520,
              }}
            >
              Žiadna registrácia, žiadne poplatky. Stačí pridať profil zvieraťa a môžeš naplno
              využívať digitálny zdravotný pas.
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} gap={1.5}>
              <Button
                variant="contained"
                size="large"
                endIcon={<ArrowIcon />}
                onClick={() => navigate('/analyza')}
                sx={{
                  px: 3,
                  py: 1.25,
                  bgcolor: '#fff',
                  color: 'primary.dark',
                  fontSize: '1rem',
                  '&:hover': { bgcolor: alpha('#fff', 0.9) },
                }}
              >
                Vstúpiť do aplikácie
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate('/profily')}
                sx={{
                  px: 3,
                  py: 1.25,
                  borderColor: alpha('#fff', 0.5),
                  color: '#fff',
                  fontSize: '1rem',
                  '&:hover': {
                    borderColor: '#fff',
                    bgcolor: alpha('#fff', 0.1),
                  },
                }}
              >
                Vytvoriť profil
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}
