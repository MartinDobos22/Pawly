import { useEffect, useMemo, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';
import type { AnimalType } from '../../constants/animalSpecies';
import {
  Box,
  Card,
  CardActionArea,
  Chip,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Pagination,
  Select,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
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
  title: 'Poradňa o zvieratách — krmivo, zdravie, prevencia | Pawly',
  description:
    'Praktické články o starostlivosti o psa, mačku aj ďalšie zvieratá: krmivo, očkovanie, odčervenie, prvá pomoc a prevencia. Poradňa Pawly.',
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

const ARTICLES_PER_PAGE = 9;

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
  const [page, setPage] = useState(1);
  const resultsRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    setPage(1);
  }, [filter, speciesFilter]);

  const pageCount = Math.ceil(gridArticles.length / ARTICLES_PER_PAGE);
  const safePage = Math.min(page, Math.max(1, pageCount));
  const pagedArticles = useMemo(
    () => gridArticles.slice((safePage - 1) * ARTICLES_PER_PAGE, safePage * ARTICLES_PER_PAGE),
    [gridArticles, safePage],
  );

  const handlePageChange = (_event: ChangeEvent<unknown>, value: number) => {
    setPage(value);
    resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleSpeciesChange = (event: SelectChangeEvent) => {
    setSpeciesFilter(event.target.value as 'all' | AnimalType);
  };

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
            Praktické rady o domácich zvieratách
          </Typography>
          <Typography variant="h6" component="p" sx={{ fontWeight: 400, opacity: 0.9, maxWidth: 640 }}>
            Krmivo, zdravie a prevencia — aby si sa o svojho miláčika staral s istotou.
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
        {isDefault && featured && <FeaturedCard article={featured} />}

        <Box ref={resultsRef} sx={{ scrollMarginTop: theme.spacing(2) }} />

        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={theme.spacing(2)}
          alignItems={{ xs: 'stretch', md: 'center' }}
          justifyContent="space-between"
          sx={{ mb: theme.spacing(4) }}
        >
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }} useFlexGap>
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
            <FormControl size="small" sx={{ minWidth: { xs: '100%', md: 240 } }}>
              <InputLabel id="poradna-species-filter-label">Druh zvieraťa</InputLabel>
              <Select
                labelId="poradna-species-filter-label"
                id="poradna-species-filter"
                label="Druh zvieraťa"
                value={speciesFilter}
                onChange={handleSpeciesChange}
              >
                <MenuItem value="all">Všetky druhy</MenuItem>
                {availableSpecies.map((s) => (
                  <MenuItem key={s} value={s}>
                    {speciesLabels[s] ?? s}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </Stack>

        <Box
          sx={{
            display: 'grid',
            gap: theme.spacing(3),
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
          }}
        >
          {pagedArticles.map((article) => (
            <ArticleCard key={article.slug} article={article} />
          ))}
        </Box>

        {gridArticles.length === 0 && (
          <Typography color="text.secondary">V tejto kategórii zatiaľ nie sú ďalšie články.</Typography>
        )}

        {pageCount > 1 && (
          <Stack alignItems="center" sx={{ mt: theme.spacing(5) }}>
            <Pagination
              count={pageCount}
              page={safePage}
              onChange={handlePageChange}
              color="primary"
              shape="rounded"
            />
          </Stack>
        )}
      </Container>
    </BlogLayout>
  );
}
