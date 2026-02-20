import { ProductActions } from "../../core/store/product.actions.js";
import { CartActions } from "../../core/store/cart.actions.js";

export const HomeView = {

    // Store currently rendered products (used for cart actions)
    _currentProducts: [],

    /**
     * Initialize typewriter animation in hero section
     * @param {Array<string>} words - Words to cycle through
     */
    initTypewriter: (words) => {
        const element = document.getElementById('typewriter');
        let wordIndex = 0;
        let charIndex = 0;
        let isDeleting = false;

        function type() {
            const currentWord = words[wordIndex];

            // Typing or deleting effect
            if (isDeleting) {
                element.textContent = currentWord.substring(0, charIndex - 1);
                charIndex--;
            } else {
                element.textContent = currentWord.substring(0, charIndex + 1);
                charIndex++;
            }

            // Adjust typing speed
            let typeSpeed = isDeleting ? 50 : 150;

            // Pause at end of word before deleting
            if (!isDeleting && charIndex === currentWord.length) {
                isDeleting = true;
                typeSpeed = 2000;
            }
            // Move to next word after deleting
            else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                wordIndex = (wordIndex + 1) % words.length;
                typeSpeed = 500;
            }

            setTimeout(type, typeSpeed);
        }

        // Start animation only if element exists
        if (element) type();
    },

    /**
     * Render categories section dynamically
     * @param {Array} categories - Array of category names or objects
     */
    renderCategories: (categories) => {
        const container = document.getElementById('categories-container');
        const template = document.getElementById('category-card-template');

        if (!container || !template) return;

        container.innerHTML = '';

        categories.forEach(category => {
            // Support both string and object category formats
            const isObject = typeof category === 'object' && category !== null;
            const displayName = isObject ? category.name : category;
            const categorySlug = isObject ? category.slug : category;

            const clone = template.content.cloneNode(true);

            // Set category name (replace dashes with spaces)
            const nameElement = clone.querySelector('.category-name');
            if (nameElement) {
                nameElement.textContent = displayName.replace(/-/g, ' ');
            }

            // Add click event to filter products by category
            const card = clone.querySelector('.category-card');
            if (card) {
                card.onclick = () => {
                    ProductActions.updateFilters({ category: categorySlug });
                    window.location.hash = `#/products`;
                };
            }

            container.appendChild(clone);
        });
    },

    /**
     * Render Top Rated products section
     * @param {Array} products - Top rated products
     * @param {string} cardTemplate - HTML template string
     */
    renderTopRated: (products, cardTemplate) => {
        const container = document.getElementById('top-rated-container');
        if (!container || !cardTemplate) return;

        // Save current products for later use (e.g., Add to Cart)
        HomeView._currentProducts = products;

        // Generate HTML using template replacement
        container.innerHTML = products.map(product => {
            const image = product.thumbnail || (product.images && product.images[0]) || '';
            return cardTemplate
                .replace(/{{id}}/g, product.id)
                .replace(/{{image}}/g, image)
                .replace(/{{title}}/g, product.title)
                .replace(/{{price}}/g, product.price)
                .replace(/{{rating}}/g, product.rating || '0.0')
                .replace(/{{category}}/g, product.category || '')
                .replace(/{{brand}}/g, product.brand || 'Premium');
        }).join('');

        // Bind product events only once
        if (container.dataset.bound !== 'true') {
            HomeView.bindProductEvents(container);
            container.dataset.bound = 'true';
        }
    },

    /**
     * Bind product-related click events
     * Uses event delegation for performance
     * @param {HTMLElement} container
     */
    bindProductEvents: (container) => {
        container.addEventListener('click', async (e) => {

            // 1. Handle "Add to Cart" button click
            const addToCartBtn = e.target.closest('.add-to-cart-btn');
            if (addToCartBtn) {
                e.preventDefault();
                e.stopPropagation();

                const id = addToCartBtn.dataset.id;

                // Find product from current list
                const product = HomeView._currentProducts.find(
                    p => String(p.id) === String(id)
                );

                if (product) {
                    // Show loading spinner
                    const originalContent = addToCartBtn.innerHTML;
                    addToCartBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
                    addToCartBtn.disabled = true;

                    // Add item to cart (Store)
                    await CartActions.addItem(product, 1);

                    // Restore button after 1 second
                    setTimeout(() => {
                        addToCartBtn.innerHTML = originalContent;
                        addToCartBtn.disabled = false;
                    }, 1000);
                }

                return;
            }

            // 2. Handle full card click → navigate to product details
            const card = e.target.closest('.product-card');
            if (card) {
                const id = card.dataset.productId;
                window.location.hash = `#/product/${id}`;
            }
        });
    }
};