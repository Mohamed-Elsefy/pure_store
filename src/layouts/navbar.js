// src/layouts/navbar.js

import { loadTemplate } from "../core/utils/template.loader.js";
import { UIActions } from "../core/store/actions.js";

// Main function to render the navbar into the DOM
export const renderNavbar = async () => {
    const navElement = document.querySelector('nav'); // Select <nav> element
    if (!navElement) return; // Exit if navbar not found

    // Load navbar HTML template
    const template = await loadTemplate('/src/layouts/navbar.template.html');
    navElement.innerHTML = template; // Insert template into DOM

    // Setup interactions (mobile toggle, theme switch)
    setupNavbarInteractions();

    // Highlight active link on page load
    setActiveNavLink();

    // Update active link when URL hash changes
    window.addEventListener('hashchange', setActiveNavLink);
};

// Setup navbar interactive features
const setupNavbarInteractions = () => {
    const toggleBtn = document.getElementById('mobile-menu-toggle'); // Mobile menu button
    const navLinks = document.getElementById('nav-links'); // Nav links container
    const themeBtn = document.getElementById('theme-toggle'); // Theme toggle button

    if (!toggleBtn || !navLinks) return; // Exit if elements missing

    // Toggle mobile menu visibility
    toggleBtn.addEventListener('click', () => {
        navLinks.classList.toggle('opacity-100');        // Show
        navLinks.classList.toggle('translate-y-0');      // Reset translate
        navLinks.classList.toggle('pointer-events-auto'); // Enable clicks

        navLinks.classList.toggle('opacity-0');          // Hide
        navLinks.classList.toggle('-translate-y-4');     // Slide up
        navLinks.classList.toggle('pointer-events-none');// Disable clicks
    });

    // Close mobile menu when clicking a link
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth < 768) {
                navLinks.classList.add('opacity-0', '-translate-y-4', 'pointer-events-none');
                navLinks.classList.remove('opacity-100', 'translate-y-0', 'pointer-events-auto');
            }
        });
    });

    // Bind theme toggle button to UIActions
    if (themeBtn) {
        themeBtn.addEventListener('click', UIActions.toggleTheme);
    }
};

// Highlight the active navigation link based on current URL
const setActiveNavLink = () => {
    const links = document.querySelectorAll('.nav-link'); // All nav links
    const currentPath = window.location.hash.replace('#', '') || '/home'; // Current hash path

    links.forEach(link => {
        const linkPath = link.getAttribute('href');

        // Remove previous active styles
        link.classList.remove('text-(--accent)', 'after:scale-x-100');

        // Apply active styles if link matches current path
        if (currentPath === linkPath) {
            link.classList.add('text-(--accent)', 'after:scale-x-100');
        }
    });
};
