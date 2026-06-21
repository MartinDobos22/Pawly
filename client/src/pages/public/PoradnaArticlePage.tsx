import { Link as RouterLink, Navigate, useParams } from 'react-router-dom';
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
} from '@mui/material';
import { ArrowBack as ArrowBackIcon, Schedule as ScheduleIcon } from '@mui/icons-material';
import Seo from '../../components/Seo';
import BlogLayout from '../../components/public/BlogLayout';
import LandingFaq from '../../components/public/LandingFaq';
import LandingCta from '../../components/public/LandingCta';
import ArticleCard from '../../components/public/ArticleCard';
import Callout from '../../components/public/Callout';
import RichText from '../../components/public/RichText';
import { articleJsonLd } from '../../utils/seoSchema';
import { articleReadingMinutes } from '../../utils/readingTime';
import { slugifyHeading } from '../../utils/slugifyHeading';
import { CATEGORY_COLORS, CATEGORY_LABELS, getArticle } from '../../content/poradna/articles';
import type { Article, Block } from '../../content/poradna/types';

const DISCLAIMER =
  'Tento článok má informačný charakter a nenahrádza odbornú veterinárnu starostlivosť. Pri zdravotných ťažkostiach alebo otázkach o výžive psa sa vždy poraď s veterinárom.';

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
      image: article.coverImage,
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

  const ctaLabel = article.ctaIntent === 'food' ? 'Analyzovať krmivo' : 'Vytvoriť zdravotný pas';

  const color = CATEGORY_COLORS[article.category];
  const readingMinutes = articleReadingMinutes(article);
  const showToc = article.sections.length >= 3;
  const author = article.author ?? 'Tím Pawly';

  return (
    <BlogLayout darkMode={darkMode} onToggleTheme={onToggleTheme}>
      <Seo {...articleSeo(article)} />

      <Box
        component="header"
        sx={{
          position: 'relative',
          color: theme.palette.common.white,
          bgcolor: theme.palette[color].dark,
          backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.7) 100%)${
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
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.75)' }}>
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
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
              {author} · Aktualizované {formatUpdated(article.updated)} · {readingMinutes} min
              čítania
            </Typography>
          </Stack>
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

        <Typography
          variant="h6"
          component="p"
          color="text.primary"
          sx={{ fontWeight: 400, lineHeight: 1.6, mb: theme.spacing(4) }}
        >
          {article.intro}
        </Typography>

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
                  <Link
                    href={`#${slugifyHeading(section.heading)}`}
                    underline="hover"
                    variant="body2"
                  >
                    {section.heading}
                  </Link>
                  {section.blocks.some((b) => b.type === 'subheading') && (
                    <Stack
                      component="ol"
                      spacing={0.5}
                      sx={{ listStyle: 'none', m: 0, mt: 0.5, p: 0, pl: theme.spacing(2) }}
                    >
                      {section.blocks
                        .filter(
                          (b): b is Extract<Block, { type: 'subheading' }> =>
                            b.type === 'subheading'
                        )
                        .map((b) => (
                          <li key={b.text}>
                            <Link
                              href={`#${slugifyHeading(b.text)}`}
                              underline="hover"
                              variant="body2"
                              color="text.secondary"
                            >
                              {b.text}
                            </Link>
                          </li>
                        ))}
                    </Stack>
                  )}
                </li>
              ))}
            </Stack>
          </Box>
        )}

        <Box component="article" sx={{ maxWidth: 720, mx: 'auto' }}>
          {article.sections.map((section, i) => (
            <Box
              component="section"
              key={section.heading}
              sx={{ mt: i === 0 ? 0 : theme.spacing(5) }}
            >
              <Typography
                variant="h5"
                component="h2"
                id={slugifyHeading(section.heading)}
                sx={{ mb: theme.spacing(2), scrollMarginTop: theme.spacing(10) }}
              >
                {section.heading}
              </Typography>
              {section.blocks.map((block, j) => {
                switch (block.type) {
                  case 'paragraph':
                    return (
                      <Typography
                        key={j}
                        variant="body1"
                        color="text.primary"
                        sx={{ mb: theme.spacing(2), lineHeight: 1.8 }}
                      >
                        <RichText text={block.text} />
                      </Typography>
                    );
                  case 'bullets':
                    return (
                      <Typography
                        key={j}
                        component="ul"
                        variant="body1"
                        color="text.primary"
                        sx={{ mb: theme.spacing(2), lineHeight: 1.8, pl: theme.spacing(3) }}
                      >
                        {block.items.map((item, k) => (
                          <li key={k}>
                            <RichText text={item} />
                          </li>
                        ))}
                      </Typography>
                    );
                  case 'subheading':
                    return (
                      <Typography
                        key={j}
                        variant="h6"
                        component="h3"
                        id={slugifyHeading(block.text)}
                        sx={{
                          mt: theme.spacing(3),
                          mb: theme.spacing(1.5),
                          scrollMarginTop: theme.spacing(10),
                        }}
                      >
                        {block.text}
                      </Typography>
                    );
                  case 'callout':
                    return (
                      <Callout
                        key={j}
                        variant={block.variant}
                        title={block.title}
                        text={block.text}
                      />
                    );
                  default:
                    return null;
                }
              })}
            </Box>
          ))}

          <Callout variant="info" title="Upozornenie" text={DISCLAIMER} />

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
                    <Link href={src.url} target="_blank" rel="noopener nofollow" underline="hover">
                      {src.label}
                    </Link>
                  </li>
                ))}
              </Typography>
            </Box>
          )}
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
            <Box
              sx={{
                display: 'grid',
                gap: theme.spacing(3),
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
              }}
            >
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
      </Container>
    </BlogLayout>
  );
}
