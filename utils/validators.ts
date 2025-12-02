/**
 * Validation utilities for form inputs
 */

export interface ValidationResult {
    valid: boolean;
    message?: string;
}

/**
 * Validate NIK (Nomor Induk Kependudukan)
 * Must be exactly 16 digits
 */
export const validateNIK = (nik: string): ValidationResult => {
    if (!nik) return { valid: false, message: 'NIK tidak boleh kosong' };
    if (nik.length !== 16) return { valid: false, message: 'NIK harus 16 digit' };
    if (!/^\d{16}$/.test(nik)) return { valid: false, message: 'NIK hanya boleh berisi angka' };
    return { valid: true };
};

/**
 * Validate Indonesian phone number
 * Must start with 08 and be 10-13 digits
 */
export const validatePhone = (phone: string): ValidationResult => {
    if (!phone) return { valid: false, message: 'No HP tidak boleh kosong' };
    if (!phone.startsWith('08')) return { valid: false, message: 'No HP harus diawali 08' };
    if (phone.length < 10) return { valid: false, message: 'No HP minimal 10 digit' };
    if (phone.length > 13) return { valid: false, message: 'No HP maksimal 13 digit' };
    if (!/^\d+$/.test(phone)) return { valid: false, message: 'No HP hanya boleh berisi angka' };
    return { valid: true };
};

/**
 * Validate email format
 */
export const validateEmail = (email: string): ValidationResult => {
    if (!email) return { valid: false, message: 'Email tidak boleh kosong' };
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return { valid: false, message: 'Format email tidak valid' };
    return { valid: true };
};

/**
 * Validate required field
 */
export const validateRequired = (value: string, fieldName: string = 'Field'): ValidationResult => {
    if (!value || value.trim() === '') {
        return { valid: false, message: `${fieldName} tidak boleh kosong` };
    }
    return { valid: true };
};

/**
 * Validate number is positive
 */
export const validatePositiveNumber = (value: number | string, fieldName: string = 'Nilai'): ValidationResult => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return { valid: false, message: `${fieldName} harus berupa angka` };
    if (num < 0) return { valid: false, message: `${fieldName} harus positif` };
    return { valid: true };
};

/**
 * Validate number range
 */
export const validateNumberRange = (
    value: number | string,
    min: number,
    max: number,
    fieldName: string = 'Nilai'
): ValidationResult => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return { valid: false, message: `${fieldName} harus berupa angka` };
    if (num < min) return { valid: false, message: `${fieldName} minimal ${min}` };
    if (num > max) return { valid: false, message: `${fieldName} maksimal ${max}` };
    return { valid: true };
};
