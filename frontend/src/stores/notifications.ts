import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  doc,
  updateDoc,
  Timestamp,
  type Unsubscribe
} from 'firebase/firestore'
import { db } from '@/services/firebase'
import { useAuthStore } from './auth'

export interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  read: boolean
  created_at: Timestamp
  user_id: string
  action_url?: string
  icon?: string
}

export const useNotificationStore = defineStore('notifications', () => {
  // ======================================
  // State
  // ======================================
  const notifications = ref<Notification[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  
  // Real-time listener
  let unsubscribe: Unsubscribe | null = null

  // ======================================
  // Computed
  // ======================================
  const unreadCount = computed(() => {
    return notifications.value.filter(n => !n.read).length
  })

  const unreadNotifications = computed(() => {
    return notifications.value.filter(n => !n.read)
  })

  const recentNotifications = computed(() => {
    return notifications.value
      .sort((a, b) => b.created_at.seconds - a.created_at.seconds)
      .slice(0, 10)
  })

  // ======================================
  // Methods
  // ======================================

  /**
   * Load notifications for current user
   */
  async function loadNotifications() {
    const authStore = useAuthStore()
    const userId = authStore.user?.uid
    
    if (!userId) {
      return
    }

    try {
      isLoading.value = true
      error.value = null

      // 🔍 تشخيص حاسم: التحقق من database configuration في notifications
      console.log('🔍 Notifications Store - Database Debug Info:', {
        dbInstance: !!db,
        databaseId: (db as any)._delegate?._databaseId || 'unknown',
        projectId: (db as any)._delegate?._settings?.projectId || 'unknown',
        userId: userId
      })

      // Create query for user notifications
      const notificationsQuery = query(
        collection(db, 'notifications'),
        where('user_id', '==', userId),
        orderBy('created_at', 'desc')
      )

      console.log('🔍 Notifications Query created, setting up listener...')

      // Setup real-time listener
      unsubscribe = onSnapshot(
        notificationsQuery,
        (querySnapshot) => {
          console.log('✅ Notifications listener triggered, documents:', querySnapshot.size)
          const notificationsList: Notification[] = []
          
          querySnapshot.forEach((doc) => {
            notificationsList.push({
              id: doc.id,
              ...doc.data()
            } as Notification)
          })
          
          notifications.value = notificationsList
          isLoading.value = false
        },
        (err) => {
          console.error('❌ Notifications listener error:', err)
          console.error('💡 Error code:', err.code)
          console.error('💡 Error message:', err.message)
          error.value = 'خطأ في تحميل الإشعارات'
          isLoading.value = false
        }
      )

    } catch (err: any) {
      console.error('❌ Load notifications error:', err)
      console.error('💡 Error code:', err.code)
      console.error('💡 Error message:', err.message)
      error.value = 'خطأ في تحميل الإشعارات'
      isLoading.value = false
    }
  }

  /**
   * Mark notification as read
   */
  async function markAsRead(notificationId: string) {
    try {
      const notificationRef = doc(db, 'notifications', notificationId)
      await updateDoc(notificationRef, {
        read: true
      })

      // Update local state
      const notification = notifications.value.find(n => n.id === notificationId)
      if (notification) {
        notification.read = true
      }

    } catch (err: any) {
      console.error('Mark as read error:', err)
      error.value = 'خطأ في تحديث الإشعار'
    }
  }

  /**
   * Mark all notifications as read
   */
  async function markAllAsRead() {
    try {
      const unreadIds = notifications.value
        .filter(n => !n.read)
        .map(n => n.id)

      // Update all unread notifications
      const updatePromises = unreadIds.map(id => {
        const notificationRef = doc(db, 'notifications', id)
        return updateDoc(notificationRef, { read: true })
      })

      await Promise.all(updatePromises)

      // Update local state
      notifications.value.forEach(notification => {
        notification.read = true
      })

    } catch (err: any) {
      console.error('Mark all as read error:', err)
      error.value = 'خطأ في تحديث الإشعارات'
    }
  }

  /**
   * Add a mock notification (for testing)
   */
  function addMockNotification() {
    const mockNotification: Notification = {
      id: `mock-${Date.now()}`,
      title: 'إشعار تجريبي',
      message: 'هذا إشعار تجريبي للاختبار',
      type: 'info',
      read: false,
      created_at: Timestamp.now(),
      user_id: 'current-user',
      icon: 'mdi-information'
    }

    notifications.value.unshift(mockNotification)
  }

  /**
   * Get notification type icon
   */
  function getNotificationIcon(type: string): string {
    const icons: Record<string, string> = {
      'info': 'mdi-information',
      'success': 'mdi-check-circle',
      'warning': 'mdi-alert',
      'error': 'mdi-alert-circle'
    }
    return icons[type] || 'mdi-bell'
  }

  /**
   * Get notification type color
   */
  function getNotificationColor(type: string): string {
    const colors: Record<string, string> = {
      'info': 'blue',
      'success': 'green',
      'warning': 'orange',
      'error': 'red'
    }
    return colors[type] || 'blue'
  }

  /**
   * Format notification time
   */
  function formatNotificationTime(timestamp: Timestamp): string {
    const now = new Date()
    const notificationTime = timestamp.toDate()
    const diffInMinutes = Math.floor((now.getTime() - notificationTime.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) {
      return 'الآن'
    } else if (diffInMinutes < 60) {
      return `منذ ${diffInMinutes} دقيقة`
    } else if (diffInMinutes < 1440) { // 24 hours
      const hours = Math.floor(diffInMinutes / 60)
      return `منذ ${hours} ساعة`
    } else {
      const days = Math.floor(diffInMinutes / 1440)
      return `منذ ${days} يوم`
    }
  }

  /**
   * Clear error
   */
  function clearError() {
    error.value = null
  }

  /**
   * Cleanup listeners when store is destroyed
   */
  function cleanup() {
    if (unsubscribe) {
      unsubscribe()
      unsubscribe = null
    }
  }

  return {
    // State
    notifications,
    isLoading,
    error,
    
    // Computed
    unreadCount,
    unreadNotifications,
    recentNotifications,
    
    // Methods
    loadNotifications,
    markAsRead,
    markAllAsRead,
    addMockNotification,
    getNotificationIcon,
    getNotificationColor,
    formatNotificationTime,
    clearError,
    cleanup
  }
}) 