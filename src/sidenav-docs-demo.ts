import { Sidenav, Collapsible, Autocomplete } from 'kmaterialize';
import './sidenav-docs-demo.scss';
import { config } from '../config.materialize';
import { applyTheme, argbFromHex, themeFromSourceColor } from '@material/material-color-utilities';

// Use the same saved palette and theme as the documentation site.
const seed = localStorage.getItem('theme-primary-color') || '#FFD700';
const preference = localStorage.getItem('theme-mode');
const dark = preference ? preference === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
applyTheme(themeFromSourceColor(argbFromHex(seed)), { target: document.documentElement, dark });
document.documentElement.setAttribute('theme', dark ? 'dark' : 'light');

const menu = document.querySelector<HTMLElement>('#docs-example-menu')!;
const toggle = document.querySelector<HTMLButtonElement>('#docs-example-toggle')!;
const search = document.querySelector<HTMLInputElement>('#docs-example-search')!;
const wide = matchMedia('(min-width: 560px)');
const drawer = Sidenav.init(menu, {
  draggable: false,
  preventScrolling: false,
  onOpenStart: () => toggle.setAttribute('aria-expanded', 'true'),
  onCloseStart: () => toggle.setAttribute('aria-expanded', 'false'),
});
Collapsible.init(menu.querySelector<HTMLElement>('.collapsible')!, { accordion: false });
function resize() {
  document.body.classList.toggle('drawer-example-docked', wide.matches);
  if (wide.matches) drawer.open(); else drawer.close();
}
wide.addEventListener('change', resize);
resize();
toggle.addEventListener('click', () => drawer.isOpen ? drawer.close() : drawer.open());
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !wide.matches && drawer.isOpen) { drawer.close(); toggle.focus(); }
});
// Match the documentation site's autocomplete and complete page index.
Autocomplete.init(search, {
  minLength: 1,
  data: config.pages.map(page => ({ id: page.id, text: page.name, description: page.description, url: page.url })),
  onAutocomplete: items => {
    if (items.length === 1) window.top!.location.href = items[0]['url'];
  },
});
