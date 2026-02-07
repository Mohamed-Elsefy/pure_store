// src/features/products/products.view.js

import { loadTemplate } from '../../core/utils/template.loader.js';

/**
 * ProductsView
 * Handles rendering and UI interactions for the Products page.
 * This layer is responsible only for DOM manipulation and user interaction,
 * without any business logic or API calls.
 */
export const ProductsView = {
    // Current active page in pagination
    currentPage: 1,

    // Total number of available pages
    totalPages: 1,

    // -----------------------------
    // Load the base layout (Sidebar + Grid)
    async renderLayout() {
        // Load and inject the sidebar template
        const sidebar = await loadTemplate('/src/features/products/partials/sidebar.html');
        document.getElementById('sidebar-container').innerHTML = sidebar;

        // Load the grid only once to avoid removing pagination elements
        const gridContainer = document.getElementById('products-grid');
        if (!gridContainer.innerHTML) {
            const grid = await loadTemplate('/src/features/products/partials/grid.html');
            gridContainer.innerHTML = grid;
        }
    },

    // -----------------------------
    // Load and return the product card template
    async getCardTemplate() {
        return await loadTemplate('/src/features/products/partials/product-card.html');
    },

    // -----------------------------
    // Render product cards inside the grid
    renderProducts(products, cardTemplate) {
        const grid = document.getElementById('products-grid');
        if (!grid) return;

        // Show empty state when no products are available
        if (!products || products.length === 0) {
            grid.innerHTML = `
                <p class="col-span-full text-center py-20 text-gray-500">
                    No products found matching your search.
                </p>`;
            return;
        }

        // Build product cards using the template
        grid.innerHTML = products.map(product => {
            // Prefer thumbnail, fallback to first image if available
            const image = product.thumbnail || product.images?.[0] || '';

            return cardTemplate
                .replace(/{{id}}/g, product.id)
                .replace(/{{image}}/g, image)
                .replace(/{{title}}/g, product.title)
                .replace(/{{price}}/g, product.price)
                .replace(/{{brand}}/g, product.brand ?? '')
                .replace(/{{category}}/g, product.category ?? '')
                .replace(/{{rating}}/g, product.rating ?? '');
        }).join('');

        // Update pagination controls after rendering products
        this.renderPagination();
    },

    // -----------------------------
    // Render categories list and bind click callbacks
    renderCategories(categories, handler) {
        const list = document.getElementById('categories-list');
        if (!list) return;

        // Keep the first default list item (e.g., "Loading...")
        const firstLi = list.querySelector('li');

        // Append fetched categories dynamically
        categories.forEach(cat => {
            const li = document.createElement('li');

            // Reuse existing styles from the default list item
            li.className = firstLi.className;
            li.setAttribute('data-category', cat.slug || cat);
            li.textContent = cat.name || cat;

            list.appendChild(li);

            // Notify controller when a category is selected
            li.addEventListener('click', () => {
                handler(cat.slug || cat);
            });
        });
    },

    // -----------------------------
    // Bind price filter inputs (min / max price)
    bindFilters(handler) {
        const minInput = document.getElementById('min-price');
        const maxInput = document.getElementById('max-price');

        const emitChange = () => {
            const minRaw = minInput.value.trim();
            const maxRaw = maxInput.value.trim();

            let min = minRaw === '' ? null : Number(minRaw);
            let max = maxRaw === '' ? null : Number(maxRaw);

            // Prevent negative values
            if (min !== null && min < 0) min = 0;
            if (max !== null && max < 0) max = Infinity;

            // Emit updated filter values
            handler({
                minPrice: min,
                maxPrice: max
            });
        };

        minInput?.addEventListener('input', emitChange);
        maxInput?.addEventListener('input', emitChange);
    },

    // -----------------------------
    // Update pagination controls (Previous / Next buttons and page info)
    renderPagination() {
        const prevBtn = document.getElementById('pagination-prev');
        const nextBtn = document.getElementById('pagination-next');
        const pageInfo = document.getElementById('pagination-info');

        if (!prevBtn || !nextBtn || !pageInfo) return;

        // Disable buttons based on current page
        prevBtn.disabled = this.currentPage <= 1;
        nextBtn.disabled = this.currentPage >= this.totalPages;

        // Update page indicator text
        pageInfo.textContent = `Page ${this.currentPage} of ${this.totalPages}`;
    },

    // -----------------------------
    // Callback triggered when the page changes
    onPageChange: null,

    /**
     * Registers a callback to be executed when the page changes.
     * Used by the controller to react to pagination events.
     */
    setPageChangeHandler(callback) {
        this.onPageChange = callback;
    },

    // -----------------------------
    // Update pagination state based on total items and items per page
    updatePagination(totalItems, itemsPerPage) {
        this.totalPages = Math.ceil(totalItems / itemsPerPage);

        // Ensure current page is always within valid range
        if (this.currentPage > this.totalPages) {
            this.currentPage = this.totalPages || 1;
        }

        this.renderPagination();
    }
};
