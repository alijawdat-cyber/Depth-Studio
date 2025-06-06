/**
 * 🔐 User Permissions Management
 * 
 * تطوير علي جودت - Depth Studio
 * آخر تحديث: يناير 2025
 * 
 * @description Permission management and default permissions setup
 * @version 1.0.0
 */

import { UserRole } from '../../types/types';

/**
 * Helper function للحصول على صلاحيات الشاشات الافتراضية
 */
export function getDefaultScreenPermissions(role: UserRole): any {
  const basePermissions = {
    dashboard: true,
    profile: true,
    settings: true
  }
  
  switch (role) {
    case 'super_admin':
      return {
        ...basePermissions,
        users_management: true,
        brands_management: true,
        campaigns_management: true,
        content_management: true,
        analytics: true,
        system_settings: true
      }
    
    case 'marketing_coordinator':
      return {
        ...basePermissions,
        users_management: true,
        brands_management: true,
        campaigns_management: true,
        content_management: true,
        analytics: true
      }
    
    case 'brand_coordinator':
      return {
        ...basePermissions,
        campaigns_management: true,
        content_management: true,
        brand_analytics: true
      }
    
    case 'photographer':
      return {
        ...basePermissions,
        my_tasks: true,
        content_upload: true,
        equipment_booking: true
      }
    
    default:
      return basePermissions
  }
}

/**
 * Helper function للحصول على صلاحيات CRUD الافتراضية
 */
export function getDefaultCrudPermissions(role: UserRole): any {
  switch (role) {
    case 'super_admin':
      return {
        users: { create: true, read: true, update: true, delete: true },
        brands: { create: true, read: true, update: true, delete: true },
        campaigns: { create: true, read: true, update: true, delete: true },
        tasks: { create: true, read: true, update: true, delete: true },
        content: { create: true, read: true, update: true, delete: true }
      }
    
    case 'marketing_coordinator':
      return {
        users: { create: true, read: true, update: true, delete: false },
        brands: { create: true, read: true, update: true, delete: false },
        campaigns: { create: true, read: true, update: true, delete: true },
        tasks: { create: true, read: true, update: true, delete: true },
        content: { create: false, read: true, update: true, delete: false }
      }
    
    case 'brand_coordinator':
      return {
        users: { create: false, read: true, update: false, delete: false },
        brands: { create: false, read: true, update: false, delete: false },
        campaigns: { create: true, read: true, update: true, delete: false },
        tasks: { create: true, read: true, update: true, delete: false },
        content: { create: false, read: true, update: true, delete: false }
      }
    
    case 'photographer':
      return {
        users: { create: false, read: false, update: false, delete: false },
        brands: { create: false, read: false, update: false, delete: false },
        campaigns: { create: false, read: false, update: false, delete: false },
        tasks: { create: false, read: true, update: true, delete: false },
        content: { create: true, read: true, update: true, delete: false }
      }
    
    default:
      return {}
  }
}

/**
 * التحقق من صلاحية محددة للمستخدم
 */
export function checkUserPermission(userPermissions: any, resource: string, action: string): boolean {
  return userPermissions?.crud_permissions?.[resource]?.[action] || false;
}

/**
 * التحقق من صلاحية الوصول لشاشة معينة
 */
export function checkScreenAccess(userPermissions: any, screen: string): boolean {
  return userPermissions?.screen_permissions?.[screen] || false;
}

/**
 * التحقق من صلاحيات البراند للمستخدم
 */
export function checkBrandAccess(userPermissions: any, brandId: string): boolean {
  const brandPermissions = userPermissions?.brand_permissions || [];
  return brandPermissions.some((bp: any) => bp.brand_id === brandId);
}

/**
 * التحقق من إذا كان المستخدم admin أو لا
 */
export function isAdmin(userRole: UserRole): boolean {
  return ['super_admin', 'marketing_coordinator'].includes(userRole);
}

/**
 * التحقق من إذا كان المستخدم super admin
 */
export function isSuperAdmin(userRole: UserRole): boolean {
  return userRole === 'super_admin';
}

export const userPermissions = {
  getDefaultScreenPermissions,
  getDefaultCrudPermissions,
  checkUserPermission,
  checkScreenAccess,
  checkBrandAccess,
  isAdmin,
  isSuperAdmin
}; 