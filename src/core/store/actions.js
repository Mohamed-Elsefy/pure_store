// src/core/store/actions.js

import store from './store.js';
import { ProductService } from '../services/product.service.js';
import { CategoryService } from '../services/category.service.js';
import { AuthHelper } from '../utils/auth.helper.js';
import { AuthService } from '../services/auth.service.js';
import { CartService } from '../services/cart.service.js';
import { Toast } from '../utils/toast.js';

export const AuthActions = {

    /**
     * Authenticate user and update application state.
     * 
     * Steps:
     * 1. Set loading state.
     * 2. Call AuthService.login().
     * 3. Save session (token + user data).
     * 4. Update auth state in store.
     * 5. (Optional) Merge guest cart with user cart.
     * 
     * @param {string} username
     * @param {string} password
     * @returns {Promise<boolean>} True if login succeeds, otherwise false
     */
    login: async (username, password) => {

        // Set loading state before API call
        store.setState({
            auth: {
                ...store.getState().auth,
                loading: true,
                error: null
            }
        });

        try {
            const data = await AuthService.login(username, password);

            // Save session to localStorage
            AuthHelper.saveSession(data.accessToken, data);

            // Update authentication state in store

            const savedUserCart = localStorage.getItem(`cart_user_${data.id}`);

            if (savedUserCart) {
                const parsedCart = JSON.parse(savedUserCart);
                store.setState({ cart: parsedCart });
                persistLocalCart(parsedCart);
            } else {
                await CartActions.mergeGuestCart(data.id);
            }

            store.setState({
                auth: { user: data, token: data.accessToken, isAuthenticated: true, loading: false }
            });

            Toast.show(`Wellcom ${data.username}`, 'success');
            return true;

        } catch (error) {

            // Handle login failure
            store.setState({
                auth: {
                    ...store.getState().auth,
                    loading: false,
                    error: error.message
                }
            });

            Toast.show('Please Try Again !', 'error');

            return false;
        }
    },


    /**
     * Logout user and clear authentication state.
     * 
     * - Clears stored session.
     * - Resets auth state.
     * - Clears cart in store.
     * - Redirects to login page.
     */
    logout: () => {
        const { auth, cart } = store.getState();

        // save cart copy to local
        if (auth.user) {
            localStorage.setItem(`cart_user_${auth.user.id}`, JSON.stringify(cart));
        }

        AuthHelper.clearSession();
        localStorage.removeItem('purestore_cart');

        store.setState({
            auth: { user: null, token: null, isAuthenticated: false, loading: false, error: null },
            cart: [],
        });

        window.location.hash = '#/login';
    },


    /**
     * Initialize authentication state on app startup.
     * 
     * - Checks if token and user data exist in localStorage.
     * - Restores authentication state if session is valid.
     */
    initAuth: async () => {
        const token = AuthHelper.getToken();
        const user = AuthHelper.getUser();

        if (token && user) {
            store.setState({
                auth: {
                    user: user,
                    token: token,
                    isAuthenticated: true,
                    loading: false,
                    error: null
                }
            });

            const localCart = JSON.parse(localStorage.getItem('purestore_cart') || '[]');
            if (localCart.length === 0) {
                await CartActions.syncCartWithServer(user.id);
            } else {
                store.setState({ cart: localCart });
            }
        }
    }
};


export const ProductActions = {
    /**
     * Fetch products and categories when the page is loaded for the first time
     */
    initializeProductsPage: async () => {
        const { products, loading } = store.getState();
        if (products.length > 0 || loading) return; // Do nothing if data already exists or is loading

        store.setState({ loading: true });

        try {
            const [productsRes, categories] = await Promise.all([
                ProductService.getAllProducts({ page: 1, limit: 0 }), // Fetch all products
                CategoryService.getAllCategories(),
            ]);

            store.setState({
                products: productsRes.products,
                categories: categories,
                loading: false
            });
        } catch (error) {
            console.error("Store Init Error:", error);
            store.setState({ loading: false });
        }
    },

    /**
     * Update filters and reset pagination to the first page
     */
    updateFilters: (newFilters) => {
        const { filters, pagination } = store.getState();
        store.setState({
            filters: { ...filters, ...newFilters },
            pagination: { ...pagination, currentPage: 1 } // Reset page when filters change
        });
    },

    /**
     * Set search query and reset pagination to the first page
     */
    setSearchQuery: (query) => {
        const { pagination } = store.getState();
        store.setState({
            searchQuery: query,
            pagination: { ...pagination, currentPage: 1 }
        });
    },

    /**
     * Update the current page in pagination
     */
    setCurrentPage: (page) => {
        const { pagination } = store.getState();
        store.setState({
            pagination: { ...pagination, currentPage: page }
        });
    },

    /**
     * Reset all filters, search query, and pagination to default values
     */
    resetFilters: () => {
        store.setState({
            searchQuery: '',
            filters: {
                category: null,
                minPrice: 0,
                maxPrice: Infinity,
                sortBy: ''
            },
            pagination: {
                currentPage: 1,
                itemsPerPage: 12
            }
        });
    }
};

export const UIActions = {
    /**
     * Toggle theme between light and dark
     */
    toggleTheme: () => {
        const isDark = document.documentElement.classList.contains('dark');
        const newTheme = isDark ? 'light' : 'dark';

        // 1. Update DOM
        if (newTheme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }

        // 2. Save to LocalStorage
        localStorage.setItem('theme', newTheme);

        // 3. Update store state (if theme is stored in the store)
        store.setState({ theme: newTheme });
    },

    /**
     * Initialize theme on application startup
     */
    initTheme: () => {
        const savedTheme = localStorage.getItem('theme') || 'light';

        if (savedTheme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        store.setState({ theme: savedTheme });
    }
};

// Helper function to persist cart data in localStorage
const persistLocalCart = (cart) => {
    // Save the current cart state as a JSON string
    localStorage.setItem('purestore_cart', JSON.stringify(cart));
};
const persistCart = (cart, userId = null) => {
    // Save the current cart state as a JSON string
    localStorage.setItem('purestore_cart', JSON.stringify(cart));

    // save a copy of cart
    if (userId) {
        localStorage.setItem(`cart_user_${userId}`, JSON.stringify(cart));
    }
};

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
        try {

            // search in local first
            const savedUserCart = localStorage.getItem(`cart_user_${userId}`);

            if (savedUserCart) {
                const parsedCart = JSON.parse(savedUserCart);
                store.setState({ cart: parsedCart });
                persistCart(parsedCart);
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
            persistCart(enrichedCart, userId);

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
        persistCart(updatedCart, auth.user?.id);

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
     * Merge guest cart with server cart after login
     * Prevents duplication and merges quantities
     */
    mergeGuestCart: async (userId) => {
        const { cart: guestCart } = store.getState();

        // get user cart
        const savedUserCart = JSON.parse(localStorage.getItem(`cart_user_${userId}`) || '[]');

        const mergedMap = new Map();

        // set user products that local
        savedUserCart.forEach(p => mergedMap.set(p.id, { ...p }));

        // merge
        guestCart.forEach(p => {
            if (mergedMap.has(p.id)) {
                const existing = mergedMap.get(p.id);
                mergedMap.set(p.id, { ...existing, quantity: existing.quantity + p.quantity });
            } else {
                mergedMap.set(p.id, { ...p });
            }
        });

        const finalCart = Array.from(mergedMap.values());

        store.setState({ cart: finalCart });
        persistCart(finalCart, userId);
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
        persistCart(updatedCart, auth.user?.id);
    },

    /**
     * Remove a product from cart completely
     */
    removeItem: (productId) => {
        const { cart, auth } = store.getState();
        const updatedCart = cart.filter(item => item.id !== productId);

        store.setState({ cart: updatedCart });
        persistCart(updatedCart, auth.user?.id);
    },
    /**
     * Clear entire cart
     * Removes all items and clears localStorage
     */
    clearCart: () => {
        const { auth } = store.getState();
        store.setState({ cart: [] });
        localStorage.removeItem('purestore_cart');
    }
};
