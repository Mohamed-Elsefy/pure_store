import { loadTemplate } from '../../core/utils/template.loader.js';
import { ProductService } from '../../core/services/product.service.js';
import { ProductDetailsView } from './product.view.js';

export class ProductDetailsController {
    constructor(params) {
        this.productId = params.id;
    }

    async init() {
        const app = document.getElementById('app');
        const template = await loadTemplate(
            '/src/features/product/product.template.html'
        );
        app.innerHTML = template;

        if (!this.productId) return;

        const product = await ProductService.getProductById(this.productId);
        ProductDetailsView.render(product);
    }
}
