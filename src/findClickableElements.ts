const CLICKABLE_SELECTORS = [
  'a[href]',
  'button',
  'input[type="button"]',
  'input[type="submit"]',
  'input[type="checkbox"]',
  'input[type="radio"]',
  'input[type="text"]',
  'input[type="password"]',
  'input[type="email"]',
  'input[type="search"]',
  'input[type="tel"]',
  'input[type="url"]',
  'input[type="number"]',
  'input[type="date"]',
  'input[type="file"]',
  'textarea',
  'select',
  'summary',
  '[role="button"]',
  '[role="link"]',
  '[tabindex]',
].join(',');

function isVisible(element: HTMLElement): boolean {
  const style = window.getComputedStyle(element);
  if (style.display === 'none' || style.visibility === 'hidden') {
    return false;
  }
  return true;
}

function isInViewport(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect();

  // Must have dimensions
  if (rect.width === 0 || rect.height === 0) {
    return false;
  }

  // Must be at least partially in viewport
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  const horizontallyVisible = rect.right > 0 && rect.left < viewportWidth;
  const verticallyVisible = rect.bottom > 0 && rect.top < viewportHeight;

  return horizontallyVisible && verticallyVisible;
}

function hasValidTabindex(element: HTMLElement): boolean {
  const tabindex = element.getAttribute('tabindex');
  if (tabindex === null) return true; // Not using tabindex selector match
  return parseInt(tabindex, 10) >= 0;
}

export function findClickableElements(): HTMLElement[] {
  const elements = document.querySelectorAll<HTMLElement>(CLICKABLE_SELECTORS);
  const seen = new Set<HTMLElement>();
  const result: HTMLElement[] = [];

  for (const element of elements) {
    // Skip duplicates
    if (seen.has(element)) continue;
    seen.add(element);

    // Skip elements with negative tabindex (unless they're naturally clickable)
    if (element.hasAttribute('tabindex') && !hasValidTabindex(element)) {
      // Only skip if element only matched via tabindex selector
      const isNaturallyClickable =
        element.tagName === 'A' ||
        element.tagName === 'BUTTON' ||
        element.tagName === 'INPUT' ||
        element.tagName === 'TEXTAREA' ||
        element.tagName === 'SELECT' ||
        element.tagName === 'SUMMARY' ||
        element.hasAttribute('role');

      if (!isNaturallyClickable) continue;
    }

    // Skip hidden elements
    if (!isVisible(element)) continue;

    // Skip elements outside viewport
    if (!isInViewport(element)) continue;

    result.push(element);
  }

  return result;
}
