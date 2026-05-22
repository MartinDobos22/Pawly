import { Box, Typography } from '@mui/material';

interface Props {
  darkMode: boolean;
  onToggleTheme: () => void;
}

export default function LandingPage(_props: Props) {
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h1">Landing — placeholder</Typography>
      <Typography variant="body1">Bude vyplnené v Commit 37.</Typography>
    </Box>
  );
}
