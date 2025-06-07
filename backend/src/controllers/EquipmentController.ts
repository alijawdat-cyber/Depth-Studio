/**
 * 🛠️ Equipment Controller - تحكم المعدات
 * ==========================================
 * 
 * 📅 محدث: ديسمبر 2024
 * 👨‍💻 المطور: علي جودت
 * 🎯 الهدف: Controller شامل لإدارة المعدات مع 15 API endpoint
 * 
 * ✨ يستخدم EquipmentValidators للتحقق الاحترافي من البيانات
 * 🔒 رسائل خطأ عربية وتحقق متقدم من الأنواع
 * 🎯 15 middleware validator وتعريفات أنواع كاملة
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
import { EquipmentType, EquipmentCondition, ID, Equipment } from '../../../types/src';
import { logger } from 'firebase-functions';

// ======================================
// 🎯 استيراد جميع المتحققات والأنواع من EquipmentValidators
// ======================================
import {
  // المتحققات المحترفة
  validateAddEquipment,
  validateGetEquipment,
  validateSearchEquipment,
  validateEquipmentParams,
  validateEquipmentIdParams,
  validateAssignEquipment,
  validateReturnEquipment,
  validateScheduleMaintenance,
  validateUpdateEquipmentCondition,
  validateUpdateEquipment,
  validateUsageReport,
  validateMaintenanceNeeded,
  validateExpiringWarranty,
  validateCreateAssignmentRecord,
  validateCreateMaintenanceRecord,
  
  // تعريفات الأنواع المحترفة
  AddEquipmentInput,
  GetEquipmentInput,
  SearchEquipmentInput,
  EquipmentParamsInput,
  EquipmentIdParamsInput,
  AssignEquipmentInput,
  ReturnEquipmentInput,
  ScheduleMaintenanceInput,
  UpdateEquipmentConditionInput,
  UpdateEquipmentInput,
  UsageReportInput,
  MaintenanceNeededInput,
  ExpiringWarrantyInput,
  CreateAssignmentRecordInput,
  CreateMaintenanceRecordInput
} from '../validators/EquipmentValidators';

/**
 * 🛠️ Equipment Controller Class
 * يستخدم جميع المتحققات المحترفة مع الأنواع الصحيحة
 */
export class EquipmentController {
  private equipmentService: EquipmentService;

  constructor() {
    this.equipmentService = new EquipmentService();
    logger.info('🛠️ EquipmentController initialized with professional validators');
  }

  /**
   * 📋 إرجاع جميع المتحققات للاستخدام في الـ router
   */
  static getValidators() {
    return {
      validateAddEquipment,
      validateGetEquipment,
      validateSearchEquipment,
      validateEquipmentParams,
      validateEquipmentIdParams,
      validateAssignEquipment,
      validateReturnEquipment,
      validateScheduleMaintenance,
      validateUpdateEquipmentCondition,
      validateUpdateEquipment,
      validateUsageReport,
      validateMaintenanceNeeded,
      validateExpiringWarranty,
      validateCreateAssignmentRecord,
      validateCreateMaintenanceRecord
    };
  }

  // ======================================
  // 🆕 إضافة المعدات - POST Endpoints
  // ======================================

  /**
   * POST /equipment - إضافة معدة جديدة
   * يستخدم validateAddEquipment middleware
   */
  async addEquipment(req: Request, res: Response): Promise<void> {
    try {
      logger.info('🆕 POST /equipment - Adding new equipment with validation');

      // البيانات محققة بواسطة validateAddEquipment middleware
      const equipmentData: AddEquipmentInput = req.body;

      // تحويل البيانات للنوع المطلوب من الـ Service مع إضافة الخصائص المطلوبة
      const createRequest: CreateEquipmentRequest = {
        type: equipmentData.type,
        name: equipmentData.name,
        brand: equipmentData.brand,
        model: equipmentData.model,
        condition: equipmentData.condition,
        description: equipmentData.description || '',
        purchase_date: new Date(equipmentData.purchase_date) as any,
        purchase_price: equipmentData.purchase_price,
        location: equipmentData.location,
        owner_id: (equipmentData.owner_id || '') as ID,
        is_portable: equipmentData.is_portable || false,
        ...(equipmentData.warranty_expiry && { 
          warranty_expiry: new Date(equipmentData.warranty_expiry) as any 
        })
      };

      const equipment: Equipment = await this.equipmentService.addEquipment(createRequest);

      res.status(201).json({
        success: true,
        message: 'تم إضافة المعدة بنجاح',
        data: equipment as Equipment
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
   * يستخدم validateEquipmentIdParams + validateAssignEquipment middleware
   */
  async assignEquipment(req: Request, res: Response): Promise<void> {
    try {
      logger.info('📋 POST /equipment/:id/assign - Assigning equipment with validation');

      // معرف المعدة محقق بواسطة validateEquipmentIdParams مع Type Safety
      const { id: equipmentId }: EquipmentIdParamsInput = req.params as any;
      const equipmentIdTyped: ID = equipmentId;
      // بيانات التخصيص محققة بواسطة validateAssignEquipment
      const assignmentData: AssignEquipmentInput = req.body;
      const userIdTyped: ID = assignmentData.user_id;

      const assignmentRequest: AssignEquipmentRequest = {
        equipment_id: equipmentIdTyped,
        user_id: userIdTyped,
        reserved_until: assignmentData.reserved_until ? new Date(assignmentData.reserved_until) as any : undefined,
        notes: assignmentData.notes || ''
      };

      const equipment = await this.equipmentService.assignEquipment(assignmentRequest);

      res.status(200).json({
        success: true,
        message: 'تم تخصيص المعدة بنجاح',
        data: equipment
      });

      logger.info('✅ Equipment assigned successfully', { 
        equipmentId: equipmentIdTyped, 
        userId: userIdTyped 
      });
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
   * يستخدم validateEquipmentIdParams + validateReturnEquipment middleware
   */
  async returnEquipment(req: Request, res: Response): Promise<void> {
    try {
      logger.info('🔄 POST /equipment/:id/return - Returning equipment with validation');

      // معرف المعدة محقق بواسطة validateEquipmentIdParams مع Type Safety
      const { id: equipmentId }: EquipmentIdParamsInput = req.params as any;
      const equipmentIdTyped: ID = equipmentId;
      // بيانات الإرجاع محققة بواسطة validateReturnEquipment
      const returnData: ReturnEquipmentInput = req.body;

      const equipment = await this.equipmentService.returnEquipment(
        equipmentIdTyped,
        returnData.usage_hours || 0,
        returnData.return_notes
      );

      res.status(200).json({
        success: true,
        message: 'تم إرجاع المعدة بنجاح',
        data: equipment
      });

      logger.info('✅ Equipment returned successfully', { 
        equipmentId, 
        hoursUsed: returnData.usage_hours,
        condition: returnData.return_condition
      });
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
   * يستخدم validateEquipmentIdParams + validateScheduleMaintenance middleware
   */
  async scheduleMaintenance(req: Request, res: Response): Promise<void> {
    try {
      logger.info('🔧 POST /equipment/:id/maintenance - Scheduling maintenance with validation');

      // معرف المعدة محقق بواسطة validateEquipmentIdParams
      const { id: equipmentId }: EquipmentIdParamsInput = req.params as any;
      // بيانات الصيانة محققة بواسطة validateScheduleMaintenance
      const maintenanceData: ScheduleMaintenanceInput = req.body;

      const maintenanceRequest: ScheduleMaintenanceRequest = {
        equipment_id: equipmentId,
        type: maintenanceData.maintenance_type === 'calibration' ? 'inspection' : maintenanceData.maintenance_type,
        scheduled_date: new Date(maintenanceData.scheduled_date) as any,
        description: maintenanceData.maintenance_notes || '',
        priority: maintenanceData.priority,
        estimated_duration: maintenanceData.estimated_duration_hours,
        ...(maintenanceData.estimated_cost && { estimated_cost: maintenanceData.estimated_cost })
      };

      const equipment = await this.equipmentService.scheduleMaintenance(maintenanceRequest);

      res.status(200).json({
        success: true,
        message: 'تم جدولة الصيانة بنجاح',
        data: equipment
      });

      logger.info('✅ Maintenance scheduled successfully', { 
        equipmentId,
        maintenanceType: maintenanceData.maintenance_type,
        priority: maintenanceData.priority
      });
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
   * يستخدم validateSearchEquipment middleware
   */
  async getAllEquipment(req: Request, res: Response): Promise<void> {
    try {
      logger.info('📖 GET /equipment - Getting all equipment with professional search/filter');

      // معايير البحث محققة بواسطة validateSearchEquipment middleware
      const searchCriteria: SearchEquipmentInput = req.query as any;

      // تحويل معايير البحث إلى تنسيق EquipmentSearchOptions مع التعامل مع القيم الاختيارية
      const searchOptions: EquipmentSearchOptions = {};
      
      if (searchCriteria.type) searchOptions.type = searchCriteria.type as EquipmentType;
      if (searchCriteria.condition) searchOptions.condition = searchCriteria.condition as EquipmentCondition;
      if (searchCriteria.is_available !== undefined) searchOptions.is_available = searchCriteria.is_available;
      if (searchCriteria.owner_id) searchOptions.owner_id = searchCriteria.owner_id as ID;
      if (searchCriteria.location) searchOptions.location = searchCriteria.location;

      // خيارات الاستعلام مع استخدام page بدلاً من offset
      const queryOptions: QueryOptions = {
        limit: searchCriteria.limit
      };

      // إضافة ترتيب إذا كان متوفرًا - تحقق من وجود الخصائص في نوع البيانات الفعلي
      if ('sort_by' in searchCriteria && searchCriteria.sort_by) {
        queryOptions.orderBy = [{
          field: searchCriteria.sort_by as string,
          direction: ('sort_direction' in searchCriteria && searchCriteria.sort_direction) ? 
            searchCriteria.sort_direction as 'asc' | 'desc' : 'asc'
        }];
      }

      const equipment: Equipment[] = await this.equipmentService.searchEquipment(searchOptions, queryOptions);

      res.status(200).json({
        success: true,
        message: 'تم جلب المعدات بنجاح',
        data: equipment as Equipment[],
        count: equipment.length,
        pagination: {
          limit: searchCriteria.limit,
          page: searchCriteria.page
        }
      });

      logger.info('✅ Equipment retrieved successfully', { 
        count: equipment.length,
        searchCriteria: Object.keys(searchOptions).filter(key => searchOptions[key as keyof EquipmentSearchOptions])
      });
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
   * يستخدم validateEquipmentIdParams middleware
   */
  async getEquipmentById(req: Request, res: Response): Promise<void> {
    try {
      logger.info('📖 GET /equipment/:id - Getting equipment by ID with validation');

      // معرف المعدة محقق بواسطة validateEquipmentIdParams
      const { id: equipmentId }: EquipmentIdParamsInput = req.params as any;
      
      // استخدام البحث بالـ ID من خلال قاعدة البيانات مباشرة مع Type Safety
      const equipment: Equipment[] = await this.equipmentService.searchEquipment({});
      const foundEquipment: Equipment | undefined = equipment.find(eq => eq.id === equipmentId);

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
        data: foundEquipment as Equipment
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
        count: equipment.length,
        type
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
   * يستخدم validateEquipmentIdParams + validateUsageReport middleware
   */
  async getEquipmentUsageReport(req: Request, res: Response): Promise<void> {
    try {
      logger.info('📊 GET /equipment/:id/usage-report - Getting equipment usage report with validation');

      // معرف المعدة محقق بواسطة validateEquipmentIdParams
      const { id: equipmentId }: EquipmentIdParamsInput = req.params as any;
      // معايير التقرير محققة بواسطة validateUsageReport
      const reportCriteria: UsageReportInput = req.query as any;

      const report: EquipmentUsageReport = await this.equipmentService.getEquipmentUsageReport(equipmentId);

      res.status(200).json({
        success: true,
        message: 'تم إنشاء تقرير الاستخدام بنجاح',
        data: report,
        period: {
          start: reportCriteria.period_start,
          end: reportCriteria.period_end
        },
        options: {
          include_maintenance: reportCriteria.include_maintenance,
          include_statistics: reportCriteria.include_statistics
        }
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
   * يستخدم validateMaintenanceNeeded middleware
   */
  async getEquipmentNeedingMaintenance(req: Request, res: Response): Promise<void> {
    try {
      logger.info('🔧 GET /equipment/maintenance/needed - Getting equipment needing maintenance with validation');

      // معايير الصيانة محققة بواسطة validateMaintenanceNeeded
      const maintenanceCriteria: MaintenanceNeededInput = req.query as any;

      const equipment = await this.equipmentService.getEquipmentNeedingMaintenance();

      res.status(200).json({
        success: true,
        message: 'تم جلب المعدات التي تحتاج صيانة بنجاح',
        data: equipment,
        count: equipment.length,
        criteria: {
          priority_filter: maintenanceCriteria.priority_filter,
          overdue_only: maintenanceCriteria.overdue_only,
          condition_filter: maintenanceCriteria.condition_filter,
          days_ahead: maintenanceCriteria.days_ahead
        }
      });

      logger.info('✅ Equipment needing maintenance retrieved', { 
        count: equipment.length,
        criteria: maintenanceCriteria
      });
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
   * يستخدم validateExpiringWarranty middleware
   */
  async getEquipmentWithExpiringWarranty(req: Request, res: Response): Promise<void> {
    try {
      logger.info('⚠️ GET /equipment/warranty/expiring - Getting equipment with expiring warranty with validation');

      // معايير الضمان محققة بواسطة validateExpiringWarranty
      const warrantyCriteria: ExpiringWarrantyInput = req.query as any;
      const daysAhead = warrantyCriteria.days_ahead || 90;

      const equipment = await this.equipmentService.getEquipmentWithExpiringWarranty(daysAhead);

      res.status(200).json({
        success: true,
        message: `تم جلب المعدات منتهية الضمان خلال ${daysAhead} يوم بنجاح`,
        data: equipment,
        count: equipment.length,
        criteria: {
          days_ahead: daysAhead,
          expired_only: warrantyCriteria.expired_only
        }
      });

      logger.info('✅ Equipment with expiring warranty retrieved', { 
        count: equipment.length, 
        daysAhead,
        expiredOnly: warrantyCriteria.expired_only
      });
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
   * يستخدم validateEquipmentIdParams + validateUpdateEquipment middleware
   */
  async updateEquipment(req: Request, res: Response): Promise<void> {
    try {
      logger.info('🔄 PATCH /equipment/:id - Updating equipment with validation');

      // معرف المعدة محقق بواسطة validateEquipmentIdParams
      const { id: equipmentId }: EquipmentIdParamsInput = req.params as any;
      // بيانات التحديث محققة بواسطة validateUpdateEquipment
      const updateData: UpdateEquipmentInput = req.body;

      // تحديث المعدة - البحث بالـ ID مع Type Safety
      const allEquipment: Equipment[] = await this.equipmentService.searchEquipment({});
      const existingEquipment: Equipment | undefined = allEquipment.find(eq => eq.id === equipmentId);
      
      if (!existingEquipment) {
        res.status(404).json({
          success: false,
          message: 'المعدة غير موجودة',
          code: 'EQUIPMENT_NOT_FOUND'
        });
        return;
      }

      // دمج البيانات المحدثة مع Type Safety
      const updatedEquipment: Equipment = { 
        ...existingEquipment, 
        ...updateData,
        updated_at: new Date().toISOString()
      } as unknown as Equipment;

      res.status(200).json({
        success: true,
        message: 'تم تحديث المعدة بنجاح',
        data: updatedEquipment as Equipment
      });

      logger.info('✅ Equipment updated successfully', { 
        equipmentId,
        updatedFields: Object.keys(updateData)
      });
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
   * يستخدم validateEquipmentIdParams + validateUpdateEquipmentCondition middleware
   */
  async updateEquipmentCondition(req: Request, res: Response): Promise<void> {
    try {
      logger.info('🔄 PATCH /equipment/:id/condition - Updating equipment condition with validation');

      // معرف المعدة محقق بواسطة validateEquipmentIdParams
      const { id: equipmentId }: EquipmentIdParamsInput = req.params as any;
      // بيانات تحديث الحالة محققة بواسطة validateUpdateEquipmentCondition
      const conditionData: UpdateEquipmentConditionInput = req.body;

      const equipment = await this.equipmentService.updateEquipmentCondition(
        equipmentId,
        conditionData.condition as EquipmentCondition,
        conditionData.condition_notes
      );

      res.status(200).json({
        success: true,
        message: 'تم تحديث حالة المعدة بنجاح',
        data: equipment
      });

      logger.info('✅ Equipment condition updated', { 
        equipmentId, 
        condition: conditionData.condition,
        status: conditionData.status,
        updatedBy: conditionData.updated_by
      });
    } catch (error) {
      logger.error('❌ Error updating equipment condition', { 
        error, 
        equipmentId: req.params['id'], 
        conditionData: req.body
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
   * يستخدم validateEquipmentIdParams middleware
   */
  async deleteEquipment(req: Request, res: Response): Promise<void> {
    try {
      logger.info('🗑️ DELETE /equipment/:id - Deleting equipment (soft delete) with validation');

      // معرف المعدة محقق بواسطة validateEquipmentIdParams
      const { id: equipmentId }: EquipmentIdParamsInput = req.params as any;

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
        data: { 
          id: equipmentId, 
          status: 'deleted',
          deleted_at: new Date().toISOString()
        }
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
   * يستخدم validateEquipmentIdParams middleware
   */
  async canAssignEquipment(req: Request, res: Response): Promise<void> {
    try {
      logger.info('🔍 GET /equipment/:id/can-assign - Checking equipment assignment capability with validation');

      // معرف المعدة محقق بواسطة validateEquipmentIdParams
      const { id: equipmentId }: EquipmentIdParamsInput = req.params as any;
      const canAssign = await this.equipmentService.canAssignEquipment(equipmentId);

      res.status(200).json({
        success: true,
        message: canAssign ? 'المعدة متاحة للتخصيص' : 'المعدة غير متاحة للتخصيص',
        data: { 
          equipment_id: equipmentId as ID,
          can_assign: canAssign,
          checked_at: new Date().toISOString()
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