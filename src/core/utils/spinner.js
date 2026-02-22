// src/core/utils/spinner.js

/**
 * Spinner component generator
 * Returns an HTML string for a loading spinner.
 *
 * @param {string} size - Spinner size: 'small' or 'large' (default: 'large')
 * @param {boolean} isOverlay - Whether the spinner should appear as a full overlay
 * @returns {string} HTML markup for the spinner
 */
export const Spinner = (size = 'large', isOverlay = true) => {

    // Define spinner dimensions and border thickness based on size
    const dimensions =
        size === 'small'
            ? 'w-6 h-6 border-2'
            : 'w-12 h-12 border-4';

    // Show "Loading" text only for non-small spinners
    const showText = size !== 'small';

    // Choose wrapper styles:
    // - Overlay mode: covers parent with blurred background
    // - Inline mode: centered spinner with padding
    const overlayClasses = isOverlay
        ? "absolute inset-0 z-50 bg-(--bg-primary)/40 backdrop-blur-[1px]"
        : "relative py-10";

    // Return spinner HTML
    return `
        <div class="${overlayClasses} flex flex-col items-center justify-center pointer-events-none">
            
            <!-- Spinning circle -->
            <div class="${dimensions} border-(--accent)/20 border-t-(--accent) rounded-full animate-spin"></div>

            <!-- Optional loading text -->
            ${showText ? `
                <p class="mt-3 text-[10px] font-black uppercase tracking-[0.2em] text-(--accent) animate-pulse">
                    Loading
                </p>` : ''}
        </div>
    `;
};
