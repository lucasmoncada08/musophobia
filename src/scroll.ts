export function getScrollAmount(key: string): number | null {
  if (key === 'j') return 50;
  if (key === 'k') return -50;
  return null;
}
