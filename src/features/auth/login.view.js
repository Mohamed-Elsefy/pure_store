import { loadTemplate } from '../../core/utils/template.loader.js';

export class LoginView {
    constructor() {
        this.appElement = document.getElementById('app');
    }

    async render() {
        const html = await loadTemplate('/src/features/auth/login.template.html');
        this.appElement.innerHTML = html;
    }

    showError(message) {
        const errorContainer = document.getElementById('auth-error');
        const errorMessage = document.getElementById('error-message');
        if (errorContainer && errorMessage) {
            errorMessage.textContent = message;
            errorContainer.classList.remove('hidden');
        }
    }

    setLoading(isLoading) {
        const btn = document.getElementById('login-btn');
        const btnText = document.getElementById('btn-text');
        if (btn && btnText) {
            btn.disabled = isLoading;
            btnText.textContent = isLoading ? 'Authenticating...' : 'Sign in';
        }
    }
}