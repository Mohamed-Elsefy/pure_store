// src/core/services/http.service.js

// Import API configuration and global store
import { API_CONFIG } from '../config/api.config.js';
import store from '../store/store.js';

/**
 * HttpService
 * A wrapper around the Fetch API
 * Standardizes data fetching, headers, and error handling.
 */
class HttpService {
    constructor() {
        // Base URL for all API requests
        this.baseURL = API_CONFIG.BASE_URL;
    }

    /**
     * Prepare common headers for all requests
     * Includes Authorization token if available
     * @returns {Object} headers
     */
    _getHeaders() {
        const { token } = store.getState();
        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        return headers;
    }

    /**
     * Handle the fetch response
     * Throws an error if response is not OK
     * @param {Response} response - fetch Response object
     * @returns {Promise<Object>} parsed JSON data
     */
    async _handleResponse(response) {
        if (!response.ok) {
            // Try to parse error message from response
            const errorData = await response.json().catch(() => ({}));
            const errorMessage = errorData.message || `Error: ${response.status}`;

            // Optional: Auto logout if unauthorized (401)
            if (response.status === 401) {
                // UserActions.logout(); // can be called here if needed
            }

            throw new Error(errorMessage);
        }

        // Return parsed JSON data
        return response.json();
    }

    //    HTTP Methods
    /**
     * GET request
     * @param {string} endpoint - API endpoint
     * @returns {Promise<Object>} API response data
     */
    async get(endpoint) {
        const response = await fetch(`${this.baseURL}${endpoint}`, {
            method: 'GET',
            headers: this._getHeaders(),
        });
        return this._handleResponse(response);
    }

    /**
     * POST request
     * @param {string} endpoint - API endpoint
     * @param {Object} body - Request payload
     * @returns {Promise<Object>} API response data
     */
    async post(endpoint, body) {
        const response = await fetch(`${this.baseURL}${endpoint}`, {
            method: 'POST',
            headers: this._getHeaders(),
            body: JSON.stringify(body),
        });
        return this._handleResponse(response);
    }

    /**
     * PUT request
     * @param {string} endpoint - API endpoint
     * @param {Object} body - Request payload
     * @returns {Promise<Object>} API response data
     */
    async put(endpoint, body) {
        const response = await fetch(`${this.baseURL}${endpoint}`, {
            method: 'PUT',
            headers: this._getHeaders(),
            body: JSON.stringify(body),
        });
        return this._handleResponse(response);
    }

    /**
     * DELETE request
     * @param {string} endpoint - API endpoint
     * @returns {Promise<Object>} API response data
     */
    async delete(endpoint) {
        const response = await fetch(`${this.baseURL}${endpoint}`, {
            method: 'DELETE',
            headers: this._getHeaders(),
        });
        return this._handleResponse(response);
    }
}

// Export a singleton instance
const httpService = new HttpService();
export default httpService;
