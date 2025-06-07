/**
 * 💸 Payment Controller - API المدفوعات
 * ======================================
 * 
 * 📅 محدث: ديسمبر 2024
 * 👨‍💻 المطور: علي جودت
 * 🎯 الهدف: API شامل لإدارة المدفوعات مع Type Safety كامل
 */

import { Request, Response } from 'express';
import { PaymentService, CreatePaymentRequest, PhotographerEarningsReport, Invoice, FinancialReport } from '../services/PaymentService';
import { PaymentSearchOptions, PaymentStats, FinancialStats } from '../repositories/PaymentRepository';
import { Payment } from '../../../types/src/payments';
import { PaymentStatus, PaymentMethod } from '../../../types/src/core/enums';
import { ID, FirebaseTimestamp } from '../../../types/src/core/base';
import { logger } from 'firebase-functions';
import { FieldValue } from 'firebase-admin/firestore';

/**
 * 💸 Payment Controller Class
 */
export class PaymentController {
  private paymentService: PaymentService;

  constructor() {
    this.paymentService = new PaymentService();
    logger.info('💸 PaymentController initialized');
  }

  // ======================================
  // 🆕 إنشاء المدفوعات
  // ======================================

  /**
   * POST /api/payments - إنشاء دفعة جديدة
   */
  async createPayment(req: Request, res: Response): Promise<void> {
    try {
      logger.info('💰 Creating new payment', { body: req.body });

      // التحقق من صحة البيانات
      const {
        type,
        description,
        reference_id,
        recipient_id,
        recipient_name,
        recipient_type,
        contract_type,
        gross_amount,
        deductions,
        currency,
        campaign_id,
        task_ids,
        payment_method,
        due_date,
        payment_details,
        tax_rate,
        processing_fee_rate
      } = req.body;

      if (!type || !description || !reference_id || !recipient_id || !recipient_name || 
          !recipient_type || !contract_type || !gross_amount || !currency || !payment_method) {
        res.status(400).json({
          success: false,
          message: 'البيانات المطلوبة ناقصة',
          error: 'Required fields missing'
        });
        return;
      }

      const createPaymentRequest: CreatePaymentRequest = {
        type,
        description,
        reference_id,
        recipient_id,
        recipient_name,
        recipient_type,
        contract_type,
        gross_amount: parseFloat(gross_amount),
        ...(deductions && { deductions: parseFloat(deductions) }),
        currency,
        ...(campaign_id && { campaign_id }),
        ...(task_ids && { task_ids }),
        payment_method,
        ...(due_date && { due_date }),
        ...(payment_details && { payment_details }),
        ...(tax_rate && { tax_rate: parseFloat(tax_rate) }),
        ...(processing_fee_rate && { processing_fee_rate: parseFloat(processing_fee_rate) })
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
   * GET /api/payments/:id - جلب دفعة بالمعرف
   */
  async getPaymentById(req: Request, res: Response): Promise<void> {
    try {
      const paymentId: ID = req.params['id'] as ID;
      
      if (!paymentId) {
        res.status(400).json({
          success: false,
          message: 'معرف الدفعة مطلوب',
          error: 'Payment ID is required'
        });
        return;
      }

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

  // ======================================
  // ✏️ تحديث حالة المدفوعات
  // ======================================

  /**
   * PATCH /api/payments/:id/status - تحديث حالة الدفعة
   */
  async updatePaymentStatus(req: Request, res: Response): Promise<void> {
    try {
      const paymentId: ID = req.params['id'] as ID;
      const { status, notes, approved_by, rejection_reason, confirmation_number, receipt_url } = req.body;

      if (!paymentId || !status) {
        res.status(400).json({
          success: false,
          message: 'معرف الدفعة والحالة الجديدة مطلوبة',
          error: 'Payment ID and status are required'
        });
        return;
      }

      let updatedPayment: Payment;

      // معالجة حسب نوع التحديث
      switch (status) {
        case 'approved':
          if (!approved_by) {
            res.status(400).json({
              success: false,
              message: 'معرف المعتمد مطلوب للموافقة',
              error: 'Approved by ID is required'
            });
            return;
          }
          updatedPayment = await this.paymentService.approvePayment(paymentId, approved_by, notes);
          break;

        case 'cancelled':
          if (!rejection_reason || !approved_by) {
            res.status(400).json({
              success: false,
              message: 'سبب الرفض ومعرف الرافض مطلوبين',
              error: 'Rejection reason and rejected by ID are required'
            });
            return;
          }
          updatedPayment = await this.paymentService.rejectPayment(paymentId, rejection_reason, approved_by);
          break;

        case 'processing':
          updatedPayment = await this.paymentService.processPayment(paymentId, notes);
          break;

        case 'paid':
          if (!confirmation_number) {
            res.status(400).json({
              success: false,
              message: 'رقم التأكيد مطلوب لتأكيد الدفع',
              error: 'Confirmation number is required'
            });
            return;
          }
          updatedPayment = await this.paymentService.confirmPaymentCompleted(paymentId, confirmation_number, receipt_url);
          break;

        default:
          // للحالات الأخرى استخدم التحديث المباشر
          updatedPayment = await this.paymentService['paymentRepository'].updatePaymentStatus(paymentId, status as PaymentStatus, notes);
          break;
      }

      res.status(200).json({
        success: true,
        message: `تم تحديث حالة الدفعة إلى ${status}`,
        data: updatedPayment
      });

      logger.info('✅ Payment status updated', { paymentId, newStatus: status });
    } catch (error) {
      logger.error('❌ Error updating payment status', error);
      res.status(500).json({
        success: false,
        message: 'خطأ في تحديث حالة الدفعة',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // ======================================
  // 🔍 البحث والفلترة
  // ======================================

  /**
   * GET /api/payments/search - البحث المتقدم في المدفوعات
   */
  async searchPayments(req: Request, res: Response): Promise<void> {
    try {
      logger.info('🔍 Searching payments', { query: req.query });

      // استخراج معايير البحث من query parameters مع الوصول الصحيح للخصائص
      const searchOptions: PaymentSearchOptions = {};

      if (req.query['recipient_id']) {
        searchOptions.recipient_id = req.query['recipient_id'] as string;
      }
      
      if (req.query['campaign_id']) {
        searchOptions.campaign_id = req.query['campaign_id'] as string;
      }

      if (req.query['status']) {
        searchOptions.status = req.query['status'] as PaymentStatus;
      }

      if (req.query['payment_method']) {
        searchOptions.payment_method = req.query['payment_method'] as PaymentMethod;
      }

      if (req.query['recipient_type']) {
        searchOptions.recipient_type = req.query['recipient_type'] as 'photographer' | 'coordinator' | 'vendor';
      }

      if (req.query['type']) {
        searchOptions.type = req.query['type'] as 'task_payment' | 'monthly_salary' | 'bonus' | 'reimbursement';
      }

      if (req.query['currency']) {
        searchOptions.currency = req.query['currency'] as string;
      }

      if (req.query['min_amount']) {
        searchOptions.min_amount = parseFloat(req.query['min_amount'] as string);
      }

      if (req.query['max_amount']) {
        searchOptions.max_amount = parseFloat(req.query['max_amount'] as string);
      }

      // تحويل التواريخ مع التعامل الصحيح مع FirebaseTimestamp
      if (req.query['date_from']) {
        const dateFrom = new Date(req.query['date_from'] as string);
        searchOptions.date_from = {
          seconds: Math.floor(dateFrom.getTime() / 1000),
          nanoseconds: 0
        } as FirebaseTimestamp;
      }

      if (req.query['date_to']) {
        const dateTo = new Date(req.query['date_to'] as string);
        searchOptions.date_to = {
          seconds: Math.floor(dateTo.getTime() / 1000),
          nanoseconds: 0
        } as FirebaseTimestamp;
      }

      const payments = await this.paymentService.searchPayments(searchOptions);

      res.status(200).json({
        success: true,
        message: `تم العثور على ${payments.length} دفعة`,
        data: payments,
        count: payments.length
      });

      logger.info('🔍 Payments search completed', { count: payments.length });
    } catch (error) {
      logger.error('❌ Error searching payments', error);
      res.status(500).json({
        success: false,
        message: 'خطأ في البحث عن المدفوعات',
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
      logger.info('📊 Getting payment statistics');

      // استخراج فلاتر الإحصائيات مع الوصول الصحيح للخصائص
      const searchOptions: PaymentSearchOptions = {};
      
      if (req.query['recipient_id']) {
        searchOptions.recipient_id = req.query['recipient_id'] as string;
      }
      
      if (req.query['campaign_id']) {
        searchOptions.campaign_id = req.query['campaign_id'] as string;
      }

      // استخدام PaymentStats type لضمان Type Safety في الإحصائيات الأساسية
      const stats: PaymentStats = await this.paymentService.getPaymentStats(searchOptions);

      res.status(200).json({
        success: true,
        message: 'تم جلب إحصائيات المدفوعات بنجاح',
        data: stats as PaymentStats
      });

      logger.info('📊 Payment statistics retrieved');
    } catch (error) {
      logger.error('❌ Error getting payment statistics', error);
      res.status(500).json({
        success: false,
        message: 'خطأ في جلب إحصائيات المدفوعات',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * GET /api/payments/financial-stats - الإحصائيات المالية المتقدمة
   */
  async getAdvancedFinancialStats(req: Request, res: Response): Promise<void> {
    try {
      logger.info('💰 Getting advanced financial statistics');

      const searchOptions: PaymentSearchOptions = {};
      
      if (req.query['recipient_id']) {
        searchOptions.recipient_id = req.query['recipient_id'] as string;
      }
      
      if (req.query['campaign_id']) {
        searchOptions.campaign_id = req.query['campaign_id'] as string;
      }

      // استخدام FinancialStats type للإحصائيات المالية المتقدمة مع التفاصيل الشاملة
      const financialStats: FinancialStats = await this.paymentService.getAdvancedFinancialStats(searchOptions);

      res.status(200).json({
        success: true,
        message: 'تم جلب الإحصائيات المالية المتقدمة بنجاح',
        data: financialStats as FinancialStats
      });

      logger.info('💰 Advanced financial statistics retrieved');
    } catch (error) {
      logger.error('❌ Error getting advanced financial statistics', error);
      res.status(500).json({
        success: false,
        message: 'خطأ في جلب الإحصائيات المالية المتقدمة',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * GET /api/payments/financial-reports - التقارير المالية الشاملة
   */
  async getFinancialReports(req: Request, res: Response): Promise<void> {
    try {
      logger.info('📈 Generating financial reports');

      const { start_date, end_date } = req.query;

      if (!start_date || !end_date) {
        res.status(400).json({
          success: false,
          message: 'تواريخ البداية والنهاية مطلوبة',
          error: 'Start date and end date are required'
        });
        return;
      }

      // تحويل التواريخ مع استخدام FieldValue للتوافق مع FirebaseTimestamp
      const startDate = FieldValue.serverTimestamp() as FirebaseTimestamp;
      const endDate = FieldValue.serverTimestamp() as FirebaseTimestamp;
      
      // تحديد التواريخ الفعلية للبحث
      const actualStartTime = Math.floor(new Date(start_date as string).getTime() / 1000);
      const actualEndTime = Math.floor(new Date(end_date as string).getTime() / 1000);
      
      // استخدام التواريخ المحسوبة في searchOptions إذا احتجنا إليها
      const searchOptionsWithDates: PaymentSearchOptions = {
        date_from: { seconds: actualStartTime, nanoseconds: 0 } as FirebaseTimestamp,
        date_to: { seconds: actualEndTime, nanoseconds: 0 } as FirebaseTimestamp
      };

      // استخدام FinancialReport type لضمان Type Safety
      const report: FinancialReport = await this.paymentService.getFinancialReports(
        searchOptionsWithDates.date_from!,
        searchOptionsWithDates.date_to!
      );

      res.status(200).json({
        success: true,
        message: 'تم إنشاء التقرير المالي بنجاح',
        data: report as FinancialReport
      });

      logger.info('📈 Financial report generated');
    } catch (error) {
      logger.error('❌ Error generating financial reports', error);
      res.status(500).json({
        success: false,
        message: 'خطأ في إنشاء التقرير المالي',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // ======================================
  // 💵 أرباح المصورين
  // ======================================

  /**
   * GET /api/payments/photographer/:id/earnings - أرباح المصور
   */
  async getPhotographerEarnings(req: Request, res: Response): Promise<void> {
    try {
      const photographerId: ID = req.params['id'] as ID;

      if (!photographerId) {
        res.status(400).json({
          success: false,
          message: 'معرف المصور مطلوب',
          error: 'Photographer ID is required'
        });
        return;
      }

      logger.info('💵 Calculating photographer earnings', { photographerId });

      // استخدام Type الصحيح لضمان Type Safety كامل
      const earningsReport: PhotographerEarningsReport = await this.paymentService.calculatePhotographerEarnings(photographerId);

      res.status(200).json({
        success: true,
        message: 'تم حساب أرباح المصور بنجاح',
        data: earningsReport as PhotographerEarningsReport
      });

      logger.info('💵 Photographer earnings calculated', { photographerId });
    } catch (error) {
      logger.error('❌ Error calculating photographer earnings', error);
      res.status(500).json({
        success: false,
        message: 'خطأ في حساب أرباح المصور',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // ======================================
  // 📄 إدارة الفواتير
  // ======================================

  /**
   * POST /api/payments/:id/invoice - إنشاء فاتورة للدفعة
   */
  async generateInvoice(req: Request, res: Response): Promise<void> {
    try {
      const paymentId: ID = req.params['id'] as ID;

      if (!paymentId) {
        res.status(400).json({
          success: false,
          message: 'معرف الدفعة مطلوب',
          error: 'Payment ID is required'
        });
        return;
      }

      logger.info('📄 Generating invoice', { paymentId });

      // استخدام Invoice type لضمان Type Safety
      const invoice: Invoice = await this.paymentService.generateInvoice(paymentId);

      res.status(201).json({
        success: true,
        message: 'تم إنشاء الفاتورة بنجاح',
        data: invoice as Invoice
      });

      logger.info('📄 Invoice generated', { paymentId, invoiceNumber: invoice.invoice_number });
    } catch (error) {
      logger.error('❌ Error generating invoice', error);
      res.status(500).json({
        success: false,
        message: 'خطأ في إنشاء الفاتورة',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // ======================================
  // 📋 المدفوعات المستحقة والمتأخرة
  // ======================================

  /**
   * GET /api/payments/pending - المدفوعات المستحقة
   */
  async getPendingPayments(req: Request, res: Response): Promise<void> {
    try {
      logger.info('📋 Getting pending payments');

      const pendingPayments = await this.paymentService.getPendingPayments();

      res.status(200).json({
        success: true,
        message: `تم العثور على ${pendingPayments.length} دفعة مستحقة`,
        data: pendingPayments,
        count: pendingPayments.length
      });

      logger.info('📋 Pending payments retrieved', { count: pendingPayments.length });
    } catch (error) {
      logger.error('❌ Error getting pending payments', error);
      res.status(500).json({
        success: false,
        message: 'خطأ في جلب المدفوعات المستحقة',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * GET /api/payments/overdue - المدفوعات المتأخرة
   */
  async getOverduePayments(req: Request, res: Response): Promise<void> {
    try {
      logger.info('⏰ Getting overdue payments');

      const overduePayments = await this.paymentService.getOverduePayments();

      res.status(200).json({
        success: true,
        message: `تم العثور على ${overduePayments.length} دفعة متأخرة`,
        data: overduePayments,
        count: overduePayments.length
      });

      logger.info('⏰ Overdue payments retrieved', { count: overduePayments.length });
    } catch (error) {
      logger.error('❌ Error getting overdue payments', error);
      res.status(500).json({
        success: false,
        message: 'خطأ في جلب المدفوعات المتأخرة',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // ======================================
  // 🗑️ حذف المدفوعات
  // ======================================

  /**
   * DELETE /api/payments/:id - حذف/أرشفة دفعة
   */
  async deletePayment(req: Request, res: Response): Promise<void> {
    try {
      const paymentId: ID = req.params['id'] as ID;

      if (!paymentId) {
        res.status(400).json({
          success: false,
          message: 'معرف الدفعة مطلوب',
          error: 'Payment ID is required'
        });
        return;
      }

      logger.info('🗑️ Deleting payment', { paymentId });

      // التحقق من وجود الدفعة أولاً
      const payment = await this.paymentService['paymentRepository'].findById(paymentId);
      
      if (!payment) {
        res.status(404).json({
          success: false,
          message: 'الدفعة غير موجودة',
          error: 'Payment not found'
        });
        return;
      }

      // التحقق من إمكانية الحذف
      if (payment.status === 'paid') {
        res.status(400).json({
          success: false,
          message: 'لا يمكن حذف دفعة مكتملة',
          error: 'Cannot delete completed payment'
        });
        return;
      }

      // حذف الدفعة
      await this.paymentService['paymentRepository'].delete(paymentId);

      res.status(200).json({
        success: true,
        message: 'تم حذف الدفعة بنجاح',
        data: { deleted_payment_id: paymentId }
      });

      logger.info('🗑️ Payment deleted successfully', { paymentId });
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