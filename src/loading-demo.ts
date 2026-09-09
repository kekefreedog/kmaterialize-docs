import { Loading } from "kmaterialize";

Loading.init(document.querySelectorAll(".loading:not(.no-autoinit)"));

const demo = document.querySelector<HTMLElement>("#loading-demo");
const startButton = document.querySelector<HTMLButtonElement>("#loading-demo-start");
const stopButton = document.querySelector<HTMLButtonElement>("#loading-demo-stop");
const status = document.querySelector<HTMLElement>("#loading-demo-status");

if (demo && startButton && stopButton && status) {
  const loading = Loading.init(demo, {
    active: false,
    label: "Loading workspace…",
    completeLabel: "Workspace ready",
  });

  startButton.addEventListener("click", () => {
    loading.start();
    status.textContent = "Loading workspace…";
    stopButton.disabled = false;
    stopButton.focus();
    startButton.disabled = true;
  });

  stopButton.addEventListener("click", () => {
    loading.stop();
    status.textContent = "Workspace ready.";
    startButton.disabled = false;
    startButton.focus();
    stopButton.disabled = true;
  });
}
