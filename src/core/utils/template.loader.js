// src/core/utils/template.loader.js

/**
 * Template Loader
 * Responsible for fetching HTML templates dynamically
 * and caching them to improve performance.
 */

// Cache for storing loaded templates
const templateCache = new Map();

/**
 * Load an HTML template
 * @param {string} path - Path to the HTML template file
 * @returns {Promise<string>} HTML content as string
 */
export const loadTemplate = async (path) => {
    // 1. Check if the template is already cached
    if (templateCache.has(path)) {
        return templateCache.get(path);
    }

    try {
        const cleanPath = path.startsWith('/') ? path.substring(1) : path;
        const baseUrl = window.location.origin + window.location.pathname;
        const finalPath = new URL(cleanPath, baseUrl).href;

        // Fetch the template using the absolute path
        const response = await fetch(finalPath);

        // Throw an error if HTTP status is not OK
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        // Convert response to text (HTML)
        const html = await response.text();

        // 2. Cache the template for future use
        templateCache.set(path, html);

        return html;

    } catch (error) {
        // Log the error for debugging
        console.error(`Could not load template at ${path}:`, error);

        // Return a user-friendly error message as HTML
        return `<div class="p-4 text-red-500">Error: Template not found</div>`;
    }
};
