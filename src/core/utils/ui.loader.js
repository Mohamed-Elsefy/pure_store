// src/core/utils/ui.loader.js

// Import Spinner component used inside the loader
import { Spinner } from './spinner.js';

// Global UI Loader utility
export const UILoader = {
    /**
     * Show the global loading overlay
     */
    show() {
        const loader = document.getElementById('global-loader');
        if (!loader) return; // Exit if loader element does not exist

        // Inject Spinner markup if it hasn't been rendered yet
        const content = loader.querySelector('#loader-content');
        if (content && !content.innerHTML.trim()) {
            content.innerHTML = Spinner();
        }

        // Make loader visible (display: flex)
        loader.classList.remove('hidden');
        loader.classList.add('flex');

        // Small timeout allows CSS transition (fade-in effect) to trigger properly
        setTimeout(() => {
            loader.classList.replace('opacity-0', 'opacity-100');
        }, 10);
    },

    /**
     * Hide the global loading overlay
     */
    hide() {
        const loader = document.getElementById('global-loader');
        if (!loader) return; // Exit if loader element does not exist

        // Start fade-out transition
        loader.classList.replace('opacity-100', 'opacity-0');

        // Wait for transition duration (300ms) before fully hiding the element
        setTimeout(() => {
            loader.classList.add('hidden');
            loader.classList.remove('flex');
        }, 300);
    }
};
