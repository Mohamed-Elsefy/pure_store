// src/features/auth/auth.view.js

import { loadTemplate } from '../../core/utils/template.loader.js';

export class AuthView {
    constructor() {
        this.appElement = document.getElementById('app');
        this.animationId = null;
        this._resizeHandler = null;
    }

    async render(viewType = 'login') {
        const templatePath = `/src/features/auth/${viewType}.template.html`;
        const template = await loadTemplate(templatePath);
        this.appElement.innerHTML = template;

        this.initWaveAnimation();
    }

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

    setLoading(isLoading, btnId = 'auth-btn') {
        const btn = document.getElementById(btnId);
        if (btn) {
            btn.disabled = isLoading;
            btn.innerHTML = isLoading ?
                '<i class="fas fa-spinner animate-spin"></i> Processing...' :
                btn.dataset.originalText || 'Submit';
        }
    }

    showError(message) {
        const errorContainer = document.getElementById('auth-error');
        const errorMessage = document.getElementById('error-message');
        if (errorContainer && errorMessage) {
            errorMessage.textContent = message;
            errorContainer.classList.remove('hidden');
        }
    }

    destroy() {
        if (this.animationId) cancelAnimationFrame(this.animationId);
        if (this._resizeHandler) window.removeEventListener('resize', this._resizeHandler);
    }
}