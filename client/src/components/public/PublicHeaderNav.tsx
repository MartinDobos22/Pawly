import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@mui/material';

export default function PublicHeaderNav() {
  const navigate = useNavigate();
  const { t } = useTranslation('landing');

  return (
    <Button color="inherit" onClick={() => navigate('/poradna')} sx={{ whiteSpace: 'nowrap' }}>
      {t('hero.navAdvice')}
    </Button>
  );
}
