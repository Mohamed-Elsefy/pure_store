// src/core/services/product.service.js

import httpService from './http.service.js';


export const ProductService = {

    /**
     * Get all products
     * DummyJSON returns: { products, total, skip, limit }
     */
    async getAllProducts({ page = 1, limit = 10 } = {}) {
        // pagination
        const skip = (page - 1) * limit;

        const query = new URLSearchParams({ skip, limit }).toString();
        const res = await httpService.get(`/products?${query}`);

        return {
            products: res.products,
            total: res.total,
            page,
            limit
        };
    },


    /**
     * Get single product by ID
     */
    async getProductById(id) {
        return await httpService.get(`/products/${id}`);
    },

    /**
     * Search products
     */
    async searchProducts(query) {
        const res = await httpService.get(`/products/search?q=${query}`);
        return res.products;
    },

    /**
     * Get all categories (array of strings)
     */
    async getCategories() {
        return await httpService.get('/products/categories');
    },

    /**
     * Get products by category
     */
    async getProductsByCategory(category, { page = 1, limit = 10 } = {}) {
        // pagination
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
     * Add product (simulated)
     */
    async addProduct(productData) {
        return await httpService.post('/products/add', productData);
    },

    /**
     * Update product (simulated)
     */
    async updateProduct(id, productData) {
        return await httpService.put(`/products/${id}`, productData);
    },

    /**
     * Delete product (simulated)
     */
    async deleteProduct(id) {
        return await httpService.delete(`/products/${id}`);
    }
};
