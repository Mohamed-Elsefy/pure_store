// src/core/store/ui.actions.js

import store from './store.js';

export const UIActions = {
    /**
     * Toggle theme between light and dark
     */
    toggleTheme: () => {
        const isDark = document.documentElement.classList.contains('dark');
        const newTheme = isDark ? 'light' : 'dark';

        // 1. Update DOM
        if (newTheme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }

        // 2. Save to LocalStorage
        localStorage.setItem('theme', newTheme);

        // 3. Update store state (if theme is stored in the store)
        store.setState({ theme: newTheme });
    },

    /**
     * Initialize theme on application startup
     */
    initTheme: () => {
        const savedTheme = localStorage.getItem('theme') || 'light';

        if (savedTheme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        store.setState({ theme: savedTheme });
    }
};