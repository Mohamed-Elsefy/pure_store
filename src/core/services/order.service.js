// src/core/services/order.service.js

/**
 * OrderService
 * Responsible for managing order persistence using localStorage.
 * Stores all orders under a single key and filters them per user when needed.
 */
export class OrderService {
    static STORAGE_KEY = 'purestore_orders';

    /**
     * Creates and saves a new order:
     * - Generates a unique order ID
     * - Attaches user ID and timestamp
     * - Stores order details (items, total, address, payment)
     * - Persists updated orders array in localStorage
     */
    static saveOrder(userId, orderData) {
        const allOrders = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]');

        const newOrder = {
            id: `ORD-${Math.floor(Date.now() / 1000)}`,
            userId: userId,
            date: new Date().toISOString(),
            items: orderData.items,
            total: orderData.total,
            shippingAddress: orderData.address,
            paymentMethod: orderData.paymentMethod,
            status: 'Completed'
        };

        allOrders.push(newOrder);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(allOrders));
        return newOrder;
    }

    /**
     * Retrieves all orders that belong to a specific user.
     * Used mainly for displaying order history in the profile page.
     */
    static getUserOrders(userId) {
        const allOrders = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]');
        return allOrders.filter(order => order.userId === userId);
    }
}