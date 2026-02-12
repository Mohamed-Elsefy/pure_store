// src/features/product/product.view.js
import { UILoader } from "../../core/utils/ui.loader.js";

export const ProductDetailsView = {
    /**
     * Render the product details in the DOM
     * @param {Object} product - Product object containing info and images
     */
    render(product) {
        const container = document.getElementById('product-details');
        const loadingEl = document.getElementById('loading-state');

        if (!container || !product) return;

        // 1. Manage visual state: hide loader and show content
        if (loadingEl) {
            loadingEl.classList.add('hidden');
            loadingEl.classList.remove('flex');
        }
        container.classList.remove('hidden');
        container.classList.add('grid');

        // 2. Update text content safely
        const safeSetText = (selector, text) => {
            const el = container.querySelector(selector);
            if (el) el.textContent = text;
        };

        safeSetText('[data-title]', product.title);
        safeSetText('[data-category]', product.category);
        safeSetText('[data-description]', product.description);
        safeSetText('[data-price]', `$${product.price}`);
        safeSetText('[data-rating]', product.rating);
        safeSetText('[data-stock]', `${product.stock} in stock`);

        // 3. Update main product image
        const mainImage = document.getElementById('main-image');
        if (mainImage) {
            mainImage.src = product.thumbnail || (product.images && product.images[0]) || '';
            mainImage.alt = product.title;
        }

        // 4. Render product thumbnails
        this.renderThumbnails(product.images || [], mainImage?.src);

        UILoader.hide();
    },

    /** 
     * Render thumbnail images and handle hover/click interactions
     * @param {Array} images - Array of image URLs
     * @param {string} initialBaseImage - The initially active main image
     */
    renderThumbnails(images, initialBaseImage) {
        const wrapper = document.getElementById('thumbnails');
        const template = document.getElementById('thumbnail-item-template');
        const mainImage = document.getElementById('main-image');

        if (!wrapper || !template || !mainImage) return;

        wrapper.innerHTML = '';
        let currentActiveImage = initialBaseImage;

        // Clone template for each image
        images.forEach((img) => {
            const clone = template.content.cloneNode(true);
            const imageEl = clone.querySelector('img');
            imageEl.src = img;

            // Highlight the active image
            if (img === currentActiveImage) {
                imageEl.classList.add('border-(--accent)');
            }

            // Hover to temporarily change main image
            imageEl.addEventListener('mouseenter', () => {
                mainImage.src = img;
            });

            // Revert main image on mouse leave
            imageEl.addEventListener('mouseleave', () => {
                mainImage.src = currentActiveImage;
            });

            // Click to select as main image
            imageEl.addEventListener('click', () => {
                currentActiveImage = img;
                mainImage.src = img;
                // Remove highlight from all thumbnails and highlight the selected one
                wrapper.querySelectorAll('img').forEach(el => el.classList.remove('border-(--accent)'));
                imageEl.classList.add('border-(--accent)');
            });

            wrapper.appendChild(clone);
        });
    }
};
