/** Documentation examples consume the public Kmaterialize editor APIs. */
import { ScreenplayEditor, ScriptEditor, Storyboard, Toolbar } from "kmaterialize";
import type { ScreenplayDocument, StoryboardShot } from "kmaterialize";
import { updateCodeSnippet } from "./code-snippets";

/** Initial screenplay used by the live documentation. */
const screenplay:ScreenplayDocument = {
    title:"The last light",
    blocks:[
        {id:"scene-1", type:"scene", text:"EXT. MOUNTAIN LAKE — DAWN"},
        {id:"action-1", type:"action", text:"Mist drifts across the water. A lone boat touches the shore."},
        {id:"character-1", type:"character", text:"MAYA"},
        {id:"parenthetical-1", type:"parenthetical", text:"(quietly)"},
        {id:"dialogue-1", type:"dialogue", text:"We made it before the light."},
        {id:"transition-1", type:"transition", text:"CUT TO:"},
    ],
};

/** Initial visual shot sequence. */
const shots:StoryboardShot[] = [
    {id:"shot-1", title:"Establishing the lake", image:"images/sample-1.jpg", description:"The first light catches the mountain ridge. Hold on the still water.", camera:"Wide · locked off", duration:5},
    {id:"shot-2", title:"Approaching the shore", image:"images/parallax1.jpg", description:"A small boat enters frame. Follow it toward the landing.", camera:"Medium · slow pan", duration:4},
    {id:"shot-3", title:"A moment of recognition", image:"", description:"Maya looks toward the light. Leave a beat before the cut.", camera:"Close-up · eye level", duration:3},
];

/** Script samples are edited as text and never run. */
const samples:Record<string, string> = {
    javascript:'// Build a shot list.\nconst shots = ["Wide", "Medium", "Close-up"];\n\nfunction describeShot(name, index) {\n    return `${index + 1}. ${name}`;\n}\n\nconsole.log(shots.map(describeShot).join("\\n"));\n',
    markup:'<article class="card">\n    <h2>The last light</h2>\n    <p>A story begins at the water’s edge.</p>\n</article>\n',
    css:'.scene {\n    display: grid;\n    gap: 1rem;\n    color: var(--md-sys-color-primary);\n}\n',
    json:'{\n    "title": "The last light",\n    "shots": 3,\n    "duration": 12\n}\n',
};

/** Read an explicit user-selected JSON document and display validation feedback. */
function bindImport(id:string, load:(value:string) => void, status:HTMLElement):void {
    // Locate the file picker.
    const input = document.getElementById(id) as HTMLInputElement;
    // Load a document only after the visitor selects a file.
    input.addEventListener("change", async() => {
        // Read the selected file.
        const file = input.files?.[0];
        // Ignore canceled dialogs.
        if(file){
            // Surface malformed data without losing the existing document.
            try {
                // Call the public import method.
                load(await file.text());
                // Confirm the load.
                status.textContent = `Imported ${file.name}.`;
            }catch(error){
                // Display actionable import feedback.
                status.textContent = error instanceof Error ? error.message : "Could not import this file.";
            }
            // Allow selecting the same file again.
            input.value = "";
        }
    });
}

/** Download only in response to an explicit demo button click. */
function download(name:string, content:string, type:string):void {
    // Create a local file URL.
    const url = URL.createObjectURL(new Blob([content], {type}));
    // Create the download control.
    const link = document.createElement("a");
    // Set its payload.
    link.href = url;
    // Set the suggested filename.
    link.download = name;
    // Trigger the visitor-requested download.
    link.click();
    // Release the temporary URL after the browser starts the download.
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Initialize only the example present on the current page. */
async function initialize():Promise<void> {
    // Locate the screenplay example.
    const screenplayHost = document.getElementById("screenplay-demo");
    // Initialize the screenplay page.
    if(screenplayHost){
        // Initialize the existing Toolbar component.
        const toolbar = Toolbar.init(document.getElementById("screenplay-toolbar"));
        // Create a structured screenplay using the library.
        const editor = ScreenplayEditor.init(screenplayHost, {document:screenplay});
        // Bind toolbar commands through the component API.
        editor.connectToolbar(toolbar);
        // Keep page count visible alongside the block count.
        const updatePageCount = ():void => {
            // Describe the current fixed-paper layout without claiming an exact runtime.
            document.getElementById("screenplay-status").textContent = `${editor.getPageCount()} A4 page${editor.getPageCount() === 1 ? "" : "s"} · ${editor.getDocument().blocks.length} blocks · Changes stay in this browser session until exported.`;
        };

        // Refresh physical page count after layout changes.
        screenplayHost.addEventListener("screenplaylayoutchange", updatePageCount);

        // Refresh block count after edits.
        screenplayHost.addEventListener("screenplaychange", updatePageCount);

        // Show the initial A4 page count.
        updatePageCount();

        // Expose the demo for console experimentation.
        Object.assign(window, {screenplayEditor:editor});
        // Locate status and formatting controls.
        const status = document.getElementById("screenplay-status");
        // Locate the semantic block selector.
        const type = document.getElementById("screenplay-type");
        // Describe the format menu using the current screenplay role.
        const blockTypes = {
            scene:{label:"Scene heading", icon:"movie"}, action:{label:"Action", icon:"notes"},
            character:{label:"Character", icon:"person"}, dialogue:{label:"Dialogue", icon:"chat_bubble_outline"},
            parenthetical:{label:"Parenthetical", icon:"short_text"}, transition:{label:"Transition", icon:"compare_arrows"},
        };
        // Synchronize the rounded menu trigger with the public selection API.
        const updateType = ():void => {
            // Read the selected block's presentation.
            const current = blockTypes[editor.getActiveBlock().type];
            // Show the selected block type.
            type.setAttribute("label", current.label);
            // Match its Material icon.
            type.setAttribute("icon-text", current.icon);
            // Disable formatting in read-only mode.
            type.toggleAttribute("disabled", editor.options.readOnly);
        };
        // Follow the focused screenplay block.
        screenplayHost.addEventListener("screenplayselectionchange", updateType);
        // Call the public formatting method from the dropdown's native buttons.
        document.getElementById("screenplay-type-menu").addEventListener("click", event => {
            // Locate a selected menu item.
            const item = (event.target as Element).closest<HTMLElement>("[data-block-type]");
            // Apply a selected semantic role.
            if(item)
                // Keep formatting logic in the library component.
                editor.setBlockType(item.dataset.blockType as keyof typeof blockTypes);
        });
        // Reflect preview sizing using the library's public zoom state.
        const updateZoom = ():void => {
            // Read the current responsive or numeric preview size.
            const zoom = editor.getZoom();

            // Label the rounded menu trigger with the selected display size.
            document.getElementById("screenplay-zoom").setAttribute("label", zoom === "fit-parent" ? "Fit parent" : `${Math.round(zoom * 100)}%`);
        };

        // Change display size without modifying screenplay formatting.
        document.getElementById("screenplay-zoom-menu").addEventListener("click", event => {
            // Resolve a preview size selected in the menu.
            const item = (event.target as Element).closest<HTMLElement>("[data-screenplay-zoom]");

            // Apply valid authored menu choices through the component API.
            if(item)
                // Keep zoom and scroll behavior in Kmaterialize.
                editor.setZoom(item.dataset.screenplayZoom === "fit-parent" ? "fit-parent" : Number(item.dataset.screenplayZoom));
        });

        // Follow programmatic preview changes as well as menu interactions.
        screenplayHost.addEventListener("screenplayzoomchange", updateZoom);

        // Initialize the default fit-parent label.
        updateZoom();

        // Export a complete, round-trippable document.
        document.getElementById("screenplay-export").addEventListener("buttonaction", () => {
            // Display exported JSON using the existing CodeCard integration.
            void updateCodeSnippet("screenplay-output", editor.toJSON());
            // Download the same serialized document.
            download("screenplay.json", editor.toJSON(), "application/json");
        });
        // Export readable screenplay text.
        document.getElementById("screenplay-text").addEventListener("buttonaction", () => download("screenplay.txt", editor.toText(), "text/plain"));
        // Bind the public JSON importer.
        bindImport("screenplay-import", value => editor.fromJSON(value), status);
        // Demonstrate programmatic document replacement.
        document.getElementById("screenplay-reset").addEventListener("buttonaction", () => editor.setDocument(screenplay));
        // Demonstrate read-only mode.
        document.getElementById("screenplay-readonly").addEventListener("change", event => editor.setReadOnly((event.target as HTMLInputElement).checked));
        // Initialize the block-type selector.
        updateType();
    }

    // Locate the editable source example.
    const scriptHost = document.getElementById("script-demo");
    // Initialize the Script Editor page.
    if(scriptHost){
        // Initialize its existing Toolbar component.
        const toolbar = Toolbar.init(document.getElementById("script-toolbar"));
        // Create the library editor.
        const editor = ScriptEditor.init(scriptHost, {value:samples.javascript, language:"javascript", label:"Editable JavaScript example"});
        // Connect editing commands.
        editor.connectToolbar(toolbar);
        // Expose the public demo instance.
        Object.assign(window, {scriptEditor:editor});
        // Locate the grammar selector.
        const language = document.getElementById("script-language");
        // Change highlighting without replacing the visitor's code.
        document.getElementById("script-language-menu").addEventListener("click", async event => {
            // Resolve the selected language item.
            const item = (event.target as Element).closest<HTMLElement>("[data-language]");
            // Apply supported menu choices only.
            if(item){
                // Capture the requested grammar.
                const selected = item.dataset.language;
                // Reflect the current menu selection before asynchronous loading.
                language.dataset.language = selected;
                // Update the rounded trigger label.
                language.setAttribute("label", {javascript:"JavaScript", markup:"HTML", css:"CSS", json:"JSON", plain:"Plain text"}[selected]);
                // Wait for Prism before registering an additional grammar.
                await editor.ready;
                // Load the optional JSON grammar when requested.
                if(selected === "json")
                    // Register JSON with the existing Prism instance.
                    await import("prismjs/components/prism-json.js");
                // Avoid applying a stale asynchronous menu choice.
                if(language.dataset.language === selected)
                    // Re-highlight the existing text through the public API.
                    editor.setLanguage(selected);
            }
        });
        // Load a selected language sample only on explicit request.
        document.getElementById("script-sample").addEventListener("buttonaction", () => editor.setValue(samples[language.dataset.language] || ""));
        // Demonstrate public selection replacement.
        document.getElementById("script-insert").addEventListener("buttonaction", () => editor.replaceSelection("example"));
        // Demonstrate source extraction.
        document.getElementById("script-export").addEventListener("buttonaction", () => download("script.txt", editor.getValue(), "text/plain"));
        // Demonstrate read-only mode.
        document.getElementById("script-readonly").addEventListener("change", event => editor.setReadOnly((event.target as HTMLInputElement).checked));
        // Report changes without rendering user code as HTML.
        scriptHost.addEventListener("scriptchange", () => {
            // Show the current character count.
            document.getElementById("script-status").textContent = `${editor.getValue().length} characters · Edited in this browser session.`;
        });
        // Report missing peer dependencies while keeping text accessible.
        try {
            // Wait for the syntax renderer.
            await editor.ready;
        }catch(error){
            // Display the library's actionable loading error.
            document.getElementById("script-status").textContent = String(error);
        }
    }

    // Locate the visual storyboard example.
    const storyboardHost = document.getElementById("storyboard-demo");
    // Initialize the storyboard page.
    if(storyboardHost){
        // Initialize its existing Toolbar component.
        const toolbar = Toolbar.init(document.getElementById("storyboard-toolbar"));
        // Create the visual shot document.
        const board = Storyboard.init(storyboardHost, {shots});
        // Connect the public shot and history commands.
        board.connectToolbar(toolbar);
        // Expose the public instance for experimentation.
        Object.assign(window, {storyboard:board});
        // Locate operation feedback.
        const status = document.getElementById("storyboard-feedback");
        // Export the complete shot list.
        document.getElementById("storyboard-export").addEventListener("buttonaction", () => {
            // Display the serialized document.
            void updateCodeSnippet("storyboard-output", board.toJSON());
            // Download a round-trippable JSON document.
            download("storyboard.json", board.toJSON(), "application/json");
        });
        // Bind validated JSON import.
        bindImport("storyboard-import", value => board.fromJSON(value), status);
        // Demonstrate full document replacement.
        document.getElementById("storyboard-reset").addEventListener("buttonaction", () => board.setShots(shots));
        // Demonstrate read-only mode.
        document.getElementById("storyboard-readonly").addEventListener("change", event => board.setReadOnly((event.target as HTMLInputElement).checked));
        // Show editing feedback.
        storyboardHost.addEventListener("storyboardchange", () => {
            // State the demo's persistence boundary.
            status.textContent = "Edited in this browser session. Export JSON to keep your shot list.";
        });
    }
}

// Initialize after the shared documentation controls are ready.
if(document.readyState === "loading")
    // Preserve initialization order with the shared main module.
    document.addEventListener("DOMContentLoaded", () => {
        // Start the relevant page example.
        void initialize();
    }, {once:true});
else
    // Support module loading after the document is ready.
    void initialize();
