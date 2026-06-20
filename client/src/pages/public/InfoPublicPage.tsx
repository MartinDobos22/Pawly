import { useTranslation } from 'react-i18next';
import Seo from '../../components/Seo';
import PublicPageLayout from '../../components/public/PublicPageLayout';
import InfoPage from '../InfoPage';

interface Props {
  darkMode: boolean;
  onToggleTheme: () => void;
}

export default function InfoPublicPage({ darkMode, onToggleTheme }: Props) {
  const { t } = useTranslation();
  return (
    <PublicPageLayout darkMode={darkMode} onToggleTheme={onToggleTheme}>
      <Seo
        title={`${t('nav.info')} | Pawly`}
        description="Často kladené otázky, návod na inštaláciu a informácie o aplikácii Pawly — pomocníkovi pre zdravie a starostlivosť o psa."
        path="/info"
      />
      <InfoPage />
    </PublicPageLayout>
  );
}
