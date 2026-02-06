/**
 * VALIDATION SERVICE
 * Comprehensive field validation for resume data
 */

export interface ValidationError {
    field: string;
    message: string;
}

export interface ValidationResult {
    isValid: boolean;
    errors: ValidationError[];
}

// Email regex (RFC 5322 simplified)
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Phone regex (supports international formats)
const PHONE_REGEX = /^[\d\s+()-]{10,20}$/;

// URL regex (supports http/https)
const URL_REGEX = /^https?:\/\/.+\..+/i;

/**
 * Validate email format
 */
export function validateEmail(email: string): ValidationError | null {
    if (!email?.trim()) return null; // Optional field
    
    if (email.length > 100) {
        return { field: 'email', message: 'Email too long (max 100 characters)' };
    }
    
    if (!EMAIL_REGEX.test(email)) {
        return { field: 'email', message: 'Invalid email format' };
    }
    
    return null;
}

/**
 * Validate phone format
 */
export function validatePhone(phone: string): ValidationError | null {
    if (!phone?.trim()) return null; // Optional field
    
    if (phone.length > 20) {
        return { field: 'phone', message: 'Phone too long (max 20 characters)' };
    }
    
    if (!PHONE_REGEX.test(phone)) {
        return { field: 'phone', message: 'Invalid phone format (use digits, spaces, +, -, ())' };
    }
    
    return null;
}

/**
 * Validate URL format - accepts with or without http/https
 */
export function validateURL(url: string, fieldName: string): ValidationError | null {
    if (!url?.trim()) return null; // Optional field
    
    if (url.length > 200) {
        return { field: fieldName, message: `${fieldName} URL too long (max 200 characters)` };
    }
    
    // Accept URLs with or without protocol
    // Valid: linkedin.com/in/name, https://linkedin.com/in/name, github.com/name
    const urlLower = url.toLowerCase().trim();
    
    // Check for LinkedIn
    if (fieldName === 'LinkedIn') {
        if (urlLower.includes('linkedin.com/in/')) return null;
        return { field: fieldName, message: `Invalid LinkedIn URL (use: linkedin.com/in/yourname)` };
    }
    
    // Check for GitHub  
    if (fieldName === 'GitHub') {
        if (urlLower.includes('github.com/')) return null;
        return { field: fieldName, message: `Invalid GitHub URL (use: github.com/yourname)` };
    }
    
    // Generic URL - must have domain pattern
    if (urlLower.includes('.') && urlLower.length > 4) return null;
    
    return { field: fieldName, message: `Invalid ${fieldName} URL format` };
}

/**
 * Validate text length
 */
export function validateLength(
    text: string,
    fieldName: string,
    minLength: number,
    maxLength: number,
    required: boolean = false
): ValidationError | null {
    const trimmed = text?.trim() || '';
    
    if (required && !trimmed) {
        return { field: fieldName, message: `${fieldName} is required` };
    }
    
    if (!trimmed) return null; // Optional and empty
    
    if (trimmed.length < minLength) {
        return { 
            field: fieldName, 
            message: `${fieldName} too short (min ${minLength} characters)` 
        };
    }
    
    if (trimmed.length > maxLength) {
        return { 
            field: fieldName, 
            message: `${fieldName} too long (max ${maxLength} characters)` 
        };
    }
    
    return null;
}

/**
 * Validate bullet points (minimum count)
 */
export function validateBullets(
    bullets: string[],
    fieldName: string,
    minCount: number = 2
): ValidationError | null {
    const validBullets = bullets.filter(b => b?.trim().length > 0);
    
    if (validBullets.length < minCount) {
        return {
            field: fieldName,
            message: `Add at least ${minCount} bullet points`
        };
    }
    
    return null;
}

/**
 * Validate full name
 */
export function validateFullName(name: string): ValidationError | null {
    if (!name?.trim()) {
        return { field: 'fullName', message: 'Full name is required' };
    }
    
    if (name.trim().length < 2) {
        return { field: 'fullName', message: 'Full name too short (min 2 characters)' };
    }
    
    if (name.length > 100) {
        return { field: 'fullName', message: 'Full name too long (max 100 characters)' };
    }
    
    return null;
}

/**
 * Validate professional summary
 */
export function validateSummary(summary: string): ValidationError | null {
    if (!summary?.trim()) {
        return { field: 'summary', message: 'Professional summary is required' };
    }
    
    if (summary.trim().length < 50) {
        return { 
            field: 'summary', 
            message: 'Summary too short (min 50 characters for meaningful content)' 
        };
    }
    
    // Reasonable limit - summaries can be longer for detailed profiles, but keep ATS-friendly
    if (summary.length > 3000) {
        return { field: 'summary', message: 'Summary too long (max 3000 characters - keep it concise for best ATS results)' };
    }
    
    return null;
}

/**
 * Validate entire resume data
 */
export function validateResumeData(data: any): ValidationResult {
    const errors: ValidationError[] = [];
    
    // Required fields
    const nameError = validateFullName(data.basics?.fullName);
    if (nameError) errors.push(nameError);
    
    const emailError = validateEmail(data.basics?.email);
    if (emailError) errors.push(emailError);
    
    const summaryError = validateSummary(data.basics?.professionalSummary || data.summary);
    if (summaryError) errors.push(summaryError);
    
    // Optional fields with format validation
    const phoneError = validatePhone(data.basics?.phone);
    if (phoneError) errors.push(phoneError);
    
    const linkedinError = validateURL(data.basics?.linkedin, 'LinkedIn');
    if (linkedinError) errors.push(linkedinError);
    
    const githubError = validateURL(data.basics?.github, 'GitHub');
    if (githubError) errors.push(githubError);
    
    // Target role - check both fields (targetRole and label)
    const roleError = validateLength(data.basics?.targetRole || data.basics?.label, 'Target role', 2, 100, true);
    if (roleError) errors.push(roleError);
    
    // Content validation - at least one section
    const hasExperience = data.experience?.length > 0;
    const hasProjects = data.projects?.length > 0;
    const hasEducation = data.education?.length > 0;
    const hasSkills = data.skills?.length > 0;
    
    if (!hasExperience && !hasProjects && !hasEducation && !hasSkills) {
        errors.push({
            field: 'content',
            message: 'Add at least one: experience, project, education, or skill section'
        });
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * Validate experience entry
 */
export function validateExperience(exp: any): ValidationError[] {
    const errors: ValidationError[] = [];
    
    const roleError = validateLength(exp.role, 'Role', 2, 100, true);
    if (roleError) errors.push(roleError);
    
    const companyError = validateLength(exp.company, 'Company', 2, 100, true);
    if (companyError) errors.push(companyError);
    
    if (!exp.startDate?.trim()) {
        errors.push({ field: 'startDate', message: 'Start date is required' });
    }
    
    const bulletError = validateBullets(exp.highlights || [], 'Experience bullets', 2);
    if (bulletError) errors.push(bulletError);
    
    return errors;
}

/**
 * Validate project entry
 */
export function validateProject(project: any): ValidationError[] {
    const errors: ValidationError[] = [];
    
    const nameError = validateLength(project.name, 'Project name', 2, 100, true);
    if (nameError) errors.push(nameError);
    
    const descError = validateLength(project.description, 'Project description', 20, 1000, true);
    if (descError) errors.push(descError);
    
    return errors;
}

/**
 * Validate education entry
 */
export function validateEducation(edu: any): ValidationError[] {
    const errors: ValidationError[] = [];
    
    const degreeError = validateLength(edu.degree, 'Degree', 2, 100, true);
    if (degreeError) errors.push(degreeError);
    
    const institutionError = validateLength(edu.institution, 'Institution', 2, 150, true);
    if (institutionError) errors.push(institutionError);
    
    if (!edu.year?.trim()) {
        errors.push({ field: 'year', message: 'Year is required' });
    }
    
    return errors;
}
