import { CodeCard, Forms } from "kmaterialize";
import { codeSnippetsReady } from "./code-snippets";

/** Documentation controls for the library's reusable code cards. */
const events = new AbortController();
const instances:CodeCard[] = [];
let disposed = false;

async function initialize():Promise<void> {
    await codeSnippetsReady;
    if(disposed) return;

    instances.push(...CodeCard.init(document.querySelectorAll(".code-card.no-autoinit:not(.docs-code)")));
    await Promise.all(instances.map(instance => instance.ready));
    if(disposed) return;

    const controls = document.querySelector<HTMLFormElement>("#code-controls");
    const source = document.querySelector<HTMLTextAreaElement>("#code-source");
    const language = document.querySelector<HTMLSelectElement>("#code-language");
    const title = document.querySelector<HTMLInputElement>("#code-title");
    const copy = document.querySelector<HTMLInputElement>("#code-copy");
    const card = CodeCard.getInstance(document.querySelector<HTMLElement>("#code-playground"));
    const configuration = CodeCard.getInstance(document.querySelector<HTMLElement>("#code-configuration"));
    const update = ():void => {
        const options = {
            code: source.value,
            language: language.value,
            title: title.value,
            copy: copy.checked,
            highlight: language.value !== "plain",
        };
        Forms.textareaAutoResize(source);
        void card.update(options).catch(showError);
        const code = 'const card = CodeCard.init(document.querySelector("#my-code"), ' + JSON.stringify(options, null, 4) + ");\nawait card.ready;";
        void configuration.update({ code }).catch(showError);
    };
    window.addEventListener("resize", () => Forms.textareaAutoResize(source), { signal: events.signal });
    controls.addEventListener("input", update, { signal: events.signal });
    controls.addEventListener("submit", event => event.preventDefault(), { signal: events.signal });
    update();
    document.querySelector<HTMLElement>("#code-demo-status").textContent = "";
    document.querySelector("#code-playground").setAttribute("data-demo-ready", "true");
}

function showError(error:unknown):void {
    if(disposed) return;
    document.querySelector<HTMLElement>("#code-demo-status").textContent = "The code examples could not initialize. Check the browser console for details.";
    console.error(error);
}

void initialize().catch(showError);
if(import.meta.hot) import.meta.hot.dispose(() => {
    disposed = true;
    events.abort();
    instances.forEach(instance => instance.destroy());
});
