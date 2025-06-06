/**
 * 🏢 Brand Request Handlers
 * 
 * تطوير علي جودت - Depth Studio
 * آخر تحديث: يناير 2025
 * 
 * @description Request handlers for brand operations
 * @version 1.0.0
 */

import { Request, Response, NextFunction } from 'express';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { Brand, BrandStatus } from '../../types/types';
import { 
  NotFoundError, 
  ConflictError,
  ValidationError
} from '../../middleware/errorHandler';
import { 
  buildBrandsQuery, 
  paginateBrands, 
  searchBrands, 
  filterBrandsByPermissions,
  BrandSearchFilters 
} from './utils';

const db = getFirestore();

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    uid: string;
    primary_role: string;
    email: string;
  };
  permissions?: {
    brand_permissions?: Array<{ brand_id: string }>;
  };
}

/**
 * قائمة البراندات مع فلتر وpagination
 */
export const getBrands = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      status,
      brand_type,
      industry,
      assigned_coordinator,
      created_after,
      created_before,
      sort_by,
      sort_order,
      page = 1,
      limit = 20
    } = req.query

    const filters: BrandSearchFilters = {
      status: status as BrandStatus,
      brand_type: brand_type as string,
      industry: industry as string,
      assigned_coordinator: assigned_coordinator as string,
      created_after: created_after as string,
      created_before: created_before as string,
      sort_by: sort_by as string,
      sort_order: sort_order as 'asc' | 'desc'
    }

    const pageNum = parseInt(page as string)
    const limitNum = parseInt(limit as string)

    const query = buildBrandsQuery(filters)
    const result = await paginateBrands(query, pageNum, limitNum)

    // فلترة البراندات حسب صلاحيات المستخدم
    const currentUser = req.user!
    const userBrands = req.permissions?.brand_permissions?.map(bp => bp.brand_id) || []
    const filteredBrands = filterBrandsByPermissions(result.brands, currentUser.primary_role, userBrands)

    res.status(200).json({
      success: true,
      message: 'قائمة البراندات',
      data: filteredBrands,
      pagination: result.pagination,
      filters: filters,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    next(error);
  }
};

/**
 * جلب بيانات براند محدد
 */
export const getBrandById = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const brandId = req.params.id

    const brandDoc = await db.collection('brands').doc(brandId).get()

    if (!brandDoc.exists) {
      throw new NotFoundError('البراند')
    }

    const brandData = { id: brandDoc.id, ...brandDoc.data() } as Brand

    res.status(200).json({
      success: true,
      message: 'بيانات البراند',
      data: brandData,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    next(error);
  }
};

/**
 * إنشاء براند جديد
 */
export const createBrand = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const brandData = req.body
    const currentUser = req.user!

    // فحص إذا كان اسم البراند موجود مسبقاً
    const existingBrands = await db.collection('brands')
      .where('name.ar', '==', brandData.name.ar)
      .get()

    if (!existingBrands.empty) {
      throw new ConflictError('اسم البراند مستخدم مسبقاً')
    }

    // تجهيز بيانات البراند للحفظ
    const newBrand: any = {
      name: {
        ar: brandData.name.ar,
        en: brandData.name.en
      },
      description: {
        ar: brandData.description?.ar || '',
        en: brandData.description?.en || ''
      },
      brand_type: brandData.brand_type,
      industry: brandData.industry,
      status: brandData.status || 'development',
      brand_identity: {
        logo_url: brandData.brand_identity?.logo_url || null,
        primary_color: brandData.brand_identity?.primary_color || '#000000',
        secondary_color: brandData.brand_identity?.secondary_color || '#FFFFFF',
        font_family: brandData.brand_identity?.font_family || 'Arial',
        brand_guidelines_url: brandData.brand_identity?.brand_guidelines_url || null
      },
      contact_info: {
        primary_contact_name: brandData.contact_info.primary_contact_name,
        primary_contact_email: brandData.contact_info.primary_contact_email,
        primary_contact_phone: brandData.contact_info.primary_contact_phone || null,
        company_address: brandData.contact_info.company_address,
        website_url: brandData.contact_info.website_url || null,
        social_media: brandData.contact_info.social_media || {}
      },
      assigned_coordinator: brandData.assigned_coordinator || null,
      budget_settings: {
        monthly_budget: brandData.budget_settings?.monthly_budget || 0,
        currency: brandData.budget_settings?.currency || 'IQD',
        pricing_tier: brandData.budget_settings?.pricing_tier || 'standard',
        payment_terms: brandData.budget_settings?.payment_terms || 'net_30',
        budget_alerts_enabled: brandData.budget_settings?.budget_alerts_enabled || true
      },
      content_preferences: {
        preferred_styles: brandData.content_preferences?.preferred_styles || [],
        content_categories: brandData.content_preferences?.content_categories || [],
        quality_requirements: brandData.content_preferences?.quality_requirements || 'high',
        delivery_format: brandData.content_preferences?.delivery_format || ['jpg', 'png'],
        usage_rights: brandData.content_preferences?.usage_rights || 'exclusive'
      },
      statistics: {
        total_campaigns: 0,
        total_content_pieces: 0,
        average_project_rating: 0,
        total_spent: 0,
        active_campaigns: 0
      },
      is_active: true,
      created_at: FieldValue.serverTimestamp(),
      updated_at: FieldValue.serverTimestamp(),
      created_by: currentUser.id
    }

    // حفظ في Firestore
    const brandRef = await db.collection('brands').add(newBrand)

    // جلب البيانات المحفوظة
    const savedBrandDoc = await brandRef.get()
    const savedBrand = { id: savedBrandDoc.id, ...savedBrandDoc.data() } as Brand

    res.status(201).json({
      success: true,
      message: 'تم إنشاء البراند بنجاح',
      data: savedBrand,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    next(error);
  }
};

/**
 * تحديث بيانات البراند
 */
export const updateBrand = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const brandId = req.params.id
    const updateData = req.body
    const currentUser = req.user!

    // التحقق من وجود البراند
    const brandDoc = await db.collection('brands').doc(brandId).get()
    if (!brandDoc.exists) {
      throw new NotFoundError('البراند')
    }

    // تجهيز البيانات للتحديث
    const allowedFields = [
      'name', 'description', 'brand_type', 'industry', 'status',
      'brand_identity', 'contact_info', 'budget_settings', 'content_preferences'
    ]

    // للمديرين فقط
    if (['super_admin', 'marketing_coordinator'].includes(currentUser.primary_role)) {
      allowedFields.push('assigned_coordinator', 'is_active')
    }

    const updateFields: any = {
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
    await db.collection('brands').doc(brandId).update(updateFields)

    // جلب البيانات المحدثة
    const updatedDoc = await db.collection('brands').doc(brandId).get()
    const updatedBrand = { id: updatedDoc.id, ...updatedDoc.data() } as Brand

    res.status(200).json({
      success: true,
      message: 'تم تحديث بيانات البراند بنجاح',
      data: updatedBrand,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    next(error);
  }
};

/**
 * حذف البراند (soft delete)
 */
export const deleteBrand = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const brandId = req.params.id
    const currentUser = req.user!

    // التحقق من وجود البراند
    const brandDoc = await db.collection('brands').doc(brandId).get()
    if (!brandDoc.exists) {
      throw new NotFoundError('البراند')
    }

    // فحص إذا فيه حملات نشطة
    const activeCampaigns = await db.collection('campaigns')
      .where('campaign_info.brand_id', '==', brandId)
      .where('campaign_status', 'in', ['active', 'scheduled'])
      .get()

    if (!activeCampaigns.empty) {
      throw new ValidationError('لا يمكن حذف البراند لوجود حملات نشطة')
    }

    // Soft delete - تغيير الحالة بدلاً من الحذف
    await db.collection('brands').doc(brandId).update({
      is_active: false,
      status: 'archived',
      deleted_at: FieldValue.serverTimestamp(),
      deleted_by: currentUser.id,
      updated_at: FieldValue.serverTimestamp()
    })

    res.status(200).json({
      success: true,
      message: 'تم حذف البراند بنجاح',
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    next(error);
  }
};

/**
 * البحث في البراندات
 */
export const searchBrandsHandler = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { q: searchTerm, status, brand_type, limit = 10 } = req.query

    if (!searchTerm || typeof searchTerm !== 'string' || searchTerm.length < 2) {
      res.status(400).json({
        success: false,
        message: 'نص البحث يجب أن يكون على الأقل حرفين',
        timestamp: new Date().toISOString()
      });
      return;
    }

    const filters: BrandSearchFilters = {
      status: status as BrandStatus,
      brand_type: brand_type as string
    }

    const brands = await searchBrands(searchTerm, filters)
    const limitedBrands = brands.slice(0, parseInt(limit as string))

    res.status(200).json({
      success: true,
      message: 'نتائج البحث',
      data: limitedBrands,
      count: limitedBrands.length,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    next(error);
  }
};

/**
 * تعيين منسق براند
 */
export const assignCoordinator = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const brandId = req.params.id
    const { coordinator_id } = req.body
    const currentUser = req.user!

    if (!coordinator_id) {
      throw new ValidationError('معرف المنسق مطلوب')
    }

    // التحقق من وجود البراند
    const brandDoc = await db.collection('brands').doc(brandId).get()
    if (!brandDoc.exists) {
      throw new NotFoundError('البراند')
    }

    // التحقق من وجود المنسق وصلاحياته
    const coordinatorDoc = await db.collection('users').doc(coordinator_id).get()
    if (!coordinatorDoc.exists) {
      throw new NotFoundError('المنسق')
    }

    const coordinatorData = coordinatorDoc.data()
    if (coordinatorData?.primary_role !== 'brand_coordinator') {
      throw new ValidationError('المستخدم المحدد ليس منسق براند')
    }

    // تحديث البراند
    await db.collection('brands').doc(brandId).update({
      assigned_coordinator: coordinator_id,
      updated_at: FieldValue.serverTimestamp(),
      updated_by: currentUser.id
    })

    res.status(200).json({
      success: true,
      message: 'تم تعيين منسق البراند بنجاح',
      data: {
        brand_id: brandId,
        coordinator_id,
        assigned_by: currentUser.id,
        assigned_at: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    next(error);
  }
};

/**
 * إحصائيات البراند
 */
export const getBrandStats = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const brandId = req.params.id

    // التحقق من وجود البراند
    const brandDoc = await db.collection('brands').doc(brandId).get()
    if (!brandDoc.exists) {
      throw new NotFoundError('البراند')
    }

    // إحصائيات أساسية
    const campaigns = await db.collection('campaigns')
      .where('campaign_info.brand_id', '==', brandId)
      .get()

    const totalCampaigns = campaigns.size
    const activeCampaigns = campaigns.docs.filter(doc => 
      doc.data().campaign_status === 'active'
    ).length

    const statistics = {
      campaigns: {
        total: totalCampaigns,
        active: activeCampaigns,
        completed: totalCampaigns - activeCampaigns
      },
      last_updated: new Date().toISOString()
    }

    res.status(200).json({
      success: true,
      message: 'إحصائيات البراند',
      data: statistics,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    next(error);
  }
};

export const brandHandlers = {
  getBrands,
  getBrandById,
  createBrand,
  updateBrand,
  deleteBrand,
  searchBrandsHandler,
  assignCoordinator,
  getBrandStats
}; 