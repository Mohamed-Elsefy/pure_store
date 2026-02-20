// src/features/product/product.controller.js

import store from '../../core/store/store.js';
import { loadTemplate } from '../../core/utils/template.loader.js';
import { ProductService } from '../../core/services/product.service.js';
import { ProductDetailsView } from './product.view.js';
import { UILoader } from '../../core/utils/ui.loader.js';
import { CartActions } from '../../core/store/cart.actions.js';
import { Toast } from '../../core/utils/toast.js';

export class ProductDetailsController {
    /**
     * Controller for a single product details page
     * @param {Object} params - Parameters including product ID
     */
    constructor(params) {
        this.productId = params.id;
        this.unsubscribe = null;
        this.isFetching = false;
        this.currentQuantity = 1;
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
     * update quntity price
     */
    updateQuantityUI(price) {
        const qtyValue = document.getElementById('qty-value');
        const qtyTotal = document.getElementById('qty-total-price');

        if (qtyValue) qtyValue.textContent = this.currentQuantity;
        if (qtyTotal) {
            const total = (this.currentQuantity * price).toFixed(2);
            qtyTotal.textContent = `$${total}`;
        }
    }

    /**
 * Bind UI events (e.g., Add to Cart button)
 * @param {Object} product - Product object to be added to cart
 */
    bindEvents(product) {

        const btn = document.querySelector('.add-to-cart-btn');
        const qtyMinus = document.getElementById('qty-minus');
        const qtyPlus = document.getElementById('qty-plus');

        if (!btn || !qtyMinus || !qtyPlus) return;
        this.updateQuantityUI(product.price);

        // Reduce the quantity
        qtyMinus.onclick = () => {
            if (this.currentQuantity > 1) {
                this.currentQuantity--;
                this.updateQuantityUI(product.price);
            }
        };

        // Increase the quantity
        qtyPlus.onclick = () => {
            if (this.currentQuantity < product.stock) {
                this.currentQuantity++;
                this.updateQuantityUI(product.price);
            } else {
                Toast.show("Limit reached", "info");
            }
        };

        // buy now button
        const buyNowBtn = document.querySelector('.buy-now-btn');
        if (buyNowBtn) {
            buyNowBtn.onclick = (e) => {
                e.preventDefault();

                store.setState({
                    buyNowItem: { ...product, quantity: this.currentQuantity }
                });

                window.location.hash = '#/checkout';
            };
        }

        // Store original button content outside click handler
        // This ensures we can restore it after visual feedback
        const originalContent = btn.innerHTML;

        btn.onclick = async (e) => {
            e.preventDefault();

            // Prevent multiple clicks while processing
            if (btn.disabled) return;
            btn.disabled = true;

            try {
                // Add product to cart with quantity = currentQuantity
                await CartActions.addItem(product, this.currentQuantity);

                // Provide visual feedback on the button itself
                btn.innerHTML = '<i class="fa-solid fa-check"></i> Added!';

                // Restore original button state after 2 seconds
                setTimeout(() => {
                    btn.innerHTML = originalContent;
                    btn.disabled = false;

                    // reset quantity
                    this.currentQuantity = 1;
                    this.updateQuantityUI(product.price);
                }, 1300);

            } catch (error) {
                // Show error message if adding fails
                Toast.show("Failed to add item", "error");

                // Re-enable button to allow retry
                btn.disabled = false;
            }
        };
    }

    /**
     * Cleanup function called when controller is destroyed
     */
    destroy() {
        if (this.unsubscribe) this.unsubscribe();
    }
}
