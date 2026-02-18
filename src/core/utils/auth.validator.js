// src/core/utils/auth.validator.js

export const AuthValidator = {

    // وظيفة لتشفير النصوص (كلمة المرور) باستخدام SHA-256
    async hashPassword(password) {
        const msgUint8 = new TextEncoder().encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    },

    /**
     * التحقق من البيانات
     */
    async validate(data, isRegister = false) {
        // 1. فحص الحقول المطلوبة
        for (const [key, value] of Object.entries(data)) {
            if (!value || String(value).trim() === '') {
                return `${this._formatFieldName(key)} is required.`;
            }
        }

        // 2. التحقق من الطول
        if (data.username.length < 3) return "Username must be at least 3 characters.";
        if (data.password.length < 6) return "Password must be at least 6 characters.";

        // 3. تحقق إضافي عند التسجيل فقط
        if (isRegister) {
            if (data.firstName.length < 2) return "First name is too short.";

            // التحقق من عدم تكرار اسم المستخدم محلياً
            const localUsers = JSON.parse(localStorage.getItem('purestore_local_users') || '[]');
            const userExists = localUsers.some(u => u.username.toLowerCase() === data.username.toLowerCase());

            if (userExists) return "This username is already taken.";
        }

        return null;
    },

    _formatFieldName(key) {
        return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    }
};