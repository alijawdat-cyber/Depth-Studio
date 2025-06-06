/**
 * 🏢 Brand Repository
 * 
 * تطوير علي جودت - Depth Studio
 * آخر تحديث: يونيو 2025
 * 
 * @description Repository pattern for brand operations
 * @version 1.0.0
 */

import { BaseRepository, QueryFilter, BaseEntity } from './BaseRepository';
import { Brand, BrandStatus } from '../../types/types';

/**
 * Brand entity interface extending BaseEntity
 */
export interface BrandEntity extends BaseEntity {
  name: {
    ar: string;
    en: string;
  };
  description: {
    ar: string;
    en: string;
  };
  brand_type: string;
  industry: string;
  status: BrandStatus;
  brand_identity: {
    logo_url: string | null;
    primary_color: string;
    secondary_color: string;
    font_family: string;
    brand_guidelines_url: string | null;
  };
  contact_info: {
    primary_contact_name: string;
    primary_contact_email: string;
    primary_contact_phone: string | null;
    company_address: string;
    website_url: string | null;
    social_media: Record<string, string>;
  };
  assigned_coordinator: string | null;
  budget_settings: {
    monthly_budget: number;
    currency: string;
    pricing_tier: string;
    payment_terms: string;
    budget_alerts_enabled: boolean;
  };
  content_preferences: {
    preferred_styles: string[];
    content_categories: string[];
    quality_requirements: string;
    delivery_format: string[];
    usage_rights: string;
  };
  statistics: {
    total_campaigns: number;
    total_content_pieces: number;
    average_project_rating: number;
    total_spent: number;
    active_campaigns: number;
  };
  is_active: boolean;
}

/**
 * Brand search filters interface
 */
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
 * Brand Repository Class
 */
export class BrandRepository extends BaseRepository<BrandEntity> {
  
  constructor() {
    super('brands');
  }

  /**
   * Find brand by name (Arabic)
   */
  async findByNameAr(name: string): Promise<BrandEntity | null> {
    const filters: QueryFilter[] = [
      { field: 'name.ar', operator: '==', value: name }
    ];

    return await this.findOne({ filters });
  }

  /**
   * Find brand by name (English)
   */
  async findByNameEn(name: string): Promise<BrandEntity | null> {
    const filters: QueryFilter[] = [
      { field: 'name.en', operator: '==', value: name }
    ];

    return await this.findOne({ filters });
  }

  /**
   * Find brands by status
   */
  async findByStatus(status: BrandStatus): Promise<BrandEntity[]> {
    const filters: QueryFilter[] = [
      { field: 'status', operator: '==', value: status }
    ];

    return await this.findAll({ 
      filters,
      orderBy: [{ field: 'created_at', direction: 'desc' }]
    });
  }

  /**
   * Find active brands
   */
  async findActiveBrands(): Promise<BrandEntity[]> {
    const filters: QueryFilter[] = [
      { field: 'is_active', operator: '==', value: true },
      { field: 'status', operator: '==', value: 'active' }
    ];

    return await this.findAll({ 
      filters,
      orderBy: [{ field: 'name.ar', direction: 'asc' }]
    });
  }

  /**
   * Find brands by coordinator
   */
  async findByCoordinator(coordinatorId: string): Promise<BrandEntity[]> {
    const filters: QueryFilter[] = [
      { field: 'assigned_coordinator', operator: '==', value: coordinatorId }
    ];

    return await this.findAll({ 
      filters,
      orderBy: [{ field: 'name.ar', direction: 'asc' }]
    });
  }

  /**
   * Find brands by industry
   */
  async findByIndustry(industry: string): Promise<BrandEntity[]> {
    const filters: QueryFilter[] = [
      { field: 'industry', operator: '==', value: industry }
    ];

    return await this.findAll({ 
      filters,
      orderBy: [{ field: 'name.ar', direction: 'asc' }]
    });
  }

  /**
   * Find brands by type
   */
  async findByType(brand_type: string): Promise<BrandEntity[]> {
    const filters: QueryFilter[] = [
      { field: 'brand_type', operator: '==', value: brand_type }
    ];

    return await this.findAll({ 
      filters,
      orderBy: [{ field: 'name.ar', direction: 'asc' }]
    });
  }

  /**
   * Search brands with filters and pagination
   */
  async searchBrands(searchFilters: BrandSearchFilters, page: number = 1, limit: number = 20): Promise<any> {
    const filters: QueryFilter[] = [];

    // Apply filters
    if (searchFilters.status) {
      filters.push({ field: 'status', operator: '==', value: searchFilters.status });
    }

    if (searchFilters.brand_type) {
      filters.push({ field: 'brand_type', operator: '==', value: searchFilters.brand_type });
    }

    if (searchFilters.industry) {
      filters.push({ field: 'industry', operator: '==', value: searchFilters.industry });
    }

    if (searchFilters.assigned_coordinator) {
      filters.push({ field: 'assigned_coordinator', operator: '==', value: searchFilters.assigned_coordinator });
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
   * Search brands by text (name, description)
   */
  async searchByText(searchTerm: string, searchFilters?: BrandSearchFilters): Promise<BrandEntity[]> {
    // للبحث النصي، نحتاج جلب جميع البراندات وفلترتهم محلياً
    // في الإنتاج، استخدم Elasticsearch أو Algolia
    
    const filters: QueryFilter[] = [];
    
    // Apply additional filters if provided
    if (searchFilters?.status) {
      filters.push({ field: 'status', operator: '==', value: searchFilters.status });
    }

    if (searchFilters?.industry) {
      filters.push({ field: 'industry', operator: '==', value: searchFilters.industry });
    }

    const allBrands = await this.findAll({ filters });
    const searchTermLower = searchTerm.toLowerCase();

    return allBrands.filter(brand => 
      brand.name.ar.toLowerCase().includes(searchTermLower) ||
      brand.name.en.toLowerCase().includes(searchTermLower) ||
      brand.description.ar.toLowerCase().includes(searchTermLower) ||
      brand.description.en.toLowerCase().includes(searchTermLower) ||
      brand.contact_info.primary_contact_name.toLowerCase().includes(searchTermLower) ||
      brand.contact_info.primary_contact_email.toLowerCase().includes(searchTermLower)
    );
  }

  /**
   * Assign coordinator to brand
   */
  async assignCoordinator(brandId: string, coordinatorId: string, updatedBy?: string): Promise<BrandEntity | null> {
    return await this.update(brandId, {
      assigned_coordinator: coordinatorId
    }, updatedBy);
  }

  /**
   * Remove coordinator from brand
   */
  async removeCoordinator(brandId: string, updatedBy?: string): Promise<BrandEntity | null> {
    return await this.update(brandId, {
      assigned_coordinator: null
    }, updatedBy);
  }

  /**
   * Update brand status
   */
  async updateStatus(brandId: string, status: BrandStatus, updatedBy?: string): Promise<BrandEntity | null> {
    return await this.update(brandId, { status }, updatedBy);
  }

  /**
   * Update brand statistics
   */
  async updateStatistics(brandId: string, statistics: Partial<BrandEntity['statistics']>): Promise<BrandEntity | null> {
    const brand = await this.findById(brandId);
    if (!brand) return null;

    const updatedStats = {
      ...brand.statistics,
      ...statistics
    };

    return await this.update(brandId, {
      statistics: updatedStats
    });
  }

  /**
   * Increment campaign count
   */
  async incrementCampaignCount(brandId: string): Promise<BrandEntity | null> {
    const brand = await this.findById(brandId);
    if (!brand) return null;

    return await this.updateStatistics(brandId, {
      total_campaigns: brand.statistics.total_campaigns + 1,
      active_campaigns: brand.statistics.active_campaigns + 1
    });
  }

  /**
   * Decrement active campaign count
   */
  async decrementActiveCampaignCount(brandId: string): Promise<BrandEntity | null> {
    const brand = await this.findById(brandId);
    if (!brand) return null;

    const newCount = Math.max(0, brand.statistics.active_campaigns - 1);

    return await this.updateStatistics(brandId, {
      active_campaigns: newCount
    });
  }

  /**
   * Update total spent
   */
  async updateTotalSpent(brandId: string, amount: number): Promise<BrandEntity | null> {
    const brand = await this.findById(brandId);
    if (!brand) return null;

    return await this.updateStatistics(brandId, {
      total_spent: brand.statistics.total_spent + amount
    });
  }

  /**
   * Update project rating
   */
  async updateAverageRating(brandId: string, newRating: number): Promise<BrandEntity | null> {
    const brand = await this.findById(brandId);
    if (!brand) return null;

    // حساب المتوسط الجديد (simplified - يمكن تحسينه)
    const currentRating = brand.statistics.average_project_rating;
    const totalProjects = brand.statistics.total_campaigns;
    
    const newAverageRating = totalProjects > 0 
      ? ((currentRating * totalProjects) + newRating) / (totalProjects + 1)
      : newRating;

    return await this.updateStatistics(brandId, {
      average_project_rating: Math.round(newAverageRating * 100) / 100 // round to 2 decimal places
    });
  }

  /**
   * Check if brand name exists (Arabic)
   */
  async nameArExists(name: string, excludeBrandId?: string): Promise<boolean> {
    const filters: QueryFilter[] = [
      { field: 'name.ar', operator: '==', value: name }
    ];

    const brands = await this.findAll({ filters });
    
    if (excludeBrandId) {
      return brands.some(brand => brand.id !== excludeBrandId);
    }
    
    return brands.length > 0;
  }

  /**
   * Check if brand name exists (English)
   */
  async nameEnExists(name: string, excludeBrandId?: string): Promise<boolean> {
    const filters: QueryFilter[] = [
      { field: 'name.en', operator: '==', value: name }
    ];

    const brands = await this.findAll({ filters });
    
    if (excludeBrandId) {
      return brands.some(brand => brand.id !== excludeBrandId);
    }
    
    return brands.length > 0;
  }

  /**
   * Get brands requiring coordinator assignment
   */
  async getBrandsWithoutCoordinator(): Promise<BrandEntity[]> {
    const filters: QueryFilter[] = [
      { field: 'assigned_coordinator', operator: '==', value: null },
      { field: 'is_active', operator: '==', value: true }
    ];

    return await this.findAll({ 
      filters,
      orderBy: [{ field: 'created_at', direction: 'asc' }]
    });
  }

  /**
   * Get brand statistics summary
   */
  async getBrandStats(brandId: string): Promise<any> {
    const brand = await this.findById(brandId);
    if (!brand) return null;

    return {
      ...brand.statistics,
      coordinator_assigned: !!brand.assigned_coordinator,
      budget_utilization: brand.budget_settings.monthly_budget > 0 
        ? (brand.statistics.total_spent / brand.budget_settings.monthly_budget) * 100 
        : 0,
      account_age_days: brand.created_at ? 
        Math.floor((Date.now() - brand.created_at.toMillis()) / (1000 * 60 * 60 * 24)) : 0
    };
  }
} 