import { useState, type ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  BottomNavigation,
  BottomNavigationAction,
  Divider,
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
  Menu as MenuIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  Pets as PetsIcon,
  MenuBook as MenuBookIcon,
} from '@mui/icons-material';

const DRAWER_WIDTH = 264;

const NAV_ITEMS = [
  { label: 'Analýza', icon: <ScienceIcon />, path: '/' },
  { label: 'Profily', icon: <PetsIcon />, path: '/profily' },
  { label: 'História', icon: <HistoryIcon />, path: '/historia' },
  { label: 'Zdravotný pas', icon: <HealthAndSafetyIcon />, path: '/zdravotny-pas' },
  { label: 'Denník', icon: <MenuBookIcon />, path: '/dennik' },
  { label: 'Karta veterinára', icon: <DescriptionIcon />, path: '/karta-pre-veterinara' },
  { label: 'O aplikácii', icon: <InfoIcon />, path: '/o-aplikacii' },
];

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
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const currentNavIndex = NAV_ITEMS.findIndex((item) => isItemActive(item.path, location.pathname));

  const handleNav = (path: string) => {
    navigate(path);
    setMobileDrawerOpen(false);
  };

  const navItemSx = {
    borderRadius: 999,
    mb: 0.25,
    py: 0.75,
    pl: 2,
    pr: 1.5,
    '& .MuiListItemIcon-root': { minWidth: 40, color: 'text.secondary' },
    '&.Mui-selected': {
      backgroundColor: alpha(theme.palette.primary.main, 0.12),
      '& .MuiListItemIcon-root': { color: 'primary.main' },
      '& .MuiListItemText-primary': { color: 'primary.main', fontWeight: 600 },
      '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.18) },
    },
    '&:hover': { backgroundColor: 'action.hover' },
  } as const;

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ px: 2.5, pt: 2.5, pb: 1.5 }}>
        <Stack direction="row" alignItems="center" gap={1.25}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 1.5,
              bgcolor: alpha(theme.palette.primary.main, 0.12),
              color: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <PetsIcon sx={{ fontSize: 22 }} />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.1 }}>
              GranuleCheck
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Animal Passport
            </Typography>
          </Box>
        </Stack>
      </Box>

      <List sx={{ px: 1.5, pt: 0.5, flex: 1 }} disablePadding>
        {NAV_ITEMS.map((item) => {
          const active = isItemActive(item.path, location.pathname);
          return (
            <ListItemButton
              key={item.path}
              selected={active}
              onClick={() => handleNav(item.path)}
              sx={navItemSx}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: active ? 600 : 500 }}
              />
            </ListItemButton>
          );
        })}
      </List>

      <Divider sx={{ mx: 2 }} />
      <List sx={{ px: 1.5, py: 1 }} disablePadding>
        <ListItemButton onClick={onToggleTheme} sx={navItemSx}>
          <ListItemIcon>{darkMode ? <LightModeIcon /> : <DarkModeIcon />}</ListItemIcon>
          <ListItemText
            primary={darkMode ? 'Svetlý režim' : 'Tmavý režim'}
            primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 500 }}
          />
        </ListItemButton>
      </List>
    </Box>
  );

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        '@media print': {
          display: 'block',
          minHeight: 'auto',
        },
      }}
    >
      {/* Desktop permanent drawer */}
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
              displayPrint: 'none',
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      {/* Mobile temporary drawer */}
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
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      {/* Main content area */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {!isDesktop && (
          <AppBar
            position="sticky"
            elevation={0}
            sx={{
              backgroundColor: theme.palette.background.paper,
              color: theme.palette.text.primary,
              borderBottom: `1px solid ${theme.palette.divider}`,
              display: { print: 'none' },
            }}
          >
            <Toolbar>
              <IconButton edge="start" onClick={() => setMobileDrawerOpen(true)} sx={{ mr: 1 }}>
                <MenuIcon />
              </IconButton>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PetsIcon color="primary" sx={{ fontSize: 24 }} />
                <Typography variant="h6" noWrap sx={{ fontWeight: 700 }}>
                  GranuleCheck
                </Typography>
              </Box>
              <Box sx={{ flex: 1 }} />
              <IconButton onClick={onToggleTheme} color="inherit">
                {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>
            </Toolbar>
          </AppBar>
        )}

        <Box
          component="main"
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

        {/* Mobile bottom navigation */}
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
              value={currentNavIndex >= 0 ? currentNavIndex : 0}
              onChange={(_e, newValue: number) => handleNav(NAV_ITEMS[newValue].path)}
              sx={{
                backgroundColor: theme.palette.background.paper,
                '& .Mui-selected': {
                  color: `${theme.palette.primary.main} !important`,
                },
              }}
            >
              {NAV_ITEMS.map((item) => (
                <BottomNavigationAction key={item.path} label={item.label} icon={item.icon} />
              ))}
            </BottomNavigation>
          </Paper>
        )}
      </Box>
    </Box>
  );
}
