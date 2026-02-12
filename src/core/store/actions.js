// src/core/store/actions.js
import store from './store.js';
import { ProductService } from '../services/product.service.js';
import { CategoryService } from '../services/category.service.js';

export const ProductActions = {
    /**
     * Fetch products and categories when the page is loaded for the first time
     */
    initializeProductsPage: async () => {
        const { products, loading } = store.getState();
        if (products.length > 0 || loading) return; // Do nothing if data already exists or is loading

        store.setState({ loading: true });

        try {
            const [productsRes, categories] = await Promise.all([
                ProductService.getAllProducts({ page: 1, limit: 0 }), // Fetch all products
                CategoryService.getAllCategories(),
            ]);

            store.setState({
                products: productsRes.products,
                categories: categories,
                loading: false
            });
        } catch (error) {
            console.error("Store Init Error:", error);
            store.setState({ loading: false });
        }
    },

    /**
     * Update filters and reset pagination to the first page
     */
    updateFilters: (newFilters) => {
        const { filters, pagination } = store.getState();
        store.setState({
            filters: { ...filters, ...newFilters },
            pagination: { ...pagination, currentPage: 1 } // Reset page when filters change
        });
    },

    /**
     * Set search query and reset pagination to the first page
     */
    setSearchQuery: (query) => {
        const { pagination } = store.getState();
        store.setState({
            searchQuery: query,
            pagination: { ...pagination, currentPage: 1 }
        });
    },

    /**
     * Update the current page in pagination
     */
    setCurrentPage: (page) => {
        const { pagination } = store.getState();
        store.setState({
            pagination: { ...pagination, currentPage: page }
        });
    },

    /**
     * Reset all filters, search query, and pagination to default values
     */
    resetFilters: () => {
        store.setState({
            searchQuery: '',
            filters: {
                category: null,
                minPrice: 0,
                maxPrice: Infinity,
                sortBy: ''
            },
            pagination: {
                currentPage: 1,
                itemsPerPage: 12
            }
        });
    }
};

export const UIActions = {
    /**
     * Toggle theme between light and dark
     */
    toggleTheme: () => {
        const isDark = document.documentElement.classList.contains('dark');
        const newTheme = isDark ? 'light' : 'dark';

        // 1. Update DOM
        if (newTheme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }

        // 2. Save to LocalStorage
        localStorage.setItem('theme', newTheme);

        // 3. Update store state (if theme is stored in the store)
        store.setState({ theme: newTheme });
    },

    /**
     * Initialize theme on application startup
     */
    initTheme: () => {
        const savedTheme = localStorage.getItem('theme') || 'light';
        
        if (savedTheme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        store.setState({ theme: savedTheme });
    }
};
