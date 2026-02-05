// src/core/services/product.service.js

// Import the generic HTTP service
import httpService from './http.service.js';

/**
 * ProductService
 * Responsible for fetching product and category data from the API.
 * Note: This service does NOT interact with the DOM or the Store.
 */
export const ProductService = {

    /**
     * Fetch all products
     * @returns {Promise<Array>} list of all products
     */
    async getAllProducts() {
        return await httpService.get('/products');
    },

    /**
     * Fetch a single product by its ID
     * @param {number|string} id - Product identifier
     * @returns {Promise<Object>} product details
     */
    async getProductById(id) {
        return await httpService.get(`/products/${id}`);
    },

    /**
     * Fetch all categories
     * @returns {Promise<Array>} list of product categories
     */
    async getCategories() {
        return await httpService.get('/categories');
    },

    /**
     * Fetch products belonging to a category by slug
     * @param {string} slug - Category slug
     * @returns {Promise<Array>} list of products in the category
     */
    async getProductsBySlug(slug) {
        return await httpService.get(`/categories/slug/${slug}`);
    },

    /**
     * Fetch products belonging to a category by ID
     * @param {number|string} id - Category ID
     * @returns {Promise<Array>} list of products in the category
     */
    async getProductsById(id) {
        return await httpService.get(`/categories/${id}`);
    },

    //    Admin / CRUD Operations

    /**
     * Add a new product (Admin)
     * @param {Object} productData - Product payload
     * @returns {Promise<Object>} created product
     */
    async addProduct(productData) {
        return await httpService.post('/products', productData);
    },

    /**
     * Update an existing product (Admin)
     * @param {number|string} id - Product ID
     * @param {Object} productData - Updated product payload
     * @returns {Promise<Object>} updated product
     */
    async updateProduct(id, productData) {
        return await httpService.put(`/products/${id}`, productData);
    },

    /**
     * Delete a product (Admin)
     * @param {number|string} id - Product ID
     * @returns {Promise<Object>} deletion result
     */
    async deleteProduct(id) {
        return await httpService.delete(`/products/${id}`);
    }
};
