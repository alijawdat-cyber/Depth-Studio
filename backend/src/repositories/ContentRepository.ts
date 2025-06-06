/**
 * 📁 Content Repository - إدارة المحتوى
 * =====================================
 * 
 * مستودع المحتوى مع عمليات CRUD متقدمة ومحكم الأنواع 100%
 * متوافق بالكامل مع types/src/content.ts
 */

import { Query, FieldValue, Timestamp } from 'firebase-admin/firestore';
import { BaseRepository } from './BaseRepository';
import { Content, ContentCategory } from '../../../types/src/content';
import { ContentType, ContentApprovalStatus } from '../../../types/src/core/enums';
import { ID, FirebaseTimestamp } from '../../../types/src/core/base';

// ======================================
// 🔧 أنواع التحديث المتخصصة
// ======================================

/**
 * نوع البيانات لتحديث المحتوى - حل احترافي لمشكلة FieldValue
 */
type ContentUpdateData = Partial<Omit<Content, 'id' | 'created_at' | 'updated_at' | 'approved_at'>> & {
  updated_at?: FieldValue;
  approved_at?: FieldValue;
};

/**
 * 🔍 خيارات البحث في المحتوى
 */
interface ContentSearchOptions {
  brandId?: ID;
  photographerId?: ID;
  campaignId?: ID;
  type?: ContentType;
  status?: ContentApprovalStatus;
  category?: string;
  tags?: string[];
  startDate?: FirebaseTimestamp;
  endDate?: FirebaseTimestamp;
  minQualityScore?: number;
  usageType?: 'exclusive' | 'non_exclusive' | 'limited' | 'unlimited';
  limit?: number;
}

/**
 * 📊 إحصائيات المحتوى
 */
interface ContentStats {
  total: number;
  by_status: Record<ContentApprovalStatus, number>;
  by_type: Record<ContentType, number>;
  by_category: Record<string, number>;
  by_photographer: Record<ID, number>;
  by_brand: Record<ID, number>;
  total_size_mb: number;
  average_quality_score: number;
  total_downloads: number;
  total_views: number;
}

/**
 * 📁 مستودع المحتوى - عمليات متقدمة للمحتوى الرقمي
 */
export class ContentRepository extends BaseRepository<Content> {
  constructor() {
    super('content');
  }

  // ======================================
  // 🔍 عمليات البحث المتخصصة
  // ======================================

  /**
   * جلب محتوى حسب الحملة
   */
  async findByCampaign(campaignId: ID): Promise<Content[]> {
    try {
      const snapshot = await this.collection
        .where('campaign_id', '==', campaignId)
        .orderBy('created_at', 'desc')
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Content));
    } catch (error) {
      throw new Error(`خطأ في جلب محتوى الحملة: ${error}`);
    }
  }

  /**
   * جلب محتوى حسب حالة الموافقة
   */
  async findByApprovalStatus(status: ContentApprovalStatus): Promise<Content[]> {
    try {
      const snapshot = await this.collection
        .where('status', '==', status)
        .orderBy('created_at', 'desc')
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Content));
    } catch (error) {
      throw new Error(`خطأ في جلب المحتوى حسب الحالة: ${error}`);
    }
  }

  /**
   * جلب محتوى المصور
   */
  async findByPhotographer(photographerId: ID): Promise<Content[]> {
    try {
      const snapshot = await this.collection
        .where('photographer_id', '==', photographerId)
        .orderBy('created_at', 'desc')
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Content));
    } catch (error) {
      throw new Error(`خطأ في جلب محتوى المصور: ${error}`);
    }
  }

  /**
   * جلب محتوى حسب البراند
   */
  async findByBrand(brandId: ID): Promise<Content[]> {
    try {
      const snapshot = await this.collection
        .where('brand_id', '==', brandId)
        .orderBy('created_at', 'desc')
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Content));
    } catch (error) {
      throw new Error(`خطأ في جلب محتوى البراند: ${error}`);
    }
  }

  /**
   * جلب محتوى حسب النوع
   */
  async findByType(type: ContentType): Promise<Content[]> {
    try {
      const snapshot = await this.collection
        .where('type', '==', type)
        .orderBy('quality_score', 'desc')
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Content));
    } catch (error) {
      throw new Error(`خطأ في جلب المحتوى حسب النوع: ${error}`);
    }
  }

  /**
   * جلب محتوى حسب الفئة
   */
  async findByCategory(category: string): Promise<Content[]> {
    try {
      const snapshot = await this.collection
        .where('category', '==', category)
        .orderBy('quality_score', 'desc')
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Content));
    } catch (error) {
      throw new Error(`خطأ في جلب المحتوى حسب الفئة: ${error}`);
    }
  }

  // ======================================
  // ✅ عمليات الموافقة والمراجعة
  // ======================================

  /**
   * تحديث حالة الموافقة
   */
  async updateApprovalStatus(
    contentId: ID, 
    status: ContentApprovalStatus, 
    approvedBy?: ID,
    rejectionReason?: string
  ): Promise<Content> {
    try {
      const updateData: ContentUpdateData = {
        status,
        updated_at: FieldValue.serverTimestamp()
      };

      if (status === 'approved' && approvedBy) {
        updateData['approved_by'] = approvedBy;
        updateData['approved_at'] = FieldValue.serverTimestamp();
      }

      if (status === 'rejected' && rejectionReason) {
        updateData['rejection_reason'] = rejectionReason;
      }

      await this.collection.doc(contentId).update(updateData);
      
      const updated = await this.findById(contentId);
      if (!updated) {
        throw new Error('المحتوى غير موجود بعد التحديث');
      }

      return updated;
    } catch (error) {
      throw new Error(`خطأ في تحديث حالة الموافقة: ${error}`);
    }
  }

  /**
   * تحديث تقييم الجودة
   */
  async updateQualityScore(contentId: ID, qualityScore: number): Promise<Content> {
    try {
      if (qualityScore < 0 || qualityScore > 10) {
        throw new Error('تقييم الجودة يجب أن يكون بين 0 و 10');
      }

      await this.collection.doc(contentId).update({
        quality_score: qualityScore,
        updated_at: FieldValue.serverTimestamp()
      });

      const updated = await this.findById(contentId);
      if (!updated) {
        throw new Error('المحتوى غير موجود بعد التحديث');
      }

      return updated;
    } catch (error) {
      throw new Error(`خطأ في تحديث تقييم الجودة: ${error}`);
    }
  }

  /**
   * تحديث تقييم العميل
   */
  async updateClientRating(contentId: ID, clientRating: number): Promise<Content> {
    try {
      if (clientRating < 1 || clientRating > 5) {
        throw new Error('تقييم العميل يجب أن يكون بين 1 و 5');
      }

      await this.collection.doc(contentId).update({
        client_rating: clientRating,
        updated_at: FieldValue.serverTimestamp()
      });

      const updated = await this.findById(contentId);
      if (!updated) {
        throw new Error('المحتوى غير موجود بعد التحديث');
      }

      return updated;
    } catch (error) {
      throw new Error(`خطأ في تحديث تقييم العميل: ${error}`);
    }
  }

  // ======================================
  // 🔍 البحث المتقدم
  // ======================================

  /**
   * بحث متقدم في المحتوى
   */
  async searchContent(options: ContentSearchOptions): Promise<Content[]> {
    try {
      let query = this.collection as Query;

      // الفلترة حسب البراند
      if (options.brandId) {
        query = query.where('brand_id', '==', options.brandId);
      }

      // الفلترة حسب المصور
      if (options.photographerId) {
        query = query.where('photographer_id', '==', options.photographerId);
      }

      // الفلترة حسب الحملة
      if (options.campaignId) {
        query = query.where('campaign_id', '==', options.campaignId);
      }

      // الفلترة حسب النوع
      if (options.type) {
        query = query.where('type', '==', options.type);
      }

      // الفلترة حسب الحالة
      if (options.status) {
        query = query.where('status', '==', options.status);
      }

      // الفلترة حسب الفئة
      if (options.category) {
        query = query.where('category', '==', options.category);
      }

      // الفلترة حسب نوع الاستخدام
      if (options.usageType) {
        query = query.where('usage_type', '==', options.usageType);
      }

      // الفلترة حسب تقييم الجودة
      if (options.minQualityScore) {
        query = query.where('quality_score', '>=', options.minQualityScore);
      }

      // الفلترة حسب التاريخ
      if (options.startDate) {
        query = query.where('created_at', '>=', options.startDate);
      }

      if (options.endDate) {
        query = query.where('created_at', '<=', options.endDate);
      }

      // الترتيب والحد الأقصى
      query = query.orderBy('created_at', 'desc');
      
      if (options.limit) {
        query = query.limit(options.limit);
      }

      const snapshot = await query.get();

      let results = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Content));

      // فلترة إضافية للـ tags (بعد جلب البيانات)
      if (options.tags && options.tags.length > 0) {
        results = results.filter(content => 
          options.tags!.some(tag => content.tags.includes(tag))
        );
      }

      return results;
    } catch (error) {
      throw new Error(`خطأ في البحث في المحتوى: ${error}`);
    }
  }

  /**
   * البحث في العناوين والأوصاف
   */
  async searchByText(searchText: string, limit = 20): Promise<Content[]> {
    try {
      // بحث في العناوين
      const titleSnapshot = await this.collection
        .where('title', '>=', searchText)
        .where('title', '<=', searchText + '\uf8ff')
        .limit(limit)
        .get();

      // بحث في الأوصاف
      const descSnapshot = await this.collection
        .where('description', '>=', searchText)
        .where('description', '<=', searchText + '\uf8ff')
        .limit(limit)
        .get();

      // دمج النتائج وإزالة التكرار
      const titleResults = titleSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Content));

      const descResults = descSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Content));

      const allResults = [...titleResults, ...descResults];
      const uniqueResults = allResults.filter((content, index, self) =>
        index === self.findIndex(c => c.id === content.id)
      );

      return uniqueResults.slice(0, limit);
    } catch (error) {
      throw new Error(`خطأ في البحث النصي: ${error}`);
    }
  }

  // ======================================
  // 📅 عمليات التاريخ المتقدمة باستخدام Timestamp
  // ======================================

  /**
   * جلب محتوى حسب فترة زمنية دقيقة باستخدام Timestamp
   * 
   * 🎯 فوائد استخدام Timestamp:
   * ✅ دقة أعلى في المقارنات الزمنية
   * ✅ تحويل سهل من Date إلى Firebase Timestamp
   * ✅ معالجة مناطق زمنية مختلفة
   * ✅ مقارنات millisecond-level precision
   */
  async findByDateRangeWithTimestamp(
    startDate: Date, 
    endDate: Date
  ): Promise<Content[]> {
    try {
      // تحويل احترافي من Date إلى Timestamp
      const startTimestamp = Timestamp.fromDate(startDate);
      const endTimestamp = Timestamp.fromDate(endDate);

      const snapshot = await this.collection
        .where('created_at', '>=', startTimestamp)
        .where('created_at', '<=', endTimestamp)
        .orderBy('created_at', 'desc')
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Content));
    } catch (error) {
      throw new Error(`خطأ في جلب المحتوى حسب التاريخ: ${error}`);
    }
  }

  /**
   * إنشاء timestamp مخصص لفلترة المحتوى
   * 
   * 🎯 فوائد Timestamp.fromMillis():
   * ✅ إنشاء timestamps من milliseconds
   * ✅ دقة في التحديد الزمني  
   * ✅ مرونة في التعامل مع API timestamps
   */
  async findContentSinceMillis(milliseconds: number): Promise<Content[]> {
    try {
      const sinceTimestamp = Timestamp.fromMillis(milliseconds);
      
      const snapshot = await this.collection
        .where('created_at', '>=', sinceTimestamp)
        .orderBy('created_at', 'desc')
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Content));
    } catch (error) {
      throw new Error(`خطأ في جلب المحتوى منذ وقت محدد: ${error}`);
    }
  }

  /**
   * مقارنة تواريخ الموافقة باستخدام Timestamp methods
   * 
   * 🎯 فوائد timestamp.toMillis() و isEqual():
   * ✅ مقارنات دقيقة للتواريخ
   * ✅ فحص التساوي الدقيق
   * ✅ حسابات الفترات الزمنية
   */
  async findContentApprovedOnSameDay(referenceDate: Date): Promise<Content[]> {
    try {
      const refTimestamp = Timestamp.fromDate(referenceDate);
      const dayStart = Timestamp.fromMillis(
        Math.floor(refTimestamp.toMillis() / (24 * 60 * 60 * 1000)) * (24 * 60 * 60 * 1000)
      );
      const dayEnd = Timestamp.fromMillis(dayStart.toMillis() + (24 * 60 * 60 * 1000) - 1);

      const snapshot = await this.collection
        .where('status', '==', 'approved')
        .where('approved_at', '>=', dayStart)
        .where('approved_at', '<=', dayEnd)
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Content));
    } catch (error) {
      throw new Error(`خطأ في جلب المحتوى المعتمد في نفس اليوم: ${error}`);
    }
  }

  // ======================================
  // 📊 الإحصائيات والتحليلات
  // ======================================

  /**
   * الحصول على إحصائيات المحتوى
   */
  async getContentStats(): Promise<ContentStats> {
    try {
      const snapshot = await this.collection.get();
      const contents = snapshot.docs.map(doc => doc.data() as Content);

      const stats: ContentStats = {
        total: contents.length,
        by_status: {} as Record<ContentApprovalStatus, number>,
        by_type: {} as Record<ContentType, number>,
        by_category: {},
        by_photographer: {},
        by_brand: {},
        total_size_mb: 0,
        average_quality_score: 0,
        total_downloads: 0,
        total_views: 0
      };

      // تجميع الإحصائيات
      let totalQualityScore = 0;

      contents.forEach(content => {
        // إحصائيات الحالة
        stats.by_status[content.status] = (stats.by_status[content.status] || 0) + 1;

        // إحصائيات النوع
        stats.by_type[content.type] = (stats.by_type[content.type] || 0) + 1;

        // إحصائيات الفئة
        stats.by_category[content.category] = (stats.by_category[content.category] || 0) + 1;

        // إحصائيات المصور
        stats.by_photographer[content.photographer_id] = (stats.by_photographer[content.photographer_id] || 0) + 1;

        // إحصائيات البراند
        stats.by_brand[content.brand_id] = (stats.by_brand[content.brand_id] || 0) + 1;

        // الحجم والجودة
        stats.total_size_mb += content.file_size / (1024 * 1024);
        totalQualityScore += content.quality_score;

        // التفاعل
        stats.total_downloads += content.download_count;
        stats.total_views += content.view_count;
      });

      // حساب المتوسطات
      stats.average_quality_score = contents.length > 0 ? totalQualityScore / contents.length : 0;
      stats.total_size_mb = Math.round(stats.total_size_mb * 100) / 100; // تقريب لرقمين عشريين

      return stats;
    } catch (error) {
      throw new Error(`خطأ في جلب إحصائيات المحتوى: ${error}`);
    }
  }

  /**
   * إحصائيات المحتوى حسب الفترة الزمنية
   */
  async getContentStatsByDateRange(
    startDate: FirebaseTimestamp, 
    endDate: FirebaseTimestamp
  ): Promise<ContentStats> {
    try {
      const snapshot = await this.collection
        .where('created_at', '>=', startDate)
        .where('created_at', '<=', endDate)
        .get();

      const contents = snapshot.docs.map(doc => doc.data() as Content);

      // استخدام نفس منطق getContentStats مع البيانات المفلترة
      const stats: ContentStats = {
        total: contents.length,
        by_status: {} as Record<ContentApprovalStatus, number>,
        by_type: {} as Record<ContentType, number>,
        by_category: {},
        by_photographer: {},
        by_brand: {},
        total_size_mb: 0,
        average_quality_score: 0,
        total_downloads: 0,
        total_views: 0
      };

      let totalQualityScore = 0;

      contents.forEach(content => {
        stats.by_status[content.status] = (stats.by_status[content.status] || 0) + 1;
        stats.by_type[content.type] = (stats.by_type[content.type] || 0) + 1;
        stats.by_category[content.category] = (stats.by_category[content.category] || 0) + 1;
        stats.by_photographer[content.photographer_id] = (stats.by_photographer[content.photographer_id] || 0) + 1;
        stats.by_brand[content.brand_id] = (stats.by_brand[content.brand_id] || 0) + 1;

        stats.total_size_mb += content.file_size / (1024 * 1024);
        totalQualityScore += content.quality_score;
        stats.total_downloads += content.download_count;
        stats.total_views += content.view_count;
      });

      stats.average_quality_score = contents.length > 0 ? totalQualityScore / contents.length : 0;
      stats.total_size_mb = Math.round(stats.total_size_mb * 100) / 100;

      return stats;
    } catch (error) {
      throw new Error(`خطأ في جلب إحصائيات المحتوى بالفترة الزمنية: ${error}`);
    }
  }

  // ======================================
  // 📂 إدارة فئات المحتوى باستخدام ContentCategory
  // ======================================

  /**
   * إدارة فئات المحتوى مع ContentCategory interface
   * 
   * 🎯 فوائد استخدام ContentCategory:
   * ✅ تصنيف احترافي للمحتوى
   * ✅ حساب التسعير باستخدام base_price
   * ✅ إدارة متطلبات الفئة
   * ✅ متابعة الاستخدام مع usage_count
   * ✅ ترتيب الفئات مع sort_order
   */

  /**
   * جلب فئة محتوى مع تفاصيلها الكاملة
   */
  async getContentCategoryDetails(categoryName: string): Promise<ContentCategory | null> {
    try {
      const categoryCollection = this.firestore.collection('content_categories');
      const snapshot = await categoryCollection
        .where('name.en', '==', categoryName)
        .where('is_active', '==', true)
        .get();

             if (snapshot.empty) {
         return null;
       }

       const doc = snapshot.docs[0];
       if (!doc) {
         return null;
       }

       return { id: doc.id, ...doc.data() } as ContentCategory;
    } catch (error) {
      throw new Error(`خطأ في جلب تفاصيل الفئة: ${error}`);
    }
  }

  /**
   * حساب تكلفة المحتوى باستخدام ContentCategory
   * 
   * 🎯 استخدام احترافي لـ base_price و complexity_factor:
   * ✅ حساب دقيق للتكلفة
   * ✅ معامل التعقيد لتعديل السعر
   * ✅ تقدير الوقت المطلوب
   */
  async calculateContentCostByCategory(
    categoryName: string, 
    customComplexity?: number
  ): Promise<{
    base_price: number;
    complexity_factor: number;
    estimated_cost: number;
    estimated_hours: number;
  }> {
    try {
      const category = await this.getContentCategoryDetails(categoryName);
      if (!category) {
        throw new Error('فئة المحتوى غير موجودة');
      }

      const complexityMultiplier = customComplexity || category.complexity_factor;
      const estimatedCost = category.base_price * complexityMultiplier;

      return {
        base_price: category.base_price,
        complexity_factor: complexityMultiplier,
        estimated_cost: estimatedCost,
        estimated_hours: category.estimated_hours * complexityMultiplier
      };
    } catch (error) {
      throw new Error(`خطأ في حساب تكلفة المحتوى: ${error}`);
    }
  }

  /**
   * ربط المحتوى بفئة وتحديث usage_count
   * 
   * 🎯 فوائد تحديث usage_count:
   * ✅ إحصائيات استخدام الفئات
   * ✅ تحديد الفئات الأكثر طلباً
   * ✅ تخطيط أفضل للموارد
   */
  async assignContentToCategory(contentId: ID, categoryName: string): Promise<Content> {
    try {
      // جلب تفاصيل الفئة
      const category = await this.getContentCategoryDetails(categoryName);
      if (!category) {
        throw new Error('فئة المحتوى غير موجودة');
      }

      // تحديث المحتوى
      await this.collection.doc(contentId).update({
        category: categoryName,
        updated_at: FieldValue.serverTimestamp()
      });

             // تحديث usage_count للفئة
       const categoryCollection = this.firestore.collection('content_categories');
       if (!category.id) {
         throw new Error('معرف الفئة غير صحيح');
       }
       
       await categoryCollection.doc(category.id).update({
        usage_count: FieldValue.increment(1),
        updated_at: FieldValue.serverTimestamp()
      });

      const updatedContent = await this.findById(contentId);
      if (!updatedContent) {
        throw new Error('المحتوى غير موجود بعد التحديث');
      }

      return updatedContent;
    } catch (error) {
      throw new Error(`خطأ في ربط المحتوى بالفئة: ${error}`);
    }
  }

  /**
   * جلب متطلبات الفئة الافتراضية
   * 
   * 🎯 فوائد default_requirements:
   * ✅ توجيه المصورين للمتطلبات
   * ✅ ضمان جودة المحتوى
   * ✅ توحيد المعايير
   */
  async getCategoryRequirements(categoryName: string): Promise<string[]> {
    try {
      const category = await this.getContentCategoryDetails(categoryName);
      if (!category) {
        throw new Error('فئة المحتوى غير موجودة');
      }

      return category.default_requirements;
    } catch (error) {
      throw new Error(`خطأ في جلب متطلبات الفئة: ${error}`);
    }
  }

  /**
   * إحصائيات الفئات مع ContentCategory
   * 
   * 🎯 تحليل شامل للفئات:
   * ✅ الفئات الأكثر استخداماً
   * ✅ إجمالي الإيرادات لكل فئة
   * ✅ متوسط الوقت المطلوب
   */
  async getCategoryUsageStats(): Promise<{
    categories: Array<{
      name: string;
      usage_count: number;
      content_count: number;
      total_revenue: number;
      avg_complexity: number;
    }>;
    most_used_category: string;
    least_used_category: string;
  }> {
    try {
      // جلب جميع الفئات النشطة
      const categoryCollection = this.firestore.collection('content_categories');
      const categoriesSnapshot = await categoryCollection
        .where('is_active', '==', true)
        .orderBy('sort_order', 'asc')
        .get();

      const categories = categoriesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ContentCategory));

      const categoryStats = await Promise.all(
        categories.map(async (category) => {
                     // عدد المحتويات في كل فئة
           const categoryName = (category.name?.en || category.name?.ar) || 'غير محدد';
           const contentSnapshot = await this.collection
             .where('category', '==', categoryName)
             .get();

          const contents = contentSnapshot.docs.map(doc => doc.data() as Content);
          
          // حساب الإحصائيات
          const contentCount = contents.length;
          const totalRevenue = contentCount * category.base_price;
          const avgComplexity = contents.length > 0 
            ? contents.reduce((sum, content) => sum + (category.complexity_factor || 1), 0) / contents.length 
            : category.complexity_factor;

                                return {
             name: categoryName,
             usage_count: category.usage_count,
             content_count: contentCount,
             total_revenue: totalRevenue,
             avg_complexity: avgComplexity
           };
        })
      );

      // تحديد الأكثر والأقل استخداماً
      const sortedByUsage = [...categoryStats].sort((a, b) => b.usage_count - a.usage_count);
      const mostUsed = sortedByUsage[0]?.name || '';
      const leastUsed = sortedByUsage[sortedByUsage.length - 1]?.name || '';

      return {
        categories: categoryStats,
        most_used_category: mostUsed,
        least_used_category: leastUsed
      };
    } catch (error) {
      throw new Error(`خطأ في جلب إحصائيات الفئات: ${error}`);
    }
  }

  // ======================================
  // 📈 عمليات التفاعل والاستخدام
  // ======================================

  /**
   * زيادة عدد المشاهدات
   */
  async incrementViewCount(contentId: ID): Promise<void> {
    try {
      await this.collection.doc(contentId).update({
        view_count: FieldValue.increment(1),
        updated_at: FieldValue.serverTimestamp()
      });
    } catch (error) {
      throw new Error(`خطأ في زيادة عدد المشاهدات: ${error}`);
    }
  }

  /**
   * زيادة عدد التحميلات
   */
  async incrementDownloadCount(contentId: ID): Promise<void> {
    try {
      await this.collection.doc(contentId).update({
        download_count: FieldValue.increment(1),
        updated_at: FieldValue.serverTimestamp()
      });
    } catch (error) {
      throw new Error(`خطأ في زيادة عدد التحميلات: ${error}`);
    }
  }

  /**
   * تحديث معلومات الملف
   */
  async updateFileInfo(
    contentId: ID,
    fileUrl: string,
    fileSize: number,
    thumbnailUrl?: string
  ): Promise<Content> {
    try {
      const updateData: ContentUpdateData = {
        file_url: fileUrl,
        file_size: fileSize,
        updated_at: FieldValue.serverTimestamp()
      };

      if (thumbnailUrl) {
        updateData['thumbnail_url'] = thumbnailUrl;
      }

      await this.collection.doc(contentId).update(updateData);

      const updated = await this.findById(contentId);
      if (!updated) {
        throw new Error('المحتوى غير موجود بعد التحديث');
      }

      return updated;
    } catch (error) {
      throw new Error(`خطأ في تحديث معلومات الملف: ${error}`);
    }
  }
} 