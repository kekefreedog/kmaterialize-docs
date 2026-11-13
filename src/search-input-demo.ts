/**
 * Search Input Examples
 * Demonstrate application filtering through Kmaterialize's public API.
 */

/** Dependencies */
import { SearchInput, type SearchInputOptions } from "kmaterialize";

/** Initialize each independent list and its search control. */
for(const demo of document.querySelectorAll<HTMLElement>("[data-search-demo]")){

    // Locate the native field
    const input = demo.querySelector<HTMLInputElement>("input[data-search-input]");

    // Locate the sample records owned by this demonstration
    const records = Array.from(demo.querySelectorAll<HTMLElement>("[data-search-record]"));

    // Locate optional configuration controls
    const settings = demo.querySelector<HTMLElement>("[data-search-settings]");

    // Initialize only complete demonstrations
    if(input){

        // Supply application-specific filtering and return the visible count
        const getMatches = (query:string):number => {

            // Prepare result
            let result = 0;

            // Match the sample names and departments
            for(const record of records){

                // Compare the query without case sensitivity
                const matches = (record.textContent || "").toLocaleLowerCase().includes(query.toLocaleLowerCase());

                // Show only records matching this demonstration's query
                record.hidden = !matches;

                // Count the visible records
                if(matches){

                    // Add this record to the result count
                    result++;

                }

            }

            // Return result
            return result;

        };

        // Build the options from editable controls when present
        const initialize = ():void => {

            // Read a named text setting
            const readText = (name:string):string => {

                // Prepare result
                const result = settings?.querySelector<HTMLInputElement>(`[name="${name}"]`)?.value || "";

                // Return result
                return result;

            };

            // Supply application matching while the library reads each input's HTML options
            const options:Partial<SearchInputOptions> = { getMatches };

            // Apply user-selected options to the standalone example
            if(settings){

                // Read both optional icon names
                options.icon = readText("icon") || null;

                // Read the right-side icon
                options.iconRight = readText("iconRight") || null;

                // Read the clear action preference
                options.clearable = settings.querySelector<HTMLInputElement>('[name="clearable"]')!.checked;

                // Read the count visibility preference
                options.showMatches = settings.querySelector<HTMLInputElement>('[name="showMatches"]')!.checked;

                // Read the full-width preference
                options.fullWidth = settings.querySelector<HTMLInputElement>('[name="fullWidth"]')!.checked;

                // Read the expandable presentation preference
                options.expandable = settings.querySelector<HTMLInputElement>('[name="expandable"]')!.checked;

                // Read the singular label
                options.matchSingular = readText("matchSingular");

                // Read the plural label
                options.matchPlural = readText("matchPlural");

            }

            // Reinitialize through the library while preserving the native input value
            SearchInput.init(input, options);

        };

        // Render the initial control
        initialize();

        // Apply configuration edits through the same public initializer
        settings?.addEventListener("input", initialize);

    }

}
