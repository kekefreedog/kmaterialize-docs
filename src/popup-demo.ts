import { Popup } from "kmaterialize";
import type { PopupOptions } from "kmaterialize";

const status = document.querySelector<HTMLElement>("#popup-demo-status");

function report(message: string) {
  if (status) status.textContent = message;
}

// Keep the trigger focusable so SweetAlert2 can return keyboard focus to it.
let pending = false;
function bind(id: string, run: () => Promise<void>) {
  document.getElementById(id)?.addEventListener("click", async () => {
    if (pending) return;
    pending = true;
    try {
      await run();
    } catch (error) {
      report(error instanceof Error ? error.message : "The popup could not be opened.");
    } finally {
      pending = false;
    }
  });
}

const messages: Record<string, PopupOptions> = {
  "popup-basic": { titleText: "Welcome back", text: "Your workspace is ready. Pick up where you left off." },
  "popup-success": { icon: "success", titleText: "Changes saved", text: "Your project settings are up to date." },
  "popup-error": { icon: "error", titleText: "Upload failed", text: "The file could not be uploaded. Please try again." },
  "popup-warning": { icon: "warning", titleText: "Check your settings", text: "Some required fields still need your attention." },
  "popup-info": { icon: "info", titleText: "A quick tip", text: "You can change the color theme using the palette in the navigation." },
  "popup-question": { icon: "question", titleText: "Need a hand?", text: "Explore the examples below to see what Popup can do." },
};

Object.entries(messages).forEach(([id, options]) => bind(id, async () => {
  await Popup.fire(options);
}));

bind("popup-confirm", async () => {
  const result = await Popup.fire({
    icon: "question",
    titleText: "Archive this project?",
    text: "You can restore it later from the archive.",
    showCancelButton: true,
    confirmButtonText: "Archive project",
    cancelButtonText: "Keep project",
    focusCancel: true,
  });
  report(result.isConfirmed ? "Demo result: project archived." : "Demo result: project kept.");
});

bind("popup-input", async () => {
  const result = await Popup.fire<string>({
    titleText: "Name your workspace",
    input: "text",
    inputLabel: "Workspace name",
    inputPlaceholder: "Animation studio",
    showCancelButton: true,
    confirmButtonText: "Create workspace",
    inputValidator: (value) => value.trim() ? undefined : "Enter a workspace name.",
  });
  report(result.isConfirmed ? `Demo result: created “${result.value}”.` : "Workspace creation cancelled.");
});

bind("popup-select", async () => {
  const result = await Popup.fire<string>({
    titleText: "Choose a department",
    input: "select",
    inputLabel: "Department",
    inputPlaceholder: "Select a department",
    inputOptions: { animation: "Animation", lighting: "Lighting", compositing: "Compositing" },
    showCancelButton: true,
    inputValidator: (value) => value ? undefined : "Choose a department.",
  });
  report(result.isConfirmed ? `Demo result: selected ${result.value}.` : "Department selection cancelled.");
});

bind("popup-async", async () => {
  const result = await Popup.fire<string>({
    titleText: "Prepare a preview?",
    text: "This demo simulates a two-second operation.",
    showCancelButton: true,
    confirmButtonText: "Prepare preview",
    showLoaderOnConfirm: true,
    allowOutsideClick: false,
    allowEscapeKey: false,
    preConfirm: () => new Promise<string>((resolve) => {
      window.setTimeout(() => resolve("Preview ready"), 2000);
    }),
  });
  report(result.isConfirmed ? `Demo result: ${result.value}.` : "Preview cancelled.");
});

bind("popup-toast", async () => {
  await Popup.fire({
    toast: true,
    position: "top-end",
    icon: "success",
    titleText: "Draft saved",
    showConfirmButton: false,
    timer: 2500,
    timerProgressBar: true,
  });
  report("Toast dismissed.");
});

bind("popup-draggable", async () => {
  await Popup.fire({
    titleText: "Move this popup",
    text: "Drag the line at the top. You can also focus it and use the arrow keys; Home resets the position.",
    draggable: true,
    showCloseButton: true,
    confirmButtonText: "Done",
  });
});

// Simulated work for the demo; real tasks can pass signal directly to fetch.
function stepperDelay(milliseconds: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const abort = () => {
      window.clearTimeout(timer);
      reject(new DOMException('Cancelled', 'AbortError'));
    };
    const timer = window.setTimeout(() => {
      signal.removeEventListener('abort', abort);
      resolve();
    }, milliseconds);
    if (signal.aborted) abort();
    else signal.addEventListener('abort', abort, { once: true });
  });
}

async function runStepper(simulateFailure = false) {
  let attempts = 0;
  const result = await Popup.steps<string>({
    title: 'Prepare a preview',
    description: 'Three async steps, with live progress. This demo does not upload any files.',
    steps: [
      {
        title: 'Check assets',
        description: 'Check that all required files are available.',
        run: async ({ signal, setMessage }) => {
          setMessage('Checking 12 source files…');
          await stepperDelay(1000, signal);
          setMessage('All 12 files are ready.');
          return 'Assets checked';
        },
      },
      {
        title: 'Render preview',
        description: 'Generate a preview from the checked assets.',
        run: async ({ signal, results, setMessage }) => {
          setMessage(`${results[0]}. Rendering preview…`);
          await stepperDelay(1300, signal);
          if (simulateFailure && attempts++ === 0) {
            throw new Error('The render worker was unavailable. Retry to continue.');
          }
          setMessage('Preview rendered.');
          return 'Preview rendered';
        },
      },
      {
        title: 'Package result',
        description: 'Prepare the preview for review.',
        run: async ({ signal, setMessage }) => {
          await stepperDelay(900, signal);
          setMessage('Ready for review.');
          return 'Preview ready';
        },
      },
    ],
  });
  report(result.isConfirmed
    ? `Stepper finished: ${result.value?.join(' → ')}.`
    : 'Stepper cancelled. Completed steps are not rolled back.');
}

bind('popup-stepper', () => runStepper());
bind('popup-stepper-retry', () => runStepper(true));
