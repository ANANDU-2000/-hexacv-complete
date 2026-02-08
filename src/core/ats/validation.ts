
/**
 * Validation Logic Core
 * Field-level and object-level validation for resume data
 */

export interface ValidationError {
    field: string;
    message: string;
}

export interface ValidationResult {
    isValid: boolean;
    errors: ValidationError[];
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[\d\s+()-]{10,20}$/;

export function validateEmail(email: string): ValidationError | null {
    if (!email?.trim()) return null;
    if (!EMAIL_REGEX.test(email)) return { field: 'email', message: 'Invalid email format' };
    return null;
}

export function validatePhone(phone: string): ValidationError | null {
    if (!phone?.trim()) return null;
    if (!PHONE_REGEX.test(phone)) return { field: 'phone', message: 'Invalid phone format' };
    return null;
}

export function validateFullName(name: string): ValidationError | null {
    if (!name?.trim()) return { field: 'fullName', message: 'Full name is required' };
    if (name.trim().length < 2) return { field: 'fullName', message: 'Name too short' };
    return null;
}

export function validateResumeData(data: any): ValidationResult {
    const errors: ValidationError[] = [];

    const nameError = validateFullName(data.basics?.fullName);
    if (nameError) errors.push(nameError);

    const emailError = validateEmail(data.basics?.email);
    if (emailError) errors.push(emailError);

    const role = data.basics?.targetRole || data.basics?.label;
    if (!role?.trim()) {
        errors.push({ field: 'targetRole', message: 'Target role is required' });
    }

    const hasContent = (data.experience?.length > 0) || (data.projects?.length > 0) || (data.education?.length > 0);
    if (!hasContent) {
        errors.push({ field: 'content', message: 'Add at least one section (Experience/Project/Edu)' });
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}
