import {
  applyTheme,
  argbFromHex,
  themeFromSourceColor,
} from "@material/material-color-utilities";
import { Themes } from "./themes";
import "./color-theme-demo.scss";

const seed = document.querySelector<HTMLInputElement>("#theme-demo-seed")!;
const dark = document.querySelector<HTMLInputElement>("#theme-demo-dark")!;
const card = document.querySelector<HTMLElement>("#theme-demo-card")!;
const section = document.querySelector<HTMLElement>("#theme-demo-section")!;
const status = document.querySelector<HTMLElement>("#theme-demo-status")!;
const savedTheme = new Themes(document);
dark.checked = savedTheme.isDarkMode();

// Only CSS tokens on the chosen target change; no saved preference is overwritten.
function previewTheme(target: HTMLElement) {
  const theme = themeFromSourceColor(argbFromHex(seed.value));
  applyTheme(theme, { target, dark: dark.checked });
  target.style.colorScheme = dark.checked ? "dark" : "light";
  if (target === document.body) {
    document.documentElement.setAttribute(
      "theme",
      dark.checked ? "dark" : "light",
    );
    document.documentElement.style.colorScheme = dark.checked
      ? "dark"
      : "light";
  }
}

document
  .querySelector("#theme-demo-page-apply")!
  .addEventListener("click", () => {
    previewTheme(document.body);
    status.textContent = `Page preview: ${seed.value}, ${dark.checked ? "dark" : "light"} mode.`;
  });
for (const [id, target] of [
  ["#theme-demo-card-apply", card],
  ["#theme-demo-section-apply", section],
] as const) {
  document.querySelector(id)!.addEventListener("click", () => {
    previewTheme(target);
    status.textContent = `${target === card ? "Card" : "Section"} preview updated; the page palette is unchanged.`;
  });
}

document.querySelector("#theme-demo-reset")!.addEventListener("click", () => {
  // Remove only generated theme properties, so these examples inherit the page again.
  for (const target of [card, section]) {
    Array.from(target.style)
      .filter((name) => name.startsWith("--md-sys-color-"))
      .forEach((name) => target.style.removeProperty(name));
    target.style.removeProperty("color-scheme");
  }
  const isDark = savedTheme.isDarkMode();
  savedTheme.applyThemeProperties(isDark);
  document.body.style.removeProperty("color-scheme");
  document.documentElement.setAttribute("theme", isDark ? "dark" : "light");
  dark.checked = isDark;
  status.textContent =
    "Saved page theme restored. Card and section inherit it again.";
});
