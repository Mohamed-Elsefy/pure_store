// src/features/products/products.view.js
import { loadTemplate } from '../../core/utils/template.loader.js';
import { CartActions } from '../../core/store/cart.actions.js';

/**
 * ProductsView
 * Responsible only for rendering the DOM and delegating user interactions to the controller.
 */
export const ProductsView = {
    // Current pagination state
    currentPage: 1,
    totalPages: 1,
    currentProducts: [],

    /**
     * Load and render the sidebar layout
     */
    async renderLayout() {
        const sidebar = await loadTemplate('./src/features/products/partials/sidebar.html');
        const container = document.getElementById('sidebar-container');
        if (container) container.innerHTML = sidebar;
    },

    /**
     * Load product card template
     * @returns {string} HTML template string
     */
    async getCardTemplate() {
        return await loadTemplate('./src/features/products/partials/product-card.html');
    },

    /**
     * Render products in the grid
     * @param {Array} products - Array of product objects
     * @param {string} cardTemplate - HTML template for a single product card
     */
    renderProducts(products, cardTemplate) {
        const grid = document.getElementById('products-grid');
        if (!grid) return;

        this.currentProducts = products;

        // Show empty state if no products
        if (!products || products.length === 0) {
            grid.innerHTML = `
                <div class="col-span-full flex flex-col items-center py-20 text-gray-500">
                    <i class="fa-solid fa-magnifying-glass text-4xl mb-4 opacity-20"></i>
                    <p class="text-lg font-medium">No products found matching your criteria.</p>
                </div>`;
            return;
        }

        // Build product cards
        grid.innerHTML = products.map(product => {
            const image = product.thumbnail || product.images?.[0] || '';
            return cardTemplate
                .replace(/{{id}}/g, product.id)
                .replace(/{{image}}/g, image)
                .replace(/{{title}}/g, product.title)
                .replace(/{{price}}/g, product.price)
                .replace(/{{brand}}/g, product.brand || 'Generic')
                .replace(/{{category}}/g, product.category || 'General')
                .replace(/{{rating}}/g, product.rating || '0.0');
        }).join('');

        // Update pagination after rendering
        this.renderPagination();

        // Bind click events to product cards
        this.bindProductClick();
    },

    /**
     * Render category list in the sidebar
     * @param {Array} categories - List of category objects or strings
     * @param {Function} handler - Callback on category selection
     */
    renderCategories(categories, handler) {
        const list = document.getElementById('categories-list');
        const template = document.getElementById('category-item-template');
        if (!list || !template) return;

        list.innerHTML = '';

        // Add remaining categories
        categories.forEach(cat => {
            const slug = (typeof cat === 'object') ? cat.slug : cat;
            const name = (typeof cat === 'object') ? cat.name : cat;

            const clone = template.content.cloneNode(true);
            const li = clone.querySelector('li');
            const span = clone.querySelector('.category-name');
            li.setAttribute('data-category', slug);
            span.textContent = name;

            list.appendChild(clone);
        });

        // Event delegation for category selection
        list.onclick = (e) => {
            const li = e.target.closest('.category-item');
            if (li) {
                const selectedCat = li.getAttribute('data-category') || null;
                handler(selectedCat);
            }
        };
    },

    /**
     * Bind min/max price filter inputs
     * @param {Function} handler - Callback on price change
     */
    bindFilters(handler) {
        const minInput = document.getElementById('min-price');
        const maxInput = document.getElementById('max-price');

        const emitChange = () => {
            const min = minInput.value === '' ? 0 : Number(minInput.value);
            const max = maxInput.value === '' ? Infinity : Number(maxInput.value);
            handler({ minPrice: min, maxPrice: max });
        };

        minInput?.addEventListener('change', emitChange);
        maxInput?.addEventListener('change', emitChange);
    },

    /**
     * Render pagination buttons and info
     */
    renderPagination() {
        const prevBtn = document.getElementById('pagination-prev');
        const nextBtn = document.getElementById('pagination-next');
        const pageInfo = document.getElementById('pagination-info');
        if (!prevBtn || !nextBtn || !pageInfo) return;

        prevBtn.disabled = this.currentPage <= 1;
        nextBtn.disabled = this.currentPage >= this.totalPages;

        prevBtn.classList.toggle('opacity-50', prevBtn.disabled);
        prevBtn.classList.toggle('cursor-not-allowed', prevBtn.disabled);
        nextBtn.classList.toggle('opacity-50', nextBtn.disabled);
        nextBtn.classList.toggle('cursor-not-allowed', nextBtn.disabled);

        pageInfo.textContent = `Page ${this.currentPage} of ${this.totalPages || 1}`;
    },

    /**
 * Bind click events on product cards
 * Handles both:
 * 1) Add to Cart button inside the card
 * 2) Navigation to product details page
 * 
 * @param {Array} products - List of available products
 */
    bindProductClick() {
        const grid = document.getElementById('products-grid');

        // Prevent rebinding events multiple times
        if (!grid || grid.dataset.bound === 'true') return;
        grid.dataset.bound = 'true';

        grid.addEventListener('click', async (e) => {

            // Check if Add to Cart button was clicked
            const addToCartBtn = e.target.closest('.add-to-cart-btn');

            if (addToCartBtn) {
                e.preventDefault();
                e.stopPropagation(); // Prevent triggering card navigation

                const id = addToCartBtn.dataset.id;

                // Find the selected product by ID
                const product = this.currentProducts.find(p => String(p.id) === String(id));

                if (product) {
                    // Show loading spinner inside button
                    const originalIcon = addToCartBtn.innerHTML;
                    addToCartBtn.innerHTML =
                        '<i class="fa-solid fa-spinner fa-spin"></i>';

                    // Add item to cart
                    await CartActions.addItem(product, 1);

                    // Restore original button icon after short delay
                    setTimeout(() => {
                        addToCartBtn.innerHTML = originalIcon;
                    }, 1000);
                }

                return; // Stop here to avoid navigating to details page
            }

            // Handle navigation to product details page
            const card = e.target.closest('.product-card');

            if (card) {
                const id = card.dataset.productId;

                // Navigate using hash-based routing
                window.location.hash = `#/product/${id}`;
            }
        });
    }

};
