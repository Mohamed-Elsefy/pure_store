import store from '../../core/store/store.js';
import { loadTemplate } from '../../core/utils/template.loader.js';
import { CartActions } from '../../core/store/actions.js';
import { CartSelectors } from '../../core/store/selectors.js';
import { CartView } from './cart.view.js';

export class CartController {
    /**
     * CartController constructor
     * Initializes the CartView and binds event handlers to store actions.
     */
    constructor() {
        // Initialize CartView with handlers for updating quantity and removing items
        this.view = new CartView({
            onUpdateQty: (id, qty) => CartActions.updateQuantity(id, qty),
            onRemove: (id) => CartActions.removeItem(id)
        });

        // Store unsubscribe function for later cleanup
        this.unsubscribe = null;
    }

    /**
     * Initialize the CartController
     * Loads the template, subscribes to store updates, and renders the initial UI.
     */
    async init() {
        // 1. Load the main cart template HTML
        const template = await loadTemplate('/src/features/cart/cart.template.html');
        document.getElementById('app').innerHTML = template;

        // 2. Subscribe to store changes to auto-update the UI when state changes
        this.unsubscribe = store.subscribe(() => this.updateUI());

        // 3. Render the initial UI
        this.updateUI();
    }

    /**
     * Update the Cart UI
     * Fetches the current cart items and summary from selectors and renders the view.
     */
    updateUI() {
        const items = CartSelectors.getCartItems(); // Get current cart items
        const summary = {
            count: CartSelectors.getCartCount(),   // Total item count
            total: CartSelectors.getCartTotal()    // Total price
        };

        // Render the cart view with items and summary
        this.view.render(items, summary);
    }

    /**
     * Clean up when leaving the cart page
     * Unsubscribe from store updates to prevent memory leaks.
     */
    destroy() {
        if (this.unsubscribe) this.unsubscribe();
    }
}
