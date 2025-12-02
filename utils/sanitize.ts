/**
 * Input sanitization and formatting utilities
 * Ensures data integrity before saving to backend
 */

/**
 * Sanitize string input by trimming whitespace
 */
export const sanitizeInput = (value: string): string => {
    if (typeof value !== 'string') return '';
    return value.trim();
};

/**
 * Sanitize all string fields in an object
 */
export const sanitizeFormData = <T extends Record<string, any>>(data: T): T => {
    const sanitized = { ...data } as any;

    Object.keys(sanitized).forEach(key => {
        if (typeof sanitized[key] === 'string') {
            sanitized[key] = sanitized[key].trim();
        }
    });

    return sanitized as T;
};

/**
 * Format date to ISO standard (YYYY-MM-DD)
 * Handles various input formats
 */
export const formatDateToISO = (dateInput: string | Date): string => {
    try {
        const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;

        if (isNaN(date.getTime())) {
            console.error('Invalid date:', dateInput);
            return new Date().toISOString().split('T')[0];
        }

        return date.toISOString().split('T')[0];
    } catch (error) {
        console.error('Error formatting date:', error);
        return new Date().toISOString().split('T')[0];
    }
};

/**
 * Format DD-MM-YYYY to YYYY-MM-DD
 */
export const convertDDMMYYYYtoISO = (dateString: string): string => {
    const parts = dateString.split(/[-\/]/);

    if (parts.length !== 3) {
        console.error('Invalid date format:', dateString);
        return dateString;
    }

    // Assume DD-MM-YYYY or DD/MM/YYYY
    const [day, month, year] = parts;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
};

/**
 * Sanitize phone number (remove non-numeric characters)
 */
export const sanitizePhoneNumber = (phone: string): string => {
    const cleaned = phone.replace(/\D/g, '');

    // Ensure it starts with 08
    if (!cleaned.startsWith('08')) {
        return '08' + cleaned;
    }

    return cleaned;
};

/**
 * Sanitize NIK (remove non-numeric characters, limit to 16 digits)
 */
export const sanitizeNIK = (nik: string): string => {
    const cleaned = nik.replace(/\D/g, '');
    return cleaned.slice(0, 16);
};

/**
 * Sanitize currency input (remove non-numeric except decimal)
 */
export const sanitizeCurrencyInput = (value: string): number => {
    const cleaned = value.replace(/[^0-9.]/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
};

/**
 * Validate and sanitize email
 */
export const sanitizeEmail = (email: string): string => {
    return email.trim().toLowerCase();
};

/**
 * Remove multiple consecutive spaces
 */
export const sanitizeWhitespace = (text: string): string => {
    return text.replace(/\s+/g, ' ').trim();
};

/**
 * Comprehensive form sanitization
 * Combines all sanitization methods
 */
export const sanitizeCompleteFormData = <T extends Record<string, any>>(
    data: T,
    fieldTypes?: Partial<Record<keyof T, 'phone' | 'nik' | 'email' | 'currency' | 'date' | 'text'>>
): T => {
    const sanitized = { ...data } as any;

    Object.keys(sanitized).forEach(key => {
        const value = sanitized[key];
        const fieldType = fieldTypes?.[key];

        if (typeof value === 'string') {
            switch (fieldType) {
                case 'phone':
                    sanitized[key] = sanitizePhoneNumber(value);
                    break;
                case 'nik':
                    sanitized[key] = sanitizeNIK(value);
                    break;
                case 'email':
                    sanitized[key] = sanitizeEmail(value);
                    break;
                case 'date':
                    sanitized[key] = formatDateToISO(value);
                    break;
                case 'text':
                    sanitized[key] = sanitizeWhitespace(value);
                    break;
                default:
                    sanitized[key] = sanitizeInput(value);
            }
        } else if (fieldType === 'currency') {
            sanitized[key] = sanitizeCurrencyInput(String(value));
        }
    });

    return sanitized as T;
};
