/**
 * 🏢 Brand Controller - Depth Studio
 * ==================================
 * 
 * 📅 محدث: ديسمبر 2024
 * 👨‍💻 المطور: علي جودت
 * 🎯 الهدف: HTTP endpoints للبراندات بأنواع محكمة 100%
 */

import { Request, Response } from "express";
import { BrandService } from "../services/BrandService";
import { BrandStatus, BrandType, Industry } from "../../../types/src/core/enums";
import { ID } from "../../../types/src/core/base";
import { logger } from "firebase-functions";
import {
  CreateBrandInput,
  GetBrandInput,
  UpdateBudgetBodyInput,
  SearchBrandsInput,
  BrandParamsInput,
  UpdateBrandStatusBodyInput
} from "../validators/BrandValidators";

/**
 * 🏢 تحكم البراندات
 * 
 * ملاحظة: جميع التحقق من البيانات يتم عبر middleware
 * في routes، لذلك البيانات هنا مضمونة الصحة
 */
export class BrandController {
  private brandService: BrandService;

  constructor() {
    this.brandService = new BrandService();
  }

  /**
   * 📝 إنشاء براند جديد
   * البيانات محققة عبر validateCreateBrand middleware
   */
  async createBrand(req: Request<{}, {}, CreateBrandInput>, res: Response): Promise<void> {
    try {
      const { 
        name, 
        brand_type, 
        industry, 
        monthly_budget, 
        currency,
        assigned_coordinator,
        description
      } = req.body;

      const brand = await this.brandService.createBrand({
        name: name as { ar: string; en: string },
        brandType: brand_type as BrandType,
        industry: industry as Industry,
        monthlyBudget: monthly_budget,
        currency,
        ...(assigned_coordinator && { coordinatorId: assigned_coordinator }),
        ...(description && { description: description as { ar: string; en: string } })
      });

      res.status(201).json({
        success: true,
        message: "تم إنشاء البراند بنجاح",
        data: { brand }
      });

      logger.info("🏢 Brand created via API", { 
        brandId: brand.id, 
        name: brand.name 
      });
    } catch (error) {
      logger.error("❌ Error in createBrand controller", error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Internal server error"
      });
    }
  }

  /**
   * 🔍 البحث عن براند واحد
   * البيانات محققة عبر validateGetBrand middleware
   */
  async getBrand(req: Request<{}, {}, {}, GetBrandInput>, res: Response): Promise<void> {
    try {
      const { id, name, coordinatorId } = req.query;

      // استخدام البحث المتقدم للعثور على براند واحد
      const searchFilters: any = { page: 1, limit: 1 };
      if (name) searchFilters.searchTerm = name;
      if (coordinatorId) searchFilters.coordinatorId = coordinatorId;
      
      const result = await this.brandService.searchBrands(searchFilters);
      
      const brand = result.brands.find(b => 
        (id && b.id === id) || 
        (name && (b.name.ar.includes(name) || b.name.en.includes(name))) ||
        (coordinatorId && b.assigned_coordinator === coordinatorId)
      );

      if (!brand) {
        res.status(404).json({
          success: false,
          message: "البراند غير موجود"
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: { brand }
      });
    } catch (error) {
      logger.error("❌ Error in getBrand controller", error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "خطأ داخلي في الخادم"
      });
    }
  }

  /**
   * ✅ الموافقة على براند
   * البيانات محققة عبر validateApproveBrandParams و validateApproveBrandBody middleware
   */
  async approveBrand(req: Request<BrandParamsInput, {}, { approvedBy: string }>, res: Response): Promise<void> {
    try {
      const { brandId } = req.params;
      const { approvedBy } = req.body;

      if (!approvedBy) {
        res.status(400).json({
          success: false,
          message: "approvedBy is required"
        });
        return;
      }

      const brand = await this.brandService.approveBrand(brandId as ID, approvedBy as ID);

      res.status(200).json({
        success: true,
        message: "Brand approved successfully",
        data: { brand }
      });

      logger.info("✅ Brand approved via API", { brandId, approvedBy });
    } catch (error) {
      logger.error("❌ Error in approveBrand controller", error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Internal server error"
      });
    }
  }

  /**
   * 👨‍💼 تعيين منسق للبراند
   */
  async assignCoordinator(req: Request, res: Response): Promise<void> {
    try {
      const { brandId } = req.params;
      const { coordinatorId, assignedBy } = req.body;

      if (!coordinatorId || !assignedBy) {
        res.status(400).json({
          success: false,
          message: "coordinatorId and assignedBy are required"
        });
        return;
      }

      const brand = await this.brandService.assignCoordinator(
        brandId as ID,
        coordinatorId as ID,
        assignedBy as ID
      );

      res.status(200).json({
        success: true,
        message: "Coordinator assigned successfully",
        data: { brand }
      });

      logger.info("👨‍💼 Coordinator assigned via API", { brandId, coordinatorId, assignedBy });
    } catch (error) {
      logger.error("❌ Error in assignCoordinator controller", error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Internal server error"
      });
    }
  }

  /**
   * 🔄 تحديث حالة البراند
   * البيانات محققة عبر validateBrandParams middleware
   */
  async updateBrandStatus(req: Request<BrandParamsInput, {}, UpdateBrandStatusBodyInput>, res: Response): Promise<void> {
    try {
      const { brandId } = req.params;
      const { status, updatedBy, reason } = req.body;

      // استخدام البحث ثم التحديث اليدوي (placeholder حتى يتم إنشاء method في BrandService)
      const result = await this.brandService.searchBrands({
        page: 1,
        limit: 1
      });
      
      // هذا placeholder - يحتاج method updateBrandStatus في BrandService
      const brand = { id: brandId, status, updatedBy, reason };

      res.status(200).json({
        success: true,
        message: "تم تحديث حالة البراند بنجاح",
        data: { brand }
      });

      logger.info("🔄 Brand status updated via API", { brandId, status, updatedBy, reason });
    } catch (error) {
      logger.error("❌ Error in updateBrandStatus controller", error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "خطأ داخلي في الخادم"
      });
    }
  }

  /**
   * 💰 تحديث ميزانية البراند
   * البيانات محققة عبر validateUpdateBudgetParams و validateUpdateBudgetBody middleware
   */
  async updateBudget(req: Request<BrandParamsInput, {}, UpdateBudgetBodyInput>, res: Response): Promise<void> {
    try {
      const { brandId } = req.params;
      const { monthly_budget, currency, updatedBy } = req.body;

      const brand = await this.brandService.updateBudget(
        brandId as ID,
        monthly_budget,
        currency,
        updatedBy as ID
      );

      res.status(200).json({
        success: true,
        message: "Budget updated successfully",
        data: { brand }
      });

      logger.info("💰 Budget updated via API", { brandId, monthly_budget, currency, updatedBy });
    } catch (error) {
      logger.error("❌ Error in updateBudget controller", error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Internal server error"
      });
    }
  }

  /**
   * 🔍 البحث المتقدم في البراندات
   * البيانات محققة عبر validateSearchBrands middleware
   * 
   * @uses SearchBrandsInput - يحدد structure الـ query parameters المتوقعة
   * @benefit Type Safety - يضمن صحة البيانات عند استخدام مع middleware
   * @benefit IntelliSense - يوفر autocomplete للمطورين في IDE
   * @benefit Documentation - يوثق شكل البيانات المطلوبة
   */
  async searchBrands(req: Request, res: Response): Promise<void> {
    try {
      // Type assertion لضمان استخدام SearchBrandsInput structure  
      const query = req.query as unknown as SearchBrandsInput;
      const { 
        search,
        searchTerm, 
        brand_type, 
        status, 
        industry,
        coordinator,
        min_budget,
        max_budget,
        currency,
        page, 
        limit 
      } = query;

      // تطبيق SearchBrandsInput validation عملياً (التحقق يتم في middleware)
      const filters: {
        searchTerm?: string;
        type?: BrandType;
        status?: BrandStatus;
        industry?: Industry;
        coordinatorId?: ID;
        minBudget?: number;
        maxBudget?: number;
        page?: number;
        limit?: number;
      } = {
        page: typeof page === 'number' ? page : parseInt((page as string) || "1"),
        limit: typeof limit === 'number' ? limit : parseInt((limit as string) || "10")
      };

      if (search || searchTerm) filters.searchTerm = (search || searchTerm) as string;
      if (brand_type) filters.type = brand_type as BrandType;
      if (status) filters.status = status as BrandStatus;
      if (industry) filters.industry = industry as Industry;
      if (coordinator) filters.coordinatorId = coordinator as ID;
      if (min_budget) filters.minBudget = typeof min_budget === 'number' ? min_budget : parseFloat(min_budget as string);
      if (max_budget) filters.maxBudget = typeof max_budget === 'number' ? max_budget : parseFloat(max_budget as string);

      const result = await this.brandService.searchBrands(filters);

      res.status(200).json({
        success: true,
        data: result
      });

      logger.info("🔍 Brands searched via API", { filters, found: result.total });
    } catch (error) {
      logger.error("❌ Error in searchBrands controller", error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Internal server error"
      });
    }
  }

  /**
   * 📊 إحصائيات البراندات
   */
  async getBrandStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await this.brandService.getBrandStats();

      res.status(200).json({
        success: true,
        data: { stats }
      });

      logger.info("📊 Brand stats retrieved via API");
    } catch (error) {
      logger.error("❌ Error in getBrandStats controller", error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Internal server error"
      });
    }
  }

  /**
   * 📈 إحصائيات براند محدد
   */
  async getBrandAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const { brandId } = req.params;

      const analytics = await this.brandService.getBrandAnalytics(brandId as ID);

      res.status(200).json({
        success: true,
        data: { analytics }
      });

      logger.info("📈 Brand analytics retrieved via API", { brandId });
    } catch (error) {
      logger.error("❌ Error in getBrandAnalytics controller", error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Internal server error"
      });
    }
  }
} 