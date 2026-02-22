// src/features/auth/auth.view.js

import { loadTemplate } from '../../core/utils/template.loader.js';

/*
|--------------------------------------------------------------------------
| AuthView
|--------------------------------------------------------------------------
| Responsible for rendering the login/register UI and handling UI effects.
| - Loads HTML templates dynamically
| - Handles wave canvas animation
| - Controls loading state for buttons
| - Displays error messages
| - Cleans up animations and event listeners
*/
export class AuthView {
    constructor() {
        this.appElement = document.getElementById('app');
        this.animationId = null;
        this._resizeHandler = null;
    }

    /*
    |--------------------------------------------------------------------------
    | Render Template
    |--------------------------------------------------------------------------
    | Loads the specified template (login or register)
    | Inserts it into the DOM and initializes wave animation.
    */
    async render(viewType = 'login') {
        const templatePath = `/src/features/auth/${viewType}.template.html`;
        const template = await loadTemplate(templatePath);
        this.appElement.innerHTML = template;

        this.initWaveAnimation();
    }

    /*
    |--------------------------------------------------------------------------
    | Wave Animation
    |--------------------------------------------------------------------------
    | Creates a canvas-based animated background.
    | Handles responsive resizing and multiple wave lines with varying colors, amplitude, and speed.
    */
    initWaveAnimation() {
        const canvas = document.getElementById('wavesCanvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let width, height, tick = 0;

        const lines = Array.from({ length: 30 }, (_, i) => ({
            amplitude: 50 + Math.random() * 80,
            speed: 0.015 + Math.random() * 0.34,
            offset: Math.random() * 99,
            color: i % 2 === 0 ? '#B1402A' : '#9333ea',
            opacity: 0.1 + Math.random() * 0.2
        }));

        const resize = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        };

        this._resizeHandler = resize;
        window.addEventListener('resize', this._resizeHandler);

        const draw = () => {
            tick += 0.03;
            ctx.clearRect(0, 0, width, height);

            lines.forEach((line) => {
                ctx.beginPath();
                ctx.strokeStyle = line.color;
                ctx.globalAlpha = line.opacity;
                ctx.lineWidth = 1.5;
                const diagonalLength = Math.sqrt(width * width + height * height);

                for (let d = 0; d < diagonalLength; d += 4) {
                    const t = d / diagonalLength;
                    const wave = Math.sin(t * 10 + tick * line.speed + line.offset) * line.amplitude;
                    let x = width - (t * width) + (wave * (height / diagonalLength));
                    let y = (t * height) + (wave * (width / diagonalLength));
                    if (d === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }

                ctx.stroke();
            });

            this.animationId = requestAnimationFrame(draw);
        };

        resize();
        draw();
    }

    /*
    |--------------------------------------------------------------------------
    | Button Loading State
    |--------------------------------------------------------------------------
    | Updates the submit button to show a spinner and disable interaction
    | while an async operation is in progress.
    */
    setLoading(isLoading, btnId = 'auth-btn') {
        const btn = document.getElementById(btnId);
        if (btn) {
            btn.disabled = isLoading;
            btn.innerHTML = isLoading ?
                '<i class="fas fa-spinner animate-spin"></i> Processing...' :
                btn.dataset.originalText || 'Submit';
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Display Error
    |--------------------------------------------------------------------------
    | Shows a user-friendly error message inside the UI container.
    */
    showError(message) {
        const errorContainer = document.getElementById('auth-error');
        const errorMessage = document.getElementById('error-message');
        if (errorContainer && errorMessage) {
            errorMessage.textContent = message;
            errorContainer.classList.remove('hidden');
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Cleanup
    |--------------------------------------------------------------------------
    | Cancels animation frame and removes window resize listener when the view is destroyed.
    */
    destroy() {
        if (this.animationId) cancelAnimationFrame(this.animationId);
        if (this._resizeHandler) window.removeEventListener('resize', this._resizeHandler);
    }
}