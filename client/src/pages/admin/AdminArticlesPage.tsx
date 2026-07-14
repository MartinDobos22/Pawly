import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Menu,
  MenuItem,
  Snackbar,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  useTheme,
} from '@mui/material';
import {
  Add as AddIcon,
  CloudUpload as PublishIcon,
  Article as ArticleIcon,
} from '@mui/icons-material';
import ConfirmDialog from '../../components/ConfirmDialog';
import PageContainer from '../../components/ui/PageContainer';
import PageHeader from '../../components/ui/PageHeader';
import AdminArticleCard from '../../components/admin/AdminArticleCard';
import ArticleMetricsSummaryCard from '../../components/admin/ArticleMetricsSummaryCard';
import {
  changeArticleStatus,
  deleteAdminArticle,
  getArticlesMetrics,
  listAdminArticles,
  publishArticles,
} from '../../services/adminApi';
import {
  ARTICLE_STATUS_TRANSITIONS,
  STATUS_LABELS,
  transitionActionLabel,
} from '../../utils/articleWorkflow';
import { METRICS_PERIOD_OPTIONS, metricsPeriodShort } from '../../utils/articleMetricsPeriod';
import type {
  AdminArticle,
  ArticleMetrics,
  ArticleMetricsPeriod,
  ArticleMetricsSummary,
  ArticleStatus,
} from '../../content/poradna/types';

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
  const [statusMenu, setStatusMenu] = useState<{
    anchor: HTMLElement;
    article: AdminArticle;
  } | null>(null);
  const [metrics, setMetrics] = useState<Record<string, ArticleMetrics>>({});
  const [summary, setSummary] = useState<ArticleMetricsSummary | null>(null);
  const [period, setPeriod] = useState<ArticleMetricsPeriod>('30d');

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

  useEffect(() => {
    getArticlesMetrics(period)
      .then(({ metrics: rows, summary: s }) => {
        setMetrics(Object.fromEntries(rows.map((m) => [m.slug, m])));
        setSummary(s);
      })
      .catch(() => {
        setMetrics({});
        setSummary(null);
      });
  }, [period]);

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
    <PageContainer>
      <PageHeader
        icon={<ArticleIcon />}
        title="Správa článkov"
        action={
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            <Button
              variant="outlined"
              startIcon={<PublishIcon />}
              onClick={() => setPublishOpen(true)}
            >
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
        }
      />

      <Alert severity="info" variant="outlined" sx={{ mb: theme.spacing(2) }}>
        Zmeny sa uložia do databázy a sú hneď cez API. Na verejnom webe sa prejavia až po novom
        builde (prerender) — spusti rebuild (Netlify).
      </Alert>

      {error && (
        <Alert severity="error" sx={{ mb: theme.spacing(2) }}>
          {error}
        </Alert>
      )}

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1}
        alignItems={{ xs: 'stretch', sm: 'center' }}
        justifyContent="space-between"
        sx={{ mb: theme.spacing(1.5) }}
      >
        <Typography variant="subtitle2" color="text.secondary">
          Štatistiky za obdobie
        </Typography>
        <ToggleButtonGroup
          value={period}
          exclusive
          size="small"
          onChange={(_, v) => v && setPeriod(v as ArticleMetricsPeriod)}
          sx={{ flexWrap: 'wrap' }}
        >
          {METRICS_PERIOD_OPTIONS.map((p) => (
            <ToggleButton key={p.value} value={p.value} sx={{ borderRadius: 2 }}>
              {p.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Stack>

      {summary && (
        <Box sx={{ mb: theme.spacing(2.5) }}>
          <ArticleMetricsSummaryCard
            summary={summary}
            period={period}
            totalArticles={articles.length}
          />
        </Box>
      )}

      <ToggleButtonGroup
        value={filter}
        exclusive
        size="small"
        onChange={(_, v) => v && setFilter(v as Filter)}
        sx={{ mb: theme.spacing(2.5), flexWrap: 'wrap' }}
      >
        {FILTERS.map((f) => {
          const count =
            f.value === 'all'
              ? articles.length
              : articles.filter((a) => a.status === f.value).length;
          return (
            <ToggleButton key={f.value} value={f.value} sx={{ borderRadius: 2 }}>
              {f.label} ({count})
            </ToggleButton>
          );
        })}
      </ToggleButtonGroup>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : visible.length === 0 ? (
        <Typography color="text.secondary" sx={{ py: 6, textAlign: 'center' }}>
          Žiadne články v tomto filtri.
        </Typography>
      ) : (
        <Stack spacing={theme.spacing(1.5)}>
          {visible.map((a) => (
            <AdminArticleCard
              key={a.slug}
              article={a}
              metrics={metrics[a.slug]}
              periodShort={metricsPeriodShort(period)}
              onEdit={() => navigate(`/admin/clanky/${a.slug}`)}
              onDelete={() => setToDelete(a)}
              onStatusMenu={(anchor) => setStatusMenu({ anchor, article: a })}
            />
          ))}
        </Stack>
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
    </PageContainer>
  );
}
