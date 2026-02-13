import { loadTemplate } from '../../core/utils/template.loader.js';

export class LoginView {
    constructor() {
        this.appElement = document.getElementById('app');
    }

    async render() {
        const template = await loadTemplate('/src/features/auth/login.template.html');
        this.appElement.innerHTML = template;

        this.initWaveAnimation();
    }

    initWaveAnimation() {
        const canvas = document.getElementById('wavesCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        let width, height, tick = 0;

        // زيادة عدد الخيوط (12 خيطاً) وتخصيص حركتها لتكون أسرع وأكثر عشوائية
        const lines = Array.from({ length: 20 }, (_, i) => ({
            amplitude: 40 + Math.random() * 100, // مدى تموج مختلف
            speed: 0.02 + Math.random() * 0.03,  // زيادة السرعة التلقائية
            offset: Math.random() * 100,         // إزاحة لبدء الحركة من نقطة مختلفة
            color: i % 2 === 0 ? '#B1402A' : '#9333ea',
            opacity: 0.1 + Math.random() * 0.2    // شفافية متفاوتة
        }));

        const resize = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        };

        const draw = () => {
            tick += 0.03; // تسريع الحركة الكلية
            ctx.clearRect(0, 0, width, height); // إزالة أي خلفية سابقة

            lines.forEach((line) => {
                ctx.beginPath();
                ctx.strokeStyle = line.color;
                ctx.globalAlpha = line.opacity;
                ctx.lineWidth = 1.5;

                for (let x = 0; x < width; x += 3) {
                    // معادلة مركبة لزيادة تعقيد وسرعة الخيوط
                    const noise = Math.sin(x * 0.001 + tick * line.speed + line.offset);
                    const wave = Math.sin(x * 0.004 - tick * line.speed * 2) * line.amplitude;
                    const y = (height / 2) + (wave * noise);

                    if (x === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.stroke();
            });
            this.animationId = requestAnimationFrame(draw);
        };

        window.addEventListener('resize', resize);
        resize();
        draw();
    }

    // دالة اختيارية لإيقاف الانيميشن عند الانتقال لصفحة أخرى لتوفير الأداء
    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
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

    setLoading(isLoading) {
        const btn = document.getElementById('login-btn');
        const btnText = document.getElementById('btn-text');
        if (btn && btnText) {
            btn.disabled = isLoading;
            btnText.textContent = isLoading ? 'Authenticating...' : 'Sign in';
        }
    }
}