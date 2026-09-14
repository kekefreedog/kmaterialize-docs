import { Editor } from 'kmaterialize';

const template = `<article class="update-card">
  <span class="eyebrow">{{uppercase project.status}}</span>
  <h1>Hello, {{capitalize person.firstname}}.</h1>
  <p class="intro">{{project.name}} is ready for review.</p>

  <h2>Up next <span class="count">{{taskCount items}}</span></h2>
  <ul>
    {{#each items}}
      <li>{{this}}</li>
    {{/each}}
  </ul>
  <footer>Prepared for <strong>{{person.firstname}} {{person.lastname}}</strong>.</footer>
</article>

<style>
  body { margin: 0; padding: 28px; background: #f3f0fa; color: #29213d; }
  .update-card { max-width: 520px; margin: auto; padding: 28px; background: white;
    border: 1px solid #e5ddef; border-radius: 22px; box-shadow: 0 12px 32px #35204b0d; }
  .eyebrow { display: inline-block; padding: 5px 10px; background: #eee7fa;
    color: #6941a5; border-radius: 999px; font-size: 10px; font-weight: 700; letter-spacing: .07em; }
  h1 { margin: 18px 0 8px; font-size: 32px; line-height: 1.15; letter-spacing: -.03em; }
  .intro { color: #71677e; margin: 0 0 28px; }
  h2 { display: flex; align-items: center; gap: 10px; font-size: 16px; }
  .count { padding: 3px 8px; border-radius: 8px; background: #f3f0fa; color: #796590; font-size: 11px; }
  ul { padding-left: 20px; }
  li { padding: 7px 0; }
  li::marker { color: #9063cb; }
  footer { margin-top: 26px; padding-top: 18px; border-top: 1px solid #eee7f4;
    color: #71677e; font-size: 12px; }
  @media (max-width: 400px) { body { padding: 16px; } .update-card { padding: 20px; } }
</style>`;

const summaryTemplate = `<section class="summary">
  <p class="badge">{{uppercase project.status}}</p>
  <h1>{{project.name}}</h1>
  <p>Hi {{capitalize person.firstname}}, here is your project summary.</p>
  <h2>{{taskCount items}}</h2>
  <ol>{{#each items}}<li>{{this}}</li>{{/each}}</ol>
  <p class="signature">{{person.firstname}} {{person.lastname}}</p>
</section>
<style>
  body { margin: 0; padding: 32px; background: #eef4f2; color: #233e36; }
  .summary { max-width: 540px; margin: auto; padding: 28px; background: white; border-radius: 16px; border-top: 5px solid #558271; }
  .badge { color: #547a6b; font-size: 11px; letter-spacing: .08em; }
  h1 { font-size: 28px; line-height: 1.2; } h2 { font-size: 17px; margin-top: 28px; }
  ol { padding-left: 24px; } li { padding: 8px 0; }
  .signature { border-top: 1px solid #dce7e2; padding-top: 18px; margin-top: 28px; font-size: 12px; }
</style>`;

const host = document.querySelector<HTMLElement>('#editor-demo')!;
const editor = Editor.init(host, {
  variant: 'handlebars',
  templateId: 'card',
  templates: [
    { id: 'card', label: 'Project card', template },
    { id: 'summary', label: 'Project summary', template: summaryTemplate },
  ],
  templateSelect: { placeholder: 'Choose a template', searchField: ['label'] },
  sourceSelect: { placeholder: 'Choose data', searchField: ['label'] },
  helpers: {
    uppercase: (value: unknown) => typeof value === 'string' ? value.toUpperCase() : '',
    capitalize: (value: unknown) => typeof value === 'string' ? value.charAt(0).toUpperCase() + value.slice(1) : '',
    taskCount: (items: unknown) => {
      const count = Array.isArray(items) ? items.length : 0;
      return `${count} ${count === 1 ? 'task' : 'tasks'}`;
    },
  },
  sources: [
    {
      id: 'production', label: 'Production update',
      data: {
        person: { firstname: 'Alex', lastname: 'Morgan', email: 'alex@example.com' },
        project: { name: 'My awesome page', status: 'Ready for review' },
        items: ['Review the first design', 'Share feedback with the team', 'Prepare the final delivery'],
      },
    },
    {
      id: 'client', label: 'Client update',
      data: {
        person: { firstname: 'Sam', lastname: 'Rivera', email: 'sam@example.com' },
        project: { name: 'Summer campaign', status: 'In progress' },
        items: ['Approve the direction', 'Confirm the delivery date'],
      },
    },
  ],
});
const reset = document.querySelector<HTMLButtonElement>('#editor-demo-reset')!;
const onReset = () => { void (async () => { await editor.setSource('production'); await editor.selectTemplate('card'); editor.setTemplate(template); })().catch(() => {}); };
reset.addEventListener('click', onReset);
// Dependency errors are displayed by the component; keep the demo promise handled.
void editor.ready.catch(() => {});
if (import.meta.hot) import.meta.hot.dispose(() => { reset.removeEventListener('click', onReset); editor.destroy(); });
