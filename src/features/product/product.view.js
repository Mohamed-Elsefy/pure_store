export const ProductDetailsView = {
    render(product) {
        document.getElementById('product-details').innerHTML = `
            <h1 class="text-3xl font-bold">${product.title}</h1>
            <p>${product.description}</p>
            <strong>$${product.price}</strong>
        `;
    }
};
