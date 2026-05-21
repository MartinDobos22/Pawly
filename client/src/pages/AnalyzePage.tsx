import { useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Snackbar,
  Stack,
  TextField,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import {
  Science as ScienceIcon,
  Save as SaveIcon,
  PhotoCamera as PhotoCameraIcon,
  HelpOutline as QAIcon,
  History as HistoryIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import type { Theme } from '@mui/material/styles';
import { useAnalyze } from '../hooks/useAnalyze';
import { useActivePet } from '../hooks/useActivePet';
import { useLocalStorage } from '../hooks/useLocalStorage';
import AnalyzeHero from '../components/analyze/AnalyzeHero';
import ScoreCard from '../components/ScoreCard';
import ProsConsCard from '../components/ProsConsCard';
import RecommendationChip from '../components/RecommendationChip';
import AllergenWarningBanner from '../components/AllergenWarningBanner';
import PersonalizedVerdictCard from '../components/PersonalizedVerdictCard';
import { MAX_FILE_SIZE_BYTES, SUPPORTED_FILE_TYPES } from '../components/healthPassport/constants';
import { today, uid } from '../components/healthPassport/utils';
import { formatDateShort } from '../utils/relativeDate';
import type { AnalysisResult, SavedAnalysis } from '../types';
import type { DietEntry } from '../types/dogHealth';

function deriveSuitability(result: AnalysisResult): NonNullable<DietEntry['suitabilityStatus']> {
  const critical =
    (result.allergenWarnings ?? []).some((w) => w.severity === 'critical') ||
    (result.healthWarnings ?? []).some((w) => w.severity === 'critical');
  if (critical) return 'UNSUITABLE';
  const anyWarning =
    (result.allergenWarnings ?? []).length > 0 || (result.healthWarnings ?? []).length > 0;
  if (anyWarning) return 'RISKY';
  return 'SUITABLE';
}

const readFileAsBase64 = (file: File) =>
  new Promise<{ base64: string }>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const raw = typeof reader.result === 'string' ? reader.result : '';
      const base64 = raw.split(',')[1] ?? '';
      if (!base64) {
        reject(new Error('Nepodarilo sa načítať súbor.'));
        return;
      }
      resolve({ base64 });
    };
    reader.onerror = () => reject(new Error('Nepodarilo sa načítať súbor.'));
    reader.readAsDataURL(file);
  });

const scoreColor = (theme: Theme, score: number) => {
  if (score >= 70) return theme.palette.success.main;
  if (score >= 40) return theme.palette.warning.main;
  return theme.palette.error.main;
};

export default function AnalyzePage() {
  const theme = useTheme();
  const [composition, setComposition] = useState('');
  const [sourceLabel, setSourceLabel] = useState('Ručne vložené zloženie');
  const { analyze, extractTextOnly, result, loadingText, extractingText, error, extractError } =
    useAnalyze();
  const { activePet } = useActivePet();
  const [savedAnalyses, setSavedAnalyses] = useLocalStorage<SavedAnalysis[]>(
    'granule-check-history',
    []
  );
  const [, setDietEntries] = useLocalStorage<DietEntry[]>('dog-health-diet-entries', []);
  const [snackOpen, setSnackOpen] = useState(false);
  const [snackMessage, setSnackMessage] = useState('Hodnotenie bolo uložené');
  const [scanInfo, setScanInfo] = useState<string | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const navigate = useNavigate();

  const displayResult = result ?? null;

  const handleAnalyze = () => {
    if (composition.trim()) {
      setSourceLabel('Ručne vložené zloženie');
      analyze(composition.trim(), activePet ?? undefined);
    }
  };

  const handlePickFile = () => {
    setScanError(null);
    setScanInfo(null);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    if (!SUPPORTED_FILE_TYPES.includes(file.type)) {
      setScanError('Nepodporovaný typ súboru. Použi JPG, PNG, WebP alebo PDF.');
      return;
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setScanError('Súbor je príliš veľký (max 5 MB).');
      return;
    }

    try {
      const { base64 } = await readFileAsBase64(file);
      const extracted = await extractTextOnly({
        fileName: file.name,
        mimeType: file.type,
        base64Data: base64,
      });
      if (extracted) {
        setComposition(extracted);
        setSourceLabel(`Fotka obalu: ${file.name}`);
        setScanInfo('Text bol predvyplnený. Skontroluj ho a klikni Analyzovať.');
      }
    } catch (err) {
      setScanError(err instanceof Error ? err.message : 'Nepodarilo sa načítať súbor.');
    }
  };

  const handleSave = () => {
    if (!displayResult) return;
    const entry: SavedAnalysis = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
      date: new Date().toISOString(),
      composition: composition.trim() || sourceLabel,
      sourceLabel,
      result: displayResult,
      petProfileId: activePet?.id,
      petProfileName: activePet?.name,
    };
    setSavedAnalyses((prev) => [entry, ...prev]);

    if (activePet) {
      const suitability = deriveSuitability(displayResult);
      const dietEntry: DietEntry = {
        id: uid(),
        dogId: activePet.id,
        foodName: sourceLabel || 'Krmivo z analýzy',
        startedAt: today(),
        reactionNotes: displayResult.summary,
        suitabilityStatus: suitability,
        suitabilityReasons:
          suitability === 'SUITABLE'
            ? ['Bez zistených alergénov a zdravotných rizík']
            : (displayResult.recommendation?.notRecommendedFor ?? []),
      };
      setDietEntries((prev) => [dietEntry, ...prev]);
      setSnackMessage(`Hodnotenie uložené a pridané do Zdravotného pasu pre ${activePet.name}`);
    } else {
      setSnackMessage('Hodnotenie uložené');
    }
    setSnackOpen(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleAnalyze();
    }
  };

  const hasWarnings =
    displayResult &&
    ((displayResult.allergenWarnings && displayResult.allergenWarnings.length > 0) ||
      (displayResult.healthWarnings && displayResult.healthWarnings.length > 0));

  const busy = loadingText || extractingText;
  const recentAnalyses = savedAnalyses.slice(0, 3);

  return (
    <Box>
      <AnalyzeHero />

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '3fr 2fr' },
          gap: 2,
          mb: 3,
        }}
      >
        <Card sx={{ p: { xs: 2, md: 2.5 } }}>
          <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 1.5 }}>
            <ScienceIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Analyzuj kompozíciu
            </Typography>
          </Stack>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,application/pdf"
            capture="environment"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />

          <Stack direction="row" gap={1} sx={{ mb: 1.5 }} flexWrap="wrap">
            <Button
              variant="outlined"
              startIcon={
                extractingText ? (
                  <CircularProgress size={18} color="inherit" />
                ) : (
                  <PhotoCameraIcon />
                )
              }
              onClick={handlePickFile}
              disabled={busy}
            >
              {extractingText ? 'Načítavam text…' : 'Naskenovať obal'}
            </Button>
          </Stack>

          {scanInfo && (
            <Alert severity="success" onClose={() => setScanInfo(null)} sx={{ mb: 2 }}>
              {scanInfo}
            </Alert>
          )}
          {(scanError || extractError) && (
            <Alert severity="error" onClose={() => setScanError(null)} sx={{ mb: 2 }}>
              {scanError ?? extractError}
            </Alert>
          )}

          <TextField
            fullWidth
            multiline
            minRows={5}
            maxRows={12}
            placeholder="Vlož zloženie krmiva alebo naskenuj obal…"
            value={composition}
            onChange={(e) => setComposition(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={busy}
            sx={{ mb: 1.5 }}
          />

          <Button
            variant="contained"
            size="large"
            fullWidth
            startIcon={
              loadingText ? <CircularProgress size={20} color="inherit" /> : <ScienceIcon />
            }
            onClick={handleAnalyze}
            disabled={busy || !composition.trim()}
            sx={{ py: 1.25, fontSize: '0.95rem' }}
          >
            {loadingText ? 'Analyzujem…' : 'Analyzovať'}
          </Button>
          {!activePet && (
            <Typography
              variant="caption"
              sx={{
                display: 'block',
                mt: 1.5,
                color: 'text.secondary',
                textTransform: 'none',
                letterSpacing: 0,
              }}
            >
              Pridaj profil zvieraťa v sekcii{' '}
              <Box
                component="span"
                onClick={() => navigate('/profily')}
                sx={{ cursor: 'pointer', textDecoration: 'underline', color: 'primary.main' }}
              >
                Profily
              </Box>{' '}
              pre personalizované varovania o alergénoch.
            </Typography>
          )}
        </Card>

        <Card
          sx={{
            p: { xs: 2, md: 2.5 },
            borderStyle: 'dashed',
            bgcolor: alpha(
              theme.palette.primary.main,
              theme.palette.mode === 'light' ? 0.03 : 0.06
            ),
          }}
        >
          <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 1.5 }}>
            <QAIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Môže pes jesť…?
            </Typography>
          </Stack>
          <Stack alignItems="center" spacing={1.5} sx={{ py: 3, textAlign: 'center' }}>
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <QAIcon sx={{ fontSize: 28 }} />
            </Box>
            <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 280 }}>
              Rýchla otázka o jednej potravine alebo ingrediencii. AI odpovie či je bezpečná pre
              psa.
            </Typography>
            <Chip label="Pripravujeme" size="small" variant="outlined" />
          </Stack>
        </Card>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}>
          {error}
        </Alert>
      )}

      {displayResult && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mb: 3 }}>
          <Alert severity="info" sx={{ borderRadius: 3 }}>
            Zdroj analýzy: {sourceLabel}
          </Alert>

          {hasWarnings && (
            <AllergenWarningBanner
              allergenWarnings={displayResult.allergenWarnings ?? []}
              healthWarnings={displayResult.healthWarnings ?? []}
            />
          )}

          {displayResult.personalizedNote && (
            <PersonalizedVerdictCard note={displayResult.personalizedNote} />
          )}

          <ScoreCard score={displayResult.score} summary={displayResult.summary} />
          <ProsConsCard pros={displayResult.pros} cons={displayResult.cons} />
          <RecommendationChip recommendation={displayResult.recommendation} />

          <Button
            variant="outlined"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            sx={{ alignSelf: 'center', px: 4 }}
          >
            Uložiť hodnotenie
          </Button>
        </Box>
      )}

      <Card sx={{ p: { xs: 2, md: 2.5 } }}>
        <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 1.5 }}>
          <HistoryIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
          <Typography variant="caption" sx={{ color: 'text.secondary', flex: 1 }}>
            Posledné analýzy
          </Typography>
          {savedAnalyses.length > 0 && (
            <Button
              size="small"
              onClick={() => navigate('/historia')}
              sx={{ minHeight: 28, py: 0.25 }}
            >
              Pozrieť všetko
            </Button>
          )}
        </Stack>

        {recentAnalyses.length === 0 ? (
          <Stack alignItems="center" spacing={1} sx={{ py: 2.5, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Vykonaj prvú analýzu a uvidíš ju tu.
            </Typography>
          </Stack>
        ) : (
          <Stack spacing={1}>
            {recentAnalyses.map((entry) => (
              <Stack
                key={entry.id}
                direction="row"
                alignItems="center"
                gap={1.5}
                onClick={() => navigate('/historia')}
                sx={{
                  cursor: 'pointer',
                  px: 1.5,
                  py: 1,
                  borderRadius: 2,
                  border: `1px solid ${theme.palette.divider}`,
                  '&:hover': { bgcolor: 'action.hover' },
                }}
              >
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    bgcolor: alpha(scoreColor(theme, entry.result.score), 0.16),
                    color: scoreColor(theme, entry.result.score),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    flexShrink: 0,
                  }}
                >
                  {entry.result.score}
                </Box>
                <Stack sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                    {entry.sourceLabel || 'Analýza'}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: 'text.secondary', textTransform: 'none', letterSpacing: 0 }}
                  >
                    {formatDateShort(entry.date)}
                    {entry.petProfileName ? ` · ${entry.petProfileName}` : ''}
                  </Typography>
                </Stack>
              </Stack>
            ))}
          </Stack>
        )}
      </Card>

      <Snackbar
        open={snackOpen}
        autoHideDuration={3000}
        onClose={() => setSnackOpen(false)}
        message={snackMessage}
      />
    </Box>
  );
}
