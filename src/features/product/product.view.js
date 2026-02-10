export const ProductDetailsView = {
    render(product) {
        const container = document.getElementById('product-details');
        if (!container || !product) return;

        const baseImage = product.thumbnail || product.images?.[0] || '';

        container.innerHTML = container.innerHTML
            .replace(/{{title}}/g, product.title)
            .replace(/{{description}}/g, product.description)
            .replace(/{{price}}/g, product.price)
            .replace(/{{rating}}/g, product.rating)
            .replace(/{{stock}}/g, product.stock)
            .replace(/{{category}}/g, product.category);

        const mainImage = document.getElementById('main-image');
        mainImage.src = baseImage;
        mainImage.alt = product.title;

        this.renderThumbnails(product.images || [], baseImage);
    },

    renderThumbnails(images, baseImage) {
        const wrapper = document.getElementById('thumbnails');
        const template = document.getElementById('thumbnail-item-template');
        const mainImage = document.getElementById('main-image');

        if (!wrapper || !template || !mainImage) return;

        wrapper.innerHTML = '';

        images.forEach(img => {
            const clone = template.content.cloneNode(true);
            const imageEl = clone.querySelector('img');

            imageEl.src = img;
            imageEl.dataset.img = img;

            imageEl.addEventListener('mouseenter', () => {
                mainImage.src = img;
            });

            imageEl.addEventListener('mouseleave', () => {
                mainImage.src = baseImage;
            });

            wrapper.appendChild(clone);
        });
    }
};
