// src/core/services/product.service.js

import httpService from './http.service.js';

export const ProductService = {
    /**
     * Fetch all products with optional pagination and sorting
     * @param {Object} options - Pagination and sorting options
     * @param {number} options.page - Page number (default 1)
     * @param {number} options.limit - Items per page (default 10)
     * @param {string} options.sortBy - Field to sort by
     * @param {string} options.order - Sort order: 'asc' or 'desc' (default 'asc')
     * @returns {Object} - { products, total, page, limit }
     */
    async getAllProducts({ page = 1, limit = 10, sortBy = '', order = 'asc' } = {}) {
        const skip = (page - 1) * limit;
        const params = new URLSearchParams({ skip, limit });

        if (sortBy) {
            params.append('sortBy', sortBy);
            params.append('order', order);
        }

        const res = await httpService.get(`/products?${params.toString()}`);
        return {
            products: res.products,
            total: res.total,
            page,
            limit
        };
    },

    /**
     * Fetch a single product by its ID
     * @param {string|number} id - Product ID
     * @returns {Object} - Product object
     */
    async getProductById(id) {
        return await httpService.get(`/products/${id}`);
    },

    /**
     * Search products by a query string
     * @param {string} query - Search keyword
     * @returns {Array} - Array of matching products
     */
    async searchProducts(query) {
        const res = await httpService.get(`/products/search?q=${query}`);
        return res.products;
    },

    /**
     * Get products filtered by category with optional pagination
     * @param {string} category - Category slug or name
     * @param {Object} options - Pagination options
     * @param {number} options.page - Page number (default 1)
     * @param {number} options.limit - Items per page (default 10)
     * @returns {Object} - { products, total, page, limit }
     */
    async getProductsByCategory(category, { page = 1, limit = 10 } = {}) {
        const skip = (page - 1) * limit;
        const query = new URLSearchParams({ skip, limit }).toString();
        const res = await httpService.get(`/products/category/${category}?${query}`);

        return {
            products: res.products,
            total: res.total,
            page,
            limit
        };
    },

    /**
     * Add a new product
     * @param {Object} productData - Product details
     * @returns {Object} - Created product
     */
    async addProduct(productData) {
        return await httpService.post('/products/add', productData);
    },

    /**
     * Update an existing product by ID
     * @param {string|number} id - Product ID
     * @param {Object} productData - Updated product details
     * @returns {Object} - Updated product
     */
    async updateProduct(id, productData) {
        return await httpService.put(`/products/${id}`, productData);
    },

    /**
     * Delete a product by ID
     * @param {string|number} id - Product ID
     * @returns {Object} - Deletion result
     */
    async deleteProduct(id) {
        return await httpService.delete(`/products/${id}`);
    }
};
