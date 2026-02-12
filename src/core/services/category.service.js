// src/core/services/category.service.js

import httpService from './http.service.js';

export const CategoryService = {
    /**
     * Fetch all categories (returns objects containing slug, name, url)
     */
    async getAllCategories() {
        return await httpService.get('/products/categories');
    },

    /**
     * Fetch only category names (returns an array of strings)
     */
    async getCategoryList() {
        return await httpService.get('/products/category-list');
    }
};
