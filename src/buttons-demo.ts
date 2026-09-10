import "./components/material-buttons.scss";
import "./buttons-demo.scss";
import { initMaterialButtons } from "./components/material-buttons";

const examples = document.querySelector<HTMLElement>("#button-examples")!;
initMaterialButtons(examples);
examples.addEventListener("buttonaction", (event) => {
  const { action, pressed } = (event as CustomEvent).detail;
  const suffix =
    pressed === null ? "" : pressed === "true" ? " selected" : " cleared";
  document.querySelector("#button-demo-status")!.textContent =
    `${action}${suffix}.`;
});
