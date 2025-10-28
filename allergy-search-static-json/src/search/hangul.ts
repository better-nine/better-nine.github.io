// Hangul normalization & choseong extraction utilities

// Normalize Korean text: remove punctuation, unify synonyms, trim, lowercase
export function normalizeKo(s: string) {
  return s
    .replace(/[\p{P}\p{S}]/gu, " ")
    .replace(/\s+/g, " ")
    // Example synonym/variant normalization (extend as needed)
    .replace(/쇠고기/g, "소고기")
    .trim()
    .toLowerCase();
}

const CHOSEONG = ['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];

export function toChoseong(s: string) {
  return Array.from(s).map(ch => {
    const code = ch.charCodeAt(0);
    // Hangul syllables range
    if (0xAC00 <= code && code <= 0xD7A3) {
      const idx = Math.floor((code - 0xAC00) / 588);
      return CHOSEONG[idx];
    }
    return ch;
  }).join('');
}
