/**
 * 👥 Frontend User Repository - إدارة بيانات المستخدمين محلياً  
 * ================================================================
 * 
 * Repository Pattern متخصص للمستخدمين مع تكامل كامل مع Backend
 * يدعم التخزين المؤقت الذكي والعمليات المتقدمة للمستخدمين
 * 
 * 📅 تاريخ الإنشاء: يونيو 2025
 * 👨‍💻 المطور: علي جودت  
 * 🎯 الهدف: إدارة شاملة لبيانات المستخدمين في Frontend
 * 🔗 Backend Reference: UserRepository.ts (535 سطر)
 * 📋 Types Reference: users.ts (142 سطر)
 */

import { 
  User,                          // 👤 نوع المستخدم الأساسي - يحتوي على جميع بيانات المستخدم
  UserRole,                      // 👑 أدوار المستخدمين (photographer, brand_coordinator, marketing_coordinator, etc.)
  UserStatus,                    // 📊 حالات المستخدم (active, inactive, suspended, pending)
  ID,                           // 🆔 نوع المعرف الفريد (string)
  FrontendQueryOptions,         // 🔍 خيارات الاستعلام للفرونت إند (مع cache وsort وfilters)
  FrontendPaginatedResult,      // 📄 نتائج مقسمة لصفحات مع metadata (سيستخدم في getPaginatedUsers)
  AuthMethod,                   // 🔐 طرق المصادقة (email, phone, google) مع metadata
  RoleSelection                 // 🎭 طلبات اختيار الأدوار (pending, approved, rejected)
} from '@depth-studio/types';
import { FrontendBaseRepository } from './frontend-base-repository';
import { apiClient } from '../services/api/api-client';

/**
 * واجهة خيارات البحث المتقدم للمستخدمين
 */
interface UserSearchOptions extends FrontendQueryOptions {
  role?: UserRole;
  status?: UserStatus;
  verified?: boolean;
  online?: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

/**
 * واجهة إحصائيات المستخدمين
 */
interface UserStats {
  total: number;
  byRole: Record<UserRole, number>;
  byStatus: Record<UserStatus, number>;
  verified: number;
  unverified: number;
  online: number;
  offline: number;
  pendingRoleSelections: number;
}

/**
 * واجهة نتائج البحث النصي
 */
interface UserSearchResult {
  users: User[];
  total: number;
  query: string;
  searchFields: string[];
}

/**
 * 👥 Frontend User Repository
 * Repository متخصص لإدارة المستخدمين مع جميع العمليات المطلوبة
 */
export class FrontendUserRepository extends FrontendBaseRepository<User> {
  
  constructor() {
    super('users', '/api/users');
  }

  // ======================================
  // العمليات المتخصصة للمستخدمين
  // ======================================

  /**
   * 📧 البحث عن مستخدم بالبريد الإلكتروني
   * متوافق مع: UserRepository.findByEmail()
   */
  async findByEmail(email: string): Promise<User | null> {
    try {
      this.setLoading(true);
      
      // فحص التخزين المؤقت أولاً
      const cacheKey = this.generateCacheKey('findByEmail', { email });
      const cached = this.getCached(cacheKey);
      if (cached && cached.length > 0) {
        return cached[0];
      }

      const response = await apiClient.get<{ data: User }>(`${this.apiEndpoint}/email/${encodeURIComponent(email)}`);
      
      if (!response.data?.data) {
        return null;
      }

      // حفظ في التخزين المؤقت
      this.setCached(cacheKey, [response.data.data], 300); // 5 دقائق
      
      this.setSuccess(true);
      return response.data.data;
      
    } catch (error) {
      if (this.isNotFoundError(error)) {
        return null;
      }
      this.setError(`فشل في البحث عن المستخدم بالبريد الإلكتروني: ${error}`);
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * 📱 البحث عن مستخدم برقم الهاتف
   * متوافق مع: UserRepository.findByPhone()
   */
  async findByPhone(phone: string): Promise<User | null> {
    try {
      this.setLoading(true);
      
      // فحص التخزين المؤقت
      const cacheKey = this.generateCacheKey('findByPhone', { phone });
      const cached = this.getCached(cacheKey);
      if (cached && cached.length > 0) {
        return cached[0];
      }

      const response = await apiClient.get<{ data: User }>(`${this.apiEndpoint}/phone/${encodeURIComponent(phone)}`);
      
      if (!response.data?.data) {
        return null;
      }

      // حفظ في التخزين المؤقت
      this.setCached(cacheKey, [response.data.data], 300);
      
      this.setSuccess(true);
      return response.data.data;
      
    } catch (error) {
      if (this.isNotFoundError(error)) {
        return null;
      }
      this.setError(`فشل في البحث عن المستخدم برقم الهاتف: ${error}`);
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * 🔥 البحث عن مستخدم بـ Firebase UID
   * متوافق مع: UserRepository.findByFirebaseUid()
   */
  async findByFirebaseUid(firebaseUid: string): Promise<User | null> {
    try {
      this.setLoading(true);
      
      // فحص التخزين المؤقت
      const cacheKey = this.generateCacheKey('findByFirebaseUid', { firebaseUid });
      const cached = this.getCached(cacheKey);
      if (cached && cached.length > 0) {
        return cached[0];
      }

      const response = await apiClient.get<{ data: User }>(`${this.apiEndpoint}/firebase-uid/${firebaseUid}`);
      
      if (!response.data?.data) {
        return null;
      }

      // حفظ في التخزين المؤقت (مدة أطول للمصادقة)
      this.setCached(cacheKey, [response.data.data], 600); // 10 دقائق
      
      this.setSuccess(true);
      return response.data.data;
      
    } catch (error) {
      if (this.isNotFoundError(error)) {
        return null;
      }
      this.setError(`فشل في البحث عن المستخدم بـ Firebase UID: ${error}`);
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * 👑 البحث عن المستخدمين حسب الدور
   * متوافق مع: UserRepository.findByRole()
   */
  async findByRole(role: UserRole, options: UserSearchOptions = {}): Promise<User[]> {
    try {
      this.setLoading(true);
      
      const cacheKey = this.generateCacheKey('findByRole', { role, ...options });
      
      // فحص التخزين المؤقت
      if (options.useCache !== false) {
        const cached = this.getCached(cacheKey);
        if (cached) {
          this.setSuccess(true);
          return cached;
        }
      }

      const queryParams = new URLSearchParams({
        role,
        ...this.convertOptionsToParams(options)
      });

      const response = await apiClient.get<{ data: User[] }>(`${this.apiEndpoint}/role/${role}?${queryParams}`);
      
      if (!response.data?.data) {
        return [];
      }

      // حفظ في التخزين المؤقت
      this.setCached(cacheKey, response.data.data, 180); // 3 دقائق
      
      this.setSuccess(true);
      return response.data.data;
      
    } catch (error) {
      this.setError(`فشل في البحث عن المستخدمين حسب الدور: ${error}`);
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * 📊 البحث عن المستخدمين حسب الحالة
   * متوافق مع: UserRepository.findByStatus()
   */
  async findByStatus(status: UserStatus, options: UserSearchOptions = {}): Promise<User[]> {
    try {
      this.setLoading(true);
      
      const cacheKey = this.generateCacheKey('findByStatus', { status, ...options });
      
      // فحص التخزين المؤقت
      if (options.useCache !== false) {
        const cached = this.getCached(cacheKey);
        if (cached) {
          this.setSuccess(true);
          return cached;
        }
      }

      const queryParams = new URLSearchParams({
        status,
        ...this.convertOptionsToParams(options)
      });

      const response = await apiClient.get<{ data: User[] }>(`${this.apiEndpoint}/status/${status}?${queryParams}`);
      
      if (!response.data?.data) {
        return [];
      }

      // حفظ في التخزين المؤقت
      this.setCached(cacheKey, response.data.data, 120); // دقيقتان
      
      this.setSuccess(true);
      return response.data.data;
      
    } catch (error) {
      this.setError(`فشل في البحث عن المستخدمين حسب الحالة: ${error}`);
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * 🔄 تحديث حالة المستخدم
   * متوافق مع: UserRepository.updateStatus()
   */
  async updateStatus(userId: ID, status: UserStatus): Promise<User> {
    try {
      this.setLoading(true);
      
      const response = await apiClient.patch<{ data: User }>(`${this.apiEndpoint}/${userId}/status`, { status });
      
      if (!response.data?.data) {
        throw new Error('لم يتم الحصول على البيانات المحدثة من الخادم');
      }

      // تحديث التخزين المؤقت
      this.updateCachedItem(userId, response.data.data);
      this.invalidateListCaches(); // إلغاء قوائم المستخدمين لإعادة تحميلها
      
      this.setSuccess(true);
      return response.data.data;
      
    } catch (error) {
      this.setError(`فشل في تحديث حالة المستخدم: ${error}`);
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * 👑 تحديث دور المستخدم  
   * متوافق مع: UserRepository.updateRole()
   */
  async updateRole(userId: ID, role: UserRole): Promise<User> {
    try {
      this.setLoading(true);
      
      const response = await apiClient.patch<{ data: User }>(`${this.apiEndpoint}/${userId}/role`, { role });
      
      if (!response.data?.data) {
        throw new Error('لم يتم الحصول على البيانات المحدثة من الخادم');
      }

      // تحديث التخزين المؤقت
      this.updateCachedItem(userId, response.data.data);
      this.invalidateListCaches(); // إلغاء قوائم المستخدمين
      
      this.setSuccess(true);
      return response.data.data;
      
    } catch (error) {
      this.setError(`فشل في تحديث دور المستخدم: ${error}`);
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * 🟢 تحديث حالة النشاط (أونلاين/أوفلاين)
   * متوافق مع: UserRepository.updateOnlineStatus()
   */
  async updateOnlineStatus(userId: ID, isOnline: boolean): Promise<User> {
    try {
      this.setLoading(true);
      
      const response = await apiClient.patch<{ data: User }>(`${this.apiEndpoint}/${userId}/online-status`, { 
        is_online: isOnline 
      });
      
      if (!response.data?.data) {
        throw new Error('لم يتم الحصول على البيانات المحدثة من الخادم');
      }

      // تحديث التخزين المؤقت
      this.updateCachedItem(userId, response.data.data);
      
      this.setSuccess(true);
      return response.data.data;
      
    } catch (error) {
      this.setError(`فشل في تحديث حالة النشاط: ${error}`);
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * 🔍 البحث النصي المتقدم في المستخدمين
   * متوافق مع: UserRepository.searchUsers()
   */
  async searchUsers(searchTerm: string, options: UserSearchOptions = {}): Promise<UserSearchResult> {
    try {
      this.setLoading(true);
      
      if (!searchTerm.trim()) {
        return {
          users: [],
          total: 0,
          query: searchTerm,
          searchFields: []
        };
      }

      const cacheKey = this.generateCacheKey('searchUsers', { searchTerm, ...options });
      
      // فحص التخزين المؤقت (مدة قصيرة للبحث)
      if (options.useCache !== false) {
        const cached = this.getCached(cacheKey);
        if (cached) {
          this.setSuccess(true);
          return {
            users: cached,
            total: cached.length,
            query: searchTerm,
            searchFields: ['full_name', 'email', 'display_name']
          };
        }
      }

      const queryParams = new URLSearchParams({
        q: searchTerm,
        ...this.convertOptionsToParams(options)
      });

      const response = await apiClient.get<{ 
        data: User[]; 
        total: number; 
        searchFields: string[] 
      }>(`${this.apiEndpoint}/search?${queryParams}`);
      
      if (!response.data?.data) {
        return {
          users: [],
          total: 0,
          query: searchTerm,
          searchFields: []
        };
      }

      // حفظ في التخزين المؤقت (مدة قصيرة للبحث)
      this.setCached(cacheKey, response.data.data, 60); // دقيقة واحدة
      
      this.setSuccess(true);
      return {
        users: response.data.data,
        total: response.data.total || response.data.data.length,
        query: searchTerm,
        searchFields: response.data.searchFields || ['full_name', 'email']
      };
      
    } catch (error) {
      this.setError(`فشل في البحث في المستخدمين: ${error}`);
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  // ======================================
  // العمليات المتقدمة للمصادقة والأدوار
  // ======================================

  /**
   * 🔐 الحصول على طرق المصادقة للمستخدم
   * متوافق مع: UserRepository.getUserAuthMethods()
   */
  async getUserAuthMethods(userId: ID): Promise<AuthMethod[]> {
    try {
      this.setLoading(true);
      
      const cacheKey = this.generateCacheKey('getUserAuthMethods', { userId });
      const cached = this.getCached(cacheKey);
      if (cached && cached.length > 0) {
        // AuthMethod[] محفوظة في cache مختلف
        const authMethodsCache = this.cache.get(`auth_methods_${userId}`);
        if (authMethodsCache && !this.isCacheExpired(authMethodsCache)) {
          return authMethodsCache.data as unknown as AuthMethod[];
        }
      }

      const response = await apiClient.get<{ data: AuthMethod[] }>(`${this.apiEndpoint}/${userId}/auth-methods`);
      
      if (!response.data?.data) {
        return [];
      }

      // حفظ طرق المصادقة في cache منفصل
      this.cache.set(`auth_methods_${userId}`, {
        data: response.data.data as unknown as User[],
        timestamp: new Date(),
        expiry: 300, // 5 دقائق
        key: `auth_methods_${userId}`
      });
      
      this.setSuccess(true);
      return response.data.data;
      
    } catch (error) {
      this.setError(`فشل في الحصول على طرق المصادقة: ${error}`);
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * 🎭 الحصول على طلبات اختيار الأدوار المنتظرة
   * متوافق مع: UserRepository.findPendingRoleSelections()
   */
  async getPendingRoleSelections(options: FrontendQueryOptions = {}): Promise<RoleSelection[]> {
    try {
      this.setLoading(true);
      
      // فحص التخزين المؤقت
      if (options.useCache !== false) {
        const roleSelectionsCache = this.cache.get(`role_selections_pending`);
        if (roleSelectionsCache && !this.isCacheExpired(roleSelectionsCache)) {
          return roleSelectionsCache.data as unknown as RoleSelection[];
        }
      }

      const queryParams = new URLSearchParams(this.convertOptionsToParams(options));

      const response = await apiClient.get<{ data: RoleSelection[] }>(`/api/roles/pending-applications?${queryParams}`);
      
      if (!response.data?.data) {
        return [];
      }

      // حفظ في cache منفصل لطلبات الأدوار
      this.cache.set(`role_selections_pending`, {
        data: response.data.data as unknown as User[],
        timestamp: new Date(),
        expiry: 120, // دقيقتان
        key: `role_selections_pending`
      });
      
      this.setSuccess(true);
      return response.data.data;
      
    } catch (error) {
      this.setError(`فشل في الحصول على طلبات الأدوار المنتظرة: ${error}`);
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * ✅ الموافقة على طلب اختيار دور
   * متوافق مع: UserRepository.approveRoleSelection()
   */
  async approveRoleSelection(
    roleSelectionId: ID, 
    approvedBy: ID, 
    adminNotes?: string
  ): Promise<RoleSelection> {
    try {
      this.setLoading(true);
      
      const response = await apiClient.patch<{ data: RoleSelection }>(`/api/roles/applications/${roleSelectionId}/approve`, {
        approved_by: approvedBy,
        admin_notes: adminNotes
      });
      
      if (!response.data?.data) {
        throw new Error('لم يتم الحصول على البيانات المحدثة من الخادم');
      }

      // إلغاء cache طلبات الأدوار لإعادة تحميلها
      this.cache.delete('role_selections_pending');
      this.invalidateListCaches();
      
      this.setSuccess(true);
      return response.data.data;
      
    } catch (error) {
      this.setError(`فشل في الموافقة على طلب الدور: ${error}`);
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * ❌ رفض طلب اختيار دور
   * متوافق مع: UserRepository.rejectRoleSelection()
   */
  async rejectRoleSelection(
    roleSelectionId: ID, 
    rejectedBy: ID, 
    rejectionReason: string, 
    adminNotes?: string
  ): Promise<RoleSelection> {
    try {
      this.setLoading(true);
      
      const response = await apiClient.patch<{ data: RoleSelection }>(`/api/roles/applications/${roleSelectionId}/reject`, {
        rejected_by: rejectedBy,
        rejection_reason: rejectionReason,
        admin_notes: adminNotes
      });
      
      if (!response.data?.data) {
        throw new Error('لم يتم الحصول على البيانات المحدثة من الخادم');
      }

      // إلغاء cache طلبات الأدوار
      this.cache.delete('role_selections_pending');
      this.invalidateListCaches();
      
      this.setSuccess(true);
      return response.data.data;
      
    } catch (error) {
      this.setError(`فشل في رفض طلب الدور: ${error}`);
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  // ======================================
  // العمليات الإحصائية والتحليلية
  // ======================================

  /**
   * 📊 الحصول على إحصائيات المستخدمين
   */
  async getUserStats(): Promise<UserStats> {
    try {
      this.setLoading(true);
      
      const cacheKey = 'user_stats';
      const statsCache = this.cache.get(cacheKey);
      if (statsCache && !this.isCacheExpired(statsCache)) {
        this.setSuccess(true);
        return statsCache.data as unknown as UserStats;
      }

      const response = await apiClient.get<{ data: UserStats }>(`${this.apiEndpoint}/stats`);
      
      if (!response.data?.data) {
        throw new Error('لم يتم الحصول على الإحصائيات من الخادم');
      }

      // حفظ الإحصائيات في cache (مدة أطول)
      this.cache.set(cacheKey, {
        data: response.data.data as unknown as User[],
        timestamp: new Date(),
        expiry: 600, // 10 دقائق
        key: cacheKey
      });
      
      this.setSuccess(true);
      return response.data.data;
      
    } catch (error) {
      this.setError(`فشل في الحصول على إحصائيات المستخدمين: ${error}`);
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * 👥 الحصول على المستخدمين النشطين (أونلاين)
   */
  async getOnlineUsers(options: FrontendQueryOptions = {}): Promise<User[]> {
    return this.findAll({
      ...options,
      where: [
        ...(options.where || []),
        { field: 'is_online', operator: '==', value: true }
      ]
    });
  }

  /**
   * ✅ الحصول على المستخدمين المعتمدين
   */
  async getVerifiedUsers(options: FrontendQueryOptions = {}): Promise<User[]> {
    return this.findAll({
      ...options,
      where: [
        ...(options.where || []),
        { field: 'is_verified', operator: '==', value: true }
      ]
    });
  }

  /**
   * 📄 الحصول على المستخدمين مع صفحات
   * يستخدم FrontendPaginatedResult<User> لإرجاع نتائج مقسمة
   * 
   * فائدة FrontendPaginatedResult<User>:
   * - يحتوي على: data (المستخدمين), total, page, limit, hasNext, hasPrev
   * - يُستخدم في الجداول المقسمة لصفحات مع metadata كامل
   * - يحسن الأداء عند التعامل مع آلاف المستخدمين
   */
  async getPaginatedUsers(
    page: number = 1, 
    limit: number = 10, 
    options: Omit<FrontendQueryOptions, 'limit' | 'offset'> = {}
  ): Promise<FrontendPaginatedResult<User>> {
    return this.findPaginated(page, limit, options);
  }

  // ======================================
  // الأدوات المساعدة الخاصة بالمستخدمين
  // ======================================

  /**
   * تحويل خيارات البحث إلى query parameters
   */
  private convertOptionsToParams(options: UserSearchOptions): Record<string, string> {
    const params: Record<string, string> = {};
    
    if (options.limit) params.limit = options.limit.toString();
    if (options.offset) params.offset = options.offset.toString();
    if (options.role) params.role = options.role;
    if (options.status) params.status = options.status;
    if (options.verified !== undefined) params.verified = options.verified.toString();
    if (options.online !== undefined) params.online = options.online.toString();
    
    if (options.orderBy) {
      options.orderBy.forEach((order, index) => {
        params[`orderBy[${index}][field]`] = order.field;
        params[`orderBy[${index}][direction]`] = order.direction;
      });
    }
    
    if (options.where) {
      options.where.forEach((condition, index) => {
        params[`where[${index}][field]`] = condition.field;
        params[`where[${index}][operator]`] = condition.operator;
        params[`where[${index}][value]`] = String(condition.value);
      });
    }
    
    if (options.dateRange) {
      params.startDate = options.dateRange.start.toISOString();
      params.endDate = options.dateRange.end.toISOString();
    }
    
    return params;
  }

  /**
   * إلغاء cache خاص بالمستخدمين
   */
  async clearUserCache(): Promise<void> {
    // إلغاء cache الأساسي
    await this.clearCache();
    
    // إلغاء cache المتخصص للمستخدمين
    Array.from(this.cache.keys()).forEach(key => {
      if (key.includes('auth_methods_') || 
          key.includes('role_selections_') || 
          key.includes('user_stats')) {
        this.cache.delete(key);
      }
    });
  }

  /**
   * تحديث cache المستخدمين
   */
  async refreshUserCache(): Promise<void> {
    await this.clearUserCache();
    await this.refreshCache();
  }
}

// ======================================
// تصدير Instance افتراضي للاستخدام المباشر
// ======================================

/**
 * مثيل افتراضي من FrontendUserRepository للاستخدام في التطبيق
 */
export const userRepository = new FrontendUserRepository();

/**
 * تصدير النوع للاستخدام في أماكن أخرى
 */
export type { UserSearchOptions, UserStats, UserSearchResult }; 