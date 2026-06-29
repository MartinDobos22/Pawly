import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import GalleryNodeView from './GalleryNodeView';

export interface GalleryImage {
  src: string;
  alt?: string;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    gallery: {
      setGallery: (attrs?: { images?: GalleryImage[] }) => ReturnType;
    };
  }
}

export const GalleryNode = Node.create({
  name: 'gallery',
  group: 'block',
  atom: true,
  selectable: true,
  draggable: true,

  addAttributes() {
    return {
      images: {
        default: [] as GalleryImage[],
        parseHTML: (el) => {
          try {
            return JSON.parse(el.getAttribute('data-images') ?? '[]');
          } catch {
            return [];
          }
        },
        renderHTML: (attrs) => ({ 'data-images': JSON.stringify(attrs.images ?? []) }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-gallery]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes({ 'data-gallery': '' }, HTMLAttributes)];
  },

  addNodeView() {
    return ReactNodeViewRenderer(GalleryNodeView);
  },

  addCommands() {
    return {
      setGallery:
        (attrs) =>
        ({ commands }) =>
          commands.insertContent({ type: this.name, attrs: { images: attrs?.images ?? [] } }),
    };
  },
});
