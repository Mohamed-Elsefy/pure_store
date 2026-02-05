// src/features/home/home.controller.js

// Import template loader utility
import { loadTemplate } from '../../core/utils/template.loader.js';

/**
 * HomeController
 * Responsible for rendering the Home page.
 * Does NOT handle state or API calls here.
 */
export class HomeController {
    /**
     * Initialize the home page
     * Loads the HTML template dynamically and injects it into the app container
     */
    async init() {
        // Get main application container
        const app = document.getElementById('app');

        // Load the HTML template for the home page
        const template = await loadTemplate('/src/features/home/home.template.html');

        // Inject template into the DOM
        app.innerHTML = template;
    }
}
