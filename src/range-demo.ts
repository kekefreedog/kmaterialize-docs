import { Range } from 'kmaterialize';

const budget = document.querySelector<HTMLInputElement>('#range-budget')!;
const formatBudget = (value: number) => `${value / 1000}k credits`;
Range.init(budget, { formatValue: formatBudget });

document.querySelectorAll<HTMLInputElement>('.range-field input[type="range"]').forEach(input => {
  const output = document.querySelector<HTMLOutputElement>(`output[for="${input.id}"]`);
  if (!output) return;
  const update = () => { output.value = input === budget ? formatBudget(input.valueAsNumber) : input.value; };
  input.addEventListener('input', update);
  update();
});
