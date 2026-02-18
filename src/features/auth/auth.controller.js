// src/features/auth/auth.controller.js
import { AuthView } from './auth.view.js';
import { AuthActions } from '../../core/store/auth.actions.js';
import { AuthValidator } from '../../core/utils/auth.validator.js';

export class AuthController {
    constructor() {
        this.view = new AuthView();
        // نحدد النوع بناءً على الـ Hash الحالي
        this.isRegisterMode = window.location.hash.includes('register');
    }

    async init() {
        const mode = this.isRegisterMode ? 'register' : 'login';
        await this.view.render(mode);
        this._bindEvents();
    }

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

    async _handleSubmit(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        // 1. التحقق من البيانات محلياً (Client-side Validation)
        const errorMessage = await AuthValidator.validate(data, this.isRegisterMode);
        
        if (errorMessage) {
            this.view.showError(errorMessage);
            return; // توقف هنا ولا ترسل الطلب للسيرفر
        }

        // 2. تفعيل حالة التحميل
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

    destroy() {
        this.view.destroy();
    }
}