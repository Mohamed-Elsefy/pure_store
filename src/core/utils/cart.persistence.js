// src/core/utils/cart.persistence.js

export const CartPersistence = {
    /**
     * Saves the cart data to localStorage.
     * - If a valid userId exists, the cart is stored under a user-specific key
     *   to ensure persistence per user account.
     * - The active cart key ('purestore_cart') is also updated for immediate UI usage.
     * - If no userId is provided (guest), the cart is saved only under the general key.
     */
    save: (cart, userId = null) => {
        if (userId && userId !== 'undefined') {
            localStorage.setItem(`cart_user_${userId}`, JSON.stringify(cart));
            localStorage.setItem('purestore_cart', JSON.stringify(cart));
        } else {
            localStorage.setItem('purestore_cart', JSON.stringify(cart));
        }
    },

    /**
     * Retrieves the cart data from localStorage.
     * - If a valid userId exists, it loads the cart specific to that user.
     * - If no userId is provided (guest), it loads the general cart.
     * - Returns an empty array if no cart data is found.
     */
    get: (userId = null) => {
        if (userId && userId !== 'undefined') {
            const data = localStorage.getItem(`cart_user_${userId}`);
            return data ? JSON.parse(data) : [];
        }

        const guestData = localStorage.getItem('purestore_cart');
        return guestData ? JSON.parse(guestData) : [];
    }
};