// src/core/store/auth.actions.js

import store from './store.js';
import { AuthHelper } from '../utils/auth.helper.js';
import { AuthService } from '../services/auth.service.js';
import { CartActions } from './cart.actions.js';
import { Toast } from '../utils/toast.js';

const persistCart = (cart, userId = null) => {
    // Save the current cart state as a JSON string
    localStorage.setItem('purestore_cart', JSON.stringify(cart));

    // save a copy of cart
    if (userId) {
        localStorage.setItem(`cart_user_${userId}`, JSON.stringify(cart));
    }
};

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
        store.setState({ auth: { ...store.getState().auth, loading: true, error: null } });

        try {
            const data = await AuthService.login(username, password);

            // Save session to localStorage
            AuthHelper.saveSession(data.accessToken, data);

            const guestCart = [...store.getState().cart];

            // Merge guest cart with server cart after login
            // Prevents duplication and merges quantities
            const savedUserCartJson = localStorage.getItem(`cart_user_${data.id}`);
            const userCart = savedUserCartJson ? JSON.parse(savedUserCartJson) : [];

            const mergedMap = new Map();
            userCart.forEach(p => mergedMap.set(p.id, { ...p }));

            guestCart.forEach(p => {
                if (mergedMap.has(p.id)) {
                    const existing = mergedMap.get(p.id);
                    mergedMap.set(p.id, {
                        ...existing,
                        quantity: existing.quantity + p.quantity,
                        total: (existing.quantity + p.quantity) * existing.price
                    });
                } else {
                    mergedMap.set(p.id, { ...p });
                }
            });

            const finalCart = Array.from(mergedMap.values());

            store.setState({
                cart: finalCart,
                auth: { user: data, token: data.accessToken, isAuthenticated: true, loading: false }
            });

            persistCart(finalCart, data.id);

            Toast.show(`Welcome ${data.username}`, 'success');
            return true;

        } catch (error) {
            store.setState({ auth: { ...store.getState().auth, loading: false, error: error.message } });
            Toast.show('Please Try Again!', 'error');
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
        const { auth, cart } = store.getState();

        // save cart copy to local
        if (auth.user) {
            localStorage.setItem(`cart_user_${auth.user.id}`, JSON.stringify(cart));
        }

        AuthHelper.clearSession();
        localStorage.removeItem('purestore_cart');

        store.setState({
            auth: { user: null, token: null, isAuthenticated: false, loading: false, error: null },
            cart: [],
        });

        window.location.hash = '#/login';
    },


    /**
     * Initialize authentication state on app startup.
     * 
     * - Checks if token and user data exist in localStorage.
     * - Restores authentication state if session is valid.
     */
    initAuth: async () => {
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

            const localCart = JSON.parse(localStorage.getItem('purestore_cart') || '[]');
            if (localCart.length === 0) {
                await CartActions.syncCartWithServer(user.id);
            } else {
                store.setState({ cart: localCart });
            }
        }
    }
};