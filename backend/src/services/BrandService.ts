/**
 * 🏢 Brand Service - Depth Studio
 * ===============================
 * 
 * 📅 محدث: ديسمبر 2024
 * 👨‍💻 المطور: علي جودت
 * 🎯 الهدف: المنطق التجاري للبراندات بأنواع محكمة 100%
 */

import { Brand } from "../../../types/src/brands";
import { BrandStatus, BrandType, Industry } from "../../../types/src/core/enums";
import { ID, MultiLanguageText } from "../../../types/src/core/base";
import { BrandRepository } from "../repositories/BrandRepository";
import { UserRepository } from "../repositories/UserRepository";
import { logger } from "firebase-functions";

/**
 * 🏢 خدمة البراندات
 */
export class BrandService {
  private brandRepository: BrandRepository;
  private userRepository: UserRepository;

  constructor() {
    this.brandRepository = new BrandRepository();
    this.userRepository = new UserRepository();
  }

  /**
   * 📝 إنشاء براند جديد
   */
  async createBrand(brandData: {
    name: MultiLanguageText;
    brandType: BrandType;
    industry: Industry;
    monthlyBudget: number;
    currency: string;
    coordinatorId?: ID;
    description?: MultiLanguageText;
    website?: string;
    socialMedia?: {
      instagram?: string;
      twitter?: string;
      facebook?: string;
      linkedin?: string;
      tiktok?: string;
    };
  }): Promise<Brand> {
    try {
      // التحقق من المنسق إذا تم توفيره
      if (brandData.coordinatorId) {
        const coordinator = await this.userRepository.findById(brandData.coordinatorId);
        if (!coordinator) {
          throw new Error("Coordinator not found");
        }
        if (coordinator.primary_role !== "brand_coordinator") {
          throw new Error("Assigned user is not a brand coordinator");
        }
      }

      const newBrandData = {
        name: brandData.name,
        brand_type: brandData.brandType,
        industry: brandData.industry,
        monthly_budget: brandData.monthlyBudget,
        currency: brandData.currency,
        status: "development" as const,
        is_active: true,
        
        // حقول مطلوبة حسب Brand interface
        description: brandData.description || { ar: "", en: "" },
        primary_color: "#000000",
        secondary_color: "#FFFFFF", 
        contact_name: "",
        contact_email: "",
        contact_phone: "",
        pricing_tier: "basic",
        preferred_styles: [],
        content_categories: [],
        total_campaigns: 0,
        total_content_pieces: 0,
        average_project_rating: 0,
        total_spent: 0,
        created_by: "",
        last_updated_by: "",
        
        ...(brandData.coordinatorId && { assigned_coordinator: brandData.coordinatorId }),
        ...(brandData.website && { website: brandData.website }),
        ...(brandData.socialMedia && { social_media: brandData.socialMedia })
      };

      const newBrand = await this.brandRepository.create(newBrandData);

      logger.info("🏢 Brand created successfully", { 
        brandId: newBrand.id,
        name: brandData.name,
        type: brandData.brandType
      });

      return newBrand;
    } catch (error) {
      logger.error("❌ Error creating brand", { brandData, error });
      throw new Error(`Failed to create brand: ${error}`);
    }
  }

  /**
   * ✅ الموافقة على براند
   */
  async approveBrand(brandId: ID, approvedBy: ID): Promise<Brand> {
    try {
      const brand = await this.brandRepository.findById(brandId);
      if (!brand) {
        throw new Error("Brand not found");
      }

      if (brand.status !== "development") {
        throw new Error(`Cannot approve brand with status: ${brand.status}`);
      }

      const updatedBrand = await this.brandRepository.update(brandId, {
        status: "active",
        updated_by: approvedBy
      });

      logger.info("✅ Brand approved", { brandId, approvedBy });
      return updatedBrand;
    } catch (error) {
      logger.error("❌ Error approving brand", { brandId, approvedBy, error });
      throw new Error(`Failed to approve brand: ${error}`);
    }
  }

  /**
   * 👨‍💼 تعيين منسق للبراند
   */
  async assignCoordinator(brandId: ID, coordinatorId: ID, assignedBy: ID): Promise<Brand> {
    try {
      const [brand, coordinator] = await Promise.all([
        this.brandRepository.findById(brandId),
        this.userRepository.findById(coordinatorId)
      ]);

      if (!brand) {
        throw new Error("Brand not found");
      }

      if (!coordinator) {
        throw new Error("Coordinator not found");
      }

      if (coordinator.primary_role !== "brand_coordinator") {
        throw new Error("User is not a brand coordinator");
      }

      if (coordinator.status !== "active") {
        throw new Error("Coordinator is not active");
      }

      const updatedBrand = await this.brandRepository.update(brandId, {
        assigned_coordinator: coordinatorId,
        updated_by: assignedBy
      });

      logger.info("👨‍💼 Coordinator assigned to brand", { 
        brandId, 
        coordinatorId, 
        assignedBy 
      });

      return updatedBrand;
    } catch (error) {
      logger.error("❌ Error assigning coordinator", { 
        brandId, 
        coordinatorId, 
        assignedBy, 
        error 
      });
      throw new Error(`Failed to assign coordinator: ${error}`);
    }
  }

  /**
   * 💰 تحديث ميزانية البراند
   */
  async updateBudget(
    brandId: ID, 
    monthlyBudget: number, 
    currency: string, 
    updatedBy: ID
  ): Promise<Brand> {
    try {
      if (monthlyBudget <= 0) {
        throw new Error("Monthly budget must be positive");
      }

      const brand = await this.brandRepository.findById(brandId);
      if (!brand) {
        throw new Error("Brand not found");
      }

      const updatedBrand = await this.brandRepository.update(brandId, {
        monthly_budget: monthlyBudget,
        currency,
        updated_by: updatedBy
      });

      logger.info("💰 Brand budget updated", { 
        brandId, 
        oldBudget: brand.monthly_budget,
        newBudget: monthlyBudget,
        currency,
        updatedBy 
      });

      return updatedBrand;
    } catch (error) {
      logger.error("❌ Error updating brand budget", { 
        brandId, 
        monthlyBudget, 
        currency, 
        updatedBy, 
        error 
      });
      throw new Error(`Failed to update brand budget: ${error}`);
    }
  }

  /**
   * 📊 إحصائيات البراندات
   */
  async getBrandStats(): Promise<{
    total: number;
    byType: Record<BrandType, number>;
    byStatus: Record<BrandStatus, number>;
    byIndustry: Record<Industry, number>;
    activeCount: number;
    pendingApproval: number;
    totalBudget: number;
    averageBudget: number;
  }> {
    try {
      const allBrands = await this.brandRepository.findAll();
      
      const stats = {
        total: allBrands.length,
        byType: {} as Record<BrandType, number>,
        byStatus: {} as Record<BrandStatus, number>,
        byIndustry: {} as Record<Industry, number>,
        activeCount: 0,
        pendingApproval: 0,
        totalBudget: 0,
        averageBudget: 0
      };

      // حساب الإحصائيات
      for (const brand of allBrands) {
        // حساب حسب النوع
        stats.byType[brand.brand_type] = (stats.byType[brand.brand_type] || 0) + 1;
        
        // حساب حسب الحالة
        stats.byStatus[brand.status] = (stats.byStatus[brand.status] || 0) + 1;
        
        // حساب حسب الصناعة
        stats.byIndustry[brand.industry] = (stats.byIndustry[brand.industry] || 0) + 1;
        
        // حساب النشطين
        if (brand.status === "active") {
          stats.activeCount++;
        }
        
        // حساب المنتظرين الموافقة
        if (brand.status === "development") {
          stats.pendingApproval++;
        }

        // حساب الميزانيات
        stats.totalBudget += brand.monthly_budget;
      }

      // حساب متوسط الميزانية
      stats.averageBudget = allBrands.length > 0 ? stats.totalBudget / allBrands.length : 0;

      logger.info("📊 Brand stats calculated", stats);
      return stats;
    } catch (error) {
      logger.error("❌ Error calculating brand stats", error);
      throw new Error(`Failed to calculate brand stats: ${error}`);
    }
  }

  /**
   * 🔍 البحث المتقدم في البراندات
   */
  async searchBrands(filters: {
    searchTerm?: string;
    type?: BrandType;
    status?: BrandStatus;
    industry?: Industry;
    coordinatorId?: ID;
    minBudget?: number;
    maxBudget?: number;
    isActive?: boolean;
    page?: number;
    limit?: number;
  }): Promise<{
    brands: Brand[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      const { 
        searchTerm, 
        type, 
        status, 
        industry, 
        coordinatorId,
        minBudget,
        maxBudget,
        isActive, 
        page = 1, 
        limit = 10 
      } = filters;
      
      let brands: Brand[] = [];

      if (searchTerm) {
        brands = await this.brandRepository.searchBrands(searchTerm);
      } else {
        brands = await this.brandRepository.findAll();
      }

      // تطبيق الفلاتر
      if (type) {
        brands = brands.filter(brand => brand.brand_type === type);
      }
      if (status) {
        brands = brands.filter(brand => brand.status === status);
      }
      if (industry) {
        brands = brands.filter(brand => brand.industry === industry);
      }
      if (coordinatorId) {
        brands = brands.filter(brand => brand.assigned_coordinator === coordinatorId);
      }
      if (minBudget !== undefined) {
        brands = brands.filter(brand => brand.monthly_budget >= minBudget);
      }
      if (maxBudget !== undefined) {
        brands = brands.filter(brand => brand.monthly_budget <= maxBudget);
      }
      if (isActive !== undefined) {
        brands = brands.filter(brand => brand.is_active === isActive);
      }

      // تطبيق الصفحات
      const total = brands.length;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedBrands = brands.slice(startIndex, endIndex);

      const result = {
        brands: paginatedBrands,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      };

      logger.info("🔍 Brand search completed", { 
        filters, 
        totalFound: total, 
        returned: paginatedBrands.length 
      });

      return result;
    } catch (error) {
      logger.error("❌ Error searching brands", { filters, error });
      throw new Error(`Failed to search brands: ${error}`);
    }
  }

  /**
   * 📈 إحصائيات براند محدد
   */
  async getBrandAnalytics(brandId: ID): Promise<{
    brand: Brand;
    campaignsThisMonth: number;
    totalSpent: number;
    budgetUtilization: number;
    performanceRating: number;
  }> {
    try {
      const brand = await this.brandRepository.findById(brandId);
      if (!brand) {
        throw new Error("Brand not found");
      }

      // هذي هتحتاج campaigns repository لاحقاً
      // للوقت الحالي نرجع بيانات تجريبية
      const analytics = {
        brand,
        campaignsThisMonth: brand.total_campaigns || 0,
        totalSpent: brand.total_spent || 0,
        budgetUtilization: brand.monthly_budget > 0 
          ? ((brand.total_spent || 0) / brand.monthly_budget) * 100 
          : 0,
        performanceRating: 4.5 // تقييم افتراضي
      };

      logger.info("📈 Brand analytics calculated", { brandId, analytics });
      return analytics;
    } catch (error) {
      logger.error("❌ Error calculating brand analytics", { brandId, error });
      throw new Error(`Failed to calculate brand analytics: ${error}`);
    }
  }
} 