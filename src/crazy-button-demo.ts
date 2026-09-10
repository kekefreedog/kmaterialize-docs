import { CrazyButton } from 'kmaterialize';
void CrazyButton;
import './buttons-demo.scss';

const root = document.querySelector<HTMLElement>('#crazy-button-examples')!;
const status = document.querySelector<HTMLElement>('#crazy-button-status')!;
root.addEventListener('buttonaction', event => {
  const { action, pressed } = (event as CustomEvent).detail;
  status.textContent = `${action}${pressed === null ? '' : pressed === 'true' ? ' selected' : ' cleared'}.`;
});
document.addEventListener('click', event => {
  const item = (event.target as Element).closest<HTMLElement>('[data-demo-action]');
  if (!item) return;
  event.preventDefault();
  status.textContent = `${item.dataset.demoAction}.`;
});
document.querySelector<HTMLInputElement>('#button-accent')!.addEventListener('change', event => {
  const color = (event.target as HTMLInputElement).value;
  const environment = document.querySelector<HTMLElement>('#button-environment')!;
  environment.style.setProperty('--md-sys-color-primary', color);
  environment.style.setProperty('--md-sys-color-primary-container', `color-mix(in srgb, ${color} 20%, var(--md-sys-color-surface))`);
  environment.style.setProperty('--md-sys-color-on-primary-container', 'var(--md-sys-color-on-surface)');
  const channels = color.slice(1).match(/../g)!.map(channel => {
    const c = parseInt(channel, 16) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  const luminance = channels[0] * .2126 + channels[1] * .7152 + channels[2] * .0722;
  environment.style.setProperty('--md-sys-color-on-primary', luminance > .179 ? '#000' : '#fff');
});

// Routing remains application behavior; the component renders the current state.
const rail = document.querySelector<HTMLElement>('#rail-buttons')!;
rail.addEventListener('buttonaction', event => {
  const selected = event.target as HTMLElement;
  rail.querySelectorAll('crazy-button').forEach(button => {
    if (button === selected) button.setAttribute('aria-current', 'page');
    else button.removeAttribute('aria-current');
  });
});
