/**
 * 👥 User Request Handlers
 * 
 * تطوير علي جودت - Depth Studio
 * آخر تحديث: يناير 2025
 * 
 * @description Request handlers for user operations
 * @version 1.0.0
 */

import { Request, Response, NextFunction } from 'express';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { User, UserRole, UserSearchFilters } from '../../types/types';
import { 
  NotFoundError, 
  ConflictError,
  AuthorizationError 
} from '../../middleware/errors/CustomErrors';
import { buildUsersQuery, searchUsers, paginateUsers, canAccessUser, canUpdateUser, canDeleteUser, sanitizeUserData } from './utils';
import { getDefaultScreenPermissions, getDefaultCrudPermissions } from './permissions';
import { 
  CreateUserInput, 
  UpdateUserInput, 
  SearchUsersInput 
} from '../../validators/schemas';

const db = getFirestore();
const auth = getAuth();

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    uid: string;
    primary_role: UserRole;
    email: string;
  };
}

/**
 * قائمة المستخدمين مع فلتر وpagination
 */
export const getUsers = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      search,
      role,
      status,
      is_active,
      brand_id,
      created_after,
      created_before,
      sort_by,
      sort_order,
      page = 1,
      limit = 20
    } = req.query

    const filters: UserSearchFilters = {
      role: role as UserRole,
      status: status as string,
      is_active: is_active === 'true' ? true : is_active === 'false' ? false : undefined,
      brand_id: brand_id as string,
      created_after: created_after as string,
      created_before: created_before as string,
      sort_by: sort_by as string,
      sort_order: sort_order as 'asc' | 'desc'
    }

    const pageNum = parseInt(page as string)
    const limitNum = parseInt(limit as string)

    let result

    if (search) {
      // بحث نصي
      const users = await searchUsers(search as string, filters)
      
      // pagination يدوي للبحث
      const startIndex = (pageNum - 1) * limitNum
      const endIndex = startIndex + limitNum
      const paginatedUsers = users.slice(startIndex, endIndex)

      result = {
        users: paginatedUsers,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(users.length / limitNum),
          totalCount: users.length,
          hasNext: endIndex < users.length,
          hasPrev: pageNum > 1
        }
      }
    } else {
      // فلترة عادية مع pagination
      const query = buildUsersQuery(filters)
      result = await paginateUsers(query, pageNum, limitNum)
    }

    res.status(200).json({
      success: true,
      message: 'قائمة المستخدمين',
      data: result.users,
      pagination: result.pagination,
      filters: filters,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    next(error);
  }
};

/**
 * جلب بيانات مستخدم محدد
 */
export const getUserById = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.params.id
    const currentUser = req.user!

    // فحص الصلاحيات
    if (!canAccessUser(currentUser.id, userId, currentUser.primary_role)) {
      throw new AuthorizationError('ليس لديك صلاحية لرؤية بيانات هذا المستخدم')
    }

    const userDoc = await db.collection('users').doc(userId).get()

    if (!userDoc.exists) {
      throw new NotFoundError('المستخدم')
    }

    const userData = { id: userDoc.id, ...userDoc.data() } as User

    // إخفاء البيانات الحساسة إذا لم يكن المستخدم نفسه أو مدير
    if (userId !== currentUser.id && 
        !['super_admin', 'marketing_coordinator'].includes(currentUser.primary_role)) {
      delete (userData as any).phone
      delete (userData as any).last_seen
      delete (userData as any).firebase_uid
    }

    res.status(200).json({
      success: true,
      message: 'بيانات المستخدم',
      data: userData,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    next(error);
  }
};

/**
 * إنشاء مستخدم جديد
 */
export const createUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userData: CreateUserInput = req.body
    const currentUser = req.user!

    // فحص إذا كان البريد موجود مسبقاً
    const existingUsers = await db.collection('users')
      .where('email', '==', userData.email)
      .get()

    if (!existingUsers.empty) {
      throw new ConflictError('البريد الإلكتروني مستخدم مسبقاً')
    }

    // إنشاء مستخدم في Firebase Auth
    const firebaseUser = await auth.createUser({
      email: userData.email,
      password: userData.password,
      displayName: `${userData.first_name} ${userData.last_name}`,
      disabled: false
    })

    // تجهيز بيانات المستخدم للحفظ
    const newUser: Partial<User> = {
      firebase_uid: firebaseUser.uid,
      email: userData.email,
      first_name: userData.first_name,
      last_name: userData.last_name,
      phone: userData.phone,
      primary_role: userData.primary_role,
      status: 'pending_approval',
      is_active: false,
      is_verified: false,
      display_name: `${userData.first_name} ${userData.last_name}`,
      language: userData.language || 'ar',
      timezone: userData.timezone || 'Asia/Baghdad',
      bio: userData.bio || '',
      location: userData.location || '',
      created_at: FieldValue.serverTimestamp(),
      updated_at: FieldValue.serverTimestamp(),
      created_by: currentUser.id,
      last_seen: null,
      is_online: false,
      profile_photo_url: '',
      auth_providers: ['email'],
      total_login_count: 0,
      assigned_brands: [],
      preferences: {
        notifications: {
          email: true,
          push: true,
          sms: false
        },
        privacy: {
          show_phone: false,
          show_email_to_brands: true,
          allow_direct_messages: true
        }
      }
    }

    // حفظ في Firestore
    const userRef = await db.collection('users').add(newUser)

    // إنشاء صلاحيات افتراضية
    const defaultPermissions = {
      user_id: userRef.id,
      roles: [{
        role_type: userData.primary_role,
        is_primary: true,
        granted_at: FieldValue.serverTimestamp(),
        granted_by: currentUser.id
      }],
      screen_permissions: getDefaultScreenPermissions(userData.primary_role),
      crud_permissions: getDefaultCrudPermissions(userData.primary_role),
      brand_permissions: [],
      custom_permissions: {},
      is_active: true,
      last_updated_by: currentUser.id,
      created_at: FieldValue.serverTimestamp(),
      updated_at: FieldValue.serverTimestamp(),
      changelog: []
    }

    await db.collection('user_permissions').doc(userRef.id).set(defaultPermissions)

    // جلب البيانات المحفوظة
    const savedUserDoc = await userRef.get()
    const savedUser = sanitizeUserData({ id: savedUserDoc.id, ...savedUserDoc.data() })

    res.status(201).json({
      success: true,
      message: 'تم إنشاء المستخدم بنجاح',
      data: savedUser,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    next(error);
  }
};

/**
 * تحديث بيانات المستخدم
 */
export const updateUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.params.id
    const updateData: UpdateUserInput = req.body
    const currentUser = req.user!

    // فحص الصلاحيات
    if (!canUpdateUser(currentUser.id, userId, currentUser.primary_role)) {
      throw new AuthorizationError('ليس لديك صلاحية لتحديث بيانات هذا المستخدم')
    }

    // التحقق من وجود المستخدم
    const userDoc = await db.collection('users').doc(userId).get()
    if (!userDoc.exists) {
      throw new NotFoundError('المستخدم')
    }

    const existingUser = userDoc.data() as User

    // فحص البريد إذا تم تغييره
    if (updateData.email && updateData.email !== existingUser.email) {
      const emailCheck = await db.collection('users')
        .where('email', '==', updateData.email)
        .get()

      if (!emailCheck.empty && emailCheck.docs[0].id !== userId) {
        throw new ConflictError('البريد الإلكتروني مستخدم مسبقاً')
      }

      // تحديث البريد في Firebase Auth
      await auth.updateUser(existingUser.firebase_uid, {
        email: updateData.email
      })
    }

    // تجهيز البيانات للتحديث
    const allowedFields = [
      'first_name', 'last_name', 'phone', 'bio', 
      'language', 'timezone', 'preferences', 'location'
    ]

    // للمديرين فقط
    if (['super_admin', 'marketing_coordinator'].includes(currentUser.primary_role)) {
      allowedFields.push('primary_role', 'status', 'is_active', 'assigned_brands')
    }

    const updateFields: Record<string, any> = {
      updated_at: FieldValue.serverTimestamp(),
      updated_by: currentUser.id
    }

    // إضافة الحقول المسموحة فقط
    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        updateFields[field] = updateData[field]
      }
    }

    // تحديث البيانات
    await db.collection('users').doc(userId).update(updateFields)

    // جلب البيانات المحدثة
    const updatedDoc = await db.collection('users').doc(userId).get()
    const updatedUser = sanitizeUserData({ id: updatedDoc.id, ...updatedDoc.data() })

    res.status(200).json({
      success: true,
      message: 'تم تحديث بيانات المستخدم بنجاح',
      data: updatedUser,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    next(error);
  }
};

/**
 * حذف مستخدم
 */
export const deleteUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.params.id
    const currentUser = req.user!

    // فحص الصلاحيات
    if (!canDeleteUser(currentUser.primary_role)) {
      throw new AuthorizationError('ليس لديك صلاحية لحذف المستخدمين')
    }

    // التحقق من وجود المستخدم
    const userDoc = await db.collection('users').doc(userId).get()
    if (!userDoc.exists) {
      throw new NotFoundError('المستخدم')
    }

    const user = userDoc.data() as User

    // لا يمكن حذف المستخدم نفسه
    if (userId === currentUser.id) {
      throw new AuthorizationError('لا يمكنك حذف حسابك الخاص')
    }

    // حذف من Firebase Auth
    try {
      await auth.deleteUser(user.firebase_uid)
    } catch (authError) {
      console.warn('Failed to delete user from Firebase Auth:', authError)
    }

    // حذف من Firestore (soft delete)
    await db.collection('users').doc(userId).update({
      is_active: false,
      status: 'deleted',
      deleted_at: FieldValue.serverTimestamp(),
      deleted_by: currentUser.id,
      updated_at: FieldValue.serverTimestamp()
    })

    // حذف الصلاحيات
    await db.collection('user_permissions').doc(userId).delete()

    res.status(200).json({
      success: true,
      message: 'تم حذف المستخدم بنجاح',
      data: null,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    next(error);
  }
};

/**
 * تفعيل مستخدم
 */
export const activateUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.params.id
    const currentUser = req.user!

    const userDoc = await db.collection('users').doc(userId).get()
    if (!userDoc.exists) {
      throw new NotFoundError('المستخدم')
    }

    const existingUser = userDoc.data() as User

    await db.collection('users').doc(userId).update({
      is_active: true,
      status: 'active',
      activated_at: FieldValue.serverTimestamp(),
      activated_by: currentUser.id,
      updated_at: FieldValue.serverTimestamp()
    })

    // تفعيل في Firebase Auth
    await auth.updateUser(existingUser.firebase_uid, {
      disabled: false
    })

    res.status(200).json({
      success: true,
      message: 'تم تفعيل المستخدم بنجاح',
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    next(error);
  }
};

/**
 * إلغاء تفعيل مستخدم
 */
export const deactivateUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.params.id
    const currentUser = req.user!

    if (userId === currentUser.id) {
      throw new AuthorizationError('لا يمكنك إلغاء تفعيل حسابك الخاص')
    }

    const userDoc = await db.collection('users').doc(userId).get()
    if (!userDoc.exists) {
      throw new NotFoundError('المستخدم')
    }

    const existingUser = userDoc.data() as User

    await db.collection('users').doc(userId).update({
      is_active: false,
      status: 'suspended',
      deactivated_at: FieldValue.serverTimestamp(),
      deactivated_by: currentUser.id,
      updated_at: FieldValue.serverTimestamp()
    })

    // تعطيل في Firebase Auth
    await auth.updateUser(existingUser.firebase_uid, {
      disabled: true
    })

    res.status(200).json({
      success: true,
      message: 'تم إلغاء تفعيل المستخدم بنجاح',
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    next(error);
  }
};

/**
 * البحث السريع في المستخدمين
 */
export const searchUsersHandler = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { q: searchTerm, role, limit = 10 } = req.query

    if (!searchTerm || typeof searchTerm !== 'string' || searchTerm.length < 2) {
      res.status(400).json({
        success: false,
        message: 'نص البحث يجب أن يكون على الأقل حرفين',
        timestamp: new Date().toISOString()
      });
      return;
    }

    const filters: UserSearchFilters = {
      role: role as UserRole
    }

    const users = await searchUsers(searchTerm, filters)
    const limitedUsers = users.slice(0, parseInt(limit as string))

    res.status(200).json({
      success: true,
      message: 'نتائج البحث',
      data: limitedUsers,
      count: limitedUsers.length,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    next(error);
  }
};

/**
 * إحصائيات المستخدمين
 */
export const getUserStats = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    // إجمالي المستخدمين
    const totalUsersSnapshot = await db.collection('users').get()
    const totalUsers = totalUsersSnapshot.size

    // المستخدمين النشطين
    const activeUsersSnapshot = await db.collection('users')
      .where('is_active', '==', true)
      .get()
    const activeUsers = activeUsersSnapshot.size

    // المستخدمين في انتظار الموافقة
    const pendingUsersSnapshot = await db.collection('users')
      .where('status', '==', 'pending_approval')
      .get()
    const pendingApprovals = pendingUsersSnapshot.size

    // إحصائيات حسب الدور
    const roleStats: Record<string, number> = {}
    totalUsersSnapshot.docs.forEach(doc => {
      const role = doc.data().primary_role
      roleStats[role] = (roleStats[role] || 0) + 1
    })

    // إحصائيات حسب الحالة
    const statusStats: Record<string, number> = {}
    totalUsersSnapshot.docs.forEach(doc => {
      const status = doc.data().status
      statusStats[status] = (statusStats[status] || 0) + 1
    })

    const stats = {
      totalUsers,
      activeUsers,
      inactiveUsers: totalUsers - activeUsers,
      pendingApprovals,
      roleDistribution: roleStats,
      statusDistribution: statusStats,
      lastUpdated: new Date().toISOString()
    }

    res.status(200).json({
      success: true,
      message: 'إحصائيات المستخدمين',
      data: stats,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    next(error);
  }
};

export const userHandlers = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  activateUser,
  deactivateUser,
  searchUsersHandler,
  getUserStats
}; 