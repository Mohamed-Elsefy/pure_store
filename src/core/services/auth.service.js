import httpService from './http.service.js';

export class AuthService {
    /**
     * تسجيل الدخول
     * @param {string} username 
     * @param {string} password 
     */
    static async login(username, password) {
        return await httpService.post('/auth/login', {
            username,
            password,
            expiresInMins: 60
        });
    }

    /**
     * جلب بيانات المستخدم الحالي
     * ملاحظة: HttpService يضيف التوكين تلقائياً في الـ Headers
     */
    static async getCurrentUser() {
        // نستخدم endpoint الخاص بـ user/me أو auth/me حسب نسخة الـ API
        return await httpService.get('/auth/me');
    }

    /**
     * تحديث الجلسة (Refresh Token)
     * @param {string} refreshToken 
     */
    static async refreshToken(refreshToken) {
        return await httpService.post('/auth/refresh', {
            refreshToken
        });
    }

    /**
     * إنشاء حساب جديد (محاكاة)
     * @param {Object} userData 
     */
    static async register(userData) {
        return await httpService.post('/users/add', userData);
    }
}