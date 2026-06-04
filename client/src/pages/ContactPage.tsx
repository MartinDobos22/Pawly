import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Button,
  Card,
  CardContent,
  Link,
  Stack,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import {
  MailOutline as MailOutlineIcon,
  HelpOutline as HelpOutlineIcon,
} from '@mui/icons-material';

export default function ContactPage() {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const isDark = theme.palette.mode === 'dark';
  const lang = i18n.language?.toLowerCase().startsWith('en') ? 'en' : 'sk';
  const email = t('supportEmail');

  const title = lang === 'en' ? 'Contact' : 'Kontakt';
  const subtitle =
    lang === 'en'
      ? 'Have a question, found a bug, or want to share feedback? We’d love to hear from you.'
      : 'Máš otázku, narazil si na chybu alebo nám chceš dať spätnú väzbu? Napíš nám.';
  const emailLabel = lang === 'en' ? 'Email us' : 'Napíš nám e-mail';
  const responseHint =
    lang === 'en'
      ? 'We usually reply within a few business days.'
      : 'Zvyčajne odpovieme v priebehu niekoľkých pracovných dní.';
  const faqHint =
    lang === 'en'
      ? 'Before writing, you might find the answer in our FAQ.'
      : 'Pred napísaním sa pozri do našich častých otázok — možno tam nájdeš odpoveď rýchlejšie.';
  const faqCta = lang === 'en' ? 'Open FAQ' : 'Otvoriť FAQ';

  return (
    <Box sx={{ maxWidth: 760, mx: 'auto' }}>
      <Stack direction="row" alignItems="center" gap={1.5} sx={{ mb: 1 }}>
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: 2,
            bgcolor: alpha(theme.palette.primary.main, isDark ? 0.18 : 0.12),
            color: 'primary.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <MailOutlineIcon />
        </Box>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        </Box>
      </Stack>

      <Card sx={{ mt: 3, mb: 2.5 }}>
        <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
          <Typography variant="overline" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
            {emailLabel}
          </Typography>
          <Link
            href={`mailto:${email}`}
            underline="hover"
            sx={{ fontSize: '1.15rem', fontWeight: 600 }}
          >
            {email}
          </Link>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {responseHint}
          </Typography>
          <Button
            component="a"
            href={`mailto:${email}`}
            variant="contained"
            startIcon={<MailOutlineIcon />}
            sx={{ mt: 2, fontWeight: 600 }}
          >
            {emailLabel}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
          <Stack direction="row" gap={1.75} alignItems="flex-start">
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                flexShrink: 0,
                bgcolor: alpha(theme.palette.primary.main, isDark ? 0.18 : 0.1),
                color: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <HelpOutlineIcon fontSize="small" />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                {t('nav.faq')}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                {faqHint}
              </Typography>
              <Button
                component={RouterLink}
                to="/info?tab=faq"
                variant="outlined"
                size="small"
                startIcon={<HelpOutlineIcon />}
              >
                {faqCta}
              </Button>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
