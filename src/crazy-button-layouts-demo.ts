import { CrazyButton } from 'kmaterialize';
import './crazy-button-layouts-demo.scss';
void CrazyButton;

const descriptions: Record<string, string> = {
  Home: 'Your production workspace: quick access to the tools you use every day.',
  Timelog: 'Record time against your current shots and tasks.',
  OutsourceTurnover: 'Prepare shot packages and review deliveries for external teams.',
  OutsourceBrief: 'Keep references, requirements, and instructions together for your partners.',
  TimelogSummary: 'Review logged time across the production.',
  StudioResource: 'Explore studio resources and team availability.',
  Planning: 'Plan the crew, assignments, and upcoming production work.',
  Settings: 'Manage workspace preferences and administration.',
};
// Demonstration routing only; rendering, tooltips, and activation come from CrazyButton.
for (const preview of document.querySelectorAll<HTMLElement>('.workspace-nav-preview')) {
  preview.addEventListener('buttonaction', event => {
    const selected = event.target as CrazyButton;
    if (!selected.matches('crazy-button[data-redirect-name]')) return;
    const destination = selected.dataset.redirectName!;
    preview.querySelectorAll('crazy-button').forEach(button => {
      if (button === selected) button.setAttribute('aria-current', 'page');
      else button.removeAttribute('aria-current');
    });
    preview.querySelector('[data-workspace-title]')!.textContent = String(selected.getProperty('label'));
    preview.querySelector('[data-workspace-description]')!.textContent = descriptions[destination];
    preview.querySelector('[data-crazy-button-status]')!.textContent = `${selected.getProperty('label')} selected.`;
  });
}
