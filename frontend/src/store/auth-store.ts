import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User } from '@/lib/api-types'
import { authService, UserProfile } from '@/lib/auth'

// Helper function to convert UserProfile to User
function convertUserProfileToUser(userProfile: UserProfile): User {
  console.log('🔥 Converting user profile:', userProfile)
  
  const user: User = {
    id: userProfile.uid,
    email: userProfile.email,
    display_name: userProfile.displayName,
    first_name: userProfile.firstName,
    last_name: userProfile.lastName,
    primary_role: userProfile.primaryRole,
    status: userProfile.status, // ⭐ إضافة حقل status المهم
    is_active: userProfile.isActive,
    is_verified: userProfile.isVerified,
    timezone: 'Asia/Baghdad',
    language: 'ar',
    firebase_uid: userProfile.uid,
    auth_providers: userProfile.authProviders,
    is_online: true,
    created_at: {
      _seconds: userProfile.createdAt instanceof Date 
        ? Math.floor(userProfile.createdAt.getTime() / 1000)
        : Math.floor(Date.now() / 1000),
      _nanoseconds: 0
    },
    updated_at: {
      _seconds: userProfile.updatedAt instanceof Date 
        ? Math.floor(userProfile.updatedAt.getTime() / 1000)
        : Math.floor(Date.now() / 1000),
      _nanoseconds: 0
    },
    total_login_count: 0
  }
  
  console.log('🔥 Converted user:', user)
  return user
}

interface AuthStore {
  // State
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  
  // Actions
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  login: (email: string, password: string) => Promise<void>
  loginWithGoogle: () => Promise<void>
  logout: () => Promise<void>
  clearError: () => void
  refreshUser: () => Promise<void>
  initialize: () => Promise<void>
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      // Initial State
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      setUser: (user) => 
        set({ 
          user, 
          isAuthenticated: !!user,
          error: null 
        }),

      setLoading: (isLoading) => 
        set({ isLoading }),

      setError: (error) => 
        set({ error }),

      clearError: () => 
        set({ error: null }),

      // Authentication Actions
      login: async (email: string, password: string) => {
        try {
          set({ isLoading: true, error: null })
          
          const authUser = await authService.signInWithEmail({ email, password })
          const userProfile = await authService.getUserProfile(authUser.uid)
          
          if (userProfile) {
            const user = convertUserProfileToUser(userProfile)
            
            set({ 
              user, 
              isAuthenticated: true,
              isLoading: false,
              error: null 
            })
          } else {
            throw new Error('فشل في جلب بيانات المستخدم')
          }
        } catch (error) {
          const errorMessage = error instanceof Error 
            ? error.message 
            : 'حدث خطأ غير متوقع'
          
          set({ 
            error: errorMessage,
            isLoading: false,
            user: null,
            isAuthenticated: false
          })
          throw error
        }
      },

      loginWithGoogle: async () => {
        try {
          console.log('🔥 Starting Google login in auth store...')
          set({ isLoading: true, error: null })
          
          const authUser = await authService.signInWithGoogle()
          console.log('🔥 Got auth user from service:', authUser)
          
          // إضافة تأخير قصير للتأكد من انتهاء كتابة البيانات في Firestore
          console.log('⏳ Waiting before fetching user profile...')
          await new Promise(resolve => setTimeout(resolve, 1000))
          
          const userProfile = await authService.getUserProfile(authUser.uid)
          console.log('🔥 Got user profile from Firestore:', userProfile)
          
          if (userProfile) {
            const user = convertUserProfileToUser(userProfile)
            
            // حفظ التوكن في cookies للـ middleware
            if (typeof window !== 'undefined') {
              const token = await authUser.uid // استخدام UID كتوكن مؤقت
              document.cookie = `authToken=${token}; path=/; max-age=${60 * 60 * 24 * 7}` // أسبوع
            }
            
            console.log('✅ Setting user in auth store:', user)
            set({ 
              user, 
              isAuthenticated: true,
              isLoading: false,
              error: null 
            })
          } else {
            console.error('❌ User profile is null, throwing error')
            throw new Error('فشل في جلب بيانات المستخدم')
          }
        } catch (error) {
          console.error('❌ Error in loginWithGoogle:', error)
          const errorMessage = error instanceof Error 
            ? error.message 
            : 'حدث خطأ في تسجيل الدخول بجوجل'
          
          set({ 
            error: errorMessage,
            isLoading: false,
            user: null,
            isAuthenticated: false
          })
          throw error
        }
      },

      logout: async () => {
        try {
          set({ isLoading: true })
          await authService.signOut()
          set({ 
            user: null, 
            isAuthenticated: false,
            isLoading: false,
            error: null 
          })
        } catch (error) {
          console.error('خطأ في تسجيل الخروج:', error)
          // Force logout even if there's an error
          set({ 
            user: null, 
            isAuthenticated: false,
            isLoading: false,
            error: null 
          })
        }
      },

      refreshUser: async () => {
        try {
          const currentUser = authService.getCurrentUser()
          if (!currentUser) {
            set({ 
              user: null, 
              isAuthenticated: false,
              isLoading: false 
            })
            return
          }

          set({ isLoading: true })
          const userProfile = await authService.getUserProfile(currentUser.uid)
          
          if (userProfile) {
            const user = convertUserProfileToUser(userProfile)
            
            set({ 
              user,
              isAuthenticated: true,
              isLoading: false,
              error: null 
            })
          } else {
            set({ 
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: 'فشل في تحديث بيانات المستخدم'
            })
          }
        } catch (error) {
          console.error('خطأ في تحديث بيانات المستخدم:', error)
          set({ 
            isLoading: false,
            error: 'حدث خطأ في تحديث البيانات'
          })
        }
      },

      initialize: async () => {
        try {
          // Check if auth service is available
          if (!authService) {
            console.warn('Auth service not available')
            set({ isLoading: false, isAuthenticated: false, user: null })
            return
          }

          const currentUser = authService.getCurrentUser()
          if (currentUser) {
            set({ isLoading: true })
            const userProfile = await authService.getUserProfile(currentUser.uid)
            
            if (userProfile) {
              const user = convertUserProfileToUser(userProfile)
              
              set({ 
                user,
                isAuthenticated: true,
                isLoading: false,
                error: null 
              })
            } else {
              set({ 
                user: null,
                isAuthenticated: false,
                isLoading: false
              })
            }
          } else {
            set({ 
              user: null,
              isAuthenticated: false,
              isLoading: false
            })
          }
        } catch (error) {
          console.error('خطأ في تهيئة المستخدم:', error)
          set({ 
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null
          })
        }
      },
    }),
    {
      name: 'depth-auth-store',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

// Selectors (for performance optimization)
export const useUser = () => useAuthStore((state) => state.user)
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated)
export const useAuthLoading = () => useAuthStore((state) => state.isLoading)
export const useAuthError = () => useAuthStore((state) => state.error)

// Action hooks
export const useAuth = () => {
  const store = useAuthStore()
  return {
    ...store,
    login: store.login,
    loginWithGoogle: store.loginWithGoogle,
    logout: store.logout,
    refreshUser: store.refreshUser,
    initialize: store.initialize,
    setUser: store.setUser,
    setLoading: store.setLoading,
    setError: store.setError,
    clearError: store.clearError
  }
} 