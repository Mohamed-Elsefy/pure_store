// src/core/config/routes.config.js

// Centralized route definitions for the application
// Each route is mapped to its corresponding controller
export const ROUTES = {
    '/home': {
        controller: 'HomeController',
        importPath: '/src/features/home/home.controller.js'
    },
    '/products': {
        controller: 'ProductsController',
        importPath: '/src/features/products/products.controller.js'
    },
    '/product': {
        controller: 'ProductDetailsController',
        importPath: '/src/features/product/product.controller.js'
    },
    '/login': {
        controller: 'AuthController',
        importPath: '/src/features/auth/auth.controller.js'
    },
    '/cart': {
        controller: 'CartController',
        importPath: '/src/features/cart/cart.controller.js'
    }
};
