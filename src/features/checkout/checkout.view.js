// src/features/checkout/checkout.view.js

/**
 * CheckoutView
 * Responsible for:
 * - Rendering checkout UI data
 * - Prefilling user information
 * - Displaying order summary
 * - Handling UI interactions (payment toggle + form submission)
 * This layer contains no business logic.
 */
export class CheckoutView {
    constructor(eventHandlers) {
        // Receives controller handlers (e.g., onSubmit)
        this.handlers = eventHandlers;
    }

    /**
     * Main render method:
     * - Prefills user data (if available)
     * - Renders cart items in summary
     * - Updates totals
     * - Attaches UI event listeners
     */
    render(cartItems, total, user = null) {
        this._fillUserData(user);
        this._renderOrderItems(cartItems);
        this._updateTotals(total);
        this._setupEventListeners();
    }

    /**
     * Prefills checkout form with existing user data:
     * - Combines first and last name
     * - Formats address safely (ignores empty parts)
     * - Injects stored bank details if available
     */
    _fillUserData(user) {
        if (!user) return;

        const form = document.getElementById('checkout-form');
        if (!form) return;

        // Helper to format address without extra commas
        const formatAddress = () => {
            if (!user.address) return '';
            const { address, city, state } = user.address;

            return [address, city, state]
                .filter(part => part && part.trim() !== '')
                .join(', ');
        };

        const fields = {
            'full_name': `${user.firstName || ''} ${user.lastName || ''}`.trim(),
            'email': user.email || '',
            'phone': user.phone || '',
            'address': formatAddress(),
            'card_number': user.bank?.cardNumber || '',
            'card_expiry': user.bank?.cardExpire || ''
        };

        // Populate matching form inputs
        Object.entries(fields).forEach(([name, value]) => {
            const input = form.querySelector(`[name="${name}"]`);
            if (input) {
                input.value = value;
            }
        });
    }

    /**
     * Renders cart items inside the order summary section:
     * - Displays thumbnail, title, price, quantity
     * - Calculates per-item total
     * - Uses template literals for dynamic rendering
     */
    _renderOrderItems(items) {
        const container = document.getElementById('checkout-items');
        const template = document.getElementById('checkout-item-template');

        if (!container || !template) return;

        container.innerHTML = '';

        items.forEach(item => {
            const clone = template.content.cloneNode(true);

            clone.querySelector('.item-img').src = item.thumbnail;
            clone.querySelector('.item-img').alt = item.title;
            clone.querySelector('.item-title').textContent = item.title;
            clone.querySelector('.item-qty').textContent = item.quantity;
            clone.querySelector('.item-price').textContent = item.price.toFixed(2);

            const total = (item.price * item.quantity).toFixed(2);
            clone.querySelector('.item-total').textContent = `$${total}`;

            container.appendChild(clone);
        });
    }

    /**
     * Updates subtotal and total display values
     * in the order summary section.
     */
    _updateTotals(total) {
        const subtotalEl = document.getElementById('checkout-subtotal');
        const totalEl = document.getElementById('checkout-total');

        if (subtotalEl) subtotalEl.textContent = `$${total}`;
        if (totalEl) totalEl.textContent = `$${total}`;
    }

    /**
     * Sets up UI interactions:
     * 1. Payment method toggle (show/hide card fields)
     * 2. Form submission forwarding to controller
     */
    _setupEventListeners() {
        const form = document.getElementById('checkout-form');
        const cardFields = document.getElementById('card-details-fields');
        const paymentRadios = document.querySelectorAll('input[name="payment_method"]');

        if (!form) return;

        // Payment method switching logic
        paymentRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                if (e.target.value === 'cod') {
                    cardFields.style.maxHeight = '0px';
                    cardFields.style.opacity = '0';
                    cardFields.style.marginTop = '0px';
                    this._toggleRequiredFields(cardFields, false);
                } else {
                    cardFields.style.maxHeight = '500px';
                    cardFields.style.opacity = '1';
                    cardFields.style.marginTop = '1rem';
                    this._toggleRequiredFields(cardFields, true);
                }
            });
        });

        // Forward form submission to controller
        form.onsubmit = (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            this.handlers.onSubmit(Object.fromEntries(formData.entries()));
        };
    }

    /**
     * Toggles required attribute for all inputs inside
     * the card details container depending on payment method.
     */
    _toggleRequiredFields(container, isRequired) {
        const inputs = container.querySelectorAll('input');
        inputs.forEach(input => {
            if (isRequired) input.setAttribute('required', '');
            else input.removeAttribute('required');
        });
    }
}