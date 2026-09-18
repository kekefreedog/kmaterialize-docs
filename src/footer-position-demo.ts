import 'kmaterialize';
import 'kmaterialize/dist/css/materialize.css';
import 'material-icons/iconfont/material-icons.css';
import './footer-position-demo.scss';
import { Themes } from './themes';

const themes = new Themes(document);
themes.applyThemeProperties(themes.isDarkMode());

const fixed = document.querySelector<HTMLElement>('#fixed-mode')!;
const sticky = document.querySelector<HTMLElement>('#sticky-mode')!;
const toggle = document.querySelector<HTMLElement>('#content-toggle')!;
const content = document.querySelector<HTMLElement>('#extra-content')!;
const main = document.querySelector<HTMLElement>('main')!;
const status = document.querySelector<HTMLElement>('#footer-demo-status')!;

function setMode(isFixed: boolean) {
  document.body.classList.toggle('footer-fixed', isFixed);
  fixed.toggleAttribute('pressed', isFixed);
  sticky.toggleAttribute('pressed', !isFixed);
  window.scrollTo(0, 0);
  main.scrollTop = 0;
  status.textContent = isFixed
    ? 'The footer stays visible while this content scrolls.'
    : 'The footer follows the content and sits at the bottom of a short page.';
}

fixed.addEventListener('click', () => setMode(true));
sticky.addEventListener('click', () => setMode(false));
toggle.addEventListener('click', () => {
  content.hidden = !content.hidden;
  toggle.setAttribute('label', content.hidden ? 'Add content' : 'Remove content');
  toggle.setAttribute('icon-text', content.hidden ? 'add' : 'remove');
});
document.querySelector('#back-to-top')!.addEventListener('click', () => {
  window.scrollTo(0, 0);
  main.scrollTop = 0;
  main.focus({ preventScroll: true });
});
