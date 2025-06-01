import { ref, computed, onMounted, watch, readonly } from 'vue'
import { useRouter } from 'vue-router'
import { onAuthStateChanged, type User } from 'firebase/auth'
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
import { auth, db } from '@/firebase/config'
import AuthService from '@/services/AuthService'

// User Profile Interface
export interface UserProfile {
  uid: string
  email: string
  displayName: string
  role: 'super_admin' | 'marketing_coordinator' | 'brand_coordinator' | 'photographer' | 'new_user'
  primary_role: string
  phone?: string
  status: 'active' | 'pending' | 'pending_approval' | 'pending_role_setup' | 'disabled'
  brand_access?: string[]
  photographer_type?: 'freelancer' | 'salary'
  created_at: Date
  updated_at: Date
}

// 🎯 Advanced Navigation Intent System
interface NavigationIntent {
  isUserInitiated: boolean
  targetPath: string | null
  timestamp: number
  reason: 'user_action' | 'auth_change' | 'app_init' | 'forced_redirect'
}

// Global state
const currentUser = ref<User | null>(null)
const userProfile = ref<UserProfile | null>(null)
const isAuthenticated = ref<boolean>(false)
const isLoading = ref<boolean>(true)
const isSigningIn = ref<boolean>(false)
const error = ref<string>('')

// 🚀 Enterprise Navigation Intent Tracking
const navigationIntent = ref<NavigationIntent>({
  isUserInitiated: false,
  targetPath: null,
  timestamp: 0,
  reason: 'app_init'
})

// 🛡️ Redirect Prevention System - V2 Enterprise Design
const redirectPreventionFlags = ref({
  preventAutoRedirect: false,
  pendingApprovalEscapePaths: ['/auth/login', '/auth/register', '/'], // Only for escaping FROM pending-approval
  lastUserAction: 0,
  isEscapingFromPendingApproval: false // New flag for context tracking
})

export function useAuth() {
  const router = useRouter()

  // Initialize auth state listener
  onMounted(() => {
    console.log('🔄 تهيئة مراقب حالة المصادقة...')
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('🔔 تغيير حالة المصادقة:', user?.email || 'لا يوجد مستخدم')
      
      currentUser.value = user
      isAuthenticated.value = !!user
      
      if (user) {
        try {
          // Load user profile from Firestore
          const profile = await getUserProfile(user.uid)
          userProfile.value = profile
          
          // Handle redirect after authentication
          handlePostAuthRedirect(profile)
        } catch (err: any) {
          console.error('❌ خطأ في تحميل ملف المستخدم:', err)
          error.value = 'خطأ في تحميل بيانات المستخدم'
        }
      } else {
        userProfile.value = null
      }
      
      isLoading.value = false
    })

    // Check for redirect result on app initialization
    handleRedirectResult()

    return unsubscribe
  })

  // Handle redirect result from Google OAuth
  const handleRedirectResult = async () => {
    try {
      const result = await AuthService.handleRedirectResult()
      if (result) {
        console.log('✅ تم استلام نتيجة إعادة التوجيه:', result.user.email)
        // The auth state change listener will handle the rest
      }
    } catch (err: any) {
      console.error('❌ خطأ في معالجة نتيجة إعادة التوجيه:', err)
      error.value = err.message
    }
  }

  // 🚀 Enterprise-Level Post-Authentication Redirect Logic
  const handlePostAuthRedirect = (profile: UserProfile | null) => {
    if (!profile) {
      console.log('⚠️ No user profile - Skipping redirect')
      return
    }

    const currentPath = router.currentRoute.value.path
    
    console.log('🏢 Enterprise Auth Redirect Analysis:', {
      userStatus: profile.status,
      userRole: profile.primary_role,
      currentPath: currentPath,
      navigationIntent: navigationIntent.value,
      preventFlags: redirectPreventionFlags.value
    })

    // 🛡️ Phase 1: Redirect Prevention Checks
    if (shouldPreventAutoRedirect(currentPath, profile.status)) {
      console.log('🛡️ Auto-redirect prevented by intent detection system')
      return
    }

    // 🎯 Phase 2: Smart Path Analysis
    const isOnCorrectPath = (() => {
      switch (profile.status) {
        case 'pending_role_setup':
          return currentPath === '/auth/role-setup'
        case 'pending_approval':
          return currentPath === '/auth/pending-approval'
        case 'active':
          const expectedPaths = [
            `/super-admin/dashboard`,
            `/photographer/dashboard`,
            `/brand-coordinator/dashboard`,
            `/marketing-coordinator/dashboard`,
            `/dashboard`
          ]
          return expectedPaths.some(path => currentPath.startsWith(path.split('/')[1] ? `/${path.split('/')[1]}` : path))
        default:
          return false
      }
    })()

    if (isOnCorrectPath) {
      console.log('✅ User already on correct path for their status')
      return
    }

    // 🔄 Phase 3: Intelligent Redirect Logic
    const executeSmartRedirect = (targetPath: string, reason: string) => {
      console.log(`🎯 Executing smart redirect to ${targetPath} - Reason: ${reason}`)
      setNavigationIntent(false, targetPath, 'forced_redirect')
      
      // Small delay to ensure state is updated
      setTimeout(() => {
        router.push(targetPath)
      }, 100)
    }

    // 📋 Phase 4: Status-Based Routing
    switch (profile.status) {
      case 'pending_role_setup':
        if (currentPath !== '/auth/role-setup') {
          executeSmartRedirect('/auth/role-setup', 'User needs to complete role setup')
        }
        break

      case 'pending_approval':
        // 🚨 V2: Simplified & Bulletproof Logic
        if (currentPath !== '/auth/pending-approval') {
          executeSmartRedirect('/auth/pending-approval', 'User pending admin approval')
        }
        break

      case 'active':
        const dashboardPath = (() => {
          switch (profile.primary_role) {
            case 'super_admin': return '/super-admin/dashboard'
            case 'photographer': return '/photographer/dashboard'
            case 'brand_coordinator': return '/brand-coordinator/dashboard'
            case 'marketing_coordinator': return '/marketing-coordinator/dashboard'
            default: return '/dashboard'
          }
        })()
        
        if (!currentPath.startsWith(dashboardPath.split('/')[1] ? `/${dashboardPath.split('/')[1]}` : dashboardPath)) {
          executeSmartRedirect(dashboardPath, 'Redirecting active user to appropriate dashboard')
        }
        break

      default:
        console.log('⚠️ Unknown user status:', profile.status)
    }
  }

  // Get user profile from Firestore with retry logic
  const getUserProfile = async (uid: string, maxRetries = 3): Promise<UserProfile | null> => {
    try {
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        console.log(`🔍 محاولة جلب ملف المستخدم (المحاولة ${attempt}/${maxRetries})...`)
        
        const userDoc = await getDoc(doc(db, 'users', uid))
        
        if (userDoc.exists()) {
          const data = userDoc.data()
          const profile = {
            uid,
            email: data.email,
            displayName: data.display_name || data.full_name,
            role: data.primary_role,
            primary_role: data.primary_role,
            phone: data.phone,
            status: data.status,
            brand_access: data.brand_access,
            photographer_type: data.photographer_type,
            created_at: data.created_at?.toDate() || new Date(),
            updated_at: data.updated_at?.toDate() || new Date()
          }
          
          console.log('✅ تم جلب ملف المستخدم بنجاح:', profile.status)
          return profile
        }
        
        // إذا لم توجد الوثيقة، انتظر قليلاً وحاول مرة أخرى
        if (attempt < maxRetries) {
          console.log(`⏳ انتظار ${attempt * 500}ms قبل المحاولة التالية...`)
          await new Promise(resolve => setTimeout(resolve, attempt * 500))
        }
      }
      
      console.log('❌ لم يتم العثور على ملف المستخدم بعد جميع المحاولات')
      return null
    } catch (err: any) {
      console.error('❌ خطأ في جلب ملف المستخدم:', err)
      return null
    }
  }

  // Create user profile in Firestore
  const createUserProfile = async (user: User, additionalData: any = {}): Promise<UserProfile> => {
    console.log('📝 إنشاء ملف مستخدم جديد:', user.email)
    
    const newUserProfile: UserProfile = {
      uid: user.uid,
      email: user.email || '',
      displayName: additionalData.displayName || user.displayName || 'مستخدم جديد',
      role: 'new_user',
      primary_role: 'new_user',
      phone: user.phoneNumber || '',
      status: 'pending_role_setup',
      created_at: new Date(),
      updated_at: new Date()
    }

    const firestoreData = {
      email: newUserProfile.email,
      display_name: newUserProfile.displayName,
      full_name: newUserProfile.displayName,
      primary_role: newUserProfile.primary_role,
      phone: newUserProfile.phone,
      status: newUserProfile.status,
      auth_provider: additionalData.authProvider || 'email',
      firebase_uid: user.uid,
      created_at: new Date(),
      updated_at: new Date()
    }

    try {
      await setDoc(doc(db, 'users', user.uid), firestoreData)
      console.log('✅ تم إنشاء ملف المستخدم بنجاح')
      
      // 🔄 تحديث الحالة المحلية فوراً
      userProfile.value = newUserProfile
      
      return newUserProfile
    } catch (err: any) {
      console.error('❌ خطأ في إنشاء ملف المستخدم:', err)
      throw new Error(`فشل في إنشاء ملف المستخدم: ${err.message}`)
    }
  }

  // Email/Password Registration
  const registerWithEmail = async (email: string, password: string, fullName: string) => {
    try {
      isSigningIn.value = true
      clearError()
      
      console.log('📝 تسجيل مستخدم جديد بالإيميل:', email)
      const userCredential = await AuthService.registerWithEmail(email, password, fullName)
      
      // Create user profile in Firestore
      const profile = await createUserProfile(userCredential.user, {
        displayName: fullName,
        authProvider: 'email'
      })
      
      // 🎯 توجيه فوري للمستخدم الجديد
      console.log('↗️ توجيه المستخدم الجديد لإعداد الدور...')
      router.push('/auth/role-setup')
      
      console.log('✅ تم التسجيل بالإيميل بنجاح')
    } catch (err: any) {
      console.error('❌ خطأ في التسجيل بالإيميل:', err)
      error.value = err.message
      throw err
    } finally {
      isSigningIn.value = false
    }
  }

  // Google Registration/Sign In
  const registerWithGoogle = async () => {
    try {
      isSigningIn.value = true
      clearError()
      
      console.log('🔄 تسجيل/دخول بـ Google...')
      const userCredential = await AuthService.signInWithGoogle()
      
      // Check if user profile exists, create if not
      let profile = await getUserProfile(userCredential.user.uid)
      
      if (!profile) {
        console.log('👤 مستخدم جديد - إنشاء ملف شخصي...')
        profile = await createUserProfile(userCredential.user, {
          authProvider: 'google'
        })
        
        // 🎯 توجيه فوري للمستخدم الجديد
        console.log('↗️ توجيه المستخدم الجديد لإعداد الدور...')
        router.push('/auth/role-setup')
      } else {
        console.log('👤 مستخدم موجود - توجيه حسب الحالة...')
        
        // 🎯 توجيه المستخدم الموجود حسب حالته
        handlePostAuthRedirect(profile)
      }
      
      console.log('✅ تم التسجيل/الدخول بـ Google بنجاح')
    } catch (err: any) {
      console.error('❌ خطأ في التسجيل بـ Google:', err)
      
      if (err.message === 'redirect_in_progress') {
        throw err
      }
      
      error.value = err.message
      throw err
    } finally {
      isSigningIn.value = false
    }
  }

  // Email/Password Sign In
  const signInWithEmail = async (email: string, password: string) => {
    try {
      isSigningIn.value = true
      clearError()
      
      console.log('🔐 تسجيل دخول بالإيميل:', email)
      await AuthService.signInWithEmail(email, password)
      
      console.log('✅ تم تسجيل الدخول بالإيميل بنجاح')
    } catch (err: any) {
      console.error('❌ خطأ في تسجيل الدخول بالإيميل:', err)
      error.value = err.message
      throw err
    } finally {
      isSigningIn.value = false
    }
  }

  // Sign Out
  const signOut = async () => {
    try {
      await AuthService.signOut()
      // Clear local state
      currentUser.value = null
      userProfile.value = null
      isAuthenticated.value = false
      clearError()
      
      // Redirect to login
      router.push('/auth/login')
    } catch (err: any) {
      console.error('❌ خطأ في تسجيل الخروج:', err)
      error.value = err.message
    }
  }

  // Send Password Reset
  const sendPasswordReset = async (email: string) => {
    try {
      clearError()
      await AuthService.sendPasswordReset(email)
    } catch (err: any) {
      error.value = err.message
      throw err
    }
  }

  // Update User Role
  const updateUserRole = async (uid: string, newRole: string, additionalData: any = {}) => {
    try {
      console.log('🔄 تحديث دور المستخدم:', { uid, newRole })
      
      // 🔄 تحديث: جميع الأدوار الجديدة تحتاج موافقة من المدير
      const newStatus = 'pending_approval'
      
      const updateData = {
        primary_role: newRole,
        status: newStatus,
        updated_at: new Date(),
        ...additionalData
      }
      
      await updateDoc(doc(db, 'users', uid), updateData)
      console.log('✅ تم تحديث دور المستخدم بنجاح - في انتظار موافقة المدير')
      
      // Update local state
      if (userProfile.value && userProfile.value.uid === uid) {
        userProfile.value = {
          ...userProfile.value,
          primary_role: newRole,
          role: newRole as any,
          status: newStatus as any,
          updated_at: new Date(),
          ...additionalData
        }
      }
      
      return userProfile.value
    } catch (err: any) {
      console.error('❌ خطأ في تحديث دور المستخدم:', err)
      error.value = `فشل في تحديث دور المستخدم: ${err.message}`
      throw err
    }
  }

  // Clear error
  const clearError = () => {
    error.value = ''
  }

  // Computed properties
  const isNewUser = computed(() => {
    return userProfile.value?.status === 'pending_role_setup'
  })

  const isActiveUser = computed(() => {
    return userProfile.value?.status === 'active'
  })

  const userRole = computed(() => {
    return userProfile.value?.primary_role || 'new_user'
  })

  // 🎯 Professional Navigation Intent Detection
  const setNavigationIntent = (
    isUserInitiated: boolean, 
    targetPath: string | null = null, 
    reason: NavigationIntent['reason'] = 'user_action'
  ) => {
    navigationIntent.value = {
      isUserInitiated,
      targetPath,
      timestamp: Date.now(),
      reason
    }
    
    console.log('🎯 Navigation Intent Set:', navigationIntent.value)
    
    // Auto-clear intent after 5 seconds to prevent stale state
    setTimeout(() => {
      if (navigationIntent.value.timestamp === Date.now() - 5000) {
        clearNavigationIntent()
      }
    }, 5000)
  }

  const clearNavigationIntent = () => {
    navigationIntent.value = {
      isUserInitiated: false,
      targetPath: null,
      timestamp: 0,
      reason: 'app_init'
    }
  }

  // 🎮 Enhanced User Action Tracking V2
  const trackUserAction = (action: string, path?: string) => {
    const currentPath = router.currentRoute.value.path
    
    // 🎯 Smart Detection: User escaping from pending-approval
    if (currentPath === '/auth/pending-approval' && 
        path && redirectPreventionFlags.value.pendingApprovalEscapePaths.includes(path)) {
      redirectPreventionFlags.value.isEscapingFromPendingApproval = true
      console.log('🚪 User is escaping from pending-approval to:', path)
      
      // Clear escape flag after 5 seconds
      setTimeout(() => {
        redirectPreventionFlags.value.isEscapingFromPendingApproval = false
        console.log('🔄 Escape flag cleared')
      }, 5000)
    }
    
    redirectPreventionFlags.value.lastUserAction = Date.now()
    setNavigationIntent(true, path, 'user_action')
    console.log('👤 User Action Tracked:', { 
      action, 
      path, 
      currentPath,
      isEscaping: redirectPreventionFlags.value.isEscapingFromPendingApproval,
      timestamp: Date.now() 
    })
  }

  // Enterprise-Level V2: Context-Aware Redirect Prevention
  const shouldPreventAutoRedirect = (targetPath: string, userStatus?: string): boolean => {
    const currentPath = router.currentRoute.value.path
    const now = Date.now()
    const timeSinceLastUserAction = now - redirectPreventionFlags.value.lastUserAction
    const timeSinceIntent = now - navigationIntent.value.timestamp
    
    console.log('🧠 Smart Redirect Analysis:', {
      targetPath,
      currentPath,
      userStatus,
      timeSinceLastUserAction,
      timeSinceIntent,
      navigationIntent: navigationIntent.value,
      isEscaping: redirectPreventionFlags.value.isEscapingFromPendingApproval
    })

    // 🎯 Rule 1: Allow all redirects TO pending-approval (core fix)
    if (targetPath === '/auth/pending-approval') {
      console.log('✅ Always allow redirects TO pending-approval')
      return false
    }

    // 🎯 Rule 2: Prevent redirects FROM pending-approval if user is escaping
    if (currentPath === '/auth/pending-approval' && 
        redirectPreventionFlags.value.isEscapingFromPendingApproval) {
      console.log('🛡️ Preventing redirect - User is escaping from pending-approval')
      return true
    }

    // 🎯 Rule 3: Respect recent user actions (existing logic)
    if (timeSinceLastUserAction < 3000) {
      console.log('🛡️ Preventing redirect - Recent user action')
      return true
    }

    // 🎯 Rule 4: Respect user navigation intent (existing logic)
    if (navigationIntent.value.isUserInitiated && timeSinceIntent < 2000) {
      console.log('🛡️ Preventing redirect - User initiated navigation')
      return true
    }

    console.log('✅ Allow redirect - No prevention rules triggered')
    return false
  }

  return {
    // State
    currentUser,
    userProfile,
    isAuthenticated,
    isLoading,
    isSigningIn,
    error,
    
    // Computed
    isNewUser,
    isActiveUser,
    userRole,
    
    // 🚀 Enterprise Navigation Control
    navigationIntent: readonly(navigationIntent),
    redirectPreventionFlags: readonly(redirectPreventionFlags),
    
    // Methods
    registerWithEmail,
    registerWithGoogle,
    signInWithEmail,
    signOut,
    sendPasswordReset,
    updateUserRole,
    clearError,
    
    // 🎯 Advanced Navigation Control
    setNavigationIntent,
    clearNavigationIntent,
    trackUserAction,
    shouldPreventAutoRedirect
  }
} 