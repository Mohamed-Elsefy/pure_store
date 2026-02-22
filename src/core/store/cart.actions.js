// src/core/store/cart.ctions.js

import store from './store.js';
import { CartService } from '../services/cart.service.js';
import { Toast } from '../utils/toast.js';
import { CartPersistence } from '../utils/cart.persistence.js';

export const CartActions = {

    /**
     * Initialize cart on app startup
     * Used only for guest users (not authenticated)
     * Loads cart data from localStorage and hydrates the store
     */
    initCart: () => {
        const savedCart = localStorage.getItem('purestore_cart');

        if (savedCart) {
            // Immediately update store state with persisted cart
            store.setState({ cart: JSON.parse(savedCart) });
        }
    },

    /**
     * Fetch cart from server and enrich missing product details
     * Ensures cart items contain full product data (title, price, thumbnail)
     */
    syncCartWithServer: async (userId) => {

        if (!userId || userId === 'undefined') {
            console.warn("🛑 Sync Cart aborted: Invalid User ID.");
            return;
        }

        try {

            // search in local first
            const savedUserCart = localStorage.getItem(`cart_user_${userId}`);

            if (savedUserCart) {
                const parsedCart = JSON.parse(savedUserCart);
                store.setState({ cart: parsedCart });

                CartPersistence.save(parsedCart, userId);
                return;
            }

            // Ensure products are loaded first (needed to enrich cart items)
            const { products: allProducts } = store.getState();
            if (allProducts.length === 0) {
                await ProductActions.initializeProductsPage();
            }

            // Retrieve user's cart from server
            const serverCartData = await CartService.getCartsByUser(userId);
            const serverProducts = serverCartData.carts?.[0]?.products || [];

            if (serverProducts.length === 0) return;

            // Enrich server cart items with full product details
            const enrichedCart = serverProducts.map(serverItem => {
                const fullInfo = store.getState().products.find(
                    p => String(p.id) === String(serverItem.id)
                );

                return {
                    ...serverItem,
                    thumbnail: serverItem.thumbnail || fullInfo?.thumbnail || '',
                    title: serverItem.title || fullInfo?.title || 'Product',
                    price: serverItem.price || fullInfo?.price || 0,
                    total: (serverItem.price || fullInfo?.price || 0) * serverItem.quantity
                };
            });

            // Update store and persist locally
            store.setState({ cart: enrichedCart });
            CartPersistence.save(enrichedCart, userId);

        } catch (error) {
            console.error("❌ Sync Cart Error:", error);
        }
    },

    /**
     * Add product to cart
     * Supports both guest and authenticated users
     */
    addItem: async (product, quantity = 1) => {
        const { cart, auth } = store.getState();

        let updatedCart = [...cart];

        // Check if product already exists in cart
        const index = updatedCart.findIndex(item => item.id === product.id);

        if (index > -1) {
            // If exists, increase quantity and recalculate total
            updatedCart[index].quantity += quantity;
            updatedCart[index].total = updatedCart[index].quantity * updatedCart[index].price;
        } else {
            // If not exists, push new cart item
            updatedCart.push({
                ...product,
                quantity: quantity,
                total: product.price * quantity
            });
        }

        // Update store and persist locally
        store.setState({ cart: updatedCart });
        CartPersistence.save(updatedCart, auth.user?.id);

        // If user is authenticated, sync with server (DummyJSON simulation)
        if (auth.isAuthenticated) {
            CartService.addCart({
                userId: auth.user.id,
                products: [{ id: product.id, quantity }]
            }).catch(err => console.error("Server sync failed", err));
        }

        Toast.show(`${product.title} added to cart!`, 'success');
    },

    /**
     * Update quantity of a specific product in cart
     * If quantity becomes less than 1, item will be removed
     */
    updateQuantity: (productId, newQuantity) => {
        const { cart, auth } = store.getState();
        if (newQuantity < 1) return CartActions.removeItem(productId);

        const updatedCart = cart.map(item =>
            item.id === productId
                ? { ...item, quantity: newQuantity, total: newQuantity * item.price }
                : item
        );

        store.setState({ cart: updatedCart });
        CartPersistence.save(updatedCart, auth.user?.id);
    },

    /**
     * Remove a product from cart completely
     */
    removeItem: (productId) => {
        const { cart, auth } = store.getState();
        const updatedCart = cart.filter(item => item.id !== productId);

        store.setState({ cart: updatedCart });
        CartPersistence.save(updatedCart, auth.user?.id);
    },
    /**
     * Clear entire cart
     * Removes all items and clears localStorage
     */
    clearCart: () => {
        const { auth } = store.getState();
        store.setState({ cart: [] });

        CartPersistence.save([], auth.user?.id);
    }
};
