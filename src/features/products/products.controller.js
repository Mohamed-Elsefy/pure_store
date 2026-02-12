// src/features/products/products.controller.js

import { loadTemplate } from '../../core/utils/template.loader.js';
import { ProductsView } from './products.view.js';
import store from '../../core/store/store.js';
import { ProductActions } from '../../core/store/actions.js';
import { ProductSelectors } from '../../core/store/selectors.js';
import { UILoader } from '../../core/utils/ui.loader.js';

/**
 * ProductsController
 * Handles rendering the Products page, binding UI events, and syncing with the store.
 */
export class ProductsController {
    constructor() {
        this.cardTemplate = '';
        this.unsubscribe = null;
        this._closeSidebarTimeout = null;
    }

    /**
     * Initialize the page: load templates and subscribe to store updates
     */
    async init() {
        // 1. Load main page template
        const app = document.getElementById('app');
        app.innerHTML = await loadTemplate('/src/features/products/products.template.html');

        // 2. Render static layout components (Sidebar & Layout)
        await ProductsView.renderLayout();

        // 3. Load product card template once
        this.cardTemplate = await ProductsView.getCardTemplate();

        // 4. Subscribe to store changes
        this.unsubscribe = store.subscribe(() => this.render());

        // 5. Initialize UI events
        this.initSidebarEvents();
        this.initSortDropdown();
        this.bindPaginationEvents();
        this.bindResetButton();

        // 6. Initial render (show loading or products if ready)
        this.render();
    }

    /**
     * Main render function
     */
    render() {
        const state = store.getState();

        // Show loading overlay if store is loading
        if (state.loading) {
            UILoader.show();
            return;
        } else {
            UILoader.hide();
        }

        // Get filtered & paginated products from selector
        const { items, totalPages, currentPage } = ProductSelectors.getPaginatedData();

        // Render products and pagination
        ProductsView.totalPages = totalPages;
        ProductsView.currentPage = currentPage;
        ProductsView.renderProducts(items, this.cardTemplate);

        // Render categories in sidebar
        ProductsView.renderCategories(state.categories, (category) => {
            ProductActions.updateFilters({ category });
            this.closeSidebar();
        });

        // Sync UI elements (active category, sort label, inputs) with store state
        this.syncUIWithState(state);
    }

    /**
     * Sync UI with store state
     */
    syncUIWithState(state) {
        // Highlight active category
        const items = document.querySelectorAll('.category-item');
        items.forEach(item => {
            const itemCat = item.getAttribute('data-category');
            const isActive = (itemCat === state.filters.category) || (itemCat === '' && state.filters.category === null);
            item.classList.toggle('active-category', isActive);
        });

        // Update sort label
        const label = document.getElementById('selected-sort-label');
        if (label) {
            const activeSort = document.querySelector(`.sort-option[data-value="${state.filters.sortBy}"]`);
            label.textContent = activeSort ? activeSort.textContent : 'Default Selection';
        }

        // Sync price input values
        const minInput = document.getElementById('min-price');
        const maxInput = document.getElementById('max-price');
        if (minInput && state.filters.minPrice !== 0) minInput.value = state.filters.minPrice;
        if (maxInput && state.filters.maxPrice !== Infinity) maxInput.value = state.filters.maxPrice;
    }

    // --- Event bindings ---

    initSidebarEvents() {
        ProductsView.bindFilters((filters) => {
            ProductActions.updateFilters(filters);
            clearTimeout(this._closeSidebarTimeout);
            this._closeSidebarTimeout = setTimeout(() => this.closeSidebar(), 1200);
        });

        document.getElementById('sidebar-toggle')?.addEventListener('click', () => this.toggleSidebar());
        document.getElementById('overlay')?.addEventListener('click', () => this.closeSidebar());
    }

    bindPaginationEvents() {
        document.getElementById('pagination-prev')?.addEventListener('click', () => {
            const { pagination } = store.getState();
            if (pagination.currentPage > 1) {
                ProductActions.setCurrentPage(pagination.currentPage - 1);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });

        document.getElementById('pagination-next')?.addEventListener('click', () => {
            const { totalPages } = ProductSelectors.getPaginatedData();
            const { pagination } = store.getState();
            if (pagination.currentPage < totalPages) {
                ProductActions.setCurrentPage(pagination.currentPage + 1);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    }

    initSortDropdown() {
        const trigger = document.getElementById('dropdown-trigger');
        const options = document.querySelectorAll('.sort-option');

        options.forEach(option => {
            option.addEventListener('click', () => {
                const value = option.getAttribute('data-value');
                ProductActions.updateFilters({ sortBy: value });
                this.closeSortMenu();
            });
        });

        trigger?.addEventListener('click', (e) => {
            e.stopPropagation();
            document.getElementById('dropdown-menu')?.classList.toggle('hidden');
        });

        document.addEventListener('click', () => this.closeSortMenu());
    }

    bindResetButton() {
        document.getElementById('reset-filters')?.addEventListener('click', () => {
            ProductActions.resetFilters();
            ['min-price', 'max-price', 'search-input'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.value = '';
            });
            this.closeSidebar();
        });
    }

    toggleSidebar() {
        document.getElementById('sidebar-container')?.classList.toggle('-translate-x-[120%]');
        document.getElementById('overlay')?.classList.toggle('hidden');
    }

    closeSidebar() {
        document.getElementById('sidebar-container')?.classList.add('-translate-x-[120%]');
        document.getElementById('overlay')?.classList.add('hidden');
    }

    closeSortMenu() {
        document.getElementById('dropdown-menu')?.classList.add('hidden');
    }

    destroy() {
        if (this.unsubscribe) this.unsubscribe();
        ProductActions.resetFilters();
        clearTimeout(this._closeSidebarTimeout);
    }
}
