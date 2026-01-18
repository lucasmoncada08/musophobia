export function isInputElement(element: Element): boolean {
  const tagName = element.tagName.toLowerCase();
  return (
    tagName === 'input' ||
    tagName === 'textarea' ||
    (element as HTMLElement).isContentEditable
  );
}
