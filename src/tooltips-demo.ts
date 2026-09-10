import { createTooltip } from "kmaterialize/tippy";
import "./tooltips-demo.scss";

// Classic is the library default; Material remains an explicit option.
createTooltip(document.querySelector<HTMLElement>("#tippy-classic")!, {
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
