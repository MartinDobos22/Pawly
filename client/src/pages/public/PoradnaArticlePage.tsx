import { Link as RouterLink, Navigate, useParams } from 'react-router-dom';
import { Box, Link, Typography, useTheme } from '@mui/material';
import Seo from '../../components/Seo';
import PublicPageLayout from '../../components/public/PublicPageLayout';
import LandingSection from '../../components/public/LandingSection';
import LandingFaq from '../../components/public/LandingFaq';
import LandingCta from '../../components/public/LandingCta';
import { articleJsonLd } from '../../utils/seoSchema';
import { getArticle } from '../../content/poradna/articles';
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

  return (
    <PublicPageLayout darkMode={darkMode} onToggleTheme={onToggleTheme}>
      <Seo {...articleSeo(article)} />

      <Typography variant="body2" sx={{ mb: theme.spacing(2) }}>
        <Link component={RouterLink} to="/poradna" underline="hover">
          Poradňa
        </Link>
      </Typography>

      <Typography variant="h3" component="h1" sx={{ mb: theme.spacing(2) }}>
        {article.title}
      </Typography>
      <Typography
        variant="h6"
        component="p"
        color="text.secondary"
        sx={{ mb: theme.spacing(4), fontWeight: 400 }}
      >
        {article.intro}
      </Typography>

      {article.sections.map((section, i) => (
        <LandingSection key={i} title={section.heading}>
          {section.paragraphs.map((p, j) => (
            <Typography key={j} variant="body1" color="text.secondary" sx={{ mb: theme.spacing(1.5) }}>
              {p}
            </Typography>
          ))}
        </LandingSection>
      ))}

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
        <Box sx={{ mt: theme.spacing(4) }}>
          <Typography variant="h6" component="h2" sx={{ mb: theme.spacing(1) }}>
            Súvisiace články
          </Typography>
          {related.map((a) => (
            <Typography key={a.slug} variant="body2" sx={{ mb: theme.spacing(0.5) }}>
              <Link component={RouterLink} to={`/poradna/${a.slug}`} underline="hover">
                {a.title}
              </Link>
            </Typography>
          ))}
        </Box>
      )}
    </PublicPageLayout>
  );
}
