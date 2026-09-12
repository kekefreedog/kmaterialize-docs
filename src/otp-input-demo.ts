import { OtpInput } from 'kmaterialize';
const input = (id: string) => document.querySelector<HTMLInputElement>(`#${id}`)!;
const status = document.querySelector<HTMLElement>('#otp-status')!;
const length = document.querySelector<HTMLSelectElement>('#otp-length')!;
const characters = document.querySelector<HTMLSelectElement>('#otp-characters')!;
const form = document.querySelector<HTMLFormElement>('#otp-demo-form')!;
const reportError = (error: unknown) => { status.textContent = error instanceof Error ? error.message : 'Could not load OTP input.'; };
let code: OtpInput;
function configure() {
  input('otp-code').value = '';
  code = OtpInput.init(input('otp-code'), {
    length: Number(length.value),
    characters: characters.value as 'digits' | 'alphanumeric',
    onComplete: () => { status.textContent = 'Code complete. Ready to submit.'; }
  });
  document.querySelector('#otp-help')!.textContent = `Enter all ${length.value} ${characters.value === 'digits' ? 'digits' : 'letters or digits'}. Paste and leading zeroes are supported.`;
  code.ready.then(() => { status.textContent = 'Ready. Type or paste a verification code.'; }).catch(reportError);
}
configure();
length.addEventListener('change', configure);
characters.addEventListener('change', configure);
const underlined = OtpInput.init(input('otp-underlined'));
const pin = OtpInput.init(input('otp-pin'));
const grouped = OtpInput.init(input('otp-grouped'));
const license = OtpInput.init(input('otp-license'), {
  pattern: 'AA-####',
  maskOptions: { postprocessors: [({ value, selection }) => ({ value: value.toUpperCase(), selection })] },
  onComplete: (value, field) => { document.querySelector('#otp-mask-status')!.textContent = `Formatted: ${value} · Editable characters: ${field.getUnmaskedValue()}`; }
});
const readonly = OtpInput.init(input('otp-readonly'));
const disabled = OtpInput.init(input('otp-disabled'));
Promise.all([underlined, pin, grouped, license, readonly, disabled].map(field => field.ready)).catch(reportError);
form.addEventListener('submit', event => {
  event.preventDefault();
  document.querySelector('#otp-output')!.textContent = JSON.stringify(Object.fromEntries(new FormData(form)), null, 2);
  status.textContent = 'Complete code captured locally. This demo does not verify or send it.';
});
form.addEventListener('reset', () => { status.textContent = 'Code cleared.'; document.querySelector('#otp-output')!.textContent = 'Submit a complete code to inspect the native form value.'; });
input('otp-code').addEventListener('invalid', () => { status.textContent = 'Fill every slot before submitting.'; });
document.querySelector<HTMLButtonElement>('#otp-reveal')!.addEventListener('click', event => {
  const reveal = input('otp-pin').type === 'password';
  input('otp-pin').type = reveal ? 'text' : 'password';
  const button = event.currentTarget as HTMLButtonElement;
  button.textContent = reveal ? 'Hide PIN' : 'Show PIN';
  button.setAttribute('aria-pressed', String(reveal));
});
if (import.meta.hot) import.meta.hot.dispose(() => [code, underlined, pin, grouped, license, readonly, disabled].forEach(field => field.destroy()));
