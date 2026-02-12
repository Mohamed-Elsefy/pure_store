// src/main.js

// Import core router to handle SPA navigation
import './core/router/router.js';

// Import layout rendering functions
import { renderNavbar } from './layouts/navbar.js';
import { renderFooter } from './layouts/footer.js';

// Import store actions for UI and products
import { UIActions } from './core/store/actions.js';
import { ProductActions } from './core/store/actions.js';

/**
 * Application bootstrap function
 * Responsible for initializing global UI components and fetching initial data
 */
const bootstrap = async () => {
    // 1. Render global layout components (Navbar and Footer) concurrently
    await Promise.all([renderNavbar(), renderFooter()]);

    // 2. Initialize the theme (light/dark) from store or local storage
    UIActions.initTheme();

    // 3. Initialize product data for the products page
    // Note: Not using await here so that the UI is not blocked during fetch
    ProductActions.initializeProductsPage();
};

// Start the application
bootstrap();
