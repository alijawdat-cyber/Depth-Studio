import {
  signInWithEmailAndPassword,
  signInWithPhoneNumber,
  signInWithPopup,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
  RecaptchaVerifier,
  ConfirmationResult,
  User,
  onAuthStateChanged
} from 'firebase/auth'
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  serverTimestamp,
  FieldValue
} from 'firebase/firestore'
import { auth, db } from './firebase'

// Google OAuth Provider configuration
const googleProvider = new GoogleAuthProvider()
googleProvider.addScope('email')
googleProvider.addScope('profile')
googleProvider.setCustomParameters({
  prompt: 'select_account'
})

// Types
export interface AuthUser {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
  emailVerified: boolean
  phoneNumber: string | null
}

export interface UserProfile {
  uid: string
  email: string
  displayName: string
  firstName: string
  lastName: string
  phoneNumber?: string
  photoURL?: string
  primaryRole: 'super_admin' | 'marketing_coordinator' | 'brand_coordinator' | 'photographer' | 'new_user'
  status: 'pending_role_setup' | 'pending_approval' | 'active' | 'suspended' | 'archived'
  isActive: boolean
  isVerified: boolean
  authProviders: ('email' | 'phone' | 'google')[]
  lastLogin?: Date | FieldValue
  createdAt: Date | FieldValue
  updatedAt: Date | FieldValue
}

export interface LoginCredentials {
  email: string
  password: string
  rememberMe?: boolean
}

export interface RegisterData {
  email: string
  password: string
  firstName: string
  lastName: string
  phoneNumber?: string
}

export interface PhoneAuthData {
  phoneNumber: string
  recaptchaVerifier: RecaptchaVerifier
}

// Auth Service Class
export class AuthService {
  private static instance: AuthService
  private currentUser: User | null = null
  private authStateCallbacks: ((user: User | null) => void)[] = []

  constructor() {
    // Listen to auth state changes only if Firebase is available
    try {
      if (auth) {
        onAuthStateChanged(auth, (user) => {
          this.currentUser = user
          this.authStateCallbacks.forEach(callback => callback(user))
        })
      }
    } catch (error) {
      console.warn('Firebase auth not available:', error)
    }
  }

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService()
    }
    return AuthService.instance
  }

  // Auth state listener
  onAuthStateChange(callback: (user: User | null) => void): () => void {
    this.authStateCallbacks.push(callback)
    // Return unsubscribe function
    return () => {
      const index = this.authStateCallbacks.indexOf(callback)
      if (index > -1) {
        this.authStateCallbacks.splice(index, 1)
      }
    }
  }

  // Get current user
  getCurrentUser(): User | null {
    try {
      return this.currentUser || (auth ? auth.currentUser : null)
    } catch (error) {
      console.warn('Firebase auth not available:', error)
      return null
    }
  }

  // Email/Password sign in
  async signInWithEmail({ email, password }: LoginCredentials): Promise<AuthUser> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      await this.updateLastLogin(userCredential.user.uid)
      return this.mapFirebaseUser(userCredential.user)
    } catch (error) {
      throw this.handleAuthError(error)
    }
  }

  // Google sign in
  async signInWithGoogle(): Promise<AuthUser> {
    try {
      console.log('🔥 Starting Google sign in process...')
      const userCredential = await signInWithPopup(auth, googleProvider)
      const user = userCredential.user
      console.log('🔥 Google popup successful, user:', user.uid)
      
      // Check if user exists in Firestore, if not create profile
      console.log('🆕 Checking if user exists in Firestore...')
      const userDoc = await getDoc(doc(db, 'users', user.uid))
      
      if (!userDoc.exists()) {
        console.log('🆕 User does not exist, creating profile...')
        await this.createUserProfile(user, ['google'])
        console.log('✅ User profile created successfully')
      } else {
        console.log('👋 Existing user, updating last login...')
        await this.updateLastLogin(user.uid)
        console.log('✅ Last login updated')
      }

      console.log('🎯 Returning mapped Firebase user')
      return this.mapFirebaseUser(user)
    } catch (error) {
      console.error('❌ Error in signInWithGoogle:', error)
      throw this.handleAuthError(error)
    }
  }

  // Phone sign in (step 1: send verification)
  async sendPhoneVerification({ phoneNumber, recaptchaVerifier }: PhoneAuthData): Promise<ConfirmationResult> {
    try {
      // تنسيق رقم الهاتف العراقي
      const formattedPhone = this.formatIraqiPhoneNumber(phoneNumber)
      const confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, recaptchaVerifier)
      return confirmationResult
    } catch (error) {
      throw this.handleAuthError(error)
    }
  }

  // Phone sign in (step 2: verify code)
  async verifyPhoneCode(confirmationResult: ConfirmationResult, verificationCode: string): Promise<AuthUser> {
    try {
      const userCredential = await confirmationResult.confirm(verificationCode)
      const user = userCredential.user
      
      // Check if user exists, if not create profile
      const userDoc = await getDoc(doc(db, 'users', user.uid))
      if (!userDoc.exists()) {
        await this.createUserProfile(user, ['phone'])
      } else {
        await this.updateLastLogin(user.uid)
      }

      return this.mapFirebaseUser(user)
    } catch (error) {
      throw this.handleAuthError(error)
    }
  }

  // Register new user
  async register(data: RegisterData): Promise<AuthUser> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password)
      const user = userCredential.user

      // Update Firebase profile
      await updateProfile(user, {
        displayName: `${data.firstName} ${data.lastName}`
      })

      // Create Firestore profile
      await this.createUserProfile(user, ['email'], {
        firstName: data.firstName,
        lastName: data.lastName,
        phoneNumber: data.phoneNumber
      })

      return this.mapFirebaseUser(user)
    } catch (error) {
      throw this.handleAuthError(error)
    }
  }

  // Sign out
  async signOut(): Promise<void> {
    try {
      await firebaseSignOut(auth)
    } catch (error) {
      throw this.handleAuthError(error)
    }
  }

  // Reset password
  async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email)
    } catch (error) {
      throw this.handleAuthError(error)
    }
  }

  // Get user profile from Firestore
  async getUserProfile(uid: string, retryCount = 0): Promise<UserProfile | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid))
      if (userDoc.exists()) {
        const data = userDoc.data()
        
        // تحويل أسماء الحقول من snake_case إلى camelCase للتوافق مع TypeScript
        const mappedData: UserProfile = {
          uid: userDoc.id,
          email: data.email || '',
          displayName: data.display_name || data.displayName || '',
          firstName: data.first_name || data.firstName || '',
          lastName: data.last_name || data.lastName || '',
          phoneNumber: data.phoneNumber || data.phone || '',
          photoURL: data.photoURL || data.profile_photo_url || '',
          primaryRole: data.primary_role || data.primaryRole || 'new_user',
          status: data.status || 'pending_role_setup',
          isActive: data.is_active !== undefined ? data.is_active : data.isActive !== undefined ? data.isActive : true,
          isVerified: data.is_verified !== undefined ? data.is_verified : data.isVerified !== undefined ? data.isVerified : false,
          authProviders: data.authProviders || data.auth_providers || ['google'],
          createdAt: data.createdAt?.toDate() || data.created_at?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || data.updated_at?.toDate() || new Date(),
          lastLogin: data.lastLogin?.toDate() || data.last_login?.toDate()
        }
        
        console.log('🔥 Mapped user profile:', mappedData)
        return mappedData
      }
      
      // إذا المستخدم مو موجود وهذه أول محاولة، نعيد المحاولة بعد تأخير
      if (retryCount < 3) {
        console.log(`🔄 User profile not found, retrying... (${retryCount + 1}/3)`)
        await new Promise(resolve => setTimeout(resolve, 1000)) // تأخير ثانية واحدة
        return this.getUserProfile(uid, retryCount + 1)
      }
      
      return null
    } catch (error) {
      console.error('Error getting user profile:', error)
      
      // إعادة المحاولة في حالة خطأ الشبكة أيضاً
      if (retryCount < 3) {
        console.log(`🔄 Error getting user profile, retrying... (${retryCount + 1}/3)`)
        await new Promise(resolve => setTimeout(resolve, 1000))
        return this.getUserProfile(uid, retryCount + 1)
      }
      
      return null
    }
  }

  // Update user role and role-specific data
  async updateUserRole(params: {
    userId: string
    role: string
    roleData: Record<string, unknown>
    status?: string
  }): Promise<void> {
    try {
      const userRef = doc(db, 'users', params.userId)
      
      await updateDoc(userRef, {
        primaryRole: params.role,
        roleData: params.roleData,
        status: params.status || 'pending_approval',
        updatedAt: serverTimestamp()
      })

      // إرسال إشعار للمدير العام
      await this.sendApprovalNotification(params.userId, params.role)
    } catch (error) {
      console.error('Error updating user role:', error)
      throw new Error('فشل في حفظ بيانات الدور')
    }
  }

  // Send approval notification to admin
  private async sendApprovalNotification(userId: string, role: string): Promise<void> {
    try {
      // هذا سيحتاج Firebase Function في المستقبل
      console.log(`Approval notification sent for user ${userId} with role ${role}`)
    } catch (error) {
      console.error('Error sending approval notification:', error)
    }
  }

  // Create user profile in Firestore
  private async createUserProfile(
    user: User, 
    authProviders: ('email' | 'phone' | 'google')[],
    additionalData?: Partial<UserProfile>
  ): Promise<void> {
    try {
      const userRef = doc(db, 'users', user.uid)
      
      const profile: Partial<UserProfile> = {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || additionalData?.firstName + ' ' + additionalData?.lastName || '',
        firstName: additionalData?.firstName || user.displayName?.split(' ')[0] || '',
        lastName: additionalData?.lastName || user.displayName?.split(' ').slice(1).join(' ') || '',
        phoneNumber: user.phoneNumber || additionalData?.phoneNumber || '',
        photoURL: user.photoURL || '',
        primaryRole: 'new_user',
        status: 'pending_role_setup',
        isActive: true,
        isVerified: user.emailVerified,
        authProviders,
        lastLogin: serverTimestamp(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        ...additionalData
      }

      await setDoc(userRef, profile)
      console.log('✅ User profile created successfully in Firestore:', user.uid)
      
      // تأكيد أن البيانات تمت كتابتها فعلاً
      const verification = await getDoc(userRef)
      if (!verification.exists()) {
        throw new Error('فشل في إنشاء ملف المستخدم')
      }
      
    } catch (error) {
      console.error('❌ Error creating user profile:', error)
      throw error
    }
  }

  // Update last login timestamp
  private async updateLastLogin(uid: string): Promise<void> {
    try {
      const userRef = doc(db, 'users', uid)
      await updateDoc(userRef, {
        lastLogin: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
    } catch (error) {
      console.error('Error updating last login:', error)
    }
  }

  // Format Iraqi phone number
  private formatIraqiPhoneNumber(phoneNumber: string): string {
    // إزالة المسافات والرموز
    let cleaned = phoneNumber.replace(/\D/g, '')
    
    // إضافة مفتاح العراق إذا لم يكن موجود
    if (cleaned.startsWith('0')) {
      cleaned = '964' + cleaned.substring(1)
    } else if (!cleaned.startsWith('964')) {
      cleaned = '964' + cleaned
    }
    
    return '+' + cleaned
  }

  // Map Firebase User to AuthUser
  private mapFirebaseUser(user: User): AuthUser {
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      emailVerified: user.emailVerified,
      phoneNumber: user.phoneNumber
    }
  }

  // Handle auth errors
  private handleAuthError(error: unknown): Error {
    const authError = error as { code?: string; message?: string }
    console.error('Auth error:', error)
    
    switch (authError.code) {
      case 'auth/user-not-found':
        return new Error('لا يوجد حساب بهذا البريد الإلكتروني')
      case 'auth/wrong-password':
        return new Error('كلمة المرور غير صحيحة')
      case 'auth/email-already-in-use':
        return new Error('هذا البريد الإلكتروني مستخدم بالفعل')
      case 'auth/weak-password':
        return new Error('كلمة المرور ضعيفة')
      case 'auth/invalid-email':
        return new Error('البريد الإلكتروني غير صالح')
      case 'auth/too-many-requests':
        return new Error('محاولات كثيرة، يرجى المحاولة لاحقاً')
      case 'auth/popup-closed-by-user':
        return new Error('تم إغلاق نافذة تسجيل الدخول')
      case 'auth/cancelled-popup-request':
        return new Error('تم إلغاء عملية تسجيل الدخول')
      case 'auth/popup-blocked':
        return new Error('تم حجب النافذة المنبثقة')
      case 'auth/invalid-phone-number':
        return new Error('رقم الهاتف غير صالح')
      case 'auth/invalid-verification-code':
        return new Error('رمز التحقق غير صحيح')
      case 'auth/code-expired':
        return new Error('انتهت صلاحية رمز التحقق')
      default:
        return new Error(authError.message || 'حدث خطأ غير متوقع')
    }
  }
}

// Create and export singleton instance
export const authService = AuthService.getInstance()

// Export helper functions
export const getCurrentUser = () => authService.getCurrentUser()
export const onAuthStateChange = (callback: (user: User | null) => void) => 
  authService.onAuthStateChange(callback) 