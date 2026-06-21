import {
  Box,
  Button,
  Card,
  CardContent,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import {
  Add as AddIcon,
  ArrowUpward as UpIcon,
  ArrowDownward as DownIcon,
  DeleteOutline as DeleteIcon,
} from '@mui/icons-material';
import type { ArticleSection, Block, CalloutVariant } from '../../content/poradna/types';

interface Props {
  value: ArticleSection[];
  onChange: (sections: ArticleSection[]) => void;
}

const BLOCK_LABELS: Record<Block['type'], string> = {
  paragraph: 'Odsek',
  subheading: 'Podnadpis (H3)',
  bullets: 'Odrážky',
  callout: 'Box (tip/pozor/info)',
};

const CALLOUT_OPTIONS: { value: CalloutVariant; label: string }[] = [
  { value: 'tip', label: 'Tip' },
  { value: 'warning', label: 'Pozor' },
  { value: 'info', label: 'Info' },
];

function move<T>(arr: T[], from: number, to: number): T[] {
  if (to < 0 || to >= arr.length) return arr;
  const copy = [...arr];
  const [item] = copy.splice(from, 1);
  copy.splice(to, 0, item);
  return copy;
}

function emptyBlock(type: Block['type']): Block {
  switch (type) {
    case 'paragraph':
      return { type: 'paragraph', text: '' };
    case 'subheading':
      return { type: 'subheading', text: '' };
    case 'bullets':
      return { type: 'bullets', items: [''] };
    case 'callout':
      return { type: 'callout', variant: 'tip', text: '' };
  }
}

export default function ArticleSectionsEditor({ value, onChange }: Props) {
  const theme = useTheme();

  const updateSection = (si: number, patch: Partial<ArticleSection>) => {
    onChange(value.map((s, i) => (i === si ? { ...s, ...patch } : s)));
  };

  const updateBlock = (si: number, bi: number, block: Block) => {
    const blocks = value[si].blocks.map((b, i) => (i === bi ? block : b));
    updateSection(si, { blocks });
  };

  const addBlock = (si: number, type: Block['type']) => {
    updateSection(si, { blocks: [...value[si].blocks, emptyBlock(type)] });
  };

  const removeBlock = (si: number, bi: number) => {
    updateSection(si, { blocks: value[si].blocks.filter((_, i) => i !== bi) });
  };

  const moveBlock = (si: number, bi: number, dir: -1 | 1) => {
    updateSection(si, { blocks: move(value[si].blocks, bi, bi + dir) });
  };

  const addSection = () => {
    onChange([...value, { heading: '', blocks: [{ type: 'paragraph', text: '' }] }]);
  };

  const removeSection = (si: number) => onChange(value.filter((_, i) => i !== si));
  const moveSection = (si: number, dir: -1 | 1) => onChange(move(value, si, si + dir));

  const renderBlock = (si: number, bi: number, block: Block) => {
    switch (block.type) {
      case 'paragraph':
        return (
          <TextField
            label="Odsek (podporuje **tučné** a [text](/odkaz))"
            value={block.text}
            onChange={(e) => updateBlock(si, bi, { ...block, text: e.target.value })}
            multiline
            minRows={2}
            fullWidth
            size="small"
          />
        );
      case 'subheading':
        return (
          <TextField
            label="Podnadpis (H3)"
            value={block.text}
            onChange={(e) => updateBlock(si, bi, { ...block, text: e.target.value })}
            fullWidth
            size="small"
          />
        );
      case 'bullets':
        return (
          <TextField
            label="Odrážky — jedna na riadok"
            value={block.items.join('\n')}
            onChange={(e) =>
              updateBlock(si, bi, {
                ...block,
                items: e.target.value.split('\n'),
              })
            }
            multiline
            minRows={3}
            fullWidth
            size="small"
          />
        );
      case 'callout':
        return (
          <Stack spacing={1}>
            <Stack direction="row" spacing={1}>
              <TextField
                select
                label="Typ"
                value={block.variant}
                onChange={(e) =>
                  updateBlock(si, bi, { ...block, variant: e.target.value as CalloutVariant })
                }
                size="small"
                sx={{ minWidth: theme.spacing(14) }}
              >
                {CALLOUT_OPTIONS.map((o) => (
                  <MenuItem key={o.value} value={o.value}>
                    {o.label}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Titulok (voliteľný)"
                value={block.title ?? ''}
                onChange={(e) => updateBlock(si, bi, { ...block, title: e.target.value })}
                size="small"
                fullWidth
              />
            </Stack>
            <TextField
              label="Text boxu"
              value={block.text}
              onChange={(e) => updateBlock(si, bi, { ...block, text: e.target.value })}
              multiline
              minRows={2}
              fullWidth
              size="small"
            />
          </Stack>
        );
    }
  };

  return (
    <Stack spacing={theme.spacing(0.25)}>
      {value.map((section, si) => (
        <Card key={si} variant="outlined">
          <CardContent>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: theme.spacing(1.5) }}>
              <TextField
                label={`Nadpis sekcie #${si + 1} (H2)`}
                value={section.heading}
                onChange={(e) => updateSection(si, { heading: e.target.value })}
                fullWidth
                size="small"
              />
              <Tooltip title="Posunúť hore">
                <span>
                  <IconButton onClick={() => moveSection(si, -1)} disabled={si === 0} size="small">
                    <UpIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip title="Posunúť dole">
                <span>
                  <IconButton
                    onClick={() => moveSection(si, 1)}
                    disabled={si === value.length - 1}
                    size="small"
                  >
                    <DownIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip title="Zmazať sekciu">
                <IconButton onClick={() => removeSection(si)} size="small" color="error">
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>

            <Stack spacing={theme.spacing(1.5)}>
              {section.blocks.map((block, bi) => (
                <Box
                  key={bi}
                  sx={{
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: theme.shape.borderRadius,
                    p: theme.spacing(1.5),
                  }}
                >
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    sx={{ mb: theme.spacing(1) }}
                  >
                    <Typography variant="caption" color="text.secondary" sx={{ flexGrow: 1 }}>
                      {BLOCK_LABELS[block.type]}
                    </Typography>
                    <IconButton onClick={() => moveBlock(si, bi, -1)} disabled={bi === 0} size="small">
                      <UpIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      onClick={() => moveBlock(si, bi, 1)}
                      disabled={bi === section.blocks.length - 1}
                      size="small"
                    >
                      <DownIcon fontSize="small" />
                    </IconButton>
                    <IconButton onClick={() => removeBlock(si, bi)} size="small" color="error">
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                  {renderBlock(si, bi, block)}
                </Box>
              ))}
            </Stack>

            <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: theme.spacing(1.5) }}>
              {(Object.keys(BLOCK_LABELS) as Block['type'][]).map((type) => (
                <Button
                  key={type}
                  onClick={() => addBlock(si, type)}
                  size="small"
                  startIcon={<AddIcon />}
                  variant="outlined"
                >
                  {BLOCK_LABELS[type]}
                </Button>
              ))}
            </Stack>
          </CardContent>
        </Card>
      ))}

      <Button onClick={addSection} startIcon={<AddIcon />} variant="contained" sx={{ alignSelf: 'flex-start' }}>
        Pridať sekciu
      </Button>
    </Stack>
  );
}
