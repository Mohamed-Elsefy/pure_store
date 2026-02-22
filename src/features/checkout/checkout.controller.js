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
        const template = await loadTemplate('./src/features/checkout/checkout.template.html');
        this.app.innerHTML = template;

        const state = store.getState();
        let itemsToRender = [];
        let totalPrice = 0;

        if (state.buyNowItem) {
            itemsToRender = [state.buyNowItem];
            totalPrice = (state.buyNowItem.price * state.buyNowItem.quantity).toFixed(2);
        } else {
            itemsToRender = state.cart;
            totalPrice = CartSelectors.getCartTotal();
        }

        if (itemsToRender.length === 0) {
            Toast.show("Your cart is empty", "info");
            window.location.hash = '#/home';
            return;
        }

        this.view.render(itemsToRender, totalPrice, state.auth.user);

        window.scrollTo(0, 0);
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
        const originalText = submitBtn ? submitBtn.innerHTML : 'Confirm Order';
        const { auth, cart, buyNowItem } = store.getState();
        const finalItems = buyNowItem ? [buyNowItem] : [...cart];
        const finalTotal = buyNowItem
            ? (buyNowItem.price * buyNowItem.quantity).toFixed(2)
            : CartSelectors.getCartTotal();

        try {
            this._toggleButtonLoading(submitBtn, true);

            await new Promise(res => setTimeout(res, 1000));

            const orderRecord = {
                items: finalItems,
                total: finalTotal,
                address: formData.address,
                phone: formData.phone, 
                paymentMethod: formData.payment_method,
                date: new Date().toISOString()
            };

            await OrderService.saveOrder(auth.user.id, orderRecord);

            if (buyNowItem) {
                store.setState({ buyNowItem: null });
            } else {
                CartActions.clearCart();
            }

            Toast.show('Order Created Successfully!', 'success');
            window.location.hash = '#/home';

        } catch (error) {
            console.error(error);
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
        store.setState({ buyNowItem: null });
        if (this.unsubscribe) this.unsubscribe();
    }
}