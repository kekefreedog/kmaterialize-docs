import { applyTheme, argbFromHex, themeFromSourceColor } from '@material/material-color-utilities';
import './sidenav-rail-demo.scss';

const systemTheme = matchMedia('(prefers-color-scheme: dark)');
const savedDark = () => {
  const preference = localStorage.getItem('theme-mode');
  return preference ? preference === 'dark' : systemTheme.matches;
};
const themeButton = document.querySelector<HTMLButtonElement>('#rail-theme')!;
const motionButton = document.querySelector<HTMLButtonElement>('#rail-motion')!;
let dark = savedDark();
let paused = matchMedia('(prefers-reduced-motion: reduce)').matches;
function updateTheme() {
  const seed = localStorage.getItem('theme-primary-color') || '#FFD700';
  const theme = themeFromSourceColor(argbFromHex(seed));
  applyTheme(theme, { target: document.documentElement, dark });
  document.documentElement.setAttribute('theme', dark ? 'dark' : 'light');
  themeButton.setAttribute('aria-label', `Switch to ${dark ? 'light' : 'dark'} theme`);
  themeButton.querySelector('i')!.textContent = dark ? 'light_mode' : 'dark_mode';
}
function updateMotion() {
  document.body.classList.toggle('rail-motion-paused', paused);
  motionButton.setAttribute('aria-pressed', String(paused));
  motionButton.setAttribute('aria-label', paused ? 'Resume motion' : 'Pause motion');
  motionButton.querySelector('i')!.textContent = paused ? 'play_arrow' : 'pause';
}
themeButton.addEventListener('click', () => { dark = !dark; updateTheme(); });
motionButton.addEventListener('click', () => { paused = !paused; updateMotion(); });
// Changes made in the surrounding docs page also reach this iframe.
window.addEventListener('storage', event => {
  if (!event.key || ['theme-primary-color', 'theme-mode'].includes(event.key)) {
    dark = savedDark(); updateTheme();
  }
});
systemTheme.addEventListener('change', () => {
  if (!localStorage.getItem('theme-mode')) { dark = savedDark(); updateTheme(); }
});
updateTheme(); updateMotion();
const descriptions: Record<string, string> = {
  Home: 'A place for the ideas, tools, and components that shape your next interface.',
  'Get started': 'Start with the essentials and build a shared design language for your product.',
  Develop: 'Turn design decisions into working interfaces with reusable components.',
  Foundations: 'Create a clear hierarchy with accessible layouts, interaction, and motion.',
  Styles: 'Make color, typography, and shape work together across your interface.',
  Components: 'Explore the building blocks that help people navigate and get things done.',
  Blog: 'Discover new ideas and stories from the world of interface design.',
};
const links = Array.from(document.querySelectorAll<HTMLAnchorElement>('.m3-rail-nav a'));
function selectSection() {
  const selected = links.find(link => link.hash === location.hash) || links[0];
  links.forEach(link => {
    if (link === selected) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
  const name = selected.dataset.view!;
  document.querySelector('#rail-view-title')!.textContent = name;
  document.querySelector('#rail-view-description')!.textContent = descriptions[name];
}
window.addEventListener('hashchange', selectSection);
selectSection();
