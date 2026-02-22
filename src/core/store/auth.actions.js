// src/core/store/auth.actions.js

import store from './store.js';
import { AuthHelper } from '../utils/auth.helper.js';
import { AuthService } from '../services/auth.service.js';
import { CartActions } from './cart.actions.js';
import { Toast } from '../utils/toast.js';
import { CartPersistence } from '../utils/cart.persistence.js';

/**
 * AuthActions
 * Handles authentication-related state transitions and side effects:
 * - Registration
 * - Login
 * - Logout
 * - Session initialization
 * Also manages cart synchronization during auth changes.
 */
export const AuthActions = {

    /**
     * Registers a new user:
     * - Sets loading state
     * - Calls AuthService to create the user
     * - Persists guest cart under the new user ID
     * - Shows feedback via Toast
     * - Resets loading and error states
     */
    register: async (userData) => {
        store.setState({ auth: { ...store.getState().auth, loading: true, error: null } });

        try {
            const newUser = await AuthService.register(userData);

            if (newUser && newUser.id) {
                const currentGuestCart = store.getState().cart || [];
                CartPersistence.save(currentGuestCart, newUser.id);
            }

            store.setState({ auth: { ...store.getState().auth, loading: false } });
            Toast.show(`Account created! Welcome ${newUser.firstName}`, 'success');
            return true;

        } catch (error) {
            store.setState({
                auth: { ...store.getState().auth, loading: false, error: error.message }
            });
            Toast.show('Registration failed. Please try again.', 'error');
            return false;
        }
    },

    /**
     * Logs in a user:
     * - Sets loading state
     * - Authenticates via AuthService
     * - Saves session (token + user)
     * - Merges guest cart with stored user cart
     * - Updates store with authenticated state
     * - Persists final merged cart
     */
    login: async (username, password) => {
        store.setState({ auth: { ...store.getState().auth, loading: true, error: null } });

        try {
            const data = await AuthService.login(username, password);

            AuthHelper.saveSession(data.accessToken, data);

            const guestCart = [...store.getState().cart];
            const savedUserCartJson = localStorage.getItem(`cart_user_${data.id}`);
            const userCart = savedUserCartJson ? JSON.parse(savedUserCartJson) : [];

            // Merge carts using Map to avoid duplicate product IDs
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
                auth: {
                    user: data,
                    token: data.accessToken,
                    isAuthenticated: true,
                    loading: false
                }
            });

            CartPersistence.save(finalCart, data.id);
            Toast.show(`Welcome back, ${data.firstName || data.username}`, 'success');
            return true;

        } catch (error) {
            store.setState({
                auth: { ...store.getState().auth, loading: false, error: error.message }
            });
            Toast.show('Login failed. Please check your credentials.', 'error');
            return false;
        }
    },

    /**
     * Logs out the current user:
     * - Saves current cart under user ID
     * - Clears session and local cart
     * - Resets auth and cart state in store
     * - Redirects to login page
     */
    logout: () => {
        const { auth, cart } = store.getState();

        if (auth.user && auth.user.id) {
            CartPersistence.save(cart, auth.user.id);
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
     * Initializes authentication state on app startup:
     * - Restores session from storage
     * - Validates token and user
     * - Syncs cart (local or server) based on availability
     * - Clears invalid sessions if corrupted
     */
    initAuth: async () => {
        const token = AuthHelper.getToken();
        const user = AuthHelper.getUser();

        if (token && user && user.id && user.id !== 'undefined') {
            store.setState({
                auth: { user, token, isAuthenticated: true, loading: false, error: null }
            });

            const localCart = JSON.parse(localStorage.getItem('purestore_cart') || '[]');

            if (localCart.length === 0) {
                await CartActions.syncCartWithServer(user.id);
            } else {
                store.setState({ cart: localCart });
            }
        } else {
            AuthHelper.clearSession();
        }
    },
    /**
     * Updates the currently authenticated user's profile.
     *
     * Flow:
     * - Retrieves the logged-in user from the store.
     * - If no user exists, the operation stops.
     * - Sets loading state to true while processing.
     * - Calls AuthService.updateUser to persist changes (local or API).
     * - Updates the saved session in localStorage to keep data after refresh.
     * - Updates the global store with the new user data.
     * - Shows a success notification.
     * - On failure:
     *     • Resets loading state.
     *     • Displays an error notification.
     * - Returns true on success, false on failure.
     */
    updateProfile: async (updateData) => {
        const { user } = store.getState().auth;
        if (!user) return;

        store.setState({ auth: { ...store.getState().auth, loading: true } });

        try {
            const updatedUser = await AuthService.updateUser(user.id, updateData);

            AuthHelper.saveSession(AuthHelper.getToken(), updatedUser);

            store.setState({
                auth: {
                    ...store.getState().auth,
                    user: updatedUser,
                    loading: false
                }
            });

            Toast.show('Profile updated successfully!', 'success');
            return true;
        } catch (error) {
            store.setState({ auth: { ...store.getState().auth, loading: false } });
            Toast.show('Failed to update profile', 'error');
            return false;
        }
    },

    /**
     * Deletes the currently authenticated user's account.
     *
     * Flow:
     * - Retrieves the logged-in user from the store.
     * - If no user exists, the operation stops.
     * - Calls AuthService.deleteUser to remove the account (local or API).
     * - Removes the user's cart from localStorage.
     * - Displays a confirmation notification.
     * - Logs the user out and clears the session.
     * - Returns true on success, false on failure.
     */
    deleteAccount: async () => {
        const { user } = store.getState().auth;
        if (!user) return;

        try {
            await AuthService.deleteUser(user.id);

            localStorage.removeItem(`cart_user_${user.id}`);

            Toast.show('Account deleted successfully', 'info');

            AuthActions.logout();
            return true;
        } catch (error) {
            Toast.show('Failed to delete account', 'error');
            return false;
        }
    }
};