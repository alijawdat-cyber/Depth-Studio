/**
 * 🔐 متجر المصادقة - Depth Studio
 * ===============================
 * 
 * إدارة حالة المصادقة باستخدام Zustand:
 * - حالة المستخدم والتوكن
 * - أفعال تسجيل الدخول/الخروج
 * - حفظ واستعادة من localStorage
 * - تحديث تلقائي للـ ApiClient
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import { authService } from '../services/auth.service';
import { apiClient } from '../services/api/api-client';

import { 
  User, 
  EmailLoginData, 
  PhoneLoginData, 
  GoogleLoginData,
  OTPVerifyRequest 
} from '@depth-studio/types';

// ======================================
// 🏗️ أنواع متجر المصادقة
// ======================================

interface AuthState {
  // حالة البيانات
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // حالة العمليات
  needs_role_selection: boolean;
  
  // الأفعال - تسجيل الدخول
  signInWithEmail: (credentials: EmailLoginData) => Promise<void>;
  signInWithPhone: (phoneData: PhoneLoginData) => Promise<{ success: boolean; message: string }>;
  signInWithGoogle: (googleData: GoogleLoginData) => Promise<void>;
  verifyOTP: (verifyData: OTPVerifyRequest) => Promise<void>;
  
  // الأفعال - عامة
  signOut: () => Promise<void>;
  getCurrentUser: () => Promise<void>;
  clearError: () => void;
  
  // الأفعال الداخلية
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

// ======================================
// 🏪 متجر المصادقة الرئيسي
// ======================================

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // ======================================
      // 📊 الحالة الأولية
      // ======================================
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      needs_role_selection: false,

      // ======================================
      // 🔐 أفعال تسجيل الدخول
      // ======================================

      /**
       * تسجيل دخول بالبريد الإلكتروني
       */
      signInWithEmail: async (credentials: EmailLoginData) => {
        // تأكيد استخدام parameter
        console.log('🔐 تسجيل دخول بالبريد:', credentials.email);
        set({ isLoading: true, error: null });
        
        try {
          const result = await authService.signInWithEmail(credentials);
          
          if (result.success && result.user && result.token) {
            set({
              user: result.user,
              token: result.token,
              isAuthenticated: true,
              needs_role_selection: result.needs_role_selection,
              isLoading: false,
              error: null,
            });
            
            // تحديث ApiClient
            apiClient.setAuthToken(result.token);
          } else {
            throw new Error(result.message || 'فشل في تسجيل الدخول');
          }
          
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'خطأ غير متوقع';
          set({
            isLoading: false,
            error: errorMessage,
            isAuthenticated: false,
            user: null,
            token: null,
          });
          throw error;
        }
      },

      /**
       * تسجيل دخول بالهاتف (إرسال OTP)
       */
      signInWithPhone: async (phoneData: PhoneLoginData) => {
        set({ isLoading: true, error: null });
        
        try {
          const result = await authService.signInWithPhone(phoneData);
          
          set({ isLoading: false });
          
          return {
            success: result.success,
            message: result.message,
          };
          
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'خطأ في إرسال OTP';
          set({
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      /**
       * التحقق من OTP وإكمال تسجيل الدخول
       */
      verifyOTP: async (verifyData: OTPVerifyRequest) => {
        set({ isLoading: true, error: null });
        
        try {
          const result = await authService.verifyOTP(verifyData);
          
          if (result.success && result.user && result.token) {
            set({
              user: result.user,
              token: result.token,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
            
            // تحديث ApiClient
            apiClient.setAuthToken(result.token);
          } else {
            throw new Error(result.message || 'فشل في التحقق من OTP');
          }
          
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'خطأ في التحقق';
          set({
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      /**
       * تسجيل دخول بجوجل
       */
      signInWithGoogle: async (googleData: GoogleLoginData) => {
        set({ isLoading: true, error: null });
        
        try {
          const result = await authService.signInWithGoogle(googleData);
          
          if (result.success && result.user && result.token) {
            set({
              user: result.user,
              token: result.token,
              isAuthenticated: true,
              needs_role_selection: result.needs_role_selection,
              isLoading: false,
              error: null,
            });
            
            // تحديث ApiClient
            apiClient.setAuthToken(result.token);
          } else {
            throw new Error(result.message || 'فشل في تسجيل الدخول بجوجل');
          }
          
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'خطأ في تسجيل الدخول بجوجل';
          set({
            isLoading: false,
            error: errorMessage,
            isAuthenticated: false,
            user: null,
            token: null,
          });
          throw error;
        }
      },

      // ======================================
      // 🚪 أفعال عامة
      // ======================================

      /**
       * تسجيل خروج
       */
      signOut: async () => {
        set({ isLoading: true });
        
        try {
          await authService.signOut();
          
          // مسح الحالة
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
            needs_role_selection: false,
          });
          
        } catch (error) {
          // حتى لو فشل الطلب، امسح الحالة المحلية
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
            needs_role_selection: false,
          });
          
          console.error('خطأ في تسجيل الخروج:', error);
        }
      },

      /**
       * جلب المستخدم الحالي
       */
      getCurrentUser: async () => {
        const { token } = get();
        
        if (!token) {
          set({ isAuthenticated: false, user: null });
          return;
        }
        
        set({ isLoading: true });
        
        try {
          const user = await authService.getCurrentUser();
          
          if (user) {
            set({
              user,
              isAuthenticated: true,
              isLoading: false,
            });
          } else {
            // Token منتهي الصلاحية أو غير صالح
            set({
              user: null,
              token: null,
              isAuthenticated: false,
              isLoading: false,
            });
          }
          
        } catch (error) {
          console.error('خطأ في جلب بيانات المستخدم:', error);
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      // ======================================
      // 🧹 أفعال مساعدة
      // ======================================

      /**
       * مسح رسالة الخطأ
       */
      clearError: () => set({ error: null }),

      /**
       * تعيين المستخدم
       */
      setUser: (user: User | null) => set({ user }),

      /**
       * تعيين التوكن
       */
      setToken: (token: string | null) => {
        set({ token });
        
        // تحديث ApiClient
        apiClient.setAuthToken(token);
        
        // تحديث حالة المصادقة
        set({ isAuthenticated: !!token });
      },

      /**
       * تعيين حالة التحميل
       */
      setLoading: (isLoading: boolean) => set({ isLoading }),

      /**
       * تعيين رسالة الخطأ
       */
      setError: (error: string | null) => set({ error }),

      /**
       * إعادة تعيين جميع الحالات
       */
      reset: () => set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        needs_role_selection: false,
      }),
    }),
    {
      name: 'depth-auth-storage', // اسم المفتاح في localStorage
      storage: createJSONStorage(() => localStorage),
      
      // تحديد البيانات المراد حفظها
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        needs_role_selection: state.needs_role_selection,
      }),
      
      // استعادة الحالة بعد التحميل
      onRehydrateStorage: () => (state) => {
        if (state?.token) {
          // تحديث ApiClient بالتوكن المحفوظ
          apiClient.setAuthToken(state.token);
          
          // التحقق من صلاحية التوكن
          state.getCurrentUser();
        }
      },
    }
  )
);

// ======================================
// 🪝 Hook مساعد للوصول السريع
// ======================================

/**
 * Hook للوصول لحالة المصادقة فقط
 */
export const useAuth = () => {
  // Zustand destructuring pattern - جميع المتغيرات مُستخدمة في return object
  // eslint-disable-next-line no-unused-vars
  const {
    user,
    isAuthenticated,
    isLoading,
    error,
    needs_role_selection,
  } = useAuthStore();

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    needs_role_selection,
  };
};

/**
 * Hook للوصول لأفعال المصادقة فقط
 */
export const useAuthActions = () => {
  // Zustand destructuring pattern - جميع الدوال مُستخدمة في return object
  // eslint-disable-next-line no-unused-vars
  const {
    signInWithEmail,
    signInWithPhone,
    signInWithGoogle,
    verifyOTP,
    signOut,
    getCurrentUser,
    clearError,
  } = useAuthStore();

  return {
    signInWithEmail,
    signInWithPhone,
    signInWithGoogle,
    verifyOTP,
    signOut,
    getCurrentUser,
    clearError,
  };
}; 