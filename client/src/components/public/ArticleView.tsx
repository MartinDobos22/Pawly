import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Breadcrumbs,
  Chip,
  Container,
  Divider,
  Link,
  Stack,
  Typography,
  useTheme,
  alpha,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Schedule as ScheduleIcon,
  VerifiedOutlined as VerifiedIcon,
} from '@mui/icons-material';
import ArticleBody from './ArticleBody';
import Callout from './Callout';
import LandingFaq from './LandingFaq';
import LandingCta from './LandingCta';
import ArticleCard from './ArticleCard';
import { articleReadingMinutes } from '../../utils/readingTime';
import { trackArticleEvent } from '../../services/analyticsApi';
import {
  ARTICLE_DISCLAIMER,
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  SUPPORT_EMAIL,
  getArticle,
} from '../../content/poradna/articles';
import type { Article } from '../../content/poradna/types';

interface Props {
  article: Article;
  /** V preview (admin náhľad konceptu) sa nemerajú eventy. */
  preview?: boolean;
}

function formatUpdated(iso: string): string {
  return new Date(iso).toLocaleDateString('sk-SK', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default function ArticleView({ article, preview = false }: Props) {
  const theme = useTheme();
  const track = (type: Parameters<typeof trackArticleEvent>[1], meta?: Record<string, unknown>) => {
    if (!preview) trackArticleEvent(article.slug, type, meta);
  };

  const related = (article.relatedSlugs ?? [])
    .map((s) => getArticle(s))
    .filter((a): a is Article => Boolean(a));

  const ctaLabel = article.ctaIntent === 'food' ? 'Analyzovať krmivo' : 'Vytvoriť zdravotný pas';
  const color = CATEGORY_COLORS[article.category];
  const readingMinutes = articleReadingMinutes(article);
  const author = article.author ?? 'Tím Pawly';

  return (
    <>
      <Box
        component="header"
        sx={{
          position: 'relative',
          color: theme.palette.common.white,
          bgcolor: theme.palette[color].dark,
          backgroundImage: `linear-gradient(180deg, ${alpha(theme.palette.common.black, 0.35)} 0%, ${alpha(theme.palette.common.black, 0.7)} 100%)${
            article.coverImage ? `, url(${article.coverImage})` : ''
          }`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          py: { xs: 6, md: 10 },
        }}
      >
        <Container maxWidth="md">
          <Breadcrumbs sx={{ mb: theme.spacing(2), color: 'inherit' }}>
            <Link component={RouterLink} to="/" underline="hover" color="inherit" variant="body2">
              Pawly
            </Link>
            <Link
              component={RouterLink}
              to="/poradna"
              underline="hover"
              color="inherit"
              variant="body2"
            >
              Poradňa
            </Link>
            <Typography variant="body2" sx={{ color: alpha(theme.palette.common.white, 0.75) }}>
              {article.title}
            </Typography>
          </Breadcrumbs>

          <Chip
            label={CATEGORY_LABELS[article.category]}
            color={color}
            size="small"
            sx={{ mb: theme.spacing(2) }}
          />

          <Typography variant="h3" component="h1" sx={{ mb: theme.spacing(2) }}>
            {article.title}
          </Typography>

          <Stack direction="row" spacing={0.5} alignItems="center" flexWrap="wrap" useFlexGap>
            <ScheduleIcon sx={{ fontSize: theme.typography.body2.fontSize }} />
            <Typography variant="body2" sx={{ color: alpha(theme.palette.common.white, 0.9) }}>
              {author} · Aktualizované {formatUpdated(article.updated)} · {readingMinutes} min
              čítania
            </Typography>
          </Stack>

          {article.medicalReviewedAt && (
            <Stack
              direction="row"
              spacing={0.5}
              alignItems="center"
              flexWrap="wrap"
              useFlexGap
              sx={{ mt: theme.spacing(1) }}
            >
              <VerifiedIcon sx={{ fontSize: theme.typography.body2.fontSize }} />
              <Typography variant="body2" sx={{ color: alpha(theme.palette.common.white, 0.9) }}>
                Odborne skontrolované {formatUpdated(article.medicalReviewedAt)}
                {article.reviewerTitle ? ` · ${article.reviewerTitle}` : ''}
              </Typography>
            </Stack>
          )}
        </Container>
      </Box>

      <Container maxWidth="md" sx={{ py: { xs: 4, md: 6 } }}>
        <Box sx={{ mb: theme.spacing(3) }}>
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

        {article.intro?.trim() && (
          <Typography
            variant="h6"
            component="p"
            color="text.primary"
            sx={{ fontWeight: 400, lineHeight: 1.6, mb: theme.spacing(4) }}
          >
            {article.intro}
          </Typography>
        )}

        <Divider sx={{ mb: theme.spacing(4) }} />

        <Box component="article" sx={{ maxWidth: 720, mx: 'auto' }}>
          <ArticleBody sections={article.sections} />

          <Callout
            variant="info"
            title="Upozornenie"
            text={article.disclaimer?.trim() || ARTICLE_DISCLAIMER}
          />

          {article.sources && article.sources.length > 0 && (
            <Box component="section" sx={{ mt: theme.spacing(4) }}>
              <Typography variant="h6" component="h2" sx={{ mb: theme.spacing(1.5) }}>
                Zdroje
              </Typography>
              <Typography
                component="ul"
                variant="body2"
                color="text.secondary"
                sx={{ m: 0, pl: theme.spacing(3), lineHeight: 1.8 }}
              >
                {article.sources.map((src) => (
                  <li key={src.url}>
                    <Link
                      href={src.url}
                      target="_blank"
                      rel="noopener nofollow"
                      underline="hover"
                      onClick={() => track('source_click', { url: src.url })}
                    >
                      {src.label}
                    </Link>
                  </li>
                ))}
              </Typography>
            </Box>
          )}

          <Box
            sx={{
              mt: theme.spacing(4),
              p: theme.spacing(2),
              borderRadius: `${theme.shape.borderRadius}px`,
              border: `1px solid ${theme.palette.divider}`,
              bgcolor: alpha(theme.palette.primary.main, 0.04),
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Našli ste v článku chybu alebo nepresnosť? Napíšte nám na{' '}
              <Link
                href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
                  `Chyba v článku: ${article.title}`
                )}`}
                underline="hover"
              >
                {SUPPORT_EMAIL}
              </Link>{' '}
              a opravíme to.
            </Typography>
          </Box>
        </Box>

        <Box onClick={() => track('cta_click', { ctaIntent: article.ctaIntent })}>
          <LandingCta
            heading="Začni sa o psa starať s Pawly"
            buttonLabel={ctaLabel}
            to="/register"
            intent={article.ctaIntent}
          />
        </Box>

        {article.faqs && article.faqs.length > 0 && (
          <LandingFaq title="Časté otázky" faqs={article.faqs} />
        )}

        {related.length > 0 && (
          <Box component="section" sx={{ mt: theme.spacing(5) }}>
            <Typography variant="h5" component="h2" sx={{ mb: theme.spacing(2) }}>
              Súvisiace články
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gap: theme.spacing(3),
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
              }}
            >
              {related.map((a) => (
                <Box key={a.slug} onClick={() => track('related_click', { to: a.slug })}>
                  <ArticleCard article={a} />
                </Box>
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
      </Container>
    </>
  );
}
