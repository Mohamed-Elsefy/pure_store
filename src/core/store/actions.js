// src/core/store/actions.js
import store from './store.js';
import { ProductService } from '../services/product.service.js';
import { CategoryService } from '../services/category.service.js';
import { AuthHelper } from '../utils/auth.helper.js';
import { AuthService } from '../services/auth.service.js';

export const AuthActions = {

    /**
     * Authenticate user and update application state.
     * 
     * Steps:
     * 1. Set loading state.
     * 2. Call AuthService.login().
     * 3. Save session (token + user data).
     * 4. Update auth state in store.
     * 5. (Optional) Merge guest cart with user cart.
     * 
     * @param {string} username
     * @param {string} password
     * @returns {Promise<boolean>} True if login succeeds, otherwise false
     */
    login: async (username, password) => {

        // Set loading state before API call
        store.setState({
            auth: {
                ...store.getState().auth,
                loading: true,
                error: null
            }
        });

        try {
            const data = await AuthService.login(username, password);

            // Save session to localStorage
            AuthHelper.saveSession(data.accessToken, data);

            // Update authentication state in store
            store.setState({
                auth: {
                    user: data,
                    token: data.accessToken,
                    isAuthenticated: true,
                    loading: false,
                    error: null
                }
            });

            /**
             * 🟢 Future Enhancement:
             * Merge guest cart with user cart after successful login.
             * Example:
             * await CartActions.mergeGuestCart();
             */

            return true;

        } catch (error) {

            // Handle login failure
            store.setState({
                auth: {
                    ...store.getState().auth,
                    loading: false,
                    error: error.message
                }
            });

            return false;
        }
    },


    /**
     * Logout user and clear authentication state.
     * 
     * - Clears stored session.
     * - Resets auth state.
     * - Clears cart in store.
     * - Redirects to login page.
     */
    logout: () => {

        // Clear session from localStorage
        AuthHelper.clearSession();

        /**
         * 🟢 Logout behavior:
         * - Reset authentication state.
         * - Clear cart state in store.
         * - Keep guest cart in localStorage (optional behavior).
         */
        store.setState({
            auth: {
                user: null,
                token: null,
                isAuthenticated: false,
                loading: false,
                error: null
            },
            cart: [],
        });

        // Redirect to login route
        window.location.hash = '#/login';
    },


    /**
     * Initialize authentication state on app startup.
     * 
     * - Checks if token and user data exist in localStorage.
     * - Restores authentication state if session is valid.
     */
    initAuth: () => {

        const token = AuthHelper.getToken();
        const user = AuthHelper.getUser();

        if (token && user) {
            store.setState({
                auth: {
                    user: user,
                    token: token,
                    isAuthenticated: true,
                    loading: false,
                    error: null
                }
            });
        }
    }
};


export const ProductActions = {
    /**
     * Fetch products and categories when the page is loaded for the first time
     */
    initializeProductsPage: async () => {
        const { products, loading } = store.getState();
        if (products.length > 0 || loading) return; // Do nothing if data already exists or is loading

        store.setState({ loading: true });

        try {
            const [productsRes, categories] = await Promise.all([
                ProductService.getAllProducts({ page: 1, limit: 0 }), // Fetch all products
                CategoryService.getAllCategories(),
            ]);

            store.setState({
                products: productsRes.products,
                categories: categories,
                loading: false
            });
        } catch (error) {
            console.error("Store Init Error:", error);
            store.setState({ loading: false });
        }
    },

    /**
     * Update filters and reset pagination to the first page
     */
    updateFilters: (newFilters) => {
        const { filters, pagination } = store.getState();
        store.setState({
            filters: { ...filters, ...newFilters },
            pagination: { ...pagination, currentPage: 1 } // Reset page when filters change
        });
    },

    /**
     * Set search query and reset pagination to the first page
     */
    setSearchQuery: (query) => {
        const { pagination } = store.getState();
        store.setState({
            searchQuery: query,
            pagination: { ...pagination, currentPage: 1 }
        });
    },

    /**
     * Update the current page in pagination
     */
    setCurrentPage: (page) => {
        const { pagination } = store.getState();
        store.setState({
            pagination: { ...pagination, currentPage: page }
        });
    },

    /**
     * Reset all filters, search query, and pagination to default values
     */
    resetFilters: () => {
        store.setState({
            searchQuery: '',
            filters: {
                category: null,
                minPrice: 0,
                maxPrice: Infinity,
                sortBy: ''
            },
            pagination: {
                currentPage: 1,
                itemsPerPage: 12
            }
        });
    }
};

export const UIActions = {
    /**
     * Toggle theme between light and dark
     */
    toggleTheme: () => {
        const isDark = document.documentElement.classList.contains('dark');
        const newTheme = isDark ? 'light' : 'dark';

        // 1. Update DOM
        if (newTheme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }

        // 2. Save to LocalStorage
        localStorage.setItem('theme', newTheme);

        // 3. Update store state (if theme is stored in the store)
        store.setState({ theme: newTheme });
    },

    /**
     * Initialize theme on application startup
     */
    initTheme: () => {
        const savedTheme = localStorage.getItem('theme') || 'light';

        if (savedTheme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        store.setState({ theme: savedTheme });
    }
};
