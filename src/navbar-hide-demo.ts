import { AutoInit, NavbarAutoHide } from 'kmaterialize';
import 'material-icons/iconfont/material-icons.css';
import 'kmaterialize/dist/css/materialize.css';
import './navbar-hide-demo.scss';

AutoInit();
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    document.querySelectorAll<HTMLElement>('.navbar-hide-on-scroll').forEach(nav => NavbarAutoHide.getInstance(nav)?.destroy());
  });
}
