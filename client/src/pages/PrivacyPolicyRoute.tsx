import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Box, Container, IconButton, Toolbar } from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import { PetProfilesProvider } from '../contexts/PetProfilesContext';
import { ActivePetProvider } from '../contexts/ActivePetContext';
import { HealthDataProvider } from '../contexts/HealthDataContext';
import Layout from '../components/Layout';
import PawlyLogo from '../components/PawlyLogo';
import PrivacyPolicyPage from './PrivacyPolicyPage';
import Seo from '../components/Seo';

interface Props {
  darkMode: boolean;
  onToggleTheme: () => void;
}

export default function PrivacyPolicyRoute({ darkMode, onToggleTheme }: Props) {
  const { user, loading } = useAuth();
  const { t } = useTranslation('auth');
  const navigate = useNavigate();

  if (loading) return null;

  const seo = (
    <Seo
      title="Ochrana súkromia — Pawly"
      description="Ako Pawly nakladá s tvojimi údajmi a údajmi tvojho zvieraťa. Zásady ochrany osobných údajov."
      path="/ochrana-sukromia"
    />
  );

  if (user) {
    return (
      <>
        {seo}
        <PetProfilesProvider>
          <ActivePetProvider>
            <HealthDataProvider>
              <Layout darkMode={darkMode} onToggleTheme={onToggleTheme}>
                <PrivacyPolicyPage />
              </Layout>
            </HealthDataProvider>
          </ActivePetProvider>
        </PetProfilesProvider>
      </>
    );
  }

  return (
    <>
      {seo}
      <Box sx={{ minHeight: '100dvh', bgcolor: 'background.default' }}>
        <Toolbar sx={{ px: { xs: 2, md: 3 }, gap: 1.5 }}>
          <IconButton
            onClick={() => navigate(-1)}
            aria-label={t('resetPassword.backToLogin')}
            edge="start"
          >
            <ArrowBackIcon />
          </IconButton>
          <PawlyLogo size="sm" />
        </Toolbar>
        <Container maxWidth="md" sx={{ py: { xs: 3, md: 5 }, px: { xs: 2, md: 3 } }}>
          <PrivacyPolicyPage />
        </Container>
      </Box>
    </>
  );
}
