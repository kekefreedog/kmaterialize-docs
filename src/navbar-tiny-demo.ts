import { AutoInit, TinyNavbar, type TinyNavbarPosition } from 'kmaterialize';
import 'material-icons/iconfont/material-icons.css';
import 'kmaterialize/dist/css/materialize.css';
import './navbar-tiny-demo.scss';

const restore = document.querySelector<HTMLButtonElement>('#tiny-restore')!;
const status = document.querySelector<HTMLElement>('#tiny-status')!;
AutoInit(document.body, { TinyNavbar: {
  returnFocus: restore,
  onClose() { status.textContent = 'Navbar closed. Use Show navbar to restore it.'; }
} });
const navbar = TinyNavbar.getInstance(document.querySelector<HTMLElement>('#tiny-demo')!);
document.querySelectorAll<HTMLButtonElement>('[data-position]').forEach(button => {
  button.addEventListener('click', () => {
    navbar.setPosition(button.dataset.position as TinyNavbarPosition);
    document.querySelectorAll('[data-position]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    status.textContent = navbar.isOpen ? `Position: ${button.textContent}.` : `Position: ${button.textContent}. Use Show navbar to restore it.`;
  });
});
restore.addEventListener('click', () => { navbar.open(); status.textContent = `Navbar restored. Position: ${navbar.getPosition()}.`; });
if (import.meta.hot) import.meta.hot.dispose(() => navbar.destroy());
