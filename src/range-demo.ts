import { Range, RangeInterval } from 'kmaterialize';

const budget = document.querySelector<HTMLInputElement>('#range-budget')!;
const formatBudget = (value: number) => `${value / 1000}k credits`;
Range.init(budget, { formatValue: formatBudget });

const storage = document.querySelector<HTMLInputElement>('#validation-range')!;
const storageError = document.querySelector<HTMLElement>('#validation-range-error')!;
const formatStorage = (value: number) => `${value} GB`;
Range.init(storage, { formatValue: formatStorage });
const updateStorageError = () => {
  const invalid = storage.valueAsNumber > 50;
  storageError.hidden = !invalid;
  if (invalid) storage.setAttribute('aria-invalid', 'true');
  else storage.removeAttribute('aria-invalid');
  storage.setCustomValidity(invalid ? 'Your plan allows up to 50 GB.' : '');
};
storage.addEventListener('input', updateStorageError);
storage.addEventListener('change', updateStorageError);
updateStorageError();

document.querySelectorAll<HTMLInputElement>('.range-field input[type="range"]').forEach(input => {
  const output = document.querySelector<HTMLOutputElement>(`output[for="${input.id}"]`);
  if (!output) return;
  const update = () => { output.value = input === budget ? formatBudget(input.valueAsNumber) : input === storage ? formatStorage(input.valueAsNumber) : input.value; };
  input.addEventListener('input', update);
  input.addEventListener('change', update);
  input.form?.addEventListener('reset', () => setTimeout(update, 0));
  update();
});

// Application-specific units and readouts; interval behavior lives in kmaterialize.
const intervalFormats:Record<string, (value:number) => string> = {
    "range-trim": value => `${value} s`,
    "range-price": value => `$${value}`,
    "range-continuous": value => value.toFixed(2),
    "range-rtl": value => String(value),
    "range-outside": value => String(value),
    "range-editable": value => String(value),
    "range-editable-outside": value => String(value),
    "range-editable-rounded": value => String(value)
};

Object.entries(intervalFormats).forEach(([id, formatValue]) => {
    const group = document.getElementById(id)!;
    const interval = RangeInterval.init(group, {formatValue});
    const output = document.querySelector<HTMLOutputElement>(`[data-interval-output="${id}"]`)!;
    const update = () => { output.value = interval.getValues().map(formatValue).join(" – "); };
    group.addEventListener("input", update);
    group.closest("form")?.addEventListener("reset", () => setTimeout(update, 0));
    update();
});
