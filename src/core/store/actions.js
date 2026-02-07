// src/core/store/actions.js

// Import the global store instance
import store from './store.js';

/**
 * Actions
 * Actions are responsible for handling business logic
 * and requesting state changes from the Store.
 * They do NOT modify the state directly.
 */

//       User / Authentication Actions
export const UserActions = {
    /**
     * Set logged-in user data
     * @param {Object} userData - User information
     */
    setUser: (userData) => {
        store.setState({ user: userData });
    },

    /**
     * Logout the user
     * Clears user data, token, and persisted auth info
     */
    logout: () => {
        store.setState({ user: null, token: null });
        localStorage.removeItem('token');
    }
};

//    Cart Actions
export const CartActions = {
    /**
     * Add a product to the shopping cart
     * If the product already exists, increase its quantity
     *
     * @param {Object} product - Product object to add
     */
    addToCart: (product) => {
        const { cart } = store.getState();

        // Check if the product already exists in the cart
        const existingItem = cart.find(item => item.id === product.id);

        if (existingItem) {
            // Increase quantity for existing item
            const updatedCart = cart.map(item =>
                item.id === product.id
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            );

            store.setState({ cart: updatedCart });
        } else {
            // Add new product with initial quantity = 1
            store.setState({
                cart: [...cart, { ...product, quantity: 1 }]
            });
        }
    },

    /**
     * Remove a product from the cart by its ID
     *
     * @param {number|string} productId - Product identifier
     */
    removeFromCart: (productId) => {
        const { cart } = store.getState();

        store.setState({
            cart: cart.filter(item => item.id !== productId)
        });
    },

    /**
     * Clear all items from the cart
     */
    clearCart: () => {
        store.setState({ cart: [] });
    }
};

//    UI / Theme Actions
export const UIActions = {
    /**
     * Initialize theme on app startup
     * Applies the stored theme to the HTML root element
     */
    initTheme: () => {
        const { theme } = store.getState();

        // Apply dark mode class based on saved theme
        document.documentElement.classList.toggle(
            'dark',
            theme === 'dark'
        );
    },

    /**
     * Toggle between light and dark theme
     * Updates store, DOM, and localStorage
     */
    toggleTheme: () => {
        const { theme } = store.getState();
        const newTheme = theme === 'light' ? 'dark' : 'light';

        // 1. Update global state
        store.setState({ theme: newTheme });

        // 2. Update DOM (HTML root class)
        document.documentElement.classList.toggle(
            'dark',
            newTheme === 'dark'
        );

        // 3. Persist theme preference
        localStorage.setItem('theme', newTheme);
    }
};

// product actions
export const ProductActions = {
    /**
     * Updates the global search query used to filter products.
     * Typically called when the user types in the search input.
     *
     * @param {string} query - The search text entered by the user.
     */
    setSearchQuery: (query) => {
        store.setState({ searchQuery: query });
    },

    /**
     * Updates product filters coming from the sidebar or filter UI.
     * Merges the new filters with the existing ones to avoid overwriting
     * previously applied filters.
     *
     * @param {Object} newFilters - An object containing the updated filters.
     */
    updateFilters: (newFilters) => {
        const { filters } = store.getState();
        store.setState({
            filters: { ...filters, ...newFilters }
        });
    },

    /**
     * Resets all product filters to their default values.
     * - Clears the global search query.
     * - Removes the selected category.
     * - Resets the price range to its initial limits.
     * This is typically used when the user clicks a "Reset Filters" button.
     */
    resetFilters: () => {
        store.setState({
            searchQuery: '',
            filters: {
                category: null,
                minPrice: 0,
                maxPrice: Infinity
            }
        });
    }
};
