import { Link as RouterLink } from 'react-router-dom';
import { Card, CardActionArea, Typography, useTheme } from '@mui/material';
import type { Article } from '../../content/poradna/types';

interface Props {
  article: Article;
}

export default function ArticleCard({ article }: Props) {
  const theme = useTheme();
  return (
    <Card>
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
  );
}
