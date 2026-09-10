import { CrazyLoading } from 'kmaterialize';

const loading = document.querySelector<CrazyLoading>('#loading-component-demo')!;
const start = document.querySelector<HTMLButtonElement>('#loading-component-start')!;
const stop = document.querySelector<HTMLButtonElement>('#loading-component-stop')!;
const status = document.querySelector<HTMLElement>('#loading-component-status')!;
start.addEventListener('click', () => {
  loading.start();
  status.textContent = 'Loading workspace…';
  stop.disabled = false;
  stop.focus();
  start.disabled = true;
});
stop.addEventListener('click', () => {
  loading.stop();
  status.textContent = 'Workspace ready.';
  start.disabled = false;
  start.focus();
  stop.disabled = true;
});
// main.ts initializes the library ColorInput; saving emits a native change event.
document.querySelector<HTMLInputElement>('#loading-accent')!.addEventListener('change', event => {
  document.querySelector<HTMLElement>('#loading-environment')!.style.setProperty(
    '--md-sys-color-primary', (event.target as HTMLInputElement).value,
  );
});
