const examples = document.querySelector<HTMLElement>('#cursor-examples')!;
const status = document.querySelector<HTMLElement>('#cursor-copy-status')!;
let resetTimer: ReturnType<typeof setTimeout> | undefined;
let latestRequest = 0;

async function copyCursor(event: MouseEvent) {
  const button = (event.target as Element).closest<HTMLButtonElement>('button[data-copy-cursor]');
  if (!button || !examples.contains(button)) return;
  const className = button.dataset.copyCursor!;
  const request = ++latestRequest;
  clearTimeout(resetTimer);
  status.textContent = `Copying ${className}…`;
  try {
    await navigator.clipboard.writeText(className);
    if (request !== latestRequest) return;
    status.textContent = `Copied ${className}!`;
    resetTimer = setTimeout(() => {
      status.textContent = 'Choose a cursor to copy its class name.';
    }, 2500);
  } catch {
    if (request !== latestRequest) return;
    status.textContent = `Could not copy automatically. Copy this class: ${className}`;
  }
}
function focusWithoutScroll(event: MouseEvent) {
  if (event.button !== 0) return;
  const button = (event.target as Element).closest<HTMLButtonElement>('button[data-copy-cursor]');
  if (!button || !examples.contains(button)) return;
  // Preserve focus and keyboard access without the browser scrolling the button into view.
  event.preventDefault();
  button.focus({ preventScroll: true });
}
examples.addEventListener('mousedown', focusWithoutScroll);
examples.addEventListener('click', copyCursor);
if (import.meta.hot) import.meta.hot.dispose(() => {
  examples.removeEventListener('mousedown', focusWithoutScroll);
  examples.removeEventListener('click', copyCursor);
  clearTimeout(resetTimer);
  latestRequest++;
});
