// core/store/store.js

class Store {
    constructor() {
        this.state = {
            // Authentication state (Grouped for clarity)
            auth: {
                user: null,          // Full user object from API
                token: null,         // accessToken
                isAuthenticated: false,
                loading: false,      // Specific loading for auth actions
                error: null          // For login/register error messages
            },

            // Core data fetched from API (static after load)
            products: [],      // Raw list of products
            categories: [],    // List of categories

            // Filtering and search state (used by selectors)
            searchQuery: '',
            filters: {
                category: null,
                minPrice: 0,
                maxPrice: Infinity,
                sortBy: '' // Options: 'price-asc', 'price-desc', 'rating-desc', 'title-asc'
            },

            // Pagination state
            pagination: {
                currentPage: 1,
                itemsPerPage: 12
            },

            // Other data
            cart: [],
            buyNowItem: null,
            theme: localStorage.getItem('theme') || 'light',
            loading: false // Loading for general content
        };

        // Listeners subscribed to state changes
        this.listeners = [];
    }

    /**
     * Get the current state
     * @returns {Object} Current store state
     */
    getState() {
        return this.state;
    }

    /**
     * Update the state with new values and notify listeners
     * @param {Object} newState - Partial state to merge
     */
    setState(newState) {
        // Merge old state with new state
        this.state = {
            ...this.state,
            ...newState
        };
        this.notify();
    }

    /**
     * Subscribe to state changes
     * @param {Function} listener - Callback function receiving the new state
     * @returns {Function} Unsubscribe function
     */
    subscribe(listener) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    /**
     * Notify all subscribed listeners of state changes
     */
    notify() {
        this.listeners.forEach(listener => listener(this.state));
    }
}

// Export a singleton store instance
const store = new Store();
export default store;
