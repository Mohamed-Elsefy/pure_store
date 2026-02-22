// src/features/home/home.controller.js

import { loadTemplate } from '../../core/utils/template.loader.js';
import store from '../../core/store/store.js';
import { HomeView } from './home.view.js';
import { ProductSelectors } from '../../core/store/selectors.js';
import { ProductActions } from '../../core/store/product.actions.js';

export class HomeController {
    /**
     * Initialize the Home page
     * - Loads templates
     * - Initializes animations
     * - Subscribes to the store
     * - Renders initial UI
     */
    async init() {
        const app = document.getElementById('app');

        // 1. Load the main home template
        const template = await loadTemplate('/src/features/home/home.template.html');
        app.innerHTML = template;

        // 2. Load reusable product card template (used for top-rated section)
        const cardTemplate = await loadTemplate('/src/features/products/partials/product-card.html');

        // 3. Initialize typewriter animation in hero section
        HomeView.initTypewriter(['Style', 'Trends', 'Comfort', 'Identity']);

        /**
         * UI Update Function
         * Renders categories and top-rated products
         * whenever the store state changes.
         */
        const updateUI = () => {
            const state = store.getState();

            // Render categories if available
            if (state.categories?.length > 0) {
                HomeView.renderCategories(state.categories);
            }

            // Render top-rated products if available
            if (state.products?.length > 0) {
                const topProducts = ProductSelectors.getTopRatedProducts(4);
                HomeView.renderTopRated(topProducts, cardTemplate);
            }
        };

        // 4. Handle "View All" button click
        const viewAllBtn = document.getElementById('view-all-top-rated');
        if (viewAllBtn) {
            viewAllBtn.onclick = (e) => {
                e.preventDefault();

                // Update filters to sort products by rating (descending)
                // Make sure the value matches what the store supports
                ProductActions.updateFilters({ sortBy: 'rating-desc' });

                // Navigate to products page
                window.location.hash = '#/products';
            };
        }

        // 5. Subscribe to store updates to auto-refresh UI
        this.unsubscribe = store.subscribe(updateUI);

        // 6. Initial render
        updateUI();
    }

    /**
     * Destroy lifecycle method
     * Automatically called by the Router when leaving the page.
     * Used to clean up store subscriptions and prevent memory leaks.
     */
    destroy() {
        if (this.unsubscribe) {
            this.unsubscribe();
        }
    }
}