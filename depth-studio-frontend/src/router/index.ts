import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/auth/login'
    },
    
    // Authentication routes
    {
      path: '/auth',
      component: () => import('@/layouts/AuthLayout.vue'),
      children: [
        {
          path: 'login',
          name: 'login',
          component: () => import('@/views/auth/Login.vue'),
          meta: { requiresGuest: true }
        },
        {
          path: 'register',
          name: 'register', 
          component: () => import('@/views/auth/Register.vue'),
          meta: { requiresGuest: true }
        },
        {
          path: 'forgot-password',
          name: 'forgot-password',
          component: () => import('@/views/auth/ForgotPassword.vue'),
          meta: { requiresGuest: true }
        },
        {
          path: 'reset-password',
          name: 'reset-password',
          component: () => import('@/views/auth/ResetPassword.vue'),
          meta: { requiresGuest: true }
        },
        {
          path: 'role-setup',
          name: 'role-setup',
          component: () => import('@/views/auth/RoleSetup.vue'),
          meta: { requiresAuth: true }
        }
      ]
    },

    // Super Admin routes
    {
      path: '/super-admin',
      component: () => import('@/layouts/AdminLayout.vue'),
      meta: { requiresAuth: true, role: 'super_admin' },
      children: [
        {
          path: 'dashboard',
          name: 'super-admin-dashboard',
          component: () => import('@/views/super-admin/Dashboard.vue')
        },
        {
          path: 'users',
          name: 'users-management',
          component: () => import('@/views/super-admin/UsersManagement.vue')
        },
        {
          path: 'permissions',
          name: 'permissions-editor',
          component: () => import('@/views/super-admin/PermissionsEditor.vue')
        },
        {
          path: 'brands',
          name: 'brands-management',
          component: () => import('@/views/super-admin/BrandsManagement.vue')
        },
        {
          path: 'categories',
          name: 'categories-management', 
          component: () => import('@/views/super-admin/CategoriesManagement.vue')
        },
        {
          path: 'equipment',
          name: 'equipment-management',
          component: () => import('@/views/super-admin/EquipmentManagement.vue')
        },
        {
          path: 'campaigns',
          name: 'campaigns-management',
          component: () => import('@/views/super-admin/CampaignsManagement.vue')
        },
        {
          path: 'settings',
          name: 'system-settings',
          component: () => import('@/views/super-admin/SystemSettings.vue')
        },
        {
          path: 'reports',
          name: 'advanced-reports',
          component: () => import('@/views/super-admin/AdvancedReports.vue')
        }
      ]
    },

    // Marketing Coordinator routes
    {
      path: '/marketing-coordinator',
      component: () => import('@/layouts/CoordinatorLayout.vue'),
      meta: { requiresAuth: true, role: 'marketing_coordinator' },
      children: [
        {
          path: 'dashboard',
          name: 'marketing-coordinator-dashboard',
          component: () => import('@/views/marketing-coordinator/Dashboard.vue')
        },
        {
          path: 'tasks',
          name: 'tasks-overview',
          component: () => import('@/views/marketing-coordinator/TasksOverview.vue')
        },
        {
          path: 'content-review',
          name: 'content-review',
          component: () => import('@/views/marketing-coordinator/ContentReview.vue')
        },
        {
          path: 'campaigns',
          name: 'campaign-coordination',
          component: () => import('@/views/marketing-coordinator/CampaignCoordination.vue')
        },
        {
          path: 'communication',
          name: 'team-communication',
          component: () => import('@/views/marketing-coordinator/TeamCommunication.vue')
        },
        {
          path: 'schedule',
          name: 'schedule-management',
          component: () => import('@/views/marketing-coordinator/ScheduleManagement.vue')
        },
        {
          path: 'reports',
          name: 'marketing-reports',
          component: () => import('@/views/marketing-coordinator/MarketingReports.vue')
        }
      ]
    },

    // Brand Coordinator routes
    {
      path: '/brand-coordinator',
      component: () => import('@/layouts/CoordinatorLayout.vue'),
      meta: { requiresAuth: true, role: 'brand_coordinator' },
      children: [
        {
          path: 'dashboard',
          name: 'brand-coordinator-dashboard',
          component: () => import('@/views/brand-coordinator/Dashboard.vue')
        },
        {
          path: 'brand-overview',
          name: 'brand-overview',
          component: () => import('@/views/brand-coordinator/BrandOverview.vue')
        },
        {
          path: 'tasks',
          name: 'brand-tasks',
          component: () => import('@/views/brand-coordinator/BrandTasks.vue')
        },
        {
          path: 'content-review',
          name: 'brand-content-review',
          component: () => import('@/views/brand-coordinator/BrandContentReview.vue')
        },
        {
          path: 'client-communication',
          name: 'client-communication',
          component: () => import('@/views/brand-coordinator/ClientCommunication.vue')
        },
        {
          path: 'reports',
          name: 'brand-reports',
          component: () => import('@/views/brand-coordinator/BrandReports.vue')
        },
        {
          path: 'settings',
          name: 'brand-settings',
          component: () => import('@/views/brand-coordinator/BrandSettings.vue')
        }
      ]
    },

    // Photographer routes
    {
      path: '/photographer',
      component: () => import('@/layouts/PhotographerLayout.vue'),
      meta: { requiresAuth: true, role: 'photographer' },
      children: [
        {
          path: 'dashboard',
          name: 'photographer-dashboard',
          component: () => import('@/views/photographer/Dashboard.vue')
        },
        {
          path: 'tasks',
          name: 'my-tasks',
          component: () => import('@/views/photographer/MyTasks.vue')
        },
        {
          path: 'upload',
          name: 'content-upload',
          component: () => import('@/views/photographer/ContentUpload.vue')
        },
        {
          path: 'schedule',
          name: 'my-schedule',
          component: () => import('@/views/photographer/MySchedule.vue')
        },
        {
          path: 'earnings',
          name: 'earnings-salary',
          component: () => import('@/views/photographer/EarningsSalary.vue')
        },
        {
          path: 'statistics',
          name: 'my-statistics',
          component: () => import('@/views/photographer/MyStatistics.vue')
        },
        {
          path: 'review',
          name: 'photographer-content-review',
          component: () => import('@/views/photographer/ContentReview.vue')
        },
        {
          path: 'design',
          name: 'design-work',
          component: () => import('@/views/photographer/DesignWork.vue')
        },
        {
          path: 'messages',
          name: 'photographer-messages',
          component: () => import('@/views/photographer/Messages.vue')
        }
      ]
    },

    // Special pages
    {
      path: '/auth/pending-approval',
      name: 'pending-approval',
      component: () => import('@/views/auth/PendingApproval.vue'),
      meta: { requiresAuth: true }
    },

    // Catch all 404
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFound.vue')
    }
  ]
})

// Route guards - محسن للتعامل مع المصادقة
router.beforeEach(async (to, from, next) => {
  console.log('🔍 Router Guard:', {
    to: to.path,
    from: from.path,
    requiresAuth: to.meta.requiresAuth,
    requiresGuest: to.meta.requiresGuest
  })
  
  // للصفحات العامة (مثل 404) - اسمح بالمرور
  if (!to.meta.requiresAuth && !to.meta.requiresGuest) {
    return next()
  }
  
  // للصفحات التي تحتاج ضيف (تسجيل دخول/تسجيل) - تحقق من عدم وجود مستخدم
  if (to.meta.requiresGuest) {
    // السماح بالمرور للصفحات Guest دائماً لتجنب Infinite Redirect
    return next()
  }
  
  // للصفحات التي تحتاج مصادقة
  if (to.meta.requiresAuth) {
    // السماح بالمرور مؤقتاً - الفحص سيحدث في Components
    // هذا يمنع infinite redirects أثناء تحميل المصادقة
    return next()
  }
  
  // الافتراضي - السماح بالمرور
  next()
})

export default router
