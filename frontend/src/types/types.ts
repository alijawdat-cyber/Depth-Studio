// ======================================
// 🔤 Shared Types for Depth Studio
// ======================================
// Based on depth_studio_database_api_specification.md
// Last Updated: June 3, 2025

import { Timestamp } from 'firebase/firestore';

// ======================================
// 👥 User & Authentication Types
// ======================================

/**
 * Core User Interface - Based on users collection
 */
export interface User {
  id: string; // Firebase UID
  
  // Basic Information
  email: string;
  phone?: string;
  display_name: string;
  first_name: string;
  last_name: string;
  profile_photo_url?: string;
  
  // Role and Status
  primary_role: UserRole;
  status?: UserStatus; // حالة المستخدم أثناء عملية التسجيل
  is_active: boolean;
  is_verified: boolean;
  last_login?: Timestamp;
  
  // Additional Info
  bio?: string;
  location?: string;
  timezone: string; // default: 'Asia/Baghdad'
  language: string; // default: 'ar'
  
  // Firebase Authentication
  firebase_uid: string;
  auth_providers: AuthProvider[];
  
  // Activity Tracking
  total_login_count: number;
  last_seen?: Timestamp;
  is_online: boolean;
  
  // System Fields
  created_at: Timestamp;
  updated_at: Timestamp;
  created_by?: string;
  updated_by?: string;
}

export type UserRole = 
  | 'super_admin'          // علي جودت
  | 'marketing_coordinator' // حسن هاشم
  | 'brand_coordinator'     // منسقي البراندات
  | 'photographer'          // المصورين
  | 'new_user';             // المستخدمين الجدد في انتظار اختيار الدور

export type UserStatus = 
  | 'pending_role_setup'    // في انتظار اختيار الدور
  | 'pending_approval'      // في انتظار موافقة الإدارة
  | 'active'                // مفعل ومعتمد
  | 'suspended'             // معلق مؤقتاً
  | 'archived';             // مؤرشف

export type AuthProvider = 'email' | 'phone' | 'google';

/**
 * User Permissions - Based on user_permissions collection
 */
export interface UserPermissions {
  id: string;
  user_id: string;
  
  // Multiple Roles Support
  roles: UserRoleAssignment[];
  
  // Screen Permissions
  screen_permissions: ScreenPermissions;
  
  // CRUD Permissions
  crud_permissions: CRUDPermissions;
  
  // Brand Specific Permissions
  brand_permissions: BrandPermission[];
  
  // Custom Permissions
  custom_permissions: Record<string, CustomPermission>;
  
  // Status
  is_active: boolean;
  last_updated_by: string;
  created_at: Timestamp;
  updated_at: Timestamp;
  
  // Change Log
  changelog: PermissionChange[];
}

export interface UserRoleAssignment {
  role_type: UserRole;
  is_primary: boolean;
  granted_at: Timestamp;
  granted_by: string;
  expires_at?: Timestamp;
}

export interface ScreenPermissions {
  dashboard: boolean;
  users_management: boolean;
  brands_management: boolean;
  campaigns_management: boolean;
  content_review: boolean;
  financial_reports: boolean;
  analytics: boolean;
  settings: boolean;
}

export interface CRUDPermissions {
  users: CRUDActions;
  brands: CRUDActions;
  campaigns: CRUDActions;
  tasks: CRUDActions;
  content: CRUDActions;
  payments: CRUDActions;
  reports: CRUDActions;
}

export interface CRUDActions {
  create: boolean;
  read: boolean;
  update: boolean;
  delete: boolean;
}

export interface BrandPermission {
  brand_id: string;
  access_level: 'full' | 'read_only' | 'coordinator' | 'content_only';
  can_approve_content: boolean;
  can_edit_tasks: boolean;
  can_view_financials: boolean;
  assigned_at: Timestamp;
  assigned_by: string;
}

export interface CustomPermission {
  permission_name: string;
  permission_value: boolean;
  description: string;
  granted_by: string;
  granted_at: Timestamp;
}

export interface PermissionChange {
  action: 'granted' | 'revoked' | 'modified';
  permission_type: string;
  old_value: any;
  new_value: any;
  changed_by: string;
  changed_at: Timestamp;
  reason?: string;
}

// ======================================
// 📸 Photographer Profile Types
// ======================================

/**
 * Photographer Profile - Based on photographer_profiles collection
 */
export interface PhotographerProfile {
  id: string;
  user_id: string;
  
  // Contract Type (Critical for calculations)
  contract_type: ContractType;
  
  // Freelancer Information
  freelancer_info?: FreelancerInfo;
  
  // Salary Information
  salary_info?: SalaryInfo;
  
  // Specializations
  specializations: Specialization[];
  
  // Work Preferences
  work_preferences: WorkPreferences;
  
  // Owned Equipment
  owned_equipment: OwnedEquipment[];
  
  // Performance Statistics
  performance_stats: PerformanceStats;
  
  // Availability
  availability: PhotographerAvailability;
  
  // Financial Information
  financial_info: FinancialInfo;
  
  // Contact Preferences
  contact_preferences: ContactPreferences;
  
  // System Fields
  is_active: boolean;
  verification_status: VerificationStatus;
  verification_date?: Timestamp;
  verified_by?: string;
  hire_date: Timestamp;
  created_at: Timestamp;
  updated_at: Timestamp;
  last_activity?: Timestamp;
}

export type ContractType = 'freelancer' | 'salary';

export interface FreelancerInfo {
  base_rate_percentage: number; // 0.0-1.0
  preferred_payment_method: PaymentMethod;
  payment_schedule: PaymentSchedule;
  minimum_task_value?: number;
  total_earnings_ytd: number;
  pending_payments: number;
  last_payment_date?: Timestamp;
}

export interface SalaryInfo {
  monthly_salary: number;
  monthly_target_tasks: number;
  bonus_per_extra_task: number;
  performance_bonus_rate: number;
  current_month_completed: number;
  current_month_target: number;
  total_bonus_earned: number;
  performance_rating: number; // 1.0-5.0
}

export type PaymentMethod = 'bank_transfer' | 'cash' | 'digital_wallet';
export type PaymentSchedule = 'per_task' | 'weekly' | 'bi_weekly' | 'monthly';

export interface Specialization {
  category_id: string;
  skill_level: SkillLevel;
  experience_years: number;
  portfolio_samples: string[]; // URLs
  hourly_rate_modifier: number; // 0.5-2.0
}

export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface WorkPreferences {
  preferred_brands: string[]; // brand IDs
  max_concurrent_tasks: number;
  preferred_work_hours: {
    start_time: string;
    end_time: string;
    timezone: string;
  };
  available_days: DayOfWeek[];
  preferred_locations: LocationType[];
  max_travel_distance: number; // kilometers
}

export type DayOfWeek = 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday';
export type LocationType = 'studio' | 'client_location' | 'outdoor' | 'home' | 'travel';

export interface OwnedEquipment {
  equipment_id: string;
  condition: EquipmentCondition;
  purchase_date?: Timestamp;
  is_available: boolean;
  maintenance_notes?: string;
}

export type EquipmentCondition = 'excellent' | 'good' | 'fair' | 'needs_repair';

export interface PerformanceStats {
  total_tasks_completed: number;
  average_rating: number; // 1.0-5.0
  on_time_completion_rate: number; // 0.0-1.0
  client_satisfaction_score: number; // 1.0-5.0
  quality_score_average: number; // 1.0-5.0
  brand_performance: Record<string, BrandPerformance>;
  category_performance: Record<string, CategoryPerformance>;
}

export interface BrandPerformance {
  tasks_completed: number;
  average_rating: number;
  preferred_by_brand: boolean;
}

export interface CategoryPerformance {
  tasks_completed: number;
  average_time_taken: number; // hours
  quality_score: number;
  improvement_trend: 'improving' | 'stable' | 'declining';
}

export interface PhotographerAvailability {
  is_currently_available: boolean;
  unavailable_periods: UnavailablePeriod[];
  max_daily_hours: number;
  preferred_break_duration: number; // minutes
}

export interface UnavailablePeriod {
  start_date: Date;
  end_date: Date;
  reason: string;
  type: 'vacation' | 'sick_leave' | 'personal' | 'other_work';
}

export interface FinancialInfo {
  tax_id?: string;
  bank_account?: string; // encrypted
  payment_terms?: string;
  currency: string; // default: 'IQD'
}

export interface ContactPreferences {
  preferred_contact_method: ContactMethod;
  whatsapp_number?: string;
  telegram_username?: string;
}

export type ContactMethod = 'email' | 'phone' | 'whatsapp' | 'telegram';
export type VerificationStatus = 'pending' | 'verified' | 'suspended' | 'rejected';

// ======================================
// 🏢 Brand Coordinator Types
// ======================================

/**
 * Brand Coordinator - Based on brand_coordinators collection
 */
export interface BrandCoordinator {
  id: string;
  user_id: string;
  brand_id: string;
  
  // Coordinator Information
  coordinator_title: string;
  job_description: string;
  
  // Specific Responsibilities
  responsibilities: ResponsibilityType[];
  
  // Brand Specific Permissions
  brand_permissions: BrandCoordinatorPermissions;
  
  // Client Contact Information
  client_contact_info: ClientContactInfo;
  
  // Performance Metrics
  performance_metrics: CoordinatorPerformanceMetrics;
  
  // Work Schedule
  work_schedule: WorkSchedule;
  
  // Employment Information
  employment_info: EmploymentInfo;
  
  // Notes and Evaluations
  notes: CoordinatorNotes;
  
  // Status
  status: CoordinatorStatus;
  is_primary_coordinator: boolean;
  
  // System Fields
  created_at: Timestamp;
  updated_at: Timestamp;
  created_by: string;
  last_activity?: Timestamp;
}

export type ResponsibilityType = 
  | 'sales_management'
  | 'content_approval'
  | 'task_coordination'
  | 'client_communication'
  | 'quality_control'
  | 'budget_management'
  | 'schedule_management'
  | 'photographer_coordination'
  | 'content_review'
  | 'brand_compliance';

export interface BrandCoordinatorPermissions {
  can_approve_content: boolean;
  can_reject_content: boolean;
  can_assign_tasks: boolean;
  can_modify_deadlines: boolean;
  can_view_financials: boolean;
  can_communicate_with_client: boolean;
  max_budget_authority?: number;
}

export interface ClientContactInfo {
  client_primary_contact: string;
  client_email?: string;
  client_phone?: string;
  client_whatsapp?: string;
  preferred_communication_hours: {
    start_time: string;
    end_time: string;
    timezone: string;
  };
  communication_language: 'arabic' | 'english' | 'both';
}

export interface CoordinatorPerformanceMetrics {
  total_projects_managed: number;
  client_satisfaction_rating: number; // 1.0-5.0
  average_response_time: number; // hours
  content_approval_rate: number; // 0.0-1.0
  on_time_delivery_rate: number; // 0.0-1.0
  monthly_stats: Record<string, MonthlyStats>; // 'YYYY-MM' format
}

export interface MonthlyStats {
  projects_completed: number;
  client_meetings: number;
  content_approved: number;
  content_rejected: number;
  average_project_rating: number;
}

export interface WorkSchedule {
  working_days: DayOfWeek[];
  working_hours: {
    start_time: string;
    end_time: string;
  };
  timezone: string;
  is_available: boolean;
  unavailable_periods: UnavailablePeriod[];
}

export interface EmploymentInfo {
  start_date: Date;
  end_date?: Date;
  contract_type: 'full_time' | 'part_time' | 'consultant' | 'freelance';
  compensation_type: 'salary' | 'hourly' | 'project_based';
  is_exclusive: boolean;
}

export interface CoordinatorNotes {
  management_notes: string; // private
  client_feedback: string;
  self_evaluation: string;
  areas_for_improvement: string[];
  strengths: string[];
}

export type CoordinatorStatus = 'active' | 'inactive' | 'on_leave' | 'terminated';

// ======================================
// 🎯 Campaign & Task Types
// ======================================

/**
 * Smart Campaign - Based on smart_campaigns collection
 */
export interface SmartCampaign {
  id: string;
  
  // Campaign Basic Information
  campaign_info: CampaignInfo;
  
  // Target and Goals
  campaign_goals: CampaignGoals;
  
  // Timeline and Scheduling
  timeline: CampaignTimeline;
  
  // Content Categories and Requirements
  content_requirements: ContentRequirement[];
  
  // AI Configuration
  ai_configuration: AIConfiguration;
  
  // Budget Management
  budget_management: BudgetManagement;
  
  // Quality Control
  quality_settings: QualitySettings;
  
  // Approval Workflow
  approval_workflow: ApprovalWorkflow;
  
  // Progress Tracking
  progress_tracking: ProgressTracking;
  
  // System Fields
  campaign_status: CampaignStatus;
  created_at: Timestamp;
  updated_at: Timestamp;
  created_by: string;
}

export interface CampaignInfo {
  name: string;
  description: string;
  brand_id: string;
  campaign_type: CampaignType;
  priority_level: PriorityLevel;
}

export type CampaignType = 'product_launch' | 'seasonal' | 'promotional' | 'brand_awareness' | 'event' | 'ongoing';
export type PriorityLevel = 'low' | 'medium' | 'high' | 'urgent';

export interface CampaignGoals {
  total_content_pieces: number;
  target_completion_date: Timestamp;
  expected_roi: number;
  success_metrics: string[];
}

export interface CampaignTimeline {
  campaign_start_date: Timestamp;
  campaign_end_date: Timestamp;
  key_milestones: Milestone[];
  buffer_days: number;
}

export interface Milestone {
  milestone_name: string;
  target_date: Timestamp;
  description: string;
  dependencies: string[];
}

export interface ContentRequirement {
  category_id: string;
  quantity: number;
  priority: PriorityLevel;
  specific_requirements: string;
  deadlines: Timestamp[];
}

export interface AIConfiguration {
  enable_smart_assignment: boolean;
  photographer_selection_criteria: SelectionCriteria;
  auto_scheduling: boolean;
  conflict_resolution: ConflictResolutionSettings;
}

export interface SelectionCriteria {
  prioritize_specialization: boolean;
  consider_workload: boolean;
  prefer_brand_familiarity: boolean;
  location_preference_weight: number;
  availability_weight: number;
  performance_weight: number;
}

export interface ConflictResolutionSettings {
  auto_resolve_minor_conflicts: boolean;
  escalation_threshold: number; // hours
  notification_preferences: NotificationPreference[];
}

export interface NotificationPreference {
  notification_type: NotificationType;
  recipients: string[];
  delivery_method: DeliveryMethod[];
}

export interface BudgetManagement {
  total_budget: number;
  currency: string;
  budget_allocation: BudgetAllocation[];
  spending_alerts: SpendingAlert[];
}

export interface BudgetAllocation {
  category_id: string;
  allocated_amount: number;
  spent_amount: number;
  remaining_amount: number;
}

export interface SpendingAlert {
  threshold_percentage: number;
  alert_recipients: string[];
  alert_methods: DeliveryMethod[];
}

export interface QualitySettings {
  quality_checkpoints: QualityCheckpoint[];
  approval_requirements: ApprovalRequirement[];
  revision_limits: number;
}

export interface QualityCheckpoint {
  checkpoint_name: string;
  checkpoint_type: 'automatic' | 'manual';
  criteria: string[];
  required_score: number;
}

export interface ApprovalRequirement {
  approval_level: 'photographer' | 'coordinator' | 'client' | 'super_admin';
  required_for_content_types: string[];
  approval_timeout: number; // hours
}

export interface ApprovalWorkflow {
  workflow_steps: WorkflowStep[];
  escalation_rules: EscalationRule[];
}

export interface WorkflowStep {
  step_name: string;
  step_order: number;
  responsible_role: UserRole;
  required_action: string;
  timeout_hours: number;
}

export interface EscalationRule {
  trigger_condition: string;
  escalate_to: UserRole;
  escalation_message: string;
  escalation_delay: number; // hours
}

export interface ProgressTracking {
  overall_progress_percentage: number;
  tasks_completed: number;
  tasks_in_progress: number;
  tasks_pending: number;
  quality_score: number;
  timeline_adherence: number; // percentage
  budget_utilization: number; // percentage
}

export type CampaignStatus = 'draft' | 'scheduled' | 'active' | 'paused' | 'completed' | 'cancelled';

// ======================================
// 🔔 Notification Types
// ======================================

/**
 * Campaign Notifications - Based on campaign_notifications collection
 */
export interface CampaignNotification {
  id: string;
  
  // Campaign/Task Reference
  campaign_id: string;
  task_id?: string;
  
  // Notification Information
  notification_info: NotificationInfo;
  
  // Sender and Recipient
  sender_info: SenderInfo;
  recipient_info: RecipientInfo;
  
  // Notification Status
  notification_status: NotificationStatus;
  
  // Follow-up and Escalation
  follow_up: FollowUpSettings;
  
  // Related Data
  related_data: RelatedNotificationData;
}

export interface NotificationInfo {
  notification_type: NotificationType;
  priority_level: PriorityLevel;
  title: string;
  message: string;
  action_required: boolean;
  required_action?: RequiredAction;
}

export type NotificationType = 
  // Task Notifications
  | 'task_assigned'
  | 'task_reminder_24h'
  | 'task_reminder_2h'
  | 'task_started'
  | 'task_completed'
  | 'task_cancelled'
  | 'task_rescheduled'
  | 'task_revision_requested'
  // Campaign Notifications
  | 'campaign_started'
  | 'campaign_milestone'
  | 'campaign_completed'
  | 'campaign_delayed'
  | 'campaign_budget_alert'
  // Conflict Notifications
  | 'conflict_detected'
  | 'conflict_resolved'
  | 'equipment_unavailable'
  | 'schedule_conflict'
  // Quality Notifications
  | 'quality_issue'
  | 'content_approved'
  | 'content_rejected'
  // Financial Notifications
  | 'payment_ready'
  | 'payment_processed'
  | 'budget_exceeded';

export interface RequiredAction {
  action_type: 'accept_task' | 'review_content' | 'resolve_conflict' | 'update_schedule' | 'other';
  action_deadline?: Timestamp;
  action_url?: string;
  action_data?: Record<string, any>;
}

export interface SenderInfo {
  sender_type: 'system' | 'user' | 'ai_agent';
  sender_id?: string;
  sender_name: string;
}

export interface RecipientInfo {
  recipient_id: string;
  recipient_role: UserRole;
  delivery_methods: DeliveryStatus[];
}

export interface DeliveryStatus {
  method: DeliveryMethod;
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'read';
  sent_at?: Timestamp;
  delivered_at?: Timestamp;
  read_at?: Timestamp;
  failure_reason?: string;
}

export type DeliveryMethod = 'email' | 'sms' | 'push_notification' | 'in_app' | 'whatsapp';

export interface NotificationStatus {
  overall_status: 'pending' | 'sent' | 'delivered' | 'read' | 'acted_upon' | 'expired';
  is_read: boolean;
  read_at?: Timestamp;
  action_taken: ActionTaken;
}

export interface ActionTaken {
  action_performed: boolean;
  action_date?: Timestamp;
  action_description?: string;
  action_result?: 'accepted' | 'rejected' | 'completed' | 'failed';
}

export interface FollowUpSettings {
  is_recurring: boolean;
  recurrence_pattern: 'none' | 'daily' | 'weekly' | 'before_deadline';
  follow_up_notifications: FollowUpNotification[];
  escalation_rules: NotificationEscalationRule;
}

export interface FollowUpNotification {
  follow_up_time: Timestamp;
  follow_up_message: string;
  is_sent: boolean;
  escalation_level: 'normal' | 'escalated' | 'urgent';
}

export interface NotificationEscalationRule {
  escalate_after?: number; // hours
  escalate_to?: string;
  escalation_message?: string;
}

export interface RelatedNotificationData {
  related_brand_id?: string;
  related_photographer_id?: string;
  related_equipment_ids?: string[];
  metadata: Record<string, any>;
  attachments: NotificationAttachment[];
}

export interface NotificationAttachment {
  file_url: string;
  file_name: string;
  file_type: string;
  file_size: number;
}

// ======================================
// 🔄 API Response Types
// ======================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
  request_id?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  data: T[];
  pagination: PaginationInfo;
}

export interface PaginationInfo {
  current_page: number;
  total_pages: number;
  total_items: number;
  items_per_page: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface QueryOptions {
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  filters?: Record<string, any>;
  search?: string;
  include_deleted?: boolean;
}

// ======================================
// 🔐 Authentication State
// ======================================

export interface AuthUser {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  emailVerified: boolean;
  phoneNumber?: string;
  customClaims?: Record<string, any>;
}

export interface AuthState {
  user: AuthUser | null;
  userProfile: User | null;
  permissions: UserPermissions | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
  remember_me?: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  primary_role: UserRole;
}

// ======================================
// 🎭 Roles Types
// ======================================

/**
 * Role Interface - Based on roles collection
 */
export interface Role {
  id: string;
  role_name: UserRole;
  display_name: string;
  description: string;
  permissions: Record<string, string[]>;
  hierarchy_level: number;
  can_assign_roles: UserRole[];
  is_active: boolean;
  created_at: Timestamp;
  updated_at: Timestamp;
}

// ======================================
// 🏢 Brand Types
// ======================================

/**
 * Brand Interface - Based on brands collection
 */
export interface Brand {
  id: string;
  name: {
    ar: string;
    en: string;
  };
  description: {
    ar: string;
    en: string;
  };
  brand_type: string;
  industry: string;
  status: BrandStatus;
  
  // Brand Identity
  brand_identity: BrandIdentity;
  
  // Contact Information
  contact_info: BrandContactInfo;
  
  // Coordinator Assignment
  assigned_coordinator: string | null;
  
  // Budget and Pricing
  budget_settings: BrandBudgetSettings;
  
  // Content Preferences
  content_preferences: BrandContentPreferences;
  
  // Statistics
  statistics: BrandStatistics;
  
  // System Fields
  is_active: boolean;
  created_at: Timestamp;
  updated_at: Timestamp;
  created_by: string;
}

export type BrandStatus = 'active' | 'paused' | 'archived' | 'development';

export interface BrandIdentity {
  logo_url: string | null;
  primary_color: string;
  secondary_color: string;
  font_family: string;
  brand_guidelines_url: string | null;
}

export interface BrandContactInfo {
  primary_contact_name: string;
  primary_contact_email: string;
  primary_contact_phone: string | null;
  company_address: string;
  website_url: string | null;
  social_media: Record<string, string>;
}

export interface BrandBudgetSettings {
  monthly_budget: number;
  currency: string;
  pricing_tier: string;
  payment_terms: string;
  budget_alerts_enabled: boolean;
}

export interface BrandContentPreferences {
  preferred_styles: string[];
  content_categories: string[];
  quality_requirements: string;
  delivery_format: string[];
  usage_rights: string;
}

export interface BrandStatistics {
  total_campaigns: number;
  total_content_pieces: number;
  average_project_rating: number;
  total_spent: number;
  active_campaigns: number;
}

// ======================================
// 📂 Content Category Types
// ======================================

/**
 * Content Category Interface - Based on content_categories collection
 */
export interface ContentCategory {
  id: string;
  name: {
    ar: string;
    en: string;
  };
  description: {
    ar: string;
    en: string;
  };
  category_type: string;
  default_requirements: string[];
  estimated_time_hours: number;
  base_price: number;
  pricing_factors: ContentPricingFactors;
  quality_criteria: string[];
  required_equipment: string[];
  is_active: boolean;
  sort_order: number;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface ContentPricingFactors {
  complexity_multiplier: number;
  rush_multiplier: number;
  revision_cost: number;
}

// ======================================
// 🛠️ Equipment Types
// ======================================

/**
 * Equipment Interface - Based on equipment collection
 */
export interface Equipment {
  id: string;
  name: {
    ar: string;
    en: string;
  };
  description: {
    ar: string;
    en: string;
  };
  equipment_type: EquipmentType;
  brand: string;
  model: string;
  specifications: EquipmentSpecifications;
  condition: EquipmentCondition;
  availability: EquipmentAvailability;
  maintenance: EquipmentMaintenance;
  financial_info: EquipmentFinancialInfo;
  location_info: EquipmentLocationInfo;
  usage_stats: EquipmentUsageStats;
  is_active: boolean;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export type EquipmentType = 'camera' | 'lens' | 'lighting' | 'tripod' | 'backdrop' | 'audio' | 'computer' | 'software' | 'accessories';

export interface EquipmentSpecifications {
  technical_specs: Record<string, any>;
  compatibility: string[];
  requirements: string[];
}

export interface EquipmentAvailability {
  is_available: boolean;
  current_user: string | null;
  reserved_until: Timestamp | null;
  booking_calendar: EquipmentBooking[];
}

export interface EquipmentBooking {
  user_id: string;
  start_time: Timestamp;
  end_time: Timestamp;
  purpose: string;
  status: 'confirmed' | 'pending' | 'cancelled';
}

export interface EquipmentMaintenance {
  last_maintenance: Timestamp | null;
  next_maintenance: Timestamp | null;
  maintenance_notes: string[];
  warranty_expiry: Timestamp | null;
}

export interface EquipmentFinancialInfo {
  purchase_price: number;
  purchase_date: Timestamp;
  depreciation_rate: number;
  insurance_info: string | null;
}

export interface EquipmentLocationInfo {
  current_location: string;
  storage_location: string;
  is_portable: boolean;
}

export interface EquipmentUsageStats {
  total_bookings: number;
  total_hours_used: number;
  last_used: Timestamp | null;
  usage_rating: number;
}

// ======================================
// 📋 Campaign Task Types
// ======================================

/**
 * Campaign Task Interface - Based on campaign_tasks collection
 */
export interface CampaignTask {
  id: string;
  campaign_id: string;
  task_info: TaskInfo;
  assignment: TaskAssignment;
  requirements: TaskRequirements;
  timeline: TaskTimeline;
  deliverables: TaskDeliverables;
  quality_control: TaskQualityControl;
  status_tracking: TaskStatusTracking;
  financial_info: TaskFinancialInfo;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface TaskInfo {
  title: string;
  description: string;
  task_type: string;
  priority_level: PriorityLevel;
  category_id: string;
}

export interface TaskAssignment {
  assigned_photographer: string | null;
  assigned_by: string;
  assigned_at: Timestamp | null;
  assignment_method: 'manual' | 'ai_auto' | 'photographer_choice';
  backup_photographers: string[];
}

export interface TaskRequirements {
  content_requirements: string[];
  technical_specifications: Record<string, any>;
  location_requirements: TaskLocationRequirements;
  equipment_requirements: string[];
  style_guidelines: string[];
}

export interface TaskLocationRequirements {
  location_type: LocationType;
  specific_location: string | null;
  travel_required: boolean;
  setup_time_needed: number;
}

export interface TaskTimeline {
  start_date: Timestamp;
  due_date: Timestamp;
  estimated_duration: number;
  actual_start_time: Timestamp | null;
  actual_completion_time: Timestamp | null;
  buffer_time: number;
}

export interface TaskDeliverables {
  expected_outputs: TaskOutput[];
  delivery_format: string[];
  quality_requirements: string[];
  approval_required: boolean;
}

export interface TaskOutput {
  output_type: string;
  quantity: number;
  specifications: Record<string, any>;
  examples: string[];
}

export interface TaskQualityControl {
  quality_checkpoints: string[];
  reviewer_assignments: string[];
  approval_workflow: string[];
  revision_limit: number;
}

export interface TaskStatusTracking {
  current_status: TaskStatus;
  status_history: TaskStatusUpdate[];
  progress_percentage: number;
  milestones_completed: string[];
  issues_encountered: TaskIssue[];
}

export type TaskStatus = 'pending' | 'assigned' | 'in_progress' | 'review' | 'revision_needed' | 'completed' | 'cancelled';

export interface TaskStatusUpdate {
  status: TaskStatus;
  updated_by: string;
  updated_at: Timestamp;
  notes: string;
}

export interface TaskIssue {
  issue_type: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  reported_by: string;
  reported_at: Timestamp;
  resolution: string | null;
  resolved_at: Timestamp | null;
}

export interface TaskFinancialInfo {
  estimated_cost: number;
  actual_cost: number;
  photographer_payment: number;
  additional_costs: TaskAdditionalCost[];
  payment_status: 'pending' | 'approved' | 'paid';
}

export interface TaskAdditionalCost {
  cost_type: string;
  amount: number;
  description: string;
  approved_by: string | null;
}

// ======================================
// 💰 Payment Types
// ======================================

/**
 * Payment Interface - Based on payments collection
 */
export interface Payment {
  id: string;
  payment_info: PaymentInfo;
  recipient_info: PaymentRecipientInfo;
  amount_details: PaymentAmountDetails;
  payment_breakdown: PaymentBreakdown;
  status_tracking: PaymentStatusTracking;
  payment_method_info: PaymentMethodInfo;
  approval_workflow: PaymentApprovalWorkflow;
  tax_information: PaymentTaxInfo;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface PaymentInfo {
  payment_type: PaymentType;
  description: string;
  reference_id: string;
  campaign_id: string | null;
  task_ids: string[];
  payment_period: PaymentPeriod | null;
}

export type PaymentType = 'task_payment' | 'monthly_salary' | 'bonus' | 'reimbursement' | 'equipment_rental';

export interface PaymentPeriod {
  start_date: Timestamp;
  end_date: Timestamp;
  period_type: 'weekly' | 'monthly' | 'custom';
}

export interface PaymentRecipientInfo {
  recipient_id: string;
  recipient_type: 'photographer' | 'coordinator' | 'vendor';
  recipient_name: string;
  contract_type: ContractType;
  payment_terms: string;
}

export interface PaymentAmountDetails {
  base_amount: number;
  bonus_amount: number;
  deduction_amount: number;
  net_amount: number;
  currency: string;
  exchange_rate: number | null;
}

export interface PaymentBreakdown {
  task_payments: TaskPaymentDetail[];
  bonus_details: PaymentBonusDetail[];
  deduction_details: PaymentDeductionDetail[];
  expense_reimbursements: PaymentExpenseDetail[];
}

export interface TaskPaymentDetail {
  task_id: string;
  category_id: string;
  base_rate: number;
  quantity: number;
  quality_bonus: number;
  rush_bonus: number;
  total_amount: number;
}

export interface PaymentBonusDetail {
  bonus_type: string;
  description: string;
  amount: number;
  calculation_method: string;
}

export interface PaymentDeductionDetail {
  deduction_type: string;
  description: string;
  amount: number;
  reason: string;
}

export interface PaymentExpenseDetail {
  expense_type: string;
  description: string;
  amount: number;
  receipt_url: string | null;
}

export interface PaymentStatusTracking {
  current_status: PaymentStatus;
  status_history: PaymentStatusUpdate[];
  approval_status: PaymentApprovalStatus;
  payment_date: Timestamp | null;
  confirmation_number: string | null;
}

export type PaymentStatus = 'draft' | 'pending_approval' | 'approved' | 'processing' | 'paid' | 'failed' | 'cancelled';
export type PaymentApprovalStatus = 'pending' | 'approved_by_coordinator' | 'approved_by_admin' | 'rejected';

export interface PaymentStatusUpdate {
  status: PaymentStatus;
  updated_by: string;
  updated_at: Timestamp;
  notes: string;
}

export interface PaymentMethodInfo {
  payment_method: PaymentMethod;
  bank_details: PaymentBankDetails | null;
  digital_wallet_info: PaymentDigitalWalletInfo | null;
  processing_fees: number;
}

export interface PaymentBankDetails {
  bank_name: string;
  account_holder_name: string;
  account_number: string;
  routing_number: string | null;
  swift_code: string | null;
}

export interface PaymentDigitalWalletInfo {
  wallet_type: string;
  wallet_id: string;
  wallet_phone: string | null;
}

export interface PaymentApprovalWorkflow {
  requires_coordinator_approval: boolean;
  requires_admin_approval: boolean;
  coordinator_approved_by: string | null;
  coordinator_approved_at: Timestamp | null;
  admin_approved_by: string | null;
  admin_approved_at: Timestamp | null;
  approval_notes: string[];
}

export interface PaymentTaxInfo {
  is_taxable: boolean;
  tax_rate: number;
  tax_amount: number;
  tax_id: string | null;
  tax_exemption: boolean;
}

// ======================================
// 📚 Content Library Types
// ======================================

/**
 * Content Library Interface - Based on content_library collection
 */
export interface ContentLibrary {
  id: string;
  content_info: ContentInfo;
  file_details: ContentFileDetails;
  metadata: ContentMetadata;
  categorization: ContentCategorization;
  usage_rights: ContentUsageRights;
  quality_metrics: ContentQualityMetrics;
  approval_info: ContentApprovalInfo;
  engagement_stats: ContentEngagementStats;
  storage_info: ContentStorageInfo;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface ContentInfo {
  title: string;
  description: string;
  content_type: ContentType;
  campaign_id: string | null;
  task_id: string | null;
  brand_id: string;
  photographer_id: string;
}

export type ContentType = 'image' | 'video' | 'graphic_design' | 'text_content' | 'audio' | 'document';

export interface ContentFileDetails {
  original_filename: string;
  file_size: number;
  file_format: string;
  dimensions: ContentDimensions | null;
  duration: number | null;
  resolution: string | null;
  color_profile: string | null;
}

export interface ContentDimensions {
  width: number;
  height: number;
  aspect_ratio: string;
}

export interface ContentMetadata {
  tags: string[];
  keywords: string[];
  mood: string[];
  style: string[];
  colors: string[];
  location: string | null;
  shooting_date: Timestamp | null;
  equipment_used: string[];
}

export interface ContentCategorization {
  primary_category: string;
  subcategories: string[];
  target_audience: string[];
  usage_context: string[];
  seasonal_relevance: string[];
}

export interface ContentUsageRights {
  usage_type: ContentUsageType;
  license_type: string;
  usage_restrictions: string[];
  expiry_date: Timestamp | null;
  commercial_use_allowed: boolean;
  modification_allowed: boolean;
}

export type ContentUsageType = 'exclusive' | 'non_exclusive' | 'limited' | 'unlimited';

export interface ContentQualityMetrics {
  quality_score: number;
  technical_quality: number;
  creative_quality: number;
  brand_compliance: number;
  reviewer_notes: string[];
  improvement_suggestions: string[];
}

export interface ContentApprovalInfo {
  approval_status: ContentApprovalStatus;
  approved_by: string | null;
  approved_at: Timestamp | null;
  rejection_reason: string | null;
  revision_requested: boolean;
  revision_notes: string[];
}

export type ContentApprovalStatus = 'pending' | 'approved' | 'rejected' | 'revision_needed';

export interface ContentEngagementStats {
  view_count: number;
  download_count: number;
  usage_count: number;
  social_shares: number;
  client_rating: number | null;
  last_accessed: Timestamp | null;
}

export interface ContentStorageInfo {
  storage_path: string;
  thumbnail_url: string | null;
  preview_url: string | null;
  download_url: string;
  backup_location: string | null;
  compression_applied: boolean;
}

// ======================================
// ⚙️ Settings Types
// ======================================

/**
 * Settings Interface - Based on settings collection
 */
export interface Settings {
  id: string;
  category: SettingsCategory;
  setting_key: string;
  setting_value: any;
  description: string;
  data_type: SettingsDataType;
  is_active: boolean;
  is_public: boolean;
  updated_by: string;
  updated_at: Timestamp;
  created_at: Timestamp;
}

export type SettingsCategory = 'system' | 'ui' | 'pricing' | 'notifications' | 'security' | 'integrations';
export type SettingsDataType = 'string' | 'number' | 'boolean' | 'object' | 'array'; 