import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { IconButton, InputAdornment, TextField } from '@mui/material';
import type { TextFieldProps } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

type PasswordFieldProps = Omit<TextFieldProps, 'type'>;

export default function PasswordField({ InputProps, ...props }: PasswordFieldProps) {
  const { t } = useTranslation('auth');
  const [visible, setVisible] = useState(false);

  return (
    <TextField
      {...props}
      type={visible ? 'text' : 'password'}
      InputProps={{
        ...InputProps,
        endAdornment: (
          <InputAdornment position="end">
            <IconButton
              aria-label={t(visible ? 'passwordField.hide' : 'passwordField.show')}
              onClick={() => setVisible((prev) => !prev)}
              onMouseDown={(event) => event.preventDefault()}
              edge="end"
              tabIndex={-1}
            >
              {visible ? <VisibilityOff /> : <Visibility />}
            </IconButton>
          </InputAdornment>
        ),
      }}
    />
  );
}
