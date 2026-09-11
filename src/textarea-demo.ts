import { RichTextarea } from 'kmaterialize';

const status = document.querySelector<HTMLElement>('#textarea-demo-status')!;
const form = document.querySelector<HTMLFormElement>('#textarea-demo-form')!;
const textarea = document.querySelector<HTMLTextAreaElement>('#textarea-brief')!;
const field = RichTextarea.init(textarea);
const note = RichTextarea.init(document.querySelector<HTMLTextAreaElement>('#textarea-note')!, {
  toolbar: [['bold', 'italic'], [{ list: 'bullet' }], ['clean']]
});
const readonly = RichTextarea.init(document.querySelector<HTMLTextAreaElement>('#textarea-readonly')!, { toolbar: false });
const disabled = RichTextarea.init(document.querySelector<HTMLTextAreaElement>('#textarea-disabled')!);

const updateCount = () => { status.textContent = `${field.getText().length} characters. Edits are synchronized with the textarea.`; };
Promise.all([field.ready, note.ready, readonly.ready, disabled.ready]).then(updateCount).catch(error => {
  status.textContent = error instanceof Error ? error.message : 'Could not load the rich-text editor.';
});
textarea.addEventListener('input', updateCount);
form.addEventListener('submit', event => {
  event.preventDefault();
  document.querySelector('#textarea-form-output')!.textContent = JSON.stringify(Object.fromEntries(new FormData(form)), null, 2);
  status.textContent = 'Form value captured locally. Nothing was sent to a server.';
});
form.addEventListener('reset', () => window.setTimeout(updateCount, 0));
document.querySelector<HTMLButtonElement>('#textarea-toggle-readonly')!.addEventListener('click', event => {
  textarea.readOnly = !textarea.readOnly;
  (event.currentTarget as HTMLButtonElement).setAttribute('aria-pressed', String(textarea.readOnly));
  status.textContent = textarea.readOnly ? 'Read-only mode enabled.' : 'Editing enabled.';
});
if (import.meta.hot) import.meta.hot.dispose(() => [field, note, readonly, disabled].forEach(editor => editor.destroy()));
