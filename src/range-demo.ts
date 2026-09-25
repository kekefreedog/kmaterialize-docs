import { Range, RangeInterval } from 'kmaterialize';

const budget = document.querySelector<HTMLInputElement>('#range-budget')!;
const formatBudget = (value: number) => `${value / 1000}k credits`;
Range.init(budget, { formatValue: formatBudget });

document.querySelectorAll<HTMLInputElement>('.range-field input[type="range"]').forEach(input => {
  const output = document.querySelector<HTMLOutputElement>(`output[for="${input.id}"]`);
  if (!output) return;
  const update = () => { output.value = input === budget ? formatBudget(input.valueAsNumber) : input.value; };
  input.addEventListener('input', update);
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
