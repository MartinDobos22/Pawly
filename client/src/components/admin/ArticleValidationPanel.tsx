import type { ReactNode } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Link,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
} from '@mui/material';
import {
  CheckCircleOutline as OkIcon,
  WarningAmberOutlined as WarningIcon,
  ErrorOutline as ErrorIcon,
  InfoOutlined as InfoIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import type { ArticleValidation, ValidationResult } from '../../content/poradna/types';

interface Props {
  validation: ArticleValidation | null;
  loading: boolean;
  onRefresh: () => void;
  onFocusField: (field: string) => void;
}

function Row({
  result,
  icon,
  color,
  onFocusField,
}: {
  result: ValidationResult;
  icon: ReactNode;
  color: string;
  onFocusField: (field: string) => void;
}) {
  return (
    <ListItem divider alignItems="flex-start">
      <ListItemIcon sx={{ minWidth: (t) => t.spacing(5), color, mt: 0.5 }}>{icon}</ListItemIcon>
      <ListItemText
        primary={
          result.field ? (
            <Link
              component="button"
              type="button"
              underline="hover"
              onClick={() => result.field && onFocusField(result.field)}
              sx={{ textAlign: 'left' }}
            >
              {result.message}
            </Link>
          ) : (
            result.message
          )
        }
      />
    </ListItem>
  );
}

export default function ArticleValidationPanel({
  validation,
  loading,
  onRefresh,
  onFocusField,
}: Props) {
  const theme = useTheme();

  if (loading && !validation) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!validation) {
    return (
      <Box sx={{ maxWidth: 720, mx: 'auto' }}>
        <Button startIcon={<RefreshIcon />} onClick={onRefresh}>
          Načítať kontrolu
        </Button>
      </Box>
    );
  }

  const { canPublish, errors, warnings, suggestions } = validation;
  const summary = canPublish
    ? { severity: 'success' as const, text: 'Pripravené na publikovanie.' }
    : { severity: 'error' as const, text: `Nemožno publikovať — ${errors.length} chýb na opravu.` };

  return (
    <Box sx={{ maxWidth: 720, mx: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: theme.spacing(2) }}>
        <Alert severity={summary.severity} sx={{ flexGrow: 1 }}>
          {summary.text}
        </Alert>
        <Button startIcon={<RefreshIcon />} onClick={onRefresh} disabled={loading} sx={{ ml: 1 }}>
          Obnoviť
        </Button>
      </Box>

      <List disablePadding>
        {errors.map((r) => (
          <Row
            key={r.key + (r.message ?? '')}
            result={r}
            icon={<ErrorIcon />}
            color="error.main"
            onFocusField={onFocusField}
          />
        ))}
        {warnings.map((r) => (
          <Row
            key={r.key + (r.message ?? '')}
            result={r}
            icon={<WarningIcon />}
            color="warning.main"
            onFocusField={onFocusField}
          />
        ))}
        {suggestions.map((r) => (
          <Row
            key={r.key + (r.message ?? '')}
            result={r}
            icon={<InfoIcon />}
            color="text.secondary"
            onFocusField={onFocusField}
          />
        ))}
        {errors.length === 0 && warnings.length === 0 && suggestions.length === 0 && (
          <ListItem>
            <ListItemIcon sx={{ minWidth: theme.spacing(5), color: 'success.main' }}>
              <OkIcon />
            </ListItemIcon>
            <ListItemText primary="Všetko v poriadku." />
          </ListItem>
        )}
      </List>
    </Box>
  );
}
