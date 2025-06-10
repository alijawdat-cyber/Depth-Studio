"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseValidator = exports.BaseRepository = void 0;
class BaseRepository {
}
exports.BaseRepository = BaseRepository;
class BaseValidator {
    constructor(options = {}) {
        this.options = {
            validateOnChange: true,
            validateOnBlur: true,
            abortEarly: false,
            showWarnings: true,
            language: 'ar',
            ...options
        };
    }
    validateOnChange(fieldName, value) {
        if (!this.options.validateOnChange) {
            return { isValid: true, errors: [], warnings: [] };
        }
        return this.validateField(fieldName, value);
    }
    validateOnBlur(fieldName, value) {
        if (!this.options.validateOnBlur) {
            return { isValid: true, errors: [], warnings: [] };
        }
        return this.validateField(fieldName, value);
    }
    getErrorMessage(errorCode, fieldName, params) {
        const messages = {
            required: `حقل ${fieldName} مطلوب`,
            invalid_type: `نوع البيانات في حقل ${fieldName} غير صحيح`,
            string_empty: `حقل ${fieldName} لا يمكن أن يكون فارغاً`,
            string_min: `حقل ${fieldName} يجب أن يحتوي على ${params === null || params === void 0 ? void 0 : params['min']} أحرف على الأقل`,
            string_max: `حقل ${fieldName} يجب أن يحتوي على ${params === null || params === void 0 ? void 0 : params['max']} أحرف كحد أقصى`,
            email_invalid: `البريد الإلكتروني في حقل ${fieldName} غير صحيح`,
            phone_invalid: `رقم الهاتف في حقل ${fieldName} غير صحيح`,
            number_min: `القيمة في حقل ${fieldName} يجب أن تكون ${params === null || params === void 0 ? void 0 : params['min']} على الأقل`,
            number_max: `القيمة في حقل ${fieldName} يجب أن تكون ${params === null || params === void 0 ? void 0 : params['max']} كحد أقصى`,
            date_invalid: `التاريخ في حقل ${fieldName} غير صحيح`,
            array_empty: `حقل ${fieldName} يجب أن يحتوي على عنصر واحد على الأقل`,
        };
        return messages[errorCode] || `خطأ في حقل ${fieldName}`;
    }
    formatResult(errors, warnings = []) {
        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    }
}
exports.BaseValidator = BaseValidator;
//# sourceMappingURL=base.js.map