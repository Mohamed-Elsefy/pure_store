// layouts/footer.js

// Import template loader utility
import { loadTemplate } from "../core/utils/template.loader.js";

/**
 * renderFooter
 * Dynamically loads the footer template and injects it into the <footer> element.
 */
export const renderFooter = async () => {
    // Select the footer element in the DOM
    const footerElement = document.querySelector("footer");
    if (!footerElement) return; // Exit if no footer exists

    // Load the footer template (cached via template loader)
    const template = await loadTemplate('./src/layouts/footer.template.html');

    // Inject template into the DOM
    footerElement.innerHTML = template;
};
