// src/features/products/products.view.js

import { loadTemplate } from '../../core/utils/template.loader.js';
import { Spinner } from '../../core/utils/spinner.js';

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
    },

    // -----------------------------
    // Load and return the product card template
    async getCardTemplate() {
        return await loadTemplate('/src/features/products/partials/product-card.html');
    },

    // -----------------------------
    // binds click events to each product card so that clicking on the card
    // (but not on the "Add to Cart" button) navigates to the product's detail page.
    bindProductClick() {
        const cards = document.querySelectorAll('.product-card');

        cards.forEach(card => {
            card.addEventListener('click', (e) => {
                // Ignore clicks on the "Add to Cart" button inside the card
                if (e.target.closest('.add-to-cart-btn')) {
                    return;
                }

                // Get the product ID stored in the card's data attribute
                const id = card.dataset.productId;

                // Navigate to the product detail page using hash routing
                window.location.hash = `#/product/${id}`;
            });
        });
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

        // 
        this.bindProductClick();
    },

    // -----------------------------
    // Render categories list and bind click callbacks
    // داخل products.view.js

    renderCategories(categories, handler) {
        const list = document.getElementById('categories-list');
        const template = document.getElementById('category-item-template');

        if (!list || !template) return;

        list.innerHTML = '';

        categories.forEach(cat => {
            const name = cat.name || cat;
            const slug = cat.slug || cat;

            const clone = template.content.cloneNode(true);
            const li = clone.querySelector('li');
            const span = clone.querySelector('.category-name');

            li.setAttribute('data-category', slug);
            span.textContent = name.charAt(0).toUpperCase() + name.slice(1);

            li.addEventListener('click', () => handler(slug));

            list.appendChild(clone);
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
    },

    // -----------------------------
    // show spinner whene loading 
    showLoading() {
        const grid = document.getElementById('products-grid');
        if (grid) {
            grid.innerHTML = Spinner();
        }
    },

    showCategoriesLoading() {
        const list = document.getElementById('categories-list');
        if (list) {
            list.innerHTML = Spinner();
        }
    }
};
