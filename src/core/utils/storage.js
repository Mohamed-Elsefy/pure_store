// src/core/utils/storage.js

export const Storage = {
    // Retrieve a value from localStorage by key
    get: (key) => {
        try {
            return localStorage.getItem(key); // Returns string or null if key doesn't exist
        } catch (error) {
            console.error('Storage get error:', error); // Log any errors (e.g., storage disabled)
            return null; // Return null if unable to access localStorage
        }
    },

    // Save a value to localStorage under the specified key
    set: (key, value) => {
        try {
            localStorage.setItem(key, value); // Store value as string
        } catch (error) {
            console.error('Storage set error:', error); // Log errors (e.g., quota exceeded)
        }
    },

    // Remove an item from localStorage by key
    remove: (key) => {
        try {
            localStorage.removeItem(key); // Deletes the key-value pair
        } catch (error) {
            console.error('Storage remove error:', error); // Log errors (e.g., storage disabled)
        }
    }
};
