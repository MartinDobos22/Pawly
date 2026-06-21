import { Link as RouterLink } from 'react-router-dom';
import { Box, Card, CardActionArea, Link, Typography, useTheme } from '@mui/material';
import Seo from '../../components/Seo';
import PublicPageLayout from '../../components/public/PublicPageLayout';
import { collectionJsonLd } from '../../utils/seoSchema';
import { articles, articlesByCategory } from '../../content/poradna/articles';
import type { ArticleCategory } from '../../content/poradna/types';

interface Props {
  darkMode: boolean;
  onToggleTheme: () => void;
}

const CATEGORY_LABELS: Record<ArticleCategory, string> = {
  krmivo: 'Krmivo a výživa',
  zdravie: 'Zdravie a prevencia',
};

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

export default function PoradnaIndexPage({ darkMode, onToggleTheme }: Props) {
  const theme = useTheme();
  const byCategory = articlesByCategory();

  return (
    <PublicPageLayout darkMode={darkMode} onToggleTheme={onToggleTheme}>
      <Seo {...seo} />

      <Typography variant="h3" component="h1" sx={{ mb: theme.spacing(2) }}>
        Poradňa
      </Typography>
      <Typography
        variant="h6"
        component="p"
        color="text.secondary"
        sx={{ mb: theme.spacing(4), fontWeight: 400 }}
      >
        Praktické rady o krmive, zdraví a prevencii — aby si sa o svojho psa staral s istotou.
      </Typography>

      {(Object.keys(byCategory) as ArticleCategory[]).map((category) => {
        const list = byCategory[category];
        if (list.length === 0) return null;
        return (
          <Box component="section" key={category} sx={{ mb: theme.spacing(4) }}>
            <Typography variant="h5" component="h2" sx={{ mb: theme.spacing(2) }}>
              {CATEGORY_LABELS[category]}
            </Typography>
            <Box sx={{ display: 'grid', gap: theme.spacing(2) }}>
              {list.map((article) => (
                <Card key={article.slug}>
                  <CardActionArea
                    component={RouterLink}
                    to={`/poradna/${article.slug}`}
                    sx={{ p: theme.spacing(2.5) }}
                  >
                    <Typography variant="h6" component="h3" sx={{ mb: theme.spacing(0.5) }}>
                      {article.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {article.description}
                    </Typography>
                  </CardActionArea>
                </Card>
              ))}
            </Box>
          </Box>
        );
      })}

      <Box sx={{ mt: theme.spacing(2) }}>
        <Typography variant="body2" color="text.secondary">
          Späť na{' '}
          <Link component={RouterLink} to="/" underline="hover">
            úvod
          </Link>
          .
        </Typography>
      </Box>
    </PublicPageLayout>
  );
}
