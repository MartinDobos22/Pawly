import { useState, type MouseEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { IconButton, Popover, Typography } from '@mui/material';
import { HelpOutline as HelpOutlineIcon } from '@mui/icons-material';

interface HelpHintProps {
  text: string;
  size?: number;
}

export default function HelpHint({ text, size = 16 }: HelpHintProps) {
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const open = Boolean(anchorEl);

  const handleOpen = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    event.preventDefault();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (event: MouseEvent) => {
    event.stopPropagation();
    setAnchorEl(null);
  };

  return (
    <>
      <IconButton
        size="small"
        aria-label={t('help.label')}
        onClick={handleOpen}
        sx={{
          p: 0.25,
          color: 'text.secondary',
          verticalAlign: 'middle',
          '@media print': { display: 'none' },
        }}
      >
        <HelpOutlineIcon sx={{ fontSize: size }} />
      </IconButton>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        slotProps={{ paper: { sx: { maxWidth: 280, p: 1.5, borderRadius: 2 } } }}
      >
        <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
          {text}
        </Typography>
      </Popover>
    </>
  );
}
