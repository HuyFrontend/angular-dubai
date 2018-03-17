interface String {
  isEmpty(): boolean;
  stripHtmlTags(): string;
  truncate(maxChars: number, keepFullWords: boolean, appendText: string): string;
  extractBetween(leftStr: string, rightStr: string): string;
  endsWith(suffix: string): boolean;
  chopLeft(prefix: string): string;
  chopRight(suffix: string): string;
  countOccurrence(substr: string): number;
  decodeHtmlEntities(): string;
  replaceAll(searchStr: string, replaceStr: string): string;
  strip(...args): string;
  isColorCode(): boolean;
}
