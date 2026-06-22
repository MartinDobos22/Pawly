import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  FormControlLabel,
  IconButton,
  MenuItem,
  Stack,
  Switch,
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
  Save as SaveIcon,
  UploadFile as UploadIcon,
} from '@mui/icons-material';
import ArticleRichEditor from '../../components/admin/articleEditor/ArticleRichEditor';
import ArticleBody from '../../components/public/ArticleBody';
import Callout from '../../components/public/Callout';
import {
  createAdminArticle,
  getAdminArticle,
  updateAdminArticle,
  uploadArticleImage,
} from '../../services/adminApi';
import { downscaleImage } from '../../utils/imageDownscale';
import { ARTICLE_DISCLAIMER } from '../../content/poradna/articles';
import type { AdminArticle } from '../../content/poradna/types';

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
    published: true,
    position: 0,
  };
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

  useEffect(() => {
    if (isNew) return;
    setLoading(true);
    getAdminArticle(slug)
      .then(setForm)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [slug, isNew]);

  const set = <K extends keyof AdminArticle>(key: K, val: AdminArticle[K]) =>
    setForm((f) => ({ ...f, [key]: val }));

  const faqs = form.faqs ?? [];
  const sources = form.sources ?? [];

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

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      const payload: AdminArticle = {
        ...form,
        faqs: faqs.filter((f) => f.q.trim() || f.a.trim()),
        sources: sources.filter((s) => s.label.trim() || s.url.trim()),
        sections: form.sections.map((s) => ({
          ...s,
          blocks: s.blocks.map((b) =>
            b.type === 'bullets' ? { ...b, items: b.items.filter((i) => i.trim().length > 0) } : b
          ),
        })),
      };
      if (isNew) {
        await createAdminArticle(payload);
      } else {
        await updateAdminArticle(slug, payload);
      }
      navigate('/admin/clanky');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

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
        <Button variant="contained" startIcon={<SaveIcon />} onClick={save} disabled={saving}>
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
      </Tabs>

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
                  <FormControlLabel
                    control={
                      <Switch
                        checked={form.published}
                        onChange={(e) => set('published', e.target.checked)}
                      />
                    }
                    label={form.published ? 'Publikované' : 'Koncept'}
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
            onClick={save}
            disabled={saving}
            sx={{ alignSelf: 'flex-start' }}
          >
            {saving ? 'Ukladám…' : 'Uložiť článok'}
          </Button>
        </Stack>
      )}
    </Box>
  );
}
