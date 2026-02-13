import { LoginView } from './login.view.js';
import { AuthActions } from '../../core/store/actions.js';

export class AuthController {
    constructor() {
        this.view = new LoginView();
    }

    async init() {
        await this.view.render();
        this._bindEvents();
    }

    _bindEvents() {
        const form = document.getElementById('login-form');
        if (form) {
            form.addEventListener('submit', (e) => this._handleSubmit(e));
        }
    }

    async _handleSubmit(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const username = formData.get('username');
        const password = formData.get('password');

        this.view.setLoading(true);

        const success = await AuthActions.login(username, password);

        if (success) {
            // توجيه المستخدم لصفحة المنتجات
            window.location.hash = '#/products';
        } else {
            this.view.setLoading(false);
            // جلب رسالة الخطأ من الـ Store
            this.view.showError('Login failed. Please check your credentials.');
        }
    }
}