// src/layouts/navbar.js

// Utility to load external HTML templates
import { loadTemplate } from "../core/utils/template.loader.js";

// UI-related actions (theme toggle, etc.)
import { UIActions } from "../core/store/actions.js";

// Product-related actions (search)
import { ProductActions } from '../core/store/actions.js';

// Global application store (state management)
import store from '../core/store/store.js';

/**
 * Render the navbar into the DOM
 * - Loads the navbar HTML template
 * - Injects it into the <nav> element
 * - Initializes all navbar interactions
 */
export const renderNavbar = async () => {
    const navElement = document.querySelector('nav'); // Select the <nav> element
    if (!navElement) return; // Exit if navbar element does not exist

    // Load navbar HTML template from file
    const template = await loadTemplate('/src/layouts/navbar.template.html');

    // Insert the loaded template into the DOM
    navElement.innerHTML = template;

    // Initialize navbar interactive behavior
    setupNavbarInteractions();

    // Highlight the active navigation link on initial load
    setActiveNavLink();

    // Update active link whenever the URL hash changes
    window.addEventListener('hashchange', setActiveNavLink);
};

/**
 * Initialize all navbar interactions:
 * - Mobile menu toggle
 * - Theme toggle
 * - Search behavior and results
 */
const setupNavbarInteractions = () => {
    const toggleBtn = document.getElementById('mobile-menu-toggle'); // Mobile menu button
    const navLinks = document.getElementById('nav-links');           // Nav links container
    const themeBtn = document.getElementById('theme-toggle');        // Theme toggle button

    const searchInput = document.getElementById('search-input');     // Search input field
    const resultsContainer = document.getElementById('search-results'); // Search results list
    const template = document.getElementById('search-result-template'); // Search result template

    /**
     * Close search results when clicking outside
     */
    document.addEventListener('pointerdown', (e) => {
        const isInsideSearch =
            searchInput.contains(e.target) ||
            resultsContainer.contains(e.target);

        if (!isInsideSearch) {
            // Small delay to avoid abrupt closing
            setTimeout(() => {
                resultsContainer.classList.add('hidden');
            }, 300);
        }
    });

    /**
     * Search logic and store subscription
     */
    if (searchInput && resultsContainer) {

        // Subscribe to store updates
        store.subscribe((state) => {
            const { searchResults } = state;

            if (!resultsContainer || !template) return;

            // Clear previous results
            resultsContainer.innerHTML = '';

            // Hide results if no matches found
            if (!searchResults.length) {
                resultsContainer.classList.add('hidden');
                return;
            }

            // Render only the first 4 search results
            searchResults.slice(0, 4).forEach(product => {
                const clone = template.content.cloneNode(true);
                const li = clone.querySelector('li');
                const title = clone.querySelector('.product-title');

                // Attach product ID to list item
                li.dataset.id = product.id;
                title.textContent = product.title;

                // Navigate to product details on click
                li.addEventListener('click', () => {
                    window.location.hash = `/product/${product.id}`;
                    document.getElementById('search-input').value = '';
                    resultsContainer.classList.add('hidden');
                });

                resultsContainer.appendChild(clone);
            });

            // Show results container
            resultsContainer.classList.remove('hidden');
        });

        /**
         * Dispatch search query on input
         */
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            ProductActions.setSearchQuery(query);
        });

        /**
         * Navigate to first result when pressing Enter
         */
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const firstResult = resultsContainer.querySelector('li');
                if (firstResult) {
                    const id = firstResult.dataset.id;
                    window.location.hash = `/product/${id}`;
                    searchInput.value = '';
                    resultsContainer.classList.add('hidden');
                }
            }
        });

        /**
         * Navigate when clicking a search result
         */
        resultsContainer.addEventListener('click', (e) => {
            const li = e.target.closest('li');
            if (!li) return;

            const id = li.dataset.id;
            window.location.hash = `/product/${id}`;
            searchInput.value = '';
            resultsContainer.classList.add('hidden');
        });
    }

    // Exit if mobile toggle or nav links are missing
    if (!toggleBtn || !navLinks) return;

    /**
     * Toggle mobile navigation menu visibility
     */
    toggleBtn.addEventListener('click', () => {
        navLinks.classList.toggle('opacity-100');         // Show
        navLinks.classList.toggle('translate-y-0');       // Reset translate
        navLinks.classList.toggle('pointer-events-auto'); // Enable clicks

        navLinks.classList.toggle('opacity-0');           // Hide
        navLinks.classList.toggle('-translate-y-4');      // Slide up
        navLinks.classList.toggle('pointer-events-none'); // Disable clicks
    });

    /**
     * Close mobile menu when a link is clicked
     */
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth < 768) {
                navLinks.classList.add(
                    'opacity-0',
                    '-translate-y-4',
                    'pointer-events-none'
                );
                navLinks.classList.remove(
                    'opacity-100',
                    'translate-y-0',
                    'pointer-events-auto'
                );
            }
        });
    });

    /**
     * Bind theme toggle button to UI action
     */
    if (themeBtn) {
        themeBtn.addEventListener('click', UIActions.toggleTheme);
    }
};

/**
 * Highlight the active navigation link
 * based on the current URL hash
 */
const setActiveNavLink = () => {
    const links = document.querySelectorAll('.nav-link'); // All navigation links
    const currentPath =
        window.location.hash.replace('#', '') || '/home'; // Current route

    links.forEach(link => {
        const linkPath = link.getAttribute('href');

        // Remove active styles
        link.classList.remove('text-(--accent)', 'after:scale-x-100');

        // Apply active styles if paths match
        if (currentPath === linkPath) {
            link.classList.add('text-(--accent)', 'after:scale-x-100');
        }
    });
};
