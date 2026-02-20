// src/features/checkout/checkout.controller.js

import store from '../../core/store/store.js';
import { loadTemplate } from '../../core/utils/template.loader.js';
import { CartSelectors } from '../../core/store/selectors.js';
import { CartActions } from '../../core/store/cart.actions.js';
import { Toast } from '../../core/utils/toast.js';
import { CheckoutView } from './checkout.view.js';
import { AuthHelper } from '../../core/utils/auth.helper.js';
import { OrderService } from '../../core/services/order.service.js';

/**
 * CheckoutController
 * Orchestrates the checkout flow:
 * - Validates cart state
 * - Loads and renders the checkout page
 * - Handles order submission
 * - Updates user and cart state
 */
export class CheckoutController {
    constructor() {
        // Cache main app container and initialize the View
        // Inject submit handler to keep controller logic separate from UI
        this.app = document.getElementById('app');
        this.view = new CheckoutView({
            onSubmit: (formData) => this._handleOrderSubmission(formData)
        });
    }

    /**
     * Initializes the checkout page:
     * 1. Prevents access if cart is empty
     * 2. Loads checkout template
     * 3. Renders cart items, total, and user data
     * 4. Scrolls to top for better UX
     */
    async init() {
        const { auth } = store.getState();
        const cartItems = CartSelectors.getCartItems();

        if (cartItems.length === 0) {
            Toast.show('Your cart is empty!', 'warning');
            window.location.hash = '#/cart';
            return;
        }

        try {
            const template = await loadTemplate('/src/features/checkout/checkout.template.html');
            this.app.innerHTML = template;

            const total = CartSelectors.getCartTotal();
            this.view.render(cartItems, total, auth.user);

            window.scrollTo({ top: 0, behavior: 'smooth' });

        } catch (error) {
            console.error('Checkout Initialization Error:', error);
            Toast.show('Failed to load checkout page', 'error');
        }
    }

    /**
     * Handles checkout form submission:
     * - Shows loading state
     * - Creates and saves order record
     * - Updates user information
     * - Clears cart after success
     * - Redirects user
     */
    async _handleOrderSubmission(formData) {
        const submitBtn = document.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        const { auth, cart } = store.getState();

        try {
            // Activate loading state and simulate network delay
            this._toggleButtonLoading(submitBtn, true);
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Prepare order payload from current cart state
            const orderRecord = {
                items: [...cart],
                total: CartSelectors.getCartTotal(),
                address: formData.address,
                paymentMethod: formData.payment_method
            };

            // Persist order for current user
            OrderService.saveOrder(auth.user.id, orderRecord);

            // Update user profile data (phone & address)
            const updatedUser = AuthHelper.updateUser({
                phone: formData.phone,
                address: { ...auth.user.address, address: formData.address }
            });

            if (updatedUser) {
                store.setState({ auth: { ...store.getState().auth, user: updatedUser } });
            }

            // Clear cart and notify user
            CartActions.clearCart();
            Toast.show(`Success! Order #${Math.floor(Date.now() / 10000)} created.`, 'success');

            // Redirect after successful order
            window.location.hash = '#/home';

        } catch (error) {
            Toast.show('Error processing order', 'error');
            this._toggleButtonLoading(submitBtn, false, originalText);
        }
    }

    /**
     * Toggles submit button loading state:
     * - Disables button and shows spinner while processing
     * - Restores original state on completion or error
     */
    _toggleButtonLoading(btn, isLoading, originalText = '') {
        if (isLoading) {
            btn.disabled = true;
            btn.innerHTML = `
                <i class="fa-solid fa-circle-notch animate-spin mr-2"></i>
                Processing...
            `;
            btn.classList.add('opacity-70', 'cursor-not-allowed');
        } else {
            btn.disabled = false;
            btn.innerHTML = originalText;
            btn.classList.remove('opacity-70', 'cursor-not-allowed');
        }
    }

    /**
     * Cleanup method executed when leaving checkout page.
     * Can be extended later to remove global listeners if needed.
     */
    destroy() {
        console.log('Checkout Controller Destroyed');
    }
}