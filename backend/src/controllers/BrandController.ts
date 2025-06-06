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
import { BrandStatus, BrandType, Industry, ID } from "@/types";
import { logger } from "firebase-functions";

/**
 * 🏢 تحكم البراندات
 */
export class BrandController {
  private brandService: BrandService;

  constructor() {
    this.brandService = new BrandService();
  }

  /**
   * 📝 إنشاء براند جديد
   */
  async createBrand(req: Request, res: Response): Promise<void> {
    try {
      const { 
        name, 
        brandType, 
        industry, 
        monthlyBudget, 
        currency,
        coordinatorId,
        description,
        website,
        socialMedia
      } = req.body;

      // التحقق من البيانات المطلوبة
      if (!name || !brandType || !industry || !monthlyBudget || !currency) {
        res.status(400).json({
          success: false,
          message: "Missing required fields",
          required: ["name", "brandType", "industry", "monthlyBudget", "currency"]
        });
        return;
      }

      const brand = await this.brandService.createBrand({
        name,
        brandType: brandType as BrandType,
        industry: industry as Industry,
        monthlyBudget: Number(monthlyBudget),
        currency,
        coordinatorId,
        description,
        website,
        socialMedia
      });

      res.status(201).json({
        success: true,
        message: "Brand created successfully",
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
   * ✅ الموافقة على براند
   */
  async approveBrand(req: Request, res: Response): Promise<void> {
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
   * 💰 تحديث ميزانية البراند
   */
  async updateBudget(req: Request, res: Response): Promise<void> {
    try {
      const { brandId } = req.params;
      const { monthlyBudget, currency, updatedBy } = req.body;

      if (!monthlyBudget || !currency || !updatedBy) {
        res.status(400).json({
          success: false,
          message: "monthlyBudget, currency, and updatedBy are required"
        });
        return;
      }

      const brand = await this.brandService.updateBudget(
        brandId as ID,
        Number(monthlyBudget),
        currency,
        updatedBy as ID
      );

      res.status(200).json({
        success: true,
        message: "Budget updated successfully",
        data: { brand }
      });

      logger.info("💰 Budget updated via API", { brandId, monthlyBudget, currency, updatedBy });
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
   */
  async searchBrands(req: Request, res: Response): Promise<void> {
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
        page = "1", 
        limit = "10" 
      } = req.query;

      const filters: {
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
      } = {
        page: parseInt(page as string),
        limit: parseInt(limit as string)
      };

      if (searchTerm) filters.searchTerm = searchTerm as string;
      if (type) filters.type = type as BrandType;
      if (status) filters.status = status as BrandStatus;
      if (industry) filters.industry = industry as Industry;
      if (coordinatorId) filters.coordinatorId = coordinatorId as ID;
      if (minBudget) filters.minBudget = Number(minBudget);
      if (maxBudget) filters.maxBudget = Number(maxBudget);
      if (isActive === "true") filters.isActive = true;
      if (isActive === "false") filters.isActive = false;

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