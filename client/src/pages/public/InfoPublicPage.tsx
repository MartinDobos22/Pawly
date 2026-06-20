import Seo from '../../components/Seo';
import PublicPageLayout from '../../components/public/PublicPageLayout';
import InfoPage from '../InfoPage';

interface Props {
  darkMode: boolean;
  onToggleTheme: () => void;
}

export const seo = {
  title: 'Info | Pawly',
  description:
    'Často kladené otázky, návod na inštaláciu a informácie o aplikácii Pawly — pomocníkovi pre zdravie a starostlivosť o psa.',
  path: '/info',
};

export default function InfoPublicPage({ darkMode, onToggleTheme }: Props) {
  return (
    <PublicPageLayout darkMode={darkMode} onToggleTheme={onToggleTheme}>
      <Seo {...seo} />
      <InfoPage />
    </PublicPageLayout>
  );
}
