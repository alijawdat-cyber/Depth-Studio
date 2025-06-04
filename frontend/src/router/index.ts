import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AppLayout from '@/layouts/AppLayout.vue'
import AuthLayout from '@/layouts/AuthLayout.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // Root route - توجيه مباشر لصفحة تسجيل الدخول
    {
      path: '/',
      redirect: '/auth/login'
    },
    
    // Welcome page
    {
      path: '/welcome',
      name: 'welcome',
      component: () => import('@/views/HomeView.vue'),
      meta: { 
        requiresGuest: true,
        title: 'مرحباً بك - Depth Studio'
      }
    },
    
    // Auth routes with AuthLayout
    {
      path: '/auth',
      component: AuthLayout,
      children: [
        {
          path: 'login',
          name: 'login',
          component: () => import('@/views/auth/Login.vue'),
          meta: { 
            requiresGuest: true,
            title: 'تسجيل الدخول'
          }
        },
        {
          path: 'phone-login',
          name: 'phone-login',
          component: () => import('@/views/auth/PhoneLogin.vue'),
          meta: { 
            requiresGuest: true,
            title: 'تسجيل الدخول بالهاتف'
          }
        },
        {
          path: 'register',
          name: 'register',
          component: () => import('@/views/auth/Register.vue'),
          meta: { 
            requiresGuest: true,
            title: 'إنشاء حساب جديد'
          }
        },
        {
          path: 'role-setup',
          name: 'role-setup',
          component: () => import('@/views/auth/RoleSetup.vue'),
          meta: { 
            requiresAuth: true,
            title: 'اختيار الدور'
          }
        },
        {
          path: 'pending-approval',
          name: 'pending-approval',
          component: () => import('@/views/auth/PendingApproval.vue'),
          meta: { 
            requiresAuth: true,
            title: 'انتظار الموافقة'
          }
        }
      ]
    },

    // Main app routes with AppLayout
    {
      path: '/app',
      component: AppLayout,
      meta: { requiresAuth: true },
      children: [
        // Dashboard routes
        {
          path: 'dashboard',
          name: 'dashboard',
          component: () => import('@/views/dashboards/SuperAdminDashboard.vue'),
          meta: { 
            title: 'لوحة التحكم',
            breadcrumb: 'لوحة التحكم'
          }
        },

        // Super Admin routes
        {
          path: 'admin',
          meta: { requiresRole: ['super_admin'] },
          children: [
            {
              path: 'users',
              name: 'admin-users',
              component: () => import('@/views/admin/Users.vue'),
              meta: { 
                title: 'إدارة المستخدمين',
                breadcrumb: 'إدارة المستخدمين'
              }
            },
            {
              path: 'users/create',
              name: 'admin-users-create',
              component: () => import('@/views/admin/UserCreate.vue'),
              meta: { 
                title: 'إضافة مستخدم جديد',
                breadcrumb: 'إضافة مستخدم'
              }
            },
            {
              path: 'approvals',
              name: 'admin-approvals',
              component: () => import('@/views/admin/Approvals.vue'),
              meta: { 
                title: 'طلبات الموافقة',
                breadcrumb: 'طلبات الموافقة'
              }
            },
            {
              path: 'brands',
              name: 'admin-brands',
              component: () => import('@/views/admin/Brands.vue'),
              meta: { 
                title: 'إدارة البراندات',
                breadcrumb: 'إدارة البراندات'
              }
            },
            {
              path: 'reports',
              name: 'admin-reports',
              component: () => import('@/views/admin/Reports.vue'),
              meta: { 
                title: 'التقارير المتقدمة',
                breadcrumb: 'التقارير'
              }
            }
          ]
        },

        // Marketing Coordinator routes
        {
          path: 'tasks',
          meta: { requiresRole: ['marketing_coordinator', 'super_admin'] },
          children: [
            {
              path: '',
              name: 'tasks',
              component: () => import('@/views/tasks/TaskList.vue'),
              meta: { 
                title: 'إدارة المهام',
                breadcrumb: 'المهام'
              }
            },
            {
              path: 'create',
              name: 'tasks-create',
              component: () => import('@/views/tasks/TaskCreate.vue'),
              meta: { 
                title: 'إنشاء مهمة جديدة',
                breadcrumb: 'إنشاء مهمة'
              }
            },
            {
              path: 'calendar',
              name: 'tasks-calendar',
              component: () => import('@/views/tasks/TaskCalendar.vue'),
              meta: { 
                title: 'تقويم المهام',
                breadcrumb: 'التقويم'
              }
            }
          ]
        },

        // Content routes
        {
          path: 'content',
          meta: { requiresRole: ['marketing_coordinator', 'super_admin'] },
          children: [
            {
              path: 'pending',
              name: 'content-pending',
              component: () => import('@/views/content/ContentPending.vue'),
              meta: { 
                title: 'المحتوى في الانتظار',
                breadcrumb: 'قائمة الانتظار'
              }
            },
            {
              path: 'gallery',
              name: 'content-gallery',
              component: () => import('@/views/content/ContentGallery.vue'),
              meta: { 
                title: 'معرض المحتوى',
                breadcrumb: 'المعرض'
              }
            }
          ]
        },

        // Brand Coordinator routes
        {
          path: 'brand',
          meta: { requiresRole: ['brand_coordinator'] },
          children: [
            {
              path: 'dashboard',
              name: 'brand-dashboard',
              component: () => import('@/views/brand/BrandDashboard.vue'),
              meta: { 
                title: 'إدارة البراند',
                breadcrumb: 'إدارة البراند'
              }
            },
            {
              path: 'tasks',
              name: 'brand-tasks',
              component: () => import('@/views/brand/BrandTasks.vue'),
              meta: { 
                title: 'مهام البراند',
                breadcrumb: 'المهام'
              }
            },
            {
              path: 'content',
              name: 'brand-content',
              component: () => import('@/views/brand/BrandContent.vue'),
              meta: { 
                title: 'محتوى البراند',
                breadcrumb: 'المحتوى'
              }
            }
          ]
        },

        // Photographer routes
        {
          path: 'photographer',
          meta: { requiresRole: ['photographer'] },
          children: [
            {
              path: 'tasks/current',
              name: 'photographer-tasks-current',
              component: () => import('@/views/photographer/TasksCurrent.vue'),
              meta: { 
                title: 'المهام الحالية',
                breadcrumb: 'المهام الحالية'
              }
            },
            {
              path: 'tasks/completed',
              name: 'photographer-tasks-completed',
              component: () => import('@/views/photographer/TasksCompleted.vue'),
              meta: { 
                title: 'المهام المكتملة',
                breadcrumb: 'المهام المكتملة'
              }
            },
            {
              path: 'upload',
              name: 'photographer-upload',
              component: () => import('@/views/photographer/ContentUpload.vue'),
              meta: { 
                title: 'رفع المحتوى',
                breadcrumb: 'رفع المحتوى'
              }
            },
            {
              path: 'schedule',
              name: 'photographer-schedule',
              component: () => import('@/views/photographer/Schedule.vue'),
              meta: { 
                title: 'جدولي الشخصي',
                breadcrumb: 'الجدول الشخصي'
              }
            },
            {
              path: 'earnings',
              name: 'photographer-earnings',
              component: () => import('@/views/photographer/Earnings.vue'),
              meta: { 
                title: 'أرباحي',
                breadcrumb: 'الأرباح'
              }
            }
          ]
        },

        // Common routes
        {
          path: 'profile',
          name: 'profile',
          component: () => import('@/views/common/Profile.vue'),
          meta: { 
            title: 'الملف الشخصي',
            breadcrumb: 'الملف الشخصي'
          }
        },
        {
          path: 'settings',
          name: 'settings',
          component: () => import('@/views/common/Settings.vue'),
          meta: { 
            title: 'الإعدادات',
            breadcrumb: 'الإعدادات'
          }
        }
      ]
    },

    // Convenience redirects for dashboard
    {
      path: '/dashboard',
      redirect: '/app/dashboard'
    },

    // Catch-all route
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      redirect: '/auth/login'
    }
  ],
})

// Navigation guards
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  // Set page title
  if (to.meta.title) {
    document.title = `${to.meta.title} - Depth Studio`
  } else {
    document.title = 'Depth Studio'
  }
  
  const isAuthenticated = authStore.isAuthenticated
  const userProfile = authStore.userProfile
  const userRole = userProfile?.primary_role
  
  // Debug info
  console.log('🔍 Navigation Debug:', {
    to: to.path,
    from: from.path,
    isAuthenticated,
    userRole,
    userStatus: userProfile?.status,
    userProfileExists: !!userProfile,
    isLoading: authStore.isLoading
  })
  
  // Check authentication requirements
  if (to.meta.requiresAuth && !isAuthenticated) {
    console.log('🚫 Auth required, redirecting to login')
    return next('/auth/login')
  }

  // Check role requirements
  if (to.meta.requiresRole && isAuthenticated) {
    const requiredRoles = Array.isArray(to.meta.requiresRole) ? to.meta.requiresRole : [to.meta.requiresRole]
    
    console.log('🔍 Role Check:', {
      userRole,
      userStatus: userProfile?.status,
      requiredRoles,
      userProfileExists: !!userProfile
    })
    
    if (!userRole || userRole === 'new_user' || userProfile?.status === 'pending_role_setup') {
      console.log('🚫 No role or new user, redirecting to role setup. Details:', {
        userRole,
        status: userProfile?.status,
        hasUserProfile: !!userProfile
      })
      return next('/auth/role-setup')
    }
    
    if (!requiredRoles.includes(userRole)) {
      console.log('🚫 Insufficient role, redirecting to dashboard')
      return next('/app/dashboard')
    }
  }
  
  // Prevent authenticated users from accessing guest pages
  if (to.meta.requiresGuest && isAuthenticated) {
    console.log('✅ Authenticated user accessing guest page. Details:', {
      userRole,
      status: userProfile?.status,
      isVerified: userProfile?.is_verified
    })
    
    if (!userRole || userRole === 'new_user' || userProfile?.status === 'pending_role_setup') {
      console.log('🔄 Redirecting to role setup from guest page')
      return next('/auth/role-setup')
    } else if (!userProfile?.is_verified) {
      console.log('🔄 Redirecting to pending approval')
      return next('/auth/pending-approval')
    } else {
      console.log('🔄 Redirecting to dashboard')
      return next('/app/dashboard')
    }
  }
  
  console.log('✅ Navigation allowed to:', to.path)
  next()
})

export default router
