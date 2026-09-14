import { Editor, type EditorSpreadsheetColumn } from 'kmaterialize';

const columns: EditorSpreadsheetColumn[] = [
  { header: 'Shot', value: '{{uppercase shot}}', width: 150 },
  { header: 'Artist', value: '{{fullName artist}}', width: 170 },
  { header: 'Department', value: '{{department}}', width: 140 },
  { header: 'Days', value: '{{days}}', type: 'numeric', width: 90 },
];
const data = [
  { shot: 'sq010_sh010', artist: { firstname: 'Alex', lastname: 'Morgan', email: 'alex@example.com' }, department: 'Lighting', days: 4.5, approved: true },
  { shot: 'sq010_sh020', artist: { firstname: 'Sam', lastname: 'Rivera', email: 'sam@example.com' }, department: 'Compositing', days: 3, approved: false },
  { shot: 'sq020_sh010', artist: { firstname: 'Taylor', lastname: 'Chen', email: 'taylor@example.com' }, department: 'Animation', days: 7, approved: true },
  { shot: 'sq020_sh020', artist: { firstname: 'Jordan', lastname: 'Patel', email: 'jordan@example.com' }, department: 'Lighting', days: 2.5, approved: false },
  { shot: 'sq030_sh010', artist: { firstname: 'Casey', lastname: 'Lee', email: 'casey@example.com' }, department: 'Compositing', days: 5, approved: true },
];
const host = document.querySelector<HTMLElement>('#spreadsheet-editor-demo')!;
const editor = Editor.init(host, {
  variant: 'spreadsheet',
  templateId: 'shot-report',
  templates: [
    { id: 'shot-report', label: 'Shot report', columns },
    { id: 'artist-report', label: 'Artist report', columns: [
      { header: 'Artist', value: '{{fullName artist}}', width: 170 },
      { header: 'Email', value: '{{artist.email}}', width: 230 },
      { header: 'Approved', value: '{{approved}}', type: 'checkbox', width: 100 },
    ] },
  ],
  sources: [
    { id: 'all', label: 'All shots · 5 items', data },
    { id: 'lighting', label: 'Lighting · 2 items', data: data.filter(item => item.department === 'Lighting') },
  ],
  templateSelect: { placeholder: 'Choose a report' },
  sourceSelect: { placeholder: 'Choose data' },
  helpers: {
    uppercase: (value: unknown) => typeof value === 'string' ? value.toUpperCase() : '',
    fullName: (value: unknown) => {
      if (!value || typeof value !== 'object') return '';
      const person = value as { firstname?: string; lastname?: string };
      return [person.firstname, person.lastname].filter(Boolean).join(' ');
    },
    round: (value: unknown) => typeof value === 'number' ? Math.round(value) : '',
  },
});
const reset = document.querySelector<HTMLButtonElement>('#spreadsheet-editor-reset')!;
const onReset = () => { void (async () => { await editor.setSource('all'); await editor.selectTemplate('shot-report'); editor.setColumns(columns); })().catch(() => {}); };
reset.addEventListener('click', onReset);
const downloadError = document.querySelector<HTMLElement>('#spreadsheet-editor-download-error')!;
const downloadListeners = (['csv', 'xlsx'] as const).map(format => {
  const button = document.querySelector<HTMLButtonElement>(`#spreadsheet-editor-download-${format}`)!;
  const listener = async () => {
    button.disabled = true; downloadError.hidden = true;
    try { await editor.download(format); }
    catch (error) { downloadError.textContent = error instanceof Error ? error.message : String(error); downloadError.hidden = false; }
    finally { button.disabled = false; }
  };
  button.addEventListener('click', listener);
  return () => button.removeEventListener('click', listener);
});
void editor.ready.catch(() => {});
if (import.meta.hot) import.meta.hot.dispose(() => { reset.removeEventListener('click', onReset); downloadListeners.forEach(remove => remove()); editor.destroy(); });
