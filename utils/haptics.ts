/**
 * Haptic Feedback Utility
 * Provides tactile feedback for user interactions using the Web Vibration API.
 * Safely checks for browser support.
 */

export const haptics = {
    // Light tap (for buttons, toggles)
    light: () => {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate(10);
        }
    },

    // Medium impact (for success actions, modal opens)
    medium: () => {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate(20);
        }
    },

    // Heavy impact (for errors, critical alerts)
    heavy: () => {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate([30, 50, 30]);
        }
    },

    // Success pattern
    success: () => {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate([10, 30, 10]);
        }
    },

    // Error pattern
    error: () => {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate([50, 50, 50, 50, 50]);
        }
    }
};
