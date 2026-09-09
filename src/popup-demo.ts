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
