import { ID, FirebaseTimestamp } from './core/base';
import { ContentType } from './core/enums';
export interface FileUploadInfo {
    original_name: string;
    file_buffer?: Buffer;
    file?: File;
    mime_type: string;
    file_size: number;
    content_type: ContentType;
    photographer_id: ID;
    brand_id: ID;
    campaign_id?: ID;
}
export interface FileUploadResult {
    file_url: string;
    filename: string;
    file_size: number;
    file_format: string;
    thumbnail_url?: string;
    width?: number;
    height?: number;
    duration?: number;
    metadata: FileMetadata;
}
export interface FileMetadata {
    upload_timestamp: FirebaseTimestamp;
    original_filename: string;
    file_hash: string;
    storage_path: string;
    processing_status: FileProcessingStatus;
    quality_check: FileQualityCheck;
}
export type FileProcessingStatus = 'pending' | 'processing' | 'completed' | 'failed';
export interface FileQualityCheck {
    passed: boolean;
    issues: string[];
    score: number;
}
export interface ImageProcessingOptions {
    generate_thumbnail: boolean;
    thumbnail_size: {
        width: number;
        height: number;
    };
    optimize_quality: boolean;
    target_quality: number;
    max_width: number;
    max_height: number;
    watermark: WatermarkOptions;
}
export interface WatermarkOptions {
    enabled: boolean;
    text: string;
    position: WatermarkPosition;
    opacity: number;
}
export type WatermarkPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
export interface VideoProcessingOptions {
    generate_thumbnail: boolean;
    thumbnail_timestamps: number[];
    compress: boolean;
    target_resolution: VideoResolution;
    max_duration: number;
}
export type VideoResolution = '480p' | '720p' | '1080p' | '4K';
export interface StorageOptions {
    bucket_name?: string;
    folder_structure: FolderStructure;
    enable_cdn: boolean;
    backup_enabled: boolean;
    retention_days?: number;
}
export type FolderStructure = 'by_date' | 'by_brand' | 'by_campaign' | 'by_type';
export interface FileSecurityCheck {
    is_safe: boolean;
    threats_detected: SecurityThreat[];
    scan_timestamp: FirebaseTimestamp;
    scanner_version: string;
}
export interface SecurityThreat {
    type: ThreatType;
    severity: ThreatSeverity;
    description: string;
}
export type ThreatType = 'virus' | 'malware' | 'suspicious' | 'forbidden';
export type ThreatSeverity = 'low' | 'medium' | 'high' | 'critical';
export interface FileUploadStats {
    total_uploads: number;
    successful_uploads: number;
    failed_uploads: number;
    total_size_uploaded: number;
    average_upload_time: number;
    most_uploaded_type: ContentType;
    upload_history: FileUploadRecord[];
}
export interface FileUploadRecord {
    id: ID;
    filename: string;
    file_size: number;
    content_type: ContentType;
    upload_timestamp: FirebaseTimestamp;
    upload_duration: number;
    photographer_id: ID;
    brand_id: ID;
    success: boolean;
    error_message?: string;
}
export interface UserUploadPreferences {
    auto_optimize_images: boolean;
    generate_thumbnails: boolean;
    preferred_image_quality: number;
    max_file_size: number;
    allowed_file_types: string[];
    enable_watermark: boolean;
    watermark_text: string;
    auto_backup: boolean;
}
export interface SystemUploadLimits {
    max_file_size_mb: number;
    max_files_per_hour: number;
    max_total_size_per_day_gb: number;
    allowed_mime_types: string[];
    prohibited_extensions: string[];
    scan_timeout_seconds: number;
}
export interface FileSyncStatus {
    file_id: ID;
    local_path?: string;
    remote_url: string;
    last_sync: FirebaseTimestamp;
    sync_status: SyncStatus;
    conflict_detected: boolean;
    conflict_resolution?: ConflictResolution;
}
export type SyncStatus = 'synced' | 'pending' | 'syncing' | 'conflict' | 'error';
export type ConflictResolution = 'keep_local' | 'keep_remote' | 'merge' | 'manual';
//# sourceMappingURL=files.d.ts.map