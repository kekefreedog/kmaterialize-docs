import { Sidenav } from 'kmaterialize';

// Capture authored tab order before other Sidenav examples initialize.
const authoredTabIndexes = new Map(Array.from(document.querySelectorAll<HTMLElement>('header #nav-mobile a, header .docs-appbar ul a')).map(link => [link, link.getAttribute('tabindex')]));

/** Connect the shared docs sidebar to its responsive page layout. */
export function initDocsNavigation(): () => void {
  const sidebar = document.querySelector<HTMLElement>('header #nav-mobile');
  const trigger = document.querySelector<HTMLButtonElement>('header .docs-appbar .sidenav-trigger');
  if (!sidebar || !trigger) return () => {};
  const desktop = window.matchMedia('(min-width: 993px)');
  const actions = document.querySelector<HTMLElement>('header .docs-appbar ul');
  const tabIndexes = authoredTabIndexes;
  let desktopOpen = true;
  let disposed = false;
  const sync = (open: boolean) => {
    if (disposed) return;
    document.body.classList.toggle('docs-navigation-collapsed', desktop.matches && !open);
    sidebar.inert = !open;
    sidebar.setAttribute('aria-hidden', String(!open));
    trigger.setAttribute('aria-expanded', String(open));
    trigger.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    actions?.setAttribute('aria-hidden', String(!desktop.matches && open));
    // Fixed navigation leaves both regions usable. Restore tab order after mobile overlay mode.
    if (desktop.matches) for (const [link, value] of tabIndexes) {
      if (value === null) link.removeAttribute('tabindex');
      else link.setAttribute('tabindex', value);
    }
  };
  const afterChange = () => queueMicrotask(() => sync(instance.isOpen));
  const instance = Sidenav.init(sidebar, { onOpenStart: afterChange, onCloseStart: afterChange });
  const toggle = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation(); // The library's delegated trigger opens only; this control toggles.
    if (desktop.matches) desktopOpen = !instance.isOpen;
    instance.isOpen ? instance.close() : instance.open();
    sync(instance.isOpen);
  };
  const resize = () => {
    // Sidenav reopens fixed drawers on resize; retain the user's desktop choice.
    if (desktop.matches) desktopOpen ? instance.open() : instance.close();
    sync(instance.isOpen);
  };
  trigger.addEventListener('click', toggle);
  window.addEventListener('resize', resize);
  sync(instance.isOpen);
  return () => {
    disposed = true;
    trigger.removeEventListener('click', toggle);
    window.removeEventListener('resize', resize);
    instance.destroy();
    sidebar.inert = false;
    document.body.classList.remove('docs-navigation-collapsed');
    for (const [link, value] of tabIndexes) {
      if (value === null) link.removeAttribute('tabindex'); else link.setAttribute('tabindex', value);
    }
  };
}
