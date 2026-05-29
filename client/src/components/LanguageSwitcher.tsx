import { Button, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { Language as LanguageIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

interface Props {
  sx?: object;
  variant?: 'sidebar' | 'compact';
}

export default function LanguageSwitcher({ sx, variant = 'sidebar' }: Props) {
  const { i18n, t } = useTranslation();

  const toggle = () => {
    const next = i18n.language === 'sk' ? 'en' : 'sk';
    void i18n.changeLanguage(next);
  };

  const nextLabel = i18n.language === 'sk' ? t('language.en') : t('language.sk');

  if (variant === 'compact') {
    return (
      <Button
        size="small"
        color="inherit"
        startIcon={<LanguageIcon fontSize="small" />}
        onClick={toggle}
        aria-label={t('language.label')}
        sx={{ fontWeight: 500, minWidth: 0, px: 1, ...sx }}
      >
        {i18n.language.toUpperCase()}
      </Button>
    );
  }

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
