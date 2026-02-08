// src/core/config/routes.config.js

// Centralized route definitions for the application
// Each route is mapped to its corresponding controller
export const ROUTES = {
    '/home': { controller: 'HomeController' },
    '/products': { controller: 'ProductsController' },
    '/product': { controller: 'ProductDetailsController' },
    '/login': { controller: 'AuthController' },
    '/cart': { controller: 'CartController' }
};
