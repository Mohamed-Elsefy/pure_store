// src/main.js

import './core/router/router.js';
import { renderNavbar } from './layouts/navbar.js';
import { renderFooter } from './layouts/footer.js';
import { UIActions } from './core/store/actions.js';


// Application bootstrap function
// Responsible for initializing global UI components
const bootstrap = async () => {
    await renderNavbar();
    await renderFooter();
    UIActions.initTheme();
};
bootstrap();
