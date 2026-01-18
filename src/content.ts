import { getScrollAmount } from './scroll';
import { isInputElement } from './isInputElement';

document.addEventListener('keydown', (e) => {
  if (isInputElement(e.target as Element)) {
    return;
  }

  const scrollAmount = getScrollAmount(e.key);
  if (scrollAmount !== null) {
    window.scrollBy(0, scrollAmount);
  }
});
