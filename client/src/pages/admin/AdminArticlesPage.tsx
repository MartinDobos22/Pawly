import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Menu,
  MenuItem,
  Snackbar,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  DeleteOutline as DeleteIcon,
  CloudUpload as PublishIcon,
  ArrowDropDown as ArrowDropDownIcon,
} from '@mui/icons-material';
import ConfirmDialog from '../../components/ConfirmDialog';
import {
  changeArticleStatus,
  deleteAdminArticle,
  listAdminArticles,
  publishArticles,
} from '../../services/adminApi';
import {
  ARTICLE_STATUS_TRANSITIONS,
  STATUS_COLORS,
  STATUS_LABELS,
  transitionActionLabel,
} from '../../utils/articleWorkflow';
import type { AdminArticle, ArticleStatus } from '../../content/poradna/types';

type Filter = 'all' | ArticleStatus;

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'Všetky' },
  { value: 'draft', label: 'Koncepty' },
  { value: 'in_review', label: 'Na kontrolu' },
  { value: 'approved', label: 'Schválené' },
  { value: 'scheduled', label: 'Naplánované' },
  { value: 'published', label: 'Publikované' },
  { value: 'archived', label: 'Archivované' },
];

export default function AdminArticlesPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [articles, setArticles] = useState<AdminArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<AdminArticle | null>(null);
  const [publishOpen, setPublishOpen] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>('all');
  const [statusMenu, setStatusMenu] = useState<{ anchor: HTMLElement; article: AdminArticle } | null>(
    null
  );

  const load = () => {
    setLoading(true);
    listAdminArticles()
      .then((a) => {
        setArticles(a);
        setError(null);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const visible = useMemo(
    () => (filter === 'all' ? articles : articles.filter((a) => a.status === filter)),
    [articles, filter]
  );

  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      await deleteAdminArticle(toDelete.slug);
      setToDelete(null);
      load();
    } catch (e) {
      setError((e as Error).message);
      setToDelete(null);
    }
  };

  const confirmPublish = async () => {
    setPublishing(true);
    try {
      await publishArticles();
      setPublishOpen(false);
      setNotice('Build spustený — zmeny budú na webe o pár minút.');
    } catch (e) {
      setPublishOpen(false);
      setError((e as Error).message);
    } finally {
      setPublishing(false);
    }
  };

  const applyStatus = async (article: AdminArticle, target: ArticleStatus) => {
    setStatusMenu(null);
    // Naplánovanie potrebuje dátum — rieši sa v editore.
    if (target === 'scheduled') {
      navigate(`/admin/clanky/${article.slug}`);
      return;
    }
    try {
      await changeArticleStatus(article.slug, target);
      setNotice(`„${article.title}" → ${STATUS_LABELS[target]}.`);
      load();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  return (
    <Box sx={{ maxWidth: theme.spacing(100), mx: 'auto', p: theme.spacing(2) }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: theme.spacing(2) }}>
        <Typography variant="h5" component="h1" sx={{ flexGrow: 1 }}>
          Správa článkov
        </Typography>
        <Button variant="outlined" startIcon={<PublishIcon />} onClick={() => setPublishOpen(true)}>
          Publikovať na web
        </Button>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/admin/clanky/novy')}
        >
          Nový článok
        </Button>
      </Stack>

      <Alert severity="info" sx={{ mb: theme.spacing(2) }}>
        Zmeny sa uložia do databázy a sú hneď cez API. Na verejnom webe sa prejavia až po novom
        builde (prerender) — spusti rebuild (Netlify).
      </Alert>

      {error && (
        <Alert severity="error" sx={{ mb: theme.spacing(2) }}>
          {error}
        </Alert>
      )}

      <ToggleButtonGroup
        value={filter}
        exclusive
        size="small"
        onChange={(_, v) => v && setFilter(v as Filter)}
        sx={{ mb: theme.spacing(2), flexWrap: 'wrap' }}
      >
        {FILTERS.map((f) => (
          <ToggleButton key={f.value} value={f.value}>
            {f.label}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : (
        <List>
          {visible.map((a) => (
            <ListItem
              key={a.slug}
              divider
              secondaryAction={
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <Button
                    size="small"
                    endIcon={<ArrowDropDownIcon />}
                    onClick={(e) => setStatusMenu({ anchor: e.currentTarget, article: a })}
                  >
                    Stav
                  </Button>
                  <Tooltip title="Upraviť">
                    <IconButton onClick={() => navigate(`/admin/clanky/${a.slug}`)}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Zmazať">
                    <IconButton color="error" onClick={() => setToDelete(a)}>
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </Stack>
              }
            >
              <ListItemText
                primary={
                  <Stack direction="row" spacing={1} alignItems="center">
                    <span>{a.title}</span>
                    <Chip
                      label={STATUS_LABELS[a.status] ?? 'Koncept'}
                      color={STATUS_COLORS[a.status] ?? 'default'}
                      size="small"
                    />
                    <Chip
                      label={a.category === 'krmivo' ? 'Krmivo' : 'Zdravie'}
                      color={a.category === 'krmivo' ? 'success' : 'info'}
                      size="small"
                      variant="outlined"
                    />
                  </Stack>
                }
                secondary={`/${a.slug} · aktualizované ${a.updated}`}
              />
            </ListItem>
          ))}
          {visible.length === 0 && (
            <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
              Žiadne články v tomto filtri.
            </Typography>
          )}
        </List>
      )}

      <Menu
        anchorEl={statusMenu?.anchor ?? null}
        open={Boolean(statusMenu)}
        onClose={() => setStatusMenu(null)}
      >
        {statusMenu &&
          ARTICLE_STATUS_TRANSITIONS[statusMenu.article.status].map((target) => (
            <MenuItem key={target} onClick={() => applyStatus(statusMenu.article, target)}>
              {transitionActionLabel(statusMenu.article.status, target)}
            </MenuItem>
          ))}
        {statusMenu && ARTICLE_STATUS_TRANSITIONS[statusMenu.article.status].length === 0 && (
          <MenuItem disabled>Žiadne akcie</MenuItem>
        )}
      </Menu>

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Zmazať článok?"
        message={`Naozaj zmazať „${toDelete?.title}"? Túto akciu nemožno vrátiť.`}
        confirmLabel="Zmazať"
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />

      <ConfirmDialog
        open={publishOpen}
        title="Publikovať na web?"
        message="Spustí sa nový build webu. Aktuálny stav článkov z databázy sa premietne na verejné stránky o pár minút."
        confirmLabel="Publikovať"
        loading={publishing}
        onConfirm={confirmPublish}
        onCancel={() => setPublishOpen(false)}
      />

      <Snackbar
        open={Boolean(notice)}
        autoHideDuration={6000}
        onClose={() => setNotice(null)}
        message={notice ?? ''}
      />
    </Box>
  );
}
