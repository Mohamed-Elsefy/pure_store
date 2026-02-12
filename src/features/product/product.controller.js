// src/features/product/product.controller.js
import { loadTemplate } from '../../core/utils/template.loader.js';
import { ProductService } from '../../core/services/product.service.js';
import { ProductDetailsView } from './product.view.js';
import store from '../../core/store/store.js';
import { UILoader } from '../../core/utils/ui.loader.js';

export class ProductDetailsController {
    /**
     * Controller for a single product details page
     * @param {Object} params - Parameters including product ID
     */
    constructor(params) {
        this.productId = params.id;
        this.unsubscribe = null;
        this.isFetching = false; // Prevent duplicate fetches
    }

    /**
     * Initialize the controller: load template and subscribe to store updates
     */
    async init() {
        const app = document.getElementById('app');
        const template = await loadTemplate('/src/features/product/product.template.html');
        app.innerHTML = template;

        // Subscribe to store changes (e.g., when products finish loading in main.js)
        this.unsubscribe = store.subscribe(() => this.updateUI());

        // Try to update UI immediately
        this.updateUI();
    }

    /**
     * Update the UI: render product if found, show loading or fetch if needed
     */
    async updateUI() {
        const container = document.getElementById('product-details');
        if (!container) return;

        const state = store.getState();

        // Find the product in store (ensure string comparison for IDs)
        const product = state.products.find(p => String(p.id) === String(this.productId));

        if (product) {
            ProductDetailsView.render(product);
            this.bindEvents(product);
        }
        else if (state.loading) {
            UILoader.show();
        }
        else if (!this.isFetching) {
            // If product not in store and store is not loading, fetch it directly
            await this.fetchProductDirectly();
        }
    }

    /**
     * Fetch the product directly from API if not available in the store
     */
    async fetchProductDirectly() {
        if (this.isFetching) return;
        this.isFetching = true;

        try {
            UILoader.show();
            const product = await ProductService.getProductById(this.productId);

            if (product) {
                ProductDetailsView.render(product);
                this.bindEvents(product);
            } else {
                throw new Error("Not Found");
            }
        } catch (error) {
            console.error("Fetch Error:", error);
            document.getElementById('app').innerHTML = `
                <div class="text-center py-20">
                    <h2 class="text-2xl font-bold mb-4">Product Not Found</h2>
                    <a href="#/products" class="text-blue-500 underline">Back to Products</a>
                </div>`;
        } finally {
            this.isFetching = false;
        }
    }

    /**
     * Bind UI events, e.g., Add to Cart button
     * @param {Object} product - Product object
     */
    bindEvents(product) {
        const btn = document.querySelector('.add-to-cart-btn');
        if (btn) {
            btn.onclick = () => console.log('Added to cart:', product.id);
        }
    }

    /**
     * Cleanup function called when controller is destroyed
     */
    destroy() {
        if (this.unsubscribe) this.unsubscribe();
    }
}
