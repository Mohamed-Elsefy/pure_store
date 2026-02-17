// src/main.js

// Import core router to handle SPA navigation
import './core/router/router.js';

// Import layout rendering functions
import { renderNavbar } from './layouts/navbar.js';
import { renderFooter } from './layouts/footer.js';

// Import store actions for UI, Auth, and products
import { UIActions, ProductActions, AuthActions, CartActions } from './core/store/actions.js';

/**
 * Application bootstrap function
 * Responsible for initializing global UI components and fetching initial data
 */
const bootstrap = async () => {

    UIActions.initTheme();
    await ProductActions.initializeProductsPage();
    CartActions.initCart();
    await AuthActions.initAuth();

    //Render global layout components (Navbar and Footer) concurrently
    await Promise.all([renderNavbar(), renderFooter()]);


};

// Start the application
bootstrap();
