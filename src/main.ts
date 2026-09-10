import { enableCardHandles } from 'kmaterialize';
import { config } from "../config.materialize";
import "./style.scss";
//import { argbFromHex, themeFromSourceColor } from "@material/material-color-utilities";
import { Themes } from "./themes";
import { autocompleteDemoData } from "./data-autocomplete";
import hljs from "highlight.js";
import * as M from "kmaterialize";
import {
  Autocomplete,
  Cards,
  Carousel,
  CharacterCounter,
  Chips,
  Collapsible,
  Datepicker,
  Dropdown,
  FloatingActionButton,
  FormSelect,
  Materialbox,
  Modal,
  Parallax,
  Pushpin,
  ScrollSpy,
  Sidenav,
  Slider,
  Tabs,
  TapTarget,
  Timepicker,
  Toolbar,
  Tooltip,
  PasswordInput,
  NumberInput,
  ColorInput,
  AirDatepickerField,
  Alert,
  Kanban,
  FileInput,
  TomSelectField,
} from "kmaterialize";

// Docs pages have live `onclick="M.toast(...)"` / `M.Waves...` handlers
// demonstrating the public API - expose the same namespace globally so
// those actually work, matching what the CDN/IIFE build provides.
(window as any).M = M;

// Apply the saved/default theme as soon as the module runs. Waiting until
// DOMContentLoaded leaves the navbar and page surface painted with the
// library's default blue palette for a frame (or permanently if another
// page-specific initializer throws).
const themes = new Themes(document);
themes.applyThemeProperties(themes.isDarkMode());

function importCodeStyle(isDarkMode) {
  if (isDarkMode) import("highlight.js/styles/atom-one-dark.min.css");
  else import("highlight.js/styles/atom-one-light.min.css");
}

function rgb2hex(rgb: string) {
  if (/^#[0-9A-F]{6}$/i.test(rgb)) return rgb;
  const rgbMatch = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
  if (rgbMatch === null) return "N/A";
  function hex(x: string) {
    return ("0" + parseInt(x).toString(16)).slice(-2);
  }
  return "#" + hex(rgbMatch[1]) + hex(rgbMatch[2]) + hex(rgbMatch[3]);
}

// Detect touch screen and enable scrollbar if necessary
function is_touch_device() {
  try {
    document.createEvent("TouchEvent");
    return true;
  } catch (e) {
    return false;
  }
}

function escapeHtml(unsafe) {
  return unsafe.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

// The module is loaded at the end of <body>, so all page inputs already
// exist. Initialize optional color pickers independently: an exception in
// another docs component must not leave Firefox's native picker active.
// Set the persisted seed before the asynchronous picker reads its initial value.
const paletteInput = document.querySelector<HTMLInputElement>('#color-picker');
if (paletteInput) {
  paletteInput.value = themes.getThemePrimaryColor();
  paletteInput.setAttribute('value', paletteInput.value);
}
const colorInputs = ColorInput.init(document.querySelectorAll('input[type="color"][data-color-picker="pickr"]'), {});
for (const input of colorInputs) {
  // Sync without emitting another Pickr save event (save -> change -> setColor).
  input.el.removeEventListener('change', input._handleInputChange);
  input._handleInputChange = () => { input.pickr?.setColor(input.el.value, true); };
  input.el.addEventListener('change', input._handleInputChange);
  if (input.el === paletteInput) {
    // Open the existing picker directly, anchored to the header palette control.
    document.querySelector('#palette-trigger')?.addEventListener('click', (event) => {
      event.preventDefault();
      void input.ready.then(() => input.pickr?.show());
    });
    void input.ready.then(() => {
      const { button, app } = input.pickr!.getRoot() as { button: HTMLButtonElement; app: HTMLElement };
      button.tabIndex = -1;
      button.setAttribute('aria-hidden', 'true');
      // The header previews and persists immediately; other color inputs keep Save.
      app.querySelector<HTMLElement>('.pcr-save')?.remove();
      input.pickr!.on('change', (color) => {
        const value = color.toHEXA().toString();
        if (input.el.value.toLowerCase() === value.toLowerCase()) return;
        input.el.value = value;
        input.el.dispatchEvent(new Event('change', { bubbles: true }));
      });
    });
  }
  const dialog = input.el.closest('dialog');
  if (dialog) {
    void input.ready.then(() => {
      // Keep the popup in the dialog's top layer so it remains visible and clickable.
      const popup = (input.pickr!.getRoot() as { app: HTMLElement }).app;
      dialog.append(popup);
      dialog.addEventListener('close', () => input.pickr?.hide());
    });
  }
}
AirDatepickerField.init(document.querySelectorAll('input[data-date-picker="air-datepicker"]'), {});
FileInput.init(document.querySelectorAll('.file-field[data-file-picker="filepond"]'), {});
// FormSelect must not depend on every unrelated docs demo initializing first.
// Keep native browser selects and Tom Select opt-ins out of this pass.
FormSelect.init(document.querySelectorAll("select:not(.browser-default):not(.tomselected)"), {});
// Tom Select must initialize immediately as well. Keeping it outside the
// shared DOMContentLoaded demo registry prevents an unrelated page demo from
// stopping this enhancement and leaving the native browser select visible.
TomSelectField.init(document.querySelectorAll("select.tomselected"), {});

function initNavbarTabs() {
  const tabsEl = document.querySelector<HTMLElement>("#navbar-demo-tabs");
  if (!tabsEl || (tabsEl as any).M_Tabs) return;
  try {
    Tabs.init(tabsEl, {});
  } catch (error) {
    console.error("Failed to initialize Extended Navbar tabs", error);
  }
}

// Keep horizontal-scroll edge fades honest: only show a fade when more
// content exists in that direction.
document.querySelectorAll<HTMLElement>(".navbar-scroll").forEach((navbar) => {
  const row = navbar.querySelector<HTMLElement>(".nav-wrapper");
  if (!row) return;
  const leftFade = document.createElement("span");
  const rightFade = document.createElement("span");
  leftFade.className = "navbar-scroll-fade navbar-scroll-fade-left";
  rightFade.className = "navbar-scroll-fade navbar-scroll-fade-right";
  leftFade.setAttribute("aria-hidden", "true");
  rightFade.setAttribute("aria-hidden", "true");
  navbar.append(leftFade, rightFade);
  const updateScrollEdges = () => {
    const maxScroll = Math.max(0, row.scrollWidth - row.clientWidth);
    const atStart = row.scrollLeft <= 1;
    const atEnd = maxScroll <= 1 || row.scrollLeft >= maxScroll - 1;
    navbar.classList.toggle("is-scroll-start", atStart);
    navbar.classList.toggle("is-scroll-end", atEnd);
    navbar.style.setProperty("--scroll-left-fade", atStart ? "0" : "1");
    navbar.style.setProperty("--scroll-right-fade", atEnd ? "0" : "1");
    leftFade.classList.toggle("is-hidden", atStart);
    rightFade.classList.toggle("is-hidden", atEnd);
  };
  row.addEventListener("scroll", updateScrollEdges, { passive: true });
  window.addEventListener("resize", updateScrollEdges);
  updateScrollEdges();
});

document.addEventListener("DOMContentLoaded", () => {
  // The extended navbar tabs must be wired before the remaining page
  // components mutate or measure the surrounding navigation layout.
  initNavbarTabs();

  // CSS > Colors
  document.querySelectorAll(".dynamic-color .col > div").forEach((el) => {
    const color = getComputedStyle(el).backgroundColor;
    const classesText = Array.from(el.classList).join(" ");
    (el as any).innerText = `${rgb2hex(color)} ${classesText}`;
    // swap text color
    if (classesText.indexOf("darken") >= 0 || el.classList.contains("black")) (el as any).style.color = "rgba(255,255,255,.87";
    else (el as any).style.color = "rgba(0, 0, 0, .87";
  });

  // Search Materialize Docs
  const searchInput = document.querySelector(".search-docs");
  if (searchInput) {
    const pages = config.pages.map((el) => ({
      id: el.id,
      text: el.name,
      description: el.description,
      url: el.url,
    }));
    Autocomplete.init(<HTMLInputElement>searchInput, {
      minLength: 1,
      data: pages,
      onAutocomplete: (items) => {
        if (items.length === 1) {
          const targetItem = items[0];
          document.location.href = targetItem["url"];
        }
      },
    });
  }

  // Github Latest Commit
  const githubCommitElem = document.querySelector(".github-commit");
  if (githubCommitElem != null) {
    // Checks if widget div exists (Index only)
    fetch("https://api.github.com/repos/kekefreedog/kmaterialize/commits/main")
      .then((resp) => resp.json())
      .then((data) => {
        const url = data.html_url;
        const sha = data.sha.substring(0, 7);
        const date = data.commit.author.date;
        (githubCommitElem.querySelector(".date") as HTMLElement).innerText = date;
        (githubCommitElem.querySelector(".sha") as HTMLElement).innerText = sha;
        (githubCommitElem.querySelector(".sha") as HTMLLinkElement).href = url;
      });
  }

  // Floating-Fixed Table of Contents
  const tocWrapperHeight = 260; // Max height of ads.
  const socialHeight = 95; // Height of unloaded social media in footer.
  const tocElem = document.querySelector(".toc-wrapper .table-of-contents");
  const tocHeight = tocElem ? tocElem.getBoundingClientRect().height : 0;

  const footerElem = document.querySelector("body > footer");
  const footerOffset = footerElem ? footerElem.getBoundingClientRect().top - window.scrollY + document.documentElement.clientTop : 0;

  const bottomOffset = footerOffset - socialHeight - tocHeight - tocWrapperHeight;

  const nav = document.querySelector("nav");
  const indexBanner = document.querySelector("#index-banner");
  const tocWrappers = document.querySelectorAll(".toc-wrapper");

  if (Pushpin) {
    if (nav)
      Pushpin.init(tocWrappers, {
        top: nav.getBoundingClientRect().height,
        bottom: bottomOffset,
      });
    else if (indexBanner)
      Pushpin.init(tocWrappers, {
        top: indexBanner.getBoundingClientRect().height,
        bottom: bottomOffset,
      });
    else Pushpin.init(tocWrappers, { top: 0, bottom: bottomOffset });
  }

  // Toggle Flow Text
  const toggleFlowTextButton = document.querySelector("#flow-toggle");
  const flowDemoParagraphs = document.querySelectorAll("#flow-text-demo p");
  toggleFlowTextButton?.addEventListener("click", () => {
    flowDemoParagraphs.forEach((p) => {
      p.classList.toggle("flow-text");
    });
  });

  // Toggle Containers on page
  const toggleContainersButton = document.querySelector("#container-toggle-button");
  toggleContainersButton?.addEventListener("click", () => {
    document.querySelectorAll("body .browser-window .container, .had-container").forEach((el) => {
      el.classList.toggle("had-container");
      el.classList.toggle("container");
      const nextStateText = el.classList.contains("container") ? "off" : "on";
      (toggleContainersButton as HTMLElement).innerText = "Turn " + nextStateText + " Containers";
    });
  });

  // Set checkbox on forms.html to indeterminate
  const indeterminateCheckbox = document.getElementById("indeterminate-checkbox");
  if (indeterminateCheckbox !== null) (indeterminateCheckbox as any).indeterminate = true;

  // CSS Transitions Demo Init
  const scaleDemoElem = document.querySelector("#scale-demo");
  const scaleDemoTriggerElem = document.querySelector("#scale-demo-trigger");
  if (scaleDemoElem && scaleDemoTriggerElem) {
    scaleDemoTriggerElem.addEventListener("click", () => {
      scaleDemoElem.classList.toggle("scale-out");
    });
  }

  // Pushpin Demo Init
  const pushPinDemoNavElems = document.querySelectorAll(".pushpin-demo-nav");
  pushPinDemoNavElems.forEach((navElem) => {
    const navBox = navElem.getBoundingClientRect();
    const contentElem = document.querySelector("#" + navElem.getAttribute("data-target"));
    const contentBox = contentElem.getBoundingClientRect();
    const offsetTop = Math.floor(contentBox.top + window.scrollY - document.documentElement.clientTop);
    Pushpin.init(<HTMLElement>navElem, {
      top: offsetTop,
      bottom: offsetTop + contentBox.height - navBox.height,
    });
  });

  // Mobile Overflow
  if (is_touch_device()) {
    (document.querySelector("#nav-mobile") as HTMLElement).style.overflow = "auto";
  }

  //---------------------------------------------------------------
  // Theme
  const isDarkMode = themes.isDarkMode();
  importCodeStyle(isDarkMode);
  themes.applyThemeProperties(isDarkMode);

  function setBtnState(isDark: boolean) {
    const themeSwitch = document.querySelector("#theme-switch");
    if (!themeSwitch) return;
    if (isDark) {
      themeSwitch.classList.add("is-dark");
      // Icon reflects the current state (moon while dark), not the
      // state clicking switches to - was the other way round, which
      // reads backward.
      themeSwitch.querySelector("i").innerText = "dark_mode";
      (themeSwitch as any).title = "Switch to light mode";
      return;
    }
    themeSwitch.classList.remove("is-dark");
    themeSwitch.querySelector("i").innerText = "light_mode";
    (themeSwitch as any).title = "Switch to dark mode";
  }
  setBtnState(isDarkMode);

  const themeSwitch = document.querySelector("#theme-switch");
  themeSwitch?.addEventListener("click", (e) => {
    e.preventDefault();
    if (!themeSwitch.classList.contains("is-dark")) {
      setBtnState(true);
      themes.setDarkMode();
    } else {
      setBtnState(false);
      themes.setLightMode();
    }
  });

  const toggleColorsButton = <HTMLInputElement>document.getElementById("color-picker");
  const themePrimaryColor = themes.getThemePrimaryColor();
  if (toggleColorsButton && themePrimaryColor) {
    toggleColorsButton.value = themePrimaryColor;
  }
  toggleColorsButton?.addEventListener("change", () => {
    themes.setThemePrimaryColor(toggleColorsButton.value);
  });

  const toggleFontButton = <HTMLSelectElement>document.getElementById("font-picker");
  if (toggleFontButton) {
    toggleFontButton.value = themes.getFont();
  }
  toggleFontButton?.addEventListener("change", () => {
    themes.setFont(toggleFontButton.value);
  });

  document.querySelector("#downloadCss")?.addEventListener("click", () => {
    themes.downloadCss();
  });

  //---------------------------------------------------------------

  //------ Copy Button

  // Each button finds its own .copiedText/.copyMessage via the shared <pre>
  // ancestor, rather than pairing them up by matching index across three
  // separate page-wide querySelectorAll arrays. The old array-index approach
  // silently mis-paired (or crashed on undefined) as soon as a single block
  // anywhere on the page had a mismatched count - which happened repeatedly
  // in practice. DOM-relative lookup can't misalign this way.
  document.querySelectorAll<HTMLElement>(".copyButton").forEach((btn) => {
    const container = btn.closest("pre");
    const textEl = container?.querySelector<HTMLElement>(".copiedText");
    const msgEl = container?.querySelector<HTMLElement>(".copyMessage");
    if (!container || !textEl || !msgEl) {
      console.warn("Copy button missing a .copiedText/.copyMessage sibling in the same <pre>", btn);
      return;
    }
    btn.addEventListener("click", () => {
      navigator.clipboard.writeText(textEl.innerText);
      msgEl.style.opacity = "1";
      setTimeout(() => {
        msgEl.style.opacity = "0";
      }, 2000);
    });
  });

  //------ Code Highlighting

  document.querySelectorAll("pre code").forEach((el: HTMLElement) => {
    const xmp = el.querySelector("xmp");
    if (xmp) el.innerHTML = escapeHtml(xmp.innerHTML);
    hljs.highlightElement(el);
  });

  //------  Materialize Components

  Cards.init(document.querySelectorAll(".card"));
  Alert.init(document.querySelectorAll(".alert"), {});
  document.querySelector("#restore-alert")?.addEventListener("click", () => {
    const alert = Alert.getInstance(document.querySelector("#dismissible-alert") as HTMLElement);
    alert?.open();
  });
  const kanbanInstances = Kanban.init(document.querySelectorAll(".kanban-board"), {
    onMove: ({ card, to }) => {
      const status = document.querySelector<HTMLElement>("#kanban-status");
      const columnName = to.querySelector<HTMLElement>(".kanban-column-title")?.textContent?.trim() || "the new column";
      if (status) status.textContent = `${card.querySelector(".kanban-card-title")?.textContent || "Card"} moved to ${columnName}.`;
    },
  });

  kanbanInstances?.forEach(instance => {
    enableCardHandles(instance.el, {
      cardSelector: '.kanban-card', dropSelector: '.kanban-column-body',
      enabled: card => instance.options.draggable && !card.classList.contains('is-disabled') && card.getAttribute('aria-disabled') !== 'true',
      onMove: (card, from, to) => {
        instance.el.querySelectorAll<HTMLElement>('.kanban-column').forEach(column => {
          const count = column.querySelector('.kanban-column-count');
          const total = column.querySelectorAll('.kanban-card').length;
          if (count) count.textContent = String(total);
          const empty = column.querySelector<HTMLElement>('.kanban-empty');
          if (empty) empty.hidden = total > 0;
        });
        instance.options.onMove?.({ card, from: from.closest('.kanban-column')!, to: to.closest('.kanban-column')! });
      },
    });
  });
  const kanbanDemo = document.querySelector<HTMLElement>("#kanban-demo");
  const kanban = kanbanDemo ? Kanban.getInstance(kanbanDemo) as (typeof Kanban extends { getInstance: (...args: any[]) => infer R } ? R : any) & {
    setZoom(value: number): void;
    getZoom(): number;
    resetZoom(): void;
  } : undefined;
  const kanbanZoomValue = document.querySelector<HTMLOutputElement>("#kanban-zoom-value");
  const updateKanbanZoom = () => {
    if (kanbanZoomValue && kanban) kanbanZoomValue.textContent = `${Math.round(kanban.getZoom() * 100)}%`;
  };
  document.querySelector("#kanban-zoom-in")?.addEventListener("click", () => { if (kanban) kanban.setZoom(kanban.getZoom() + 0.1); updateKanbanZoom(); });
  document.querySelector("#kanban-zoom-out")?.addEventListener("click", () => { if (kanban) kanban.setZoom(kanban.getZoom() - 0.1); updateKanbanZoom(); });
  document.querySelector("#kanban-zoom-reset")?.addEventListener("click", () => { kanban?.resetZoom(); updateKanbanZoom(); });
  updateKanbanZoom();

  Carousel.init(document.querySelectorAll(".carousel"), {});
  Carousel.init(document.querySelectorAll(".carousel.carousel-slider"), {
    fullWidth: true,
    indicators: true,
    onCycleTo: () => {},
  });

  Collapsible.init(document.querySelectorAll(".collapsible"), {});
  Collapsible.init(document.querySelectorAll(".collapsible.expandable"), {
    accordion: false,
  });

  Dropdown.init(document.querySelectorAll(".dropdown-trigger:not(.no-autoinit)"), {
    container: document.body,
  });
  Dropdown.init(document.querySelector("#dropdown-demo-left"), {
    alignment: "left",
    constrainWidth: false,
  });
  Dropdown.init(document.querySelector("#dropdown-demo-right"), {
    alignment: "right",
    constrainWidth: false,
  });

  Parallax.init(document.querySelectorAll(".parallax"), {});

  Materialbox.init(document.querySelectorAll(".materialboxed"), {});
  Slider.init(document.querySelectorAll(".slider"), {});

  Modal.init(document.querySelectorAll(".modal"), {});

  ScrollSpy.init(document.querySelectorAll(".scrollspy"), {});

  Datepicker.init(document.querySelectorAll(".datepicker"), {});

  Tabs.init(document.querySelectorAll(".tabs:not(#navbar-demo-tabs)"), {});
  Tabs.init(document.querySelectorAll("#tabs-swipe-demo"), {
    swipeable: true,
  });

  // Excludes .fixed-action-btn.toolbar - that's an unrelated FAB display
  // mode reusing the same class name, not this component.
  Toolbar.init(document.querySelectorAll(".toolbar:not(.fixed-action-btn)"), {});

  Timepicker.init(document.querySelectorAll(".timepicker"), {});

  Tooltip.init(document.querySelectorAll(".tooltipped"), {});

  Sidenav.init(document.querySelectorAll(".sidenav"), {});

  const tts = TapTarget.init(document.querySelectorAll(".tap-target"), {});
  document.querySelector("#open-taptarget")?.addEventListener("click", () => tts[0].open());
  document.querySelector("#close-taptarget")?.addEventListener("click", () => tts[0].close());

  CharacterCounter.init(document.querySelectorAll("[maxlength]"), {});

  PasswordInput.init(document.querySelectorAll("input[data-password-toggle]"), {});
  NumberInput.init(document.querySelectorAll('input[data-type="number"]'), {});
  Autocomplete.init(document.querySelectorAll("input.autocomplete"), {
    minLength: 0,
    data: autocompleteDemoData,
  });
  Autocomplete.init(document.querySelectorAll("input.autocomplete-multiple"), {
    isMultiSelect: true,
    minLength: 1,
    data: autocompleteDemoData,
  });

  Chips.init(document.querySelectorAll(".chips"), {});
  Chips.init(document.querySelectorAll(".chips-initial"), {
    data: autocompleteDemoData.filter((country) => ["ma", "ta", "er", "ia", "li", "ze"].includes(country.id)),
  });
  Chips.init(document.querySelectorAll(".chips-placeholder"), {
    placeholder: "Enter a tag",
    secondaryPlaceholder: "+Tag",
  });
  Chips.init(document.querySelectorAll(".chips-autocomplete"), {
    autocompleteOptions: {
      data: autocompleteDemoData,
    },
  });

  FloatingActionButton.init(document.querySelectorAll(".fixed-action-btn"), {});
  FloatingActionButton.init(document.querySelectorAll(".fixed-action-btn.horizontal"), {
    direction: "left",
  });
  FloatingActionButton.init(document.querySelectorAll(".fixed-action-btn.click-to-toggle"), {
    direction: "left",
    hoverEnabled: false,
  });
  FloatingActionButton.init(document.querySelectorAll(".fixed-action-btn.toolbar"), {
    toolbarEnabled: true,
  });
});
