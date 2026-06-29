import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';
import type { AnimalType } from '../../constants/animalSpecies';
import {
  Box,
  Card,
  CardActionArea,
  Chip,
  Container,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import { ArrowForward as ArrowIcon, Schedule as ScheduleIcon } from '@mui/icons-material';
import Seo from '../../components/Seo';
import BlogLayout from '../../components/public/BlogLayout';
import ArticleCard from '../../components/public/ArticleCard';
import { collectionJsonLd } from '../../utils/seoSchema';
import { articleReadingMinutes } from '../../utils/readingTime';
import { CATEGORY_COLORS, CATEGORY_LABELS, articles } from '../../content/poradna/articles';
import type { Article, ArticleCategory } from '../../content/poradna/types';

interface Props {
  darkMode: boolean;
  onToggleTheme: () => void;
}

type Filter = 'all' | ArticleCategory;

export const seo = {
  title: 'Poradňa o psoch — krmivo, zdravie, prevencia | Pawly',
  description:
    'Praktické články o starostlivosti o psa: ako čítať zloženie krmiva, očkovací kalendár, alergie a ďalšie. Poradňa Pawly.',
  path: '/poradna',
  jsonLd: collectionJsonLd({
    items: articles.map((a) => ({ name: a.title, path: `/poradna/${a.slug}` })),
    breadcrumbs: [
      { name: 'Pawly', path: '/' },
      { name: 'Poradňa', path: '/poradna' },
    ],
  }),
};

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'Všetko' },
  { value: 'krmivo', label: CATEGORY_LABELS.krmivo },
  { value: 'zdravie', label: CATEGORY_LABELS.zdravie },
];

function FeaturedCard({ article }: { article: Article }) {
  const theme = useTheme();
  const color = CATEGORY_COLORS[article.category];
  const readingMinutes = articleReadingMinutes(article);

  return (
    <Card sx={{ mb: theme.spacing(5) }}>
      <CardActionArea
        component={RouterLink}
        to={`/poradna/${article.slug}`}
        sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'stretch' }}
      >
        <Box
          sx={{
            width: { xs: '100%', md: '50%' },
            minHeight: { xs: 200, md: 320 },
            bgcolor: theme.palette[color].main,
            backgroundImage: article.coverImage ? `url(${article.coverImage})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <Box sx={{ p: { xs: theme.spacing(3), md: theme.spacing(5) }, flex: 1 }}>
          <Chip
            label={CATEGORY_LABELS[article.category]}
            color={color}
            size="small"
            sx={{ mb: theme.spacing(2) }}
          />
          <Typography variant="h4" component="h2" sx={{ mb: theme.spacing(1.5) }}>
            {article.title}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: theme.spacing(2.5) }}>
            {article.description}
          </Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            <Stack direction="row" spacing={0.5} alignItems="center" color="text.secondary">
              <ScheduleIcon sx={{ fontSize: theme.typography.body2.fontSize }} />
              <Typography variant="caption" color="text.secondary">
                {readingMinutes} min čítania
              </Typography>
            </Stack>
            <Stack direction="row" spacing={0.5} alignItems="center" color="primary.main">
              <Typography variant="button">Čítať článok</Typography>
              <ArrowIcon sx={{ fontSize: theme.typography.body1.fontSize }} />
            </Stack>
          </Stack>
        </Box>
      </CardActionArea>
    </Card>
  );
}

export default function PoradnaIndexPage({ darkMode, onToggleTheme }: Props) {
  const theme = useTheme();
  const { t } = useTranslation('healthPassport');
  const speciesLabels = t('profiles.species', { returnObjects: true }) as Record<string, string>;
  const [filter, setFilter] = useState<Filter>('all');
  const [speciesFilter, setSpeciesFilter] = useState<'all' | AnimalType>('all');

  const ordered = useMemo(
    () => [...articles].sort((a, b) => b.updated.localeCompare(a.updated)),
    [],
  );
  const availableSpecies = useMemo(
    () => Array.from(new Set(ordered.flatMap((a) => a.species ?? []))),
    [ordered],
  );
  const isDefault = filter === 'all' && speciesFilter === 'all';
  const featured = ordered[0];
  const gridArticles = useMemo(() => {
    let list = isDefault ? ordered.slice(1) : ordered;
    if (filter !== 'all') list = list.filter((a) => a.category === filter);
    if (speciesFilter !== 'all') list = list.filter((a) => (a.species ?? []).includes(speciesFilter));
    return list;
  }, [filter, speciesFilter, ordered, isDefault]);

  return (
    <BlogLayout darkMode={darkMode} onToggleTheme={onToggleTheme}>
      <Seo {...seo} />

      <Box
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: theme.palette.primary.contrastText,
          py: { xs: 6, md: 9 },
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="overline" sx={{ opacity: 0.85 }}>
            Poradňa Pawly
          </Typography>
          <Typography variant="h2" component="h1" sx={{ mb: theme.spacing(2), maxWidth: 720 }}>
            Praktické rady o psoch
          </Typography>
          <Typography variant="h6" component="p" sx={{ fontWeight: 400, opacity: 0.9, maxWidth: 640 }}>
            Krmivo, zdravie a prevencia — aby si sa o svojho psa staral s istotou.
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
        {isDefault && featured && <FeaturedCard article={featured} />}

        <Stack direction="row" spacing={1} sx={{ mb: theme.spacing(2), flexWrap: 'wrap' }} useFlexGap>
          {FILTERS.map((f) => (
            <Chip
              key={f.value}
              label={f.label}
              onClick={() => setFilter(f.value)}
              color={filter === f.value ? 'primary' : 'default'}
              variant={filter === f.value ? 'filled' : 'outlined'}
            />
          ))}
        </Stack>

        {availableSpecies.length > 0 && (
          <Stack
            direction="row"
            spacing={1}
            sx={{ mb: theme.spacing(3), flexWrap: 'wrap' }}
            useFlexGap
          >
            <Chip
              label="Všetky druhy"
              onClick={() => setSpeciesFilter('all')}
              color={speciesFilter === 'all' ? 'primary' : 'default'}
              variant={speciesFilter === 'all' ? 'filled' : 'outlined'}
            />
            {availableSpecies.map((s) => (
              <Chip
                key={s}
                label={speciesLabels[s] ?? s}
                onClick={() => setSpeciesFilter(s)}
                color={speciesFilter === s ? 'primary' : 'default'}
                variant={speciesFilter === s ? 'filled' : 'outlined'}
              />
            ))}
          </Stack>
        )}

        <Box
          sx={{
            display: 'grid',
            gap: theme.spacing(3),
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
          }}
        >
          {gridArticles.map((article) => (
            <ArticleCard key={article.slug} article={article} />
          ))}
        </Box>

        {gridArticles.length === 0 && (
          <Typography color="text.secondary">V tejto kategórii zatiaľ nie sú ďalšie články.</Typography>
        )}
      </Container>
    </BlogLayout>
  );
}
