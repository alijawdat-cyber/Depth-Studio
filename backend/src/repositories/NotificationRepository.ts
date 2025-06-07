/**
 * 🔔 Notification Repository - مستودع الإشعارات
 * ===============================================
 * 
 * 📅 محدث: ديسمبر 2024
 * 👨‍💻 المطور: علي جودت
 * 🎯 الهدف: Repository شامل لإدارة الإشعارات مع Type Safety كامل
 */

import { Notification } from '../../../types/src/notifications';
import { NotificationType, PriorityLevel, UserRole } from '../../../types/src/core/enums';
import { ID, FirebaseTimestamp } from '../../../types/src/core/base';
import { BaseRepository, QueryOptions } from './BaseRepository';
import { FieldValue } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions';

/**
 * 🔍 خيارات البحث في الإشعارات
 */
export interface NotificationSearchOptions {
  recipient_id?: ID;
  recipient_role?: UserRole;
  sender_id?: ID;
  type?: NotificationType;
  priority?: PriorityLevel;
  is_read?: boolean;
  is_urgent?: boolean;
  action_required?: boolean;
  action_completed?: boolean;
  campaign_id?: ID;
  task_id?: ID;
  brand_id?: ID;
  created_from?: FirebaseTimestamp;
  created_to?: FirebaseTimestamp;
  expires_from?: FirebaseTimestamp;
  expires_to?: FirebaseTimestamp;
}

/**
 * 📊 إحصائيات الإشعارات
 */
export interface NotificationStats {
  total_notifications: number;
  unread_notifications: number;
  urgent_notifications: number;
  action_required_notifications: number;
  by_type: Record<NotificationType, number>;
  by_priority: Record<PriorityLevel, number>;
  by_recipient_role: Record<UserRole, number>;
  read_rate: number;
  average_read_time_hours: number;
  most_active_senders: Array<{
    sender_id: ID;
    sender_name: string;
    notification_count: number;
  }>;
  expired_notifications: number;
  completion_rate: number;
}

/**
 * 📈 إحصائيات المستخدم للإشعارات
 */
export interface UserNotificationActivity {
  user_id: ID;
  total_received: number;
  total_read: number;
  total_unread: number;
  urgent_received: number;
  urgent_unread: number;
  action_required: number;
  action_completed: number;
  read_rate: number;
  average_read_time_hours: number;
  preferred_notification_types: NotificationType[];
  most_responsive_hours: number[];
  notification_frequency_per_day: number;
}

/**
 * 🔔 Notification Repository Class
 */
export class NotificationRepository extends BaseRepository<Notification> {
  constructor() {
    super('notifications');
    logger.info('🔔 NotificationRepository initialized');
  }

  // ======================================
  // 🔍 البحث حسب المستخدم
  // ======================================

  /**
   * جلب إشعارات المستخدم
   */
  async findByUser(
    recipientId: ID, 
    options: QueryOptions = {}
  ): Promise<Notification[]> {
    try {
      logger.info('🔍 Finding notifications by user', { recipientId });

      let query = this.collection.where('recipient_id', '==', recipientId);

      // تطبيق الترتيب (الأحدث أولاً)
      query = query.orderBy('created_at', 'desc');

      // تطبيق التصفحة
      if (options.limit) {
        query = query.limit(options.limit);
      }
      if (options.offset) {
        query = query.offset(options.offset);
      }

      const snapshot = await query.get();
      const notifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Notification[];

      logger.info('🔍 User notifications retrieved', { 
        recipientId, 
        count: notifications.length 
      });

      return notifications;
    } catch (error) {
      logger.error('❌ Error finding notifications by user', { recipientId, error });
      throw error;
    }
  }

  /**
   * جلب الإشعارات غير المقروءة للمستخدم
   */
  async findUnreadByUser(recipientId: ID): Promise<Notification[]> {
    try {
      logger.info('📬 Finding unread notifications for user', { recipientId });

      const query = this.collection
        .where('recipient_id', '==', recipientId)
        .where('is_read', '==', false)
        .orderBy('created_at', 'desc');

      const snapshot = await query.get();
      const notifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Notification[];

      logger.info('📬 Unread notifications retrieved', { 
        recipientId, 
        count: notifications.length 
      });

      return notifications;
    } catch (error) {
      logger.error('❌ Error finding unread notifications', { recipientId, error });
      throw error;
    }
  }

  /**
   * جلب الإشعارات العاجلة للمستخدم
   */
  async findUrgentByUser(recipientId: ID): Promise<Notification[]> {
    try {
      logger.info('🚨 Finding urgent notifications for user', { recipientId });

      const query = this.collection
        .where('recipient_id', '==', recipientId)
        .where('is_urgent', '==', true)
        .where('is_read', '==', false)
        .orderBy('created_at', 'desc');

      const snapshot = await query.get();
      const notifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Notification[];

      logger.info('🚨 Urgent notifications retrieved', { 
        recipientId, 
        count: notifications.length 
      });

      return notifications;
    } catch (error) {
      logger.error('❌ Error finding urgent notifications', { recipientId, error });
      throw error;
    }
  }

  // ======================================
  // 🔍 البحث حسب النوع والحالة
  // ======================================

  /**
   * جلب إشعارات حسب النوع
   */
  async findByType(type: NotificationType): Promise<Notification[]> {
    try {
      logger.info('🔍 Finding notifications by type', { type });

      const query = this.collection
        .where('type', '==', type)
        .orderBy('created_at', 'desc');

      const snapshot = await query.get();
      const notifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Notification[];

      logger.info('🔍 Notifications by type retrieved', { 
        type, 
        count: notifications.length 
      });

      return notifications;
    } catch (error) {
      logger.error('❌ Error finding notifications by type', { type, error });
      throw error;
    }
  }

  /**
   * جلب إشعارات حسب الأولوية
   */
  async findByPriority(priority: PriorityLevel): Promise<Notification[]> {
    try {
      logger.info('🎯 Finding notifications by priority', { priority });

      const query = this.collection
        .where('priority', '==', priority)
        .orderBy('created_at', 'desc');

      const snapshot = await query.get();
      const notifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Notification[];

      logger.info('🎯 Notifications by priority retrieved', { 
        priority, 
        count: notifications.length 
      });

      return notifications;
    } catch (error) {
      logger.error('❌ Error finding notifications by priority', { priority, error });
      throw error;
    }
  }

  /**
   * جلب الإشعارات التي تحتاج إجراء
   */
  async findActionRequired(recipientId?: ID): Promise<Notification[]> {
    try {
      logger.info('⚡ Finding notifications requiring action', { recipientId });

      let query = this.collection.where('action_required', '==', true);
      
      if (recipientId) {
        query = query.where('recipient_id', '==', recipientId);
      }

      query = query
        .where('action_completed', '==', false)
        .orderBy('created_at', 'desc');

      const snapshot = await query.get();
      const notifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Notification[];

      logger.info('⚡ Action required notifications retrieved', { 
        recipientId, 
        count: notifications.length 
      });

      return notifications;
    } catch (error) {
      logger.error('❌ Error finding action required notifications', { recipientId, error });
      throw error;
    }
  }

  // ======================================
  // 🔄 تحديث حالة الإشعارات
  // ======================================

  /**
   * تعليم إشعار كمقروء
   */
  async markAsRead(notificationId: ID, userId: ID): Promise<Notification> {
    try {
      logger.info('📖 Marking notification as read', { notificationId, userId });

      const updateData = {
        is_read: true,
        read_at: FieldValue.serverTimestamp() as FirebaseTimestamp,
        updated_at: FieldValue.serverTimestamp() as FirebaseTimestamp
      };

      await this.collection.doc(notificationId).update(updateData);

      const updatedNotification = await this.findById(notificationId);
      if (!updatedNotification) {
        throw new Error('Notification not found after update');
      }

      logger.info('✅ Notification marked as read', { notificationId, userId });

      return updatedNotification;
    } catch (error) {
      logger.error('❌ Error marking notification as read', { notificationId, userId, error });
      throw error;
    }
  }

  /**
   * تعليم جميع إشعارات المستخدم كمقروءة
   */
  async markAllAsRead(recipientId: ID): Promise<number> {
    try {
      logger.info('📖 Marking all notifications as read for user', { recipientId });

      const unreadQuery = this.collection
        .where('recipient_id', '==', recipientId)
        .where('is_read', '==', false);

      const snapshot = await unreadQuery.get();
      const batch = this.firestore.batch();

      snapshot.docs.forEach(doc => {
        batch.update(doc.ref, {
          is_read: true,
          read_at: FieldValue.serverTimestamp(),
          updated_at: FieldValue.serverTimestamp()
        });
      });

      await batch.commit();

      logger.info('✅ All notifications marked as read', { 
        recipientId, 
        count: snapshot.docs.length 
      });

      return snapshot.docs.length;
    } catch (error) {
      logger.error('❌ Error marking all notifications as read', { recipientId, error });
      throw error;
    }
  }

  /**
   * تحديث حالة الإجراء المطلوب
   */
  async updateActionStatus(
    notificationId: ID, 
    completed: boolean,
    userId: ID
  ): Promise<Notification> {
    try {
      logger.info('⚡ Updating notification action status', { 
        notificationId, 
        completed, 
        userId 
      });

      const updateData: Partial<Notification> = {
        action_completed: completed,
        updated_at: FieldValue.serverTimestamp() as FirebaseTimestamp,
        ...(completed && { 
          action_completed_at: FieldValue.serverTimestamp() as FirebaseTimestamp 
        })
      };

      await this.collection.doc(notificationId).update(updateData);

      const updatedNotification = await this.findById(notificationId);
      if (!updatedNotification) {
        throw new Error('Notification not found after update');
      }

      logger.info('✅ Notification action status updated', { 
        notificationId, 
        completed, 
        userId 
      });

      return updatedNotification;
    } catch (error) {
      logger.error('❌ Error updating notification action status', { 
        notificationId, 
        completed, 
        userId, 
        error 
      });
      throw error;
    }
  }

  // ======================================
  // 🔍 البحث المتقدم
  // ======================================

  /**
   * البحث المتقدم في الإشعارات
   */
  async searchNotifications(
    searchOptions: NotificationSearchOptions = {},
    queryOptions: QueryOptions = {}
  ): Promise<Notification[]> {
    try {
      logger.info('🔍 Advanced notification search', { searchOptions, queryOptions });

      let query = this.collection.limit(1000); // حد أقصى معقول

      // تطبيق الفلاتر
      if (searchOptions.recipient_id) {
        query = query.where('recipient_id', '==', searchOptions.recipient_id);
      }
      if (searchOptions.recipient_role) {
        query = query.where('recipient_role', '==', searchOptions.recipient_role);
      }
      if (searchOptions.sender_id) {
        query = query.where('sender_id', '==', searchOptions.sender_id);
      }
      if (searchOptions.type) {
        query = query.where('type', '==', searchOptions.type);
      }
      if (searchOptions.priority) {
        query = query.where('priority', '==', searchOptions.priority);
      }
      if (searchOptions.is_read !== undefined) {
        query = query.where('is_read', '==', searchOptions.is_read);
      }
      if (searchOptions.is_urgent !== undefined) {
        query = query.where('is_urgent', '==', searchOptions.is_urgent);
      }
      if (searchOptions.action_required !== undefined) {
        query = query.where('action_required', '==', searchOptions.action_required);
      }
      if (searchOptions.action_completed !== undefined) {
        query = query.where('action_completed', '==', searchOptions.action_completed);
      }
      if (searchOptions.campaign_id) {
        query = query.where('campaign_id', '==', searchOptions.campaign_id);
      }
      if (searchOptions.task_id) {
        query = query.where('task_id', '==', searchOptions.task_id);
      }
      if (searchOptions.brand_id) {
        query = query.where('brand_id', '==', searchOptions.brand_id);
      }

      // تطبيق فلاتر التاريخ
      if (searchOptions.created_from) {
        query = query.where('created_at', '>=', searchOptions.created_from);
      }
      if (searchOptions.created_to) {
        query = query.where('created_at', '<=', searchOptions.created_to);
      }

      // تطبيق الترتيب (الأحدث أولاً)
      query = query.orderBy('created_at', 'desc');

      // تطبيق خيارات الاستعلام
      if (queryOptions.limit) {
        query = query.limit(queryOptions.limit);
      }
      if (queryOptions.offset) {
        query = query.offset(queryOptions.offset);
      }

      const snapshot = await query.get();
      const notifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Notification[];

      logger.info('🔍 Advanced search completed', { 
        searchOptions, 
        queryOptions, 
        resultsCount: notifications.length 
      });

      return notifications;
    } catch (error) {
      logger.error('❌ Error in advanced notification search', { 
        searchOptions, 
        queryOptions, 
        error 
      });
      throw error;
    }
  }

  // ======================================
  // 📊 الإحصائيات
  // ======================================

  /**
   * جلب إحصائيات الإشعارات الشاملة
   */
  async getNotificationStats(): Promise<NotificationStats> {
    try {
      logger.info('📊 Calculating notification statistics');

      const allNotifications = await this.findAll();
      
      if (allNotifications.length === 0) {
        return this.getEmptyStats();
      }

      // إحصائيات أساسية
      const totalNotifications = allNotifications.length;
      const unreadNotifications = allNotifications.filter(n => !n.is_read).length;
      const urgentNotifications = allNotifications.filter(n => n.is_urgent).length;
      const actionRequiredNotifications = allNotifications.filter(n => n.action_required && !n.action_completed).length;

      // إحصائيات حسب النوع
      const byType = this.calculateStatsByField(allNotifications, 'type') as Record<NotificationType, number>;

      // إحصائيات حسب الأولوية
      const byPriority = this.calculateStatsByField(allNotifications, 'priority') as Record<PriorityLevel, number>;

      // إحصائيات حسب دور المستقبل
      const byRecipientRole = this.calculateStatsByField(allNotifications, 'recipient_role') as Record<UserRole, number>;

      // معدل القراءة
      const readRate = totalNotifications > 0 ? ((totalNotifications - unreadNotifications) / totalNotifications) * 100 : 0;

      // متوسط وقت القراءة
      const readNotifications = allNotifications.filter(n => n.is_read && n.read_at);
      const averageReadTimeHours = this.calculateAverageReadTime(readNotifications);

      // أكثر المرسلين نشاطاً
      const mostActiveSenders = this.calculateMostActiveSenders(allNotifications);

      // الإشعارات المنتهية الصلاحية
      const now = new Date();
      const expiredNotifications = allNotifications.filter(n => 
        n.expires_at && n.expires_at.toDate() < now
      ).length;

      // معدل الإنجاز
      const actionNotifications = allNotifications.filter(n => n.action_required);
      const completionRate = actionNotifications.length > 0 ? 
        (actionNotifications.filter(n => n.action_completed).length / actionNotifications.length) * 100 : 0;

      const stats: NotificationStats = {
        total_notifications: totalNotifications,
        unread_notifications: unreadNotifications,
        urgent_notifications: urgentNotifications,
        action_required_notifications: actionRequiredNotifications,
        by_type: byType,
        by_priority: byPriority,
        by_recipient_role: byRecipientRole,
        read_rate: readRate,
        average_read_time_hours: averageReadTimeHours,
        most_active_senders: mostActiveSenders,
        expired_notifications: expiredNotifications,
        completion_rate: completionRate
      };

      logger.info('📊 Notification statistics calculated', { 
        totalNotifications,
        unreadNotifications,
        readRate: `${readRate.toFixed(2)}%`
      });

      return stats;
    } catch (error) {
      logger.error('❌ Error calculating notification statistics', { error });
      throw error;
    }
  }

  /**
   * جلب إحصائيات المستخدم للإشعارات
   */
  async getUserNotificationActivity(userId: ID): Promise<UserNotificationActivity> {
    try {
      logger.info('📊 Calculating user notification activity', { userId });

      const userNotifications = await this.findByUser(userId);

      if (userNotifications.length === 0) {
        return this.getEmptyUserActivity(userId);
      }

      const totalReceived = userNotifications.length;
      const totalRead = userNotifications.filter(n => n.is_read).length;
      const totalUnread = totalReceived - totalRead;
      const urgentReceived = userNotifications.filter(n => n.is_urgent).length;
      const urgentUnread = userNotifications.filter(n => n.is_urgent && !n.is_read).length;
      const actionRequired = userNotifications.filter(n => n.action_required).length;
      const actionCompleted = userNotifications.filter(n => n.action_completed).length;

      const readRate = totalReceived > 0 ? (totalRead / totalReceived) * 100 : 0;
      
      // متوسط وقت القراءة
      const readNotifications = userNotifications.filter(n => n.is_read && n.read_at);
      const averageReadTimeHours = this.calculateAverageReadTime(readNotifications);

      // أنواع الإشعارات المفضلة
      const preferredNotificationTypes = this.calculatePreferredTypes(userNotifications);

      // الساعات الأكثر استجابة
      const mostResponsiveHours = this.calculateMostResponsiveHours(readNotifications);

      // تكرار الإشعارات يومياً
      const notificationFrequencyPerDay = this.calculateDailyFrequency(userNotifications);

      const activity: UserNotificationActivity = {
        user_id: userId,
        total_received: totalReceived,
        total_read: totalRead,
        total_unread: totalUnread,
        urgent_received: urgentReceived,
        urgent_unread: urgentUnread,
        action_required: actionRequired,
        action_completed: actionCompleted,
        read_rate: readRate,
        average_read_time_hours: averageReadTimeHours,
        preferred_notification_types: preferredNotificationTypes,
        most_responsive_hours: mostResponsiveHours,
        notification_frequency_per_day: notificationFrequencyPerDay
      };

      logger.info('📊 User notification activity calculated', { 
        userId,
        totalReceived,
        readRate: `${readRate.toFixed(2)}%`
      });

      return activity;
    } catch (error) {
      logger.error('❌ Error calculating user notification activity', { userId, error });
      throw error;
    }
  }

  // ======================================
  // 🧹 إدارة الإشعارات المنتهية الصلاحية
  // ======================================

  /**
   * جلب الإشعارات المنتهية الصلاحية
   */
  async findExpiredNotifications(): Promise<Notification[]> {
    try {
      logger.info('⏰ Finding expired notifications');

      const now = FieldValue.serverTimestamp() as FirebaseTimestamp;
      
      const query = this.collection
        .where('expires_at', '<=', now)
        .orderBy('expires_at', 'asc');

      const snapshot = await query.get();
      const notifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Notification[];

      logger.info('⏰ Expired notifications found', { count: notifications.length });

      return notifications;
    } catch (error) {
      logger.error('❌ Error finding expired notifications', { error });
      throw error;
    }
  }

  /**
   * حذف الإشعارات المنتهية الصلاحية
   */
  async deleteExpiredNotifications(): Promise<number> {
    try {
      logger.info('🗑️ Deleting expired notifications');

      const expiredNotifications = await this.findExpiredNotifications();
      const batch = this.firestore.batch();

      expiredNotifications.forEach(notification => {
        if (notification.id) {
          batch.delete(this.collection.doc(notification.id));
        }
      });

      await batch.commit();

      logger.info('✅ Expired notifications deleted', { count: expiredNotifications.length });

      return expiredNotifications.length;
    } catch (error) {
      logger.error('❌ Error deleting expired notifications', { error });
      throw error;
    }
  }

  // ======================================
  // 🔧 دوال مساعدة خاصة
  // ======================================

  /**
   * حساب الإحصائيات حسب حقل محدد
   */
  private calculateStatsByField(
    notifications: Notification[], 
    field: keyof Notification
  ): Record<string, number> {
    const stats: Record<string, number> = {};
    
    notifications.forEach(notification => {
      const value = notification[field] as string;
      if (value) {
        stats[value] = (stats[value] || 0) + 1;
      }
    });

    return stats;
  }

  /**
   * حساب متوسط وقت القراءة
   */
  private calculateAverageReadTime(readNotifications: Notification[]): number {
    if (readNotifications.length === 0) return 0;

    const totalHours = readNotifications.reduce((sum, notification) => {
      if (notification.read_at && notification.created_at) {
        const readTime = notification.read_at.toDate().getTime();
        const createdTime = notification.created_at.toDate().getTime();
        const hoursDiff = (readTime - createdTime) / (1000 * 60 * 60);
        return sum + hoursDiff;
      }
      return sum;
    }, 0);

    return totalHours / readNotifications.length;
  }

  /**
   * حساب أكثر المرسلين نشاطاً
   */
  private calculateMostActiveSenders(notifications: Notification[]): Array<{
    sender_id: ID;
    sender_name: string;
    notification_count: number;
  }> {
    const senderStats: Record<string, { sender_name: string; count: number }> = {};

    notifications.forEach(notification => {
      if (notification.sender_id) {
        const senderId = notification.sender_id;
        const senderName = notification.sender_name || 'غير محدد';
        
        if (!senderStats[senderId]) {
          senderStats[senderId] = { sender_name: senderName, count: 0 };
        }
        senderStats[senderId].count++;
      }
    });

    return Object.entries(senderStats)
      .map(([sender_id, stats]) => ({
        sender_id,
        sender_name: stats.sender_name,
        notification_count: stats.count
      }))
      .sort((a, b) => b.notification_count - a.notification_count)
      .slice(0, 10); // أفضل 10 مرسلين
  }

  /**
   * حساب أنواع الإشعارات المفضلة للمستخدم
   */
  private calculatePreferredTypes(notifications: Notification[]): NotificationType[] {
    const typeStats = this.calculateStatsByField(notifications, 'type');
    
    return Object.entries(typeStats)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([type]) => type as NotificationType);
  }

  /**
   * حساب الساعات الأكثر استجابة
   */
  private calculateMostResponsiveHours(readNotifications: Notification[]): number[] {
    const hourStats: Record<number, number> = {};

    readNotifications.forEach(notification => {
      if (notification.read_at) {
        const hour = notification.read_at.toDate().getHours();
        hourStats[hour] = (hourStats[hour] || 0) + 1;
      }
    });

    return Object.entries(hourStats)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([hour]) => parseInt(hour));
  }

  /**
   * حساب تكرار الإشعارات اليومي
   */
  private calculateDailyFrequency(notifications: Notification[]): number {
    if (notifications.length === 0) return 0;

    const days = new Set<string>();
    
    notifications.forEach(notification => {
      if (notification.created_at) {
        const date = notification.created_at.toDate().toDateString();
        days.add(date);
      }
    });

    return days.size > 0 ? notifications.length / days.size : 0;
  }

  /**
   * إرجاع إحصائيات فارغة
   */
  private getEmptyStats(): NotificationStats {
    return {
      total_notifications: 0,
      unread_notifications: 0,
      urgent_notifications: 0,
      action_required_notifications: 0,
      by_type: {} as Record<NotificationType, number>,
      by_priority: {} as Record<PriorityLevel, number>,
      by_recipient_role: {} as Record<UserRole, number>,
      read_rate: 0,
      average_read_time_hours: 0,
      most_active_senders: [],
      expired_notifications: 0,
      completion_rate: 0
    };
  }

  /**
   * إرجاع نشاط مستخدم فارغ
   */
  private getEmptyUserActivity(userId: ID): UserNotificationActivity {
    return {
      user_id: userId,
      total_received: 0,
      total_read: 0,
      total_unread: 0,
      urgent_received: 0,
      urgent_unread: 0,
      action_required: 0,
      action_completed: 0,
      read_rate: 0,
      average_read_time_hours: 0,
      preferred_notification_types: [],
      most_responsive_hours: [],
      notification_frequency_per_day: 0
    };
  }
} 