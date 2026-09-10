import './tabs-demo.scss';

const layout = document.querySelector<HTMLElement>('#tabs-fill-demo')!;
const navigation = layout.querySelector<HTMLElement>('.tabs')!;
const position = document.querySelector<HTMLSelectElement>('#tabs-nav-position')!;
position.addEventListener('change', () => {
  layout.dataset.tabPosition = position.value;
  // Keep reading/focus order consistent with the visual layout.
  if (position.value === 'bottom') layout.append(navigation);
  else layout.prepend(navigation);
});
