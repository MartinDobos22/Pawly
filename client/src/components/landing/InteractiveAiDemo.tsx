import { useState, type KeyboardEvent } from 'react';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Stack,
  TextField,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import {
  ArrowForward as ArrowIcon,
  CheckCircle as SafeIcon,
  ErrorOutline as UnsafeIcon,
  HelpOutline as QAIcon,
  Search as SearchIcon,
  WarningAmber as CautionIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

type Verdict = 'SAFE' | 'CAUTION' | 'UNSAFE';

interface MockResponse {
  verdict: Verdict;
  short: string;
  explanation: string;
  alternatives?: string[];
  warnings?: string[];
}

const RESPONSES: Record<string, MockResponse> = {
  čokoláda: {
    verdict: 'UNSAFE',
    short: 'Nie, čokoláda je pre psa toxická.',
    explanation:
      'Obsahuje teobromín, ktorý je pre psov toxický a môže spôsobiť vracanie, triašku, kŕče alebo zlyhanie srdca.',
    alternatives: ['psie pamlsky', 'kúsok jablka', 'mrkva'],
  },
  hrozno: {
    verdict: 'UNSAFE',
    short: 'Nie, hrozno môže spôsobiť zlyhanie obličiek.',
    explanation:
      'Aj malé množstvo hrozna alebo hrozienok môže u psov spôsobiť akútne zlyhanie obličiek.',
    alternatives: ['čučoriedky', 'jablko bez jadierok', 'banán'],
  },
  cibuľa: {
    verdict: 'UNSAFE',
    short: 'Nie, cibuľa poškodzuje červené krvinky.',
    explanation:
      'Cibuľa, cesnak a pažítka obsahujú tioskloridy, ktoré rozkladajú červené krvinky a môžu spôsobiť anémiu.',
    alternatives: ['varené mäso bez korenia'],
  },
  xylitol: {
    verdict: 'UNSAFE',
    short: 'Nie, xylitol je extrémne nebezpečný.',
    explanation:
      'Sladidlo xylitol prudko znižuje hladinu cukru v krvi a môže spôsobiť zlyhanie pečene už pri malých dávkach.',
    alternatives: ['psie pamlsky bez sladidiel'],
  },
  mrkva: {
    verdict: 'SAFE',
    short: 'Áno, mrkva je výborný snack.',
    explanation:
      'Mrkva je nízkokalorická, obsahuje vlákninu a betakarotén. Surová slúži aj na čistenie zubov.',
  },
  jablko: {
    verdict: 'CAUTION',
    short: 'Áno, ale bez jadierok a stopky.',
    explanation:
      'Jablko je zdravé a chutné, ale jadierka obsahujú stopy kyanidu. Daj len mäsité kúsky.',
    warnings: ['Odstráň jadierka a stopku', 'V miernych množstvách'],
  },
  banán: {
    verdict: 'SAFE',
    short: 'Áno, banán je v poriadku.',
    explanation:
      'Bohatý na draslík a vitamíny. Daj len v miernych množstvách kvôli vysokému obsahu cukru.',
  },
  'kuracie kosti': {
    verdict: 'CAUTION',
    short: 'Záleží na úprave — varené nikdy nedávaj.',
    explanation:
      'Varené kosti sa štiepia a môžu poraniť tráviaci trakt. Surové veľké kosti sú prijateľné pod dozorom.',
    warnings: ['Varené kosti môžu poraniť trávenie', 'Iba surové a väčšie kosti pod dozorom'],
  },
  mlieko: {
    verdict: 'CAUTION',
    short: 'Mnoho psov má intoleranciu laktózy.',
    explanation:
      'Niektoré psy strávia mlieko bez problému, iné dostanú hnačku. Vyskúšaj malé množstvo a sleduj reakciu.',
    warnings: ['Sleduj prípadné tráviace ťažkosti', 'Bezlaktózové verzie sú lepšie'],
  },
  syr: {
    verdict: 'CAUTION',
    short: 'V malých množstvách áno.',
    explanation: 'Tvrdé syry s nízkym obsahom laktózy sú OK ako pamlsky. Pozor na obsah soli.',
    warnings: ['Pozor na soľ', 'Nie pre psy s alergiou na mliečne produkty'],
  },
  avokádo: {
    verdict: 'UNSAFE',
    short: 'Nie, avokádo obsahuje persín.',
    explanation:
      'Persín v avokáde môže spôsobiť tráviace ťažkosti a vracanie. Kôstka je aj rizikom udusenia.',
    alternatives: ['banán', 'mrkva', 'jablko bez jadierok'],
  },
  losos: {
    verdict: 'SAFE',
    short: 'Áno, ale len varený a bez kostí.',
    explanation: 'Losos je výborný zdroj omega-3 mastných kyselín. Surový môže obsahovať parazity.',
  },
};

const QUICK_FILLS = ['čokoláda', 'mrkva', 'hrozno', 'kuracie kosti'];

const FALLBACK: MockResponse = {
  verdict: 'CAUTION',
  short: 'Bez plnej AI to neviem spoľahlivo posúdiť.',
  explanation:
    'Toto je len demo s obmedzeným zoznamom potravín. Pre presné vyhodnotenie použi skutočnú AI v aplikácii.',
  warnings: ['Pred podaním novej potraviny sa poraď s veterinárom'],
};

const VERDICT_ICONS: Record<Verdict, { icon: typeof SafeIcon; toneKey: 'success' | 'warning' | 'error' }> = {
  SAFE: { icon: SafeIcon, toneKey: 'success' },
  CAUTION: { icon: CautionIcon, toneKey: 'warning' },
  UNSAFE: { icon: UnsafeIcon, toneKey: 'error' },
};

export default function InteractiveAiDemo() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { t } = useTranslation('landing');
  const { t: tAnalyze } = useTranslation('analyze');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ query: string; data: MockResponse } | null>(null);

  const handleAsk = (raw?: string) => {
    const q = (raw ?? query).trim();
    if (!q || loading) return;
    setQuery(q);
    setLoading(true);
    setResult(null);
    setTimeout(() => {
      const key = q.toLowerCase();
      const matched = Object.keys(RESPONSES).find((k) => key.includes(k));
      const data = matched ? RESPONSES[matched] : FALLBACK;
      setResult({ query: q, data });
      setLoading(false);
    }, 380);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAsk();
    }
  };

  const renderResult = (entry: { query: string; data: MockResponse }) => {
    const meta = VERDICT_ICONS[entry.data.verdict];
    const verdictLabel = tAnalyze(`foodSafety.verdicts.${entry.data.verdict}` as never);
    const Icon = meta.icon;
    const tone = theme.palette[meta.toneKey].main;
    return (
      <Box
        sx={{
          mt: 3,
          p: { xs: 2, md: 2.5 },
          borderRadius: 4,
          bgcolor: alpha(tone, theme.palette.mode === 'light' ? 0.08 : 0.16),
          border: `1px solid ${alpha(tone, 0.35)}`,
          animation: 'demo-fade-in 350ms ease',
          '@keyframes demo-fade-in': {
            from: { opacity: 0, transform: 'translateY(12px)' },
            to: { opacity: 1, transform: 'translateY(0)' },
          },
        }}
      >
        <Stack direction="row" alignItems="flex-start" gap={1.5}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              bgcolor: alpha(tone, 0.2),
              color: tone,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Icon />
          </Box>
          <Stack sx={{ flex: 1, minWidth: 0 }} spacing={0.75}>
            <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
              <Chip
                size="small"
                label={verdictLabel}
                sx={{
                  bgcolor: tone,
                  color: meta.toneKey === 'warning' ? theme.palette.warning.contrastText : '#fff',
                  fontWeight: 700,
                  height: 24,
                  fontSize: '0.7rem',
                }}
              />
              <Typography
                variant="caption"
                sx={{
                  color: 'text.secondary',
                  textTransform: 'none',
                  letterSpacing: 0,
                  fontStyle: 'italic',
                }}
              >
                Otázka: {entry.query}
              </Typography>
            </Stack>
            <Typography variant="h3" sx={{ fontSize: '1.1rem', fontWeight: 700 }}>
              {entry.data.short}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {entry.data.explanation}
            </Typography>
            {entry.data.warnings && (
              <Box sx={{ mt: 0.5 }}>
                <Typography
                  variant="caption"
                  sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}
                >
                  Pozor na:
                </Typography>
                <Stack component="ul" sx={{ pl: 2.25, m: 0 }} spacing={0.25}>
                  {entry.data.warnings.map((w, i) => (
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
            {entry.data.alternatives && (
              <Box sx={{ mt: 0.5 }}>
                <Typography
                  variant="caption"
                  sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}
                >
                  Alternatívy:
                </Typography>
                <Stack direction="row" gap={0.5} flexWrap="wrap">
                  {entry.data.alternatives.map((a, i) => (
                    <Chip
                      key={i}
                      label={a}
                      size="small"
                      variant="outlined"
                      sx={{ fontWeight: 500 }}
                    />
                  ))}
                </Stack>
              </Box>
            )}
          </Stack>
        </Stack>
      </Box>
    );
  };

  return (
    <Box sx={{ py: { xs: 8, md: 14 } }}>
      <Box sx={{ maxWidth: 880, mx: 'auto', px: { xs: 2.5, md: 4 } }}>
        <Stack alignItems="center" spacing={2} sx={{ mb: { xs: 4, md: 6 }, textAlign: 'center' }}>
          <Stack direction="row" alignItems="center" gap={1}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.primary.main, 0.12),
                color: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <QAIcon sx={{ fontSize: 20 }} />
            </Box>
            <Typography
              variant="caption"
              sx={{ color: 'primary.main', fontWeight: 700, letterSpacing: '0.12em' }}
            >
              {t('demo.badge')}
            </Typography>
          </Stack>
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: '2rem', md: '3rem' },
              fontWeight: 700,
              letterSpacing: '-0.025em',
              lineHeight: 1.1,
            }}
          >
            {t('demo.title')}
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: 'text.secondary',
              maxWidth: 540,
              fontSize: { xs: '1rem', md: '1.1rem' },
            }}
          >
            {t('demo.subtitle')}
          </Typography>
        </Stack>

        <Box
          sx={{
            p: { xs: 2, md: 3 },
            borderRadius: 5,
            bgcolor: alpha(theme.palette.background.paper, 0.6),
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: `1px solid ${theme.palette.divider}`,
            boxShadow: `0 20px 50px ${alpha(theme.palette.primary.main, 0.08)}`,
          }}
        >
          <Stack direction="row" gap={1} alignItems="stretch">
            <TextField
              fullWidth
              size="medium"
              placeholder={t('demo.placeholder')}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              InputProps={{
                sx: { borderRadius: 3, bgcolor: 'background.paper' },
                startAdornment: (
                  <SearchIcon sx={{ fontSize: 22, color: 'text.secondary', mr: 1 }} />
                ),
              }}
            />
            <Button
              variant="contained"
              size="large"
              onClick={() => handleAsk()}
              disabled={loading || !query.trim()}
              sx={{ minWidth: 130, flexShrink: 0, fontSize: '1rem' }}
              startIcon={loading ? <CircularProgress size={18} color="inherit" /> : null}
            >
              {loading ? t('demo.askingBtn') : t('demo.askBtn')}
            </Button>
          </Stack>

          <Stack direction="row" gap={1} flexWrap="wrap" sx={{ mt: 1.5 }}>
            <Typography
              variant="caption"
              sx={{
                color: 'text.disabled',
                alignSelf: 'center',
                textTransform: 'none',
                letterSpacing: 0,
                mr: 0.5,
              }}
            >
              {t('demo.tryLabel')}
            </Typography>
            {QUICK_FILLS.map((q) => (
              <Chip
                key={q}
                label={q}
                size="small"
                clickable
                variant="outlined"
                onClick={() => handleAsk(q)}
                sx={{ fontWeight: 500 }}
              />
            ))}
          </Stack>

          {result && renderResult(result)}
        </Box>

        <Stack alignItems="center" sx={{ mt: 3 }}>
          <Button
            variant="text"
            endIcon={<ArrowIcon />}
            onClick={() => navigate('/analyza')}
            sx={{ color: 'primary.main' }}
          >
            {t('demo.continueBtn')}
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}
