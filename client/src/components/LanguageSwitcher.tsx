import { ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { Language as LanguageIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

interface Props {
  sx?: object;
}

export default function LanguageSwitcher({ sx }: Props) {
  const { i18n, t } = useTranslation();

  const toggle = () => {
    const next = i18n.language === 'sk' ? 'en' : 'sk';
    void i18n.changeLanguage(next);
  };

  const nextLabel = i18n.language === 'sk' ? t('language.en') : t('language.sk');

  return (
    <ListItemButton onClick={toggle} aria-label={t('language.label')} sx={sx}>
      <ListItemIcon>
        <LanguageIcon />
      </ListItemIcon>
      <ListItemText
        primary={nextLabel}
        primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 500 }}
      />
    </ListItemButton>
  );
}
