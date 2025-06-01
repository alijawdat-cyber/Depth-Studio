/**
 * User Management Composable
 * @description Composable شامل لإدارة المستخدمين
 */

import { ref, computed } from 'vue'
import { db } from '@/firebase/config'
import { 
  collection, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  setDoc,
  writeBatch,
  addDoc 
} from 'firebase/firestore'
import type { User, UserStats } from '@/utils/userHelpers'

export function useUserManagement() {
  // === Reactive State ===
  const allUsers = ref<User[]>([])
  const pendingUsers = ref<User[]>([])
  const activeUsers = ref<User[]>([])
  const selectedUsers = ref<string[]>([])
  const selectedAllUsers = ref<string[]>([])
  const isProcessing = ref(false)
  const processingUsers = ref<string[]>([])

  // === Computed Properties ===
  const stats = computed((): UserStats => ({
    total: allUsers.value.length,
    active: activeUsers.value.length,
    pending: pendingUsers.value.length
  }))

  const photographersCount = computed(() => 
    allUsers.value.filter(user => user.primary_role === 'photographer').length
  )

  const coordinatorsCount = computed(() => 
    allUsers.value.filter(user => 
      user.primary_role === 'brand_coordinator' || 
      user.primary_role === 'marketing_coordinator'
    ).length
  )

  // === Data Loading ===
  
  /**
   * جلب جميع المستخدمين من Firestore
   */
  const loadAllUsers = async (): Promise<void> => {
    try {
      console.log('📊 بدء جلب المستخدمين...')
      
      const usersSnapshot = await getDocs(collection(db, 'users'))
      allUsers.value = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as User))
      
      // تصنيف المستخدمين
      pendingUsers.value = allUsers.value.filter(user => user.status === 'pending_approval')
      activeUsers.value = allUsers.value.filter(user => user.status === 'active')
      
      console.log(`✅ تم جلب ${allUsers.value.length} مستخدم (${activeUsers.value.length} نشط، ${pendingUsers.value.length} معلق)`)
      
    } catch (error) {
      console.error('❌ خطأ في جلب المستخدمين:', error)
      throw error
    }
  }

  // === User Operations ===

  /**
   * موافقة على مستخدم واحد - نظام شامل
   */
  const approveUser = async (user: User): Promise<void> => {
    try {
      processingUsers.value.push(user.id)
      isProcessing.value = true
      
      console.log(`🔄 بدء عملية الموافقة الشاملة لـ ${user.display_name}...`)
      
      // 1. تحديث حالة المستخدم في users collection
      await updateDoc(doc(db, 'users', user.id), {
        status: 'active',
        approved_at: new Date(),
        approved_by: 'current_admin_uid', // TODO: استخدام UID الحقيقي
        updated_at: new Date()
      })
      
      console.log(`✅ تم تحديث حالة المستخدم في users`)
      
      // 2. إنشاء الصلاحيات الأساسية للمستخدم
      await createUserPermissions(user)
      
      // 3. إنشاء الوثائق المرتبطة بالدور
      await createRoleSpecificDocuments(user)
      
      // 4. تحديث القوائم المحلية
      const userIndex = pendingUsers.value.findIndex(u => u.id === user.id)
      if (userIndex > -1) {
        const approvedUser = { ...pendingUsers.value[userIndex], status: 'active' } as User
        pendingUsers.value.splice(userIndex, 1)
        activeUsers.value.push(approvedUser)
        
        // تحديث في القائمة الشاملة أيضاً
        const allUserIndex = allUsers.value.findIndex(u => u.id === user.id)
        if (allUserIndex > -1) {
          allUsers.value[allUserIndex].status = 'active'
        }
      }
      
      console.log(`✅ تم تفعيل ${user.display_name} بالكامل مع جميع المستندات المرتبطة`)
      
    } catch (error: any) {
      console.error('❌ خطأ في الموافقة الشاملة:', error)
      throw new Error(`خطأ في تفعيل ${user.display_name}: ${error?.message || 'خطأ غير معروف'}`)
    } finally {
      processingUsers.value = processingUsers.value.filter(id => id !== user.id)
      isProcessing.value = false
    }
  }

  /**
   * موافقة جماعية
   */
  const approveBulk = async (): Promise<void> => {
    if (selectedUsers.value.length === 0) return
    
    try {
      isProcessing.value = true
      
      console.log(`🔄 بدء الموافقة الجماعية على ${selectedUsers.value.length} مستخدم...`)
      
      // معالجة كل مستخدم بشكل فردي لضمان إنشاء جميع الوثائق المرتبطة
      for (const userId of selectedUsers.value) {
        const user = pendingUsers.value.find(u => u.id === userId)
        if (user) {
          console.log(`📋 معالجة ${user.display_name}...`)
          
          // 1. تحديث حالة المستخدم
          await updateDoc(doc(db, 'users', userId), {
            status: 'active',
            approved_at: new Date(),
            approved_by: 'current_admin_uid',
            updated_at: new Date()
          })
          
          // 2. إنشاء الصلاحيات
          await createUserPermissions(user)
          
          // 3. إنشاء الوثائق المرتبطة بالدور
          await createRoleSpecificDocuments(user)
          
          console.log(`✅ تم تفعيل ${user.display_name}`)
        }
      }
      
      // تحديث القوائم المحلية
      const approvedUsers = pendingUsers.value.filter(user => 
        selectedUsers.value.includes(user.id)
      )
      
      pendingUsers.value = pendingUsers.value.filter(user => 
        !selectedUsers.value.includes(user.id)
      )
      
      activeUsers.value.push(...approvedUsers.map(user => ({ ...user, status: 'active' } as User)))
      
      // تحديث القائمة الشاملة
      selectedUsers.value.forEach(userId => {
        const allUserIndex = allUsers.value.findIndex(u => u.id === userId)
        if (allUserIndex > -1) {
          allUsers.value[allUserIndex].status = 'active'
        }
      })
      
      console.log(`🎉 تم تفعيل ${selectedUsers.value.length} مستخدم بالكامل`)
      selectedUsers.value = []
      
    } catch (error: any) {
      console.error('❌ خطأ في الموافقة الجماعية:', error)
      throw new Error(`خطأ في الموافقة الجماعية: ${error?.message || 'خطأ غير معروف'}`)
    } finally {
      isProcessing.value = false
    }
  }

  /**
   * رفض مستخدم
   */
  const rejectUser = async (user: User, reason?: string): Promise<void> => {
    try {
      isProcessing.value = true
      
      console.log(`❌ بدء رفض طلب ${user.display_name}`)
      
      // حذف المستخدم من قاعدة البيانات
      await deleteDoc(doc(db, 'users', user.id))
      
      // تحديث القائمة المحلية
      const userIndex = pendingUsers.value.findIndex(u => u.id === user.id)
      if (userIndex > -1) {
        pendingUsers.value.splice(userIndex, 1)
      }
      
      // تحديث القائمة الشاملة
      const allUserIndex = allUsers.value.findIndex(u => u.id === user.id)
      if (allUserIndex > -1) {
        allUsers.value.splice(allUserIndex, 1)
      }
      
      console.log(`✅ تم رفض طلب ${user.display_name}`)
      
    } catch (error: any) {
      console.error('❌ خطأ في الرفض:', error)
      throw new Error(`خطأ في رفض الطلب: ${error?.message || 'خطأ غير معروف'}`)
    } finally {
      isProcessing.value = false
    }
  }

  /**
   * رفض جماعي
   */
  const rejectBulk = async (): Promise<void> => {
    if (selectedUsers.value.length === 0) return
    
    try {
      isProcessing.value = true
      
      const batch = writeBatch(db)
      
      selectedUsers.value.forEach(userId => {
        const userRef = doc(db, 'users', userId)
        batch.delete(userRef)
      })
      
      await batch.commit()
      
      // تحديث القوائم المحلية
      pendingUsers.value = pendingUsers.value.filter(user => 
        !selectedUsers.value.includes(user.id)
      )
      
      allUsers.value = allUsers.value.filter(user => 
        !selectedUsers.value.includes(user.id)
      )
      
      console.log(`❌ تم رفض ${selectedUsers.value.length} طلب`)
      selectedUsers.value = []
      
    } catch (error: any) {
      console.error('❌ خطأ في الرفض الجماعي:', error)
      throw new Error(`خطأ في الرفض الجماعي: ${error?.message || 'خطأ غير معروف'}`)
    } finally {
      isProcessing.value = false
    }
  }

  /**
   * تعليق مستخدم
   */
  const suspendUser = async (user: User): Promise<void> => {
    try {
      console.log('⏸️ تعليق المستخدم:', user.display_name)
      
      // تحديث حالة المستخدم في Firestore
      await updateDoc(doc(db, 'users', user.id), {
        status: 'suspended',
        suspended_at: new Date(),
        suspended_by: 'current_admin_uid', // TODO: استخدام UID الحقيقي
        updated_at: new Date()
      })
      
      // تحديث القوائم المحلية
      const userIndex = activeUsers.value.findIndex(u => u.id === user.id)
      if (userIndex > -1) {
        activeUsers.value.splice(userIndex, 1)
      }
      
      const allUserIndex = allUsers.value.findIndex(u => u.id === user.id)
      if (allUserIndex > -1) {
        allUsers.value[allUserIndex].status = 'suspended'
      }
      
      console.log(`✅ تم تعليق حساب ${user.display_name}`)
      
    } catch (error: any) {
      console.error('❌ خطأ في تعليق المستخدم:', error)
      throw new Error(`خطأ في تعليق الحساب: ${error?.message || 'خطأ غير معروف'}`)
    }
  }

  /**
   * تبديل حالة المستخدم (تفعيل/تعليق)
   */
  const toggleUserStatus = async (user: User): Promise<void> => {
    const newStatus = user.status === 'active' ? 'suspended' : 'active'
    const actionText = newStatus === 'active' ? 'تفعيل' : 'تعليق'
    
    try {
      console.log(`🔄 ${actionText} المستخدم:`, user.display_name)
      
      // تحديث حالة المستخدم في Firestore
      const updateData: any = {
        status: newStatus,
        updated_at: new Date()
      }
      
      if (newStatus === 'suspended') {
        updateData.suspended_at = new Date()
        updateData.suspended_by = 'current_admin_uid'
      } else {
        updateData.reactivated_at = new Date()
        updateData.reactivated_by = 'current_admin_uid'
      }
      
      await updateDoc(doc(db, 'users', user.id), updateData)
      
      // تحديث القوائم المحلية
      const allUserIndex = allUsers.value.findIndex(u => u.id === user.id)
      if (allUserIndex > -1) {
        allUsers.value[allUserIndex].status = newStatus
      }
      
      // إعادة تصنيف المستخدمين
      if (newStatus === 'active') {
        const userIndex = activeUsers.value.findIndex(u => u.id === user.id)
        if (userIndex === -1) {
          activeUsers.value.push({ ...user, status: newStatus })
        }
      } else {
        const userIndex = activeUsers.value.findIndex(u => u.id === user.id)
        if (userIndex > -1) {
          activeUsers.value.splice(userIndex, 1)
        }
      }
      
      console.log(`✅ تم ${actionText} حساب ${user.display_name}`)
      
    } catch (error: any) {
      console.error(`❌ خطأ في ${actionText} المستخدم:`, error)
      throw new Error(`خطأ في ${actionText} الحساب: ${error?.message || 'خطأ غير معروف'}`)
    }
  }

  /**
   * إجراءات جماعية - تعليق المحدد
   */
  const bulkSuspendUsers = async (): Promise<void> => {
    if (selectedAllUsers.value.length === 0) return
    
    try {
      isProcessing.value = true
      console.log(`⏸️ بدء تعليق ${selectedAllUsers.value.length} مستخدم...`)
      
      const batch = writeBatch(db)
      
      selectedAllUsers.value.forEach(userId => {
        const userRef = doc(db, 'users', userId)
        batch.update(userRef, {
          status: 'suspended',
          suspended_at: new Date(),
          suspended_by: 'current_admin_uid',
          updated_at: new Date()
        })
      })
      
      await batch.commit()
      
      // تحديث القوائم المحلية
      selectedAllUsers.value.forEach(userId => {
        const allUserIndex = allUsers.value.findIndex(u => u.id === userId)
        if (allUserIndex > -1) {
          allUsers.value[allUserIndex].status = 'suspended'
        }
        
        const activeUserIndex = activeUsers.value.findIndex(u => u.id === userId)
        if (activeUserIndex > -1) {
          activeUsers.value.splice(activeUserIndex, 1)
        }
      })
      
      console.log(`✅ تم تعليق ${selectedAllUsers.value.length} مستخدم`)
      selectedAllUsers.value = []
      
    } catch (error: any) {
      console.error('❌ خطأ في التعليق الجماعي:', error)
      throw new Error(`خطأ في التعليق الجماعي: ${error?.message || 'خطأ غير معروف'}`)
    } finally {
      isProcessing.value = false
    }
  }

  /**
   * إجراءات جماعية - تفعيل المحدد
   */
  const bulkActivateUsers = async (): Promise<void> => {
    if (selectedAllUsers.value.length === 0) return
    
    try {
      isProcessing.value = true
      console.log(`✅ بدء تفعيل ${selectedAllUsers.value.length} مستخدم...`)
      
      const batch = writeBatch(db)
      
      selectedAllUsers.value.forEach(userId => {
        const userRef = doc(db, 'users', userId)
        batch.update(userRef, {
          status: 'active',
          reactivated_at: new Date(),
          reactivated_by: 'current_admin_uid',
          updated_at: new Date()
        })
      })
      
      await batch.commit()
      
      // تحديث القوائم المحلية
      selectedAllUsers.value.forEach(userId => {
        const allUserIndex = allUsers.value.findIndex(u => u.id === userId)
        if (allUserIndex > -1) {
          allUsers.value[allUserIndex].status = 'active'
          
          // إضافة للمستخدمين النشطين إذا لم يكن موجوداً
          const activeUserIndex = activeUsers.value.findIndex(u => u.id === userId)
          if (activeUserIndex === -1) {
            activeUsers.value.push(allUsers.value[allUserIndex])
          }
        }
      })
      
      console.log(`✅ تم تفعيل ${selectedAllUsers.value.length} مستخدم`)
      selectedAllUsers.value = []
      
    } catch (error: any) {
      console.error('❌ خطأ في التفعيل الجماعي:', error)
      throw new Error(`خطأ في التفعيل الجماعي: ${error?.message || 'خطأ غير معروف'}`)
    } finally {
      isProcessing.value = false
    }
  }

  // === Helper Functions ===

  /**
   * إنشاء صلاحيات المستخدم
   */
  const createUserPermissions = async (user: User): Promise<void> => {
    try {
      console.log(`📋 إنشاء صلاحيات لـ ${user.primary_role}...`)
      
      // صلاحيات أساسية حسب الدور
      let permissions = {
        user_id: user.id,
        role: user.primary_role,
        crud_permissions: {
          users: { read: false, create: false, update: false, delete: false },
          brands: { read: false, create: false, update: false, delete: false },
          campaigns: { read: false, create: false, update: false, delete: false },
          content: { read: false, create: false, update: false, delete: false },
          tasks: { read: false, create: false, update: false, delete: false },
          reports: { read: false, create: false, update: false, delete: false }
        },
        created_at: new Date(),
        updated_at: new Date()
      }
      
      // تخصيص الصلاحيات حسب الدور
      switch (user.primary_role) {
        case 'photographer':
          permissions.crud_permissions = {
            users: { read: false, create: false, update: false, delete: false },
            brands: { read: true, create: false, update: false, delete: false },
            campaigns: { read: true, create: false, update: false, delete: false },
            content: { read: true, create: true, update: true, delete: true },
            tasks: { read: true, create: false, update: true, delete: false },
            reports: { read: true, create: false, update: false, delete: false }
          }
          break
          
        case 'brand_coordinator':
          permissions.crud_permissions = {
            users: { read: true, create: false, update: false, delete: false },
            brands: { read: true, create: false, update: true, delete: false },
            campaigns: { read: true, create: true, update: true, delete: false },
            content: { read: true, create: false, update: true, delete: false },
            tasks: { read: true, create: true, update: true, delete: false },
            reports: { read: true, create: true, update: false, delete: false }
          }
          break
          
        case 'marketing_coordinator':
          permissions.crud_permissions = {
            users: { read: true, create: true, update: true, delete: false },
            brands: { read: true, create: true, update: true, delete: false },
            campaigns: { read: true, create: true, update: true, delete: true },
            content: { read: true, create: true, update: true, delete: true },
            tasks: { read: true, create: true, update: true, delete: true },
            reports: { read: true, create: true, update: true, delete: false }
          }
          break
      }
      
      // إنشاء وثيقة الصلاحيات
      await setDoc(doc(db, 'user_permissions', user.id), permissions)
      console.log(`✅ تم إنشاء صلاحيات ${user.primary_role}`)
      
    } catch (error) {
      console.error(`❌ خطأ في إنشاء الصلاحيات:`, error)
      throw error
    }
  }

  /**
   * إنشاء الوثائق المرتبطة بالدور
   */
  const createRoleSpecificDocuments = async (user: User): Promise<void> => {
    try {
      console.log(`📝 إنشاء وثائق خاصة بدور ${user.primary_role}...`)
      
      switch (user.primary_role) {
        case 'photographer':
          await createPhotographerProfile(user)
          break
          
        case 'brand_coordinator':
          await createBrandCoordinatorProfile(user)
          break
          
        case 'marketing_coordinator':
          // منسق التسويق لا يحتاج وثائق إضافية في الوقت الحالي
          console.log(`ℹ️ منسق التسويق لا يحتاج وثائق إضافية`)
          break
      }
      
    } catch (error) {
      console.error(`❌ خطأ في إنشاء وثائق الدور:`, error)
      throw error
    }
  }

  /**
   * إنشاء ملف المصور
   */
  const createPhotographerProfile = async (user: User): Promise<void> => {
    try {
      const photographerProfile = {
        user_id: user.id,
        contract_type: (user as any).photographer_contract_type || 'freelancer',
        specializations: ((user as any).photographer_specializations || []).map((spec: string) => ({
          category_id: spec,
          skill_level: 'intermediate',
          years_experience: 1
        })),
        availability_hours: (user as any).photographer_availability || [],
        notes: (user as any).photographer_notes || '',
        performance_stats: {
          total_tasks_completed: 0,
          average_rating: 0,
          total_content_uploaded: 0,
          on_time_delivery_rate: 0
        },
        financial_info: {
          hourly_rate: (user as any).photographer_contract_type === 'freelancer' ? 50 : null,
          monthly_salary: (user as any).photographer_contract_type === 'salary' ? 3000 : null,
          total_earnings: 0,
          payment_method: 'bank_transfer'
        },
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      }
      
      await addDoc(collection(db, 'photographer_profiles'), photographerProfile)
      console.log(`✅ تم إنشاء ملف المصور`)
      
    } catch (error) {
      console.error(`❌ خطأ في إنشاء ملف المصور:`, error)
      throw error
    }
  }

  /**
   * إنشاء ملف منسق البراند
   */
  const createBrandCoordinatorProfile = async (user: User): Promise<void> => {
    try {
      const coordinatorProfile = {
        user_id: user.id,
        brand_id: (user as any).requested_brand_id,
        experience_description: (user as any).brand_experience || '',
        previous_experience_years: (user as any).previous_experience_years || 0,
        access_level: 'standard', // يمكن تعديله لاحقاً
        brand_specific_permissions: {
          content_approval: true,
          campaign_management: true,
          photographer_assignment: false,
          budget_access: false
        },
        performance_metrics: {
          campaigns_managed: 0,
          content_pieces_approved: 0,
          average_campaign_success_rate: 0
        },
        status: 'active',
        assigned_at: new Date(),
        created_at: new Date(),
        updated_at: new Date()
      }
      
      await addDoc(collection(db, 'brand_coordinators'), coordinatorProfile)
      console.log(`✅ تم إنشاء ملف منسق البراند`)
      
    } catch (error) {
      console.error(`❌ خطأ في إنشاء ملف منسق البراند:`, error)
      throw error
    }
  }

  // === Return API ===
  return {
    // State
    allUsers,
    pendingUsers,
    activeUsers,
    selectedUsers,
    selectedAllUsers,
    isProcessing,
    processingUsers,
    
    // Computed
    stats,
    photographersCount,
    coordinatorsCount,
    
    // Methods
    loadAllUsers,
    approveUser,
    approveBulk,
    rejectUser,
    rejectBulk,
    suspendUser,
    toggleUserStatus,
    bulkSuspendUsers,
    bulkActivateUsers
  }
} 