export type UserRole = 'super_admin' | 'marketing_coordinator' | 'brand_coordinator' | 'photographer' | 'new_user';
export type UserStatus = 'pending_role_setup' | 'pending_approval' | 'active' | 'suspended' | 'archived';
export type AuthProvider = 'email' | 'phone' | 'google';
export type BrandStatus = 'active' | 'paused' | 'archived' | 'development';
export type BrandType = 'local' | 'international' | 'startup' | 'enterprise';
export type Industry = 'fashion' | 'food' | 'technology' | 'healthcare' | 'education' | 'automotive' | 'real_estate' | 'travel' | 'beauty' | 'other';
export type CampaignStatus = 'draft' | 'scheduled' | 'active' | 'paused' | 'completed' | 'cancelled';
export type CampaignType = 'product_launch' | 'seasonal' | 'promotional' | 'brand_awareness' | 'event';
export type PriorityLevel = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'pending' | 'assigned' | 'in_progress' | 'review' | 'completed' | 'cancelled';
export type LocationType = 'studio' | 'client_location' | 'outdoor' | 'home' | 'travel';
export type PaymentStatus = 'draft' | 'pending_approval' | 'approved' | 'processing' | 'paid' | 'failed' | 'cancelled';
export type PaymentMethod = 'cash' | 'zain_cash' | 'rafidain_bank';
export type ContractType = 'freelancer' | 'salary';
export type ContentType = 'image' | 'video' | 'graphic_design';
export type ContentApprovalStatus = 'pending' | 'approved' | 'rejected' | 'revision_needed';
export type EquipmentType = 'camera' | 'lens' | 'lighting' | 'tripod' | 'backdrop' | 'audio' | 'accessories';
export type EquipmentCondition = 'excellent' | 'good' | 'fair' | 'needs_repair';
export type NotificationType = 'task_assigned' | 'task_reminder' | 'task_completed' | 'task_cancelled' | 'campaign_started' | 'campaign_completed' | 'campaign_delayed' | 'payment_ready' | 'payment_processed' | 'content_approved' | 'content_rejected';
export type DeliveryMethod = 'email' | 'sms' | 'push_notification' | 'in_app' | 'whatsapp';
export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';
export type DayOfWeek = 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday';
export type ContactMethod = 'email' | 'phone' | 'whatsapp' | 'telegram';
export type VerificationStatus = 'pending' | 'verified' | 'suspended' | 'rejected';
//# sourceMappingURL=enums.d.ts.map