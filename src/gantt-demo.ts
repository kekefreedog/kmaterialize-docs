import { Gantt, type GanttTask, type GanttView } from 'kmaterialize';

// Keep the examples near today whenever this page is opened.
const now = new Date();
const anchor = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
const date = (offset: number) => new Date(anchor + offset * 86400000).toISOString().slice(0, 10);
const tasks: GanttTask[] = [
  { id: 'discovery', name: 'Discovery', detail: 'Product · Alex', start: date(-7), end: date(-4), progress: 115 },
  { id: 'design', name: 'Interface design', detail: 'Design · Maya', start: date(-4), end: date(2), progress: 65, tone: 'secondary' },
  { id: 'build', name: 'Build the experience', detail: 'Engineering · Sam', start: date(-1), end: date(8), progress: 25 },
  { id: 'review', name: 'Test & refine', detail: 'Quality · Léa', start: date(6), end: date(11), progress: 95, tone: 'tertiary' },
  { id: 'launch', name: 'Launch', detail: 'Release milestone', start: date(12), end: date(12), milestone: true, tone: 'tertiary' },
];
const status = document.querySelector<HTMLElement>('#gantt-status')!;
const update = document.querySelector<HTMLButtonElement>('#gantt-progress')!;
let selectedId: string | undefined;
const chart = Gantt.init(document.querySelector<HTMLElement>('#gantt-project')!, {
  tasks,
  label: 'Website launch',
  editable: true,
  onTaskClick(task) {
    selectedId = task.id;
    update.disabled = !!task.milestone;
    status.textContent = `${task.name} · ${task.start} to ${task.end} · ${task.milestone ? 'Milestone' : `${task.progress ?? 0}% of expected time used`}.`;
  },
  onTaskChange({ task, action }) {
    const count = chart.getSelectedTaskIds().length;
    status.textContent = count > 1 ? `${count} selected tasks: ${action === 'move' ? 'dates moved together' : 'resize applied to non-milestone tasks'}. Changes stay in this example.` : `${task.name}: ${task.start} to ${task.end}. ${action === 'move' ? 'Task moved' : 'Duration updated'}. Changes stay in this example.`;
  },
  onSelectionChange(ids) {
    document.querySelector<HTMLOutputElement>('#gantt-selection-count')!.value = `${ids.length} selected`;
    document.querySelector<HTMLButtonElement>('#gantt-clear-selection')!.disabled = !ids.length;
  },
});

document.querySelector('#gantt-clear-selection')!.addEventListener('click', () => chart.setSelectedTaskIds([]));

const editButton = document.querySelector<HTMLButtonElement>('#gantt-edit')!;
editButton.addEventListener('click', () => {
  chart.setEditable(!chart.isEditable());
  editButton.setAttribute('aria-pressed', String(chart.isEditable()));
  editButton.classList.toggle('filled', chart.isEditable());
  editButton.classList.toggle('tonal', !chart.isEditable());
  status.textContent = chart.isEditable() ? 'Editing enabled. Drag a task to move it or either end handle to resize it.' : 'Editing disabled. You can still select tasks and zoom the timeline.';
});
const zoomOut = document.querySelector<HTMLButtonElement>('#gantt-zoom-out')!;
const zoomIn = document.querySelector<HTMLButtonElement>('#gantt-zoom-in')!;
function updateZoom() {
  document.querySelector<HTMLOutputElement>('#gantt-zoom-value')!.value = `${Math.round(chart.getZoom() * 100)}%`;
  zoomOut.disabled = chart.getZoom() <= chart.options.minZoom;
  zoomIn.disabled = chart.getZoom() >= chart.options.maxZoom;
}
zoomOut.addEventListener('click', () => { chart.setZoom(chart.getZoom() - 0.25); updateZoom(); });
zoomIn.addEventListener('click', () => { chart.setZoom(chart.getZoom() + 0.25); updateZoom(); });
document.querySelector('#gantt-zoom-reset')!.addEventListener('click', () => { chart.resetZoom(); updateZoom(); });
updateZoom();

document.querySelectorAll<HTMLButtonElement>('[data-gantt-view]').forEach(button => {
  button.addEventListener('click', () => {
    chart.setView(button.dataset.ganttView as GanttView);
    document.querySelectorAll<HTMLButtonElement>('[data-gantt-view]').forEach(item => {
      item.setAttribute('aria-pressed', String(item === button));
      item.classList.toggle('filled', item === button);
      item.classList.toggle('tonal', item !== button);
    });
  });
});
document.querySelector('#gantt-today')!.addEventListener('click', () => chart.scrollToDate());
update.addEventListener('click', () => {
  const next = chart.getTasks();
  const task = next.find(item => item.id === selectedId);
  if (!task || task.milestone) return;
  task.progress = (task.progress ?? 0) + 10;
  chart.setTasks(next);
  status.textContent = `${task.name} is now ${task.progress}% of expected time used. Changes stay in this example.`;
});
document.querySelector('#gantt-reset')!.addEventListener('click', () => {
  chart.setTasks(tasks);
  chart.setSelectedTaskIds([]);
  chart.resetZoom();
  updateZoom();
  selectedId = undefined;
  update.disabled = true;
  chart.scrollToDate();
  status.textContent = 'Example restored. Select a task to inspect it or update its progress.';
});

Gantt.init(document.querySelector<HTMLElement>('#gantt-campaign')!, {
  view: 'week',
  label: 'Autumn campaign',
  tasks: [
    { id: 'strategy', name: 'Campaign strategy', detail: 'Marketing', start: date(-14), end: date(-1), progress: 100 },
    { id: 'creative', name: 'Creative development', detail: 'Studio', start: date(-7), end: date(16), progress: 40, tone: 'secondary' },
    { id: 'content', name: 'Content production', detail: 'Editorial', start: date(7), end: date(30), progress: 10, tone: 'tertiary' },
    { id: 'approval', name: 'Final approval', detail: 'Milestone', start: date(32), end: date(32), milestone: true, tone: 'secondary' },
    { id: 'delivery', name: 'Campaign rollout', detail: 'Marketing', start: date(35), end: date(49), progress: 0 },
  ],
  onTaskClick(task) {
    document.querySelector<HTMLElement>('#gantt-campaign-status')!.textContent = `${task.name}: ${task.start} to ${task.end}.`;
  },
});

const linkedTasks: GanttTask[] = [
  { id: 'planning', name: 'Planning', detail: 'Move this task to try the chain', start: date(-2), end: date(4), progress: 0 },
  { id: 'implementation', name: 'Implementation', detail: 'Already started · start stays fixed', start: date(0), end: date(9), progress: 40, dependencies: ['planning'], tone: 'secondary' },
  { id: 'testing', name: 'Testing', detail: 'Not started · dates move together', start: date(6), end: date(12), progress: 0, dependencies: ['implementation'], tone: 'tertiary' },
  { id: 'release', name: 'Release', start: date(14), end: date(14), milestone: true, dependencies: ['testing'], tone: 'tertiary' },
  { id: 'marketing', name: 'Marketing', detail: 'Independent task', start: date(3), end: date(11), progress: 0 },
];
const dependencyStatus = document.querySelector<HTMLElement>('#gantt-dependency-status')!;
const linkedChart = Gantt.init(document.querySelector<HTMLElement>('#gantt-dependencies')!, {
  tasks: linkedTasks, label: 'Overlapping project tasks', editable: true, zoom: 0.75,
  onTaskChange() {
    const current = linkedChart.getTasks();
    const implementation = current.find(task => task.id === 'implementation')!;
    const testing = current.find(task => task.id === 'testing')!;
    dependencyStatus.textContent = `Implementation: ${implementation.start} to ${implementation.end}. Testing: ${testing.start} to ${testing.end}. Changes stay in this example.`;
  },
  onDependencyChange({ action }) {
    dependencyStatus.textContent = `Link ${action === 'add' ? 'added' : 'removed'}. Scheduled dates are unchanged.`;
  },
});
const from = document.querySelector<HTMLSelectElement>('#gantt-link-from')!;
const to = document.querySelector<HTMLSelectElement>('#gantt-link-to')!;
for (const task of linkedTasks) { from.add(new Option(task.name, task.id)); to.add(new Option(task.name, task.id)); }
from.value = 'planning'; to.value = 'marketing';
function editLink(remove = false) {
  try {
    if (remove) linkedChart.removeDependency(from.value, to.value);
    else linkedChart.addDependency(from.value, to.value);
    dependencyStatus.textContent = remove ? 'Link removed, if present. Dates are unchanged.' : 'Tasks linked. Dates are unchanged until you move a task.';
  } catch (error) {
    dependencyStatus.textContent = error instanceof Error ? error.message : 'Could not update the dependency.';
  }
}
document.querySelector('#gantt-link-form')!.addEventListener('submit', event => { event.preventDefault(); editLink(); });
document.querySelector('#gantt-unlink')!.addEventListener('click', () => editLink(true));
document.querySelector('#gantt-dependencies-reset')!.addEventListener('click', () => {
  linkedChart.setTasks(linkedTasks);
  linkedChart.setSelectedTaskIds([]);
  from.value = 'planning'; to.value = 'marketing';
  dependencyStatus.textContent = 'Example restored. Move Planning later to extend the already-started Implementation task.';
});
