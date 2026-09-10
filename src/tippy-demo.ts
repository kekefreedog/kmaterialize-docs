import { createTooltip } from "./components/tippy";
import "./tippy-demo.scss";

// Both styles are explicit previews; no global Tippy defaults are changed.
createTooltip(document.querySelector<HTMLElement>("#tippy-classic")!, "classic", {
  content: "Save your review notes",
});
createTooltip(
  document.querySelector<HTMLElement>("#tippy-material")!,
  "material",
  {
    content: "Save your review notes",
  },
);
for (const target of document.querySelectorAll<HTMLElement>(
  "[data-tooltip-placement]",
)) {
  createTooltip(target, "classic", {
    content: `Preferred placement: ${target.dataset.tooltipPlacement}`,
    placement: target.dataset.tooltipPlacement as
      "top" | "right" | "bottom" | "left",
  });
}
createTooltip(document.querySelector<HTMLElement>("#tippy-touch")!, "classic", {
  content: "Tap outside or press Escape to dismiss.",
  trigger: "click",
});
const template = document.querySelector<HTMLTemplateElement>(
  "#tippy-content-template",
)!;
createTooltip(
  document.querySelector<HTMLElement>("#tippy-template")!,
  "classic",
  {
    content: template.content.firstElementChild!.cloneNode(true) as HTMLElement,
  },
);
