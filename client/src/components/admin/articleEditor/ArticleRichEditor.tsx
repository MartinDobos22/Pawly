import { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Paper,
  Stack,
  TextField,
  ToggleButton,
  Tooltip,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  FormatBold as BoldIcon,
  FormatItalic as ItalicIcon,
  FormatUnderlined as UnderlineIcon,
  StrikethroughS as StrikeIcon,
  FormatListBulleted as BulletsIcon,
  FormatListNumbered as NumberedIcon,
  InsertLink as LinkIcon,
  LinkOff as LinkOffIcon,
  TitleOutlined as SectionIcon,
  TextFieldsOutlined as SubheadingIcon,
  LightbulbOutlined as CalloutIcon,
  DragIndicator as DragIcon,
} from '@mui/icons-material';
import { useEditor, EditorContent, useEditorState, type Editor } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import { DragHandle } from '@tiptap/extension-drag-handle-react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { CalloutNode } from './CalloutNode';
import { sectionsToTiptap, tiptapToSections } from './articleTiptapBridge';
import type { ArticleSection } from '../../../content/poradna/types';

interface Props {
  value: ArticleSection[];
  onChange: (sections: ArticleSection[]) => void;
}

const EditorShell = styled(Box)(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: `${theme.shape.borderRadius}px`,
  '& .ProseMirror': {
    minHeight: theme.spacing(40),
    padding: theme.spacing(2),
    paddingLeft: theme.spacing(4),
    outline: 'none',
    lineHeight: 1.8,
  },
  '& .ProseMirror .is-editor-empty:first-of-type::before': {
    content: 'attr(data-placeholder)',
    color: theme.palette.text.disabled,
    float: 'left',
    height: 0,
    pointerEvents: 'none',
  },
  '& .ProseMirror:focus': {
    outline: 'none',
  },
  '& .ProseMirror h2': {
    ...theme.typography.h5,
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(1.5),
  },
  '& .ProseMirror h3': {
    ...theme.typography.h6,
    marginTop: theme.spacing(2.5),
    marginBottom: theme.spacing(1),
  },
  '& .ProseMirror p': {
    margin: `0 0 ${theme.spacing(1.5)}`,
  },
  '& .ProseMirror ul, & .ProseMirror ol': {
    paddingLeft: theme.spacing(3),
    marginBottom: theme.spacing(1.5),
  },
  '& .ProseMirror a': {
    color: theme.palette.primary.main,
  },
  '& .ProseMirror:first-of-type > :first-of-type': {
    marginTop: 0,
  },
}));

interface ToolbarProps {
  editor: Editor;
  onLinkRequest: () => void;
}

function Toolbar({ editor, onLinkRequest }: ToolbarProps) {
  const state = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      isH2: e.isActive('heading', { level: 2 }),
      isH3: e.isActive('heading', { level: 3 }),
      isBold: e.isActive('bold'),
      isItalic: e.isActive('italic'),
      isUnderline: e.isActive('underline'),
      isStrike: e.isActive('strike'),
      isBullets: e.isActive('bulletList'),
      isOrdered: e.isActive('orderedList'),
      isCallout: e.isActive('callout'),
      isLink: e.isActive('link'),
    }),
  });

  const toggleCallout = () => {
    if (state.isCallout) {
      editor.chain().focus().setParagraph().run();
    } else {
      editor.chain().focus().setCallout().run();
    }
  };

  return (
    <Stack
      direction="row"
      spacing={0.5}
      flexWrap="wrap"
      alignItems="center"
      sx={{
        p: (t) => t.spacing(0.75),
        borderBottom: (t) => `1px solid ${t.palette.divider}`,
        position: 'sticky',
        top: 0,
        zIndex: 1,
        bgcolor: 'background.paper',
        borderTopLeftRadius: (t) => `${t.shape.borderRadius}px`,
        borderTopRightRadius: (t) => `${t.shape.borderRadius}px`,
      }}
    >
      <Tooltip title="Nadpis sekcie (H2)">
        <ToggleButton
          value="h2"
          size="small"
          selected={state.isH2}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <SectionIcon fontSize="small" />
        </ToggleButton>
      </Tooltip>
      <Tooltip title="Podnadpis (H3)">
        <ToggleButton
          value="h3"
          size="small"
          selected={state.isH3}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          <SubheadingIcon fontSize="small" />
        </ToggleButton>
      </Tooltip>
      <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
      <Tooltip title="Tučné (Ctrl/Cmd+B)">
        <ToggleButton
          value="bold"
          size="small"
          selected={state.isBold}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <BoldIcon fontSize="small" />
        </ToggleButton>
      </Tooltip>
      <Tooltip title="Kurzíva (Ctrl/Cmd+I)">
        <ToggleButton
          value="italic"
          size="small"
          selected={state.isItalic}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <ItalicIcon fontSize="small" />
        </ToggleButton>
      </Tooltip>
      <Tooltip title="Podčiarknuté (Ctrl/Cmd+U)">
        <ToggleButton
          value="underline"
          size="small"
          selected={state.isUnderline}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <UnderlineIcon fontSize="small" />
        </ToggleButton>
      </Tooltip>
      <Tooltip title="Prečiarknuté">
        <ToggleButton
          value="strike"
          size="small"
          selected={state.isStrike}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <StrikeIcon fontSize="small" />
        </ToggleButton>
      </Tooltip>
      <Tooltip title={state.isLink ? 'Upraviť odkaz' : 'Vložiť odkaz'}>
        <ToggleButton value="link" size="small" selected={state.isLink} onClick={onLinkRequest}>
          <LinkIcon fontSize="small" />
        </ToggleButton>
      </Tooltip>
      {state.isLink && (
        <Tooltip title="Odstrániť odkaz">
          <ToggleButton
            value="unlink"
            size="small"
            onClick={() => editor.chain().focus().unsetLink().run()}
          >
            <LinkOffIcon fontSize="small" />
          </ToggleButton>
        </Tooltip>
      )}
      <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
      <Tooltip title="Odrážky">
        <ToggleButton
          value="bullets"
          size="small"
          selected={state.isBullets}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <BulletsIcon fontSize="small" />
        </ToggleButton>
      </Tooltip>
      <Tooltip title="Číslovaný zoznam">
        <ToggleButton
          value="ordered"
          size="small"
          selected={state.isOrdered}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <NumberedIcon fontSize="small" />
        </ToggleButton>
      </Tooltip>
      <Tooltip title="Box (tip/pozor/info)">
        <ToggleButton
          value="callout"
          size="small"
          selected={state.isCallout}
          onClick={toggleCallout}
        >
          <CalloutIcon fontSize="small" />
        </ToggleButton>
      </Tooltip>
    </Stack>
  );
}

function BubbleToolbar({ editor, onLinkRequest }: ToolbarProps) {
  const state = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      isBold: e.isActive('bold'),
      isItalic: e.isActive('italic'),
      isUnderline: e.isActive('underline'),
      isStrike: e.isActive('strike'),
      isLink: e.isActive('link'),
    }),
  });

  return (
    <Paper
      elevation={4}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
        p: 0.5,
        borderRadius: (t) => `${t.shape.borderRadius}px`,
      }}
    >
      <Tooltip title="Tučné">
        <ToggleButton
          value="bold"
          size="small"
          selected={state.isBold}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <BoldIcon fontSize="small" />
        </ToggleButton>
      </Tooltip>
      <Tooltip title="Kurzíva">
        <ToggleButton
          value="italic"
          size="small"
          selected={state.isItalic}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <ItalicIcon fontSize="small" />
        </ToggleButton>
      </Tooltip>
      <Tooltip title="Podčiarknuté">
        <ToggleButton
          value="underline"
          size="small"
          selected={state.isUnderline}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <UnderlineIcon fontSize="small" />
        </ToggleButton>
      </Tooltip>
      <Tooltip title="Prečiarknuté">
        <ToggleButton
          value="strike"
          size="small"
          selected={state.isStrike}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <StrikeIcon fontSize="small" />
        </ToggleButton>
      </Tooltip>
      <Tooltip title={state.isLink ? 'Upraviť odkaz' : 'Vložiť odkaz'}>
        <ToggleButton value="link" size="small" selected={state.isLink} onClick={onLinkRequest}>
          <LinkIcon fontSize="small" />
        </ToggleButton>
      </Tooltip>
      {state.isLink && (
        <Tooltip title="Odstrániť odkaz">
          <ToggleButton
            value="unlink"
            size="small"
            onClick={() => editor.chain().focus().unsetLink().run()}
          >
            <LinkOffIcon fontSize="small" />
          </ToggleButton>
        </Tooltip>
      )}
    </Paper>
  );
}

export default function ArticleRichEditor({ value, onChange }: Props) {
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');

  const initialContent = useMemo(() => sectionsToTiptap(value), []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        code: false,
        codeBlock: false,
        blockquote: false,
        horizontalRule: false,
        link: false,
      }),
      Link.configure({
        openOnClick: false,
        autolink: false,
        HTMLAttributes: { rel: 'noopener nofollow' },
      }),
      Placeholder.configure({
        placeholder: 'Začni písať obsah článku… „H2" v lište začne novú sekciu.',
      }),
      CalloutNode,
    ],
    content: initialContent,
    onUpdate: ({ editor: e }) => {
      onChange(tiptapToSections(e.getJSON()));
    },
  });

  if (!editor) return null;

  const openLinkDialog = () => {
    const existing = editor.getAttributes('link').href;
    setLinkUrl(typeof existing === 'string' ? existing : '');
    setLinkOpen(true);
  };

  const applyLink = () => {
    const url = linkUrl.trim();
    if (url) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    } else {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    }
    setLinkOpen(false);
  };

  return (
    <Box>
      <EditorShell>
        <Toolbar editor={editor} onLinkRequest={openLinkDialog} />
        <DragHandle editor={editor}>
          <Box
            sx={{
              display: 'flex',
              color: 'text.disabled',
              cursor: 'grab',
              '&:active': { cursor: 'grabbing' },
              '&:hover': { color: 'text.secondary' },
            }}
          >
            <DragIcon fontSize="small" />
          </Box>
        </DragHandle>
        <BubbleMenu editor={editor}>
          <BubbleToolbar editor={editor} onLinkRequest={openLinkDialog} />
        </BubbleMenu>
        <EditorContent editor={editor} />
      </EditorShell>
      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
        Píš priamo do textu. Označ slovo a použi lištu na tučné/odkaz. „H2" začína novú sekciu,
        „Box" premení odsek na zvýraznený box.
      </Typography>

      <Dialog open={linkOpen} onClose={() => setLinkOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Odkaz</DialogTitle>
        <DialogContent>
          <TextField
            label="URL"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="/zdravotny-pas alebo https://…"
            helperText="Interný odkaz začni lomkou (/), externý celou adresou."
            fullWidth
            autoFocus
            margin="dense"
            onKeyDown={(e) => {
              if (e.key === 'Enter') applyLink();
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLinkOpen(false)}>Zrušiť</Button>
          <Button onClick={applyLink} variant="contained">
            Použiť
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
