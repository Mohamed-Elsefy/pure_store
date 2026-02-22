// auth.helper.js

const TOKEN_KEY = 'purestore_token';
const USER_KEY = 'purestore_user';

export const AuthHelper = {

    /**
     * Save session data after successful login.
     * 
     * @param {string} token - Authentication token (JWT or access token)
     * @param {Object} user - Authenticated user information
     */
    saveSession(token, user) {
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(USER_KEY, JSON.stringify(user));
    },

    /**
     * Retrieve the stored authentication token.
     * Used by HttpService to attach the token to request headers.
     * 
     * @returns {string|null} Stored token or null if not found
     */
    getToken() {
        return localStorage.getItem(TOKEN_KEY);
    },

    /**
     * Retrieve stored user information.
     * 
     * @returns {Object|null} Parsed user object or null if not found
     */
    getUser() {
        const user = localStorage.getItem(USER_KEY);
        return user ? JSON.parse(user) : null;
    },

    /**
 * Updates the currently authenticated user's data:
 * - Retrieves the existing user from storage
 * - Merges the new updated fields with the current user object
 * - Persists the updated user back to localStorage
 * - Returns the updated user object
 * - Returns null if no user is found
 */
    updateUser(updatedData) {
        const currentUser = this.getUser();

        if (currentUser) {
            const newUser = { ...currentUser, ...updatedData };
            localStorage.setItem(USER_KEY, JSON.stringify(newUser));
            return newUser;
        }

        return null;
    },

    /**
     * Clear session data on logout.
     * Removes both token and user information from localStorage.
     */
    clearSession() {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
    },

    /**
     * Check if the user currently has an active session.
     * 
     * @returns {boolean} True if a token exists, otherwise false
     */
    isAuthenticated() {
        return !!this.getToken();
    }
};
