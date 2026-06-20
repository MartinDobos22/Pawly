import { useNavigate } from 'react-router-dom';
import { Box, Button, Typography, useTheme } from '@mui/material';
import { ArrowForward as ArrowIcon } from '@mui/icons-material';

interface Props {
  heading: string;
  buttonLabel: string;
  to: string;
}

export default function LandingCta({ heading, buttonLabel, to }: Props) {
  const theme = useTheme();
  const navigate = useNavigate();
  return (
    <Box
      sx={{
        my: theme.spacing(4),
        p: theme.spacing(3),
        borderRadius: 3,
        bgcolor: 'primary.main',
        color: 'primary.contrastText',
        textAlign: 'center',
      }}
    >
      <Typography variant="h6" sx={{ mb: theme.spacing(2) }}>
        {heading}
      </Typography>
      <Button
        variant="contained"
        color="secondary"
        size="large"
        endIcon={<ArrowIcon />}
        onClick={() => navigate(to)}
      >
        {buttonLabel}
      </Button>
    </Box>
  );
}
