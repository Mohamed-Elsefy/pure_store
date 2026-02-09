// layouts/navbar.js

import { loadTemplate } from "../core/utils/template.loader.js";

export const renderNavbar = async () => {
    const navElement = document.querySelector('nav');
    if (!navElement) return;

    const template = await loadTemplate('/src/layouts/navbar.template.html');
    navElement.innerHTML = template;

    setupNavbarInteractions();

    setActiveNavLink();
    window.addEventListener('hashchange', setActiveNavLink);
};

const setupNavbarInteractions = () => {
    const toggleBtn = document.getElementById('mobile-menu-toggle');
    const navLinks = document.getElementById('nav-links');

    if (!toggleBtn || !navLinks) return;

    toggleBtn.addEventListener('click', () => {
        navLinks.classList.toggle('opacity-100');
        navLinks.classList.toggle('translate-y-0');
        navLinks.classList.toggle('pointer-events-auto');

        navLinks.classList.toggle('opacity-0');
        navLinks.classList.toggle('-translate-y-4');
        navLinks.classList.toggle('pointer-events-none');
    });

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
};

const setActiveNavLink = () => {
    const links = document.querySelectorAll('.nav-link');
    const currentPath = window.location.hash.replace('#', '') || '/home';

    links.forEach(link => {
        const linkPath = link.getAttribute('href');

        link.classList.remove('text-(--accent)', 'after:scale-x-100');

        // إضافة active
        if (currentPath === linkPath) {
            link.classList.add('text-(--accent)', 'after:scale-x-100');
        }
    });
};
