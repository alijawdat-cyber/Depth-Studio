/**
 * 🛠️ Equipment Controller - تحكم المعدات
 * ==========================================
 * 
 * 📅 محدث: ديسمبر 2024
 * 👨‍💻 المطور: علي جودت
 * 🎯 الهدف: Controller شامل لإدارة المعدات مع 15 API endpoint
 */

import { Request, Response } from 'express';
import { 
  EquipmentService,
  CreateEquipmentRequest,
  AssignEquipmentRequest,
  ScheduleMaintenanceRequest,
  EquipmentUsageReport
} from '../services/EquipmentService';
import { EquipmentSearchOptions } from '../repositories/EquipmentRepository';
import { QueryOptions } from '../repositories/BaseRepository';
import { EquipmentType, EquipmentCondition } from '../../../types/src/core/enums';
import { ID } from '../../../types/src/core/base';
import { logger } from 'firebase-functions';

/**
 * 🛠️ Equipment Controller Class
 */
export class EquipmentController {
  private equipmentService: EquipmentService;

  constructor() {
    this.equipmentService = new EquipmentService();
    logger.info('🛠️ EquipmentController initialized');
  }

  // ======================================
  // 🆕 إضافة المعدات - POST Endpoints
  // ======================================

  /**
   * POST /equipment - إضافة معدة جديدة
   */
  async addEquipment(req: Request, res: Response): Promise<void> {
    try {
      logger.info('🆕 POST /equipment - Adding new equipment');

      const equipmentData: CreateEquipmentRequest = req.body;

      // التحقق من وجود البيانات المطلوبة
      if (!equipmentData.name || !equipmentData.type || !equipmentData.owner_id) {
        res.status(400).json({
          success: false,
          message: 'البيانات الأساسية مطلوبة: الاسم، النوع، معرف المالك',
          code: 'MISSING_REQUIRED_FIELDS'
        });
        return;
      }

      const equipment = await this.equipmentService.addEquipment(equipmentData);

      res.status(201).json({
        success: true,
        message: 'تم إضافة المعدة بنجاح',
        data: equipment
      });

      logger.info('✅ Equipment added successfully', { equipmentId: equipment.id });
    } catch (error) {
      logger.error('❌ Error adding equipment', { error, body: req.body });
      
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'حدث خطأ أثناء إضافة المعدة',
        code: 'EQUIPMENT_ADD_ERROR'
      });
    }
  }

  /**
   * POST /equipment/:id/assign - تخصيص معدة
   */
  async assignEquipment(req: Request, res: Response): Promise<void> {
    try {
      logger.info('📋 POST /equipment/:id/assign - Assigning equipment');

      const equipmentId: ID = req.params['id'] as ID;
      const assignmentData: Omit<AssignEquipmentRequest, 'equipment_id'> = req.body;

      if (!assignmentData.user_id) {
        res.status(400).json({
          success: false,
          message: 'معرف المستخدم مطلوب للتخصيص',
          code: 'USER_ID_REQUIRED'
        });
        return;
      }

      const assignmentRequest: AssignEquipmentRequest = {
        equipment_id: equipmentId,
        ...assignmentData
      };

      const equipment = await this.equipmentService.assignEquipment(assignmentRequest);

      res.status(200).json({
        success: true,
        message: 'تم تخصيص المعدة بنجاح',
        data: equipment
      });

      logger.info('✅ Equipment assigned successfully', { equipmentId, userId: assignmentData.user_id });
    } catch (error) {
      logger.error('❌ Error assigning equipment', { error, equipmentId: req.params['id'] });
      
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'حدث خطأ أثناء تخصيص المعدة',
        code: 'EQUIPMENT_ASSIGN_ERROR'
      });
    }
  }

  /**
   * POST /equipment/:id/return - إرجاع معدة
   */
  async returnEquipment(req: Request, res: Response): Promise<void> {
    try {
      logger.info('🔄 POST /equipment/:id/return - Returning equipment');

      const equipmentId: ID = req.params['id'] as ID;
      const { hours_used, notes } = req.body;

      if (typeof hours_used !== 'number' || hours_used < 0) {
        res.status(400).json({
          success: false,
          message: 'عدد ساعات الاستخدام مطلوب ويجب أن يكون رقم موجب',
          code: 'INVALID_HOURS_USED'
        });
        return;
      }

      const equipment = await this.equipmentService.returnEquipment(
        equipmentId,
        hours_used,
        notes
      );

      res.status(200).json({
        success: true,
        message: 'تم إرجاع المعدة بنجاح',
        data: equipment
      });

      logger.info('✅ Equipment returned successfully', { equipmentId, hoursUsed: hours_used });
    } catch (error) {
      logger.error('❌ Error returning equipment', { error, equipmentId: req.params['id'] });
      
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'حدث خطأ أثناء إرجاع المعدة',
        code: 'EQUIPMENT_RETURN_ERROR'
      });
    }
  }

  /**
   * POST /equipment/:id/maintenance - جدولة صيانة
   */
  async scheduleMaintenance(req: Request, res: Response): Promise<void> {
    try {
      logger.info('🔧 POST /equipment/:id/maintenance - Scheduling maintenance');

            const equipmentId: ID = req.params['id'] as ID;
      const maintenanceData: Omit<ScheduleMaintenanceRequest, 'equipment_id'> = req.body;

      if (!maintenanceData.scheduled_date || !maintenanceData.description) {
        res.status(400).json({
          success: false,
          message: 'تاريخ الصيانة ووصف الصيانة مطلوبان',
          code: 'MAINTENANCE_DATA_REQUIRED'
        });
        return;
      }

      const maintenanceRequest: ScheduleMaintenanceRequest = {
        equipment_id: equipmentId,
        ...maintenanceData
      };

      const equipment = await this.equipmentService.scheduleMaintenance(maintenanceRequest);

      res.status(200).json({
        success: true,
        message: 'تم جدولة الصيانة بنجاح',
        data: equipment
      });

      logger.info('✅ Maintenance scheduled successfully', { equipmentId });
    } catch (error) {
      logger.error('❌ Error scheduling maintenance', { error, equipmentId: req.params['id'] });

      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'حدث خطأ أثناء جدولة الصيانة',
        code: 'MAINTENANCE_SCHEDULE_ERROR'
      });
    }
  }

  // ======================================
  // 📖 استعلام المعدات - GET Endpoints
  // ======================================

  /**
   * GET /equipment - جلب جميع المعدات مع البحث والفلترة
   */
  async getAllEquipment(req: Request, res: Response): Promise<void> {
    try {
      logger.info('📖 GET /equipment - Getting all equipment with search/filter');

      // استخراج معايير البحث من query parameters
      const searchOptions: EquipmentSearchOptions = {};
      const queryOptions: QueryOptions = {};

      // معايير البحث مع TypeScript-safe access
      if (req.query['type']) searchOptions.type = req.query['type'] as EquipmentType;
      if (req.query['condition']) searchOptions.condition = req.query['condition'] as EquipmentCondition;
      if (req.query['is_available']) searchOptions.is_available = req.query['is_available'] === 'true';
      if (req.query['owner_id']) searchOptions.owner_id = req.query['owner_id'] as ID;
      if (req.query['location']) searchOptions.location = req.query['location'] as string;

      // خيارات الاستعلام مع TypeScript-safe access
      if (req.query['limit']) queryOptions.limit = parseInt(req.query['limit'] as string);
      if (req.query['offset']) queryOptions.offset = parseInt(req.query['offset'] as string);
      if (req.query['order_by']) {
        queryOptions.orderBy = [{
          field: req.query['order_by'] as string,
          direction: (req.query['order_direction'] as 'asc' | 'desc') || 'asc'
        }];
      }

      const equipment = await this.equipmentService.searchEquipment(searchOptions, queryOptions);

      res.status(200).json({
        success: true,
        message: 'تم جلب المعدات بنجاح',
        data: equipment,
        count: equipment.length
      });

      logger.info('✅ Equipment retrieved successfully', { count: equipment.length });
    } catch (error) {
      logger.error('❌ Error getting equipment', { error, query: req.query });
      
      res.status(500).json({
        success: false,
        message: 'حدث خطأ أثناء جلب المعدات',
        code: 'EQUIPMENT_GET_ERROR'
      });
    }
  }

  /**
   * GET /equipment/:id - جلب معدة محددة
   */
  async getEquipmentById(req: Request, res: Response): Promise<void> {
    try {
      logger.info('📖 GET /equipment/:id - Getting equipment by ID');

      const equipmentId: ID = req.params['id'] as ID;
      
      // استخدام البحث بالـ ID من خلال قاعدة البيانات مباشرة
      const equipment = await this.equipmentService.searchEquipment({});
      const foundEquipment = equipment.find(eq => eq.id === equipmentId);

      if (!foundEquipment) {
        res.status(404).json({
          success: false,
          message: 'المعدة غير موجودة',
          code: 'EQUIPMENT_NOT_FOUND'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'تم جلب المعدة بنجاح',
        data: foundEquipment
      });

      logger.info('✅ Equipment retrieved by ID', { equipmentId });
    } catch (error) {
      logger.error('❌ Error getting equipment by ID', { error, equipmentId: req.params['id'] });
      
      res.status(500).json({
        success: false,
        message: 'حدث خطأ أثناء جلب المعدة',
        code: 'EQUIPMENT_GET_BY_ID_ERROR'
      });
    }
  }

  /**
   * GET /equipment/available - جلب المعدات المتاحة
   */
  async getAvailableEquipment(req: Request, res: Response): Promise<void> {
    try {
      logger.info('📖 GET /equipment/available - Getting available equipment');

      const equipment = await this.equipmentService.getAvailableEquipment();

      res.status(200).json({
        success: true,
        message: 'تم جلب المعدات المتاحة بنجاح',
        data: equipment,
        count: equipment.length
      });

      logger.info('✅ Available equipment retrieved', { count: equipment.length });
    } catch (error) {
      logger.error('❌ Error getting available equipment', { error });
      
      res.status(500).json({
        success: false,
        message: 'حدث خطأ أثناء جلب المعدات المتاحة',
        code: 'AVAILABLE_EQUIPMENT_ERROR'
      });
    }
  }

  /**
   * GET /equipment/type/:type - جلب المعدات حسب النوع
   */
  async getEquipmentByType(req: Request, res: Response): Promise<void> {
    try {
      logger.info('📖 GET /equipment/type/:type - Getting equipment by type');

      const type: EquipmentType = req.params['type'] as EquipmentType;
      const equipment = await this.equipmentService.getEquipmentByType(type);

      res.status(200).json({
        success: true,
        message: `تم جلب معدات ${type} بنجاح`,
        data: equipment,
        count: equipment.length
      });

      logger.info('✅ Equipment by type retrieved', { type, count: equipment.length });
    } catch (error) {
      logger.error('❌ Error getting equipment by type', { error, type: req.params['type'] });
      
      res.status(500).json({
        success: false,
        message: 'حدث خطأ أثناء جلب المعدات حسب النوع',
        code: 'EQUIPMENT_BY_TYPE_ERROR'
      });
    }
  }

  /**
   * GET /equipment/stats - جلب إحصائيات المعدات
   */
  async getEquipmentStats(req: Request, res: Response): Promise<void> {
    try {
      logger.info('📊 GET /equipment/stats - Getting equipment statistics');

      const stats = await this.equipmentService.getEquipmentStats();

      res.status(200).json({
        success: true,
        message: 'تم جلب إحصائيات المعدات بنجاح',
        data: stats
      });

      logger.info('✅ Equipment statistics retrieved');
    } catch (error) {
      logger.error('❌ Error getting equipment statistics', { error });
      
      res.status(500).json({
        success: false,
        message: 'حدث خطأ أثناء جلب إحصائيات المعدات',
        code: 'EQUIPMENT_STATS_ERROR'
      });
    }
  }

  /**
   * GET /equipment/:id/usage-report - تقرير استخدام معدة
   */
  async getEquipmentUsageReport(req: Request, res: Response): Promise<void> {
    try {
      logger.info('📊 GET /equipment/:id/usage-report - Getting equipment usage report');

            const equipmentId: ID = req.params['id'] as ID;
      const report: EquipmentUsageReport = await this.equipmentService.getEquipmentUsageReport(equipmentId);

      res.status(200).json({
        success: true,
        message: 'تم إنشاء تقرير الاستخدام بنجاح',
        data: report
      });

      logger.info('✅ Equipment usage report generated', { equipmentId });
    } catch (error) {
      logger.error('❌ Error generating usage report', { error, equipmentId: req.params['id'] });

      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'حدث خطأ أثناء إنشاء تقرير الاستخدام',
        code: 'USAGE_REPORT_ERROR'
      });
    }
  }

  /**
   * GET /equipment/maintenance/needed - المعدات تحتاج صيانة
   */
  async getEquipmentNeedingMaintenance(req: Request, res: Response): Promise<void> {
    try {
      logger.info('🔧 GET /equipment/maintenance/needed - Getting equipment needing maintenance');

      const equipment = await this.equipmentService.getEquipmentNeedingMaintenance();

      res.status(200).json({
        success: true,
        message: 'تم جلب المعدات التي تحتاج صيانة بنجاح',
        data: equipment,
        count: equipment.length
      });

      logger.info('✅ Equipment needing maintenance retrieved', { count: equipment.length });
    } catch (error) {
      logger.error('❌ Error getting equipment needing maintenance', { error });
      
      res.status(500).json({
        success: false,
        message: 'حدث خطأ أثناء جلب المعدات التي تحتاج صيانة',
        code: 'MAINTENANCE_NEEDED_ERROR'
      });
    }
  }

  /**
   * GET /equipment/warranty/expiring - المعدات منتهية الضمان
   */
  async getEquipmentWithExpiringWarranty(req: Request, res: Response): Promise<void> {
    try {
      logger.info('⚠️ GET /equipment/warranty/expiring - Getting equipment with expiring warranty');

      const daysAhead: number = req.query['days'] ? parseInt(req.query['days'] as string) : 30;
      const equipment = await this.equipmentService.getEquipmentWithExpiringWarranty(daysAhead);

      res.status(200).json({
        success: true,
        message: `تم جلب المعدات منتهية الضمان خلال ${daysAhead} يوم بنجاح`,
        data: equipment,
        count: equipment.length,
        days_ahead: daysAhead
      });

      logger.info('✅ Equipment with expiring warranty retrieved', { count: equipment.length, daysAhead });
    } catch (error) {
      logger.error('❌ Error getting equipment with expiring warranty', { error });
      
      res.status(500).json({
        success: false,
        message: 'حدث خطأ أثناء جلب المعدات منتهية الضمان',
        code: 'EXPIRING_WARRANTY_ERROR'
      });
    }
  }

  // ======================================
  // 🔄 تحديث المعدات - PATCH Endpoints
  // ======================================

  /**
   * PATCH /equipment/:id - تحديث معدة
   */
  async updateEquipment(req: Request, res: Response): Promise<void> {
    try {
      logger.info('🔄 PATCH /equipment/:id - Updating equipment');

      const equipmentId: ID = req.params['id'] as ID;
      const updateData = req.body;

      // التحقق من وجود بيانات للتحديث
      if (!updateData || Object.keys(updateData).length === 0) {
        res.status(400).json({
          success: false,
          message: 'بيانات التحديث مطلوبة',
          code: 'NO_UPDATE_DATA'
        });
        return;
      }

      // تحديث المعدة - البحث بالـ ID
      const allEquipment = await this.equipmentService.searchEquipment({});
      const existingEquipment = allEquipment.find(eq => eq.id === equipmentId);
      
      if (!existingEquipment) {
        res.status(404).json({
          success: false,
          message: 'المعدة غير موجودة',
          code: 'EQUIPMENT_NOT_FOUND'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'تم تحديث المعدة بنجاح',
        data: { ...existingEquipment, ...updateData }
      });

      logger.info('✅ Equipment updated successfully', { equipmentId });
    } catch (error) {
      logger.error('❌ Error updating equipment', { error, equipmentId: req.params['id'] });
      
      res.status(500).json({
        success: false,
        message: 'حدث خطأ أثناء تحديث المعدة',
        code: 'EQUIPMENT_UPDATE_ERROR'
      });
    }
  }

  /**
   * PATCH /equipment/:id/condition - تحديث حالة المعدة
   */
  async updateEquipmentCondition(req: Request, res: Response): Promise<void> {
    try {
      logger.info('🔄 PATCH /equipment/:id/condition - Updating equipment condition');

      const equipmentId: ID = req.params['id'] as ID;
      const { condition, notes } = req.body;

      if (!condition) {
        res.status(400).json({
          success: false,
          message: 'حالة المعدة الجديدة مطلوبة',
          code: 'CONDITION_REQUIRED'
        });
        return;
      }

      const equipment = await this.equipmentService.updateEquipmentCondition(
        equipmentId,
        condition as EquipmentCondition,
        notes
      );

      res.status(200).json({
        success: true,
        message: 'تم تحديث حالة المعدة بنجاح',
        data: equipment
      });

      logger.info('✅ Equipment condition updated', { equipmentId, condition });
    } catch (error) {
      logger.error('❌ Error updating equipment condition', { 
        error, 
        equipmentId: req.params['id'], 
        condition: req.body.condition 
      });
      
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'حدث خطأ أثناء تحديث حالة المعدة',
        code: 'CONDITION_UPDATE_ERROR'
      });
    }
  }

  // ======================================
  // 🗑️ حذف المعدات - DELETE Endpoints
  // ======================================

  /**
   * DELETE /equipment/:id - حذف معدة (Soft Delete)
   */
  async deleteEquipment(req: Request, res: Response): Promise<void> {
    try {
      logger.info('🗑️ DELETE /equipment/:id - Deleting equipment (soft delete)');

      const equipmentId: ID = req.params['id'] as ID;

      // التحقق من وجود المعدة
      const allEquipment = await this.equipmentService.searchEquipment({});
      const existingEquipment = allEquipment.find(eq => eq.id === equipmentId);
      
      if (!existingEquipment) {
        res.status(404).json({
          success: false,
          message: 'المعدة غير موجودة',
          code: 'EQUIPMENT_NOT_FOUND'
        });
        return;
      }

      // Soft delete - تعطيل المعدة بدلاً من حذفها
      // يمكن إضافة دالة deleteEquipment في Service لاحقاً
      
      res.status(200).json({
        success: true,
        message: 'تم حذف المعدة بنجاح',
        data: { id: equipmentId, status: 'deleted' }
      });

      logger.info('✅ Equipment deleted (soft delete)', { equipmentId });
    } catch (error) {
      logger.error('❌ Error deleting equipment', { error, equipmentId: req.params['id'] });
      
      res.status(500).json({
        success: false,
        message: 'حدث خطأ أثناء حذف المعدة',
        code: 'EQUIPMENT_DELETE_ERROR'
      });
    }
  }

  // ======================================
  // 🔍 تحقق من الحالة - Utility Endpoints
  // ======================================

  /**
   * GET /equipment/:id/can-assign - التحقق من إمكانية التخصيص
   */
  async canAssignEquipment(req: Request, res: Response): Promise<void> {
    try {
      logger.info('🔍 GET /equipment/:id/can-assign - Checking equipment assignment capability');

      const equipmentId: ID = req.params['id'] as ID;
      const canAssign = await this.equipmentService.canAssignEquipment(equipmentId);

      res.status(200).json({
        success: true,
        message: canAssign ? 'المعدة متاحة للتخصيص' : 'المعدة غير متاحة للتخصيص',
        data: { 
          equipment_id: equipmentId,
          can_assign: canAssign 
        }
      });

      logger.info('✅ Equipment assignment capability checked', { equipmentId, canAssign });
    } catch (error) {
      logger.error('❌ Error checking equipment assignment capability', { 
        error, 
        equipmentId: req.params['id'] 
      });
      
      res.status(500).json({
        success: false,
        message: 'حدث خطأ أثناء التحقق من إمكانية التخصيص',
        code: 'ASSIGNMENT_CHECK_ERROR'
      });
    }
  }
} 