// View layer responsible for rendering product details UI
export const ProductDetailsView = {

    /**
     * Render product data inside the template
     * @param {Object} product - Product object returned from API
     */
    render(product) {

        // Select main container for product details
        const container = document.getElementById('product-details');

        // Stop execution if container or product is missing
        if (!container || !product) return;

        // Determine base image (fallback logic)
        // Priority: thumbnail -> first image -> empty string
        const baseImage = product.thumbnail || product.images?.[0] || '';

        // Replace template placeholders with actual product data
        container.innerHTML = container.innerHTML
            .replace(/{{title}}/g, product.title)
            .replace(/{{description}}/g, product.description)
            .replace(/{{price}}/g, product.price)
            .replace(/{{rating}}/g, product.rating)
            .replace(/{{stock}}/g, product.stock)
            .replace(/{{category}}/g, product.category);

        // Set main product image
        const mainImage = document.getElementById('main-image');
        mainImage.src = baseImage;
        mainImage.alt = product.title;

        // Render image thumbnails
        this.renderThumbnails(product.images || [], baseImage);
    },

    /**
     * Render product image thumbnails
     * @param {Array} images - Array of image URLs
     * @param {string} baseImage - Default main image
     */
    renderThumbnails(images, baseImage) {

        // Select thumbnails wrapper and template
        const wrapper = document.getElementById('thumbnails');
        const template = document.getElementById('thumbnail-item-template');
        const mainImage = document.getElementById('main-image');

        // Stop if required elements are missing
        if (!wrapper || !template || !mainImage) return;

        // Clear previous thumbnails
        wrapper.innerHTML = '';

        // Loop through product images
        images.forEach(img => {

            // Clone template content
            const clone = template.content.cloneNode(true);
            const imageEl = clone.querySelector('img');

            // Set thumbnail image source
            imageEl.src = img;

            // Store image URL in dataset (optional reference)
            imageEl.dataset.img = img;

            // On hover → temporarily change main image
            imageEl.addEventListener('mouseenter', () => {
                mainImage.src = img;
            });

            // On leave → revert to base image
            imageEl.addEventListener('mouseleave', () => {
                mainImage.src = baseImage;
            });

            // Append thumbnail to wrapper
            wrapper.appendChild(clone);
        });
    }
};
