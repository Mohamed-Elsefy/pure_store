// src/core/services/cart.service.js
import httpService from './http.service.js';

/**
 * CartService
 * Handles all cart-related API requests using DummyJSON.
 * Responsible only for communicating with the backend layer.
 */
export const CartService = {

    /**
     * Fetch all carts for a specific user
     * @param {number|string} userId - User identifier
     * @returns {Object} - Object containing carts array and metadata
     */
    async getCartsByUser(userId) {
        return await httpService.get(`/carts/user/${userId}`);
    },

    /**
     * Fetch a single cart by its ID
     * @param {number|string} cartId - Cart identifier
     * @returns {Object} - Cart object with full product details
     */
    async getCartById(cartId) {
        return await httpService.get(`/carts/${cartId}`);
    },

    /**
     * Create a new cart (Simulation mode in DummyJSON)
     * @param {Object} data - Cart payload { userId, products: [{ id, quantity }] }
     * @returns {Object} - Newly created cart including totals and discounts
     */
    async addCart(data) {
        return await httpService.post('/carts/add', data);
    },

    /**
     * Update an existing cart (add/modify product quantities)
     * @param {number|string} cartId - Cart identifier
     * @param {Object} data - { products: [{ id, quantity }], merge: true }
     * @returns {Object} - Updated cart object
     */
    async updateCart(cartId, data) {
        // Use merge: true to preserve existing products and merge new updates
        const payload = { merge: true, ...data };
        return await httpService.put(`/carts/${cartId}`, payload);
    },

    /**
     * Delete a cart (Simulation)
     * @param {number|string} cartId - Cart identifier
     * @returns {Object} - Object containing deletion status and timestamp
     */
    async deleteCart(cartId) {
        return await httpService.delete(`/carts/${cartId}`);
    },

    /**
     * Retrieve all carts in the system
     * Typically used for admin or debugging purposes
     * @returns {Object} - { carts, total, skip, limit }
     */
    async getAllCarts() {
        return await httpService.get('/carts');
    }
};
