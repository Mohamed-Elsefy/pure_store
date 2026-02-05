// src/core/router/router.js

// Import route definitions (path → controller mapping)
import { ROUTES } from '../config/routes.config.js';

class Router {
    constructor() {
        // Main application container where pages are rendered
        this.appElement = document.getElementById('app');

        // Initialize router logic
        this._init();
    }

    _init() {
        /**
         * Remove "index.html" from the URL visually
         * This keeps URLs clean without affecting functionality
         * Example:
         * /index.html#/home → /#/home
         */
        if (window.location.pathname.includes('index.html')) {
            const cleanPath = window.location.pathname.replace('index.html', '');
            window.history.replaceState(null, '', cleanPath + window.location.hash);
        }

        /**
         * Listen for hash changes
         * Trigger routing when URL hash changes
         */
        window.addEventListener('hashchange', () => this.route());

        /**
         * Intercept clicks on links with [data-link]
         * Prevent full page reload and use client-side routing instead
         */
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-link]')) {
                e.preventDefault();

                // Extract route path from href
                const href = e.target.getAttribute('href');

                // Update hash to trigger router
                window.location.hash = href;
            }
        });

        /**
         * Default route logic
         * If no hash is present, redirect to /home
         */
        const currentHash = window.location.hash;
        if (!currentHash || currentHash === '#/') {
            window.location.hash = '#/home';
        } else {
            this.route();
        }
    }

    async route() {
        // Clear previous page content
        this.appElement.innerHTML = '';

        /**
         * Extract path from hash
         * Example: "#/home" → "/home"
         */
        let path = window.location.hash.slice(1);

        // Find matching route configuration
        const route = ROUTES[path];

        /**
         * Handle unknown routes (404)
         */
        if (!route) {
            this.appElement.innerHTML =
                '<h1 class="text-2xl font-bold p-4">404 - Page Not Found</h1>';
            return;
        }

        try {
            /**
             * Derive feature folder name from path
             * Example: "/products" → "products"
             */
            const featureName = path.replace('/', '');

            /**
             * Dynamically import the controller for the feature
             * This enables code-splitting and lazy loading
             */
            const module = await import(
                `/src/features/${featureName}/${featureName}.controller.js`
            );

            // Get controller class from imported module
            const ControllerClass = module[route.controller];

            // Create controller instance
            const controller = new ControllerClass();

            // Initialize controller logic (fetch data, render UI, etc.)
            await controller.init();

        } catch (error) {
            // Log error for debugging
            console.error('Routing Error:', error);

            // Display user-friendly error message
            this.appElement.innerHTML =
                `<div class="p-4 text-red-500 font-bold">
                    Error loading the page. Check Console.
                 </div>`;
        }
    }
}

// Create and export a single router instance (Singleton)
const router = new Router();
export default router;
