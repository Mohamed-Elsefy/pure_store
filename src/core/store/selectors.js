// src/core/store/selectors.js

// Import the global store instance
import store from './store.js';

/**
 * Selectors
 * Responsible for extracting derived data from the state.
 * Helps keep the views/controllers "dumb" and focused on rendering only.
 */

//    Cart Selectors
export const CartSelectors = {
    /**
     * Get all items in the shopping cart
     * @returns {Array} cart items
     */
    getCartItems: () => store.getState().cart,

    /**
     * Get total quantity of products in the cart
     * Sums the quantity of each cart item
     * @returns {number} total quantity
     */
    getCartCount: () => {
        const { cart } = store.getState();
        return cart.reduce((total, item) => total + item.quantity, 0);
    },

    /**
     * Calculate the total price of the cart
     * @returns {string} total price formatted as a decimal string
     */
    getCartTotal: () => {
        const { cart } = store.getState();
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        return total.toFixed(2);
    },

    /**
     * Check if the cart is empty
     * @returns {boolean} true if empty, false otherwise
     */
    isCartEmpty: () => store.getState().cart.length === 0
};

//    Authentication Selectors
export const AuthSelectors = {
    /**
     * Check if a user is authenticated
     * @returns {boolean} true if user is logged in
     */
    isAuthenticated: () => !!store.getState().user,

    /**
     * Get the current logged-in user
     * @returns {Object|null} user data or null
     */
    getCurrentUser: () => store.getState().user,

    /**
     * Check if the current user is an admin
     * @returns {boolean} true if user role is admin
     */
    isAdmin: () => {
        const user = store.getState().user;
        return user && user.role === 'admin';
    }
};

//    Product Selectors
export const ProductSelectors = {
    /**
     * Get a product by its ID
     * @param {number|string} id - product identifier
     * @returns {Object|undefined} product object or undefined if not found
     */
    getProductById: (id) => {
        return store.getState().products.find(p => p.id === id);
    },

    /**
     * Filter products by category
     * @param {string|null} categoryName - category to filter by
     * @returns {Array} filtered products or all products if no category
     */
    getProductsByCategory: (categoryName) => {
        const { products } = store.getState();
        return categoryName
            ? products.filter(p => p.category === categoryName)
            : products;
    }
};
