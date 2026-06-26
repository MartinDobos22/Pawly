import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  IconButton,
  MenuItem,
  Snackbar,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import {
  Add as AddIcon,
  ArrowBack as BackIcon,
  DeleteOutline as DeleteIcon,
  HistoryOutlined as HistoryIcon,
  Save as SaveIcon,
  UploadFile as UploadIcon,
} from '@mui/icons-material';
import ArticleRichEditor from '../../components/admin/articleEditor/ArticleRichEditor';
import ArticleVersionsDrawer from '../../components/admin/ArticleVersionsDrawer';
import ArticleSeoPanel from '../../components/admin/ArticleSeoPanel';
import { analyzeSeo } from '../../utils/articleSeo';
import ArticleBody from '../../components/public/ArticleBody';
import Callout from '../../components/public/Callout';
import {
  autosaveArticle,
  changeArticleStatus,
  createAdminArticle,
  getAdminArticle,
  listArticleVersions,
  updateAdminArticle,
  uploadArticleImage,
} from '../../services/adminApi';
import { downscaleImage } from '../../utils/imageDownscale';
import {
  ARTICLE_STATUS_TRANSITIONS,
  STATUS_COLORS,
  STATUS_LABELS,
  transitionActionLabel,
} from '../../utils/articleWorkflow';
import { ARTICLE_DISCLAIMER } from '../../content/poradna/articles';
import type { AdminArticle, ArticleStatus } from '../../content/poradna/types';

function emptyArticle(): AdminArticle {
  return {
    slug: '',
    category: 'krmivo',
    title: '',
    description: '',
    intro: '',
    sections: [],
    faqs: [],
    relatedSlugs: [],
    updated: new Date().toISOString().slice(0, 10),
    coverImage: '',
    ctaIntent: 'food',
    author: '',
    sources: [],
    published: false,
    position: 0,
    status: 'draft',
    assignedTo: '',
    internalNotes: '',
    scheduledFor: '',
  };
}

const PUBLISH_CHECKLIST = [
  'Obsah skontroloval človek (nie len AI).',
  'Pri zdravotných tvrdeniach sú uvedené zdroje.',
  'Titulok, meta popis a úvod sú vyplnené.',
  'Odkazy a obrázky fungujú.',
];

function toLocalInput(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromLocalInput(local: string): string {
  if (!local) return '';
  const d = new Date(local);
  return Number.isNaN(d.getTime()) ? '' : d.toISOString();
}

export default function AdminArticleEditPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const isNew = !slug;

  const [form, setForm] = useState<AdminArticle>(emptyArticle());
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [versionsOpen, setVersionsOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [checklistOpen, setChecklistOpen] = useState(false);
  const [checklistChecked, setChecklistChecked] = useState<boolean[]>([]);
  const [autosavedAt, setAutosavedAt] = useState<string | null>(null);
  const [latestVersion, setLatestVersion] = useState<number | null>(null);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [scheduleAt, setScheduleAt] = useState('');

  // Posledný uložený/načítaný stav (JSON) — autosave beží len pri reálnej zmene.
  const savedSnapshotRef = useRef<string>('');

  useEffect(() => {
    if (isNew) return;
    setLoading(true);
    getAdminArticle(slug)
      .then((a) => {
        setForm(a);
        savedSnapshotRef.current = JSON.stringify(a);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
    listArticleVersions(slug)
      .then((v) => setLatestVersion(v[0]?.versionNumber ?? 0))
      .catch(() => setLatestVersion(null));
  }, [slug, isNew]);

  // Autosave konceptu: po 8 s nečinnosti uloží snapshot verzie, ak nastala
  // zmena. Nemení živý článok — len zachová rozpracovanú prácu vo verziách.
  useEffect(() => {
    if (isNew || !slug || loading) return;
    const current = JSON.stringify(form);
    if (current === savedSnapshotRef.current) return;
    const timer = setTimeout(() => {
      autosaveArticle(slug, form)
        .then(({ savedAt }) => {
          savedSnapshotRef.current = current;
          setAutosavedAt(savedAt);
        })
        .catch(() => {
          /* autosave je best-effort; chyby nerušia editáciu */
        });
    }, 8000);
    return () => clearTimeout(timer);
  }, [form, slug, isNew, loading]);

  const set = <K extends keyof AdminArticle>(key: K, val: AdminArticle[K]) =>
    setForm((f) => ({ ...f, [key]: val }));

  const faqs = form.faqs ?? [];
  const sources = form.sources ?? [];
  const seoErrors = analyzeSeo(form).filter((c) => c.status === 'error');

  const handleCoverUpload = async (file: File) => {
    setError(null);
    setUploading(true);
    try {
      const { dataUrl, mimeType } = await downscaleImage(file, {
        maxWidth: 1200,
        mimeType: 'image/jpeg',
        quality: 0.85,
      });
      const base64Data = dataUrl.split(',')[1] ?? '';
      const { url } = await uploadArticleImage({ mimeType, base64Data });
      set('coverImage', url);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setUploading(false);
    }
  };

  const cleanedPayload = (): AdminArticle => ({
    ...form,
    faqs: faqs.filter((f) => f.q.trim() || f.a.trim()),
    sources: sources.filter((s) => s.label.trim() || s.url.trim()),
    sections: form.sections.map((s) => ({
      ...s,
      blocks: s.blocks.map((b) =>
        b.type === 'bullets' ? { ...b, items: b.items.filter((i) => i.trim().length > 0) } : b
      ),
    })),
  });

  // Uloženie obsahu/metadát — NEMENÍ stav (ten ide len cez prechody nižšie).
  const saveContent = async () => {
    setSaving(true);
    setError(null);
    try {
      const payload = cleanedPayload();
      if (isNew) {
        const created = await createAdminArticle(payload);
        navigate(`/admin/clanky/${created.slug}`);
        return;
      }
      const updated = await updateAdminArticle(slug, payload);
      setForm(updated);
      savedSnapshotRef.current = JSON.stringify(updated);
      setNotice('Uložené.');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  // Zmena stavu cez workflow. Najprv uloží obsah (aby server validoval aktuálne
  // dáta, napr. pri publikovaní), potom zmení stav cez validovaný prechod.
  const runStatus = async (target: ArticleStatus, opts?: { scheduledFor?: string }) => {
    if (isNew || !slug) {
      setError('Najprv ulož článok.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await updateAdminArticle(slug, cleanedPayload());
      const updated = await changeArticleStatus(slug, target, opts);
      setForm(updated);
      savedSnapshotRef.current = JSON.stringify(updated);
      setLatestVersion((v) => (v == null ? v : v + 1));
      setNotice(`Stav: ${STATUS_LABELS[target]}.`);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  // Akcia podľa cieľového stavu: publish cez checklist, schedule cez dialóg.
  const handleTransition = (target: ArticleStatus) => {
    if (target === 'published') {
      setChecklistChecked(PUBLISH_CHECKLIST.map(() => false));
      setChecklistOpen(true);
      return;
    }
    if (target === 'scheduled') {
      setScheduleAt(toLocalInput(form.scheduledFor));
      setScheduleOpen(true);
      return;
    }
    void runStatus(target);
  };

  const allowedTransitions = ARTICLE_STATUS_TRANSITIONS[form.status];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: theme.spacing(100), mx: 'auto', p: theme.spacing(2) }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: theme.spacing(2) }}>
        <IconButton onClick={() => navigate('/admin/clanky')}>
          <BackIcon />
        </IconButton>
        <Typography variant="h5" component="h1" sx={{ flexGrow: 1 }}>
          {isNew ? 'Nový článok' : 'Upraviť článok'}
        </Typography>
        {autosavedAt && (
          <Typography variant="caption" color="text.secondary">
            Automaticky uložené o {new Date(autosavedAt).toLocaleTimeString('sk-SK')}
          </Typography>
        )}
        {!isNew && (
          <Button
            variant="outlined"
            startIcon={<HistoryIcon />}
            onClick={() => setVersionsOpen(true)}
          >
            História verzií
          </Button>
        )}
        <Button variant="contained" startIcon={<SaveIcon />} onClick={saveContent} disabled={saving}>
          {saving ? 'Ukladám…' : 'Uložiť'}
        </Button>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: theme.spacing(2) }}>
          {error}
        </Alert>
      )}

      <Tabs value={tab} onChange={(_, v) => setTab(v as number)} sx={{ mb: theme.spacing(2) }}>
        <Tab label="Editor" />
        <Tab label="Náhľad" />
        <Tab label="SEO" />
      </Tabs>

      {tab === 2 && <ArticleSeoPanel article={form} />}

      {tab === 1 && (
        <Box sx={{ maxWidth: 720, mx: 'auto' }}>
          <Typography variant="h3" component="h1" sx={{ mb: theme.spacing(2) }}>
            {form.title || '(bez titulku)'}
          </Typography>
          {form.intro && (
            <Typography
              variant="h6"
              component="p"
              sx={{ fontWeight: 400, color: 'text.secondary', mb: theme.spacing(3) }}
            >
              {form.intro}
            </Typography>
          )}
          <Divider sx={{ mb: theme.spacing(3) }} />
          <ArticleBody sections={form.sections} />
          {faqs.length > 0 && (
            <Box component="section" sx={{ mt: theme.spacing(4) }}>
              <Typography variant="h5" component="h2" sx={{ mb: theme.spacing(2) }}>
                Časté otázky
              </Typography>
              {faqs.map((f, i) => (
                <Box key={i} sx={{ mb: theme.spacing(2) }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {f.q}
                  </Typography>
                  <Typography variant="body1" color="text.primary" sx={{ lineHeight: 1.8 }}>
                    {f.a}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}
          <Box sx={{ mt: theme.spacing(3) }}>
            <Callout variant="info" title="Upozornenie" text={ARTICLE_DISCLAIMER} />
          </Box>
        </Box>
      )}

      {tab === 0 && (
        <Stack spacing={theme.spacing(2)}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                Základné údaje
              </Typography>
              <Stack spacing={theme.spacing(2)}>
                <TextField
                  label="Titulok (H1)"
                  value={form.title}
                  onChange={(e) => set('title', e.target.value)}
                  fullWidth
                  size="small"
                />
                <TextField
                  label="Slug (URL)"
                  value={form.slug}
                  onChange={(e) => set('slug', e.target.value)}
                  disabled={!isNew}
                  helperText={
                    isNew
                      ? 'Malé písmená, číslice a pomlčky. Po vytvorení sa nemení.'
                      : 'Slug sa po vytvorení nemení.'
                  }
                  fullWidth
                  size="small"
                />
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={theme.spacing(2)}>
                  <TextField
                    select
                    label="Kategória"
                    value={form.category}
                    onChange={(e) => set('category', e.target.value as AdminArticle['category'])}
                    size="small"
                    fullWidth
                  >
                    <MenuItem value="krmivo">Krmivo a výživa</MenuItem>
                    <MenuItem value="zdravie">Zdravie a prevencia</MenuItem>
                  </TextField>
                  <TextField
                    select
                    label="CTA cieľ"
                    value={form.ctaIntent}
                    onChange={(e) => set('ctaIntent', e.target.value as AdminArticle['ctaIntent'])}
                    size="small"
                    fullWidth
                  >
                    <MenuItem value="food">Analýza krmiva</MenuItem>
                    <MenuItem value="passport">Zdravotný pas</MenuItem>
                  </TextField>
                </Stack>
                <TextField
                  label="Meta popis / perex v zozname"
                  value={form.description}
                  onChange={(e) => set('description', e.target.value)}
                  multiline
                  minRows={2}
                  fullWidth
                  size="small"
                />
                <TextField
                  label="Úvodný odsek (pod H1)"
                  value={form.intro}
                  onChange={(e) => set('intro', e.target.value)}
                  multiline
                  minRows={2}
                  fullWidth
                  size="small"
                />
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={theme.spacing(2)}
                  alignItems="flex-start"
                >
                  <Stack spacing={1} sx={{ flexGrow: 1, width: '100%' }}>
                    <TextField
                      label="URL titulného obrázka"
                      value={form.coverImage ?? ''}
                      onChange={(e) => set('coverImage', e.target.value)}
                      size="small"
                      fullWidth
                    />
                    <Button
                      component="label"
                      variant="outlined"
                      size="small"
                      startIcon={<UploadIcon />}
                      disabled={uploading}
                      sx={{ alignSelf: 'flex-start' }}
                    >
                      {uploading ? 'Nahrávam…' : 'Nahrať obrázok'}
                      <input
                        type="file"
                        hidden
                        accept="image/jpeg,image/png,image/webp"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) void handleCoverUpload(file);
                          e.target.value = '';
                        }}
                      />
                    </Button>
                    {form.coverImage && (
                      <Box
                        component="img"
                        src={form.coverImage}
                        alt=""
                        sx={{
                          width: '100%',
                          maxWidth: theme.spacing(40),
                          borderRadius: theme.shape.borderRadius,
                          objectFit: 'cover',
                        }}
                      />
                    )}
                  </Stack>
                  <TextField
                    label="Autor"
                    value={form.author ?? ''}
                    onChange={(e) => set('author', e.target.value)}
                    size="small"
                    fullWidth
                  />
                </Stack>
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={theme.spacing(2)}
                  alignItems="center"
                >
                  <TextField
                    label="Dátum aktualizácie"
                    type="date"
                    value={form.updated}
                    onChange={(e) => set('updated', e.target.value)}
                    size="small"
                    InputLabelProps={{ shrink: true }}
                  />
                  <TextField
                    label="Poradie"
                    type="number"
                    value={form.position}
                    onChange={(e) => set('position', Number(e.target.value))}
                    size="small"
                    sx={{ width: theme.spacing(14) }}
                  />
                </Stack>
                <TextField
                  label="Súvisiace články (slugy oddelené čiarkou)"
                  value={(form.relatedSlugs ?? []).join(', ')}
                  onChange={(e) =>
                    set(
                      'relatedSlugs',
                      e.target.value
                        .split(',')
                        .map((s) => s.trim())
                        .filter((s) => s.length > 0)
                    )
                  }
                  fullWidth
                  size="small"
                />
              </Stack>
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                Redakčný stav
              </Typography>
              <Stack spacing={theme.spacing(2)}>
                <Stack direction="row" spacing={2} flexWrap="wrap" alignItems="center">
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                      Status:
                    </Typography>
                    <Chip
                      label={STATUS_LABELS[form.status]}
                      color={STATUS_COLORS[form.status]}
                      size="small"
                    />
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    Posledná zmena: {form.updated}
                  </Typography>
                  {latestVersion != null && (
                    <Typography variant="body2" color="text.secondary">
                      Verzia: v{latestVersion}
                    </Typography>
                  )}
                  {form.scheduledFor && form.status === 'scheduled' && (
                    <Typography variant="body2" color="text.secondary">
                      Naplánované na {new Date(form.scheduledFor).toLocaleString('sk-SK')}
                    </Typography>
                  )}
                </Stack>

                {isNew ? (
                  <Typography variant="caption" color="text.secondary">
                    Po uložení sa článok vytvorí ako koncept a sprístupnia sa redakčné akcie.
                  </Typography>
                ) : (
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    {allowedTransitions.map((target) => (
                      <Button
                        key={target}
                        size="small"
                        variant="outlined"
                        disabled={saving}
                        color={
                          target === 'published'
                            ? 'success'
                            : target === 'archived'
                              ? 'inherit'
                              : 'primary'
                        }
                        onClick={() => handleTransition(target)}
                      >
                        {transitionActionLabel(form.status, target)}
                      </Button>
                    ))}
                  </Stack>
                )}

                <TextField
                  label="Priradené (e-mail editora)"
                  value={form.assignedTo ?? ''}
                  onChange={(e) => set('assignedTo', e.target.value)}
                  size="small"
                  fullWidth
                />
                <TextField
                  label="Interné poznámky (nezobrazujú sa verejne)"
                  value={form.internalNotes ?? ''}
                  onChange={(e) => set('internalNotes', e.target.value)}
                  multiline
                  minRows={2}
                  fullWidth
                  size="small"
                />
              </Stack>
            </CardContent>
          </Card>

          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Obsah článku
            </Typography>
            <ArticleRichEditor
              value={form.sections}
              onChange={(sections) => set('sections', sections)}
            />
          </Box>

          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                Často kladené otázky (FAQ)
              </Typography>
              <Stack spacing={theme.spacing(1.5)}>
                {faqs.map((f, i) => (
                  <Stack key={i} direction="row" spacing={1} alignItems="flex-start">
                    <Stack spacing={1} sx={{ flexGrow: 1 }}>
                      <TextField
                        label={`Otázka #${i + 1}`}
                        value={f.q}
                        onChange={(e) =>
                          set(
                            'faqs',
                            faqs.map((x, j) => (j === i ? { ...x, q: e.target.value } : x))
                          )
                        }
                        size="small"
                        fullWidth
                      />
                      <TextField
                        label="Odpoveď"
                        value={f.a}
                        onChange={(e) =>
                          set(
                            'faqs',
                            faqs.map((x, j) => (j === i ? { ...x, a: e.target.value } : x))
                          )
                        }
                        multiline
                        minRows={2}
                        size="small"
                        fullWidth
                      />
                    </Stack>
                    <IconButton
                      color="error"
                      onClick={() =>
                        set(
                          'faqs',
                          faqs.filter((_, j) => j !== i)
                        )
                      }
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Stack>
                ))}
                <Button
                  startIcon={<AddIcon />}
                  onClick={() => set('faqs', [...faqs, { q: '', a: '' }])}
                  sx={{ alignSelf: 'flex-start' }}
                >
                  Pridať otázku
                </Button>
              </Stack>
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                Zdroje
              </Typography>
              <Stack spacing={theme.spacing(1.5)}>
                {sources.map((s, i) => (
                  <Stack key={i} direction="row" spacing={1} alignItems="center">
                    <TextField
                      label="Názov"
                      value={s.label}
                      onChange={(e) =>
                        set(
                          'sources',
                          sources.map((x, j) => (j === i ? { ...x, label: e.target.value } : x))
                        )
                      }
                      size="small"
                      sx={{ flexGrow: 1 }}
                    />
                    <TextField
                      label="URL"
                      value={s.url}
                      onChange={(e) =>
                        set(
                          'sources',
                          sources.map((x, j) => (j === i ? { ...x, url: e.target.value } : x))
                        )
                      }
                      size="small"
                      sx={{ flexGrow: 1 }}
                    />
                    <IconButton
                      color="error"
                      onClick={() =>
                        set(
                          'sources',
                          sources.filter((_, j) => j !== i)
                        )
                      }
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Stack>
                ))}
                <Button
                  startIcon={<AddIcon />}
                  onClick={() => set('sources', [...sources, { label: '', url: '' }])}
                  sx={{ alignSelf: 'flex-start' }}
                >
                  Pridať zdroj
                </Button>
              </Stack>
            </CardContent>
          </Card>

          <Divider />
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={saveContent}
            disabled={saving}
            sx={{ alignSelf: 'flex-start' }}
          >
            {saving ? 'Ukladám…' : 'Uložiť článok'}
          </Button>
        </Stack>
      )}

      {!isNew && (
        <ArticleVersionsDrawer
          open={versionsOpen}
          slug={slug ?? ''}
          current={form}
          onClose={() => setVersionsOpen(false)}
          onRestored={(article) => {
            setForm(article);
            setVersionsOpen(false);
            setNotice(`Obnovená verzia článku „${article.title}".`);
          }}
        />
      )}

      <Dialog open={checklistOpen} onClose={() => setChecklistOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Kontrola pred publikovaním</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: theme.spacing(1) }}>
            Pri témach ako zdravie psa over, že obsah je v poriadku. Publikovať môžeš až po
            odškrtnutí všetkých bodov.
          </Typography>
          {seoErrors.length > 0 && (
            <Alert severity="error" sx={{ mb: theme.spacing(2) }}>
              Najprv oprav kritické SEO chyby (pozri SEO tab):
              <Box component="ul" sx={{ mt: 0.5, mb: 0, pl: theme.spacing(3) }}>
                {seoErrors.map((c) => (
                  <li key={c.id}>{c.label}</li>
                ))}
              </Box>
            </Alert>
          )}
          <Stack>
            {PUBLISH_CHECKLIST.map((item, i) => (
              <FormControlLabel
                key={i}
                control={
                  <Checkbox
                    checked={checklistChecked[i] ?? false}
                    onChange={(e) =>
                      setChecklistChecked((prev) => {
                        const next = [...prev];
                        next[i] = e.target.checked;
                        return next;
                      })
                    }
                  />
                }
                label={item}
              />
            ))}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setChecklistOpen(false)}>Zrušiť</Button>
          <Button
            variant="contained"
            disabled={
              saving ||
              seoErrors.length > 0 ||
              checklistChecked.length === 0 ||
              !checklistChecked.every(Boolean)
            }
            onClick={() => {
              setChecklistOpen(false);
              void runStatus('published');
            }}
          >
            Publikovať
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={scheduleOpen} onClose={() => setScheduleOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Naplánovať publikovanie</DialogTitle>
        <DialogContent>
          <TextField
            label="Publikovať o"
            type="datetime-local"
            value={scheduleAt}
            onChange={(e) => setScheduleAt(e.target.value)}
            fullWidth
            margin="dense"
            InputLabelProps={{ shrink: true }}
          />
          <Typography variant="caption" color="text.secondary">
            V naplánovanom čase článok automaticky zverejní cron.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setScheduleOpen(false)}>Zrušiť</Button>
          <Button
            variant="contained"
            disabled={saving || !scheduleAt}
            onClick={() => {
              const iso = fromLocalInput(scheduleAt);
              if (!iso) return;
              setScheduleOpen(false);
              void runStatus('scheduled', { scheduledFor: iso });
            }}
          >
            Naplánovať
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={Boolean(notice)}
        autoHideDuration={6000}
        onClose={() => setNotice(null)}
        message={notice ?? ''}
      />
    </Box>
  );
}
