// core/store/store.js

/**
 * Simple Global State Management (Store)
 * Acts as a single source of truth for the entire application
 */
class Store {
    constructor() {
        /**
         * 1. Initial Application State
         * Holds all shared data used across the app
         */
        this.state = {
            user: null,                         // Logged-in user data
            token: null,                        // Authentication token
            cart: [],                           // Shopping cart items
            products: [],                       // Products list
            categories: [],                     // Product categories
            searchQuery: '',                    // search from navbar
            searchResults: [],                  // search results
            filters: {
                category: null,                 // category filter
                minPrice: 0,                    // price filter start
                maxPrice: Infinity,             // price filter end
            },
            theme: localStorage.getItem('theme') || 'light', // UI theme
            loading: false                      // Global loading indicator
        };

        /**
         * 2. Subscribers list
         * Components (views/controllers) register here
         * to be notified when the state changes
         */
        this.listeners = [];
    }

    /**
     * Get the current state (read-only access)
     * @returns {Object} current application state
     */
    getState() {
        return this.state;
    }

    /**
     * Update the state
     * Merges the existing state with the new partial state
     *
     * @param {Object} newState - Partial state to update
     */
    setState(newState) {
        // Merge old state with new values
        this.state = {
            ...this.state,
            ...newState
        };

        // Notify all subscribers about the change
        this.notify();
    }

    /**
     * Subscribe to state changes
     * Each subscriber is a callback function
     *
     * @param {Function} listener - Function called on every state update
     * @returns {Function} unsubscribe function
     */
    subscribe(listener) {
        this.listeners.push(listener);

        /**
         * Return unsubscribe function
         * Helps prevent memory leaks and improves performance
         */
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    /**
     * Notify all subscribers
     * Called internally after every state update
     */
    notify() {
        this.listeners.forEach(listener => listener(this.state));
    }
}

/**
 * Export a single instance (Singleton Pattern)
 * Ensures the entire application shares the same store
 */
const store = new Store();
export default store;
