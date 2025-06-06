/**
 * 🔧 Brand Utility Functions
 * 
 * تطوير علي جودت - Depth Studio
 * آخر تحديث: يناير 2025
 * 
 * @description Utility functions for brand operations (search, filtering, pagination)
 * @version 1.0.0
 */

import { Query, DocumentData } from 'firebase-admin/firestore';
import { db } from '../../config/firebase';
import { Brand, BrandStatus } from '../../types/types';

export interface BrandSearchFilters {
  status?: BrandStatus;
  brand_type?: string;
  industry?: string;
  assigned_coordinator?: string;
  created_after?: string;
  created_before?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

/**
 * Helper function لإنشاء query للبحث والفلترة
 */
export function buildBrandsQuery(filters: BrandSearchFilters): Query<DocumentData> {
  let query: Query<DocumentData> = db.collection('brands')
  
  if (filters.status) {
    query = query.where('status', '==', filters.status)
  }
  
  if (filters.brand_type) {
    query = query.where('brand_type', '==', filters.brand_type)
  }
  
  if (filters.industry) {
    query = query.where('industry', '==', filters.industry)
  }
  
  if (filters.assigned_coordinator) {
    query = query.where('assigned_coordinator', '==', filters.assigned_coordinator)
  }
  
  if (filters.created_after) {
    query = query.where('created_at', '>=', new Date(filters.created_after))
  }
  
  if (filters.created_before) {
    query = query.where('created_at', '<=', new Date(filters.created_before))
  }
  
  const sortField = filters.sort_by || 'created_at'
  const sortOrder = filters.sort_order === 'asc' ? 'asc' : 'desc'
  query = query.orderBy(sortField, sortOrder)
  
  return query
}

/**
 * Helper function للـ pagination
 */
export async function paginateBrands(query: Query<DocumentData>, page: number, limit: number) {
  const offset = (page - 1) * limit
  
  // احصل على العدد الإجمالي
  const countSnapshot = await query.get()
  const totalCount = countSnapshot.size
  
  // احصل على البيانات المطلوبة
  const dataQuery = query.offset(offset).limit(limit)
  const dataSnapshot = await dataQuery.get()
  
  const brands = dataSnapshot.docs.map((doc: any) => ({
    id: doc.id,
    ...doc.data()
  })) as Brand[]
  
  const totalPages = Math.ceil(totalCount / limit)
  
  return {
    brands,
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
 * البحث النصي في البراندات
 */
export async function searchBrands(searchTerm: string, filters: BrandSearchFilters): Promise<Brand[]> {
  // في الإنتاج، استخدم Elasticsearch أو Algolia للبحث المتقدم
  // هنا نستخدم فلترة أساسية
  
  const allBrandsQuery = buildBrandsQuery(filters)
  const snapshot = await allBrandsQuery.get()
  
  const searchTermLower = searchTerm.toLowerCase()
  
  return snapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() } as Brand))
    .filter(brand => 
      brand.name?.ar?.toLowerCase().includes(searchTermLower) ||
      brand.name?.en?.toLowerCase().includes(searchTermLower) ||
      brand.description?.ar?.toLowerCase().includes(searchTermLower) ||
      brand.description?.en?.toLowerCase().includes(searchTermLower) ||
      brand.industry?.toLowerCase().includes(searchTermLower)
    )
}

/**
 * فلترة البراندات حسب صلاحيات المستخدم
 */
export function filterBrandsByPermissions(brands: Brand[], userRole: string, userBrands: string[] = []): Brand[] {
  if (userRole === 'brand_coordinator') {
    return brands.filter(brand => userBrands.includes(brand.id));
  }
  return brands; // للمديرين - يرون جميع البراندات
}

/**
 * التحقق من صلاحية الوصول للبراند
 */
export function canAccessBrand(userRole: string, brandId: string, userBrands: string[] = []): boolean {
  // المديرين يمكنهم الوصول لجميع البراندات
  if (['super_admin', 'marketing_coordinator'].includes(userRole)) {
    return true;
  }
  
  // منسقي البراندات يمكنهم الوصول فقط للبراندات المخصصة لهم
  if (userRole === 'brand_coordinator') {
    return userBrands.includes(brandId);
  }
  
  return false;
}

/**
 * التحقق من صلاحية تحديث البراند
 */
export function canUpdateBrand(userRole: string, brandId: string, userBrands: string[] = []): boolean {
  return canAccessBrand(userRole, brandId, userBrands);
}

/**
 * التحقق من صلاحية حذف البراند
 */
export function canDeleteBrand(userRole: string): boolean {
  // فقط super_admin يمكنه حذف البراندات
  return userRole === 'super_admin';
}

/**
 * التحقق من صحة بيانات البراند
 */
export function validateBrandData(brandData: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!brandData.name?.ar) {
    errors.push('اسم البراند باللغة العربية مطلوب');
  }
  
  if (!brandData.name?.en) {
    errors.push('اسم البراند باللغة الإنجليزية مطلوب');
  }
  
  if (!brandData.industry) {
    errors.push('مجال البراند مطلوب');
  }
  
  const validBrandTypes = ['local', 'international', 'franchise', 'startup'];
  if (!validBrandTypes.includes(brandData.brand_type)) {
    errors.push('نوع البراند غير صحيح');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * إزالة البيانات الحساسة من كائن البراند
 */
export function sanitizeBrandData(brand: any): Brand {
  const sanitized = { ...brand };
  // إزالة أي بيانات حساسة إذا لزم الأمر
  return sanitized;
}

export const brandUtils = {
  buildBrandsQuery,
  paginateBrands,
  searchBrands,
  filterBrandsByPermissions,
  canAccessBrand,
  canUpdateBrand,
  canDeleteBrand,
  validateBrandData,
  sanitizeBrandData
}; 