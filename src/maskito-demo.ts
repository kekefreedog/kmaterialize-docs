import { MaskitoInput, OtpInput } from 'kmaterialize';
import { maskitoParseDate, maskitoParseNumber, maskitoParseTime } from '@maskito/kit';

const input = (id: string) => document.querySelector<HTMLInputElement>(`#${id}`)!;
const fields = {
  phone: MaskitoInput.init(input('mask-phone')),
  code: MaskitoInput.init(input('mask-code'), {
    maskOptions: { postprocessors: [({ value, selection }) => ({ value: value.toUpperCase(), selection })] }
  }),
  currency: MaskitoInput.init(input('mask-currency')),
  percent: MaskitoInput.init(input('mask-percent')),
  date: MaskitoInput.init(input('mask-date'), { date: {
    mode: 'dd/mm/yyyy', separator: '/', min: new Date(2020, 0, 1), max: new Date(2030, 11, 31)
  } }),
  time: MaskitoInput.init(input('mask-time'), { time: { mode: 'HH:MM', step: 1 } }),
  shift: MaskitoInput.init(input('mask-shift'), { pattern: '######', maskOptions: { overwriteMode: 'shift' } }),
  replace: MaskitoInput.init(input('mask-replace'), { pattern: '######', maskOptions: { overwriteMode: 'replace' } }),
  digits: MaskitoInput.init(input('mask-digits'), { maskOptions: { mask: /^\d{0,6}$/ } })
};
const status = document.querySelector<HTMLElement>('#maskito-demo-status')!;
const form = document.querySelector<HTMLFormElement>('#maskito-demo-form')!;
const ready = Promise.all(Object.values(fields).map(field => field.ready));
const reportError = (error: unknown) => { status.textContent = error instanceof Error ? error.message : 'Could not initialize the input masks.'; };
ready.then(() => { status.textContent = 'Masks are ready. Try typing, pasting, or editing in the middle of a value.'; }).catch(reportError);
document.querySelector('#maskito-fill')!.addEventListener('click', () => {
  Promise.all([
    fields.phone.setValue('698765432'), fields.code.setValue('fx2048'),
    fields.currency.setValue('2499,9'), fields.percent.setValue('85.5'),
    fields.date.setValue('24122026'), fields.time.setValue('0945')
  ]).then(() => { status.textContent = 'Sample values loaded through MaskitoInput.setValue().'; }).catch(reportError);
});
form.addEventListener('submit', event => {
  event.preventDefault();
  const date = maskitoParseDate(fields.date.getValue(), { mode: 'dd/mm/yyyy', separator: '/' });
  const result = {
    formStrings: Object.fromEntries(new FormData(form)),
    parsed: {
      budget: maskitoParseNumber(fields.currency.getValue(), fields.currency.options.number),
      percent: maskitoParseNumber(fields.percent.getValue(), fields.percent.options.number),
      date: date ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}` : null,
      timeMilliseconds: maskitoParseTime(fields.time.getValue(), { mode: 'HH:MM' })
    }
  };
  document.querySelector('#maskito-form-output')!.textContent = JSON.stringify(result, null, 2);
  status.textContent = 'Form values captured locally. Nothing was sent to a server.';
});
form.addEventListener('reset', () => { status.textContent = 'Default values restored.'; });
if (import.meta.hot) import.meta.hot.dispose(() => Object.values(fields).forEach(field => field.destroy()));

const otp = OtpInput.init(input('mask-otp'), {
  pattern: 'AA-####',
  maskOptions: { postprocessors: [({ value, selection }) => ({ value: value.toUpperCase(), selection })] },
  onComplete: (value, field) => {
    document.querySelector('#mask-otp-status')!.textContent = `Formatted: ${value} · Editable characters: ${field.getUnmaskedValue()}`;
  }
});
otp.ready.catch(reportError);
if (import.meta.hot) import.meta.hot.dispose(() => otp.destroy());
