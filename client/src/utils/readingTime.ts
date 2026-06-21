import type { Article } from '../content/poradna/types';

const WORDS_PER_MINUTE = 200;

function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

export function articleReadingMinutes(article: Article): number {
  let words = countWords(article.intro);
  for (const section of article.sections) {
    for (const paragraph of section.paragraphs) {
      words += countWords(paragraph);
    }
  }
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}
