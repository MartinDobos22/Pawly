import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { Box, Stack, Typography } from '@mui/material';
import ArticleNotFound from '../components/content/ArticleNotFound';
import ArticleRelatedLinks from '../components/content/ArticleRelatedLinks';
import ArticleShell from '../components/content/ArticleShell';
import ArticleSources from '../components/content/ArticleSources';
import PublicContentHeader from '../components/content/PublicContentHeader';
import LandingFooter from '../components/landing/LandingFooter';
import Seo from '../components/Seo';
import { buildGuidePath, getGuideArticleByPath } from '../content/guides';
import { resolveRelatedLinks } from '../content/relatedContent';

interface Props {
  darkMode: boolean;
  onToggleTheme: () => void;
}

export default function GuideArticlePage({ darkMode, onToggleTheme }: Props) {
  const location = useLocation();
  const article = getGuideArticleByPath(location.pathname);

  const jsonLd = useMemo(() => {
    if (!article) return undefined;
    return {
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      name: article.title,
      description: article.metaDescription,
      step: article.steps.map((step) => ({
        '@type': 'HowToStep',
        name: step.heading,
        text: step.body,
      })),
    };
  }, [article]);

  if (!article) {
    return (
      <ArticleNotFound
        darkMode={darkMode}
        onToggleTheme={onToggleTheme}
        backHref="/rady-pre-majitelov"
        backLabel="Späť na rady pre majiteľov"
        hubLabel="Rady pre majiteľov"
      />
    );
  }

  const relatedLinks = resolveRelatedLinks(article.relatedPaths);
  const path = buildGuidePath(article);

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
        <ArticleShell backHref="/rady-pre-majitelov" backLabel="Späť na rady pre majiteľov">
          <Typography variant="h3" sx={{ fontWeight: 800, mb: 2 }}>
            {article.title}
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3 }}>
            {article.intro}
          </Typography>

          <Stack component="ol" spacing={2.5} sx={{ pl: 2.5, m: 0, mb: 3 }}>
            {article.steps.map((step) => (
              <Box component="li" key={step.heading}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
                  {step.heading}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {step.body}
                </Typography>
              </Box>
            ))}
          </Stack>

          {article.warnings && article.warnings.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                Upozornenia
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

          <ArticleSources sources={article.sources} lastReviewed={article.lastReviewed} />
          <ArticleRelatedLinks links={relatedLinks} />
        </ArticleShell>
      </Box>
      <LandingFooter />
    </>
  );
}
