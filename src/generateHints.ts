const HINT_CHARS = 'sadfjkl';

export function generateHints(count: number): string[] {
  if (count === 0) return [];

  const chars = HINT_CHARS.split('');
  const charCount = chars.length;

  // Determine hint length needed
  // For count <= charCount, use single chars
  // For count > charCount, use two chars for all (simpler and consistent)
  const needsTwoChars = count > charCount;

  if (!needsTwoChars) {
    return chars.slice(0, count);
  }

  // Generate two-character hints
  const hints: string[] = [];
  for (let i = 0; i < count; i++) {
    const first = chars[Math.floor(i / charCount) % charCount];
    const second = chars[i % charCount];
    hints.push(first + second);
  }

  return hints;
}
