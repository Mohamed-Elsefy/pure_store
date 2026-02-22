import store from '../core/store/store.js';
import { loadTemplate } from "../core/utils/template.loader.js";
import { ProductSelectors } from "../core/store/selectors.js";
import { UIActions } from '../core/store/ui.actions.js';
import { ProductActions } from '../core/store/product.actions.js';
import { CartSelectors } from '../core/store/selectors.js';

/**
 * Render the navbar and initialize all interactions
 */
export const renderNavbar = async () => {
    const navElement = document.querySelector('nav');
    if (!navElement) return;

    const template = await loadTemplate('./src/layouts/navbar.template.html');
    navElement.innerHTML = template;

    setupNavbarInteractions();
    setActiveNavLink();

    window.addEventListener('hashchange', setActiveNavLink);
};

/**
 * Setup all navbar-related event listeners
 */
const setupNavbarInteractions = () => {
    const toggleBtn = document.getElementById('mobile-menu-toggle');
    const navLinks = document.getElementById('nav-links');
    const themeBtn = document.getElementById('theme-toggle');
    const searchInput = document.getElementById('search-input');
    const resultsContainer = document.getElementById('search-results');
    const searchTemplate = document.getElementById('search-result-template');
    const themeIcon = themeBtn?.querySelector('i');
    const cartBadge = document.getElementById('cart-badge');

    // qunatity of cart
    const updateCartBadge = () => {
        const count = CartSelectors.getUniqueItemsCount();
        if (cartBadge) {
            if (count > 0) {
                cartBadge.textContent = count;
                cartBadge.classList.remove('hidden');
            } else {
                cartBadge.classList.add('hidden');
            }
        }
    };
    // Initial update when the page loads
    updateCartBadge();

    // Function responsible for updating Navbar UI based on authentication state
    const updateAuthUI = () => {
        // Get navbar elements
        const loginLink = document.getElementById('nav-login-link');
        const userInfo = document.getElementById('nav-user-info');
        const usernameSpan = document.getElementById('nav-username');

        // Get current auth state from the store
        const { auth } = store.getState();

        if (auth.isAuthenticated && auth.user) {

            // Hide login link
            loginLink?.classList.add('hidden');

            // Show user info (e.g., "Hi, Username")
            userInfo?.classList.remove('hidden');
            userInfo?.classList.add('flex');

            // Display user's first name
            if (usernameSpan) usernameSpan.textContent = auth.user.firstName;

        } else {

            // Show login link
            loginLink?.classList.remove('hidden');

            // Hide user info
            userInfo?.classList.add('hidden');
            userInfo?.classList.remove('flex');
        }
    };

    // Initial UI update on load
    updateAuthUI();

    // Subscribe to store updates
    store.subscribe(() => {
        const state = store.getState();

        // 1. Update search dropdown results (existing behavior)
        const filtered = ProductSelectors.getFilteredProducts();
        renderSearchDropdown(filtered.slice(0, 5), resultsContainer, searchTemplate);

        // 2. Update authentication UI when state changes
        updateAuthUI();
    });


    // Helper functions
    const closeMobileMenu = () => {
        if (!navLinks) return;
        navLinks.classList.add('opacity-0', '-translate-y-4', 'pointer-events-none');
        navLinks.classList.remove('opacity-100', 'translate-y-0', 'pointer-events-auto');
    };

    const toggleMobileMenu = () => {
        if (!navLinks) return;
        const isClosed = navLinks.classList.contains('opacity-0');
        if (isClosed) {
            navLinks.classList.remove('opacity-0', '-translate-y-4', 'pointer-events-none');
            navLinks.classList.add('opacity-100', 'translate-y-0', 'pointer-events-auto');
        } else {
            closeMobileMenu();
        }
    };

    // Initial theme icon state
    if (themeIcon) {
        const isDark = store.getState().theme === 'dark' || document.documentElement.classList.contains('dark');
        themeIcon.classList.toggle('fa-moon', isDark);
        themeIcon.classList.toggle('fa-sun', !isDark);
    }

    // Mobile menu toggle
    toggleBtn?.addEventListener('click', e => {
        e.stopPropagation();
        toggleMobileMenu();
    });

    // Close mobile menu on link click
    navLinks?.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', closeMobileMenu);
    });

    // Search input
    searchInput?.addEventListener('input', e => {
        ProductActions.setSearchQuery(e.target.value.trim());
    });

    searchInput?.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
            const firstResult = resultsContainer?.querySelector('li');
            if (firstResult) firstResult.click();
        }
    });

    // Theme toggle
    themeBtn?.addEventListener('click', () => {
        UIActions.toggleTheme();
        if (themeIcon) {
            const isDarkNow = document.documentElement.classList.contains('dark');
            themeIcon.classList.toggle('fa-moon', isDarkNow);
            themeIcon.classList.toggle('fa-sun', !isDarkNow);
        }
    });

    // Subscribe to store for live search results
    store.subscribe(() => {
        const filtered = ProductSelectors.getFilteredProducts();
        renderSearchDropdown(filtered.slice(0, 5), resultsContainer, searchTemplate);
        updateCartBadge();
    });

    // Global click listener
    document.addEventListener('click', e => {
        if (!toggleBtn?.contains(e.target) && !navLinks?.contains(e.target)) {
            closeMobileMenu();
        }
        if (!searchInput?.contains(e.target) && !resultsContainer?.contains(e.target)) {
            resultsContainer?.classList.add('hidden');
        }
    });
};

/**
 * Render search dropdown results
 */
const renderSearchDropdown = (products, container, template) => {
    if (!container || !template) return;

    const query = store.getState().searchQuery;
    if (!query || products.length === 0) {
        container.innerHTML = '';
        container.classList.add('hidden');
        return;
    }

    container.innerHTML = '';
    products.forEach(product => {
        const clone = template.content.cloneNode(true);
        const li = clone.querySelector('li');

        clone.querySelector('.product-title').textContent = product.title;
        li.dataset.id = product.id;

        li.onclick = () => {
            window.location.hash = `#/product/${product.id}`;
            ProductActions.setSearchQuery('');
            const input = document.getElementById('search-input');
            if (input) input.value = '';
            container.classList.add('hidden');
        };

        container.appendChild(clone);
    });

    container.classList.remove('hidden');
};

/**
 * Highlight the active nav link based on current hash
 */
const setActiveNavLink = () => {
    const currentHash = window.location.hash || '#/home';
    document.querySelectorAll('.nav-link').forEach(link => {
        const linkPath = link.getAttribute('href');
        const isActive = currentHash === linkPath || (currentHash.startsWith(linkPath) && linkPath !== '#/home');
        link.classList.toggle('text-(--accent)', isActive);
        link.classList.toggle('after:scale-x-100', isActive);
    });
};
