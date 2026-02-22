// src/core/utils/toast.js

export const Toast = {
    /**
     * Displays a toast notification message
     * @param {string} message - The message to display inside the toast
     * @param {string} type - The toast type ('success' or other for error/warning)
     */
    show(message, type = 'success') {
        // Try to find existing toast container
        let container = document.getElementById('toast-container');

        // Create container if it doesn't exist
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';

            // Position the container strategically with a very high z-index
            container.className =
                'fixed top-5 right-5 z-[9999] flex flex-col gap-3 pointer-events-none';

            document.body.appendChild(container);
        }

        // Create toast element
        const toast = document.createElement('div');

        // Use your theme variables:
        // bg-(--bg-surface), border-(--border-glass), text-(--text-primary)
        toast.className = `
            pointer-events-auto min-w-[300px] max-w-md
            bg-(--bg-surface) border border-(--border-glass) 
            backdrop-blur-md shadow-2xl rounded-2xl px-5 py-4
            flex items-center gap-4
            animate-toast-in transition-all duration-500
        `;

        // Choose icon and color based on type
        const isSuccess = type === 'success';
        const icon = isSuccess ? 'fa-check-circle' : 'fa-exclamation-circle';
        const iconColor = isSuccess ? 'text-green-500' : 'text-(--accent)';

        toast.innerHTML = `
            <div class="${iconColor} text-xl">
                <i class="fa-solid ${icon}"></i>
            </div>
            <div class="flex-1">
                <p class="text-(--text-primary) font-medium text-sm font-(family-name:--fsecond)">
                    ${message}
                </p>
            </div>
            <button class="text-(--text-secondary) hover:text-(--text-primary) transition-colors">
                <i class="fa-solid fa-xmark text-xs"></i>
            </button>
        `;

        // Add manual close event when clicking the X button
        toast.querySelector('button').onclick = () => this.removeToast(toast);

        // Append toast to container
        container.appendChild(toast);

        // Auto remove after 4 seconds
        setTimeout(() => this.removeToast(toast), 4000);
    },

    /**
     * Removes a toast element with exit animation
     * @param {HTMLElement} toast - The toast element to remove
     */
    removeToast(toast) {
        // Add exit animation classes
        toast.classList.add('opacity-0', 'translate-x-10', 'scale-95');

        // Remove element after animation duration
        setTimeout(() => toast.remove(), 500);
    }
};
