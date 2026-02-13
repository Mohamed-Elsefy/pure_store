import { loadTemplate } from '../../core/utils/template.loader.js';

// LoginView
// Responsible for rendering the login page UI and handling its visual behavior
export class LoginView {
    constructor() {
        // Main application container
        this.appElement = document.getElementById('app');

        // Stores the current animation frame ID (used to stop animation later)
        this.animationId = null;

        // Reference to the resize handler (so it can be removed properly on destroy)
        this._resizeHandler = null;
    }

    // Render login template and initialize background animation
    async render() {
        const template = await loadTemplate('/src/features/auth/login.template.html');
        this.appElement.innerHTML = template;

        this.initWaveAnimation();
    }

    // Initialize animated diagonal wave background using Canvas API
    initWaveAnimation() {
        const canvas = document.getElementById('wavesCanvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');

        let width, height, tick = 0;

        // Create multiple wave lines with randomized properties
        const lines = Array.from({ length: 25 }, (_, i) => ({
            amplitude: 50 + Math.random() * 80,   // Wave height
            speed: 0.015 + Math.random() * 0.2,   // Wave movement speed
            offset: Math.random() * 100,          // Phase offset
            color: i % 2 === 0 ? '#B1402A' : '#9333ea', // Alternate colors
            opacity: 0.1 + Math.random() * 0.2    // Transparency
        }));

        // Adjust canvas size to match window size
        const resize = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        };

        // Store resize handler reference for later removal
        this._resizeHandler = resize;
        window.addEventListener('resize', this._resizeHandler);

        // Main animation loop
        const draw = () => {
            tick += 0.03;

            // Clear previous frame
            ctx.clearRect(0, 0, width, height);

            lines.forEach((line) => {
                ctx.beginPath();
                ctx.strokeStyle = line.color;
                ctx.globalAlpha = line.opacity;
                ctx.lineWidth = 1.5;

                // Calculate screen diagonal length
                const diagonalLength = Math.sqrt(width * width + height * height);

                // Draw points along the diagonal
                for (let d = 0; d < diagonalLength; d += 4) {
                    // Normalize progress (0 → 1)
                    const t = d / diagonalLength;

                    // Generate wave using sine function
                    const wave = Math.sin(t * 10 + tick * line.speed + line.offset) * line.amplitude;

                    // Base straight diagonal line (top-right → bottom-left)
                    let x = width - (t * width);
                    let y = t * height;

                    // Apply perpendicular wave offset
                    x += wave * (height / diagonalLength);
                    y += wave * (width / diagonalLength);

                    // Move or draw line
                    if (d === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }

                ctx.stroke();
            });

            // Request next animation frame
            this.animationId = requestAnimationFrame(draw);
        };

        resize();
        draw();
    }

    // Stop animation and remove event listeners (important for SPA navigation)
    destroy() {
        // Cancel animation frame if running
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            console.log("Animation Stopped"); // For development debugging
        }

        // Remove resize event listener
        if (this._resizeHandler) {
            window.removeEventListener('resize', this._resizeHandler);
        }
    }

    // Display authentication error message
    showError(message) {
        const errorContainer = document.getElementById('auth-error');
        const errorMessage = document.getElementById('error-message');

        if (errorContainer && errorMessage) {
            errorMessage.textContent = message;
            errorContainer.classList.remove('hidden');
        }
    }

    // Toggle loading state of login button
    setLoading(isLoading) {
        const btn = document.getElementById('login-btn');
        const btnText = document.getElementById('btn-text');

        if (btn && btnText) {
            btn.disabled = isLoading;
            btnText.textContent = isLoading ? 'Authenticating...' : 'Sign in';
        }
    }
}
