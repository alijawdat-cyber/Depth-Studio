/**
 * 👥 User Service - Depth Studio Frontend
 * ========================================
 * 
 * 📅 محدث: ديسمبر 2024
 * 👨‍💻 المطور: علي جودت
 * 🎯 الهدف: ربط 5 endpoints أساسية لإدارة المستخدمين
 * 
 * 🔗 Backend Integration:
 * - GET /api/users/search
 * - GET /api/users/stats  
 * - GET /api/users/:id
 * - POST /api/users
 * - PATCH /api/users/:id
 */

import { User, UserPermissions, PhotographerInfo } from '@depth-studio/types';
import { UserRole, UserStatus } from '@depth-studio/types';
import { ApiResponse } from '@depth-studio/types';
import { apiClient } from './api/api-client';

/**
 * 🔍 معايير البحث في المستخدمين
 */
export interface UserSearchFilters {
  searchTerm?: string;
  role?: UserRole;
  status?: UserStatus;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

/**
 * 📊 نتائج قائمة المستخدمين مع Pagination
 */
export interface UserListResponse {
  users: User[];
  total: number;
  page: number;
  totalPages: number;
}

/**
 * 📈 إحصائيات المستخدمين
 */
export interface UserStats {
  total: number;
  byRole: Record<UserRole, number>;
  byStatus: Record<UserStatus, number>;
  activeCount: number;
  pendingApproval: number;
}

/**
 * 👥 خدمة إدارة المستخدمين
 */
class UserService {
  
  /**
   * 🔧 دالة مساعدة لتحويل response إلى ApiResponse
   */
  private formatApiResponse<T>(data: T, message: string, success: boolean = true): ApiResponse<T> {
    return {
      success,
      data,
      timestamp: new Date().toISOString(),
      message,
      request_id: Math.random().toString(36).substring(2, 15)
    };
  }

  /**
   * 📋 جلب قائمة المستخدمين مع Pagination
   */
  async getUsers(page: number = 1, limit: number = 10): Promise<ApiResponse<UserListResponse>> {
    try {
      console.log('📋 جاري جلب قائمة المستخدمين...');
      
      const response = await apiClient.get<UserListResponse>('/users/search', {
        params: { page, limit }
      });
      
      console.log('✅ تم جلب قائمة المستخدمين بنجاح:', response.data);
      return {
        success: true,
        data: response.data,
        timestamp: new Date().toISOString(),
        message: 'تم جلب قائمة المستخدمين بنجاح'
      };
    } catch (error) {
      console.error('🚨 خطأ في جلب قائمة المستخدمين:', error);
      throw error;
    }
  }

  /**
   * ➕ إنشاء مستخدم جديد
   */
  async createUser(userData: Partial<User>): Promise<ApiResponse<{ user: User }>> {
    try {
      console.log('➕ جاري إنشاء مستخدم جديد...');
      
      const response = await apiClient.post<{ user: User }>('/users', userData);
      
      console.log('✅ تم إنشاء المستخدم بنجاح:', response.data);
      return this.formatApiResponse(response.data, 'تم إنشاء المستخدم بنجاح');
    } catch (error) {
      console.error('🚨 خطأ في إنشاء المستخدم:', error);
      throw error;
    }
  }

  /**
   * ✏️ تحديث بيانات مستخدم
   */
  async updateUser(userId: string, userData: Partial<User>): Promise<ApiResponse<{ user: User }>> {
    try {
      console.log('✏️ جاري تحديث بيانات المستخدم...');
      
      const response = await apiClient.patch<{ user: User }>(`/users/${userId}`, userData);
      
      console.log('✅ تم تحديث المستخدم بنجاح:', response.data);
      return this.formatApiResponse(response.data, 'تم تحديث المستخدم بنجاح');
    } catch (error) {
      console.error('🚨 خطأ في تحديث المستخدم:', error);
      throw error;
    }
  }

  /**
   * 🔍 البحث المتقدم في المستخدمين
   */
  async searchUsers(filters: UserSearchFilters): Promise<ApiResponse<UserListResponse>> {
    try {
      console.log('🔍 جاري البحث في المستخدمين...');
      
      const response = await apiClient.get<UserListResponse>('/users/search', {
        params: filters
      });
      
      console.log('✅ تم البحث في المستخدمين بنجاح:', response.data);
      return this.formatApiResponse(response.data, 'تم البحث في المستخدمين بنجاح');
    } catch (error) {
      console.error('🚨 خطأ في البحث في المستخدمين:', error);
      throw error;
    }
  }

  /**
   * 📊 جلب إحصائيات المستخدمين
   */
  async getUserStats(): Promise<ApiResponse<{ stats: UserStats }>> {
    try {
      console.log('📊 جاري جلب إحصائيات المستخدمين...');
      
      const response = await apiClient.get<{ stats: UserStats }>('/users/stats');
      
      console.log('✅ تم جلب الإحصائيات بنجاح:', response.data);
      return this.formatApiResponse(response.data, 'تم جلب الإحصائيات بنجاح');
    } catch (error) {
      console.error('🚨 خطأ في جلب الإحصائيات:', error);
      throw error;
    }
  }

  /**
   * 👤 جلب مستخدم واحد بالمعرف
   */
  async getUserById(userId: string): Promise<ApiResponse<{ user: User }>> {
    try {
      console.log('👤 جاري جلب بيانات المستخدم...');
      
      const response = await apiClient.get<{ user: User }>(`/users/${userId}`);
      
      console.log('✅ تم جلب بيانات المستخدم بنجاح:', response.data);
      return this.formatApiResponse(response.data, 'تم جلب بيانات المستخدم بنجاح');
    } catch (error) {
      console.error('🚨 خطأ في جلب بيانات المستخدم:', error);
      throw error;
    }
  }

  /**
   * 🔐 جلب صلاحيات مستخدم
   */
  async getUserPermissions(userId: string): Promise<ApiResponse<{ permissions: UserPermissions }>> {
    try {
      console.log('🔐 جاري جلب صلاحيات المستخدم...');
      
      const response = await apiClient.get<{ permissions: UserPermissions }>(`/users/${userId}/permissions`);
      
      console.log('✅ تم جلب الصلاحيات بنجاح:', response.data);
      return this.formatApiResponse(response.data, 'تم جلب الصلاحيات بنجاح');
    } catch (error) {
      console.error('🚨 خطأ في جلب الصلاحيات:', error);
      throw error;
    }
  }

  /**
   * ✏️ تحديث صلاحيات مستخدم
   */
  async updateUserPermissions(userId: string, permissions: Partial<UserPermissions>): Promise<ApiResponse<{ permissions: UserPermissions }>> {
    try {
      console.log('✏️ جاري تحديث صلاحيات المستخدم...');
      
      const response = await apiClient.patch<{ permissions: UserPermissions }>(`/users/${userId}/permissions`, permissions);
      
      console.log('✅ تم تحديث الصلاحيات بنجاح:', response.data);
      return this.formatApiResponse(response.data, 'تم تحديث الصلاحيات بنجاح');
    } catch (error) {
      console.error('🚨 خطأ في تحديث الصلاحيات:', error);
      throw error;
    }
  }

  /**
   * 📸 جلب معلومات المصور
   */
  async getPhotographerInfo(userId: string): Promise<ApiResponse<{ photographer: PhotographerInfo }>> {
    try {
      console.log('📸 جاري جلب معلومات المصور...');
      
      const response = await apiClient.get<{ photographer: PhotographerInfo }>(`/users/${userId}/photographer`);
      
      console.log('✅ تم جلب معلومات المصور بنجاح:', response.data);
      return this.formatApiResponse(response.data, 'تم جلب معلومات المصور بنجاح');
    } catch (error) {
      console.error('🚨 خطأ في جلب معلومات المصور:', error);
      throw error;
    }
  }

  /**
   * ✏️ تحديث معلومات المصور
   */
  async updatePhotographerInfo(userId: string, photographerData: Partial<PhotographerInfo>): Promise<ApiResponse<{ photographer: PhotographerInfo }>> {
    try {
      console.log('✏️ جاري تحديث معلومات المصور...');
      
      const response = await apiClient.patch<{ photographer: PhotographerInfo }>(`/users/${userId}/photographer`, photographerData);
      
      console.log('✅ تم تحديث معلومات المصور بنجاح:', response.data);
      return this.formatApiResponse(response.data, 'تم تحديث معلومات المصور بنجاح');
    } catch (error) {
      console.error('🚨 خطأ في تحديث معلومات المصور:', error);
      throw error;
    }
  }

  /**
   * 🎯 فحص صلاحية مستخدم لعملية معينة
   */
  hasPermission(userPermissions: UserPermissions, permission: keyof Omit<UserPermissions, 'id' | 'user_id' | 'role' | 'brand_access' | 'is_active' | 'granted_by' | 'granted_at'>): boolean {
    return userPermissions[permission] as boolean;
  }

  /**
   * 📸 فحص حالة توفر المصور
   */
  isPhotographerAvailable(photographerInfo: PhotographerInfo): boolean {
    return photographerInfo.is_available_for_work && photographerInfo.availability_status === 'available';
  }
}

/**
 * 👥 تصدير instance واحد
 */
export const userService = new UserService();

/**
 * 🎯 Helper functions للاستخدام السريع
 */
export const getUsers = (page?: number, limit?: number) => userService.getUsers(page, limit);
export const createUser = (userData: Partial<User>) => userService.createUser(userData);
export const updateUser = (userId: string, userData: Partial<User>) => userService.updateUser(userId, userData);
export const searchUsers = (filters: UserSearchFilters) => userService.searchUsers(filters);
export const getUserStats = () => userService.getUserStats();
export const getUserById = (userId: string) => userService.getUserById(userId);
export const getUserPermissions = (userId: string) => userService.getUserPermissions(userId);
export const updateUserPermissions = (userId: string, permissions: Partial<UserPermissions>) => userService.updateUserPermissions(userId, permissions);
export const getPhotographerInfo = (userId: string) => userService.getPhotographerInfo(userId);
export const updatePhotographerInfo = (userId: string, photographerData: Partial<PhotographerInfo>) => userService.updatePhotographerInfo(userId, photographerData);

export default userService; 