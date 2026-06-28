import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  IconButton,
  Skeleton,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Delete as DeleteIcon,
  HistoryToggleOff as EmptyIcon,
  History as HistoryIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useHealthData } from '../hooks/useHealthData';
import ScoreCard from '../components/ScoreCard';
import ProsConsCard from '../components/ProsConsCard';
import RecommendationChip from '../components/RecommendationChip';
import EmptyState from '../components/EmptyState';
import FeatureIntro from '../components/FeatureIntro';
import PageContainer from '../components/ui/PageContainer';
import PageHeader from '../components/ui/PageHeader';
import { scoreColor } from '../utils/scoreColor';

export default function HistoryPage() {
  const { t } = useTranslation('analyze');
  const { savedAnalyses, removeSavedAnalysis, clearSavedAnalyses, loading } = useHealthData();
  const [expanded, setExpanded] = useState<string | false>(false);
  const theme = useTheme();
  const navigate = useNavigate();

  const handleDelete = (id: string) => {
    void removeSavedAnalysis(id);
    if (expanded === id) setExpanded(false);
  };

  const handleClearAll = () => {
    void clearSavedAnalyses();
    setExpanded(false);
  };

  const { i18n } = useTranslation();
  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString(i18n.language === 'en' ? 'en-GB' : 'sk-SK', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading && savedAnalyses.length === 0) {
    return (
      <PageContainer>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Skeleton variant="text" width={180} height={40} />
          <Skeleton variant="rounded" width={88} height={28} />
        </Box>
        <Stack spacing={1.5}>
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} variant="rounded" height={64} />
          ))}
        </Stack>
      </PageContainer>
    );
  }

  if (savedAnalyses.length === 0) {
    return (
      <Box sx={{ pt: 4 }}>
        <EmptyState
          icon={<EmptyIcon />}
          title={t('history.emptyTitle')}
          description={t('history.emptyDescription')}
          primaryAction={{ label: t('history.runAnalysis'), onClick: () => navigate('/analyza') }}
        />
      </Box>
    );
  }

  return (
    <PageContainer>
      <FeatureIntro featureKey="history" icon={<HistoryIcon />} />
      <PageHeader
        icon={<HistoryIcon />}
        title={t('history.title')}
        action={
          <Button size="small" color="error" onClick={handleClearAll}>
            {t('actions.clearAll', { ns: 'common' })}
          </Button>
        }
      />

      {savedAnalyses.map((item) => (
        <Accordion
          key={item.id}
          expanded={expanded === item.id}
          onChange={(_e, isExpanded) => setExpanded(isExpanded ? item.id : false)}
          sx={{
            mb: 1.5,
            borderRadius: '8px !important',
            '&:before': { display: 'none' },
            boxShadow: theme.shadows[1],
          }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1, mr: 1 }}>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  flexShrink: 0,
                  color: 'common.white',
                  backgroundColor: scoreColor(item.result.score, theme),
                }}
              >
                {item.result.score}
              </Box>
              <Box sx={{ flex: 1, overflow: 'hidden' }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                  {formatDate(item.date)}
                </Typography>
                <Typography variant="body2" noWrap>
                  {item.composition.slice(0, 80)}
                  {item.composition.length > 80 ? '...' : ''}
                </Typography>
              </Box>
              <IconButton
                component="span"
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(item.id);
                }}
                sx={{ color: 'text.secondary' }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 0 }}>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontStyle: 'italic', whiteSpace: 'pre-wrap' }}
            >
              {item.composition}
            </Typography>
            <ScoreCard score={item.result.score} summary={item.result.summary} />
            <ProsConsCard pros={item.result.pros} cons={item.result.cons} />
            <RecommendationChip recommendation={item.result.recommendation} />
          </AccordionDetails>
        </Accordion>
      ))}
    </PageContainer>
  );
}
