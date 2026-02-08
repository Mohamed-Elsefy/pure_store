// src/teatures/products/products.controller.js

import { loadTemplate } from '../../core/utils/template.loader.js';
import { ProductService } from '../../core/services/product.service.js';
import { ProductsView } from './products.view.js';
import { ProductActions } from '../../core/store/actions.js';

export class ProductsController {
    constructor() {
        // HTML template for a single product card
        this.cardTemplate = '';

        // Number of products per page
        this.itemsPerPage = 12;

        // Current pagination page
        this.currentPage = 1;

        // Currently selected category
        this.currentCategory = null;

        // Active price filters
        this.filters = {};

        // Current sort option
        this.sortBy = '';

        // Timeout reference for delayed sidebar closing
        this._closeSidebarTimeout = null;
    }

    async init() {
        // Load main products page template into #app
        const app = document.getElementById('app');
        const mainTemplate = await loadTemplate('/src/features/products/products.template.html');
        app.innerHTML = mainTemplate;

        // Render sidebar and grid layout
        await ProductsView.renderLayout();

        // Initialize sidebar behavior 
        this.initSidebar();
        this.initSortDropdown();
        this.bindResetButton();

        // Load product card template and categories in parallel
        const [cardTemplate, categories] = await Promise.all([
            ProductsView.getCardTemplate(),
            ProductService.getCategories()
        ]);
        this.cardTemplate = cardTemplate;

        // Handle category selection
        ProductsView.renderCategories(categories, (category) => {
            this.currentCategory = category;
            this.currentPage = 1;
            this.fetchProducts();
            this.closeSidebar();
            this.updateActiveCategoryUI(category);
        });

        // Bind price filters (with delayed sidebar close)
        ProductsView.bindFilters((filters) => {
            this.filters = filters;
            this.currentPage = 1;
            this.fetchProducts();

            clearTimeout(this._closeSidebarTimeout);
            this._closeSidebarTimeout = setTimeout(() => this.closeSidebar(), 800);
        });

        // Bind sorting dropdown
        const sortSelect = document.getElementById('sort-products');
        sortSelect?.addEventListener('change', () => {
            this.sortBy = sortSelect.value;
            this.currentPage = 1;
            this.fetchProducts();
            this.closeSidebar();
        });

        // Static pagination buttons
        document.getElementById('pagination-prev')?.addEventListener('click', () => {
            if (this.currentPage > 1) {
                this.currentPage--;
                this.fetchProducts();
            }
        });

        document.getElementById('pagination-next')?.addEventListener('click', () => {
            if (this.currentPage < ProductsView.totalPages) {
                this.currentPage++;
                this.fetchProducts();
            }
        });

        // Initial products fetch
        this.fetchProducts();
    }

    async fetchProducts() {
        try {
            // start with spinner 
            ProductsView.showLoading();

            // Fetch all products (no backend pagination)
            let result = this.currentCategory
                ? await ProductService.getProductsByCategory(this.currentCategory, { page: 1, limit: 0 })
                : await ProductService.getAllProducts({ page: 1, limit: 0 });

            let products = result.products;

            // Apply price filtering
            const { minPrice, maxPrice } = this.filters;
            products = products.filter(p => {
                const price = Number(p.price) || 0;
                return (minPrice != null ? price >= minPrice : true) &&
                    (maxPrice != null ? price <= maxPrice : true);
            });

            // Apply sorting
            products.sort((a, b) => {
                switch (this.sortBy) {
                    case 'price-asc': return a.price - b.price;
                    case 'price-desc': return b.price - a.price;
                    case 'rating-desc': return (b.rating || 0) - (a.rating || 0);
                    case 'title-asc': return a.title.localeCompare(b.title);
                    case 'created-desc':
                        return new Date(b.meta?.createdAt) - new Date(a.meta?.createdAt);
                    default:
                        return 0;
                }
            });

            // Calculate pagination data
            const totalPages = Math.ceil(products.length / this.itemsPerPage);
            if (this.currentPage > totalPages) this.currentPage = totalPages || 1;
            ProductsView.totalPages = totalPages;

            // Slice products for the current page
            const start = (this.currentPage - 1) * this.itemsPerPage;
            const paginated = products.slice(start, start + this.itemsPerPage);

            // Update view pagination state and render products
            ProductsView.currentPage = this.currentPage;
            ProductsView.renderProducts(paginated, this.cardTemplate);

        } catch (err) {
            // Handle errors and render empty state
            console.error('Error fetching products:', err);
            ProductsView.renderProducts([], this.cardTemplate);
        }
    }

    // ---------------------------
    // Sidebar logic
    initSidebar() {
        const sidebarToggle = document.getElementById('sidebar-toggle');
        const sidebar = document.getElementById('sidebar-container');
        const overlay = document.getElementById('overlay');

        // Toggle sidebar open/close
        sidebarToggle?.addEventListener('click', () => {
            const isHidden = sidebar.classList.contains('-translate-x-[120%]');
            if (isHidden) {
                sidebar.classList.remove('-translate-x-[120%]');
                overlay.classList.remove('hidden');
                document.body.style.overflow = 'hidden';
            } else {
                this.closeSidebar();
            }
        });

        // Close sidebar when clicking overlay
        overlay?.addEventListener('click', () => this.closeSidebar());

        // Handle touch scrolling inside sidebar on mobile
        let startY = 0;
        sidebar.addEventListener('touchstart', e => {
            startY = e.touches[0].clientY;
        });

        sidebar.addEventListener('touchmove', e => {
            const deltaY = startY - e.touches[0].clientY;
            if (
                (sidebar.scrollTop === 0 && deltaY < 0) ||
                (sidebar.scrollTop + sidebar.offsetHeight >= sidebar.scrollHeight && deltaY > 0)
            ) {
                e.preventDefault();
            } else {
                e.stopPropagation();
            }
        }, { passive: false });
    }

    // Close sidebar and restore page scroll
    closeSidebar() {
        const sidebar = document.getElementById('sidebar-container');
        const overlay = document.getElementById('overlay');
        sidebar.classList.add('-translate-x-[120%]');
        overlay.classList.add('hidden');
        document.body.style.overflow = '';
    }

    // Bind reset filters button
    bindResetButton() {
        const resetBtn = document.getElementById('reset-filters');
        const sortLabel = document.getElementById('selected-sort-label');
        if (!resetBtn) return;

        const minInput = document.getElementById('min-price');
        const maxInput = document.getElementById('max-price');
        const sortSelect = document.getElementById('sort-products');

        resetBtn.addEventListener('click', () => {
            // Reset controller state
            this.filters = {};
            this.currentCategory = null;
            this.sortBy = '';
            this.currentPage = 1;

            // Reset global store filters
            if (sortLabel) sortLabel.textContent = 'Default Selection';

            // Clear UI inputs
            if (minInput) minInput.value = '';
            if (maxInput) maxInput.value = '';

            // reset categories ui
            this.updateActiveCategoryUI(null);

            // Reload products and close sidebar
            this.fetchProducts();
            this.closeSidebar();
        });
    }

    // active category
    updateActiveCategoryUI(selectedCategory) {
        const items = document.querySelectorAll('.category-item');
        items.forEach(item => {
            const itemCat = item.getAttribute('data-category');

            if (itemCat === selectedCategory) {
                item.classList.add('active-category');
            } else {
                item.classList.remove('active-category');
            }
        });
    }

    // sort by drop down menu
    initSortDropdown() {
        const trigger = document.getElementById('dropdown-trigger');
        const menu = document.getElementById('dropdown-menu');
        const label = document.getElementById('selected-sort-label');
        const options = document.querySelectorAll('.sort-option');
        const svg = trigger?.querySelector('svg');

        if (!trigger || !menu) return;

        // open, close menu
        trigger.addEventListener('click', (e) => {
            e.stopPropagation();

            const isHidden = menu.classList.contains('hidden');

            if (isHidden) {
                menu.classList.remove('hidden');
                setTimeout(() => {
                    menu.classList.remove('opacity-0', 'scale-95');
                    menu.classList.add('opacity-100', 'scale-100');
                }, 10);
                svg?.classList.add('rotate-180');
            } else {
                this.closeSortMenu(menu, svg);
            }
        });

        // select chose from menu
        options.forEach(option => {
            option.addEventListener('click', (e) => {
                e.stopPropagation();

                const value = option.getAttribute('data-value');
                if (label) label.textContent = option.textContent;

                this.sortBy = value;
                this.currentPage = 1;
                this.fetchProducts();

                this.closeSortMenu(menu, svg);
            });
        });

        // close menu whene select item
        document.addEventListener('click', () => {
            this.closeSortMenu(menu, svg);
        });
    }

    // close sort by menu
    closeSortMenu(menu, svg) {
        if (!menu.classList.contains('hidden')) {
            menu.classList.add('opacity-0', 'scale-95');
            menu.classList.remove('opacity-100', 'scale-100');
            svg?.classList.remove('rotate-180');

            setTimeout(() => {
                menu.classList.add('hidden');
            }, 200);
        }
    }
}
