import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { Box, Chip, Stack, Typography } from '@mui/material';
import ArticleNotFound from '../components/content/ArticleNotFound';
import ArticleRelatedLinks from '../components/content/ArticleRelatedLinks';
import ArticleShell from '../components/content/ArticleShell';
import ArticleSources from '../components/content/ArticleSources';
import PublicContentHeader from '../components/content/PublicContentHeader';
import VerdictBadge from '../components/content/VerdictBadge';
import LandingFooter from '../components/landing/LandingFooter';
import Seo from '../components/Seo';
import { buildFoodSafetyPath, getFoodSafetyArticleByPath } from '../content/foodSafety';
import { resolveRelatedLinks } from '../content/relatedContent';

interface Props {
  darkMode: boolean;
  onToggleTheme: () => void;
}

export default function FoodSafetyArticlePage({ darkMode, onToggleTheme }: Props) {
  const location = useLocation();
  const article = getFoodSafetyArticleByPath(location.pathname);

  const jsonLd = useMemo(() => {
    if (!article) return undefined;
    return {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: article.title,
          acceptedAnswer: {
            '@type': 'Answer',
            text: article.explanation,
          },
        },
      ],
    };
  }, [article]);

  if (!article) {
    return (
      <ArticleNotFound
        darkMode={darkMode}
        onToggleTheme={onToggleTheme}
        backHref="/moze-pes-jest"
        backLabel="Späť na zoznam potravín"
        hubLabel="Zoznam potravín"
      />
    );
  }

  const relatedLinks = resolveRelatedLinks(article.relatedPaths);
  const path = buildFoodSafetyPath(article);

  return (
    <>
      <Seo
        title={`${article.title} — Pawly`}
        description={article.metaDescription}
        path={path}
        jsonLd={jsonLd}
      />
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <PublicContentHeader darkMode={darkMode} onToggleTheme={onToggleTheme} />
        <ArticleShell backHref="/moze-pes-jest" backLabel="Späť na zoznam potravín">
          <VerdictBadge verdict={article.verdict} />
          <Typography variant="h3" sx={{ fontWeight: 800, mt: 2, mb: 2 }}>
            {article.title}
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            {article.shortAnswer}
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3 }}>
            {article.explanation}
          </Typography>

          {article.warnings && article.warnings.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                Na čo si dať pozor
              </Typography>
              <Stack component="ul" spacing={0.75} sx={{ pl: 2.5, m: 0 }}>
                {article.warnings.map((w, i) => (
                  <Typography
                    key={i}
                    component="li"
                    variant="body2"
                    sx={{ color: 'text.secondary' }}
                  >
                    {w}
                  </Typography>
                ))}
              </Stack>
            </Box>
          )}

          {article.alternatives && article.alternatives.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                Bezpečné alternatívy
              </Typography>
              <Stack direction="row" gap={0.75} flexWrap="wrap">
                {article.alternatives.map((a, i) => (
                  <Chip key={i} label={a} variant="outlined" />
                ))}
              </Stack>
            </Box>
          )}

          <ArticleSources sources={article.sources} lastReviewed={article.lastReviewed} />
          <ArticleRelatedLinks links={relatedLinks} />
        </ArticleShell>
      </Box>
      <LandingFooter />
    </>
  );
}
