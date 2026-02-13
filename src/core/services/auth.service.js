// auth.service.js

import httpService from './http.service.js';

export class AuthService {

    /**
     * Authenticate user and create a session
     * Sends username and password to the login endpoint.
     * 
     * @param {string} username - The user's username
     * @param {string} password - The user's password
     * @returns {Promise<Object>} Authentication response (token, user info, etc.)
     */
    static async login(username, password) {
        return await httpService.post('/auth/login', {
            username,
            password,
            expiresInMins: 60 // Token expiration time (1 hour)
        });
    }

    /**
     * Retrieve currently authenticated user data.
     * Note: httpService automatically attaches the stored token
     * to the request headers.
     * 
     * @returns {Promise<Object>} Current user information
     */
    static async getCurrentUser() {
        // Using /auth/me endpoint (may vary depending on API version)
        return await httpService.get('/auth/me');
    }

    /**
     * Refresh the authentication session using a refresh token.
     * 
     * @param {string} refreshToken - The refresh token issued during login
     * @returns {Promise<Object>} New access token and session data
     */
    static async refreshToken(refreshToken) {
        return await httpService.post('/auth/refresh', {
            refreshToken
        });
    }

    /**
     * Register a new user (simulation endpoint).
     * 
     * @param {Object} userData - New user data (name, email, password, etc.)
     * @returns {Promise<Object>} Created user response
     */
    static async register(userData) {
        return await httpService.post('/users/add', userData);
    }
}
