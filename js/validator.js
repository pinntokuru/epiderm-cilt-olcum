/**
 * Lab to ITA Converter - Validation Module
 * Turkish Localized Input Validation and Error Handling
 */

class InputValidator {
    constructor() {
        // Turkish validation messages
        this.messages = {
            required: 'Bu alan zorunludur',
            invalidNumber: 'Lütfen geçerli bir sayı girin',
            outOfRange: 'Değer geçerli aralık dışında',
            lStarRange: 'L* değeri 0 ile 100 arasında olmalıdır',
            bStarRange: 'b* değeri -128 ile 127 arasında olmalıdır',
            bStarZero: 'b* değeri sıfır olamaz (sıfıra bölme hatası)',
            tooManyDecimals: 'En fazla 2 ondalık basamak kullanın',
            negativeNotAllowed: 'Negatif değer giremezsiniz',
            positiveNotAllowed: 'Pozitif değer giremezsiniz'
        };

        // Validation rules for each field
        this.rules = {
            lValue: {
                required: true,
                type: 'number',
                min: 0,
                max: 100,
                decimals: 2,
                allowNegative: false
            },
            bValue: {
                required: true,
                type: 'number',
                min: -128,
                max: 127,
                decimals: 2,
                allowNegative: true,
                notZero: true
            }
        };

        // Debounce timer for real-time validation
        this.debounceTimers = {};
        this.debounceDelay = 300; // ms
    }

    /**
     * Validate a single field value
     * @param {string} fieldName - Name of the field to validate
     * @param {*} value - Value to validate
     * @returns {Object} Validation result
     */
    validateField(fieldName, value) {
        const rule = this.rules[fieldName];
        if (!rule) {
            return { isValid: true, errors: [] };
        }

        const errors = [];
        const trimmedValue = typeof value === 'string' ? value.trim() : value;

        // Check if field is required
        if (rule.required && (trimmedValue === '' || trimmedValue === null || trimmedValue === undefined)) {
            errors.push(this.messages.required);
            return { isValid: false, errors, value: trimmedValue };
        }

        // If field is empty and not required, it's valid
        if (!rule.required && (trimmedValue === '' || trimmedValue === null || trimmedValue === undefined)) {
            return { isValid: true, errors: [], value: trimmedValue };
        }

        // Type validation
        if (rule.type === 'number') {
            const numberValidation = this.validateNumber(trimmedValue, rule, fieldName);
            if (!numberValidation.isValid) {
                errors.push(...numberValidation.errors);
            }
        }

        return {
            isValid: errors.length === 0,
            errors: errors,
            value: trimmedValue
        };
    }

    /**
     * Validate number input
     * @param {*} value - Value to validate as number
     * @param {Object} rule - Validation rule
     * @param {string} fieldName - Field name for specific messages
     * @returns {Object} Number validation result
     */
    validateNumber(value, rule, fieldName) {
        const errors = [];

        // Check if it's a valid number
        const numValue = parseFloat(value);
        if (isNaN(numValue)) {
            errors.push(this.messages.invalidNumber);
            return { isValid: false, errors };
        }

        // Check decimal places
        if (rule.decimals !== undefined) {
            const decimalPlaces = this.getDecimalPlaces(value.toString());
            if (decimalPlaces > rule.decimals) {
                errors.push(this.messages.tooManyDecimals);
            }
        }

        // Check if negative values are allowed
        if (!rule.allowNegative && numValue < 0) {
            errors.push(this.messages.negativeNotAllowed);
        }

        // Check range
        if (rule.min !== undefined && numValue < rule.min) {
            errors.push(this.getFieldSpecificRangeMessage(fieldName));
        }

        if (rule.max !== undefined && numValue > rule.max) {
            errors.push(this.getFieldSpecificRangeMessage(fieldName));
        }

        // Check for zero if not allowed
        if (rule.notZero && numValue === 0) {
            errors.push(this.messages.bStarZero);
        }

        return {
            isValid: errors.length === 0,
            errors: errors,
            numericValue: numValue
        };
    }

    /**
     * Get field-specific range error message
     * @param {string} fieldName - Field name
     * @returns {string} Range error message
     */
    getFieldSpecificRangeMessage(fieldName) {
        switch (fieldName) {
            case 'lValue':
                return this.messages.lStarRange;
            case 'bValue':
                return this.messages.bStarRange;
            default:
                return this.messages.outOfRange;
        }
    }

    /**
     * Count decimal places in a number string
     * @param {string} value - Number as string
     * @returns {number} Number of decimal places
     */
    getDecimalPlaces(value) {
        if (value.indexOf('.') === -1) return 0;
        return value.split('.')[1].length;
    }

    /**
     * Validate all form fields
     * @param {Object} formData - Object containing all form field values
     * @returns {Object} Complete validation result
     */
    validateForm(formData) {
        const results = {};
        const allErrors = [];
        let isFormValid = true;

        // Validate each field
        for (const [fieldName, value] of Object.entries(formData)) {
            const fieldResult = this.validateField(fieldName, value);
            results[fieldName] = fieldResult;
            
            if (!fieldResult.isValid) {
                isFormValid = false;
                allErrors.push(...fieldResult.errors);
            }
        }

        return {
            isValid: isFormValid,
            fields: results,
            errors: allErrors,
            hasErrors: allErrors.length > 0
        };
    }

    /**
     * Real-time validation with debouncing
     * @param {string} fieldName - Field name
     * @param {*} value - Field value
     * @param {Function} callback - Callback function to handle validation result
     */
    validateFieldRealTime(fieldName, value, callback) {
        // Clear existing timer
        if (this.debounceTimers[fieldName]) {
            clearTimeout(this.debounceTimers[fieldName]);
        }

        // Set new timer
        this.debounceTimers[fieldName] = setTimeout(() => {
            const result = this.validateField(fieldName, value);
            callback(fieldName, result);
        }, this.debounceDelay);
    }

    /**
     * Sanitize input value
     * @param {string} value - Input value
     * @param {string} fieldName - Field name
     * @returns {string} Sanitized value
     */
    sanitizeInput(value, fieldName) {
        if (typeof value !== 'string') {
            return value;
        }

        let sanitized = value.trim();

        // Remove non-numeric characters except decimal point and minus sign
        if (this.rules[fieldName] && this.rules[fieldName].type === 'number') {
            // Allow digits, decimal point, and minus sign (only at the beginning)
            sanitized = sanitized.replace(/[^0-9.-]/g, '');
            
            // Ensure only one decimal point
            const parts = sanitized.split('.');
            if (parts.length > 2) {
                sanitized = parts[0] + '.' + parts.slice(1).join('');
            }
            
            // Ensure minus sign only at the beginning
            const minusCount = (sanitized.match(/-/g) || []).length;
            if (minusCount > 1) {
                sanitized = sanitized.replace(/-/g, '');
                if (value.startsWith('-')) {
                    sanitized = '-' + sanitized;
                }
            } else if (sanitized.includes('-') && !sanitized.startsWith('-')) {
                sanitized = sanitized.replace('-', '');
            }
        }

        return sanitized;
    }

    /**
     * Format input value for display
     * @param {*} value - Value to format
     * @param {string} fieldName - Field name
     * @returns {string} Formatted value
     */
    formatValue(value, fieldName) {
        if (value === null || value === undefined || value === '') {
            return '';
        }

        const rule = this.rules[fieldName];
        if (rule && rule.type === 'number') {
            const numValue = parseFloat(value);
            if (!isNaN(numValue)) {
                // Format to specified decimal places
                const decimals = rule.decimals || 1;
                return numValue.toFixed(decimals).replace(/\.?0+$/, '');
            }
        }

        return value.toString();
    }

    /**
     * Get validation state CSS class
     * @param {Object} validationResult - Validation result
     * @returns {string} CSS class name
     */
    getValidationClass(validationResult) {
        if (!validationResult) return '';
        
        if (validationResult.isValid) {
            return 'valid';
        } else {
            return 'invalid';
        }
    }

    /**
     * Check if value is in valid range for field
     * @param {string} fieldName - Field name
     * @param {number} value - Numeric value
     * @returns {boolean} True if in range
     */
    isInRange(fieldName, value) {
        const rule = this.rules[fieldName];
        if (!rule) return true;

        const numValue = parseFloat(value);
        if (isNaN(numValue)) return false;

        if (rule.min !== undefined && numValue < rule.min) return false;
        if (rule.max !== undefined && numValue > rule.max) return false;
        if (rule.notZero && numValue === 0) return false;

        return true;
    }

    /**
     * Get field constraints for UI hints
     * @param {string} fieldName - Field name
     * @returns {Object} Field constraints
     */
    getFieldConstraints(fieldName) {
        const rule = this.rules[fieldName];
        if (!rule) return {};

        return {
            required: rule.required || false,
            min: rule.min,
            max: rule.max,
            decimals: rule.decimals,
            allowNegative: rule.allowNegative || false,
            notZero: rule.notZero || false,
            type: rule.type
        };
    }

    /**
     * Generate help text for field
     * @param {string} fieldName - Field name
     * @returns {string} Help text in Turkish
     */
    getFieldHelpText(fieldName) {
        const rule = this.rules[fieldName];
        if (!rule) return '';

        switch (fieldName) {
            case 'lValue':
                return 'Aralık: 0-100';
            case 'bValue':
                return 'Aralık: -128 ile +127 (sıfır olamaz)';
            default:
                return '';
        }
    }

    /**
     * Clear all debounce timers
     */
    clearAllTimers() {
        Object.values(this.debounceTimers).forEach(timer => {
            if (timer) clearTimeout(timer);
        });
        this.debounceTimers = {};
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = InputValidator;
} else if (typeof window !== 'undefined') {
    window.InputValidator = InputValidator;
}