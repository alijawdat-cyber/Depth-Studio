/**
 * 🏢 Brand Repository - Depth Studio
 * ==================================
 * 
 * 📅 محدث: ديسمبر 2024
 * 👨‍💻 المطور: علي جودت
 * 🎯 الهدف: إدارة البراندات بأنواع محكمة 100%
 */

import { Brand } from "../../../types/src/brands";
import { BrandStatus, BrandType, Industry } from "../../../types/src/core/enums";
import { ID } from "../../../types/src/core/base";
import { BaseRepository, QueryOptions } from "./BaseRepository";
import { DATABASE_CONFIG } from "../config/firebase";
import { logger } from "firebase-functions";

/**
 * 🏢 مستودع البراندات
 */
export class BrandRepository extends BaseRepository<Brand> {
  constructor() {
    super(DATABASE_CONFIG.COLLECTIONS.BRANDS);
  }

  /**
   * 📊 البحث عن البراندات حسب الحالة
   */
  async findByStatus(status: BrandStatus, options: QueryOptions = {}): Promise<Brand[]> {
    try {
      const queryOptions: QueryOptions = {
        ...options,
        where: [
          ...(options.where || []),
          { field: "status", operator: "==", value: status }
        ]
      };

      const brands = await this.findAll(queryOptions);
      logger.info("📊 Brands found by status", { status, count: brands.length });
      
      return brands;
    } catch (error) {
      logger.error("❌ Error finding brands by status", { status, error });
      throw new Error(`Failed to find brands by status: ${error}`);
    }
  }

  /**
   * 🏭 البحث عن البراندات حسب النوع
   */
  async findByType(type: BrandType, options: QueryOptions = {}): Promise<Brand[]> {
    try {
      const queryOptions: QueryOptions = {
        ...options,
        where: [
          ...(options.where || []),
          { field: "brand_type", operator: "==", value: type }
        ]
      };

      const brands = await this.findAll(queryOptions);
      logger.info("🏭 Brands found by type", { type, count: brands.length });
      
      return brands;
    } catch (error) {
      logger.error("❌ Error finding brands by type", { type, error });
      throw new Error(`Failed to find brands by type: ${error}`);
    }
  }

  /**
   * 🏭 البحث عن البراندات حسب الصناعة
   */
  async findByIndustry(industry: Industry, options: QueryOptions = {}): Promise<Brand[]> {
    try {
      const queryOptions: QueryOptions = {
        ...options,
        where: [
          ...(options.where || []),
          { field: "industry", operator: "==", value: industry }
        ]
      };

      const brands = await this.findAll(queryOptions);
      logger.info("🏭 Brands found by industry", { industry, count: brands.length });
      
      return brands;
    } catch (error) {
      logger.error("❌ Error finding brands by industry", { industry, error });
      throw new Error(`Failed to find brands by industry: ${error}`);
    }
  }

  /**
   * 👨‍💼 البحث عن البراندات حسب المنسق
   */
  async findByCoordinator(coordinatorId: ID, options: QueryOptions = {}): Promise<Brand[]> {
    try {
      const queryOptions: QueryOptions = {
        ...options,
        where: [
          ...(options.where || []),
          { field: "assigned_coordinator", operator: "==", value: coordinatorId }
        ]
      };

      const brands = await this.findAll(queryOptions);
      logger.info("👨‍💼 Brands found by coordinator", { coordinatorId, count: brands.length });
      
      return brands;
    } catch (error) {
      logger.error("❌ Error finding brands by coordinator", { coordinatorId, error });
      throw new Error(`Failed to find brands by coordinator: ${error}`);
    }
  }

  /**
   * 💰 البحث عن البراندات حسب نطاق الميزانية
   */
  async findByBudgetRange(
    minBudget: number, 
    maxBudget: number, 
    options: QueryOptions = {}
  ): Promise<Brand[]> {
    try {
      const queryOptions: QueryOptions = {
        ...options,
        where: [
          ...(options.where || []),
          { field: "monthly_budget", operator: ">=", value: minBudget },
          { field: "monthly_budget", operator: "<=", value: maxBudget }
        ]
      };

      const brands = await this.findAll(queryOptions);
      logger.info("💰 Brands found by budget range", { 
        minBudget, 
        maxBudget, 
        count: brands.length 
      });
      
      return brands;
    } catch (error) {
      logger.error("❌ Error finding brands by budget range", { 
        minBudget, 
        maxBudget, 
        error 
      });
      throw new Error(`Failed to find brands by budget range: ${error}`);
    }
  }

  /**
   * 🔄 تحديث حالة البراند
   */
  async updateStatus(brandId: ID, status: BrandStatus): Promise<Brand> {
    try {
      const updatedBrand = await this.update(brandId, { status });
      logger.info("🔄 Brand status updated", { brandId, status });
      
      return updatedBrand;
    } catch (error) {
      logger.error("❌ Error updating brand status", { brandId, status, error });
      throw new Error(`Failed to update brand status: ${error}`);
    }
  }

  /**
   * 👨‍💼 تحديث منسق البراند
   */
  async updateCoordinator(brandId: ID, coordinatorId: ID): Promise<Brand> {
    try {
      const updatedBrand = await this.update(brandId, { assigned_coordinator: coordinatorId });
      logger.info("👨‍💼 Brand coordinator updated", { brandId, coordinatorId });
      
      return updatedBrand;
    } catch (error) {
      logger.error("❌ Error updating brand coordinator", { brandId, coordinatorId, error });
      throw new Error(`Failed to update brand coordinator: ${error}`);
    }
  }

  /**
   * 💰 تحديث ميزانية البراند
   */
  async updateBudget(brandId: ID, monthlyBudget: number, currency: string): Promise<Brand> {
    try {
      const updatedBrand = await this.update(brandId, { 
        monthly_budget: monthlyBudget,
        currency 
      });
      logger.info("💰 Brand budget updated", { brandId, monthlyBudget, currency });
      
      return updatedBrand;
    } catch (error) {
      logger.error("❌ Error updating brand budget", { 
        brandId, 
        monthlyBudget, 
        currency, 
        error 
      });
      throw new Error(`Failed to update brand budget: ${error}`);
    }
  }

  /**
   * 🔍 البحث النصي في البراندات
   */
  async searchBrands(searchTerm: string, options: QueryOptions = {}): Promise<Brand[]> {
    try {
      // البحث في أسماء البراندات (العربي والإنجليزي)
      const searchQueries = [
        this.findAll({
          ...options,
          where: [
            ...(options.where || []),
            { field: "name.ar", operator: ">=", value: searchTerm },
            { field: "name.ar", operator: "<=", value: searchTerm + '\uf8ff' }
          ]
        }),
        this.findAll({
          ...options,
          where: [
            ...(options.where || []),
            { field: "name.en", operator: ">=", value: searchTerm },
            { field: "name.en", operator: "<=", value: searchTerm + '\uf8ff' }
          ]
        })
      ];

      const results = await Promise.all(searchQueries);
      const allBrands = results.flat();
      
      // إزالة المكررات
      const uniqueBrands = allBrands.filter((brand, index, self) => 
        index === self.findIndex(b => b.id === brand.id)
      );

      logger.info("🔍 Brand search completed", { 
        searchTerm, 
        totalFound: uniqueBrands.length 
      });
      
      return uniqueBrands;
    } catch (error) {
      logger.error("❌ Error searching brands", { searchTerm, error });
      throw new Error(`Failed to search brands: ${error}`);
    }
  }
} 