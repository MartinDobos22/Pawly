import type { Article } from '../content/poradna/types';

const WORDS_PER_MINUTE = 200;

function stripMarkup(text: string): string {
  return text.replace(/\*\*/g, '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
}

function countWords(text: string): number {
  const trimmed = stripMarkup(text).trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

export function articleReadingMinutes(article: Article): number {
  let words = countWords(article.intro);
  for (const section of article.sections) {
    words += countWords(section.heading);
    for (const block of section.blocks) {
      switch (block.type) {
        case 'paragraph':
          words += countWords(block.text);
          break;
        case 'bullets':
          for (const item of block.items) words += countWords(item);
          break;
        case 'subheading':
          words += countWords(block.text);
          break;
        case 'callout':
          words += countWords(block.text);
          break;
      }
    }
  }
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}
