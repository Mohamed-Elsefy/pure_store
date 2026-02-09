// src/features/products/products.controller.js

import { loadTemplate } from '../../core/utils/template.loader.js';
import { ProductService } from '../../core/services/product.service.js';
import { ProductsView } from './products.view.js';
import store from '../../core/store/store.js';
import { ProductActions } from '../../core/store/actions.js';

export class ProductsController {
    constructor() {
        // HTML template for a single product card
        this.cardTemplate = '';

        // Number of products per page
        this.itemsPerPage = 12;

        // Current pagination page
        this.currentPage = 1;

        // Currently selected category from the store
        this.currentCategory = store.getState().filters.category;

        // Active price filters from store or default values
        this.filters = {
            minPrice: store.getState().filters.minPrice ?? 0,
            maxPrice: store.getState().filters.maxPrice ?? Infinity
        };

        // Current sort option from store
        this.sortBy = store.getState().filters.sortBy || '';

        // Timeout reference for delayed sidebar closing
        this._closeSidebarTimeout = null;
    }

    // ---------------------------
    // Initialize products page
    async init() {
        // Load main products page HTML template into the #app container
        const app = document.getElementById('app');
        const mainTemplate = await loadTemplate('/src/features/products/products.template.html');
        app.innerHTML = mainTemplate;

        // Render sidebar layout and grid container
        await ProductsView.renderLayout();

        // Initialize sidebar toggle, sort dropdown, and reset filters button
        this.initSidebar();
        this.initSortDropdown();
        this.bindResetButton();

        // Load product card template and categories from API
        const [cardTemplate, categories] = await Promise.all([
            ProductsView.getCardTemplate(),
            ProductService.getCategories()
        ]);
        this.cardTemplate = cardTemplate;

        // Render categories in sidebar and bind click events
        ProductsView.renderCategories(categories, (category) => {
            this.currentCategory = category;
            this.currentPage = 1;

            // Update filters in global store
            ProductActions.updateFilters({ category });

            // Fetch products based on new category
            this.fetchProducts();

            // Close sidebar after selection
            this.closeSidebar();

            // Update UI for active category highlighting
            this.updateActiveCategoryUI(category);
        });

        // Bind price filter inputs
        ProductsView.bindFilters((filters) => {
            this.filters = filters;
            this.currentPage = 1;

            // Update global store filters
            ProductActions.updateFilters(filters);

            // Fetch filtered products
            this.fetchProducts();

            // Delayed closing of sidebar to allow user to see changes
            clearTimeout(this._closeSidebarTimeout);
            this._closeSidebarTimeout = setTimeout(() => this.closeSidebar(), 800);
        });

        // Bind pagination previous button
        document.getElementById('pagination-prev')?.addEventListener('click', () => {
            if (this.currentPage > 1) {
                this.currentPage--;
                this.fetchProducts();
            }
        });

        // Bind pagination next button
        document.getElementById('pagination-next')?.addEventListener('click', () => {
            if (this.currentPage < ProductsView.totalPages) {
                this.currentPage++;
                this.fetchProducts();
            }
        });

        // Initial fetch of products
        this.fetchProducts();
    }

    // ---------------------------
    // Fetch products from API, apply filters, sorting, and pagination
    async fetchProducts() {
        try {
            // Show loading spinner in the grid
            ProductsView.showLoading();

            // Fetch all products or by selected category
            let result = this.currentCategory
                ? await ProductService.getProductsByCategory(this.currentCategory, { page: 1, limit: 0 })
                : await ProductService.getAllProducts({ page: 1, limit: 0 });

            let products = result.products;

            // Apply min/max price filters
            const { minPrice, maxPrice } = this.filters;
            products = products.filter(p => {
                const price = Number(p.price) || 0;
                return (minPrice != null ? price >= minPrice : true) &&
                    (maxPrice != null ? price <= maxPrice : true);
            });

            // Apply sorting based on selected option
            products.sort((a, b) => {
                switch (this.sortBy) {
                    case 'price-asc': return a.price - b.price;
                    case 'price-desc': return b.price - a.price;
                    case 'rating-desc': return (b.rating || 0) - (a.rating || 0);
                    case 'title-asc': return a.title.localeCompare(b.title);
                    case 'created-desc': return new Date(b.meta?.createdAt) - new Date(a.meta?.createdAt);
                    default: return 0;
                }
            });

            // Calculate pagination
            const totalPages = Math.ceil(products.length / this.itemsPerPage);
            if (this.currentPage > totalPages) this.currentPage = totalPages || 1;
            ProductsView.totalPages = totalPages;

            // Slice products array for current page
            const start = (this.currentPage - 1) * this.itemsPerPage;
            const paginated = products.slice(start, start + this.itemsPerPage);

            // Render products in the grid using the card template
            ProductsView.currentPage = this.currentPage;
            ProductsView.renderProducts(paginated, this.cardTemplate);

        } catch (err) {
            console.error('Error fetching products:', err);

            // Render empty grid in case of error
            ProductsView.renderProducts([], this.cardTemplate);
        }
    }

    // ---------------------------
    // Initialize sidebar open/close behavior
    initSidebar() {
        const sidebarToggle = document.getElementById('sidebar-toggle');
        const sidebar = document.getElementById('sidebar-container');
        const overlay = document.getElementById('overlay');

        // Toggle sidebar on button click
        sidebarToggle?.addEventListener('click', () => {
            const isHidden = sidebar.classList.contains('-translate-x-[120%]');
            if (isHidden) {
                sidebar.classList.remove('-translate-x-[120%]');
                overlay.classList.remove('hidden');
                document.body.style.overflow = 'hidden';
            } else this.closeSidebar();
        });

        // Close sidebar when clicking overlay
        overlay?.addEventListener('click', () => this.closeSidebar());

        // Handle touch scrolling inside sidebar (prevent overscroll)
        let startY = 0;
        sidebar.addEventListener('touchstart', e => startY = e.touches[0].clientY);
        sidebar.addEventListener('touchmove', e => {
            const deltaY = startY - e.touches[0].clientY;
            if ((sidebar.scrollTop === 0 && deltaY < 0) ||
                (sidebar.scrollTop + sidebar.offsetHeight >= sidebar.scrollHeight && deltaY > 0)) {
                e.preventDefault();
            } else e.stopPropagation();
        }, { passive: false });
    }

    // Close sidebar helper
    closeSidebar() {
        const sidebar = document.getElementById('sidebar-container');
        const overlay = document.getElementById('overlay');
        sidebar.classList.add('-translate-x-[120%]');
        overlay.classList.add('hidden');
        document.body.style.overflow = '';
    }

    // ---------------------------
    // Reset all filters and sorting
    bindResetButton() {
        const resetBtn = document.getElementById('reset-filters');
        const sortLabel = document.getElementById('selected-sort-label');
        if (!resetBtn) return;

        const minInput = document.getElementById('min-price');
        const maxInput = document.getElementById('max-price');

        resetBtn.addEventListener('click', () => {
            // Reset controller state
            this.filters = { minPrice: 0, maxPrice: Infinity };
            this.currentCategory = null;
            this.sortBy = '';
            this.currentPage = 1;

            // Reset store filters
            ProductActions.resetFilters();

            // Reset UI inputs
            if (sortLabel) sortLabel.textContent = 'Default Selection';
            if (minInput) minInput.value = '';
            if (maxInput) maxInput.value = '';

            // Reset active category UI
            this.updateActiveCategoryUI(null);

            // Re-fetch all products
            this.fetchProducts();

            // Close sidebar
            this.closeSidebar();
        });
    }

    // ---------------------------
    // Highlight active category in sidebar
    updateActiveCategoryUI(selectedCategory) {
        const items = document.querySelectorAll('.category-item');
        items.forEach(item => {
            const itemCat = item.getAttribute('data-category');
            item.classList.toggle('active-category', itemCat === selectedCategory);
        });
    }

    // ---------------------------
    // Initialize custom sort dropdown
    initSortDropdown() {
        const trigger = document.getElementById('dropdown-trigger');
        const menu = document.getElementById('dropdown-menu');
        const label = document.getElementById('selected-sort-label');
        const options = document.querySelectorAll('.sort-option');
        const icon = trigger?.querySelector('i');
        if (!trigger || !menu) return;

        // Open/close dropdown menu
        trigger.addEventListener('click', e => {
            e.stopPropagation();
            const isHidden = menu.classList.contains('hidden');
            if (isHidden) {
                menu.classList.remove('hidden');
                setTimeout(() => menu.classList.remove('opacity-0', 'scale-95'), 10);
                menu.classList.add('opacity-100', 'scale-100');
                icon?.classList.add('rotate-180');
            } else this.closeSortMenu(menu, icon);
        });

        // Handle selecting a sort option
        options.forEach(option => {
            option.addEventListener('click', e => {
                e.stopPropagation();
                const value = option.getAttribute('data-value');
                if (label) label.textContent = option.textContent;

                this.sortBy = value;
                this.currentPage = 1;

                // Update store filter
                ProductActions.updateFilters({ sortBy: value });

                // Fetch products with new sort
                this.fetchProducts();
                this.closeSortMenu(menu, icon);
            });
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', () => this.closeSortMenu(menu, icon));
    }

    // Close sort menu helper
    closeSortMenu(menu, iocn) {
        if (!menu.classList.contains('hidden')) {
            menu.classList.add('opacity-0', 'scale-95');
            menu.classList.remove('opacity-100', 'scale-100');
            iocn?.classList.remove('rotate-180');
            setTimeout(() => menu.classList.add('hidden'), 200);
        }
    }
}
