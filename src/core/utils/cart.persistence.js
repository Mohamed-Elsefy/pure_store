// src/core/utils/cart.persistence.js

export const CartPersistence = {
    save: (cart, userId = null) => {
        if (userId && userId !== 'undefined') {
            // حفظ في السلة الخاصة بالمستخدم (ستبقى موجودة دائماً لهذا الـ ID)
            localStorage.setItem(`cart_user_${userId}`, JSON.stringify(cart));

            // تحديث السلة "النشطة" للعرض الفوري
            localStorage.setItem('purestore_cart', JSON.stringify(cart));
        } else {
            // مستخدم ضيف
            localStorage.setItem('purestore_cart', JSON.stringify(cart));
        }
    },

    get: (userId = null) => {
        if (userId && userId !== 'undefined') {
            const data = localStorage.getItem(`cart_user_${userId}`);
            return data ? JSON.parse(data) : [];
        }
        const guestData = localStorage.getItem('purestore_cart');
        return guestData ? JSON.parse(guestData) : [];
    }
};