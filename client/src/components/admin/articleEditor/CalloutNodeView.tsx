import {
  Box,
  IconButton,
  MenuItem,
  Select,
  Stack,
  TextField,
  Tooltip,
  useTheme,
} from '@mui/material';
import {
  LightbulbOutlined as TipIcon,
  WarningAmberOutlined as WarningIcon,
  InfoOutlined as InfoIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { NodeViewContent, NodeViewWrapper, type NodeViewProps } from '@tiptap/react';
import type { CalloutVariant } from '../../../content/poradna/types';

const CONFIG: Record<
  CalloutVariant,
  { color: 'success' | 'error' | 'info'; icon: typeof TipIcon; label: string }
> = {
  tip: { color: 'success', icon: TipIcon, label: 'Tip' },
  warning: { color: 'error', icon: WarningIcon, label: 'Pozor' },
  info: { color: 'info', icon: InfoIcon, label: 'Zaujímavosť' },
};

export default function CalloutNodeView({ node, updateAttributes, deleteNode }: NodeViewProps) {
  const theme = useTheme();
  const variant = (node.attrs.variant as CalloutVariant) ?? 'tip';
  const title = (node.attrs.title as string) ?? '';
  const { color, icon: Icon } = CONFIG[variant];
  const accent = theme.palette[color].main;

  return (
    <NodeViewWrapper>
      <Box
        sx={{
          my: theme.spacing(2),
          p: theme.spacing(2),
          borderRadius: `${theme.shape.borderRadius}px`,
          borderLeft: `4px solid ${accent}`,
          bgcolor: theme.palette.action.hover,
        }}
      >
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          sx={{ mb: theme.spacing(1.5) }}
          contentEditable={false}
        >
          <Icon sx={{ color: accent, fontSize: theme.typography.h6.fontSize }} />
          <Select
            value={variant}
            onChange={(e) => updateAttributes({ variant: e.target.value as CalloutVariant })}
            size="small"
            variant="standard"
            sx={{ color: accent, '& .MuiSelect-select': { py: 0 } }}
          >
            {(Object.keys(CONFIG) as CalloutVariant[]).map((key) => (
              <MenuItem key={key} value={key}>
                {CONFIG[key].label}
              </MenuItem>
            ))}
          </Select>
          <TextField
            value={title}
            onChange={(e) => updateAttributes({ title: e.target.value })}
            placeholder="Vlastný titulok (voliteľné)"
            size="small"
            variant="standard"
            sx={{ flexGrow: 1 }}
          />
          <Tooltip title="Zmazať box">
            <IconButton size="small" aria-label="Zmazať box" onClick={deleteNode}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
        <Box component={NodeViewContent} sx={{ lineHeight: 1.8, '& p': { m: 0 } }} />
      </Box>
    </NodeViewWrapper>
  );
}
