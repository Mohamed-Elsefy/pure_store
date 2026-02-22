// src/features/profile/profile.controller.js
import store from '../../core/store/store.js';
import { loadTemplate } from '../../core/utils/template.loader.js';
import { OrderService } from '../../core/services/order.service.js';
import { AuthActions } from '../../core/store/auth.actions.js';
import { ProfileView } from './profile.view.js';

export class ProfileController {

    /**
     * Initializes the controller:
     * - Creates the ProfileView instance.
     * - Injects required handlers (logout, update, delete).
     * - Prepares store subscription reference for later cleanup.
     */
    constructor() {
        this.view = new ProfileView({
            onLogout: () => this._handleLogout(),
            onUpdate: (data) => this._handleUpdateProfile(data),
            onDelete: () => this._handleDeleteAccount()
        });

        this.unsubscribe = null;
    }

    /**
     * Initializes the profile page.
     *
     * Flow:
     * 1. Verifies authentication (redirects to login if not authenticated).
     * 2. Loads and injects the HTML template.
     * 3. Subscribes to store updates to re-render profile data automatically.
     * 4. Performs initial render with current user and orders.
     * 5. Scrolls to top of the page.
     */
    async init() {
        const app = document.getElementById('app');
        const state = store.getState();

        if (!state.auth.isAuthenticated) {
            window.location.hash = '#/login';
            return;
        }

        const template = await loadTemplate('/src/features/profile/profile.template.html');
        app.innerHTML = template;

        this.unsubscribe = store.subscribe((newState) => {
            const orders = OrderService.getUserOrders(newState.auth.user?.id);
            this.view.render(newState.auth.user, orders);
        });

        const orders = OrderService.getUserOrders(state.auth.user.id);
        this.view.render(state.auth.user, orders);

        window.scrollTo(0, 0);
    }

    /**
     * Handles profile update requests.
     * Delegates the update logic to AuthActions.
     */
    async _handleUpdateProfile(userData) {
        return await AuthActions.updateProfile(userData);
    }

    /**
     * Handles logout action.
     * Shows confirmation dialog before logging the user out.
     */
    _handleLogout() {
        if (confirm('Are you sure you want to logout?')) {
            AuthActions.logout();
        }
    }

    /**
     * Handles account deletion process.
     *
     * Flow:
     * - Shows initial confirmation warning.
     * - Displays an additional irreversible action confirmation.
     * - Calls AuthActions.deleteAccount if confirmed.
     */
    async _handleDeleteAccount() {
        const confirmed = confirm("⚠️ Are you sure? This will permanently delete your account and order history.");
        if (confirmed) {
            const finalCheck = confirm("This action cannot be undone. Proceed?");
            if (finalCheck) {
                await AuthActions.deleteAccount();
            }
        }
    }

    /**
     * Cleans up subscriptions when leaving the page
     * to prevent memory leaks or unnecessary re-renders.
     */
    destroy() {
        if (this.unsubscribe) {
            this.unsubscribe();
        }
    }
}