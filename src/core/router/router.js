// src/core/router/router.js

import { ROUTES } from '../config/routes.config.js';
import store from '../store/store.js';
import { Toast } from '../utils/toast.js';

class Router {
    constructor() {
        this.appElement = document.getElementById('app');
        // Keep a reference to the current controller to allow cleanup later
        this.currentController = null;
    }

    init() {
        // Clean the URL from 'index.html' if present
        if (window.location.pathname.includes('index.html')) {
            const cleanPath = window.location.pathname.replace('index.html', '');
            window.history.replaceState(null, '', cleanPath + window.location.hash);
        }

        // Listen for hash changes to trigger routing
        window.addEventListener('hashchange', () => this.route());

        // Delegate click events for elements with 'data-link' to change the hash without page reload
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-link]')) {
                e.preventDefault();
                window.location.hash = e.target.getAttribute('href');
            }
        });

        // If there's no hash or it's root, redirect to home
        const currentHash = window.location.hash;
        if (!currentHash || currentHash === '#/') {
            window.location.hash = '#/home';
        } else {
            this.route();
        }
    }

    async route() {

        const { auth } = store.getState();

        // Parse the hash to get base path and optional parameter
        let fullPath = window.location.hash.slice(1);
        let parts = fullPath.split('/').filter(Boolean);
        const basePath = `/${parts[0]}`;
        const param = parts[1];

        // Get the route configuration
        const route = ROUTES[basePath];
        if (!route) {
            this.appElement.innerHTML = '<h1 class="text-2xl font-bold p-4">404 - Page Not Found</h1>';
            return;
        }

        // If the route is for guests only and the user is logged in
        if (route.guestOnly && auth.isAuthenticated) {
            window.location.hash = '#/home';
            return;
        }

        // If the route requires login and the user is not logged in
        if (route.requiresAuth && !auth.isAuthenticated) {
            window.location.hash = '#/login';
            Toast.show(`Please Login!`, 'error');
            return;
        }

        /**
         * Cleanup step:
         * If there's a current controller and it has a 'destroy' method, call it
         */
        if (this.currentController && typeof this.currentController.destroy === 'function') {
            this.currentController.destroy();
        }

        // Clear the app container before rendering new content
        this.appElement.innerHTML = '';

        try {
            const cleanPath = route.importPath.replace(/^\.+\//, '');

            const isGitHub = window.location.hostname.includes('github.io');
            const base = isGitHub ? `${window.location.origin}/pure_store/` : `${window.location.origin}/`;

            const absolutePath = new URL(cleanPath, base).href;

            const module = await import(absolutePath);

            const ControllerClass = module[route.controller];

            if (!ControllerClass) {
                throw new Error(`Controller ${route.controller} not found in ${route.importPath}`);
            }

            // Instantiate the controller and store it as the current controller
            this.currentController = new ControllerClass({ id: param || null });
            await this.currentController.init();

        } catch (error) {
            console.error('Routing Error:', error);
            this.appElement.innerHTML = `<div class="p-4 text-red-500 font-bold">Error loading the page.</div>`;
        }
    }
}

// Initialize the router
const router = new Router();
export default router;