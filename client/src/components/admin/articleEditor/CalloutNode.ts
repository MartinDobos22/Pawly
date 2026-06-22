import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import CalloutNodeView from './CalloutNodeView';
import type { CalloutVariant } from '../../../content/poradna/types';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    callout: {
      setCallout: (attrs?: { variant?: CalloutVariant; title?: string }) => ReturnType;
    };
  }
}

export const CalloutNode = Node.create({
  name: 'callout',
  group: 'block',
  content: 'inline*',
  defining: true,

  addAttributes() {
    return {
      variant: {
        default: 'tip',
        parseHTML: (el) => el.getAttribute('data-variant') ?? 'tip',
        renderHTML: (attrs) => ({ 'data-variant': attrs.variant }),
      },
      title: {
        default: '',
        parseHTML: (el) => el.getAttribute('data-title') ?? '',
        renderHTML: (attrs) => (attrs.title ? { 'data-title': attrs.title } : {}),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-callout]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes({ 'data-callout': '' }, HTMLAttributes), 0];
  },

  addNodeView() {
    return ReactNodeViewRenderer(CalloutNodeView);
  },

  addCommands() {
    return {
      setCallout:
        (attrs) =>
        ({ commands }) =>
          commands.setNode(this.name, attrs),
    };
  },
});
