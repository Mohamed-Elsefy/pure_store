// src/main.js

// Import core router to handle SPA navigation
import './core/router/router.js';

// Import layout rendering functions
import { renderNavbar } from './layouts/navbar.js';
import { renderFooter } from './layouts/footer.js';

// Import store actions for UI, Auth, and products
import { UIActions, ProductActions, AuthActions } from './core/store/actions.js';

/**
 * Application bootstrap function
 * Responsible for initializing global UI components and fetching initial data
 */
const bootstrap = async () => {

    AuthActions.initAuth();
    UIActions.initTheme();

    //Render global layout components (Navbar and Footer) concurrently
    await Promise.all([renderNavbar(), renderFooter()]);

    // Initialize product data for the products page
    // Note: Not using await here so that the UI is not blocked during fetch
    ProductActions.initializeProductsPage();
};

// Start the application
bootstrap();
