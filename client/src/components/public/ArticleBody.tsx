import { Box, Typography, useTheme } from '@mui/material';
import Callout from './Callout';
import RichText from './RichText';
import { slugifyHeading } from '../../utils/slugifyHeading';
import type { ArticleSection } from '../../content/poradna/types';

interface Props {
  sections: ArticleSection[];
}

// Render tela článku (sekcie H2 + bloky). Zdieľané verejnou stránkou
// (PoradnaArticlePage) aj admin náhľadom, aby sa vzhľad nerozišiel.
export default function ArticleBody({ sections }: Props) {
  const theme = useTheme();

  return (
    <>
      {sections.map((section, i) => (
        <Box
          component="section"
          key={section.heading || i}
          sx={{ mt: i === 0 ? 0 : theme.spacing(5) }}
        >
          {section.heading.trim() && (
            <Typography
              variant="h5"
              component="h2"
              id={slugifyHeading(section.heading)}
              sx={{ mb: theme.spacing(2), scrollMarginTop: theme.spacing(10) }}
            >
              {section.heading}
            </Typography>
          )}
          {section.blocks.map((block, j) => {
            switch (block.type) {
              case 'paragraph':
                return (
                  <Typography
                    key={j}
                    variant="body1"
                    color="text.primary"
                    sx={{ mb: theme.spacing(2), lineHeight: 1.8, textAlign: block.align }}
                  >
                    <RichText text={block.text} />
                  </Typography>
                );
              case 'quote':
                return (
                  <Typography
                    key={j}
                    component="blockquote"
                    variant="body1"
                    color="text.secondary"
                    sx={{
                      my: theme.spacing(3),
                      ml: 0,
                      pl: theme.spacing(2.5),
                      borderLeft: `4px solid ${theme.palette.divider}`,
                      fontStyle: 'italic',
                      lineHeight: 1.8,
                    }}
                  >
                    <RichText text={block.text} />
                  </Typography>
                );
              case 'divider':
                return (
                  <Box
                    key={j}
                    component="hr"
                    sx={{
                      my: theme.spacing(4),
                      border: 0,
                      borderTop: `1px solid ${theme.palette.divider}`,
                    }}
                  />
                );
              case 'bullets':
                return (
                  <Typography
                    key={j}
                    component={block.ordered ? 'ol' : 'ul'}
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
                  <Callout key={j} variant={block.variant} title={block.title} text={block.text} />
                );
              case 'image':
                return (
                  <Box
                    key={j}
                    component="img"
                    src={block.src}
                    alt={block.alt ?? ''}
                    loading="lazy"
                    sx={{
                      display: 'block',
                      width: block.width ? `${block.width}%` : '100%',
                      maxWidth: '100%',
                      height: 'auto',
                      borderRadius: (t) => `${t.shape.borderRadius}px`,
                      my: 3,
                    }}
                  />
                );
              case 'gallery':
                return (
                  <Box
                    key={j}
                    sx={{
                      display: 'grid',
                      gap: 1.5,
                      gridTemplateColumns: {
                        xs: 'repeat(2, 1fr)',
                        sm: 'repeat(3, 1fr)',
                      },
                      my: 3,
                    }}
                  >
                    {block.images.map((img, k) => (
                      <Box
                        key={k}
                        component="img"
                        src={img.src}
                        alt={img.alt ?? ''}
                        loading="lazy"
                        sx={{
                          width: '100%',
                          aspectRatio: '1 / 1',
                          objectFit: 'cover',
                          borderRadius: (t) => `${t.shape.borderRadius}px`,
                          display: 'block',
                        }}
                      />
                    ))}
                  </Box>
                );
              default:
                return null;
            }
          })}
        </Box>
      ))}
    </>
  );
}
