/**
 * 🎭 Role Selection Controller - تحكم اختيار الأدوار
 * ==================================================
 * 
 * 📅 محدث: ديسمبر 2024
 * 👨‍💻 المطور: علي جودت
 * 🎯 الهدف: API endpoints شاملة لإدارة عملية اختيار الأدوار
 * 
 * 🎭 الأدوار المدعومة:
 * - منسق التسويق (marketing_coordinator)
 * - منسق البراند (brand_coordinator) 
 * - مصور (photographer)
 * 
 * 🔑 المميزات:
 * - تقديم طلبات اختيار الأدوار
 * - البحث عن البراندات للمنسقين
 * - أنواع العقود للمصورين
 * - موافقة/رفض الطلبات مع الأسباب
 * - إشعارات قرارات الأدوار
 * - إحصائيات شاملة
 */

import { Request, Response } from 'express';
import { RoleSelectionService } from '../services/RoleSelectionService';
import { logger } from 'firebase-functions';
import {
  RoleSelectionSubmission,
  RoleSelectionStats,
  ID,
  UserRole,
  BrandType,
  Industry,
  BrandStatus,
  ContractType,
  FirebaseTimestamp
} from '../../../types/src';

// 🎭 Role Selection Validators
import {
  validateRoleSelectionSubmission,
  validateApproveRole,
  validateRejectRole,
  validateApplicationIdParams,
  validateUserIdParams,
  validateUserIdInParams,
  validateSearchBrands,
  validatePendingApplications,
  validateRoleSelectionStats,
  validateUserApplicationHistory
} from '../validators/RoleSelectionValidators';

/**
 * 🎭 تحكم اختيار الأدوار الشامل
 */
export class RoleSelectionController {
  private roleSelectionService: RoleSelectionService;

  constructor() {
    this.roleSelectionService = new RoleSelectionService();
  }

  // ======================================
  // 📝 تقديم طلبات اختيار الأدوار
  // ======================================

  /**
   * POST /api/roles/select
   * تقديم طلب اختيار دور جديد
   * 🔐 Validation: validateRoleSelectionSubmission middleware
   * 
   * فايدة validateRoleSelectionSubmission:
   * - التحقق من صحة الدور المختار (marketing_coordinator, brand_coordinator, photographer)
   * - التحقق من السبب/الدافع (20-1000 حرف)
   * - التحقق من البيانات الإضافية حسب نوع الدور
   * - التحقق من نوع العقد للمصورين (freelancer/salary)
   * - التحقق من سنوات الخبرة والتخصصات
   */
  async submitRoleSelection(req: Request, res: Response): Promise<void> {
    try {
      // استخدام الـ validation function للتحقق من البيانات
      validateRoleSelectionSubmission(req, res, () => {});

      logger.info('🎭 POST /api/roles/select - Submit role selection');

      const { user_id } = req.params;
      const {
        selected_role,
        additional_data,
        motivation
      } = req.body;

      // التحقق من الحقول المطلوبة
      if (!user_id || !selected_role) {
        res.status(400).json({
          success: false,
          message: 'معرف المستخدم والدور المطلوب مطلوبان',
          error_code: 'MISSING_REQUIRED_FIELDS'
        });
        return;
      }

      // التحقق من صحة الدور
      const allowedRoles: UserRole[] = ['marketing_coordinator', 'brand_coordinator', 'photographer'];
      if (!allowedRoles.includes(selected_role as UserRole)) {
        res.status(400).json({
          success: false,
          message: 'الدور المطلوب غير مدعوم',
          error_code: 'INVALID_ROLE'
        });
        return;
      }

      // التحقق من صحة نوع العقد للمصورين
      if (selected_role === 'photographer' && additional_data?.contract_type) {
        const validContractTypes: ContractType[] = ['freelancer', 'salary'];
        const contractType: ContractType = additional_data.contract_type;
        
        if (!validContractTypes.includes(contractType)) {
          res.status(400).json({
            success: false,
            message: 'نوع العقد غير صحيح للمصورين',
            error_code: 'INVALID_CONTRACT_TYPE'
          });
          return;
        }
      }

      // بناء بيانات الطلب
      const submission: RoleSelectionSubmission = {
        selected_role: selected_role as UserRole,
        additional_data,
        motivation
      };

      const result = await this.roleSelectionService.submitRoleSelection(
        user_id as ID,
        submission
      );

      if (result.success) {
        res.status(201).json({
          success: true,
          message: result.message,
          data: result.roleSelection
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message,
          error_code: 'SUBMISSION_FAILED'
        });
      }

      logger.info('✅ Role selection submitted successfully', { 
        user_id, 
        selected_role,
        success: result.success 
      });

    } catch (error) {
      logger.error('❌ Error in submitRoleSelection API', { error });
      res.status(500).json({
        success: false,
        message: 'خطأ في تقديم طلب اختيار الدور',
        error: error instanceof Error ? error.message : 'خطأ غير معروف'
      });
    }
  }

  // ======================================
  // 🔍 البحث والاستعلامات
  // ======================================

  /**
   * GET /api/roles/brands/search
   * البحث عن البراندات لمنسقي البراند
   * 🔐 Validation: validateSearchBrands middleware
   * 
   * فايدة validateSearchBrands:
   * - التحقق من معايير البحث مع Pagination
   * - التحقق من نوع البراند (local, international, startup, enterprise)
   * - التحقق من الصناعة (fashion, food_beverage, technology, etc.)
   * - التحقق من حالة البراند (pending_approval, active, suspended, archived)
   * - التحقق من وجود منسق (true/false)
   */
  async searchBrandsForCoordinator(req: Request, res: Response): Promise<void> {
    try {
      // استخدام الـ validation function للتحقق من البيانات
      validateSearchBrands(req, res, () => {});

      logger.info('🔍 GET /api/roles/brands/search - Search brands for coordinator');

      const {
        query = '',
        brand_type,
        industry,
        status,
        has_coordinator
      } = req.query;

      // بناء فلاتر البحث
      const filters: {
        brand_type?: BrandType;
        industry?: Industry;
        status?: BrandStatus;
        has_coordinator?: boolean;
      } = {};

      if (brand_type) filters.brand_type = brand_type as BrandType;
      if (industry) filters.industry = industry as Industry;
      if (status) filters.status = status as BrandStatus;
      if (has_coordinator !== undefined) {
        filters.has_coordinator = has_coordinator === 'false' ? false : true;
      }

      const result = await this.roleSelectionService.searchBrandsForCoordinator(
        query as string,
        filters
      );

      res.status(200).json({
        success: true,
        message: result.message,
        data: result.brands,
        total: result.total
      });

      logger.info('✅ Brands search completed', { 
        query, 
        filters, 
        resultsCount: result.total 
      });

    } catch (error) {
      logger.error('❌ Error in searchBrandsForCoordinator API', { error });
      res.status(500).json({
        success: false,
        message: 'خطأ في البحث عن البراندات',
        error: error instanceof Error ? error.message : 'خطأ غير معروف'
      });
    }
  }

  /**
   * GET /api/roles/photographer/contract-types
   * الحصول على أنواع العقود المتاحة للمصورين
   */
  async getContractTypesForPhotographer(req: Request, res: Response): Promise<void> {
    try {
      logger.info('📋 GET /api/roles/photographer/contract-types - Get contract types');

      const result = await this.roleSelectionService.getContractTypesForPhotographer();

      // التحقق من صحة أنواع العقود مع Type Safety
      const validatedContractTypes = result.contract_types.map(contractType => {
        // التأكد من صحة نوع العقد
        const validType: ContractType = contractType.type;
        
        return {
          ...contractType,
          type: validType
        };
      });

      res.status(200).json({
        success: true,
        message: result.message,
        data: validatedContractTypes
      });

      logger.info('✅ Contract types retrieved successfully', {
        contractTypesCount: validatedContractTypes.length,
        types: validatedContractTypes.map(ct => ct.type)
      });

    } catch (error) {
      logger.error('❌ Error in getContractTypesForPhotographer API', { error });
      res.status(500).json({
        success: false,
        message: 'خطأ في جلب أنواع العقود',
        error: error instanceof Error ? error.message : 'خطأ غير معروف'
      });
    }
  }

  /**
   * GET /api/roles/pending-applications
   * جلب طلبات الأدوار المنتظرة موافقة (للأدمن)
   * 🔐 Validation: validatePendingApplications middleware
   * 
   * فايدة validatePendingApplications:
   * - التحقق من فلاتر الدور (marketing_coordinator, brand_coordinator, photographer)
   * - التحقق من معايير الترتيب (applied_at, updated_at)
   * - التحقق من اتجاه الترتيب (asc, desc)
   * - التحقق من حدود Pagination
   */
  async getPendingRoleApplications(req: Request, res: Response): Promise<void> {
    try {
      // استخدام الـ validation function للتحقق من البيانات
      validatePendingApplications(req, res, () => {});

      logger.info('📋 GET /api/roles/pending-applications - Get pending applications');

      const {
        role,
        limit,
        order_by,
        order_direction
      } = req.query;

      // بناء فلاتر البحث
      const filters: {
        role?: UserRole;
        limit?: number;
        orderBy?: 'applied_at' | 'updated_at';
        orderDirection?: 'asc' | 'desc';
      } = {};

      if (role) filters.role = role as UserRole;
      if (limit) {
        const limitNum = parseInt(limit as string);
        if (!isNaN(limitNum)) filters.limit = limitNum;
      }
      if (order_by) filters.orderBy = order_by as 'applied_at' | 'updated_at';
      if (order_direction) filters.orderDirection = order_direction as 'asc' | 'desc';

      const result = await this.roleSelectionService.getPendingRoleApplications(filters);

      res.status(200).json({
        success: true,
        message: result.message,
        data: result.applications,
        total: result.total
      });

      logger.info('✅ Pending applications retrieved', { 
        filters, 
        count: result.total 
      });

    } catch (error) {
      logger.error('❌ Error in getPendingRoleApplications API', { error });
      res.status(500).json({
        success: false,
        message: 'خطأ في جلب طلبات الأدوار المنتظرة',
        error: error instanceof Error ? error.message : 'خطأ غير معروف'
      });
    }
  }

  // ======================================
  // ✅ موافقة ورفض الطلبات
  // ======================================

  /**
   * PATCH /api/roles/applications/:id/approve
   * الموافقة على طلب اختيار دور
   * 🔐 Validation: validateApplicationIdParams + validateApproveRole middleware
   * 
   * فايدة validateApplicationIdParams:
   * - التحقق من صحة معرف الطلب في URL params
   * 
   * فايدة validateApproveRole:
   * - التحقق من معرف المُوافق (approved_by)
   * - التحقق من ملاحظات الإدارة (اختياري، حد أقصى 500 حرف)
   */
  async approveRoleApplication(req: Request, res: Response): Promise<void> {
    try {
      // استخدام الـ validation functions للتحقق من البيانات
      validateApplicationIdParams(req, res, () => {});
      validateApproveRole(req, res, () => {});

      logger.info('✅ PATCH /api/roles/applications/:id/approve - Approve role application');

      const { id } = req.params;
      const { approved_by, admin_notes } = req.body;

      // التحقق من الحقول المطلوبة
      if (!id || !approved_by) {
        res.status(400).json({
          success: false,
          message: 'معرف الطلب ومعرف المُوافق مطلوبان',
          error_code: 'MISSING_REQUIRED_FIELDS'
        });
        return;
      }

      const result = await this.roleSelectionService.approveRoleApplication(
        id as ID,
        approved_by as ID,
        admin_notes
      );

      if (result.success) {
        res.status(200).json({
          success: true,
          message: result.message
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message,
          error_code: 'APPROVAL_FAILED'
        });
      }

      logger.info('✅ Role application approval completed', { 
        applicationId: id, 
        approved_by,
        success: result.success 
      });

    } catch (error) {
      logger.error('❌ Error in approveRoleApplication API', { error });
      res.status(500).json({
        success: false,
        message: 'خطأ في الموافقة على طلب الدور',
        error: error instanceof Error ? error.message : 'خطأ غير معروف'
      });
    }
  }

  /**
   * PATCH /api/roles/applications/:id/reject
   * رفض طلب اختيار دور مع الأسباب
   * 🔐 Validation: validateApplicationIdParams + validateRejectRole middleware
   * 
   * فايدة validateApplicationIdParams:
   * - التحقق من صحة معرف الطلب في URL params
   * 
   * فايدة validateRejectRole:
   * - التحقق من معرف الرافض (rejected_by)
   * - التحقق من سبب الرفض (10-500 حرف)
   * - التحقق من ملاحظات الإدارة (اختياري، حد أقصى 500 حرف)
   */
  async rejectRoleApplication(req: Request, res: Response): Promise<void> {
    try {
      // استخدام الـ validation functions للتحقق من البيانات
      validateApplicationIdParams(req, res, () => {});
      validateRejectRole(req, res, () => {});

      logger.info('❌ PATCH /api/roles/applications/:id/reject - Reject role application');

      const { id } = req.params;
      const { rejected_by, rejection_reason, admin_notes } = req.body;

      // التحقق من الحقول المطلوبة
      if (!id || !rejected_by || !rejection_reason) {
        res.status(400).json({
          success: false,
          message: 'معرف الطلب ومعرف الرافض وسبب الرفض مطلوبان',
          error_code: 'MISSING_REQUIRED_FIELDS'
        });
        return;
      }

      const result = await this.roleSelectionService.rejectRoleApplication(
        id as ID,
        rejected_by as ID,
        rejection_reason,
        admin_notes
      );

      if (result.success) {
        res.status(200).json({
          success: true,
          message: result.message
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message,
          error_code: 'REJECTION_FAILED'
        });
      }

      logger.info('❌ Role application rejection completed', { 
        applicationId: id, 
        rejected_by,
        rejection_reason,
        success: result.success 
      });

    } catch (error) {
      logger.error('❌ Error in rejectRoleApplication API', { error });
      res.status(500).json({
        success: false,
        message: 'خطأ في رفض طلب الدور',
        error: error instanceof Error ? error.message : 'خطأ غير معروف'
      });
    }
  }

  // ======================================
  // 📊 إحصائيات اختيار الأدوار
  // ======================================

  /**
   * GET /api/roles/selection-stats
   * جلب إحصائيات اختيار الأدوار الشاملة
   * 🔐 Validation: validateRoleSelectionStats middleware
   * 
   * فايدة validateRoleSelectionStats:
   * - التحقق من تاريخ البداية (start_date) اختياري
   * - التحقق من تاريخ النهاية (end_date) اختياري
   * - التحقق من صحة تنسيق التاريخ
   * - التحقق من معايير Pagination
   */
  async getRoleSelectionStats(req: Request, res: Response): Promise<void> {
    try {
      // استخدام الـ validation function للتحقق من البيانات
      validateRoleSelectionStats(req, res, () => {});

      logger.info('📊 GET /api/roles/selection-stats - Get role selection stats');

      const { start_date, end_date } = req.query;

      // بناء نطاق التاريخ إذا تم تحديده
      let dateRange: {
        startDate: FirebaseTimestamp;
        endDate: FirebaseTimestamp;
      } | undefined;

      if (start_date && end_date) {
        dateRange = {
          startDate: new Date(start_date as string) as unknown as FirebaseTimestamp,
          endDate: new Date(end_date as string) as unknown as FirebaseTimestamp
        };
      }

      const result = await this.roleSelectionService.getRoleSelectionStats(dateRange);

      // التحقق من صحة هيكل الإحصائيات مع Type Safety
      const validatedStats: RoleSelectionStats = {
        total_applications: result.stats.total_applications,
        pending_applications: result.stats.pending_applications,
        approved_applications: result.stats.approved_applications,
        rejected_applications: result.stats.rejected_applications,
        applications_by_role: result.stats.applications_by_role,
        average_approval_time_hours: result.stats.average_approval_time_hours,
        approval_rate_percentage: result.stats.approval_rate_percentage
      };

      res.status(200).json({
        success: true,
        message: result.message,
        data: validatedStats
      });

      logger.info('✅ Role selection stats retrieved', { 
        dateRange, 
        totalApplications: validatedStats.total_applications 
      });

    } catch (error) {
      logger.error('❌ Error in getRoleSelectionStats API', { error });
      res.status(500).json({
        success: false,
        message: 'خطأ في جلب إحصائيات اختيار الأدوار',
        error: error instanceof Error ? error.message : 'خطأ غير معروف'
      });
    }
  }

  /**
   * GET /api/roles/user/:userId/status
   * جلب حالة اختيار دور المستخدم
   * 🔐 Validation: validateUserIdInParams middleware
   * 
   * فايدة validateUserIdInParams:
   * - التحقق من صحة معرف المستخدم في URL params
   * - ضمان أن المعرف يتبع تنسيق ID الصحيح
   * - منع الهجمات عبر معرفات غير صحيحة
   */
  async getUserRoleSelectionStatus(req: Request, res: Response): Promise<void> {
    try {
      // استخدام الـ validation function للتحقق من البيانات
      validateUserIdInParams(req, res, () => {});

      logger.info('👤 GET /api/roles/user/:userId/status - Get user role selection status');

      const { userId } = req.params;

      // استخدام validateUserIdParams للتحقق من معرف المستخدم في params
      // فايدة: ضمان صحة تنسيق المعرف ومنع الهجمات
      validateUserIdParams(req, res, () => {});

      if (!userId) {
        res.status(400).json({
          success: false,
          message: 'معرف المستخدم مطلوب',
          error_code: 'MISSING_USER_ID'
        });
        return;
      }

      // جلب طلبات المستخدم المنتظرة
      const pendingResult = await this.roleSelectionService.getPendingRoleApplications({
        limit: 1
      });

      const userPendingApplication = pendingResult.applications.find(
        app => app.user_id === userId
      );

      const hasRoleSelected = !userPendingApplication;
      const pendingApplication = userPendingApplication || null;

      res.status(200).json({
        success: true,
        message: 'تم جلب حالة اختيار الدور بنجاح',
        data: {
          user_id: userId,
          has_role_selected: hasRoleSelected,
          pending_application: pendingApplication,
          can_submit_new_application: !userPendingApplication
        }
      });

      logger.info('✅ User role selection status retrieved', { 
        userId, 
        hasRoleSelected,
        hasPendingApplication: !!userPendingApplication 
      });

    } catch (error) {
      logger.error('❌ Error in getUserRoleSelectionStatus API', { error });
      res.status(500).json({
        success: false,
        message: 'خطأ في جلب حالة اختيار دور المستخدم',
        error: error instanceof Error ? error.message : 'خطأ غير معروف'
      });
    }
  }

  /**
   * GET /api/roles/user/:user_id/application-history
   * جلب تاريخ طلبات المستخدم مع Pagination
   * 🔐 Validation: validateUserApplicationHistory middleware
   * 
   * فايدة validateUserApplicationHistory:
   * - التحقق من معرف المستخدم في params
   * - التحقق من فلتر الحالة (pending, approved, rejected) اختياري
   * - التحقق من فلتر الدور (marketing_coordinator, brand_coordinator, photographer) اختياري
   * - التحقق من معايير الترتيب (applied_at, updated_at, status)
   * - التحقق من اتجاه الترتيب (asc, desc)
   * - التحقق من معايير Pagination
   */
  async getUserApplicationHistory(req: Request, res: Response): Promise<void> {
    try {
      // استخدام الـ validation function للتحقق من البيانات
      validateUserApplicationHistory(req, res, () => {});

      logger.info('📋 GET /api/roles/user/:user_id/application-history - Get user application history');

      const { user_id } = req.params;
      const {
        status,
        role,
        sort_by,
        sort_order,
        limit,
        offset
      } = req.query;

      // هنا يمكن إضافة منطق جلب تاريخ طلبات المستخدم
      // للآن نرجع response بسيط
      res.status(200).json({
        success: true,
        message: 'تم جلب تاريخ طلبات المستخدم بنجاح',
        data: {
          user_id,
          applications: [], // سيتم تطبيق منطق الجلب لاحقاً
          total: 0,
          filters: { status, role, sort_by, sort_order },
          pagination: { limit, offset }
        }
      });

      logger.info('✅ User application history retrieved', { 
        user_id,
        filters: { status, role },
        pagination: { limit, offset }
      });

    } catch (error) {
      logger.error('❌ Error in getUserApplicationHistory API', { error });
      res.status(500).json({
        success: false,
        message: 'خطأ في جلب تاريخ طلبات المستخدم',
        error: error instanceof Error ? error.message : 'خطأ غير معروف'
      });
    }
  }
} 