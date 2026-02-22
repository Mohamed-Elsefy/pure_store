// src/features/auth/auth.controller.js

import { AuthView } from './auth.view.js';
import { AuthActions } from '../../core/store/auth.actions.js';
import { AuthValidator } from '../../core/utils/auth.validator.js';

/*
|--------------------------------------------------------------------------
| AuthController
|--------------------------------------------------------------------------
| Acts as the mediator between the View and the Store.
| - Determines current mode (login/register)
| - Handles form submission
| - Performs validation
| - Triggers authentication actions
| - Controls navigation flow after success
*/
export class AuthController {
    constructor() {
        // Initialize view and detect current mode based on URL hash
        this.view = new AuthView();
        this.isRegisterMode = window.location.hash.includes('register');
    }

    /*
    |--------------------------------------------------------------------------
    | Initialization
    |--------------------------------------------------------------------------
    | Renders the correct form (login or register)
    | Then binds required DOM events.
    */
    async init() {
        const mode = this.isRegisterMode ? 'register' : 'login';
        await this.view.render(mode);
        this._bindEvents();
    }

    /*
    |--------------------------------------------------------------------------
    | Event Binding
    |--------------------------------------------------------------------------
    | - Listens for form submission
    | - Clears error message when user starts typing
    */
    _bindEvents() {
        const formId = this.isRegisterMode ? 'register-form' : 'login-form';
        const form = document.getElementById(formId);

        if (form) {
            form.addEventListener('submit', (e) => this._handleSubmit(e));

            form.querySelectorAll('input').forEach(input => {
                input.addEventListener('input', () => {
                    document.getElementById('auth-error')?.classList.add('hidden');
                });
            });
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Form Submission Handler
    |--------------------------------------------------------------------------
    | 1. Prevent default submission
    | 2. Collect form data
    | 3. Validate input (client-side)
    | 4. Trigger authentication action
    | 5. Redirect on success
    | 6. Reset loading state on failure
    */
    async _handleSubmit(e) {
        e.preventDefault();

        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        // Client-side validation
        const errorMessage = await AuthValidator.validate(data, this.isRegisterMode);
        if (errorMessage) {
            this.view.showError(errorMessage);
            return;
        }

        // Enable loading state
        const btnId = this.isRegisterMode ? 'register-btn' : 'login-btn';
        this.view.setLoading(true, btnId);

        let success = false;

        try {
            if (this.isRegisterMode) {
                success = await AuthActions.register(data);
                if (success) window.location.hash = '#/login';
            } else {
                success = await AuthActions.login(data.username, data.password);
                if (success) window.location.hash = '#/home';
            }
        } catch (err) {
            success = false;
        }

        if (!success) {
            this.view.setLoading(false, btnId);
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Cleanup
    |--------------------------------------------------------------------------
    | Called when the controller is destroyed.
    | Delegates cleanup logic to the view.
    */
    destroy() {
        this.view.destroy();
    }
}