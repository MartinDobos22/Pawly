import Seo from '../../components/Seo';
import PublicPageLayout from '../../components/public/PublicPageLayout';
import ContactPage from '../ContactPage';

interface Props {
  darkMode: boolean;
  onToggleTheme: () => void;
}

export const seo = {
  title: 'Kontakt | Pawly',
  description:
    'Máš otázku, narazil si na chybu alebo nám chceš dať spätnú väzbu? Napíš nám — radi pomôžeme.',
  path: '/kontakt',
};

export default function ContactPublicPage({ darkMode, onToggleTheme }: Props) {
  return (
    <PublicPageLayout darkMode={darkMode} onToggleTheme={onToggleTheme}>
      <Seo {...seo} />
      <ContactPage />
    </PublicPageLayout>
  );
}
