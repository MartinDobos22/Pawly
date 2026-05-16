import { useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  Link,
  MenuItem,
  Select,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import {
  Science as ScienceIcon,
  Save as SaveIcon,
  PhotoCamera as PhotoCameraIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAnalyze } from '../hooks/useAnalyze';
import { useLocalStorage } from '../hooks/useLocalStorage';
import ScoreCard from '../components/ScoreCard';
import ProsConsCard from '../components/ProsConsCard';
import RecommendationChip from '../components/RecommendationChip';
import AllergenWarningBanner from '../components/AllergenWarningBanner';
import PersonalizedVerdictCard from '../components/PersonalizedVerdictCard';
import {
  MAX_FILE_SIZE_BYTES,
  SUPPORTED_FILE_TYPES,
} from '../components/healthPassport/constants';
import type { SavedAnalysis, PetProfile } from '../types';

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

export default function AnalyzePage() {
  const [composition, setComposition] = useState('');
  const [sourceLabel, setSourceLabel] = useState('Ručne vložené zloženie');
  const {
    analyze,
    extractTextOnly,
    result,
    loadingText,
    extractingText,
    error,
    extractError,
  } = useAnalyze();
  const [profiles] = useLocalStorage<PetProfile[]>('granule-check-pet-profiles', []);
  const [, setSavedAnalyses] = useLocalStorage<SavedAnalysis[]>('granule-check-history', []);
  const [selectedProfileId, setSelectedProfileId] = useState<string>('');
  const [snackOpen, setSnackOpen] = useState(false);
  const [scanInfo, setScanInfo] = useState<string | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const navigate = useNavigate();

  const selectedProfile = profiles.find((p) => p.id === selectedProfileId);
  const displayResult = result ?? null;

  const handleAnalyze = () => {
    if (composition.trim()) {
      setSourceLabel('Ručne vložené zloženie');
      analyze(composition.trim(), selectedProfile);
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
      petProfileId: selectedProfile?.id,
      petProfileName: selectedProfile?.name,
    };
    setSavedAnalyses((prev) => [entry, ...prev]);
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

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
        Analyzuj krmivo
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Vlož zloženie krmiva ako text alebo vyfoť obal — AI vyhodnotí kvalitu, riziká alergénov
        a odporúčanie pre psa.
      </Typography>

      {profiles.length > 0 ? (
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Analyzovať pre</InputLabel>
          <Select
            value={selectedProfileId}
            label="Analyzovať pre"
            onChange={(e) => setSelectedProfileId(e.target.value)}
          >
            <MenuItem value="">Bez profilu</MenuItem>
            {profiles.map((p) => (
              <MenuItem key={p.id} value={p.id}>
                {p.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      ) : (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          <Link
            component="button"
            variant="body2"
            onClick={() => navigate('/profily')}
            sx={{ cursor: 'pointer' }}
          >
            Pridaj profil zvieraťa pre personalizovanú analýzu →
          </Link>
        </Typography>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,application/pdf"
        capture="environment"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      <Stack direction="row" gap={1} sx={{ mb: 1.5 }}>
        <Button
          variant="outlined"
          startIcon={
            extractingText ? <CircularProgress size={18} color="inherit" /> : <PhotoCameraIcon />
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
        <Alert
          severity="error"
          onClose={() => {
            setScanError(null);
          }}
          sx={{ mb: 2 }}
        >
          {scanError ?? extractError}
        </Alert>
      )}

      <TextField
        fullWidth
        multiline
        minRows={4}
        maxRows={10}
        placeholder="Vlož zloženie krmiva alebo naskenuj obal..."
        value={composition}
        onChange={(e) => setComposition(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={busy}
        sx={{ mb: 2 }}
      />

      <Button
        variant="contained"
        size="large"
        fullWidth
        startIcon={loadingText ? <CircularProgress size={20} color="inherit" /> : <ScienceIcon />}
        onClick={handleAnalyze}
        disabled={busy || !composition.trim()}
        sx={{ mb: 3, py: 1.5, fontSize: '1rem' }}
      >
        {loadingText ? 'Analyzujem text...' : 'Analyzovať text'}
      </Button>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}>
          {error}
        </Alert>
      )}

      {displayResult && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
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

      <Snackbar
        open={snackOpen}
        autoHideDuration={3000}
        onClose={() => setSnackOpen(false)}
        message="Hodnotenie bolo uložené"
      />
    </Box>
  );
}
