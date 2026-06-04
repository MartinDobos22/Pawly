import { useState, type ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  AppBar,
  Box,
  BottomNavigation,
  BottomNavigationAction,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Stack,
  Toolbar,
  Typography,
  alpha,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Science as ScienceIcon,
  History as HistoryIcon,
  HealthAndSafety as HealthAndSafetyIcon,
  Description as DescriptionIcon,
  Info as InfoIcon,
  HelpOutline as HelpOutlineIcon,
  Lock as LockIcon,
  Menu as MenuIcon,
  MoreHoriz as MoreHorizIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  Pets as PetsIcon,
  MenuBook as MenuBookIcon,
  NotificationsActive as NotificationsActiveIcon,
  Logout as LogoutIcon,
  DeleteForever as DeleteForeverIcon,
  MailOutline as MailOutlineIcon,
  CloudDownload as CloudDownloadIcon,
} from '@mui/icons-material';
import PetSwitcher from './PetSwitcher';
import LanguageSwitcher from './LanguageSwitcher';
import PawlyLogo from './PawlyLogo';
import { useAuth } from '../hooks/useAuth';
import { deleteAccount, exportUserData } from '../services/accountApi';

const DRAWER_WIDTH = 272;

type NavItem = { label: string; icon: ReactNode; path: string };
type NavSection = { id: string; label: string; items: NavItem[] };

interface LayoutProps {
  children: ReactNode;
  darkMode: boolean;
  onToggleTheme: () => void;
}

const isItemActive = (itemPath: string, currentPath: string) =>
  itemPath === '/zdravotny-pas'
    ? currentPath.startsWith('/zdravotny-pas')
    : currentPath === itemPath;

export default function Layout({ children, darkMode, onToggleTheme }: LayoutProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const NAV_SECTIONS: NavSection[] = [
    {
      id: 'health',
      label: t('nav.sectionMain'),
      items: [
        { label: t('nav.healthPassport'), icon: <HealthAndSafetyIcon />, path: '/zdravotny-pas' },
        { label: t('nav.vetCard'), icon: <DescriptionIcon />, path: '/karta-pre-veterinara' },
        { label: t('nav.diary'), icon: <MenuBookIcon />, path: '/dennik' },
      ],
    },
    {
      id: 'tools',
      label: t('nav.sectionOther'),
      items: [
        { label: t('nav.analyze'), icon: <ScienceIcon />, path: '/analyza' },
        { label: t('nav.history'), icon: <HistoryIcon />, path: '/historia' },
      ],
    },
    {
      id: 'settings',
      label: t('nav.sectionSettings'),
      items: [
        { label: t('nav.profiles'), icon: <PetsIcon />, path: '/profily' },
        { label: t('nav.notifications'), icon: <NotificationsActiveIcon />, path: '/notifikacie' },
        { label: t('nav.faq'), icon: <HelpOutlineIcon />, path: '/caste-otazky' },
        { label: t('nav.about'), icon: <InfoIcon />, path: '/o-aplikacii' },
        { label: t('nav.privacy'), icon: <LockIcon />, path: '/ochrana-sukromia' },
      ],
    },
  ];

  const FLAT_NAV: NavItem[] = NAV_SECTIONS.flatMap((s) => s.items);
  const MOBILE_NAV: NavItem[] = FLAT_NAV.slice(0, 4);

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const handleExportData = async () => {
    try {
      const blob = await exportUserData();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pawly-export-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      window.alert(t('auth.exportDataFailed'));
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(t('auth.confirmDeleteMessage'));
    if (!confirmed) return;
    try {
      await deleteAccount();
      await logout();
      navigate('/login', { replace: true });
    } catch {
      window.alert(t('auth.deleteAccountFailed'));
    }
  };

  const currentMobileIndex = MOBILE_NAV.findIndex((item) =>
    isItemActive(item.path, location.pathname)
  );

  const handleNav = (path: string) => {
    navigate(path);
    setMobileDrawerOpen(false);
  };

  const accentBar = (active: boolean) => ({
    content: '""',
    position: 'absolute' as const,
    left: 6,
    top: 8,
    bottom: 8,
    width: 3,
    borderRadius: 2,
    bgcolor: active ? 'primary.main' : 'transparent',
    transition: 'background-color 120ms ease',
  });

  const isDark = theme.palette.mode === 'dark';
  const activeAlpha = isDark ? 0.18 : 0.08;
  const activeHoverAlpha = isDark ? 0.24 : 0.12;
  const activeTextColor = isDark ? 'primary.light' : 'text.primary';

  const navItemSx = (active: boolean) =>
    ({
      position: 'relative',
      borderRadius: 2,
      mb: 0.25,
      py: 0.9,
      pl: 2.5,
      pr: 1.5,
      color: active ? activeTextColor : 'text.secondary',
      '& .MuiListItemIcon-root': {
        minWidth: 36,
        color: active ? (isDark ? 'primary.light' : 'primary.main') : 'text.secondary',
      },
      '&::before': accentBar(active),
      '&.Mui-selected': {
        backgroundColor: alpha(theme.palette.primary.main, activeAlpha),
        '&:hover': { backgroundColor: alpha(theme.palette.primary.main, activeHoverAlpha) },
      },
      '&:hover': { backgroundColor: 'action.hover' },
    }) as const;

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ px: 2, pt: 2.5, pb: 1.25 }}>
        <Stack
          direction="row"
          alignItems="center"
          gap={1.25}
          role="button"
          tabIndex={0}
          aria-label={t('nav.home')}
          onClick={() => handleNav('/')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleNav('/');
            }
          }}
          sx={{
            pl: 0.5,
            pb: 1.5,
            cursor: 'pointer',
            borderRadius: 2,
            transition: 'opacity 120ms ease',
            '&:hover': { opacity: 0.85 },
            '&:focus-visible': {
              outline: `2px solid ${theme.palette.primary.main}`,
              outlineOffset: 2,
            },
          }}
        >
          <PawlyLogo size="md" glow />
        </Stack>
        <PetSwitcher />
      </Box>

      <Box
        sx={{
          px: 1.25,
          pt: 1,
          flex: 1,
          overflowY: 'auto',
          scrollbarWidth: 'thin',
          scrollbarColor: `${theme.palette.divider} transparent`,
          '&::-webkit-scrollbar': { width: 4 },
          '&::-webkit-scrollbar-track': { background: 'transparent' },
          '&::-webkit-scrollbar-thumb': {
            background: theme.palette.divider,
            borderRadius: 2,
          },
        }}
      >
        {NAV_SECTIONS.map((section) => (
          <Box key={section.id} sx={{ mb: 1.5 }}>
            <Typography
              variant="caption"
              sx={{
                display: 'block',
                px: 2,
                pb: 0.5,
                color: 'text.secondary',
                fontSize: '0.68rem',
              }}
            >
              {section.label}
            </Typography>
            <List disablePadding>
              {section.items.map((item) => {
                const active = isItemActive(item.path, location.pathname);
                return (
                  <ListItemButton
                    key={item.path}
                    selected={active}
                    onClick={() => handleNav(item.path)}
                    sx={navItemSx(active)}
                  >
                    <ListItemIcon>{item.icon}</ListItemIcon>
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{
                        fontSize: '0.9rem',
                        fontWeight: active ? 600 : 500,
                      }}
                    />
                  </ListItemButton>
                );
              })}
            </List>
          </Box>
        ))}
      </Box>

      <Box sx={{ px: 1.25, pb: 1.5, pt: 1, borderTop: `1px solid ${theme.palette.divider}` }}>
        <ListItemButton
          onClick={onToggleTheme}
          sx={navItemSx(false)}
          aria-label={darkMode ? t('theme.toggleLight') : t('theme.toggleDark')}
        >
          <ListItemIcon>{darkMode ? <LightModeIcon /> : <DarkModeIcon />}</ListItemIcon>
          <ListItemText
            primary={darkMode ? t('theme.light') : t('theme.dark')}
            primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 500 }}
          />
        </ListItemButton>
        <LanguageSwitcher sx={navItemSx(false)} />
        <ListItemButton
          component="a"
          href={`mailto:${t('supportEmail')}`}
          sx={navItemSx(false)}
          aria-label={t('nav.support')}
        >
          <ListItemIcon>
            <MailOutlineIcon />
          </ListItemIcon>
          <ListItemText
            primary={t('nav.support')}
            secondary={t('supportEmail')}
            primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 500 }}
            secondaryTypographyProps={{ fontSize: '0.72rem', noWrap: true }}
          />
        </ListItemButton>
        <ListItemButton
          onClick={handleExportData}
          sx={navItemSx(false)}
          aria-label={t('auth.exportData')}
        >
          <ListItemIcon>
            <CloudDownloadIcon />
          </ListItemIcon>
          <ListItemText
            primary={t('auth.exportData')}
            primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 500 }}
          />
        </ListItemButton>
        <ListItemButton onClick={handleLogout} sx={navItemSx(false)} aria-label={t('auth.logout')}>
          <ListItemIcon>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText
            primary={t('auth.logout')}
            secondary={user?.email ?? undefined}
            primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 500 }}
            secondaryTypographyProps={{ fontSize: '0.72rem', noWrap: true }}
          />
        </ListItemButton>
        <ListItemButton
          onClick={handleDeleteAccount}
          sx={{
            ...navItemSx(false),
            color: 'error.main',
            '& .MuiListItemIcon-root': { color: 'error.main' },
          }}
          aria-label={t('auth.deleteAccount')}
        >
          <ListItemIcon>
            <DeleteForeverIcon />
          </ListItemIcon>
          <ListItemText
            primary={t('auth.deleteAccount')}
            primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 500 }}
          />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        bgcolor: 'background.default',
        '@media print': {
          display: 'block',
          minHeight: 'auto',
        },
      }}
    >
      <Box
        component="a"
        href="#main-content"
        sx={{
          position: 'absolute',
          left: 8,
          top: -40,
          zIndex: theme.zIndex.modal,
          px: 2,
          py: 1,
          borderRadius: 2,
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          textDecoration: 'none',
          fontSize: '0.85rem',
          fontWeight: 600,
          transition: 'top 120ms ease',
          '&:focus': { top: 8 },
        }}
      >
        {t('skipToContent')}
      </Box>
      {isDesktop && (
        <Drawer
          variant="permanent"
          sx={{
            width: DRAWER_WIDTH,
            flexShrink: 0,
            display: { print: 'none' },
            '@media print': {
              display: 'none !important',
            },
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
              borderRight: `1px solid ${theme.palette.divider}`,
              bgcolor: 'background.default',
              displayPrint: 'none',
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      {!isDesktop && (
        <Drawer
          variant="temporary"
          open={mobileDrawerOpen}
          onClose={() => setMobileDrawerOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
              bgcolor: 'background.default',
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {!isDesktop && (
          <AppBar
            position="sticky"
            elevation={0}
            sx={{
              backgroundColor: 'background.paper',
              color: 'text.primary',
              borderBottom: `1px solid ${theme.palette.divider}`,
              display: { print: 'none' },
            }}
          >
            <Toolbar sx={{ gap: 1 }}>
              <IconButton
                edge="start"
                onClick={() => setMobileDrawerOpen(true)}
                aria-label={t('openMenu')}
              >
                <MenuIcon />
              </IconButton>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <PetSwitcher variant="compact" />
              </Box>
              <IconButton
                onClick={onToggleTheme}
                color="inherit"
                aria-label={darkMode ? t('theme.toggleLight') : t('theme.toggleDark')}
              >
                {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>
            </Toolbar>
          </AppBar>
        )}

        <Box
          component="main"
          id="main-content"
          sx={{
            flex: 1,
            p: { xs: 2, md: 3 },
            pb: { xs: 10, md: 3 },
            width: '100%',
            '@media print': {
              p: 0,
              pb: 0,
              minWidth: '100%',
            },
          }}
        >
          {children}
        </Box>

        {!isDesktop && (
          <Paper
            elevation={8}
            sx={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: theme.zIndex.appBar,
              borderTop: `1px solid ${theme.palette.divider}`,
              display: { print: 'none' },
            }}
          >
            <BottomNavigation
              showLabels
              value={currentMobileIndex >= 0 ? currentMobileIndex : false}
              onChange={(_e, newValue: number) => {
                if (newValue === MOBILE_NAV.length) {
                  setMobileDrawerOpen(true);
                } else {
                  handleNav(MOBILE_NAV[newValue].path);
                }
              }}
              sx={{
                backgroundColor: 'background.paper',
                '& .Mui-selected': {
                  color: `${theme.palette.primary.main} !important`,
                },
                '& .MuiBottomNavigationAction-label': { fontSize: '0.68rem' },
              }}
            >
              {MOBILE_NAV.map((item) => (
                <BottomNavigationAction key={item.path} label={item.label} icon={item.icon} />
              ))}
              <BottomNavigationAction label={t('nav.more')} icon={<MoreHorizIcon />} />
            </BottomNavigation>
          </Paper>
        )}
      </Box>
    </Box>
  );
}
