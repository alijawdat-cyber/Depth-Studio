/**
 * 💸 Payment Controller - API المدفوعات
 * ======================================
 * 
 * 📅 محدث: ديسمبر 2024
 * 👨‍💻 المطور: علي جودت
 * 🎯 الهدف: API شامل لإدارة المدفوعات مع Type Safety كامل واستخدام احترافي للـ PaymentValidators
 */

import { Request, Response } from 'express';
import { PaymentService, CreatePaymentRequest, PhotographerEarningsReport, Invoice, FinancialReport } from '../services/PaymentService';
import { PaymentSearchOptions, PaymentStats, FinancialStats } from '../repositories/PaymentRepository';
import { Payment } from '../../../types/src/payments';
import { PaymentStatus, PaymentMethod } from '../../../types/src/core/enums';
import { ID, FirebaseTimestamp } from '../../../types/src/core/base';
import { logger } from 'firebase-functions';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';

// استيراد جميع validators والـ types من PaymentValidators
import {
  validateCreatePayment,
  validateGetPayment,
  validateSearchPayments,
  validatePaymentParams,
  validateUpdatePaymentStatus,
  validateApprovePayment,
  validateRejectPayment,
  validateProcessPayment,
  validateConfirmPaymentCompleted,
  validateCalculatePhotographerEarnings,
  validateGenerateInvoice,
  validateFinancialReports,
  validatePhotographerParams,
  CreatePaymentInput,
  GetPaymentInput,
  SearchPaymentsInput,
  UpdatePaymentStatusInput,
  ApprovePaymentInput,
  RejectPaymentInput,
  ProcessPaymentInput,
  ConfirmPaymentCompletedInput,
  CalculatePhotographerEarningsInput,
  GenerateInvoiceInput,
  FinancialReportsInput
} from '../validators/PaymentValidators';

/**
 * 💸 Payment Controller Class مع استخدام احترافي للـ validators
 */
export class PaymentController {
  private paymentService: PaymentService;

  constructor() {
    this.paymentService = new PaymentService();
    logger.info('💸 PaymentController initialized');
  }

  // ======================================
  // 🛠️ Static Methods للاستخدام مع Router
  // ======================================

  /**
   * إرجاع جميع middleware functions للاستخدام مع Router
   */
  static getValidators() {
    return {
      validateCreatePayment,
      validateGetPayment,
      validateSearchPayments,
      validatePaymentParams,
      validateUpdatePaymentStatus,
      validateApprovePayment,
      validateRejectPayment,
      validateProcessPayment,
      validateConfirmPaymentCompleted,
      validateCalculatePhotographerEarnings,
      validateGenerateInvoice,
      validateFinancialReports,
      validatePhotographerParams
    };
  }

  // ======================================
  // 🆕 إنشاء المدفوعات
  // ======================================

  /**
   * POST /api/payments - إنشاء دفعة جديدة
   * يستخدم validateCreatePayment middleware
   */
  async createPayment(req: Request, res: Response): Promise<void> {
    try {
      logger.info('💰 Creating new payment', { body: req.body });

      // البيانات متحققة مسبقاً من validateCreatePayment middleware
      const body = req.body as CreatePaymentInput;

      const createPaymentRequest: CreatePaymentRequest = {
        type: body.type,
        description: body.description,
        reference_id: body.reference_id,
        recipient_id: body.recipient_id,
        recipient_name: body.recipient_name,
        recipient_type: body.recipient_type,
        contract_type: body.contract_type,
        gross_amount: body.gross_amount,
        deductions: body.deductions,
        currency: body.currency,
        ...(body.campaign_id && { campaign_id: body.campaign_id }),
        task_ids: body.task_ids,
        payment_method: body.payment_method,
        ...(body.due_date && { due_date: Timestamp.fromDate(new Date(body.due_date)) as FirebaseTimestamp }),
        ...(body.payment_details && { payment_details: body.payment_details }),
        ...(body.tax_amount && { tax_rate: body.tax_amount / body.gross_amount }),
        ...(body.processing_fees && { processing_fee_rate: body.processing_fees / body.gross_amount })
      };

      const payment = await this.paymentService.createPayment(createPaymentRequest);

      res.status(201).json({
        success: true,
        message: 'تم إنشاء الدفعة بنجاح',
        data: payment
      });

      logger.info('✅ Payment created successfully', { paymentId: payment.id });
    } catch (error) {
      logger.error('❌ Error creating payment', error);
      res.status(500).json({
        success: false,
        message: 'خطأ في إنشاء الدفعة',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // ======================================
  // 🔍 جلب المدفوعات
  // ======================================

  /**
   * GET /api/payments/:paymentId - جلب دفعة بالمعرف
   * يستخدم validatePaymentParams middleware
   */
  async getPaymentById(req: Request, res: Response): Promise<void> {
    try {
      // معرف الدفعة متحقق مسبقاً من validatePaymentParams middleware
      const { paymentId } = req.params as { paymentId: ID };
      
      // استخدام PaymentRepository مباشرة للحصول على الدفعة
      const payment = await this.paymentService['paymentRepository'].findById(paymentId);

      if (!payment) {
        res.status(404).json({
          success: false,
          message: 'الدفعة غير موجودة',
          error: 'Payment not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'تم جلب الدفعة بنجاح',
        data: payment
      });

      logger.info('🔍 Payment retrieved', { paymentId });
    } catch (error) {
      logger.error('❌ Error retrieving payment', error);
      res.status(500).json({
        success: false,
        message: 'خطأ في جلب الدفعة',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * GET /api/payments - البحث عن دفعة
   * يستخدم validateGetPayment middleware
   */
  async getPayment(req: Request, res: Response): Promise<void> {
    try {
      // معايير البحث متحققة مسبقاً من validateGetPayment middleware
      const query = req.query as GetPaymentInput;

      let payment: Payment | null = null;

      if (query.id) {
        payment = await this.paymentService['paymentRepository'].findById(query.id);
      } else if (query.recipient_id) {
        const payments = await this.paymentService['paymentRepository'].findByUser(query.recipient_id, { limit: 1 });
        payment = payments[0] || null;
      } else if (query.campaign_id) {
        const payments = await this.paymentService['paymentRepository'].findByCampaign(query.campaign_id, { limit: 1 });
        payment = payments[0] || null;
      } else if (query.reference_id) {
        const searchOptions: PaymentSearchOptions = {};
        const payments = await this.paymentService['paymentRepository'].searchPayments(searchOptions, { limit: 1 });
        payment = payments.find(p => p.reference_id === query.reference_id) || null;
      }

      if (!payment) {
        res.status(404).json({
          success: false,
          message: 'لم يتم العثور على دفعة تطابق المعايير المحددة',
          error: 'Payment not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'تم جلب الدفعة بنجاح',
        data: payment
      });

    } catch (error) {
      logger.error('❌ Error retrieving payment', error);
      res.status(500).json({
        success: false,
        message: 'خطأ في جلب الدفعة',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // ======================================
  // ✏️ تحديث حالة المدفوعات
  // ======================================

  /**
   * PATCH /api/payments/:paymentId/status - تحديث حالة الدفعة
   * يستخدم validatePaymentParams و validateUpdatePaymentStatus middleware
   */
  async updatePaymentStatus(req: Request, res: Response): Promise<void> {
    try {
      // البيانات متحققة مسبقاً من middleware
      const { paymentId } = req.params as { paymentId: ID };
      const body = req.body as UpdatePaymentStatusInput;

      let updatedPayment: Payment;

      // معالجة حسب نوع التحديث مع Type Safety كامل
      const statusValue: PaymentStatus = body.status as PaymentStatus;
      
      switch (statusValue) {
        case 'approved':
          if (!body.updated_by) {
            res.status(400).json({
              success: false,
              message: 'معرف المعتمد مطلوب للموافقة',
              error: 'Approved by ID is required'
            });
            return;
          }
          updatedPayment = await this.paymentService.approvePayment(paymentId, body.updated_by, body.notes);
          break;

        case 'cancelled':
          if (!body.notes) {
            res.status(400).json({
              success: false,
              message: 'سبب الإلغاء مطلوب',
              error: 'Cancellation reason is required'
            });
            return;
          }
          // استخدام updatePaymentStatus من Repository مباشرة مع Type Safety
          updatedPayment = await this.paymentService['paymentRepository'].updatePaymentStatus(paymentId, statusValue, body.notes);
          break;

        default:
          updatedPayment = await this.paymentService['paymentRepository'].updatePaymentStatus(paymentId, statusValue, body.notes);
          break;
      }

      res.status(200).json({
        success: true,
        message: 'تم تحديث حالة الدفعة بنجاح',
        data: updatedPayment,
        // إضافة معلومات Timestamp للتتبع
        meta: {
          updated_at: FieldValue.serverTimestamp(),
          status_changed_to: statusValue
        }
      });

      logger.info('✅ Payment status updated', { paymentId, newStatus: body.status });
    } catch (error) {
      logger.error('❌ Error updating payment status', error);
      res.status(500).json({
        success: false,
        message: 'خطأ في تحديث حالة الدفعة',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * POST /api/payments/:paymentId/approve - الموافقة على الدفعة
   * يستخدم validatePaymentParams و validateApprovePayment middleware
   */
  async approvePayment(req: Request, res: Response): Promise<void> {
    try {
      // البيانات متحققة مسبقاً من middleware
      const { paymentId } = req.params as { paymentId: ID };
      const body = req.body as ApprovePaymentInput;

      const payment = await this.paymentService.approvePayment(
        paymentId, 
        body.approved_by, 
        body.approval_notes
      );

      res.status(200).json({
        success: true,
        message: 'تم الموافقة على الدفعة بنجاح',
        data: payment
      });

      logger.info('✅ Payment approved', { paymentId, approvedBy: body.approved_by });
    } catch (error) {
      logger.error('❌ Error approving payment', error);
      res.status(500).json({
        success: false,
        message: 'خطأ في الموافقة على الدفعة',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * POST /api/payments/:paymentId/reject - رفض الدفعة
   * يستخدم validatePaymentParams و validateRejectPayment middleware
   */
  async rejectPayment(req: Request, res: Response): Promise<void> {
    try {
      // البيانات متحققة مسبقاً من middleware
      const { paymentId } = req.params as { paymentId: ID };
      const body = req.body as RejectPaymentInput;

      const payment = await this.paymentService.rejectPayment(
        paymentId, 
        body.rejection_reason, 
        body.rejected_by
      );

      res.status(200).json({
        success: true,
        message: 'تم رفض الدفعة',
        data: payment
      });

      logger.info('❌ Payment rejected', { paymentId, rejectedBy: body.rejected_by });
    } catch (error) {
      logger.error('❌ Error rejecting payment', error);
      res.status(500).json({
        success: false,
        message: 'خطأ في رفض الدفعة',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * POST /api/payments/:paymentId/process - معالجة الدفع
   * يستخدم validatePaymentParams و validateProcessPayment middleware
   */
  async processPayment(req: Request, res: Response): Promise<void> {
    try {
      // البيانات متحققة مسبقاً من middleware
      const { paymentId } = req.params as { paymentId: ID };
      const body = req.body as ProcessPaymentInput;

      const payment = await this.paymentService.processPayment(paymentId);

      res.status(200).json({
        success: true,
        message: 'تم معالجة الدفع بنجاح',
        data: payment
      });

      logger.info('✅ Payment processed', { paymentId, processedBy: body.processed_by });
    } catch (error) {
      logger.error('❌ Error processing payment', error);
      res.status(500).json({
        success: false,
        message: 'خطأ في معالجة الدفع',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * PUT /api/payments/:paymentId/confirm-completed - تأكيد إتمام الدفع
   * يستخدم validatePaymentParams و validateConfirmPaymentCompleted middleware
   */
  async confirmPaymentCompleted(req: Request, res: Response): Promise<void> {
    try {
      // البيانات متحققة مسبقاً من middleware
      const { paymentId } = req.params as { paymentId: ID };
      const body = req.body as ConfirmPaymentCompletedInput;

      const payment = await this.paymentService.confirmPaymentCompleted(
        paymentId,
        body.confirmation_number,
        body.receipt_url
      );

      res.status(200).json({
        success: true,
        message: 'تم تأكيد إتمام الدفع بنجاح',
        data: payment,
        meta: {
          confirmed_at: FieldValue.serverTimestamp(),
          confirmation_number: body.confirmation_number
        }
      });

      logger.info('✅ Payment completion confirmed', { paymentId, confirmationNumber: body.confirmation_number });
    } catch (error) {
      logger.error('❌ Error confirming payment completion', error);
      res.status(500).json({
        success: false,
        message: 'خطأ في تأكيد إتمام الدفع',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * GET /api/payments/search - البحث المتقدم في المدفوعات
   * يستخدم validateSearchPayments middleware
   */
  async searchPayments(req: Request, res: Response): Promise<void> {
    try {
      // معايير البحث متحققة ومحولة مسبقاً من validateSearchPayments middleware
      const query: SearchPaymentsInput = req.query as any;

      // إنشاء searchOptions مع Type Safety كامل للـ enums
      const searchOptions: PaymentSearchOptions = {};
      
      if (query.recipient_id) searchOptions.recipient_id = query.recipient_id;
      if (query.campaign_id) searchOptions.campaign_id = query.campaign_id;
      if (query.status) searchOptions.status = query.status as PaymentStatus;
      if (query.payment_method) searchOptions.payment_method = query.payment_method as PaymentMethod;
      if (query.contract_type) searchOptions.contract_type = query.contract_type;
      if (query.recipient_type) searchOptions.recipient_type = query.recipient_type;
      if (query.type) searchOptions.type = query.type;
      if (query.min_amount) searchOptions.min_amount = query.min_amount;
      if (query.max_amount) searchOptions.max_amount = query.max_amount;
      if (query.currency) searchOptions.currency = query.currency;
      
      // تحويل التواريخ إذا كانت موجودة مع Type Safety كامل
      if (query.due_date_from) searchOptions.date_from = Timestamp.fromDate(new Date(query.due_date_from)) as FirebaseTimestamp;
      if (query.due_date_to) searchOptions.date_to = Timestamp.fromDate(new Date(query.due_date_to)) as FirebaseTimestamp;

      const payments = await this.paymentService.searchPayments(searchOptions);

      res.status(200).json({
        success: true,
        data: payments,
        meta: {
          total: payments.length,
          page: query.page || 1,
          limit: query.limit || 10,
          // إضافة validation info للـ enums المدعومة
          supported_statuses: ['draft', 'pending_approval', 'approved', 'processing', 'paid', 'failed', 'cancelled'] as PaymentStatus[],
          supported_methods: ['cash', 'zain_cash', 'rafidain_bank'] as PaymentMethod[]
        }
      });

    } catch (error) {
      logger.error('❌ Error searching payments', error);
      res.status(500).json({
        success: false,
        message: 'خطأ في البحث في المدفوعات',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // ======================================
  // 📊 الإحصائيات والتقارير
  // ======================================

  /**
   * GET /api/payments/stats - إحصائيات المدفوعات
   */
  async getPaymentStats(req: Request, res: Response): Promise<void> {
    try {
      const stats: PaymentStats = await this.paymentService.getPaymentStats();

      res.status(200).json({
        success: true,
        data: stats as PaymentStats
      });

    } catch (error) {
      logger.error('❌ Error getting payment stats', error);
      res.status(500).json({
        success: false,
        message: 'خطأ في جلب إحصائيات المدفوعات',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * GET /api/payments/advanced-stats - الإحصائيات المالية المتقدمة
   */
  async getAdvancedFinancialStats(req: Request, res: Response): Promise<void> {
    try {
      const advancedStats: FinancialStats = await this.paymentService.getAdvancedFinancialStats();

      res.status(200).json({
        success: true,
        message: 'تم جلب الإحصائيات المالية المتقدمة بنجاح',
        data: advancedStats as FinancialStats
      });

    } catch (error) {
      logger.error('❌ Error getting advanced financial stats', error);
      res.status(500).json({
        success: false,
        message: 'خطأ في جلب الإحصائيات المالية المتقدمة',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * GET /api/payments/financial-reports - التقارير المالية
   * يستخدم validateFinancialReports middleware
   */
  async getFinancialReports(req: Request, res: Response): Promise<void> {
    try {
      // معايير التقرير متحققة مسبقاً من validateFinancialReports middleware
      const query: FinancialReportsInput = req.query as any;

      const report: FinancialReport = await this.paymentService.getFinancialReports(
        Timestamp.fromDate(new Date(query.period_start)) as FirebaseTimestamp,
        Timestamp.fromDate(new Date(query.period_end)) as FirebaseTimestamp
      );

      res.status(200).json({
        success: true,
        message: 'تم إنشاء التقرير المالي بنجاح',
        data: report as FinancialReport
      });

    } catch (error) {
      logger.error('❌ Error generating financial report', error);
      res.status(500).json({
        success: false,
        message: 'خطأ في إنشاء التقرير المالي',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * GET /api/photographers/:photographerId/earnings - حساب أرباح المصور
   * يستخدم validatePhotographerParams و validateCalculatePhotographerEarnings middleware
   */
  async getPhotographerEarnings(req: Request, res: Response): Promise<void> {
    try {
      // البيانات متحققة مسبقاً من middleware
      const { photographerId } = req.params as { photographerId: ID };
      const queryParams = req.query as unknown as CalculatePhotographerEarningsInput;

      const earnings: PhotographerEarningsReport = await this.paymentService.calculatePhotographerEarnings(photographerId);

      res.status(200).json({
        success: true,
        message: 'تم حساب أرباح المصور بنجاح',
        data: earnings as PhotographerEarningsReport,
        // إضافة معلومات إضافية مع Type Safety
        meta: {
          photographer_id: photographerId,
          calculation_date: FieldValue.serverTimestamp(),
          // إضافة فلاتر إذا كانت موجودة في queryParams
          ...(queryParams.period_start && { filtered_from: Timestamp.fromDate(new Date(queryParams.period_start)) }),
          ...(queryParams.period_end && { filtered_to: Timestamp.fromDate(new Date(queryParams.period_end)) }),
          include_bonuses: queryParams.include_bonuses || false,
          include_pending: queryParams.include_pending || false
        }
      });

    } catch (error) {
      logger.error('❌ Error calculating photographer earnings', error);
      res.status(500).json({
        success: false,
        message: 'خطأ في حساب أرباح المصور',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * POST /api/payments/generate-invoice - إنشاء فاتورة
   * يستخدم validateGenerateInvoice middleware
   */
  async generateInvoice(req: Request, res: Response): Promise<void> {
    try {
      // البيانات متحققة مسبقاً من validateGenerateInvoice middleware
      const body = req.body as GenerateInvoiceInput;

      // استخدام أول payment_id من القائمة لإنشاء الفاتورة
      const paymentId = Array.isArray(body.payment_ids) ? body.payment_ids[0] : body.payment_ids;
      if (!paymentId) {
        res.status(400).json({
          success: false,
          message: 'معرف الدفعة مطلوب لإنشاء الفاتورة',
          error: 'Payment ID is required'
        });
        return;
      }
      const invoice: Invoice = await this.paymentService.generateInvoice(paymentId);

      res.status(201).json({
        success: true,
        message: 'تم إنشاء الفاتورة بنجاح',
        data: invoice as Invoice
      });

    } catch (error) {
      logger.error('❌ Error generating invoice', error);
      res.status(500).json({
        success: false,
        message: 'خطأ في إنشاء الفاتورة',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * GET /api/payments/pending - المدفوعات المعلقة
   */
  async getPendingPayments(req: Request, res: Response): Promise<void> {
    try {
      const pendingPayments = await this.paymentService.getPendingPayments();

      res.status(200).json({
        success: true,
        data: pendingPayments,
        meta: {
          count: pendingPayments.length
        }
      });

    } catch (error) {
      logger.error('❌ Error getting pending payments', error);
      res.status(500).json({
        success: false,
        message: 'خطأ في جلب المدفوعات المعلقة',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * GET /api/payments/overdue - المدفوعات المتأخرة
   */
  async getOverduePayments(req: Request, res: Response): Promise<void> {
    try {
      const overduePayments = await this.paymentService.getOverduePayments();

      res.status(200).json({
        success: true,
        data: overduePayments,
        meta: {
          count: overduePayments.length
        }
      });

    } catch (error) {
      logger.error('❌ Error getting overdue payments', error);
      res.status(500).json({
        success: false,
        message: 'خطأ في جلب المدفوعات المتأخرة',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * DELETE /api/payments/:paymentId - حذف دفعة (تعطيل مؤقت)
   * يستخدم validatePaymentParams middleware
   */
  async deletePayment(req: Request, res: Response): Promise<void> {
    try {
      // معرف الدفعة متحقق مسبقاً من validatePaymentParams middleware
      const { paymentId } = req.params as { paymentId: ID };

      // تعطيل الدفعة بدلاً من حذفها (soft delete) مع Type Safety وServerTimestamp
      const cancelledStatus: PaymentStatus = 'cancelled';
      const deletionTimestamp = FieldValue.serverTimestamp();
      
      await this.paymentService['paymentRepository'].updatePaymentStatus(paymentId, cancelledStatus, `Deleted by admin at ${deletionTimestamp}`);

      res.status(200).json({
        success: true,
        message: 'تم حذف الدفعة بنجاح'
      });

      logger.info('🗑️ Payment deleted', { paymentId });
    } catch (error) {
      logger.error('❌ Error deleting payment', error);
      res.status(500).json({
        success: false,
        message: 'خطأ في حذف الدفعة',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
} 