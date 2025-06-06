/**
 * 🔧 User Utility Functions
 * 
 * تطوير علي جودت - Depth Studio
 * آخر تحديث: يناير 2025
 * 
 * @description Utility functions for user operations (search, filtering, pagination)
 * @version 1.0.0
 */

import { Query, DocumentData } from 'firebase-admin/firestore';
import { db } from '../../config/firebase';
import { User, UserRole, UserSearchFilters } from '../../types/types';

/**
 * Helper function لإنشاء query للبحث والفلترة
 */
export function buildUsersQuery(filters: UserSearchFilters, userId?: string): Query<DocumentData> {
  let query: Query<DocumentData> = db.collection('users')
  
  // فلترة حسب الدور
  if (filters.role) {
    query = query.where('primary_role', '==', filters.role)
  }
  
  // فلترة حسب الحالة
  if (filters.status) {
    query = query.where('status', '==', filters.status)
  }
  
  // فلترة حسب التفعيل
  if (filters.is_active !== undefined) {
    query = query.where('is_active', '==', filters.is_active)
  }
  
  // فلترة حسب البراند (للمنسقين)
  if (filters.brand_id) {
    query = query.where('assigned_brands', 'array-contains', filters.brand_id)
  }
  
  // فلترة حسب تاريخ الإنشاء
  if (filters.created_after) {
    query = query.where('created_at', '>=', new Date(filters.created_after))
  }
  
  if (filters.created_before) {
    query = query.where('created_at', '<=', new Date(filters.created_before))
  }
  
  // ترتيب النتائج
  const sortField = filters.sort_by || 'created_at'
  const sortOrder = filters.sort_order === 'asc' ? 'asc' : 'desc'
  query = query.orderBy(sortField, sortOrder)
  
  return query
}

/**
 * Helper function للبحث النصي
 */
export async function searchUsers(searchTerm: string, filters: UserSearchFilters): Promise<User[]> {
  // في الإنتاج، استخدم Elasticsearch أو Algolia للبحث المتقدم
  // هنا نستخدم فلترة أساسية
  
  const allUsersQuery = buildUsersQuery(filters)
  const snapshot = await allUsersQuery.get()
  
  const searchTermLower = searchTerm.toLowerCase()
  
  return snapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() } as User))
    .filter(user => 
      user.first_name.toLowerCase().includes(searchTermLower) ||
      user.last_name.toLowerCase().includes(searchTermLower) ||
      user.email.toLowerCase().includes(searchTermLower) ||
      (user.phone && user.phone.includes(searchTerm))
    )
}

/**
 * Helper function للـ pagination
 */
export async function paginateUsers(query: Query<DocumentData>, page: number, limit: number) {
  const offset = (page - 1) * limit
  
  // احصل على العدد الإجمالي
  const countSnapshot = await query.get()
  const totalCount = countSnapshot.size
  
  // احصل على البيانات المطلوبة
  const dataQuery = query.offset(offset).limit(limit)
  const dataSnapshot = await dataQuery.get()
  
  const users = dataSnapshot.docs.map((doc: any) => ({
    id: doc.id,
    ...doc.data()
  })) as User[]
  
  const totalPages = Math.ceil(totalCount / limit)
  
  return {
    users,
    pagination: {
      currentPage: page,
      totalPages,
      totalCount,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  }
}

/**
 * التحقق من صلاحية الوصول للمستخدم
 */
export function canAccessUser(requesterId: string, targetUserId: string, requesterRole: UserRole): boolean {
  // المستخدم يمكنه رؤية بياناته الخاصة
  if (requesterId === targetUserId) {
    return true;
  }
  
  // المديرين يمكنهم رؤية جميع المستخدمين
  if (['super_admin', 'marketing_coordinator'].includes(requesterRole)) {
    return true;
  }
  
  return false;
}

/**
 * التحقق من صلاحية تحديث المستخدم
 */
export function canUpdateUser(requesterId: string, targetUserId: string, requesterRole: UserRole): boolean {
  // المستخدم يمكنه تحديث بياناته الخاصة (محدود)
  if (requesterId === targetUserId) {
    return true;
  }
  
  // المديرين يمكنهم تحديث جميع المستخدمين
  if (['super_admin', 'marketing_coordinator'].includes(requesterRole)) {
    return true;
  }
  
  return false;
}

/**
 * التحقق من صلاحية حذف المستخدم
 */
export function canDeleteUser(requesterRole: UserRole): boolean {
  // فقط super_admin يمكنه حذف المستخدمين
  return requesterRole === 'super_admin';
}

/**
 * إزالة البيانات الحساسة من كائن المستخدم
 */
export function sanitizeUserData(user: any): User {
  const sanitized = { ...user };
  delete sanitized.password;
  delete sanitized.firebase_uid;
  return sanitized;
}

/**
 * التحقق من صحة البريد الإلكتروني
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * التحقق من قوة كلمة المرور
 */
export function isStrongPassword(password: string): { isValid: boolean; message?: string } {
  if (password.length < 6) {
    return { isValid: false, message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' };
  }
  
  if (!/[A-Za-z]/.test(password)) {
    return { isValid: false, message: 'كلمة المرور يجب أن تحتوي على أحرف' };
  }
  
  if (!/[0-9]/.test(password)) {
    return { isValid: false, message: 'كلمة المرور يجب أن تحتوي على أرقام' };
  }
  
  return { isValid: true };
}

export const userUtils = {
  buildUsersQuery,
  searchUsers,
  paginateUsers,
  canAccessUser,
  canUpdateUser,
  canDeleteUser,
  sanitizeUserData,
  isValidEmail,
  isStrongPassword
}; 