/**
 * 💰 Payment Repository - إدارة المدفوعات
 * =========================================
 * 
 * 📅 محدث: ديسمبر 2024
 * 👨‍💻 المطور: علي جودت
 * 🎯 الهدف: إدارة شاملة للمدفوعات مع Type Safety كامل
 */

import { BaseRepository, QueryOptions, PaginatedResult } from './BaseRepository';
import { Payment } from '../../../types/src/payments';
import { PaymentStatus, PaymentMethod, ContractType } from '../../../types/src/core/enums';
import { ID, FirebaseTimestamp } from '../../../types/src/core/base';
import { logger } from 'firebase-functions';
import { FieldValue } from 'firebase-admin/firestore';

/**
 * 🔍 خيارات البحث في المدفوعات
 */
export interface PaymentSearchOptions {
  recipient_id?: ID;
  campaign_id?: ID;
  status?: PaymentStatus;
  payment_method?: PaymentMethod;
  contract_type?: ContractType;
  recipient_type?: 'photographer' | 'coordinator' | 'vendor';
  type?: 'task_payment' | 'monthly_salary' | 'bonus' | 'reimbursement';
  date_from?: FirebaseTimestamp;
  date_to?: FirebaseTimestamp;
  min_amount?: number;
  max_amount?: number;
  currency?: string;
}

/**
 * 📊 إحصائيات المدفوعات
 */
export interface PaymentStats {
  total_payments: number;
  total_amount: number;
  pending_amount: number;
  approved_amount: number;
  paid_amount: number;
  failed_amount: number;
  average_payment: number;
  currency_breakdown: Record<string, number>;
  status_breakdown: Record<PaymentStatus, number>;
  method_breakdown: Record<PaymentMethod, number>;
  type_breakdown: Record<string, number>;
}

/**
 * 📈 إحصائيات مالية متقدمة
 */
export interface FinancialStats {
  total_gross_amount: number;
  total_deductions: number;
  total_net_amount: number;
  total_tax_amount: number;
  total_processing_fees: number;
  monthly_breakdown: Array<{
    month: string;
    year: number;
    total_amount: number;
    payment_count: number;
  }>;
  recipient_breakdown: Array<{
    recipient_id: ID;
    recipient_name: string;
    total_earned: number;
    payment_count: number;
  }>;
}

/**
 * 💰 Payment Repository Class
 */
export class PaymentRepository extends BaseRepository<Payment> {
  constructor() {
    super('payments');
    logger.info('💰 PaymentRepository initialized');
  }

  // ======================================
  // 🔍 البحث الأساسي
  // ======================================

  /**
   * البحث عن مدفوعات المستخدم
   */
  async findByUser(userId: ID, options: QueryOptions = {}): Promise<Payment[]> {
    try {
      const searchOptions: QueryOptions = {
        ...options,
        where: [
          { field: 'recipient_id', operator: '==', value: userId },
          ...(options.where || [])
        ]
      };

      const payments = await this.findAll(searchOptions);
      logger.info(`🔍 Found ${payments.length} payments for user ${userId}`);
      return payments;
    } catch (error) {
      logger.error('❌ Error finding payments by user', error);
      throw new Error(`Failed to find payments by user: ${error}`);
    }
  }

  /**
   * البحث عن مدفوعات الحملة
   */
  async findByCampaign(campaignId: ID, options: QueryOptions = {}): Promise<Payment[]> {
    try {
      const searchOptions: QueryOptions = {
        ...options,
        where: [
          { field: 'campaign_id', operator: '==', value: campaignId },
          ...(options.where || [])
        ]
      };

      const payments = await this.findAll(searchOptions);
      logger.info(`🔍 Found ${payments.length} payments for campaign ${campaignId}`);
      return payments;
    } catch (error) {
      logger.error('❌ Error finding payments by campaign', error);
      throw new Error(`Failed to find payments by campaign: ${error}`);
    }
  }

  /**
   * البحث عن مدفوعات حسب الحالة
   */
  async findByStatus(status: PaymentStatus, options: QueryOptions = {}): Promise<Payment[]> {
    try {
      const searchOptions: QueryOptions = {
        ...options,
        where: [
          { field: 'status', operator: '==', value: status },
          ...(options.where || [])
        ]
      };

      const payments = await this.findAll(searchOptions);
      logger.info(`🔍 Found ${payments.length} payments with status ${status}`);
      return payments;
    } catch (error) {
      logger.error('❌ Error finding payments by status', error);
      throw new Error(`Failed to find payments by status: ${error}`);
    }
  }

  /**
   * البحث عن مدفوعات حسب التاريخ
   */
  async findByDateRange(
    startDate: FirebaseTimestamp, 
    endDate: FirebaseTimestamp, 
    options: QueryOptions = {}
  ): Promise<Payment[]> {
    try {
      const searchOptions: QueryOptions = {
        ...options,
        where: [
          { field: 'created_at', operator: '>=', value: startDate },
          { field: 'created_at', operator: '<=', value: endDate },
          ...(options.where || [])
        ]
      };

      const payments = await this.findAll(searchOptions);
      logger.info(`🔍 Found ${payments.length} payments in date range`);
      return payments;
    } catch (error) {
      logger.error('❌ Error finding payments by date range', error);
      throw new Error(`Failed to find payments by date range: ${error}`);
    }
  }

  /**
   * البحث عن مدفوعات حسب طريقة الدفع
   */
  async findByPaymentMethod(
    paymentMethod: PaymentMethod, 
    options: QueryOptions = {}
  ): Promise<Payment[]> {
    try {
      const searchOptions: QueryOptions = {
        ...options,
        where: [
          { field: 'payment_method', operator: '==', value: paymentMethod },
          ...(options.where || [])
        ]
      };

      const payments = await this.findAll(searchOptions);
      logger.info(`🔍 Found ${payments.length} payments with method ${paymentMethod}`);
      return payments;
    } catch (error) {
      logger.error('❌ Error finding payments by method', error);
      throw new Error(`Failed to find payments by method: ${error}`);
    }
  }

  /**
   * البحث عن مدفوعات حسب نوع العقد
   */
  async findByContractType(
    contractType: ContractType, 
    options: QueryOptions = {}
  ): Promise<Payment[]> {
    try {
      const searchOptions: QueryOptions = {
        ...options,
        where: [
          { field: 'contract_type', operator: '==', value: contractType },
          ...(options.where || [])
        ]
      };

      const payments = await this.findAll(searchOptions);
      logger.info(`🔍 Found ${payments.length} payments with contract type ${contractType}`);
      return payments;
    } catch (error) {
      logger.error('❌ Error finding payments by contract type', error);
      throw new Error(`Failed to find payments by contract type: ${error}`);
    }
  }

  // ======================================
  // ✏️ تحديث حالة المدفوعات
  // ======================================

  /**
   * تحديث حالة الدفعة
   */
  async updatePaymentStatus(
    paymentId: ID, 
    status: PaymentStatus, 
    notes?: string
  ): Promise<Payment> {
    try {
      const updateData: Partial<Payment> = {
        status,
        updated_at: FieldValue.serverTimestamp() as FirebaseTimestamp
      };

      // إضافة تفاصيل حسب الحالة
      if (status === 'approved' || status === 'paid') {
        updateData.approved_at = FieldValue.serverTimestamp() as FirebaseTimestamp;
      }

      if (status === 'paid') {
        updateData.payment_date = FieldValue.serverTimestamp() as FirebaseTimestamp;
      }

      if (notes) {
        updateData.approval_notes = notes;
      }

      const updatedPayment = await this.update(paymentId, updateData);
      logger.info(`✅ Updated payment ${paymentId} status to ${status}`);
      return updatedPayment;
    } catch (error) {
      logger.error('❌ Error updating payment status', error);
      throw new Error(`Failed to update payment status: ${error}`);
    }
  }

  /**
   * تحديث طريقة الدفع
   */
  async updatePaymentMethod(
    paymentId: ID, 
    paymentMethod: PaymentMethod,
    paymentDetails?: Record<string, string>
  ): Promise<Payment> {
    try {
      const updateData: Partial<Payment> = {
        payment_method: paymentMethod,
        updated_at: FieldValue.serverTimestamp() as FirebaseTimestamp
      };

      if (paymentDetails) {
        updateData.payment_details = paymentDetails;
      }

      const updatedPayment = await this.update(paymentId, updateData);
      logger.info(`✅ Updated payment ${paymentId} method to ${paymentMethod}`);
      return updatedPayment;
    } catch (error) {
      logger.error('❌ Error updating payment method', error);
      throw new Error(`Failed to update payment method: ${error}`);
    }
  }

  /**
   * تحديث معلومات الدفع (رقم التأكيد، رابط الإيصال)
   */
  async updatePaymentConfirmation(
    paymentId: ID,
    confirmationNumber: string,
    receiptUrl?: string
  ): Promise<Payment> {
    try {
      const updateData: Partial<Payment> = {
        confirmation_number: confirmationNumber,
        status: 'paid',
        payment_date: FieldValue.serverTimestamp() as FirebaseTimestamp,
        updated_at: FieldValue.serverTimestamp() as FirebaseTimestamp
      };

      if (receiptUrl) {
        updateData.receipt_url = receiptUrl;
      }

      const updatedPayment = await this.update(paymentId, updateData);
      logger.info(`✅ Updated payment ${paymentId} confirmation`);
      return updatedPayment;
    } catch (error) {
      logger.error('❌ Error updating payment confirmation', error);
      throw new Error(`Failed to update payment confirmation: ${error}`);
    }
  }

  // ======================================
  // 🔍 البحث المتقدم
  // ======================================

  /**
   * البحث المتقدم في المدفوعات
   */
  async searchPayments(
    searchOptions: PaymentSearchOptions,
    queryOptions: QueryOptions = {}
  ): Promise<Payment[]> {
    try {
      const whereConditions = [];

      // بناء شروط البحث
      if (searchOptions.recipient_id) {
        whereConditions.push({
          field: 'recipient_id',
          operator: '==' as const,
          value: searchOptions.recipient_id
        });
      }

      if (searchOptions.campaign_id) {
        whereConditions.push({
          field: 'campaign_id',
          operator: '==' as const,
          value: searchOptions.campaign_id
        });
      }

      if (searchOptions.status) {
        whereConditions.push({
          field: 'status',
          operator: '==' as const,
          value: searchOptions.status
        });
      }

      if (searchOptions.payment_method) {
        whereConditions.push({
          field: 'payment_method',
          operator: '==' as const,
          value: searchOptions.payment_method
        });
      }

      if (searchOptions.contract_type) {
        whereConditions.push({
          field: 'contract_type',
          operator: '==' as const,
          value: searchOptions.contract_type
        });
      }

      if (searchOptions.recipient_type) {
        whereConditions.push({
          field: 'recipient_type',
          operator: '==' as const,
          value: searchOptions.recipient_type
        });
      }

      if (searchOptions.type) {
        whereConditions.push({
          field: 'type',
          operator: '==' as const,
          value: searchOptions.type
        });
      }

      if (searchOptions.currency) {
        whereConditions.push({
          field: 'currency',
          operator: '==' as const,
          value: searchOptions.currency
        });
      }

      if (searchOptions.min_amount) {
        whereConditions.push({
          field: 'net_amount',
          operator: '>=' as const,
          value: searchOptions.min_amount
        });
      }

      if (searchOptions.max_amount) {
        whereConditions.push({
          field: 'net_amount',
          operator: '<=' as const,
          value: searchOptions.max_amount
        });
      }

      if (searchOptions.date_from) {
        whereConditions.push({
          field: 'created_at',
          operator: '>=' as const,
          value: searchOptions.date_from
        });
      }

      if (searchOptions.date_to) {
        whereConditions.push({
          field: 'created_at',
          operator: '<=' as const,
          value: searchOptions.date_to
        });
      }

      const finalOptions: QueryOptions = {
        ...queryOptions,
        where: [...whereConditions, ...(queryOptions.where || [])]
      };

      const payments = await this.findAll(finalOptions);
      logger.info(`🔍 Advanced search found ${payments.length} payments`);
      return payments;
    } catch (error) {
      logger.error('❌ Error in advanced payment search', error);
      throw new Error(`Failed to search payments: ${error}`);
    }
  }

  /**
   * البحث مع صفحات في المدفوعات
   */
  async searchPaymentsPaginated(
    searchOptions: PaymentSearchOptions,
    page: number = 1,
    limit: number = 10,
    queryOptions: Omit<QueryOptions, 'limit' | 'offset'> = {}
  ): Promise<PaginatedResult<Payment>> {
    try {
      const offset = (page - 1) * limit;
      
      const payments = await this.searchPayments(searchOptions, {
        ...queryOptions,
        limit,
        offset
      });

      // حساب العدد الكلي
      const totalPayments = await this.searchPayments(searchOptions);
      const total = totalPayments.length;

      const result: PaginatedResult<Payment> = {
        data: payments,
        total,
        page,
        limit,
        hasNext: offset + limit < total,
        hasPrev: page > 1
      };

      logger.info(`📄 Paginated search: page ${page}, ${payments.length} payments`);
      return result;
    } catch (error) {
      logger.error('❌ Error in paginated payment search', error);
      throw new Error(`Failed to search payments with pagination: ${error}`);
    }
  }

  // ======================================
  // 📊 الإحصائيات والتقارير
  // ======================================

  /**
   * الحصول على إحصائيات المدفوعات
   */
  async getPaymentStats(searchOptions: PaymentSearchOptions = {}): Promise<PaymentStats> {
    try {
      const payments = await this.searchPayments(searchOptions);

      const stats: PaymentStats = {
        total_payments: payments.length,
        total_amount: 0,
        pending_amount: 0,
        approved_amount: 0,
        paid_amount: 0,
        failed_amount: 0,
        average_payment: 0,
        currency_breakdown: {},
        status_breakdown: {} as Record<PaymentStatus, number>,
        method_breakdown: {} as Record<PaymentMethod, number>,
        type_breakdown: {}
      };

      // تجميع الإحصائيات
      payments.forEach(payment => {
        stats.total_amount += payment.net_amount;

        // تجميع حسب الحالة
        switch (payment.status) {
          case 'pending_approval':
          case 'draft':
            stats.pending_amount += payment.net_amount;
            break;
          case 'approved':
          case 'processing':
            stats.approved_amount += payment.net_amount;
            break;
          case 'paid':
            stats.paid_amount += payment.net_amount;
            break;
          case 'failed':
          case 'cancelled':
            stats.failed_amount += payment.net_amount;
            break;
        }

        // تجميع حسب العملة
        stats.currency_breakdown[payment.currency] = 
          (stats.currency_breakdown[payment.currency] || 0) + payment.net_amount;

        // تجميع حسب الحالة
        stats.status_breakdown[payment.status] = 
          (stats.status_breakdown[payment.status] || 0) + 1;

        // تجميع حسب طريقة الدفع
        stats.method_breakdown[payment.payment_method] = 
          (stats.method_breakdown[payment.payment_method] || 0) + 1;

        // تجميع حسب النوع
        stats.type_breakdown[payment.type] = 
          (stats.type_breakdown[payment.type] || 0) + 1;
      });

      // حساب المتوسط
      stats.average_payment = payments.length > 0 ? stats.total_amount / payments.length : 0;

      logger.info('📊 Generated payment statistics', {
        total_payments: stats.total_payments,
        total_amount: stats.total_amount
      });

      return stats;
    } catch (error) {
      logger.error('❌ Error generating payment statistics', error);
      throw new Error(`Failed to generate payment statistics: ${error}`);
    }
  }

  /**
   * الحصول على إحصائيات مالية متقدمة
   */
  async getFinancialStats(searchOptions: PaymentSearchOptions = {}): Promise<FinancialStats> {
    try {
      const payments = await this.searchPayments(searchOptions);

      const stats: FinancialStats = {
        total_gross_amount: 0,
        total_deductions: 0,
        total_net_amount: 0,
        total_tax_amount: 0,
        total_processing_fees: 0,
        monthly_breakdown: [],
        recipient_breakdown: []
      };

      // تجميع المبالغ
      payments.forEach(payment => {
        stats.total_gross_amount += payment.gross_amount;
        stats.total_deductions += payment.deductions;
        stats.total_net_amount += payment.net_amount;
        stats.total_tax_amount += payment.tax_amount;
        stats.total_processing_fees += payment.processing_fees;
      });

      // تجميع شهري (مبسط - يمكن تحسينه)
      const monthlyMap = new Map<string, { total_amount: number; payment_count: number }>();
      payments.forEach(payment => {
        const date = new Date(payment.created_at.seconds * 1000);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!monthlyMap.has(monthKey)) {
          monthlyMap.set(monthKey, { total_amount: 0, payment_count: 0 });
        }
        
        const monthData = monthlyMap.get(monthKey)!;
        monthData.total_amount += payment.net_amount;
        monthData.payment_count += 1;
      });

      stats.monthly_breakdown = Array.from(monthlyMap.entries()).map(([monthKey, data]) => {
        const [year, month] = monthKey.split('-');
        return {
          month: month || '01',
          year: parseInt(year || '2024'),
          total_amount: data.total_amount,
          payment_count: data.payment_count
        };
      });

      // تجميع حسب المستلم
      const recipientMap = new Map<ID, { 
        recipient_name: string; 
        total_earned: number; 
        payment_count: number; 
      }>();
      
      payments.forEach(payment => {
        if (!recipientMap.has(payment.recipient_id)) {
          recipientMap.set(payment.recipient_id, {
            recipient_name: payment.recipient_name,
            total_earned: 0,
            payment_count: 0
          });
        }
        
        const recipientData = recipientMap.get(payment.recipient_id)!;
        recipientData.total_earned += payment.net_amount;
        recipientData.payment_count += 1;
      });

      stats.recipient_breakdown = Array.from(recipientMap.entries()).map(([recipientId, data]) => ({
        recipient_id: recipientId,
        recipient_name: data.recipient_name,
        total_earned: data.total_earned,
        payment_count: data.payment_count
      }));

      logger.info('📈 Generated financial statistics', {
        total_net_amount: stats.total_net_amount,
        monthly_entries: stats.monthly_breakdown.length,
        recipients: stats.recipient_breakdown.length
      });

      return stats;
    } catch (error) {
      logger.error('❌ Error generating financial statistics', error);
      throw new Error(`Failed to generate financial statistics: ${error}`);
    }
  }

  /**
   * الحصول على المدفوعات المستحقة
   */
  async getPendingPayments(options: QueryOptions = {}): Promise<Payment[]> {
    try {
      const searchOptions: QueryOptions = {
        ...options,
        where: [
          { field: 'status', operator: 'in', value: ['draft', 'pending_approval', 'approved'] },
          ...(options.where || [])
        ],
        orderBy: [
          { field: 'due_date', direction: 'asc' },
          { field: 'created_at', direction: 'asc' }
        ]
      };

      const payments = await this.findAll(searchOptions);
      logger.info(`📋 Found ${payments.length} pending payments`);
      return payments;
    } catch (error) {
      logger.error('❌ Error finding pending payments', error);
      throw new Error(`Failed to find pending payments: ${error}`);
    }
  }

  /**
   * الحصول على المدفوعات المتأخرة
   */
  async getOverduePayments(options: QueryOptions = {}): Promise<Payment[]> {
    try {
      const now = FieldValue.serverTimestamp() as FirebaseTimestamp;

      const searchOptions: QueryOptions = {
        ...options,
        where: [
          { field: 'due_date', operator: '<', value: now },
          { field: 'status', operator: 'in', value: ['draft', 'pending_approval', 'approved'] },
          ...(options.where || [])
        ],
        orderBy: [
          { field: 'due_date', direction: 'asc' }
        ]
      };

      const payments = await this.findAll(searchOptions);
      logger.info(`⏰ Found ${payments.length} overdue payments`);
      return payments;
    } catch (error) {
      logger.error('❌ Error finding overdue payments', error);
      throw new Error(`Failed to find overdue payments: ${error}`);
    }
  }
} 