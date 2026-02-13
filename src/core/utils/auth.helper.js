/**
 * AuthHelper
 * مخصص لإدارة تخزين واسترجاع بيانات الجلسة (Tokens & User Info)
 */
const TOKEN_KEY = 'purestore_token';
const USER_KEY = 'purestore_user';

export const AuthHelper = {
    /**
     * حفظ بيانات الجلسة عند تسجيل الدخول
     */
    saveSession(token, user) {
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(USER_KEY, JSON.stringify(user));
    },

    /**
     * جلب التوكين المخزن (لاستخدامه في HttpService)
     */
    getToken() {
        return localStorage.getItem(TOKEN_KEY);
    },

    /**
     * جلب بيانات المستخدم المخزنة
     */
    getUser() {
        const user = localStorage.getItem(USER_KEY);
        return user ? JSON.parse(user) : null;
    },

    /**
     * مسح البيانات عند تسجيل الخروج
     */
    clearSession() {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
    },

    /**
     * التحقق مما إذا كان المستخدم يمتلك جلسة نشطة
     */
    isAuthenticated() {
        return !!this.getToken();
    }
};