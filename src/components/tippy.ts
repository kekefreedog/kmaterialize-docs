import tippy, { animateFill, type Props, type Instance } from "tippy.js";
import "tippy.js/dist/tippy.css";
import "tippy.js/dist/backdrop.css";
import "tippy.js/animations/shift-away.css";
import "./tippy.scss";

export type TooltipStyle = "classic" | "material";

/** Animated tooltip behavior, with an explicit style until the site default is chosen. */
export function createTooltip(
  target: HTMLElement,
  style: TooltipStyle,
  options: Partial<Props> = {},
): Instance {
  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  const instance = tippy(target, {
    animateFill: !reducedMotion,
    arrow: false,
    plugins: [animateFill],
    placement: "auto",
    theme: style === "material" ? "materialize" : "",
    allowHTML: false,
    ...options,
    ...(reducedMotion
      ? { animateFill: false, animation: false, duration: 0 }
      : {}),
  });
  // Escape dismisses a focused tooltip without moving keyboard focus.
  const escape = (event: KeyboardEvent) => {
    if (event.key === "Escape") instance.hide();
  };
  document.addEventListener("keydown", escape);
  const destroy = instance.destroy.bind(instance);
  instance.destroy = () => {
    document.removeEventListener("keydown", escape);
    destroy();
  };
  return instance;
}
