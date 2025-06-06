/**
 * 👥 User Repository
 * 
 * تطوير علي جودت - Depth Studio
 * آخر تحديث: يونيو 2025
 * 
 * @description Repository pattern for user operations
 * @version 1.0.0
 */

import { BaseRepository, QueryFilter, BaseEntity } from './BaseRepository';
import { User, UserRole, UserStatus } from '../../types/types';
import { Timestamp } from 'firebase-admin/firestore';

/**
 * User entity interface extending BaseEntity
 */
export interface UserEntity extends BaseEntity {
  email: string;
  phone?: string;
  display_name: string;
  first_name: string;
  last_name: string;
  profile_photo_url?: string;
  primary_role: UserRole;
  status?: UserStatus;
  is_active: boolean;
  is_verified: boolean;
  last_login?: Timestamp;
  bio?: string;
  location?: string;
  timezone: string;
  language: string;
  firebase_uid: string;
  auth_providers: string[];
  total_login_count: number;
  last_seen?: Timestamp;
  is_online: boolean;
  assigned_brands: string[];
  preferences: Record<string, any>;
}

/**
 * User search filters interface
 */
export interface UserSearchFilters {
  role?: UserRole;
  status?: UserStatus;
  is_active?: boolean;
  brand_id?: string;
  created_after?: string;
  created_before?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

/**
 * User Repository Class
 */
export class UserRepository extends BaseRepository<UserEntity> {
  
  constructor() {
    super('users');
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<UserEntity | null> {
    const filters: QueryFilter[] = [
      { field: 'email', operator: '==', value: email }
    ];

    return await this.findOne({ filters });
  }

  /**
   * Find user by Firebase UID
   */
  async findByFirebaseUID(firebase_uid: string): Promise<UserEntity | null> {
    const filters: QueryFilter[] = [
      { field: 'firebase_uid', operator: '==', value: firebase_uid }
    ];

    return await this.findOne({ filters });
  }

  /**
   * Find users by role
   */
  async findByRole(role: UserRole): Promise<UserEntity[]> {
    const filters: QueryFilter[] = [
      { field: 'primary_role', operator: '==', value: role }
    ];

    return await this.findAll({ filters });
  }

  /**
   * Find active users
   */
  async findActiveUsers(): Promise<UserEntity[]> {
    const filters: QueryFilter[] = [
      { field: 'is_active', operator: '==', value: true }
    ];

    return await this.findAll({ 
      filters,
      orderBy: [{ field: 'last_seen', direction: 'desc' }]
    });
  }

  /**
   * Find users by brand
   */
  async findByBrand(brand_id: string): Promise<UserEntity[]> {
    const filters: QueryFilter[] = [
      { field: 'assigned_brands', operator: 'array-contains', value: brand_id }
    ];

    return await this.findAll({ filters });
  }

  /**
   * Search users with filters and pagination
   */
  async searchUsers(searchFilters: UserSearchFilters, page: number = 1, limit: number = 20): Promise<any> {
    const filters: QueryFilter[] = [];

    // Apply filters
    if (searchFilters.role) {
      filters.push({ field: 'primary_role', operator: '==', value: searchFilters.role });
    }

    if (searchFilters.status) {
      filters.push({ field: 'status', operator: '==', value: searchFilters.status });
    }

    if (searchFilters.is_active !== undefined) {
      filters.push({ field: 'is_active', operator: '==', value: searchFilters.is_active });
    }

    if (searchFilters.brand_id) {
      filters.push({ field: 'assigned_brands', operator: 'array-contains', value: searchFilters.brand_id });
    }

    if (searchFilters.created_after) {
      filters.push({ field: 'created_at', operator: '>=', value: new Date(searchFilters.created_after) });
    }

    if (searchFilters.created_before) {
      filters.push({ field: 'created_at', operator: '<=', value: new Date(searchFilters.created_before) });
    }

    // Apply ordering
    const orderBy = [{
      field: searchFilters.sort_by || 'created_at',
      direction: (searchFilters.sort_order === 'asc' ? 'asc' : 'desc') as 'asc' | 'desc'
    }];

    return await this.findWithPagination(page, limit, { filters, orderBy });
  }

  /**
   * Search users by text (name, email, phone)
   */
  async searchByText(searchTerm: string, searchFilters?: UserSearchFilters): Promise<UserEntity[]> {
    // للبحث النصي، نحتاج جلب جميع المستخدمين وفلترتهم محلياً
    // في الإنتاج، استخدم Elasticsearch أو Algolia
    
    const filters: QueryFilter[] = [];
    
    // Apply additional filters if provided
    if (searchFilters?.role) {
      filters.push({ field: 'primary_role', operator: '==', value: searchFilters.role });
    }

    if (searchFilters?.is_active !== undefined) {
      filters.push({ field: 'is_active', operator: '==', value: searchFilters.is_active });
    }

    const allUsers = await this.findAll({ filters });
    const searchTermLower = searchTerm.toLowerCase();

    return allUsers.filter(user => 
      user.first_name.toLowerCase().includes(searchTermLower) ||
      user.last_name.toLowerCase().includes(searchTermLower) ||
      user.email.toLowerCase().includes(searchTermLower) ||
      (user.phone && user.phone.includes(searchTerm))
    );
  }

  /**
   * Update user last seen timestamp
   */
  async updateLastSeen(userId: string): Promise<UserEntity | null> {
    return await this.update(userId, {
      last_seen: Timestamp.now(),
      is_online: true
    });
  }

  /**
   * Set user offline
   */
  async setUserOffline(userId: string): Promise<UserEntity | null> {
    return await this.update(userId, {
      is_online: false
    });
  }

  /**
   * Update user login count
   */
  async incrementLoginCount(userId: string): Promise<UserEntity | null> {
    const user = await this.findById(userId);
    if (!user) return null;

    return await this.update(userId, {
      total_login_count: user.total_login_count + 1,
      last_login: Timestamp.now(),
      last_seen: Timestamp.now(),
      is_online: true
    });
  }

  /**
   * Assign brand to user
   */
  async assignBrand(userId: string, brandId: string): Promise<UserEntity | null> {
    const user = await this.findById(userId);
    if (!user) return null;

    const assignedBrands = [...user.assigned_brands];
    if (!assignedBrands.includes(brandId)) {
      assignedBrands.push(brandId);
    }

    return await this.update(userId, {
      assigned_brands: assignedBrands
    });
  }

  /**
   * Remove brand from user
   */
  async removeBrand(userId: string, brandId: string): Promise<UserEntity | null> {
    const user = await this.findById(userId);
    if (!user) return null;

    const assignedBrands = user.assigned_brands.filter(id => id !== brandId);

    return await this.update(userId, {
      assigned_brands: assignedBrands
    });
  }

  /**
   * Update user status
   */
  async updateStatus(userId: string, status: UserStatus, updatedBy?: string): Promise<UserEntity | null> {
    return await this.update(userId, { status }, updatedBy);
  }

  /**
   * Activate user
   */
  async activateUser(userId: string, updatedBy?: string): Promise<UserEntity | null> {
    return await this.update(userId, {
      is_active: true,
      status: 'active'
    }, updatedBy);
  }

  /**
   * Deactivate user
   */
  async deactivateUser(userId: string, updatedBy?: string): Promise<UserEntity | null> {
    return await this.update(userId, {
      is_active: false,
      status: 'suspended'
    }, updatedBy);
  }

  /**
   * Get user statistics
   */
  async getUserStats(userId: string): Promise<any> {
    const user = await this.findById(userId);
    if (!user) return null;

    // يمكن إضافة إحصائيات أكثر تفصيلاً هنا
    return {
      total_login_count: user.total_login_count,
      last_login: user.last_login,
      last_seen: user.last_seen,
      is_online: user.is_online,
      assigned_brands_count: user.assigned_brands.length,
      account_age_days: user.created_at ? 
        Math.floor((Date.now() - user.created_at.toMillis()) / (1000 * 60 * 60 * 24)) : 0
    };
  }

  /**
   * Check if email exists
   */
  async emailExists(email: string, excludeUserId?: string): Promise<boolean> {
    const filters: QueryFilter[] = [
      { field: 'email', operator: '==', value: email }
    ];

    const users = await this.findAll({ filters });
    
    if (excludeUserId) {
      return users.some(user => user.id !== excludeUserId);
    }
    
    return users.length > 0;
  }

  /**
   * Get users requiring approval
   */
  async getUsersPendingApproval(): Promise<UserEntity[]> {
    const filters: QueryFilter[] = [
      { field: 'status', operator: '==', value: 'pending_approval' }
    ];

    return await this.findAll({ 
      filters,
      orderBy: [{ field: 'created_at', direction: 'asc' }]
    });
  }
} 