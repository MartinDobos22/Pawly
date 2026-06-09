import { useLayoutEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { IconButton, InputAdornment, TextField } from '@mui/material';
import type { TextFieldProps } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

type PasswordFieldProps = Omit<TextFieldProps, 'type'>;

export default function PasswordField({ InputProps, inputRef, ...props }: PasswordFieldProps) {
  const { t } = useTranslation('auth');
  const [visible, setVisible] = useState(false);
  const innerRef = useRef<HTMLInputElement | null>(null);
  const caretRef = useRef<{ start: number | null; end: number | null } | null>(null);

  const toggleVisible = () => {
    const input = innerRef.current;
    if (input) {
      caretRef.current = { start: input.selectionStart, end: input.selectionEnd };
    }
    setVisible((prev) => !prev);
  };

  // Prepnutie type (password ↔ text) resetuje kurzor na začiatok — obnovíme pôvodnú pozíciu.
  useLayoutEffect(() => {
    const input = innerRef.current;
    const caret = caretRef.current;
    if (input && caret && caret.start !== null) {
      input.focus();
      input.setSelectionRange(caret.start, caret.end);
    }
  }, [visible]);

  const setRef = (element: HTMLInputElement | null) => {
    innerRef.current = element;
    if (typeof inputRef === 'function') inputRef(element);
    else if (inputRef) (inputRef as React.MutableRefObject<HTMLInputElement | null>).current = element;
  };

  return (
    <TextField
      {...props}
      type={visible ? 'text' : 'password'}
      inputRef={setRef}
      InputProps={{
        ...InputProps,
        endAdornment: (
          <InputAdornment position="end">
            <IconButton
              aria-label={t(visible ? 'passwordField.hide' : 'passwordField.show')}
              onClick={toggleVisible}
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
