/**
 * 🏛️ Frontend Base Repository - نمط Repository للفرونت إند
 * =========================================================
 * 
 * Repository Pattern محكم الأنواع مع تكامل API client
 * يدعم التخزين المؤقت الذكي والعمليات غير المتصلة
 * 
 * 📅 تاريخ الإنشاء: يونيو 2025
 * 👨‍💻 المطور: علي جودت
 * 🎯 الهدف: نظام Repository موحد للفرونت إند مع Backend
 */

import { 
  BaseEntity, 
  BaseRepository, 
  ID, 
  FrontendQueryOptions, 
  FrontendPaginatedResult,
  ApiOperationState 
} from '@depth-studio/types';
import { apiClient } from '../services/api/api-client';

/**
 * واجهة Cache Store للتخزين المؤقت
 */
interface CacheStore<T> {
  data: T[];
  timestamp: Date;
  expiry: number;
  key: string;
}

/**
 * واجهة استجابة API مع البيانات
 */
interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

/**
 * 🏛️ Frontend Base Repository Implementation
 * تنفيذ Repository Pattern للفرونت إند مع تكامل كامل
 */
export class FrontendBaseRepository<T extends BaseEntity> extends BaseRepository<T> {
  protected collectionName: string = '';
  protected apiEndpoint: string = '';
  
  // ======================================
  // إدارة التخزين المؤقت
  // ======================================
  
  protected cache = new Map<string, CacheStore<T>>();
  private operationState: ApiOperationState = {
    loading: false,
    error: null,
    success: true
  };

  constructor(collectionName: string, apiEndpoint: string) {
    super();
    this.collectionName = collectionName;
    this.apiEndpoint = apiEndpoint;
  }

  // ======================================
  // العمليات الأساسية (CRUD)
  // ======================================

  /**
   * 📝 إنشاء كيان جديد
   */
  async create(entity: Omit<T, 'id' | 'created_at' | 'updated_at'>): Promise<T> {
    try {
      this.setLoading(true);
      
      const response = await apiClient.post<ApiResponse<T>>(this.apiEndpoint, entity);
      
      if (!response.data?.data) {
        throw new Error('لم يتم الحصول على البيانات من الخادم');
      }
      
      // تحديث التخزين المؤقت
      this.invalidateCache();
      
      this.setSuccess(true);
      return response.data.data;
      
    } catch (error) {
      this.setError(`فشل في إنشاء ${this.collectionName}: ${error}`);
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * 🔍 البحث عن كيان بالمعرف
   */
  async findById(id: ID): Promise<T | null> {
    try {
      this.setLoading(true);
      
      // فحص التخزين المؤقت أولاً
      const cachedItem = this.getCachedItem(id);
      if (cachedItem) {
        this.setSuccess(true);
        return cachedItem;
      }
      
      const response = await apiClient.get<ApiResponse<T>>(`${this.apiEndpoint}/${id}`);
      
      if (!response.data?.data) {
        return null;
      }
      
      // حفظ في التخزين المؤقت
      this.cacheItem(response.data.data);
      
      this.setSuccess(true);
      return response.data.data;
      
    } catch (error) {
      if (this.isNotFoundError(error)) {
        return null;
      }
      this.setError(`فشل في العثور على ${this.collectionName}: ${error}`);
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * ✏️ تحديث كيان موجود
   */
  async update(id: ID, updates: Partial<Omit<T, 'id' | 'created_at'>>): Promise<T> {
    try {
      this.setLoading(true);
      
      const response = await apiClient.put<ApiResponse<T>>(`${this.apiEndpoint}/${id}`, updates);
      
      if (!response.data?.data) {
        throw new Error('لم يتم الحصول على البيانات المحدثة من الخادم');
      }
      
      // تحديث التخزين المؤقت
      this.updateCachedItem(id, response.data.data);
      
      this.setSuccess(true);
      return response.data.data;
      
    } catch (error) {
      this.setError(`فشل في تحديث ${this.collectionName}: ${error}`);
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * 🗑️ حذف كيان
   */
  async delete(id: ID): Promise<void> {
    try {
      this.setLoading(true);
      
      await apiClient.delete(`${this.apiEndpoint}/${id}`);
      
      // إزالة من التخزين المؤقت
      this.removeCachedItem(id);
      
      this.setSuccess(true);
      
    } catch (error) {
      this.setError(`فشل في حذف ${this.collectionName}: ${error}`);
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * 📋 البحث عن جميع الكيانات
   */
  async findAll(options: FrontendQueryOptions = {}): Promise<T[]> {
    try {
      this.setLoading(true);
      
      const cacheKey = this.generateCacheKey('findAll', options);
      
      // فحص التخزين المؤقت
      if (options.useCache !== false) {
        const cached = this.getCached(cacheKey);
        if (cached) {
          this.setSuccess(true);
          return cached;
        }
      }
      
      const response = await apiClient.post<ApiResponse<T[]>>(`${this.apiEndpoint}/search`, {
        ...options,
        // تحويل خيارات Frontend إلى Backend format
        filters: options.where,
        sorting: options.orderBy
      });
      
      const data = response.data?.data || [];
      
      // حفظ في التخزين المؤقت
      if (options.useCache !== false) {
        this.setCached(cacheKey, data, options.cacheExpiry || 300); // 5 دقائق افتراضياً
      }
      
      this.setSuccess(true);
      return data;
      
    } catch (error) {
      this.setError(`فشل في جلب بيانات ${this.collectionName}: ${error}`);
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  // ======================================
  // العمليات المتقدمة
  // ======================================

  /**
   * 📄 البحث مع صفحات
   */
  async findPaginated(
    page: number = 1,
    limit: number = 10,
    options: Omit<FrontendQueryOptions, 'limit' | 'offset'> = {}
  ): Promise<FrontendPaginatedResult<T>> {
    try {
      this.setLoading(true);
      
      const offset = (page - 1) * limit;
      const cacheKey = this.generateCacheKey('findPaginated', { ...options, page, limit });
      
      // فحص التخزين المؤقت
      if (options.useCache !== false) {
        const cached = this.getCachedPaginated(cacheKey);
        if (cached) {
          this.setSuccess(true);
          return cached;
        }
      }
      
      // طلب البيانات من API
      const [dataResponse, countResponse] = await Promise.all([
        apiClient.post<ApiResponse<T[]>>(`${this.apiEndpoint}/search`, {
          ...options,
          limit,
          offset,
          filters: options.where,
          sorting: options.orderBy
        }),
        apiClient.post<ApiResponse<{ count: number }>>(`${this.apiEndpoint}/count`, {
          filters: options.where
        })
      ]);
      
      const data = dataResponse.data?.data || [];
      const total = countResponse.data?.data?.count || 0;
      
      const result: FrontendPaginatedResult<T> = {
        data,
        total,
        page,
        limit,
        hasNext: offset + limit < total,
        hasPrev: page > 1,
        cached: false,
        cacheTimestamp: new Date()
      };
      
      // حفظ في التخزين المؤقت
      if (options.useCache !== false) {
        this.setCachedPaginated(cacheKey, result, options.cacheExpiry || 300);
      }
      
      this.setSuccess(true);
      return result;
      
    } catch (error) {
      this.setError(`فشل في جلب صفحات ${this.collectionName}: ${error}`);
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * 🔢 عدّ الكيانات
   */
  async count(options: Omit<FrontendQueryOptions, 'limit' | 'offset'> = {}): Promise<number> {
    try {
      this.setLoading(true);
      
      const response = await apiClient.post<ApiResponse<{ count: number }>>(`${this.apiEndpoint}/count`, {
        filters: options.where
      });
      
      this.setSuccess(true);
      return response.data?.data?.count || 0;
      
    } catch (error) {
      this.setError(`فشل في عدّ ${this.collectionName}: ${error}`);
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * 🔍 البحث مع نص
   */
  async search(query: string, options: FrontendQueryOptions = {}): Promise<T[]> {
    try {
      this.setLoading(true);
      
      const response = await apiClient.post<ApiResponse<T[]>>(`${this.apiEndpoint}/search`, {
        ...options,
        query,
        filters: options.where,
        sorting: options.orderBy
      });
      
      this.setSuccess(true);
      return response.data?.data || [];
      
    } catch (error) {
      this.setError(`فشل في البحث في ${this.collectionName}: ${error}`);
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  // ======================================
  // إدارة التخزين المؤقت
  // ======================================

  /**
   * 🗑️ مسح التخزين المؤقت
   */
  async clearCache(): Promise<void> {
    this.cache.clear();
  }

  /**
   * 🔄 تحديث التخزين المؤقت
   */
  async refreshCache(): Promise<void> {
    // إزالة البيانات المنتهية الصلاحية - استخدام Array.from لتجنب مشكلة iterator
    const cacheEntries = Array.from(this.cache.entries());
    const now = new Date();
    
    for (const [key, cached] of cacheEntries) {
      if (now.getTime() - cached.timestamp.getTime() > cached.expiry * 1000) {
        this.cache.delete(key);
      }
    }
  }

  // ======================================
  // حالة العمليات
  // ======================================

  /**
   * 📊 الحصول على حالة العملية
   */
  getOperationState(): ApiOperationState {
    return { ...this.operationState };
  }

  // ======================================
  // أدوات التخزين المؤقت الداخلية
  // ======================================

  protected getCachedItem(id: ID): T | null {
    const cached = this.cache.get(`item_${id}`);
    if (!cached || this.isCacheExpired(cached)) {
      return null;
    }
    const item = cached.data[0];
    return item || null;
  }

  protected cacheItem(item: T): void {
    this.cache.set(`item_${item.id}`, {
      data: [item],
      timestamp: new Date(),
      expiry: 300, // 5 دقائق
      key: `item_${item.id}`
    });
  }

  protected updateCachedItem(id: ID, item: T): void {
    this.cacheItem(item);
    this.invalidateListCaches();
  }

  protected removeCachedItem(id: ID): void {
    this.cache.delete(`item_${id}`);
    this.invalidateListCaches();
  }

  protected getCached(key: string): T[] | null {
    const cached = this.cache.get(key);
    if (!cached || this.isCacheExpired(cached)) {
      return null;
    }
    return cached.data;
  }

  protected setCached(key: string, data: T[], expiry: number): void {
    this.cache.set(key, {
      data,
      timestamp: new Date(),
      expiry,
      key
    });
  }

  protected getCachedPaginated(key: string): FrontendPaginatedResult<T> | null {
    const cached = this.cache.get(key);
    if (!cached || this.isCacheExpired(cached)) {
      return null;
    }
    const result = cached.data[0] as unknown as FrontendPaginatedResult<T>;
    return result || null;
  }

  protected setCachedPaginated(key: string, data: FrontendPaginatedResult<T>, expiry: number): void {
    this.cache.set(key, {
      data: [data] as unknown as T[],
      timestamp: new Date(),
      expiry,
      key
    });
  }

  protected generateCacheKey(operation: string, params: Record<string, unknown> | FrontendQueryOptions): string {
    return `${operation}_${JSON.stringify(params)}`;
  }

  protected isCacheExpired(cached: CacheStore<T>): boolean {
    const now = new Date();
    return now.getTime() - cached.timestamp.getTime() > cached.expiry * 1000;
  }

  protected invalidateCache(): void {
    this.cache.clear();
  }

  protected invalidateListCaches(): void {
    // حذف caches التي تحتوي على قوائم فقط - استخدام Array.from لتجنب مشكلة iterator
    const cacheEntries = Array.from(this.cache.entries());
    for (const [key] of cacheEntries) {
      if (key.includes('findAll') || key.includes('findPaginated')) {
        this.cache.delete(key);
      }
    }
  }

  // ======================================
  // إدارة حالة العمليات
  // ======================================

  protected setLoading(loading: boolean): void {
    this.operationState.loading = loading;
    if (loading) {
      this.operationState.error = null;
    }
  }

  protected setSuccess(success: boolean): void {
    this.operationState.success = success;
    this.operationState.lastUpdated = new Date();
    if (success) {
      this.operationState.error = null;
    }
  }

  protected setError(error: string): void {
    this.operationState.error = error;
    this.operationState.success = false;
    this.operationState.lastUpdated = new Date();
  }

  // ======================================
  // أدوات مساعدة
  // ======================================

  protected isNotFoundError(error: unknown): boolean {
    // فحص إذا كان الخطأ 404 Not Found
    return typeof error === 'object' && 
           error !== null && 
           'status' in error && 
           (error as { status: number }).status === 404;
  }
} 