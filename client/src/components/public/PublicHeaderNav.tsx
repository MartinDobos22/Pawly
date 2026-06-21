import { useState, type MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Box, Button, Divider, IconButton, ListSubheader, Menu, MenuItem, useMediaQuery, useTheme } from '@mui/material';
import {
  KeyboardArrowDown as ArrowDownIcon,
  Menu as MenuIcon,
} from '@mui/icons-material';
import { articles } from '../../content/poradna/articles';

interface LinkItem {
  label: string;
  to: string;
}

const GUIDE_LINKS: LinkItem[] = [
  { label: 'Analýza krmiva', to: '/analyza-krmiva-pre-psa' },
  { label: 'Digitálny zdravotný pas', to: '/digitalny-zdravotny-pas-pre-psa' },
  { label: 'Očkovanie psa', to: '/ockovanie-psa' },
  { label: 'Odčervenie psa', to: '/odcervenie-psa' },
  { label: 'Alergia na krmivo', to: '/alergia-na-krmivo-u-psa' },
  { label: 'Čo nesmie pes jesť', to: '/co-nesmie-pes-jest' },
];

export default function PublicHeaderNav() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { t } = useTranslation('landing');
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [guideAnchor, setGuideAnchor] = useState<null | HTMLElement>(null);
  const [adviceAnchor, setAdviceAnchor] = useState<null | HTMLElement>(null);
  const [mobileAnchor, setMobileAnchor] = useState<null | HTMLElement>(null);

  const adviceLinks: LinkItem[] = [
    { label: t('hero.navAllArticles'), to: '/poradna' },
    ...articles.map((a) => ({ label: a.title, to: `/poradna/${a.slug}` })),
  ];

  const go = (to: string) => {
    setGuideAnchor(null);
    setAdviceAnchor(null);
    setMobileAnchor(null);
    navigate(to);
  };

  if (isMobile) {
    return (
      <>
        <IconButton
          color="inherit"
          aria-label={t('hero.navMenu')}
          onClick={(e: MouseEvent<HTMLElement>) => setMobileAnchor(e.currentTarget)}
        >
          <MenuIcon />
        </IconButton>
        <Menu
          anchorEl={mobileAnchor}
          open={Boolean(mobileAnchor)}
          onClose={() => setMobileAnchor(null)}
        >
          <ListSubheader disableSticky>{t('hero.navGuide')}</ListSubheader>
          {GUIDE_LINKS.map((item) => (
            <MenuItem key={item.to} onClick={() => go(item.to)}>
              {item.label}
            </MenuItem>
          ))}
          <Divider />
          <ListSubheader disableSticky>{t('hero.navAdvice')}</ListSubheader>
          {adviceLinks.map((item) => (
            <MenuItem key={item.to} onClick={() => go(item.to)}>
              {item.label}
            </MenuItem>
          ))}
        </Menu>
      </>
    );
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      <Button
        color="inherit"
        endIcon={<ArrowDownIcon />}
        onClick={(e: MouseEvent<HTMLElement>) => setGuideAnchor(e.currentTarget)}
        sx={{ whiteSpace: 'nowrap' }}
      >
        {t('hero.navGuide')}
      </Button>
      <Menu anchorEl={guideAnchor} open={Boolean(guideAnchor)} onClose={() => setGuideAnchor(null)}>
        {GUIDE_LINKS.map((item) => (
          <MenuItem key={item.to} onClick={() => go(item.to)}>
            {item.label}
          </MenuItem>
        ))}
      </Menu>

      <Button
        color="inherit"
        endIcon={<ArrowDownIcon />}
        onClick={(e: MouseEvent<HTMLElement>) => setAdviceAnchor(e.currentTarget)}
        sx={{ whiteSpace: 'nowrap' }}
      >
        {t('hero.navAdvice')}
      </Button>
      <Menu anchorEl={adviceAnchor} open={Boolean(adviceAnchor)} onClose={() => setAdviceAnchor(null)}>
        {adviceLinks.map((item) => (
          <MenuItem key={item.to} onClick={() => go(item.to)}>
            {item.label}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
}
