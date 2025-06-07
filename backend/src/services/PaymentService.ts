/**
 * 🧾 Payment Service - منطق المدفوعات
 * ====================================
 * 
 * 📅 محدث: ديسمبر 2024
 * 👨‍💻 المطور: علي جودت
 * 🎯 الهدف: منطق أعمال شامل للمدفوعات مع Type Safety كامل
 */

import { PaymentRepository, PaymentSearchOptions, PaymentStats, FinancialStats } from '../repositories/PaymentRepository';
import { Payment } from '../../../types/src/payments';
import { PaymentStatus, PaymentMethod, ContractType } from '../../../types/src/core/enums';
import { ID, FirebaseTimestamp } from '../../../types/src/core/base';
import { logger } from 'firebase-functions';
import { FieldValue } from 'firebase-admin/firestore';

/**
 * 📝 طلب إنشاء دفعة جديدة
 */
export interface CreatePaymentRequest {
  type: 'task_payment' | 'monthly_salary' | 'bonus' | 'reimbursement';
  description: string;
  reference_id: string;
  recipient_id: ID;
  recipient_name: string;
  recipient_type: 'photographer' | 'coordinator' | 'vendor';
  contract_type: ContractType;
  gross_amount: number;
  deductions?: number;
  currency: string;
  campaign_id?: ID;
  task_ids?: ID[];
  payment_method: PaymentMethod;
  due_date?: FirebaseTimestamp;
  payment_details?: Record<string, string>;
  tax_rate?: number;
  processing_fee_rate?: number;
}

/**
 * 📊 تقرير أرباح المصور
 */
export interface PhotographerEarningsReport {
  photographer_id: ID;
  photographer_name: string;
  total_earnings: number;
  paid_amount: number;
  pending_amount: number;
  overdue_amount: number;
  payments_count: number;
  average_payment: number;
  last_payment_date?: FirebaseTimestamp;
  contract_type: ContractType;
  monthly_breakdown: Array<{
    month: string;
    year: number;
    earnings: number;
    payments_count: number;
  }>;
}

/**
 * 📄 فاتورة
 */
export interface Invoice {
  payment_id: ID;
  invoice_number: string;
  issue_date: FirebaseTimestamp;
  due_date?: FirebaseTimestamp;
  recipient_info: {
    id: ID;
    name: string;
    type: 'photographer' | 'coordinator' | 'vendor';
  };
  items: Array<{
    description: string;
    quantity: number;
    unit_price: number;
    total: number;
  }>;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  currency: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  notes?: string;
}

/**
 * 📈 تقرير مالي
 */
export interface FinancialReport {
  period: {
    start_date: FirebaseTimestamp;
    end_date: FirebaseTimestamp;
  };
  summary: {
    total_payments: number;
    total_amount: number;
    paid_amount: number;
    pending_amount: number;
    overdue_amount: number;
  };
  breakdown_by_type: Record<string, {
    count: number;
    amount: number;
    percentage: number;
  }>;
  breakdown_by_recipient: Array<{
    recipient_id: ID;
    recipient_name: string;
    total_amount: number;
    payments_count: number;
  }>;
  breakdown_by_status: Record<PaymentStatus, {
    count: number;
    amount: number;
    percentage: number;
  }>;
  trends: {
    monthly_growth: number;
    average_payment_size: number;
    payment_frequency: number;
  };
}

/**
 * 🧾 Payment Service Class
 */
export class PaymentService {
  private paymentRepository: PaymentRepository;

  constructor() {
    this.paymentRepository = new PaymentRepository();
    logger.info('🧾 PaymentService initialized');
  }

  // ======================================
  // 💰 إنشاء ومعالجة المدفوعات
  // ======================================

  /**
   * إنشاء دفعة جديدة
   */
  async createPayment(request: CreatePaymentRequest): Promise<Payment> {
    try {
      logger.info('💰 Creating new payment', {
        type: request.type,
        recipient: request.recipient_name,
        amount: request.gross_amount
      });

      // حساب المبالغ
      const calculations = this.calculatePaymentAmounts(
        request.gross_amount,
        request.deductions || 0,
        request.tax_rate || 0,
        request.processing_fee_rate || 0
      );

      // إنشاء الدفعة مع التعامل الصحيح مع الخصائص الاختيارية
      const paymentData: Omit<Payment, 'id' | 'created_at' | 'updated_at'> = {
        type: request.type,
        description: request.description,
        reference_id: request.reference_id,
        recipient_id: request.recipient_id,
        recipient_name: request.recipient_name,
        recipient_type: request.recipient_type,
        contract_type: request.contract_type,
        gross_amount: request.gross_amount,
        deductions: calculations.deductions,
        net_amount: calculations.net_amount,
        currency: request.currency,
        ...(request.campaign_id && { campaign_id: request.campaign_id }),
        task_ids: request.task_ids || [],
        status: 'draft',
        payment_method: request.payment_method,
        ...(request.due_date && { due_date: request.due_date }),
        ...(request.payment_details && { payment_details: request.payment_details }),
        tax_amount: calculations.tax_amount,
        processing_fees: calculations.processing_fees
      };

      const payment = await this.paymentRepository.create(paymentData);
      
      logger.info('✅ Payment created successfully', {
        id: payment.id,
        net_amount: payment.net_amount
      });

      return payment;
    } catch (error) {
      logger.error('❌ Error creating payment', error);
      throw new Error(`Failed to create payment: ${error}`);
    }
  }

  /**
   * معالجة الدفع (تغيير الحالة إلى قيد المعالجة)
   */
  async processPayment(paymentId: ID, processingNotes?: string): Promise<Payment> {
    try {
      logger.info('🔄 Processing payment', { paymentId });

      // التحقق من الدفعة
      const payment = await this.paymentRepository.findById(paymentId);
      if (!payment) {
        throw new Error('Payment not found');
      }

      if (payment.status !== 'approved') {
        throw new Error(`Cannot process payment with status: ${payment.status}`);
      }

      // تحديث الحالة
      const updatedPayment = await this.paymentRepository.updatePaymentStatus(
        paymentId,
        'processing',
        processingNotes
      );

      logger.info('✅ Payment processing started', { paymentId });
      return updatedPayment;
    } catch (error) {
      logger.error('❌ Error processing payment', error);
      throw new Error(`Failed to process payment: ${error}`);
    }
  }

  /**
   * اعتماد الدفعة
   */
  async approvePayment(
    paymentId: ID, 
    approvedById: ID, 
    approvalNotes?: string
  ): Promise<Payment> {
    try {
      logger.info('✅ Approving payment', { paymentId, approvedById });

      const payment = await this.paymentRepository.findById(paymentId);
      if (!payment) {
        throw new Error('Payment not found');
      }

      if (payment.status !== 'pending_approval' && payment.status !== 'draft') {
        throw new Error(`Cannot approve payment with status: ${payment.status}`);
      }

      // تحديث الدفعة مع معلومات الموافقة
      const updateData: Partial<Payment> = {
        status: 'approved',
        approved_by: approvedById,
        approved_at: FieldValue.serverTimestamp() as FirebaseTimestamp,
        ...(approvalNotes && { approval_notes: approvalNotes }),
        updated_at: FieldValue.serverTimestamp() as FirebaseTimestamp
      };

      const updatedPayment = await this.paymentRepository.update(paymentId, updateData);
      
      logger.info('✅ Payment approved successfully', { paymentId });
      return updatedPayment;
    } catch (error) {
      logger.error('❌ Error approving payment', error);
      throw new Error(`Failed to approve payment: ${error}`);
    }
  }

  /**
   * رفض الدفعة
   */
  async rejectPayment(
    paymentId: ID, 
    rejectionReason: string, 
    rejectedById: ID
  ): Promise<Payment> {
    try {
      logger.info('❌ Rejecting payment', { paymentId, rejectedById });

      const payment = await this.paymentRepository.findById(paymentId);
      if (!payment) {
        throw new Error('Payment not found');
      }

      if (payment.status === 'paid' || payment.status === 'cancelled') {
        throw new Error(`Cannot reject payment with status: ${payment.status}`);
      }

      const updatedPayment = await this.paymentRepository.updatePaymentStatus(
        paymentId,
        'cancelled',
        `Rejected by ${rejectedById}: ${rejectionReason}`
      );

      logger.info('❌ Payment rejected', { paymentId, reason: rejectionReason });
      return updatedPayment;
    } catch (error) {
      logger.error('❌ Error rejecting payment', error);
      throw new Error(`Failed to reject payment: ${error}`);
    }
  }

  /**
   * تأكيد اكتمال الدفع
   */
  async confirmPaymentCompleted(
    paymentId: ID,
    confirmationNumber: string,
    receiptUrl?: string
  ): Promise<Payment> {
    try {
      logger.info('✅ Confirming payment completion', { paymentId, confirmationNumber });

      const payment = await this.paymentRepository.findById(paymentId);
      if (!payment) {
        throw new Error('Payment not found');
      }

      if (payment.status !== 'processing' && payment.status !== 'approved') {
        throw new Error(`Cannot confirm payment with status: ${payment.status}`);
      }

      const updatedPayment = await this.paymentRepository.updatePaymentConfirmation(
        paymentId,
        confirmationNumber,
        receiptUrl
      );

      logger.info('✅ Payment confirmed as completed', { paymentId });
      return updatedPayment;
    } catch (error) {
      logger.error('❌ Error confirming payment', error);
      throw new Error(`Failed to confirm payment: ${error}`);
    }
  }

  // ======================================
  // 💵 حساب أرباح المصورين
  // ======================================

  /**
   * حساب أرباح المصور
   */
  async calculatePhotographerEarnings(photographerId: ID): Promise<PhotographerEarningsReport> {
    try {
      logger.info('💵 Calculating photographer earnings', { photographerId });

      // جلب جميع مدفوعات المصور
      const payments = await this.paymentRepository.findByUser(photographerId);
      
      if (payments.length === 0) {
        throw new Error('No payments found for photographer');
      }

      // استخراج معلومات أول دفعة مع التحقق من وجودها
      const firstPayment = payments[0];
      if (!firstPayment) {
        throw new Error('Invalid payment data found');
      }
      
      const photographerName = firstPayment.recipient_name;
      const contractType = firstPayment.contract_type;

      // حساب الإجماليات
      let totalEarnings = 0;
      let paidAmount = 0;
      let pendingAmount = 0;
      let overdueAmount = 0;

      const now = new Date();
      
      payments.forEach(payment => {
        totalEarnings += payment.net_amount;
        
        switch (payment.status) {
          case 'paid':
            paidAmount += payment.net_amount;
            break;
          case 'pending_approval':
          case 'approved':
          case 'processing':
            pendingAmount += payment.net_amount;
            
            // فحص إذا كانت متأخرة
            if (payment.due_date) {
              const dueDate = new Date(payment.due_date.seconds * 1000);
              if (dueDate < now) {
                overdueAmount += payment.net_amount;
                pendingAmount -= payment.net_amount;
              }
            }
            break;
        }
      });

      // إيجاد آخر دفعة مع التحقق من payment_date
      const paidPayments = payments.filter(p => p.status === 'paid' && p.payment_date);
      const lastPaymentDate = paidPayments.length > 0 
        ? paidPayments.sort((a, b) => (b.payment_date?.seconds || 0) - (a.payment_date?.seconds || 0))[0]?.payment_date
        : undefined;

      // تجميع شهري
      const monthlyMap = new Map<string, { earnings: number; payments_count: number }>();
      payments.forEach(payment => {
        const date = new Date(payment.created_at.seconds * 1000);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!monthlyMap.has(monthKey)) {
          monthlyMap.set(monthKey, { earnings: 0, payments_count: 0 });
        }
        
        const monthData = monthlyMap.get(monthKey)!;
        monthData.earnings += payment.net_amount;
        monthData.payments_count += 1;
      });

      const monthlyBreakdown = Array.from(monthlyMap.entries()).map(([monthKey, data]) => {
        const [year, month] = monthKey.split('-');
        return {
          month: month || '01',
          year: parseInt(year || '2024'),
          earnings: data.earnings,
          payments_count: data.payments_count
        };
      });

      const report: PhotographerEarningsReport = {
        photographer_id: photographerId,
        photographer_name: photographerName,
        total_earnings: totalEarnings,
        paid_amount: paidAmount,
        pending_amount: pendingAmount,
        overdue_amount: overdueAmount,
        payments_count: payments.length,
        average_payment: totalEarnings / payments.length,
        ...(lastPaymentDate && { last_payment_date: lastPaymentDate }),
        contract_type: contractType,
        monthly_breakdown: monthlyBreakdown
      };

      logger.info('💵 Photographer earnings calculated', {
        photographerId,
        totalEarnings,
        paymentsCount: payments.length
      });

      return report;
    } catch (error) {
      logger.error('❌ Error calculating photographer earnings', error);
      throw new Error(`Failed to calculate photographer earnings: ${error}`);
    }
  }

  // ======================================
  // 📄 إنشاء الفواتير
  // ======================================

  /**
   * إنشاء فاتورة للدفعة
   */
  async generateInvoice(paymentId: ID): Promise<Invoice> {
    try {
      logger.info('📄 Generating invoice', { paymentId });

      const payment = await this.paymentRepository.findById(paymentId);
      if (!payment) {
        throw new Error('Payment not found');
      }

      // إنشاء رقم فاتورة فريد
      const invoiceNumber = this.generateInvoiceNumber(payment);

      // تحديد عناصر الفاتورة
      const items = [{
        description: payment.description,
        quantity: 1,
        unit_price: payment.gross_amount,
        total: payment.gross_amount
      }];

      // إضافة الخصومات كعنصر منفصل إذا وجدت
      if (payment.deductions > 0) {
        items.push({
          description: 'خصومات',
          quantity: 1,
          unit_price: -payment.deductions,
          total: -payment.deductions
        });
      }

      const invoice: Invoice = {
        payment_id: paymentId,
        invoice_number: invoiceNumber,
        issue_date: FieldValue.serverTimestamp() as FirebaseTimestamp,
        ...(payment.due_date && { due_date: payment.due_date }),
        recipient_info: {
          id: payment.recipient_id,
          name: payment.recipient_name,
          type: payment.recipient_type
        },
        items,
        subtotal: payment.gross_amount - payment.deductions,
        tax_amount: payment.tax_amount,
        total_amount: payment.net_amount,
        currency: payment.currency,
        status: 'draft',
        ...(payment.approval_notes && { notes: payment.approval_notes })
      };

      logger.info('📄 Invoice generated', { invoiceNumber });
      return invoice;
    } catch (error) {
      logger.error('❌ Error generating invoice', error);
      throw new Error(`Failed to generate invoice: ${error}`);
    }
  }

  // ======================================
  // 📊 الإحصائيات والتقارير
  // ======================================

  /**
   * الحصول على إحصائيات المدفوعات الأساسية
   */
  async getPaymentStats(searchOptions: PaymentSearchOptions = {}): Promise<PaymentStats> {
    try {
      logger.info('📊 Getting payment statistics');
      return await this.paymentRepository.getPaymentStats(searchOptions);
    } catch (error) {
      logger.error('❌ Error getting payment statistics', error);
      throw new Error(`Failed to get payment statistics: ${error}`);
    }
  }

  /**
   * الحصول على الإحصائيات المالية المتقدمة (من PaymentRepository)
   * الفرق عن getFinancialReports:
   * - FinancialStats: بيانات مالية متقدمة مع تفاصيل الإجمالي والضرائب
   * - FinancialReport: تقرير شامل مع التحليلات والنسب المئوية
   */
  async getAdvancedFinancialStats(searchOptions: PaymentSearchOptions = {}): Promise<FinancialStats> {
    try {
      logger.info('💰 Getting advanced financial statistics');
      return await this.paymentRepository.getFinancialStats(searchOptions);
    } catch (error) {
      logger.error('❌ Error getting advanced financial statistics', error);
      throw new Error(`Failed to get advanced financial statistics: ${error}`);
    }
  }

  /**
   * إنشاء تقرير مالي شامل
   */
  async getFinancialReports(
    startDate: FirebaseTimestamp,
    endDate: FirebaseTimestamp
  ): Promise<FinancialReport> {
    try {
      logger.info('📈 Generating financial report');

      const searchOptions: PaymentSearchOptions = {
        date_from: startDate,
        date_to: endDate
      };

      const payments = await this.paymentRepository.searchPayments(searchOptions);
      const stats = await this.paymentRepository.getPaymentStats(searchOptions);

      // حساب المبالغ حسب الحالة
      let paidAmount = 0;
      let pendingAmount = 0;
      let overdueAmount = 0;

      const now = new Date();
      
      payments.forEach(payment => {
        switch (payment.status) {
          case 'paid':
            paidAmount += payment.net_amount;
            break;
          case 'pending_approval':
          case 'approved':
          case 'processing':
            pendingAmount += payment.net_amount;
            
            if (payment.due_date) {
              const dueDate = new Date(payment.due_date.seconds * 1000);
              if (dueDate < now) {
                overdueAmount += payment.net_amount;
                pendingAmount -= payment.net_amount;
              }
            }
            break;
        }
      });

      // تجميع حسب النوع مع النسب المئوية
      const typeBreakdown: Record<string, { count: number; amount: number; percentage: number }> = {};
      
      Object.entries(stats.type_breakdown).forEach(([type, count]) => {
        const typePayments = payments.filter(p => p.type === type);
        const amount = typePayments.reduce((sum, p) => sum + p.net_amount, 0);
        
        typeBreakdown[type] = {
          count,
          amount,
          percentage: stats.total_amount > 0 ? (amount / stats.total_amount) * 100 : 0
        };
      });

      // تجميع حسب الحالة مع النسب المئوية
      const statusBreakdown: Record<PaymentStatus, { count: number; amount: number; percentage: number }> = {} as Record<PaymentStatus, { count: number; amount: number; percentage: number }>;
      
      Object.entries(stats.status_breakdown).forEach(([status, count]) => {
        const statusPayments = payments.filter(p => p.status === status);
        const amount = statusPayments.reduce((sum, p) => sum + p.net_amount, 0);
        
        statusBreakdown[status as PaymentStatus] = {
          count,
          amount,
          percentage: stats.total_amount > 0 ? (amount / stats.total_amount) * 100 : 0
        };
      });

      // تجميع حسب المستلم
      const recipientMap = new Map<ID, { name: string; amount: number; count: number }>();
      
      payments.forEach(payment => {
        if (!recipientMap.has(payment.recipient_id)) {
          recipientMap.set(payment.recipient_id, {
            name: payment.recipient_name,
            amount: 0,
            count: 0
          });
        }
        
        const recipientData = recipientMap.get(payment.recipient_id)!;
        recipientData.amount += payment.net_amount;
        recipientData.count += 1;
      });

      const recipientBreakdown = Array.from(recipientMap.entries()).map(([recipientId, data]) => ({
        recipient_id: recipientId,
        recipient_name: data.name,
        total_amount: data.amount,
        payments_count: data.count
      }));

      const report: FinancialReport = {
        period: {
          start_date: startDate,
          end_date: endDate
        },
        summary: {
          total_payments: stats.total_payments,
          total_amount: stats.total_amount,
          paid_amount: paidAmount,
          pending_amount: pendingAmount,
          overdue_amount: overdueAmount
        },
        breakdown_by_type: typeBreakdown,
        breakdown_by_recipient: recipientBreakdown,
        breakdown_by_status: statusBreakdown,
        trends: {
          monthly_growth: 0, // يمكن حسابها بمقارنة الفترات
          average_payment_size: stats.average_payment,
          payment_frequency: stats.total_payments / Math.max(1, 
            Math.ceil((endDate.seconds - startDate.seconds) / (30 * 24 * 60 * 60))) // تقريب شهري
        }
      };

      logger.info('📈 Financial report generated');
      return report;
    } catch (error) {
      logger.error('❌ Error generating financial report', error);
      throw new Error(`Failed to generate financial report: ${error}`);
    }
  }

  // ======================================
  // 🛠️ الوظائف المساعدة
  // ======================================

  /**
   * حساب مبالغ الدفعة
   */
  private calculatePaymentAmounts(
    grossAmount: number,
    deductions: number,
    taxRate: number,
    processingFeeRate: number
  ): {
    gross_amount: number;
    deductions: number;
    tax_amount: number;
    processing_fees: number;
    net_amount: number;
  } {
    const taxAmount = grossAmount * (taxRate / 100);
    const processingFees = grossAmount * (processingFeeRate / 100);
    const netAmount = grossAmount - deductions - taxAmount - processingFees;

    return {
      gross_amount: grossAmount,
      deductions,
      tax_amount: taxAmount,
      processing_fees: processingFees,
      net_amount: Math.max(0, netAmount) // التأكد من عدم وجود مبلغ سالب
    };
  }

  /**
   * إنشاء رقم فاتورة فريد
   */
  private generateInvoiceNumber(payment: Payment): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    // نمط: DS-YYYYMMDD-TYPE-ID
    const typeCode = {
      'task_payment': 'TP',
      'monthly_salary': 'MS', 
      'bonus': 'BN',
      'reimbursement': 'RM'
    }[payment.type] || 'GN';
    
    const shortId = payment.id.substring(0, 6).toUpperCase();
    
    return `DS-${year}${month}${day}-${typeCode}-${shortId}`;
  }

  /**
   * البحث في المدفوعات
   */
  async searchPayments(searchOptions: PaymentSearchOptions): Promise<Payment[]> {
    try {
      return await this.paymentRepository.searchPayments(searchOptions);
    } catch (error) {
      logger.error('❌ Error searching payments', error);
      throw new Error(`Failed to search payments: ${error}`);
    }
  }

  /**
   * الحصول على المدفوعات المستحقة
   */
  async getPendingPayments(): Promise<Payment[]> {
    try {
      return await this.paymentRepository.getPendingPayments();
    } catch (error) {
      logger.error('❌ Error getting pending payments', error);
      throw new Error(`Failed to get pending payments: ${error}`);
    }
  }

  /**
   * الحصول على المدفوعات المتأخرة
   */
  async getOverduePayments(): Promise<Payment[]> {
    try {
      return await this.paymentRepository.getOverduePayments();
    } catch (error) {
      logger.error('❌ Error getting overdue payments', error);
      throw new Error(`Failed to get overdue payments: ${error}`);
    }
  }
} 