// ======================================
// 🔤 Unified Types Export for Depth Studio
// ======================================
// Single source of truth for all TypeScript types
// Last Updated: December 2024

// Re-export all types from the main types file
export * from './types';

// Export shared types for backward compatibility
// TODO: Remove shared.ts after migration is complete
export type {
  User,
  UserRole,
  UserPermissions,
  PhotographerProfile,
  BrandCoordinator,
  SmartCampaign,
  CampaignTask,
  Payment,
  ContentLibrary,
  Equipment,
  Brand,
  ContentCategory,
  Settings,
  CampaignNotification,
  ApiResponse,
  PaginatedResponse,
  AuthState,
  AuthUser,
  LoginCredentials,
  RegisterData
} from './types'; 