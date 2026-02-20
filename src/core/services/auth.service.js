// src/core/services/auth.service.js

import httpService from './http.service.js';
import { AuthValidator } from '../utils/auth.validator.js';

/**
 * Default profile structure used to fill missing user fields.
 * Ensures every user object has a consistent shape
 * even if some data is not provided by the API.
 */
const PROFILE_PLACEHOLDER = {
    "age": '',
    "gender": '',
    "phone": '',
    "address": {
        "address": '',
        "city": '',
        "state": '',
        "postalCode": '',
        "country": ''
    },
    "bank": {
        "cardExpire": '',
        "cardNumber": '',
        "cardType": ''
    }
};

export class AuthService {

    /**
     * Handles user login:
     * 1. Checks localStorage users first (offline/local users).
     * 2. If found, returns user with generated local token.
     * 3. Otherwise sends login request to external API.
     * 4. Merges API response with default profile structure
     *    to guarantee consistent user data.
     */
    static async login(username, password) {
        const localUsers = JSON.parse(localStorage.getItem('purestore_local_users') || '[]');
        const hashedPassword = await AuthValidator.hashPassword(password);

        const localUser = localUsers.find(u =>
            u.username === username && u.password === hashedPassword
        );

        if (localUser) {
            return { ...localUser, accessToken: `local-token-${localUser.id}` };
        }

        const apiResponse = await httpService.post('/auth/login', { username, password });

        return { ...PROFILE_PLACEHOLDER, ...apiResponse };
    }

    /**
     * Handles user registration:
     * 1. Hashes password before storing.
     * 2. Sends request to API (simulated).
     * 3. Builds complete user object by merging:
     *    - Generated ID
     *    - Default profile template
     *    - User input data
     * 4. Saves user locally in localStorage.
     */
    static async register(userData) {
        const hashedPassword = await AuthValidator.hashPassword(userData.password);

        const response = await httpService.post('/users/add', userData);

        const finalUserData = {
            id: Math.floor(Date.now() + Math.random() * 1000),
            ...PROFILE_PLACEHOLDER,
            ...userData,
            password: hashedPassword,
            role: 'user',
            image: `https://robohash.org/${userData.email}?set=set4`
        };

        const localUsers = JSON.parse(localStorage.getItem('purestore_local_users') || '[]');
        localUsers.push(finalUserData);
        localStorage.setItem('purestore_local_users', JSON.stringify(localUsers));

        return finalUserData;
    }

    /**
     * Retrieves the currently authenticated user
     * from the backend using stored token.
     */
    static async getCurrentUser() {
        return await httpService.get('/auth/me');
    }

    /**
     * Requests a new access token using a refresh token.
     * Used to maintain authenticated session without re-login.
     */
    static async refreshToken(refreshToken) {
        return await httpService.post('/auth/refresh', { refreshToken });
    }
}