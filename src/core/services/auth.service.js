// auth.service.js

import httpService from './http.service.js';
import { AuthValidator } from '../utils/auth.validator.js';

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
        const localUsers = JSON.parse(localStorage.getItem('purestore_local_users') || '[]');

        // تشفير كلمة المرور المدخلة لمقارنتها بالمخزنة
        const hashedPassword = await AuthValidator.hashPassword(password);

        const localUser = localUsers.find(u =>
            u.username === username && u.password === hashedPassword
        );

        if (localUser) {
            return { ...localUser, accessToken: `local-token-${localUser.id}` };
        }

        // إذا لم يوجد محلياً، نرسله للـ API (كلمة مرور عادية لأن API DummyJSON لا يعرف الـ Hash الخاص بنا)
        return await httpService.post('/auth/login', { username, password });
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
        const hashedPassword = await AuthValidator.hashPassword(userData.password);

        const response = await httpService.post('/users/add', userData);

        const uniqueId = Math.floor(Date.now() + Math.random() * 1000);

        const finalUserData = {
            ...userData,
            id: uniqueId,
            password: hashedPassword,
            role: 'user',
            image: `https://robohash.org/${userData.email}?set=set4`
        };

        const localUsers = JSON.parse(localStorage.getItem('purestore_local_users') || '[]');
        localUsers.push(finalUserData);
        localStorage.setItem('purestore_local_users', JSON.stringify(localUsers));

        return finalUserData;
    }
}
