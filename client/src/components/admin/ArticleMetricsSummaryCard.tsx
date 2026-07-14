import { Box, Card, CardContent, Typography, useTheme } from '@mui/material';
import { InsightsOutlined as InsightsIcon } from '@mui/icons-material';
import SectionCardHeader from '../ui/SectionCardHeader';
import { metricsPeriodLabel } from '../../utils/articleMetricsPeriod';
import type { ArticleMetricsPeriod, ArticleMetricsSummary } from '../../content/poradna/types';

interface Props {
  summary: ArticleMetricsSummary;
  period: ArticleMetricsPeriod;
  /** Celkový počet článkov (nie len tie s návštevami). */
  totalArticles: number;
}

interface TileProps {
  label: string;
  value: string;
  hint?: string;
}

function Tile({ label, value, hint }: TileProps) {
  const theme = useTheme();
  return (
    <Box
      sx={{
        flex: '1 1 0',
        minWidth: theme.spacing(14),
        p: theme.spacing(1.5),
        borderRadius: 1.5,
        bgcolor: 'action.hover',
      }}
    >
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
        {label}
      </Typography>
      <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.3 }}>
        {value}
      </Typography>
      {hint && (
        <Typography variant="caption" color="text.secondary">
          {hint}
        </Typography>
      )}
    </Box>
  );
}

export default function ArticleMetricsSummaryCard({ summary, period, totalArticles }: Props) {
  const theme = useTheme();
  const pct = (n: number) => `${(n * 100).toFixed(1)} %`;

  return (
    <Card sx={{ borderRadius: 2 }}>
      <CardContent>
        <SectionCardHeader
          icon={<InsightsIcon />}
          accent={theme.palette.info.main}
          title={`Súhrn — všetky články (${metricsPeriodLabel(period).toLowerCase()})`}
        />
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: theme.spacing(1.5),
          }}
        >
          <Tile label="Zobrazenia" value={String(summary.views)} />
          <Tile label="CTA kliky" value={String(summary.ctaClicks)} />
          <Tile label="CTR" value={pct(summary.ctr)} hint="CTA / zobrazenia" />
          <Tile
            label="Miera dočítania"
            value={pct(summary.readThroughRate)}
            hint="dočítanie do 90 %"
          />
          <Tile label="Kliky na súvisiace" value={String(summary.relatedClicks)} />
          <Tile label="Kliky na zdroje" value={String(summary.sourceClicks)} />
          <Tile
            label="Články s návštevou"
            value={`${summary.articlesWithViews} / ${totalArticles}`}
          />
        </Box>
      </CardContent>
    </Card>
  );
}
