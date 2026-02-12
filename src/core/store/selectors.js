// src/core/store/selectors.js
import store from './store.js';

export const ProductSelectors = {

    /**
     * Main selector: filters, searches, and sorts products
     * @returns {Array} Filtered products (before pagination)
     */
    getFilteredProducts: () => {
        const { products, searchQuery, filters } = store.getState();
        let result = [...products];

        // 1. Filter by category
        if (filters.category) {
            result = result.filter(p => p.category === filters.category);
        }

        // 2. Filter by search query (title or brand)
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(p =>
                p.title?.toLowerCase().includes(q) ||
                p.brand?.toLowerCase().includes(q)
            );
        }

        // 3. Filter by price range
        result = result.filter(p => {
            const price = Number(p.price) || 0;
            return price >= (filters.minPrice || 0) && price <= (filters.maxPrice || Infinity);
        });

        // 4. Sorting based on selected option
        if (filters.sortBy) {
            result.sort((a, b) => {
                switch (filters.sortBy) {
                    case 'price-asc': return a.price - b.price;
                    case 'price-desc': return b.price - a.price;
                    case 'rating-desc': return (b.rating || 0) - (a.rating || 0);
                    case 'title-asc': return a.title.localeCompare(b.title);
                    default: return 0;
                }
            });
        }

        return result;
    },

    /**
     * Final selector: paginates the filtered products
     * @returns {Object} Contains paginated items, total items, total pages, and current page
     */
    getPaginatedData: () => {
        const filtered = ProductSelectors.getFilteredProducts();
        const { pagination } = store.getState();

        const startIndex = (pagination.currentPage - 1) * pagination.itemsPerPage;
        const paginatedItems = filtered.slice(startIndex, startIndex + pagination.itemsPerPage);

        return {
            items: paginatedItems,
            totalItems: filtered.length,
            totalPages: Math.ceil(filtered.length / pagination.itemsPerPage),
            currentPage: pagination.currentPage
        };
    }
};
