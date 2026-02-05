// src/features/products/products.controller.js

// Import template loader utility
import { loadTemplate } from '../../core/utils/template.loader.js';

/**
 * ProductsController
 * Responsible for rendering the Products (Catalog) page.
 * Currently only loads the template; data fetching can be added later.
 */
export class ProductsController {
    /**
     * Initialize the products page
     * Loads the HTML template dynamically and injects it into the app container
     */
    async init() {
        // Get main application container
        const app = document.getElementById('app');

        // Load the products page template
        const template = await loadTemplate('/src/features/products/products.template.html');

        // Inject template into the DOM
        app.innerHTML = template;

        // Note: In a full implementation, you would fetch products from ProductService here
        // and render them dynamically instead of using placeholders
    }
}
