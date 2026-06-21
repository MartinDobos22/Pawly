import { Link as RouterLink, Navigate, useParams } from 'react-router-dom';
import {
  Box,
  Breadcrumbs,
  Chip,
  Divider,
  Link,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import Seo from '../../components/Seo';
import PublicPageLayout from '../../components/public/PublicPageLayout';
import LandingFaq from '../../components/public/LandingFaq';
import LandingCta from '../../components/public/LandingCta';
import ArticleCard from '../../components/public/ArticleCard';
import { articleJsonLd } from '../../utils/seoSchema';
import { articleReadingMinutes } from '../../utils/readingTime';
import { slugifyHeading } from '../../utils/slugifyHeading';
import { CATEGORY_COLORS, CATEGORY_LABELS, getArticle } from '../../content/poradna/articles';
import type { Article } from '../../content/poradna/types';

interface Props {
  darkMode: boolean;
  onToggleTheme: () => void;
  /** SSG posiela slug priamo; v appke sa berie z useParams. */
  slug?: string;
}

export function articleSeo(article: Article) {
  const path = `/poradna/${article.slug}`;
  return {
    title: `${article.title} | Pawly`,
    description: article.description,
    path,
    jsonLd: articleJsonLd({
      title: article.title,
      description: article.description,
      path,
      updated: article.updated,
      faqs: article.faqs,
      breadcrumbs: [
        { name: 'Pawly', path: '/' },
        { name: 'Poradňa', path: '/poradna' },
        { name: article.title, path },
      ],
    }),
  };
}

function formatUpdated(iso: string): string {
  return new Date(iso).toLocaleDateString('sk-SK', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default function PoradnaArticlePage({ darkMode, onToggleTheme, slug: slugProp }: Props) {
  const theme = useTheme();
  const params = useParams();
  const slug = slugProp ?? params.slug;
  const article = slug ? getArticle(slug) : undefined;

  if (!article) return <Navigate to="/poradna" replace />;

  const related = (article.relatedSlugs ?? [])
    .map((s) => getArticle(s))
    .filter((a): a is Article => Boolean(a));

  const ctaLabel =
    article.ctaIntent === 'food' ? 'Analyzovať krmivo' : 'Vytvoriť zdravotný pas';

  const readingMinutes = articleReadingMinutes(article);
  const showToc = article.sections.length >= 3;

  return (
    <PublicPageLayout darkMode={darkMode} onToggleTheme={onToggleTheme}>
      <Seo {...articleSeo(article)} />

      <Box component="header" sx={{ mb: theme.spacing(4) }}>
        <Breadcrumbs sx={{ mb: theme.spacing(2) }}>
          <Link component={RouterLink} to="/" underline="hover" color="inherit" variant="body2">
            Pawly
          </Link>
          <Link component={RouterLink} to="/poradna" underline="hover" color="inherit" variant="body2">
            Poradňa
          </Link>
          <Typography variant="body2" color="text.secondary">
            {article.title}
          </Typography>
        </Breadcrumbs>

        <Stack
          direction="row"
          spacing={1.5}
          alignItems="center"
          flexWrap="wrap"
          useFlexGap
          sx={{ mb: theme.spacing(2) }}
        >
          <Chip
            label={CATEGORY_LABELS[article.category]}
            color={CATEGORY_COLORS[article.category]}
            size="small"
            variant="outlined"
          />
          <Stack direction="row" spacing={0.5} alignItems="center" color="text.secondary">
            <ScheduleIcon sx={{ fontSize: theme.typography.body2.fontSize }} />
            <Typography variant="body2" color="text.secondary">
              Aktualizované {formatUpdated(article.updated)} · {readingMinutes} min čítania
            </Typography>
          </Stack>
        </Stack>

        <Typography variant="h3" component="h1" sx={{ mb: theme.spacing(2.5) }}>
          {article.title}
        </Typography>
        <Typography
          variant="h6"
          component="p"
          color="text.primary"
          sx={{ fontWeight: 400, lineHeight: 1.6 }}
        >
          {article.intro}
        </Typography>
      </Box>

      <Divider sx={{ mb: theme.spacing(4) }} />

      {showToc && (
        <Box
          component="nav"
          aria-label="Obsah článku"
          sx={{
            mb: theme.spacing(4),
            p: theme.spacing(2.5),
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: `${theme.shape.borderRadius}px`,
            bgcolor: 'action.hover',
          }}
        >
          <Typography variant="subtitle2" sx={{ mb: theme.spacing(1) }}>
            Obsah
          </Typography>
          <Stack component="ol" spacing={0.75} sx={{ listStyle: 'none', m: 0, p: 0 }}>
            {article.sections.map((section) => (
              <li key={section.heading}>
                <Link href={`#${slugifyHeading(section.heading)}`} underline="hover" variant="body2">
                  {section.heading}
                </Link>
              </li>
            ))}
          </Stack>
        </Box>
      )}

      <Box component="article" sx={{ maxWidth: 680, mx: 'auto' }}>
        {article.sections.map((section, i) => (
          <Box component="section" key={section.heading} sx={{ mt: i === 0 ? 0 : theme.spacing(5) }}>
            <Typography
              variant="h5"
              component="h2"
              id={slugifyHeading(section.heading)}
              sx={{ mb: theme.spacing(2), scrollMarginTop: theme.spacing(10) }}
            >
              {section.heading}
            </Typography>
            {section.paragraphs.map((p, j) => (
              <Typography
                key={j}
                variant="body1"
                color="text.primary"
                sx={{ mb: theme.spacing(2), lineHeight: 1.8 }}
              >
                {p}
              </Typography>
            ))}
          </Box>
        ))}
      </Box>

      <LandingCta
        heading="Začni sa o psa starať s Pawly"
        buttonLabel={ctaLabel}
        to="/register"
        intent={article.ctaIntent}
      />

      {article.faqs && article.faqs.length > 0 && (
        <LandingFaq title="Časté otázky" faqs={article.faqs} />
      )}

      {related.length > 0 && (
        <Box component="section" sx={{ mt: theme.spacing(5) }}>
          <Typography variant="h5" component="h2" sx={{ mb: theme.spacing(2) }}>
            Súvisiace články
          </Typography>
          <Box sx={{ display: 'grid', gap: theme.spacing(2) }}>
            {related.map((a) => (
              <ArticleCard key={a.slug} article={a} />
            ))}
          </Box>
        </Box>
      )}

      <Box sx={{ mt: theme.spacing(5) }}>
        <Link
          component={RouterLink}
          to="/poradna"
          underline="hover"
          variant="body2"
          sx={{ display: 'inline-flex', alignItems: 'center', gap: theme.spacing(0.5) }}
        >
          <ArrowBackIcon sx={{ fontSize: theme.typography.body2.fontSize }} />
          Späť na Poradňu
        </Link>
      </Box>
    </PublicPageLayout>
  );
}
