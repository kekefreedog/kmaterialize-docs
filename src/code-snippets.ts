import { CodeCard } from "kmaterialize";

/** Share Prism grammars and CodeCard ownership across documentation pages. */
const instances:CodeCard[] = [];
let disposed = false;

async function initialize():Promise<void> {
    const cards = Array.from(document.querySelectorAll<HTMLElement>(".code-card"));
    if(!cards.length) return;

    const scope = window as Window & { Prism?:{ manual:boolean } };
    if(!scope.Prism) scope.Prism = { manual: true };
    const { default:prism } = await import("prismjs");
    prism.manual = true;

    const languages = new Set(cards.map(card => card.dataset.codeLanguage ||
        Array.from(card.querySelector("code")?.classList || []).find(name => name.startsWith("language-"))?.slice(9) || "plain"));
    const loaders:Record<string, () => Promise<unknown>> = {
        typescript: () => import("prismjs/components/prism-typescript.js"),
        scss: () => import("prismjs/components/prism-scss.js"),
        json: () => import("prismjs/components/prism-json.js"),
        yaml: () => import("prismjs/components/prism-yaml.js"),
        bash: () => import("prismjs/components/prism-bash.js"),
        python: () => import("prismjs/components/prism-python.js"),
        markdown: () => import("prismjs/components/prism-markdown.js"),
        php: () => import("prismjs/components/prism-php.js"),
        handlebars: () => import("prismjs/components/prism-handlebars.js"),
    };
    if(languages.has("php") || languages.has("handlebars"))
        await import("prismjs/components/prism-markup-templating.js");
    await Promise.all(Array.from(languages, language => loaders[language]?.()));
    if(disposed) return;

    instances.push(...cards.filter(card => card.classList.contains("docs-code")).map(card => CodeCard.init(card)));
    await Promise.all(instances.map(instance => instance.ready));
}

export const codeSnippetsReady = initialize();

/** Keep rendered source and the copy action synchronized for live demo output. */
export async function updateCodeSnippet(id:string, code:string):Promise<void> {
    await codeSnippetsReady;
    if(disposed) return;
    const element = document.getElementById(id);
    const instance = element && CodeCard.getInstance(element);
    if(!instance) throw new Error("Missing documentation code card: " + id);
    await instance.update({ code });
}

if(import.meta.hot) import.meta.hot.dispose(() => {
    disposed = true;
    instances.forEach(instance => instance.destroy());
});
