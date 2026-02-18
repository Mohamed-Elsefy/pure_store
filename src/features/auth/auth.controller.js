import { LoginView } from './login.view.js';
import { AuthActions } from '../../core/store/auth.actions.js';

// AuthController
// Handles authentication logic and connects the LoginView with AuthActions
export class AuthController {
    constructor() {
        // Initialize the login view
        this.view = new LoginView();
    }

    // Initialize controller: render view and bind form events
    async init() {
        await this.view.render();
        this._bindEvents();
    }

    // Attach form submit event listener
    _bindEvents() {
        const form = document.getElementById('login-form');
        if (form) {
            form.addEventListener('submit', (e) => this._handleSubmit(e));
        }
    }

    // Handle login form submission
    async _handleSubmit(e) {
        e.preventDefault();

        // Extract form data
        const formData = new FormData(e.target);
        const username = formData.get('username');
        const password = formData.get('password');

        // Enable loading state in UI
        this.view.setLoading(true);

        // Call login action from store
        const success = await AuthActions.login(username, password);

        if (success) {
            // Redirect user to home/products page after successful login
            window.location.hash = '#/home';
        } else {
            // Disable loading state
            this.view.setLoading(false);

            // Show error message (can later be replaced with store-driven message)
            this.view.showError('Login failed. Please check your credentials.');
        }
    }

    // Cleanup method (used when navigating away from this page in SPA)
    destroy() {
        // Stop animations and cleanup inside the view
        if (this.view && typeof this.view.destroy === 'function') {
            this.view.destroy();
        }

        // Unsubscribe from store if subscription exists
        if (this.unsubscribe) this.unsubscribe();
    }
}
