import { OrgChart } from "./components/org-chart";
import type { OrgChartData } from "./components/org-chart";

const initial: OrgChartData = {
  teams: [
    { id: "leadership", name: "Leadership", x: 32, y: 160 },
    { id: "design", name: "Design", borderColor: "var(--md-sys-color-tertiary)", x: 480, y: 32 },
    { id: "engineering", name: "Engineering", x: 480, y: 330 },
  ],
  people: [
    { id: "alex", teamId: "leadership", name: "Alex Morgan", role: "Creative director" },
    { id: "sam", teamId: "leadership", name: "Sam Rivera", role: "Producer" },
    { id: "jules", teamId: "design", name: "Jules Chen", role: "Design lead" },
    { id: "maya", teamId: "design", name: "Maya Patel", role: "Product designer", accent: "var(--md-sys-color-tertiary)", accentPosition: "left" },
    { id: "noah", teamId: "engineering", name: "Noah Kim", role: "Engineering lead", color: "var(--md-sys-color-primary)" },
    { id: "lea", teamId: "engineering", name: "Léa Martin", role: "Frontend developer" },
  ],
  links: [
    { from: "alex", to: "jules", label: "Creative direction" },
    { from: "sam", to: "noah", label: "Delivery" },
    { from: "maya", to: "lea", label: "Collaborates with" },
  ],
};

const host = document.querySelector<HTMLElement>("#org-chart-demo")!;
const status = document.querySelector<HTMLElement>("#org-chart-status")!;
const chart = OrgChart.init(host, {
  data: initial,
  editable: true,
  onChange: data => { status.textContent = `${data.teams.length} teams · ${data.people.length} people · ${data.links.length} relationships. Layout updated.`; },
});
const zoomValue = document.querySelector<HTMLOutputElement>("#org-chart-zoom-value")!;
const updateZoomLabel = () => { zoomValue.value = `${Math.round(chart.getZoom() * 100)}%`; zoomValue.textContent = zoomValue.value; };
host.addEventListener('zoomchange', updateZoomLabel);
document.querySelector("#org-chart-zoom-in")!.addEventListener("click", () => { chart.setZoom(chart.getZoom() + 0.1); updateZoomLabel(); });
document.querySelector("#org-chart-zoom-out")!.addEventListener("click", () => { chart.setZoom(chart.getZoom() - 0.1); updateZoomLabel(); });
document.querySelector("#org-chart-zoom-reset")!.addEventListener("click", () => { chart.resetZoom(); updateZoomLabel(); });
updateZoomLabel();
const dialog = document.querySelector<HTMLDialogElement>("#org-chart-editor")!;
const form = document.querySelector<HTMLFormElement>("#org-chart-form")!;
const fields = document.querySelector<HTMLElement>("#org-chart-fields")!;
const error = document.querySelector<HTMLElement>("#org-chart-error")!;
let mode: "team" | "person" | "link" = "team";

function field(name: string, label: string, choices?: { id: string; name: string }[], required = true): void {
  const wrapper = document.createElement("div");
  wrapper.className = "org-chart-field";
  const caption = document.createElement("label");
  caption.htmlFor = `org-input-${name}`;
  caption.textContent = label;
  const input = choices ? document.createElement("select") : document.createElement("input");
  input.id = caption.htmlFor;
  input.name = name;
  input.required = required;
  if (input instanceof HTMLSelectElement) {
    input.className = "browser-default";
    for (const choice of choices!) input.add(new Option(choice.name, choice.id));
  } else {
    input.type = "text";
    input.maxLength = name === "label" ? 40 : 80;
    input.placeholder = " ";
  }
  wrapper.append(caption, input);
  fields.append(wrapper);
}

document.querySelectorAll<HTMLButtonElement>("[data-org-add]").forEach(button => {
  button.addEventListener("click", () => {
    mode = button.dataset.orgAdd as typeof mode;
    const data = chart.getData();
    if ((mode === "person" && !data.teams.length) || (mode === "link" && data.people.length + data.teams.length < 2)) {
      status.textContent = mode === "person" ? "Add a team first." : "Add at least two people or teams first.";
      return;
    }
    fields.replaceChildren();
    error.textContent = "";
    document.querySelector("#org-chart-editor-title")!.textContent = { team: "Add a team", person: "Add a person", link: "Connect people & teams" }[mode];
    if (mode === "team") field("name", "Team name");
    if (mode === "person") {
      field("name", "Full name"); field("role", "Role (optional)", undefined, false); field("teamId", "Team", data.teams);
    }
    if (mode !== "link") {
      field("color", "Color tint (optional CSS color)", undefined, false);
      field("borderColor", "Border color (optional CSS color)", undefined, false);
      field("accent", "Accent color (optional CSS color)", undefined, false);
      field("accentPosition", "Accent edge", ["bottom", "top", "left", "right"].map(id => ({ id, name: id })));
    }
    if (mode === "link") {
      const choices = [
        ...data.teams.map(team => ({ id: `team:${team.id}`, name: `Team — ${team.name}` })),
        ...data.people.map(person => ({ id: `person:${person.id}`, name: `${person.name} — ${data.teams.find(team => team.id === person.teamId)!.name}` }))
      ];
      field("from", "From", choices); field("to", "To", choices);
      (form.elements.namedItem("to") as HTMLSelectElement).selectedIndex = 1;

    }
    dialog.showModal();
    fields.querySelector<HTMLElement>("input, select")?.focus();
  });
});
document.querySelector("#org-chart-cancel")!.addEventListener("click", () => dialog.close());
form.addEventListener("submit", event => {
  event.preventDefault();
  const values = new FormData(form);
  const value = (name: string) => String(values.get(name) || "").trim();
  const data = chart.getData();
  try {
    const appearance = { color: value("color"), borderColor: value("borderColor"), accent: value("accent"), accentPosition: value("accentPosition") as "top" | "bottom" | "left" | "right" };
    for (const color of [appearance.color, appearance.borderColor, appearance.accent]) {
      if (color && !CSS.supports("color", color)) throw new Error("Enter a valid CSS color, such as teal or #7c4dff.");
    }
    if (mode === "team") {
      const right = Math.max(0, ...data.teams.map(team => team.x + 320));
      data.teams.push({ ...appearance, id: crypto.randomUUID(), name: value("name"), x: right, y: 32 });
    }
    if (mode === "person") data.people.push({ ...appearance, id: crypto.randomUUID(), name: value("name"), role: value("role"), teamId: value("teamId") });
    if (mode === "link") {

      const endpoint = (name: string) => {
        const raw = value(name);
        const colon = raw.indexOf(":");
        return { type: raw.slice(0, colon) as "person" | "team", id: raw.slice(colon + 1) };
      };
      const from = endpoint("from"), to = endpoint("to");
      if (data.links.some(link => link.from === from.id && link.to === to.id && (link.fromType || "person") === from.type && (link.toType || "person") === to.type)) throw new Error("These endpoints already have a relationship in this direction.");
      data.links.push({ from: from.id, to: to.id, fromType: from.type, toType: to.type, label: "New link" });
    }
    chart.setData(data);
    dialog.close();
    if (mode === "team") host.scrollLeft = host.scrollWidth;
  } catch (reason) {
    error.textContent = reason instanceof Error ? reason.message : "Could not update the chart.";
  }
});
document.querySelector("#org-chart-reset")!.addEventListener("click", () => {
  chart.setData(initial);
  chart.resetZoom();
  host.scrollTo(0, 0);
  status.textContent = "Example restored. Drag a team header, or focus it and use the arrow keys.";
});
document.querySelector("#org-chart-export")!.addEventListener("click", () => {
  const url = URL.createObjectURL(new Blob([JSON.stringify(chart.getData(), null, 2)], { type: "application/json" }));
  const anchor = document.createElement("a");
  anchor.href = url; anchor.download = "org-chart.json"; anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  status.textContent = "Chart exported as JSON, including team positions and relationships.";
});
let pdfTheme: 'light' | 'dark' = 'light';
const pdfThemeButton = document.querySelector<HTMLButtonElement>('#org-chart-pdf-theme')!;
pdfThemeButton.addEventListener('click', () => {
  pdfTheme = pdfTheme === 'light' ? 'dark' : 'light';
  pdfThemeButton.textContent = `PDF: ${pdfTheme === 'light' ? 'Light' : 'Dark'}`;
  pdfThemeButton.setAttribute('aria-pressed', String(pdfTheme === 'dark'));
  pdfThemeButton.title = `Switch PDF export to ${pdfTheme === 'light' ? 'dark' : 'light'} mode`;
});
document.querySelector('#org-chart-export-pdf')!.addEventListener('click', () => {
  chart.exportPdf('People & teams', { theme: pdfTheme }).catch(reason => {
    status.textContent = reason instanceof Error ? reason.message : 'Could not open the print preview.';
  });
});


// A separate instance: edits and reset never affect the horizontal example.
const verticalData: OrgChartData = {
  teams: [
    { id: "leadership", name: "Leadership", x: 208, y: 32, accent: "var(--md-sys-color-primary)", accentPosition: "top" },
    { id: "design", name: "Design", x: 32, y: 360, borderColor: "var(--md-sys-color-tertiary)" },
    { id: "engineering", name: "Engineering", x: 384, y: 360 },
  ],
  people: initial.people,
  links: [
    { from: "leadership", fromType: "team", to: "design", toType: "team", label: "Creative direction" },
    { from: "leadership", fromType: "team", to: "engineering", toType: "team", label: "Delivery" },
  ],
};
const verticalHost = document.querySelector<HTMLElement>("#org-chart-vertical-demo")!;
const verticalStatus = document.querySelector<HTMLElement>("#org-chart-vertical-status")!;
const verticalChart = OrgChart.init(verticalHost, {
  orientation: "vertical",
  data: verticalData,
  editable: true,
  onChange: () => { verticalStatus.textContent = "Vertical layout updated. Connections follow the teams and people as they move."; },
});
document.querySelector("#org-chart-vertical-reset")!.addEventListener("click", () => {
  verticalChart.setData(verticalData);
  verticalHost.scrollTo(0, 0);
  verticalStatus.textContent = "Vertical example restored.";
});
