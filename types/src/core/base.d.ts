import { Timestamp } from 'firebase/firestore';
export type ID = string;
export type FirebaseTimestamp = Timestamp;
export interface MultiLanguageText {
    ar: string;
    en: string;
}
export interface BaseEntity {
    id: ID;
    created_at: FirebaseTimestamp;
    updated_at: FirebaseTimestamp;
    created_by?: ID;
    updated_by?: ID;
}
export interface ActivatableEntity extends BaseEntity {
    is_active: boolean;
}
export interface ContactInfo {
    email?: string;
    phone?: string;
    whatsapp?: string;
    address?: string;
}
export interface CurrencyAmount {
    amount: number;
    currency: string;
}
export interface DateRange {
    start_date: FirebaseTimestamp;
    end_date: FirebaseTimestamp;
}
export interface TimeRange {
    start_time: string;
    end_time: string;
}
export interface FrontendQueryOptions {
    limit?: number;
    offset?: number;
    orderBy?: {
        field: string;
        direction: "asc" | "desc";
    }[];
    where?: {
        field: string;
        operator: string;
        value: unknown;
    }[];
    useCache?: boolean;
    cacheExpiry?: number;
}
export interface FrontendPaginatedResult<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    hasNext: boolean;
    hasPrev: boolean;
    cached?: boolean;
    cacheTimestamp?: Date;
}
export interface ApiOperationState {
    loading: boolean;
    error: string | null;
    success: boolean;
    lastUpdated?: Date;
}
export declare abstract class BaseRepository<T extends BaseEntity> {
    protected abstract collectionName: string;
    abstract create(entity: Omit<T, 'id' | 'created_at' | 'updated_at'>): Promise<T>;
    abstract findById(id: ID): Promise<T | null>;
    abstract update(id: ID, updates: Partial<Omit<T, 'id' | 'created_at'>>): Promise<T>;
    abstract delete(id: ID): Promise<void>;
    abstract findAll(options?: FrontendQueryOptions): Promise<T[]>;
    abstract findPaginated(page: number, limit: number, options?: Omit<FrontendQueryOptions, 'limit' | 'offset'>): Promise<FrontendPaginatedResult<T>>;
    abstract count(options?: Omit<FrontendQueryOptions, 'limit' | 'offset'>): Promise<number>;
    abstract search(query: string, options?: FrontendQueryOptions): Promise<T[]>;
    abstract clearCache(): Promise<void>;
    abstract refreshCache(): Promise<void>;
    abstract getOperationState(): ApiOperationState;
}
export interface ValidationResult {
    isValid: boolean;
    errors: ValidationError[];
    warnings: ValidationWarning[];
}
export interface ValidationError {
    field: string;
    message: string;
    code: string;
    value?: unknown;
}
export interface ValidationWarning {
    field: string;
    message: string;
    suggestion?: string;
}
export interface FrontendValidationOptions {
    validateOnChange?: boolean;
    validateOnBlur?: boolean;
    abortEarly?: boolean;
    showWarnings?: boolean;
    language?: 'ar' | 'en';
}
export declare abstract class BaseValidator<T> {
    protected abstract validationRules: Record<string, unknown>;
    protected options: FrontendValidationOptions;
    constructor(options?: FrontendValidationOptions);
    abstract validate(data: T): ValidationResult;
    abstract validateField(fieldName: keyof T, value: unknown): ValidationResult;
    validateOnChange(fieldName: keyof T, value: unknown): ValidationResult;
    validateOnBlur(fieldName: keyof T, value: unknown): ValidationResult;
    protected getErrorMessage(errorCode: string, fieldName: string, params?: Record<string, unknown>): string;
    protected formatResult(errors: ValidationError[], warnings?: ValidationWarning[]): ValidationResult;
}
//# sourceMappingURL=base.d.ts.map