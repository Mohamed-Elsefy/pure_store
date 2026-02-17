export class CartView {
    /**
     * CartView constructor
     * @param {Object} eventHandlers - Object containing event handler functions:
     *   onUpdateQty(productId, newQty), onRemove(productId)
     */
    constructor(eventHandlers) {
        // Reference to the main app container
        this.app = document.getElementById('app');
        // Store event handlers for use in item actions
        this.handlers = eventHandlers;
    }

    /**
     * Render the cart view
     * @param {Array} cartData - Array of cart items
     * @param {Object} summary - Summary object { count, total }
     */
    render(cartData, summary) {
        const listContainer = document.getElementById('cart-items-list'); // Container for cart items
        const emptyMsg = document.getElementById('empty-cart-msg');       // Empty cart message container
        const cartContent = document.getElementById('cart-content');      // Main cart content container
        const itemTemplate = document.getElementById('cart-item-template'); // Template for individual cart items

        // If cart is empty, show empty message and hide cart content
        if (cartData.length === 0) {
            emptyMsg.classList.remove('hidden');
            emptyMsg.classList.add('flex');
            cartContent.classList.add('hidden');
            return;
        }

        // Otherwise, hide empty message and show cart content
        emptyMsg.classList.add('hidden');
        cartContent.classList.remove('hidden');
        listContainer.innerHTML = ''; // Clear previous items

        // Render each cart item
        cartData.forEach(item => {
            const clone = itemTemplate.content.cloneNode(true); // Clone template

            // Populate item data
            clone.querySelector('.item-img').src = item.thumbnail || item.images?.[0]; // Product image
            clone.querySelector('.item-title').textContent = item.title;               // Product title
            clone.querySelector('.item-price').textContent = `$${(item.price * item.quantity).toFixed(2)}`; // Total price per item
            clone.querySelector('.item-qty').textContent = item.quantity;              // Quantity

            // Bind button events for each item
            clone.querySelector('.plus-btn').onclick = () =>
                this.handlers.onUpdateQty(item.id, item.quantity + 1); // Increase quantity
            clone.querySelector('.minus-btn').onclick = () =>
                this.handlers.onUpdateQty(item.id, item.quantity - 1); // Decrease quantity
            clone.querySelector('.remove-btn').onclick = () =>
                this.handlers.onRemove(item.id);                        // Remove item

            // Append item to the list container
            listContainer.appendChild(clone);
        });

        // Update summary (total count and total price)
        document.getElementById('summary-count').textContent = summary.count;
        document.getElementById('summary-total').textContent = summary.total;
    }
}
