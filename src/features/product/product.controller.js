// src/features/product/product.controller.js

import { loadTemplate } from '../../core/utils/template.loader.js';
import { ProductService } from '../../core/services/product.service.js';
import { ProductDetailsView } from './product.view.js';

/**
 * ProductDetailsController
 * Controls the product details page flow:
 * 1. Loads the page template
 * 2. Fetches product data by ID
 * 3. Delegates rendering to the View
 */
export class ProductDetailsController {

    /**
     * Constructor receives route parameters
     * @param {Object} params - Route parameters
     * @param {string} params.id - Product ID from URL
     */
    constructor(params) {
        // Store the product ID extracted from the route
        this.productId = params.id;
    }

    /**
     * Initialize the Product Details page
     * - Render template
     * - Fetch product data
     * - Render product via view
     */
    async init() {

        // Select main app container
        const app = document.getElementById('app');

        // Load product details HTML template
        const template = await loadTemplate(
            '/src/features/product/product.template.html'
        );

        // Inject template into DOM
        app.innerHTML = template;

        // Stop execution if no product ID is provided
        if (!this.productId) return;

        // Fetch product data from service layer
        const product = await ProductService.getProductById(this.productId);

        // Delegate rendering responsibility to the View layer
        ProductDetailsView.render(product);
    }
}
