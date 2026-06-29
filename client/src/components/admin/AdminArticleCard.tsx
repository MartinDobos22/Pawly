import {
  Box,
  Button,
  Card,
  Chip,
  IconButton,
  Stack,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import {
  Edit as EditIcon,
  DeleteOutline as DeleteIcon,
  ArrowDropDown as ArrowDropDownIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { STATUS_COLORS, STATUS_LABELS } from '../../utils/articleWorkflow';
import type { AdminArticle, ArticleMetrics } from '../../content/poradna/types';

interface Props {
  article: AdminArticle;
  metrics?: ArticleMetrics;
  onEdit: () => void;
  onDelete: () => void;
  onStatusMenu: (anchor: HTMLElement) => void;
}

interface StatProps {
  label: string;
  value: string;
}

function Stat({ label, value }: StatProps) {
  return (
    <Box>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: 'block', lineHeight: 1.2 }}
      >
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
        {value}
      </Typography>
    </Box>
  );
}

export default function AdminArticleCard({
  article,
  metrics,
  onEdit,
  onDelete,
  onStatusMenu,
}: Props) {
  const theme = useTheme();
  const { t } = useTranslation('healthPassport');
  const speciesLabels = t('profiles.species', { returnObjects: true }) as Record<string, string>;

  return (
    <Card
      sx={{
        p: theme.spacing(2.5),
        borderRadius: 2,
        transition: 'transform 120ms ease, box-shadow 120ms ease',
        '&:hover': { transform: 'translateY(-1px)', boxShadow: theme.shadows[2] },
      }}
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={theme.spacing(2)}
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', sm: 'center' }}
      >
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{ flexWrap: 'wrap', rowGap: 0.5 }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {article.title}
            </Typography>
            <Chip
              label={STATUS_LABELS[article.status] ?? 'Koncept'}
              color={STATUS_COLORS[article.status] ?? 'default'}
              size="small"
            />
            <Chip
              label={article.category === 'krmivo' ? 'Krmivo' : 'Zdravie'}
              color={article.category === 'krmivo' ? 'success' : 'info'}
              size="small"
              variant="outlined"
            />
            {(article.species ?? []).map((s) => (
              <Chip key={s} label={speciesLabels[s] ?? s} size="small" variant="outlined" />
            ))}
          </Stack>

          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
            /{article.slug} · aktualizované {article.updated}
          </Typography>

          <Stack direction="row" spacing={3} sx={{ mt: 1.5 }}>
            <Stat label="Views 30d" value={String(metrics?.views ?? 0)} />
            <Stat label="CTA" value={String(metrics?.ctaClicks ?? 0)} />
            <Stat label="CTR" value={`${((metrics?.ctr ?? 0) * 100).toFixed(1)} %`} />
          </Stack>
        </Box>

        <Stack
          direction="row"
          spacing={0.5}
          alignItems="center"
          sx={{ flexShrink: 0, justifyContent: { xs: 'flex-end', sm: 'flex-start' } }}
        >
          <Button
            size="small"
            endIcon={<ArrowDropDownIcon />}
            onClick={(e) => onStatusMenu(e.currentTarget)}
          >
            Stav
          </Button>
          <Tooltip title="Upraviť">
            <IconButton onClick={onEdit}>
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Zmazať">
            <IconButton color="error" onClick={onDelete}>
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>
    </Card>
  );
}
