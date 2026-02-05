// layouts/navbar.js

// Import template loader utility
import { loadTemplate } from "../core/utils/template.loader.js";

/**
 * renderNavbar
 * Dynamically loads the navbar template and injects it into the <nav> element.
 */
export const renderNavbar = async () => {
    // Select the nav element in the DOM
    const navElement = document.querySelector('nav');
    if (!navElement) return; // Exit if no nav exists

    // Load the navbar template (cached via template loader)
    const template = await loadTemplate('/src/layouts/navbar.template.html');

    // Inject template into the DOM
    navElement.innerHTML = template;
};
