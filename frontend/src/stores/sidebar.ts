import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface SidebarItem {
  title: string
  icon: string
  to?: string
  value: string
  children?: SidebarItem[]
  roles: string[] // الأدوار المسموح لها بالوصول
  permissions?: string[] // الصلاحيات المطلوبة
}

export const useSidebarStore = defineStore('sidebar', () => {
  // ======================================
  // State
  // ======================================
  const isCollapsed = ref(false)
  const currentRole = ref<string>('')
  
  // ======================================
  // Static Menu Configuration
  // ======================================
  const allMenuItems: SidebarItem[] = [
    // Dashboard (للجميع)
    {
      title: 'لوحة التحكم',
      icon: 'mdi-view-dashboard',
      to: '/dashboard',
      value: 'dashboard',
      roles: ['super_admin', 'marketing_coordinator', 'brand_coordinator', 'photographer']
    },

    // Super Admin Items
    {
      title: 'إدارة المستخدمين',
      icon: 'mdi-account-group',
      value: 'users',
      roles: ['super_admin'],
      children: [
        {
          title: 'جميع المستخدمين',
          icon: 'mdi-account-multiple',
          to: '/admin/users',
          value: 'users-all',
          roles: ['super_admin']
        },
        {
          title: 'طلبات الموافقة',
          icon: 'mdi-account-clock',
          to: '/admin/approvals',
          value: 'users-approvals',
          roles: ['super_admin']
        },
        {
          title: 'الصلاحيات والأدوار',
          icon: 'mdi-shield-account',
          to: '/admin/permissions',
          value: 'users-permissions',
          roles: ['super_admin']
        }
      ]
    },
    {
      title: 'إدارة البراندات',
      icon: 'mdi-store',
      value: 'brands',
      roles: ['super_admin'],
      children: [
        {
          title: 'جميع البراندات',
          icon: 'mdi-store-outline',
          to: '/admin/brands',
          value: 'brands-all',
          roles: ['super_admin']
        },
        {
          title: 'إضافة براند جديد',
          icon: 'mdi-store-plus',
          to: '/admin/brands/create',
          value: 'brands-create',
          roles: ['super_admin']
        }
      ]
    },
    {
      title: 'إدارة الحملات',
      icon: 'mdi-bullhorn',
      value: 'campaigns',
      roles: ['super_admin', 'marketing_coordinator'],
      children: [
        {
          title: 'جميع الحملات',
          icon: 'mdi-bullhorn-outline',
          to: '/campaigns',
          value: 'campaigns-all',
          roles: ['super_admin', 'marketing_coordinator']
        },
        {
          title: 'إنشاء حملة جديدة',
          icon: 'mdi-plus-circle',
          to: '/campaigns/create',
          value: 'campaigns-create',
          roles: ['super_admin', 'marketing_coordinator']
        }
      ]
    },
    {
      title: 'التقارير المتقدمة',
      icon: 'mdi-chart-line',
      value: 'reports',
      roles: ['super_admin'],
      children: [
        {
          title: 'تقارير الأداء',
          icon: 'mdi-chart-bar',
          to: '/admin/reports/performance',
          value: 'reports-performance',
          roles: ['super_admin']
        },
        {
          title: 'التحليلات المالية',
          icon: 'mdi-cash',
          to: '/admin/reports/financial',
          value: 'reports-financial',
          roles: ['super_admin']
        }
      ]
    },

    // Marketing Coordinator Items  
    {
      title: 'إدارة المهام',
      icon: 'mdi-clipboard-list',
      value: 'tasks',
      roles: ['marketing_coordinator', 'super_admin'],
      children: [
        {
          title: 'جميع المهام',
          icon: 'mdi-format-list-bulleted',
          to: '/tasks',
          value: 'tasks-all',
          roles: ['marketing_coordinator', 'super_admin']
        },
        {
          title: 'إنشاء مهمة جديدة',
          icon: 'mdi-plus',
          to: '/tasks/create',
          value: 'tasks-create',
          roles: ['marketing_coordinator', 'super_admin']
        },
        {
          title: 'تقويم المهام',
          icon: 'mdi-calendar',
          to: '/tasks/calendar',
          value: 'tasks-calendar',
          roles: ['marketing_coordinator', 'super_admin']
        }
      ]
    },
    {
      title: 'مراجعة المحتوى',
      icon: 'mdi-file-document-edit',
      value: 'content-review',
      roles: ['marketing_coordinator', 'super_admin'],
      children: [
        {
          title: 'قائمة الانتظار',
          icon: 'mdi-clock-outline',
          to: '/content/pending',
          value: 'content-pending',
          roles: ['marketing_coordinator', 'super_admin']
        },
        {
          title: 'معرض المحتوى',
          icon: 'mdi-image-multiple',
          to: '/content/gallery',
          value: 'content-gallery',
          roles: ['marketing_coordinator', 'super_admin']
        }
      ]
    },

    // Brand Coordinator Items
    {
      title: 'إدارة البراند',
      icon: 'mdi-store-outline',
      to: '/brand/dashboard',
      value: 'brand-management',
      roles: ['brand_coordinator']
    },
    {
      title: 'مهام البراند',
      icon: 'mdi-clipboard-text',
      to: '/brand/tasks',
      value: 'brand-tasks',
      roles: ['brand_coordinator']
    },
    {
      title: 'محتوى البراند',
      icon: 'mdi-image-area',
      to: '/brand/content',
      value: 'brand-content',
      roles: ['brand_coordinator']
    },
    {
      title: 'تواصل مع العميل',
      icon: 'mdi-message-text',
      to: '/brand/client-communication',
      value: 'brand-communication',
      roles: ['brand_coordinator']
    },

    // Photographer Items
    {
      title: 'مهامي',
      icon: 'mdi-camera',
      value: 'my-tasks',
      roles: ['photographer'],
      children: [
        {
          title: 'المهام الحالية',
          icon: 'mdi-camera-outline',
          to: '/photographer/tasks/current',
          value: 'photographer-tasks-current',
          roles: ['photographer']
        },
        {
          title: 'المهام المكتملة',
          icon: 'mdi-check-circle',
          to: '/photographer/tasks/completed',
          value: 'photographer-tasks-completed',
          roles: ['photographer']
        }
      ]
    },
    {
      title: 'رفع المحتوى',
      icon: 'mdi-cloud-upload',
      to: '/photographer/upload',
      value: 'photographer-upload',
      roles: ['photographer']
    },
    {
      title: 'جدولي الشخصي',
      icon: 'mdi-calendar-account',
      to: '/photographer/schedule',
      value: 'photographer-schedule',
      roles: ['photographer']
    },
    {
      title: 'الأرباح والدفعات',
      icon: 'mdi-cash-multiple',
      value: 'photographer-earnings',
      roles: ['photographer'],
      children: [
        {
          title: 'أرباحي',
          icon: 'mdi-currency-usd',
          to: '/photographer/earnings',
          value: 'photographer-earnings-view',
          roles: ['photographer']
        },
        {
          title: 'تاريخ المدفوعات',
          icon: 'mdi-history',
          to: '/photographer/payments-history',
          value: 'photographer-payments-history',
          roles: ['photographer']
        }
      ]
    },

    // Settings & Profile (للجميع)
    {
      title: 'الإعدادات',
      icon: 'mdi-cog',
      value: 'settings',
      roles: ['super_admin', 'marketing_coordinator', 'brand_coordinator', 'photographer'],
      children: [
        {
          title: 'الملف الشخصي',
          icon: 'mdi-account',
          to: '/profile',
          value: 'profile',
          roles: ['super_admin', 'marketing_coordinator', 'brand_coordinator', 'photographer']
        },
        {
          title: 'إعدادات الحساب',
          icon: 'mdi-account-cog',
          to: '/settings/account',
          value: 'settings-account',
          roles: ['super_admin', 'marketing_coordinator', 'brand_coordinator', 'photographer']
        }
      ]
    }
  ]

  // ======================================
  // Computed
  // ======================================
  const menuItems = computed(() => {
    return filterMenuByRole(allMenuItems, currentRole.value)
  })

  // ======================================
  // Methods
  // ======================================
  
  /**
   * Initialize sidebar for specific role
   */
  function initializeSidebar(role: string) {
    currentRole.value = role
  }

  /**
   * Get menu items for specific role
   */
  function getMenuItems(role: string): SidebarItem[] {
    return filterMenuByRole(allMenuItems, role)
  }

  /**
   * Filter menu items by user role
   */
  function filterMenuByRole(items: SidebarItem[], role: string): SidebarItem[] {
    return items.filter(item => {
      // Check if user role is allowed for this item
      if (!item.roles.includes(role)) {
        return false
      }

      // If item has children, filter them too
      if (item.children) {
        item.children = filterMenuByRole(item.children, role)
        // Keep parent if it has children after filtering
        return item.children.length > 0
      }

      return true
    })
  }

  /**
   * Toggle sidebar collapsed state
   */
  function toggleCollapsed() {
    isCollapsed.value = !isCollapsed.value
  }

  /**
   * Set sidebar collapsed state
   */
  function setCollapsed(collapsed: boolean) {
    isCollapsed.value = collapsed
  }

  /**
   * Check if user has access to specific menu item
   */
  function hasAccess(itemValue: string, role: string): boolean {
    const findItem = (items: SidebarItem[]): SidebarItem | undefined => {
      for (const item of items) {
        if (item.value === itemValue) {
          return item
        }
        if (item.children) {
          const found = findItem(item.children)
          if (found) return found
        }
      }
      return undefined
    }

    const item = findItem(allMenuItems)
    return item ? item.roles.includes(role) : false
  }

  return {
    // State
    isCollapsed,
    currentRole,
    
    // Computed
    menuItems,
    
    // Methods
    initializeSidebar,
    getMenuItems,
    toggleCollapsed,
    setCollapsed,
    hasAccess
  }
}) 