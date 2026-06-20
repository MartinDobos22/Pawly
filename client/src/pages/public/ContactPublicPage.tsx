import { useTranslation } from 'react-i18next';
import Seo from '../../components/Seo';
import PublicPageLayout from '../../components/public/PublicPageLayout';
import ContactPage from '../ContactPage';

interface Props {
  darkMode: boolean;
  onToggleTheme: () => void;
}

export default function ContactPublicPage({ darkMode, onToggleTheme }: Props) {
  const { t } = useTranslation();
  return (
    <PublicPageLayout darkMode={darkMode} onToggleTheme={onToggleTheme}>
      <Seo
        title={`${t('contact.title')} | Pawly`}
        description={t('contact.subtitle')}
        path="/kontakt"
      />
      <ContactPage />
    </PublicPageLayout>
  );
}
