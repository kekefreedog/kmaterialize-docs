const controls = document.querySelector<HTMLElement>('#planning-zoom-controls');
if (controls) {
  let zoom = 100;
  const update = (value: number) => {
    zoom = Math.max(50, Math.min(200, value));
    const reset = controls.querySelector('#planning-zoom-reset')!;
    reset.setAttribute('label', `${zoom}%`);
    reset.setAttribute('aria-label', `Zoom ${zoom} percent. Reset to 100 percent`);
    controls.querySelector('#planning-zoom-out')!.toggleAttribute('disabled', zoom === 50);
    controls.querySelector('#planning-zoom-in')!.toggleAttribute('disabled', zoom === 200);
    document.querySelector<HTMLElement>('#planning-zoom-preview')!.style.transform = `scale(${zoom / 100})`;
    document.querySelector('#planning-zoom-status')!.textContent = `Zoom: ${zoom}%.`;
  };
  const onAction = (event: Event) => {
    const button = (event.target as Element).closest('crazy-button');
    if (button?.id === 'planning-zoom-out') update(zoom - 10);
    else if (button?.id === 'planning-zoom-in') update(zoom + 10);
    else if (button?.id === 'planning-zoom-reset') update(100);
  };
  controls.addEventListener('buttonaction', onAction);
  update(100);
  if (import.meta.hot) import.meta.hot.dispose(() => controls.removeEventListener('buttonaction', onAction));
}
