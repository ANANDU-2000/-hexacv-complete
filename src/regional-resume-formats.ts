/**
 * REGIONAL RESUME FORMAT INTELLIGENCE
 * Multi-country support for resume formatting, conventions, and requirements
 * Covers 50+ countries with regional variations
 */

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export type RegionCode =
    // North America
    | 'US' | 'CA'
    // Europe
    | 'UK' | 'DE' | 'FR' | 'ES' | 'IT' | 'NL' | 'BE' | 'CH' | 'AT' | 'SE' | 'NO' | 'DK' | 'FI' | 'PL' | 'IE' | 'PT'
    // Middle East
    | 'AE' | 'SA' | 'QA' | 'KW' | 'BH' | 'OM' | 'EG' | 'JO' | 'LB'
    // Asia Pacific
    | 'IN' | 'SG' | 'AU' | 'NZ' | 'MY' | 'PH' | 'ID' | 'TH' | 'VN' | 'JP' | 'KR' | 'CN' | 'HK' | 'TW'
    // Latin America
    | 'MX' | 'BR' | 'AR' | 'CL' | 'CO' | 'PE'
    // Africa
    | 'ZA' | 'NG' | 'KE' | 'GH'
    // Global fallback
    | 'GLOBAL';

export type DateFormat = 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY/MM/DD' | 'DD.MM.YYYY' | 'YYYY-MM-DD' | 'DD-MM-YYYY';
export type DocumentType = 'resume' | 'cv' | 'biodata';
export type PhotoRequirement = 'required' | 'expected' | 'optional' | 'discouraged' | 'illegal';

export interface RegionalFormat {
    code: RegionCode;
    name: string;
    language: string;

    // Document conventions
    documentType: DocumentType;
    typicalLength: { pages: number; description: string };
    dateFormat: DateFormat;

    // Photo policy
    photo: {
        requirement: PhotoRequirement;
        reason: string;
        placement?: 'top-right' | 'top-left' | 'header-center';
        size?: string;
    };

    // Personal information requirements
    personalInfo: {
        fullName: { required: boolean; format?: string };
        dateOfBirth: { required: boolean; reason?: string };
        nationality: { required: boolean; reason?: string };
        maritalStatus: { required: boolean; reason?: string };
        gender: { required: boolean; reason?: string };
        address: { required: boolean; fullOrCity: 'full' | 'city_only' | 'optional' };
        religion: { required: boolean; reason?: string };
    };

    // Section ordering (priority order)
    sectionOrder: string[];

    // Formatting preferences
    formatting: {
        fontSize: string;
        margins: string;
        lineSpacing: string;
        preferredFonts: string[];
        colorAcceptance: 'discouraged' | 'minimal' | 'acceptable' | 'encouraged';
    };

    // Cultural considerations
    culture: {
        formalityLevel: 'very_formal' | 'formal' | 'semi_formal' | 'casual';
        humilityExpected: boolean;
        achievementStyle: 'quantified' | 'descriptive' | 'modest';
        honorificsImportant: boolean;
    };

    // ATS considerations
    ats: {
        prevalence: 'very_high' | 'high' | 'medium' | 'low';
        tips: string[];
    };

    // Legal/compliance notes
    legalNotes: string[];
}

export interface FormattedDate {
    display: string;
    format: DateFormat;
}

// ═══════════════════════════════════════════════════════════════
// REGIONAL FORMAT DATABASE
// ═══════════════════════════════════════════════════════════════

export const REGIONAL_FORMATS: Record<RegionCode, RegionalFormat> = {
    // ─────────────────────────────────────────────────────────────
    // NORTH AMERICA
    // ─────────────────────────────────────────────────────────────
    US: {
        code: 'US',
        name: 'United States',
        language: 'English',
        documentType: 'resume',
        typicalLength: { pages: 1, description: '1 page for most roles, 2 pages for senior/executive' },
        dateFormat: 'MM/DD/YYYY',
        photo: {
            requirement: 'discouraged',
            reason: 'Anti-discrimination laws make photos risky. Most employers prefer no photo to avoid bias claims.'
        },
        personalInfo: {
            fullName: { required: true },
            dateOfBirth: { required: false, reason: 'Age discrimination laws - never include' },
            nationality: { required: false, reason: 'Only include if work authorization is relevant' },
            maritalStatus: { required: false, reason: 'Illegal to ask - never include' },
            gender: { required: false, reason: 'Discrimination risk - never include' },
            address: { required: false, fullOrCity: 'city_only' },
            religion: { required: false, reason: 'Never include' }
        },
        sectionOrder: ['summary', 'experience', 'skills', 'education', 'certifications', 'projects'],
        formatting: {
            fontSize: '10-12pt',
            margins: '0.5-1 inch',
            lineSpacing: '1.0-1.15',
            preferredFonts: ['Arial', 'Calibri', 'Garamond', 'Times New Roman'],
            colorAcceptance: 'minimal'
        },
        culture: {
            formalityLevel: 'semi_formal',
            humilityExpected: false,
            achievementStyle: 'quantified',
            honorificsImportant: false
        },
        ats: {
            prevalence: 'very_high',
            tips: [
                'Use standard section headings (Experience, Education, Skills)',
                'Avoid tables, columns, headers/footers',
                'Use .docx or .pdf format',
                'Include keywords from job description',
                'Spell out acronyms at least once'
            ]
        },
        legalNotes: [
            'Do not include: age, DOB, photo, marital status, religion, ethnicity',
            'Only mention visa status if specifically relevant',
            'Equal Employment Opportunity laws apply'
        ]
    },

    CA: {
        code: 'CA',
        name: 'Canada',
        language: 'English/French',
        documentType: 'resume',
        typicalLength: { pages: 2, description: '2 pages acceptable, 1 page for entry-level' },
        dateFormat: 'DD/MM/YYYY',
        photo: {
            requirement: 'discouraged',
            reason: 'Human rights legislation discourages photos to prevent discrimination'
        },
        personalInfo: {
            fullName: { required: true },
            dateOfBirth: { required: false, reason: 'Age discrimination - exclude' },
            nationality: { required: false, reason: 'Include only for work permit context' },
            maritalStatus: { required: false, reason: 'Protected ground - never include' },
            gender: { required: false, reason: 'Protected ground - never include' },
            address: { required: false, fullOrCity: 'city_only' },
            religion: { required: false, reason: 'Never include' }
        },
        sectionOrder: ['summary', 'experience', 'education', 'skills', 'certifications', 'volunteer'],
        formatting: {
            fontSize: '10-12pt',
            margins: '0.5-1 inch',
            lineSpacing: '1.0-1.15',
            preferredFonts: ['Arial', 'Calibri', 'Cambria'],
            colorAcceptance: 'minimal'
        },
        culture: {
            formalityLevel: 'semi_formal',
            humilityExpected: false,
            achievementStyle: 'quantified',
            honorificsImportant: false
        },
        ats: {
            prevalence: 'very_high',
            tips: [
                'Similar to US standards',
                'French resumes for Quebec positions may differ',
                'Include volunteer experience - valued in Canadian culture'
            ]
        },
        legalNotes: [
            'Canadian Human Rights Act protects against discrimination',
            'No photo, age, marital status, religion required'
        ]
    },

    // ─────────────────────────────────────────────────────────────
    // UNITED KINGDOM & IRELAND
    // ─────────────────────────────────────────────────────────────
    UK: {
        code: 'UK',
        name: 'United Kingdom',
        language: 'English',
        documentType: 'cv',
        typicalLength: { pages: 2, description: '2 pages is standard, never exceed' },
        dateFormat: 'DD/MM/YYYY',
        photo: {
            requirement: 'discouraged',
            reason: 'Equality Act 2010 - photos can lead to discrimination claims'
        },
        personalInfo: {
            fullName: { required: true },
            dateOfBirth: { required: false, reason: 'Age discrimination - exclude' },
            nationality: { required: false, reason: 'Only if right to work is relevant' },
            maritalStatus: { required: false, reason: 'Not relevant - exclude' },
            gender: { required: false, reason: 'Not relevant - exclude' },
            address: { required: false, fullOrCity: 'city_only' },
            religion: { required: false, reason: 'Never include' }
        },
        sectionOrder: ['personal_statement', 'experience', 'education', 'skills', 'interests'],
        formatting: {
            fontSize: '10-12pt',
            margins: '2-2.5cm',
            lineSpacing: '1.15-1.5',
            preferredFonts: ['Arial', 'Calibri', 'Verdana'],
            colorAcceptance: 'minimal'
        },
        culture: {
            formalityLevel: 'formal',
            humilityExpected: true,
            achievementStyle: 'quantified',
            honorificsImportant: false
        },
        ats: {
            prevalence: 'high',
            tips: [
                'Use "CV" not "Resume"',
                'Include a personal statement (professional summary)',
                'Hobbies/Interests section is common and expected',
                'Use British English spelling'
            ]
        },
        legalNotes: [
            'Equality Act 2010 protects against discrimination',
            'Right to work in UK may need to be proven during hiring'
        ]
    },

    IE: {
        code: 'IE',
        name: 'Ireland',
        language: 'English',
        documentType: 'cv',
        typicalLength: { pages: 2, description: '2 pages maximum' },
        dateFormat: 'DD/MM/YYYY',
        photo: {
            requirement: 'discouraged',
            reason: 'Employment Equality Acts discourage photos'
        },
        personalInfo: {
            fullName: { required: true },
            dateOfBirth: { required: false },
            nationality: { required: false },
            maritalStatus: { required: false },
            gender: { required: false },
            address: { required: false, fullOrCity: 'city_only' },
            religion: { required: false }
        },
        sectionOrder: ['personal_statement', 'experience', 'education', 'skills', 'references'],
        formatting: {
            fontSize: '10-12pt',
            margins: '2-2.5cm',
            lineSpacing: '1.15',
            preferredFonts: ['Arial', 'Calibri', 'Georgia'],
            colorAcceptance: 'minimal'
        },
        culture: {
            formalityLevel: 'semi_formal',
            humilityExpected: true,
            achievementStyle: 'quantified',
            honorificsImportant: false
        },
        ats: {
            prevalence: 'high',
            tips: [
                'Similar to UK conventions',
                'References section common (or "Available upon request")',
                'Personal statement highly valued'
            ]
        },
        legalNotes: ['Employment Equality Acts 1998-2015 apply']
    },

    // ─────────────────────────────────────────────────────────────
    // WESTERN EUROPE
    // ─────────────────────────────────────────────────────────────
    DE: {
        code: 'DE',
        name: 'Germany',
        language: 'German',
        documentType: 'cv',
        typicalLength: { pages: 2, description: '2-3 pages for experienced professionals' },
        dateFormat: 'DD.MM.YYYY',
        photo: {
            requirement: 'expected',
            reason: 'Professional photo is standard practice, though legally optional since 2006',
            placement: 'top-right',
            size: 'Passport-style, 3.5x4.5cm'
        },
        personalInfo: {
            fullName: { required: true },
            dateOfBirth: { required: true, reason: 'Commonly included' },
            nationality: { required: true, reason: 'Standard to include' },
            maritalStatus: { required: false, reason: 'Optional but sometimes included' },
            gender: { required: false },
            address: { required: true, fullOrCity: 'full' },
            religion: { required: false }
        },
        sectionOrder: ['personal_data', 'photo', 'experience', 'education', 'skills', 'languages', 'certifications'],
        formatting: {
            fontSize: '11-12pt',
            margins: '2.5cm',
            lineSpacing: '1.15',
            preferredFonts: ['Arial', 'Times New Roman', 'Verdana'],
            colorAcceptance: 'discouraged'
        },
        culture: {
            formalityLevel: 'very_formal',
            humilityExpected: false,
            achievementStyle: 'descriptive',
            honorificsImportant: true
        },
        ats: {
            prevalence: 'medium',
            tips: [
                'Chronological format preferred (reverse)',
                'Include all education details with exact dates',
                'Gaps in employment must be explained',
                'Hand-signed CV was traditional (less common now)'
            ]
        },
        legalNotes: [
            'AGG (Allgemeines Gleichbehandlungsgesetz) prohibits discrimination',
            'Photo legally optional since 2006 but culturally expected'
        ]
    },

    FR: {
        code: 'FR',
        name: 'France',
        language: 'French',
        documentType: 'cv',
        typicalLength: { pages: 1, description: '1 page strongly preferred, 2 max for senior' },
        dateFormat: 'DD/MM/YYYY',
        photo: {
            requirement: 'expected',
            reason: 'Standard practice though legally not required',
            placement: 'top-left',
            size: 'Passport-style'
        },
        personalInfo: {
            fullName: { required: true },
            dateOfBirth: { required: true, reason: 'Commonly included' },
            nationality: { required: true },
            maritalStatus: { required: false, reason: 'Optional, sometimes included' },
            gender: { required: false },
            address: { required: true, fullOrCity: 'full' },
            religion: { required: false }
        },
        sectionOrder: ['personal_info', 'experience', 'education', 'skills', 'languages', 'interests'],
        formatting: {
            fontSize: '10-11pt',
            margins: '1.5-2cm',
            lineSpacing: '1.0',
            preferredFonts: ['Arial', 'Garamond', 'Calibri'],
            colorAcceptance: 'minimal'
        },
        culture: {
            formalityLevel: 'formal',
            humilityExpected: false,
            achievementStyle: 'descriptive',
            honorificsImportant: true
        },
        ats: {
            prevalence: 'medium',
            tips: [
                'Keep it to 1 page if possible',
                'Diplomas and "grandes écoles" carry significant weight',
                'Language skills section very important',
                'Interests/hobbies section expected'
            ]
        },
        legalNotes: [
            'Discrimination laws exist but photo still common',
            'Loi du 27 mai 2008 addresses discrimination'
        ]
    },

    NL: {
        code: 'NL',
        name: 'Netherlands',
        language: 'Dutch/English',
        documentType: 'cv',
        typicalLength: { pages: 2, description: '1-2 pages' },
        dateFormat: 'DD-MM-YYYY',
        photo: {
            requirement: 'optional',
            reason: 'Not expected but acceptable, becoming less common'
        },
        personalInfo: {
            fullName: { required: true },
            dateOfBirth: { required: true, reason: 'Commonly included' },
            nationality: { required: false },
            maritalStatus: { required: false },
            gender: { required: false },
            address: { required: true, fullOrCity: 'city_only' },
            religion: { required: false }
        },
        sectionOrder: ['personal_info', 'summary', 'experience', 'education', 'skills', 'languages'],
        formatting: {
            fontSize: '10-12pt',
            margins: '2cm',
            lineSpacing: '1.15',
            preferredFonts: ['Arial', 'Calibri', 'Verdana'],
            colorAcceptance: 'acceptable'
        },
        culture: {
            formalityLevel: 'semi_formal',
            humilityExpected: false,
            achievementStyle: 'quantified',
            honorificsImportant: false
        },
        ats: {
            prevalence: 'high',
            tips: [
                'English CVs widely accepted, especially in tech/international',
                'Direct communication style appreciated',
                'Skills-based CV acceptable for career changers'
            ]
        },
        legalNotes: ['Equal Treatment Act applies']
    },

    BE: {
        code: 'BE',
        name: 'Belgium',
        language: 'Dutch/French/German',
        documentType: 'cv',
        typicalLength: { pages: 2, description: '1-2 pages' },
        dateFormat: 'DD/MM/YYYY',
        photo: {
            requirement: 'expected',
            reason: 'Standard practice in most sectors'
        },
        personalInfo: {
            fullName: { required: true },
            dateOfBirth: { required: true },
            nationality: { required: true },
            maritalStatus: { required: false },
            gender: { required: false },
            address: { required: true, fullOrCity: 'full' },
            religion: { required: false }
        },
        sectionOrder: ['personal_info', 'experience', 'education', 'skills', 'languages'],
        formatting: {
            fontSize: '10-12pt',
            margins: '2cm',
            lineSpacing: '1.15',
            preferredFonts: ['Arial', 'Calibri'],
            colorAcceptance: 'minimal'
        },
        culture: {
            formalityLevel: 'formal',
            humilityExpected: false,
            achievementStyle: 'descriptive',
            honorificsImportant: true
        },
        ats: {
            prevalence: 'medium',
            tips: [
                'Language skills critical - list all languages with level',
                'Match CV language to job posting language',
                'Europass format accepted'
            ]
        },
        legalNotes: ['Anti-discrimination laws apply']
    },

    CH: {
        code: 'CH',
        name: 'Switzerland',
        language: 'German/French/Italian',
        documentType: 'cv',
        typicalLength: { pages: 2, description: '2 pages maximum' },
        dateFormat: 'DD.MM.YYYY',
        photo: {
            requirement: 'expected',
            reason: 'Professional photo is standard',
            placement: 'top-right'
        },
        personalInfo: {
            fullName: { required: true },
            dateOfBirth: { required: true },
            nationality: { required: true, reason: 'Work permits depend on nationality' },
            maritalStatus: { required: false },
            gender: { required: false },
            address: { required: true, fullOrCity: 'full' },
            religion: { required: false }
        },
        sectionOrder: ['personal_info', 'experience', 'education', 'skills', 'languages', 'references'],
        formatting: {
            fontSize: '10-12pt',
            margins: '2-2.5cm',
            lineSpacing: '1.15',
            preferredFonts: ['Arial', 'Helvetica', 'Calibri'],
            colorAcceptance: 'minimal'
        },
        culture: {
            formalityLevel: 'very_formal',
            humilityExpected: false,
            achievementStyle: 'quantified',
            honorificsImportant: true
        },
        ats: {
            prevalence: 'high',
            tips: [
                'Language proficiency crucial - Switzerland is multilingual',
                'Match CV language to company/region language',
                'High attention to detail expected'
            ]
        },
        legalNotes: ['Work permit requirements vary by nationality']
    },

    AT: {
        code: 'AT',
        name: 'Austria',
        language: 'German',
        documentType: 'cv',
        typicalLength: { pages: 2, description: '2 pages' },
        dateFormat: 'DD.MM.YYYY',
        photo: {
            requirement: 'expected',
            reason: 'Professional photo standard practice',
            placement: 'top-right'
        },
        personalInfo: {
            fullName: { required: true },
            dateOfBirth: { required: true },
            nationality: { required: true },
            maritalStatus: { required: false },
            gender: { required: false },
            address: { required: true, fullOrCity: 'full' },
            religion: { required: false }
        },
        sectionOrder: ['personal_info', 'experience', 'education', 'skills', 'languages'],
        formatting: {
            fontSize: '11-12pt',
            margins: '2.5cm',
            lineSpacing: '1.15',
            preferredFonts: ['Arial', 'Times New Roman'],
            colorAcceptance: 'discouraged'
        },
        culture: {
            formalityLevel: 'very_formal',
            humilityExpected: false,
            achievementStyle: 'descriptive',
            honorificsImportant: true
        },
        ats: {
            prevalence: 'medium',
            tips: [
                'Similar to German standards',
                'Academic titles important - include all degrees',
                'Chronological gaps must be explained'
            ]
        },
        legalNotes: ['Gleichbehandlungsgesetz applies']
    },

    ES: {
        code: 'ES',
        name: 'Spain',
        language: 'Spanish',
        documentType: 'cv',
        typicalLength: { pages: 2, description: '1-2 pages' },
        dateFormat: 'DD/MM/YYYY',
        photo: {
            requirement: 'expected',
            reason: 'Common practice, especially for client-facing roles'
        },
        personalInfo: {
            fullName: { required: true },
            dateOfBirth: { required: true },
            nationality: { required: true },
            maritalStatus: { required: false },
            gender: { required: false },
            address: { required: true, fullOrCity: 'full' },
            religion: { required: false }
        },
        sectionOrder: ['personal_info', 'experience', 'education', 'languages', 'skills'],
        formatting: {
            fontSize: '10-12pt',
            margins: '2cm',
            lineSpacing: '1.15',
            preferredFonts: ['Arial', 'Calibri', 'Times New Roman'],
            colorAcceptance: 'acceptable'
        },
        culture: {
            formalityLevel: 'formal',
            humilityExpected: false,
            achievementStyle: 'descriptive',
            honorificsImportant: true
        },
        ats: {
            prevalence: 'medium',
            tips: [
                'Europass format well-accepted',
                'Language skills very important',
                'Education credentials weighted heavily'
            ]
        },
        legalNotes: ['Data protection and equal opportunity laws apply']
    },

    IT: {
        code: 'IT',
        name: 'Italy',
        language: 'Italian',
        documentType: 'cv',
        typicalLength: { pages: 2, description: '1-2 pages' },
        dateFormat: 'DD/MM/YYYY',
        photo: {
            requirement: 'expected',
            reason: 'Standard practice in most sectors'
        },
        personalInfo: {
            fullName: { required: true },
            dateOfBirth: { required: true },
            nationality: { required: true },
            maritalStatus: { required: false },
            gender: { required: false },
            address: { required: true, fullOrCity: 'full' },
            religion: { required: false }
        },
        sectionOrder: ['personal_info', 'experience', 'education', 'skills', 'languages'],
        formatting: {
            fontSize: '10-12pt',
            margins: '2cm',
            lineSpacing: '1.15',
            preferredFonts: ['Arial', 'Times New Roman'],
            colorAcceptance: 'minimal'
        },
        culture: {
            formalityLevel: 'formal',
            humilityExpected: false,
            achievementStyle: 'descriptive',
            honorificsImportant: true
        },
        ats: {
            prevalence: 'medium',
            tips: [
                'Europass format widely used',
                'Include authorization to process personal data (privacy statement)',
                'Education credentials important'
            ]
        },
        legalNotes: [
            'GDPR compliance required',
            'Include "Autorizzo il trattamento dei dati personali" privacy statement'
        ]
    },

    PT: {
        code: 'PT',
        name: 'Portugal',
        language: 'Portuguese',
        documentType: 'cv',
        typicalLength: { pages: 2, description: '1-2 pages' },
        dateFormat: 'DD/MM/YYYY',
        photo: {
            requirement: 'expected',
            reason: 'Common practice'
        },
        personalInfo: {
            fullName: { required: true },
            dateOfBirth: { required: true },
            nationality: { required: true },
            maritalStatus: { required: false },
            gender: { required: false },
            address: { required: true, fullOrCity: 'full' },
            religion: { required: false }
        },
        sectionOrder: ['personal_info', 'experience', 'education', 'skills', 'languages'],
        formatting: {
            fontSize: '10-12pt',
            margins: '2cm',
            lineSpacing: '1.15',
            preferredFonts: ['Arial', 'Calibri'],
            colorAcceptance: 'acceptable'
        },
        culture: {
            formalityLevel: 'formal',
            humilityExpected: false,
            achievementStyle: 'descriptive',
            honorificsImportant: true
        },
        ats: {
            prevalence: 'medium',
            tips: [
                'Europass format accepted',
                'Language skills important for international companies'
            ]
        },
        legalNotes: ['GDPR compliance required']
    },

    // ─────────────────────────────────────────────────────────────
    // NORDIC COUNTRIES
    // ─────────────────────────────────────────────────────────────
    SE: {
        code: 'SE',
        name: 'Sweden',
        language: 'Swedish',
        documentType: 'cv',
        typicalLength: { pages: 2, description: '2 pages maximum' },
        dateFormat: 'YYYY-MM-DD',
        photo: {
            requirement: 'discouraged',
            reason: 'Discrimination Act - photos avoided to ensure fair evaluation'
        },
        personalInfo: {
            fullName: { required: true },
            dateOfBirth: { required: false },
            nationality: { required: false },
            maritalStatus: { required: false },
            gender: { required: false },
            address: { required: false, fullOrCity: 'city_only' },
            religion: { required: false }
        },
        sectionOrder: ['summary', 'experience', 'education', 'skills', 'languages'],
        formatting: {
            fontSize: '10-12pt',
            margins: '2cm',
            lineSpacing: '1.15',
            preferredFonts: ['Arial', 'Calibri', 'Verdana'],
            colorAcceptance: 'acceptable'
        },
        culture: {
            formalityLevel: 'semi_formal',
            humilityExpected: true,
            achievementStyle: 'modest',
            honorificsImportant: false
        },
        ats: {
            prevalence: 'high',
            tips: [
                'Skills-based CV acceptable',
                'English CVs accepted in tech/international',
                'Focus on teamwork and collaboration'
            ]
        },
        legalNotes: ['Discrimination Act (Diskrimineringslag) applies']
    },

    NO: {
        code: 'NO',
        name: 'Norway',
        language: 'Norwegian',
        documentType: 'cv',
        typicalLength: { pages: 2, description: '2 pages' },
        dateFormat: 'DD.MM.YYYY',
        photo: {
            requirement: 'discouraged',
            reason: 'Focus on qualifications over appearance'
        },
        personalInfo: {
            fullName: { required: true },
            dateOfBirth: { required: false },
            nationality: { required: false },
            maritalStatus: { required: false },
            gender: { required: false },
            address: { required: false, fullOrCity: 'city_only' },
            religion: { required: false }
        },
        sectionOrder: ['summary', 'experience', 'education', 'skills', 'languages'],
        formatting: {
            fontSize: '10-12pt',
            margins: '2cm',
            lineSpacing: '1.15',
            preferredFonts: ['Arial', 'Calibri'],
            colorAcceptance: 'acceptable'
        },
        culture: {
            formalityLevel: 'semi_formal',
            humilityExpected: true,
            achievementStyle: 'modest',
            honorificsImportant: false
        },
        ats: {
            prevalence: 'high',
            tips: [
                'Similar to Swedish standards',
                'English accepted in international companies',
                'Voluntary work valued'
            ]
        },
        legalNotes: ['Equality and Anti-Discrimination Act applies']
    },

    DK: {
        code: 'DK',
        name: 'Denmark',
        language: 'Danish',
        documentType: 'cv',
        typicalLength: { pages: 2, description: '1-2 pages' },
        dateFormat: 'DD-MM-YYYY',
        photo: {
            requirement: 'optional',
            reason: 'Personal choice, not expected'
        },
        personalInfo: {
            fullName: { required: true },
            dateOfBirth: { required: false },
            nationality: { required: false },
            maritalStatus: { required: false },
            gender: { required: false },
            address: { required: false, fullOrCity: 'city_only' },
            religion: { required: false }
        },
        sectionOrder: ['summary', 'experience', 'education', 'skills', 'languages'],
        formatting: {
            fontSize: '10-12pt',
            margins: '2cm',
            lineSpacing: '1.15',
            preferredFonts: ['Arial', 'Calibri', 'Verdana'],
            colorAcceptance: 'acceptable'
        },
        culture: {
            formalityLevel: 'semi_formal',
            humilityExpected: true,
            achievementStyle: 'modest',
            honorificsImportant: false
        },
        ats: {
            prevalence: 'high',
            tips: [
                'Focus on soft skills and cultural fit',
                'English widely accepted',
                'Keep it concise'
            ]
        },
        legalNotes: ['Danish Act on Prohibition of Discrimination applies']
    },

    FI: {
        code: 'FI',
        name: 'Finland',
        language: 'Finnish/Swedish',
        documentType: 'cv',
        typicalLength: { pages: 2, description: '1-2 pages' },
        dateFormat: 'DD.MM.YYYY',
        photo: {
            requirement: 'optional',
            reason: 'Not expected but acceptable'
        },
        personalInfo: {
            fullName: { required: true },
            dateOfBirth: { required: false },
            nationality: { required: false },
            maritalStatus: { required: false },
            gender: { required: false },
            address: { required: false, fullOrCity: 'city_only' },
            religion: { required: false }
        },
        sectionOrder: ['summary', 'experience', 'education', 'skills', 'languages'],
        formatting: {
            fontSize: '10-12pt',
            margins: '2cm',
            lineSpacing: '1.15',
            preferredFonts: ['Arial', 'Calibri'],
            colorAcceptance: 'acceptable'
        },
        culture: {
            formalityLevel: 'semi_formal',
            humilityExpected: true,
            achievementStyle: 'modest',
            honorificsImportant: false
        },
        ats: {
            prevalence: 'high',
            tips: [
                'Straightforward, honest approach valued',
                'English accepted in tech',
                'References often requested'
            ]
        },
        legalNotes: ['Non-Discrimination Act applies']
    },

    PL: {
        code: 'PL',
        name: 'Poland',
        language: 'Polish',
        documentType: 'cv',
        typicalLength: { pages: 2, description: '1-2 pages' },
        dateFormat: 'DD.MM.YYYY',
        photo: {
            requirement: 'expected',
            reason: 'Standard practice though becoming optional'
        },
        personalInfo: {
            fullName: { required: true },
            dateOfBirth: { required: true },
            nationality: { required: false },
            maritalStatus: { required: false },
            gender: { required: false },
            address: { required: true, fullOrCity: 'full' },
            religion: { required: false }
        },
        sectionOrder: ['personal_info', 'experience', 'education', 'skills', 'languages'],
        formatting: {
            fontSize: '10-12pt',
            margins: '2cm',
            lineSpacing: '1.15',
            preferredFonts: ['Arial', 'Calibri', 'Times New Roman'],
            colorAcceptance: 'minimal'
        },
        culture: {
            formalityLevel: 'formal',
            humilityExpected: false,
            achievementStyle: 'descriptive',
            honorificsImportant: true
        },
        ats: {
            prevalence: 'medium',
            tips: [
                'Include RODO clause (GDPR consent)',
                'English CVs accepted in international companies',
                'Europass format understood'
            ]
        },
        legalNotes: [
            'RODO (Polish GDPR) requires privacy consent clause',
            'Include: "Wyrażam zgodę na przetwarzanie moich danych osobowych..."'
        ]
    },

    // ─────────────────────────────────────────────────────────────
    // MIDDLE EAST
    // ─────────────────────────────────────────────────────────────
    AE: {
        code: 'AE',
        name: 'United Arab Emirates',
        language: 'Arabic/English',
        documentType: 'cv',
        typicalLength: { pages: 2, description: '2-3 pages acceptable' },
        dateFormat: 'DD/MM/YYYY',
        photo: {
            requirement: 'required',
            reason: 'Expected and often mandatory for visa applications',
            placement: 'top-right',
            size: 'Passport-style, professional attire'
        },
        personalInfo: {
            fullName: { required: true },
            dateOfBirth: { required: true, reason: 'Standard requirement' },
            nationality: { required: true, reason: 'Visa and work permit requirements' },
            maritalStatus: { required: true, reason: 'Common question, affects visa type' },
            gender: { required: true },
            address: { required: true, fullOrCity: 'full' },
            religion: { required: false, reason: 'Optional but sometimes included' }
        },
        sectionOrder: ['personal_info', 'photo', 'summary', 'experience', 'education', 'skills', 'languages', 'references'],
        formatting: {
            fontSize: '11-12pt',
            margins: '2cm',
            lineSpacing: '1.15',
            preferredFonts: ['Arial', 'Calibri', 'Times New Roman'],
            colorAcceptance: 'minimal'
        },
        culture: {
            formalityLevel: 'formal',
            humilityExpected: false,
            achievementStyle: 'quantified',
            honorificsImportant: true
        },
        ats: {
            prevalence: 'high',
            tips: [
                'English CVs standard for international companies',
                'Include visa status clearly',
                'Salary expectations sometimes included',
                'References often required upfront'
            ]
        },
        legalNotes: [
            'Work visa tied to employer (sponsorship system)',
            'Nationality can affect opportunities',
            'Labour law requirements vary by emirate'
        ]
    },

    SA: {
        code: 'SA',
        name: 'Saudi Arabia',
        language: 'Arabic/English',
        documentType: 'cv',
        typicalLength: { pages: 2, description: '2-3 pages' },
        dateFormat: 'DD/MM/YYYY',
        photo: {
            requirement: 'required',
            reason: 'Expected for visa and employment',
            placement: 'top-right'
        },
        personalInfo: {
            fullName: { required: true },
            dateOfBirth: { required: true },
            nationality: { required: true },
            maritalStatus: { required: true },
            gender: { required: true },
            address: { required: true, fullOrCity: 'full' },
            religion: { required: false }
        },
        sectionOrder: ['personal_info', 'photo', 'summary', 'experience', 'education', 'skills', 'languages'],
        formatting: {
            fontSize: '11-12pt',
            margins: '2cm',
            lineSpacing: '1.15',
            preferredFonts: ['Arial', 'Times New Roman'],
            colorAcceptance: 'discouraged'
        },
        culture: {
            formalityLevel: 'very_formal',
            humilityExpected: false,
            achievementStyle: 'quantified',
            honorificsImportant: true
        },
        ats: {
            prevalence: 'medium',
            tips: [
                'English CVs standard for expat positions',
                'Include iqama (residency) status if applicable',
                'Saudization affects hiring preferences'
            ]
        },
        legalNotes: [
            'Saudization (Nitaqat) quotas affect hiring',
            'Work visa (iqama) requirements strict'
        ]
    },

    QA: {
        code: 'QA',
        name: 'Qatar',
        language: 'Arabic/English',
        documentType: 'cv',
        typicalLength: { pages: 2, description: '2-3 pages' },
        dateFormat: 'DD/MM/YYYY',
        photo: {
            requirement: 'required',
            reason: 'Standard expectation',
            placement: 'top-right'
        },
        personalInfo: {
            fullName: { required: true },
            dateOfBirth: { required: true },
            nationality: { required: true },
            maritalStatus: { required: true },
            gender: { required: true },
            address: { required: true, fullOrCity: 'full' },
            religion: { required: false }
        },
        sectionOrder: ['personal_info', 'photo', 'summary', 'experience', 'education', 'skills', 'languages'],
        formatting: {
            fontSize: '11-12pt',
            margins: '2cm',
            lineSpacing: '1.15',
            preferredFonts: ['Arial', 'Times New Roman'],
            colorAcceptance: 'minimal'
        },
        culture: {
            formalityLevel: 'formal',
            humilityExpected: false,
            achievementStyle: 'quantified',
            honorificsImportant: true
        },
        ats: {
            prevalence: 'high',
            tips: [
                'English widely used in business',
                'Include visa status',
                'Multinational experience valued'
            ]
        },
        legalNotes: ['Kafala (sponsorship) system applies']
    },

    KW: {
        code: 'KW',
        name: 'Kuwait',
        language: 'Arabic/English',
        documentType: 'cv',
        typicalLength: { pages: 2, description: '2-3 pages' },
        dateFormat: 'DD/MM/YYYY',
        photo: {
            requirement: 'required',
            reason: 'Expected practice'
        },
        personalInfo: {
            fullName: { required: true },
            dateOfBirth: { required: true },
            nationality: { required: true },
            maritalStatus: { required: true },
            gender: { required: true },
            address: { required: true, fullOrCity: 'full' },
            religion: { required: false }
        },
        sectionOrder: ['personal_info', 'photo', 'experience', 'education', 'skills', 'languages'],
        formatting: {
            fontSize: '11-12pt',
            margins: '2cm',
            lineSpacing: '1.15',
            preferredFonts: ['Arial', 'Times New Roman'],
            colorAcceptance: 'minimal'
        },
        culture: {
            formalityLevel: 'formal',
            humilityExpected: false,
            achievementStyle: 'quantified',
            honorificsImportant: true
        },
        ats: {
            prevalence: 'medium',
            tips: ['English CVs common', 'Include visa/residency status']
        },
        legalNotes: ['Work permit requirements apply']
    },

    BH: {
        code: 'BH',
        name: 'Bahrain',
        language: 'Arabic/English',
        documentType: 'cv',
        typicalLength: { pages: 2, description: '2 pages' },
        dateFormat: 'DD/MM/YYYY',
        photo: {
            requirement: 'expected',
            reason: 'Common practice'
        },
        personalInfo: {
            fullName: { required: true },
            dateOfBirth: { required: true },
            nationality: { required: true },
            maritalStatus: { required: false },
            gender: { required: true },
            address: { required: true, fullOrCity: 'full' },
            religion: { required: false }
        },
        sectionOrder: ['personal_info', 'photo', 'experience', 'education', 'skills', 'languages'],
        formatting: {
            fontSize: '11-12pt',
            margins: '2cm',
            lineSpacing: '1.15',
            preferredFonts: ['Arial', 'Calibri'],
            colorAcceptance: 'minimal'
        },
        culture: {
            formalityLevel: 'formal',
            humilityExpected: false,
            achievementStyle: 'quantified',
            honorificsImportant: true
        },
        ats: {
            prevalence: 'medium',
            tips: ['English widely used', 'Modern recruitment practices']
        },
        legalNotes: ['Labour law requirements apply']
    },

    OM: {
        code: 'OM',
        name: 'Oman',
        language: 'Arabic/English',
        documentType: 'cv',
        typicalLength: { pages: 2, description: '2-3 pages' },
        dateFormat: 'DD/MM/YYYY',
        photo: {
            requirement: 'expected',
            reason: 'Standard practice'
        },
        personalInfo: {
            fullName: { required: true },
            dateOfBirth: { required: true },
            nationality: { required: true },
            maritalStatus: { required: true },
            gender: { required: true },
            address: { required: true, fullOrCity: 'full' },
            religion: { required: false }
        },
        sectionOrder: ['personal_info', 'photo', 'experience', 'education', 'skills', 'languages'],
        formatting: {
            fontSize: '11-12pt',
            margins: '2cm',
            lineSpacing: '1.15',
            preferredFonts: ['Arial', 'Times New Roman'],
            colorAcceptance: 'minimal'
        },
        culture: {
            formalityLevel: 'formal',
            humilityExpected: false,
            achievementStyle: 'quantified',
            honorificsImportant: true
        },
        ats: {
            prevalence: 'medium',
            tips: ['Omanization policies affect hiring', 'English CVs accepted']
        },
        legalNotes: ['Omanization quotas in certain sectors']
    },

    EG: {
        code: 'EG',
        name: 'Egypt',
        language: 'Arabic/English',
        documentType: 'cv',
        typicalLength: { pages: 2, description: '1-2 pages' },
        dateFormat: 'DD/MM/YYYY',
        photo: {
            requirement: 'expected',
            reason: 'Common practice'
        },
        personalInfo: {
            fullName: { required: true },
            dateOfBirth: { required: true },
            nationality: { required: true },
            maritalStatus: { required: false },
            gender: { required: true },
            address: { required: true, fullOrCity: 'full' },
            religion: { required: false }
        },
        sectionOrder: ['personal_info', 'experience', 'education', 'skills', 'languages'],
        formatting: {
            fontSize: '11-12pt',
            margins: '2cm',
            lineSpacing: '1.15',
            preferredFonts: ['Arial', 'Calibri'],
            colorAcceptance: 'acceptable'
        },
        culture: {
            formalityLevel: 'formal',
            humilityExpected: false,
            achievementStyle: 'descriptive',
            honorificsImportant: true
        },
        ats: {
            prevalence: 'medium',
            tips: ['English for multinational companies', 'Arabic for local companies']
        },
        legalNotes: ['Labour law requirements apply']
    },

    JO: {
        code: 'JO',
        name: 'Jordan',
        language: 'Arabic/English',
        documentType: 'cv',
        typicalLength: { pages: 2, description: '1-2 pages' },
        dateFormat: 'DD/MM/YYYY',
        photo: {
            requirement: 'expected',
            reason: 'Common practice'
        },
        personalInfo: {
            fullName: { required: true },
            dateOfBirth: { required: true },
            nationality: { required: true },
            maritalStatus: { required: false },
            gender: { required: false },
            address: { required: true, fullOrCity: 'city_only' },
            religion: { required: false }
        },
        sectionOrder: ['personal_info', 'experience', 'education', 'skills', 'languages'],
        formatting: {
            fontSize: '11-12pt',
            margins: '2cm',
            lineSpacing: '1.15',
            preferredFonts: ['Arial', 'Calibri'],
            colorAcceptance: 'acceptable'
        },
        culture: {
            formalityLevel: 'formal',
            humilityExpected: false,
            achievementStyle: 'descriptive',
            honorificsImportant: true
        },
        ats: {
            prevalence: 'medium',
            tips: ['English widely used in business', 'Growing tech sector']
        },
        legalNotes: ['Standard labour laws apply']
    },

    LB: {
        code: 'LB',
        name: 'Lebanon',
        language: 'Arabic/French/English',
        documentType: 'cv',
        typicalLength: { pages: 2, description: '1-2 pages' },
        dateFormat: 'DD/MM/YYYY',
        photo: {
            requirement: 'expected',
            reason: 'Common practice'
        },
        personalInfo: {
            fullName: { required: true },
            dateOfBirth: { required: true },
            nationality: { required: true },
            maritalStatus: { required: false },
            gender: { required: false },
            address: { required: true, fullOrCity: 'city_only' },
            religion: { required: false }
        },
        sectionOrder: ['personal_info', 'experience', 'education', 'languages', 'skills'],
        formatting: {
            fontSize: '11-12pt',
            margins: '2cm',
            lineSpacing: '1.15',
            preferredFonts: ['Arial', 'Calibri'],
            colorAcceptance: 'acceptable'
        },
        culture: {
            formalityLevel: 'semi_formal',
            humilityExpected: false,
            achievementStyle: 'descriptive',
            honorificsImportant: false
        },
        ats: {
            prevalence: 'medium',
            tips: ['Multilingual CVs valued', 'French still used in some sectors']
        },
        legalNotes: ['Standard labour laws apply']
    },

    // ─────────────────────────────────────────────────────────────
    // ASIA PACIFIC
    // ─────────────────────────────────────────────────────────────
    IN: {
        code: 'IN',
        name: 'India',
        language: 'English/Hindi',
        documentType: 'resume',
        typicalLength: { pages: 2, description: '2-3 pages acceptable for experienced' },
        dateFormat: 'DD/MM/YYYY',
        photo: {
            requirement: 'expected',
            reason: 'Standard practice in most industries',
            placement: 'top-right'
        },
        personalInfo: {
            fullName: { required: true },
            dateOfBirth: { required: true, reason: 'Commonly included' },
            nationality: { required: false },
            maritalStatus: { required: false, reason: 'Optional but often asked' },
            gender: { required: false },
            address: { required: true, fullOrCity: 'full' },
            religion: { required: false }
        },
        sectionOrder: ['personal_info', 'summary', 'experience', 'skills', 'education', 'projects', 'certifications'],
        formatting: {
            fontSize: '10-12pt',
            margins: '1-1.5cm',
            lineSpacing: '1.15',
            preferredFonts: ['Arial', 'Calibri', 'Times New Roman'],
            colorAcceptance: 'acceptable'
        },
        culture: {
            formalityLevel: 'formal',
            humilityExpected: false,
            achievementStyle: 'quantified',
            honorificsImportant: false
        },
        ats: {
            prevalence: 'very_high',
            tips: [
                'English is standard for professional roles',
                'Keywords critical for IT/tech roles',
                'Include notice period if currently employed',
                'Current/Expected CTC (salary) often mentioned'
            ]
        },
        legalNotes: [
            'No legal requirement for personal details',
            'Right to Information Act affects some sectors'
        ]
    },

    SG: {
        code: 'SG',
        name: 'Singapore',
        language: 'English',
        documentType: 'resume',
        typicalLength: { pages: 2, description: '2 pages maximum' },
        dateFormat: 'DD/MM/YYYY',
        photo: {
            requirement: 'optional',
            reason: 'Not required but acceptable'
        },
        personalInfo: {
            fullName: { required: true },
            dateOfBirth: { required: false },
            nationality: { required: true, reason: 'Work pass requirements' },
            maritalStatus: { required: false },
            gender: { required: false },
            address: { required: false, fullOrCity: 'city_only' },
            religion: { required: false }
        },
        sectionOrder: ['summary', 'experience', 'skills', 'education', 'certifications'],
        formatting: {
            fontSize: '10-12pt',
            margins: '1.5-2cm',
            lineSpacing: '1.15',
            preferredFonts: ['Arial', 'Calibri', 'Verdana'],
            colorAcceptance: 'minimal'
        },
        culture: {
            formalityLevel: 'semi_formal',
            humilityExpected: false,
            achievementStyle: 'quantified',
            honorificsImportant: false
        },
        ats: {
            prevalence: 'very_high',
            tips: [
                'US/UK style resumes preferred',
                'Work pass status important to mention',
                'Achievements with metrics valued'
            ]
        },
        legalNotes: [
            'Employment Pass requirements',
            'Fair Consideration Framework for hiring'
        ]
    },

    AU: {
        code: 'AU',
        name: 'Australia',
        language: 'English',
        documentType: 'resume',
        typicalLength: { pages: 2, description: '2-3 pages' },
        dateFormat: 'DD/MM/YYYY',
        photo: {
            requirement: 'discouraged',
            reason: 'Anti-discrimination laws discourage photos'
        },
        personalInfo: {
            fullName: { required: true },
            dateOfBirth: { required: false, reason: 'Age discrimination - exclude' },
            nationality: { required: false, reason: 'Only mention visa/work rights' },
            maritalStatus: { required: false },
            gender: { required: false },
            address: { required: false, fullOrCity: 'city_only' },
            religion: { required: false }
        },
        sectionOrder: ['summary', 'key_skills', 'experience', 'education', 'certifications', 'references'],
        formatting: {
            fontSize: '10-12pt',
            margins: '2-2.5cm',
            lineSpacing: '1.15',
            preferredFonts: ['Arial', 'Calibri', 'Garamond'],
            colorAcceptance: 'acceptable'
        },
        culture: {
            formalityLevel: 'semi_formal',
            humilityExpected: false,
            achievementStyle: 'quantified',
            honorificsImportant: false
        },
        ats: {
            prevalence: 'very_high',
            tips: [
                'Include work rights (citizen/PR/visa type)',
                'Achievement-focused bullet points',
                'Referees section common',
                'Skills summary near top valued'
            ]
        },
        legalNotes: [
            'Fair Work Act 2009',
            'Age Discrimination Act 2004',
            'Right to work verification required'
        ]
    },

    NZ: {
        code: 'NZ',
        name: 'New Zealand',
        language: 'English',
        documentType: 'cv',
        typicalLength: { pages: 2, description: '2-3 pages' },
        dateFormat: 'DD/MM/YYYY',
        photo: {
            requirement: 'discouraged',
            reason: 'Human Rights Act discourages photos'
        },
        personalInfo: {
            fullName: { required: true },
            dateOfBirth: { required: false },
            nationality: { required: false, reason: 'Mention work rights only' },
            maritalStatus: { required: false },
            gender: { required: false },
            address: { required: false, fullOrCity: 'city_only' },
            religion: { required: false }
        },
        sectionOrder: ['summary', 'skills', 'experience', 'education', 'references'],
        formatting: {
            fontSize: '10-12pt',
            margins: '2cm',
            lineSpacing: '1.15',
            preferredFonts: ['Arial', 'Calibri'],
            colorAcceptance: 'acceptable'
        },
        culture: {
            formalityLevel: 'semi_formal',
            humilityExpected: true,
            achievementStyle: 'modest',
            honorificsImportant: false
        },
        ats: {
            prevalence: 'high',
            tips: [
                'Include visa/work rights',
                'References often required (3 minimum)',
                'More casual tone acceptable'
            ]
        },
        legalNotes: ['Human Rights Act 1993 applies']
    },

    MY: {
        code: 'MY',
        name: 'Malaysia',
        language: 'Malay/English',
        documentType: 'resume',
        typicalLength: { pages: 2, description: '2 pages' },
        dateFormat: 'DD/MM/YYYY',
        photo: {
            requirement: 'expected',
            reason: 'Standard practice',
            placement: 'top-right'
        },
        personalInfo: {
            fullName: { required: true },
            dateOfBirth: { required: true },
            nationality: { required: true },
            maritalStatus: { required: false },
            gender: { required: false },
            address: { required: true, fullOrCity: 'full' },
            religion: { required: false }
        },
        sectionOrder: ['personal_info', 'summary', 'experience', 'education', 'skills', 'languages'],
        formatting: {
            fontSize: '10-12pt',
            margins: '2cm',
            lineSpacing: '1.15',
            preferredFonts: ['Arial', 'Calibri'],
            colorAcceptance: 'acceptable'
        },
        culture: {
            formalityLevel: 'formal',
            humilityExpected: false,
            achievementStyle: 'quantified',
            honorificsImportant: false
        },
        ats: {
            prevalence: 'high',
            tips: [
                'English for multinational companies',
                'Include expected salary if requested',
                'Language skills important'
            ]
        },
        legalNotes: ['Employment Act requirements apply']
    },

    PH: {
        code: 'PH',
        name: 'Philippines',
        language: 'Filipino/English',
        documentType: 'resume',
        typicalLength: { pages: 2, description: '2 pages' },
        dateFormat: 'MM/DD/YYYY',
        photo: {
            requirement: 'expected',
            reason: 'Common practice',
            placement: 'top-right'
        },
        personalInfo: {
            fullName: { required: true },
            dateOfBirth: { required: true },
            nationality: { required: true },
            maritalStatus: { required: false },
            gender: { required: false },
            address: { required: true, fullOrCity: 'full' },
            religion: { required: false }
        },
        sectionOrder: ['personal_info', 'summary', 'experience', 'education', 'skills'],
        formatting: {
            fontSize: '10-12pt',
            margins: '2cm',
            lineSpacing: '1.15',
            preferredFonts: ['Arial', 'Calibri', 'Times New Roman'],
            colorAcceptance: 'acceptable'
        },
        culture: {
            formalityLevel: 'formal',
            humilityExpected: false,
            achievementStyle: 'quantified',
            honorificsImportant: false
        },
        ats: {
            prevalence: 'high',
            tips: [
                'English standard for business',
                'BPO/call center experience valued',
                'Include government IDs if relevant'
            ]
        },
        legalNotes: ['Labour Code of the Philippines applies']
    },

    ID: {
        code: 'ID',
        name: 'Indonesia',
        language: 'Indonesian/English',
        documentType: 'cv',
        typicalLength: { pages: 2, description: '2 pages' },
        dateFormat: 'DD/MM/YYYY',
        photo: {
            requirement: 'required',
            reason: 'Standard expectation',
            placement: 'top-right'
        },
        personalInfo: {
            fullName: { required: true },
            dateOfBirth: { required: true },
            nationality: { required: true },
            maritalStatus: { required: true },
            gender: { required: true },
            address: { required: true, fullOrCity: 'full' },
            religion: { required: true, reason: 'Commonly included in Indonesian CVs' }
        },
        sectionOrder: ['personal_info', 'photo', 'summary', 'experience', 'education', 'skills'],
        formatting: {
            fontSize: '10-12pt',
            margins: '2cm',
            lineSpacing: '1.15',
            preferredFonts: ['Arial', 'Calibri'],
            colorAcceptance: 'minimal'
        },
        culture: {
            formalityLevel: 'formal',
            humilityExpected: true,
            achievementStyle: 'descriptive',
            honorificsImportant: true
        },
        ats: {
            prevalence: 'medium',
            tips: [
                'Indonesian for local companies',
                'English for multinational companies',
                'Education credentials important'
            ]
        },
        legalNotes: ['Manpower Law requirements apply']
    },

    TH: {
        code: 'TH',
        name: 'Thailand',
        language: 'Thai/English',
        documentType: 'resume',
        typicalLength: { pages: 2, description: '1-2 pages' },
        dateFormat: 'DD/MM/YYYY',
        photo: {
            requirement: 'expected',
            reason: 'Standard practice',
            placement: 'top-right'
        },
        personalInfo: {
            fullName: { required: true },
            dateOfBirth: { required: true },
            nationality: { required: true },
            maritalStatus: { required: false },
            gender: { required: true },
            address: { required: true, fullOrCity: 'full' },
            religion: { required: false }
        },
        sectionOrder: ['personal_info', 'photo', 'experience', 'education', 'skills', 'languages'],
        formatting: {
            fontSize: '10-12pt',
            margins: '2cm',
            lineSpacing: '1.15',
            preferredFonts: ['Arial', 'Calibri'],
            colorAcceptance: 'acceptable'
        },
        culture: {
            formalityLevel: 'formal',
            humilityExpected: true,
            achievementStyle: 'modest',
            honorificsImportant: true
        },
        ats: {
            prevalence: 'medium',
            tips: [
                'English for international companies',
                'Thai for local companies',
                'Language skills valued'
            ]
        },
        legalNotes: ['Labour Protection Act applies']
    },

    VN: {
        code: 'VN',
        name: 'Vietnam',
        language: 'Vietnamese/English',
        documentType: 'cv',
        typicalLength: { pages: 2, description: '1-2 pages' },
        dateFormat: 'DD/MM/YYYY',
        photo: {
            requirement: 'expected',
            reason: 'Standard practice',
            placement: 'top-right'
        },
        personalInfo: {
            fullName: { required: true },
            dateOfBirth: { required: true },
            nationality: { required: true },
            maritalStatus: { required: false },
            gender: { required: true },
            address: { required: true, fullOrCity: 'full' },
            religion: { required: false }
        },
        sectionOrder: ['personal_info', 'photo', 'summary', 'experience', 'education', 'skills'],
        formatting: {
            fontSize: '10-12pt',
            margins: '2cm',
            lineSpacing: '1.15',
            preferredFonts: ['Arial', 'Times New Roman'],
            colorAcceptance: 'acceptable'
        },
        culture: {
            formalityLevel: 'formal',
            humilityExpected: true,
            achievementStyle: 'descriptive',
            honorificsImportant: true
        },
        ats: {
            prevalence: 'medium',
            tips: [
                'English for multinational companies',
                'Growing tech sector values modern CV formats',
                'Education credentials respected'
            ]
        },
        legalNotes: ['Labour Code applies']
    },

    JP: {
        code: 'JP',
        name: 'Japan',
        language: 'Japanese',
        documentType: 'cv',
        typicalLength: { pages: 2, description: 'Rirekisho (1 page) + Shokumu-keirekisho (variable)' },
        dateFormat: 'YYYY/MM/DD',
        photo: {
            requirement: 'required',
            reason: 'Rirekisho format requires photo',
            placement: 'top-right',
            size: '3x4cm, taken within 3 months'
        },
        personalInfo: {
            fullName: { required: true, format: 'Full name with furigana reading' },
            dateOfBirth: { required: true },
            nationality: { required: false },
            maritalStatus: { required: false },
            gender: { required: true },
            address: { required: true, fullOrCity: 'full' },
            religion: { required: false }
        },
        sectionOrder: ['personal_info', 'photo', 'education', 'work_history', 'certifications', 'hobbies'],
        formatting: {
            fontSize: '10-11pt',
            margins: 'Standard Rirekisho margins',
            lineSpacing: '1.0',
            preferredFonts: ['Mincho', 'Gothic'],
            colorAcceptance: 'discouraged'
        },
        culture: {
            formalityLevel: 'very_formal',
            humilityExpected: true,
            achievementStyle: 'modest',
            honorificsImportant: true
        },
        ats: {
            prevalence: 'medium',
            tips: [
                'Two documents: Rirekisho (personal) + Shokumu-keirekisho (career)',
                'Standard Rirekisho format preferred',
                'Handwritten was traditional, typed now acceptable',
                'List all positions chronologically with no gaps'
            ]
        },
        legalNotes: [
            'Age not legally protected - still commonly requested',
            'Specific resume formats expected (Rirekisho)'
        ]
    },

    KR: {
        code: 'KR',
        name: 'South Korea',
        language: 'Korean',
        documentType: 'resume',
        typicalLength: { pages: 2, description: '1-2 pages' },
        dateFormat: 'YYYY/MM/DD',
        photo: {
            requirement: 'required',
            reason: 'Standard practice, professional photo expected',
            placement: 'top-right',
            size: 'Passport-style'
        },
        personalInfo: {
            fullName: { required: true },
            dateOfBirth: { required: true },
            nationality: { required: false },
            maritalStatus: { required: false },
            gender: { required: true },
            address: { required: true, fullOrCity: 'full' },
            religion: { required: false }
        },
        sectionOrder: ['personal_info', 'photo', 'education', 'experience', 'skills', 'certifications', 'military_service'],
        formatting: {
            fontSize: '10-12pt',
            margins: '2cm',
            lineSpacing: '1.15',
            preferredFonts: ['Malgun Gothic', 'Arial'],
            colorAcceptance: 'minimal'
        },
        culture: {
            formalityLevel: 'very_formal',
            humilityExpected: true,
            achievementStyle: 'quantified',
            honorificsImportant: true
        },
        ats: {
            prevalence: 'high',
            tips: [
                'Education section very important (university ranking matters)',
                'Military service section for males',
                'TOEIC/TOEFL scores often included',
                'Hobbies and personality tests sometimes requested'
            ]
        },
        legalNotes: [
            'Age discrimination laws exist but age still commonly requested',
            'Military service disclosure expected for males'
        ]
    },

    CN: {
        code: 'CN',
        name: 'China',
        language: 'Chinese',
        documentType: 'resume',
        typicalLength: { pages: 1, description: '1 page strongly preferred' },
        dateFormat: 'YYYY/MM/DD',
        photo: {
            requirement: 'required',
            reason: 'Standard expectation',
            placement: 'top-right'
        },
        personalInfo: {
            fullName: { required: true },
            dateOfBirth: { required: true },
            nationality: { required: false },
            maritalStatus: { required: true },
            gender: { required: true },
            address: { required: true, fullOrCity: 'full' },
            religion: { required: false }
        },
        sectionOrder: ['personal_info', 'photo', 'education', 'experience', 'skills', 'certifications'],
        formatting: {
            fontSize: '10-12pt',
            margins: '2cm',
            lineSpacing: '1.15',
            preferredFonts: ['SimSun', 'Microsoft YaHei', 'Arial'],
            colorAcceptance: 'minimal'
        },
        culture: {
            formalityLevel: 'formal',
            humilityExpected: true,
            achievementStyle: 'quantified',
            honorificsImportant: true
        },
        ats: {
            prevalence: 'high',
            tips: [
                'Education credentials very important',
                'Political party membership sometimes listed',
                'Hukou (household registration) may be relevant',
                'Keep it concise - 1 page preferred'
            ]
        },
        legalNotes: [
            'Personal information commonly requested',
            'Hukou system affects employment in some cities'
        ]
    },

    HK: {
        code: 'HK',
        name: 'Hong Kong',
        language: 'Chinese/English',
        documentType: 'cv',
        typicalLength: { pages: 2, description: '2 pages' },
        dateFormat: 'DD/MM/YYYY',
        photo: {
            requirement: 'optional',
            reason: 'Not required but sometimes included'
        },
        personalInfo: {
            fullName: { required: true },
            dateOfBirth: { required: false },
            nationality: { required: true, reason: 'Visa/work rights relevant' },
            maritalStatus: { required: false },
            gender: { required: false },
            address: { required: false, fullOrCity: 'city_only' },
            religion: { required: false }
        },
        sectionOrder: ['summary', 'experience', 'education', 'skills', 'languages'],
        formatting: {
            fontSize: '10-12pt',
            margins: '2cm',
            lineSpacing: '1.15',
            preferredFonts: ['Arial', 'Calibri'],
            colorAcceptance: 'minimal'
        },
        culture: {
            formalityLevel: 'semi_formal',
            humilityExpected: false,
            achievementStyle: 'quantified',
            honorificsImportant: false
        },
        ats: {
            prevalence: 'very_high',
            tips: [
                'English CVs standard for international roles',
                'Bilingual (Chinese/English) valued',
                'Achievement-focused content'
            ]
        },
        legalNotes: ['Disability Discrimination Ordinance applies']
    },

    TW: {
        code: 'TW',
        name: 'Taiwan',
        language: 'Chinese',
        documentType: 'resume',
        typicalLength: { pages: 1, description: '1 page preferred' },
        dateFormat: 'YYYY/MM/DD',
        photo: {
            requirement: 'expected',
            reason: 'Standard practice',
            placement: 'top-right'
        },
        personalInfo: {
            fullName: { required: true },
            dateOfBirth: { required: true },
            nationality: { required: false },
            maritalStatus: { required: false },
            gender: { required: true },
            address: { required: true, fullOrCity: 'full' },
            religion: { required: false }
        },
        sectionOrder: ['personal_info', 'photo', 'education', 'experience', 'skills', 'languages'],
        formatting: {
            fontSize: '10-12pt',
            margins: '2cm',
            lineSpacing: '1.15',
            preferredFonts: ['PMingLiU', 'Arial'],
            colorAcceptance: 'acceptable'
        },
        culture: {
            formalityLevel: 'formal',
            humilityExpected: true,
            achievementStyle: 'quantified',
            honorificsImportant: true
        },
        ats: {
            prevalence: 'high',
            tips: [
                'Online job platforms widely used (104, 1111)',
                'English for tech/international roles',
                'Education credentials valued'
            ]
        },
        legalNotes: ['Employment Service Act applies']
    },

    // ─────────────────────────────────────────────────────────────
    // LATIN AMERICA
    // ─────────────────────────────────────────────────────────────
    MX: {
        code: 'MX',
        name: 'Mexico',
        language: 'Spanish',
        documentType: 'cv',
        typicalLength: { pages: 2, description: '1-2 pages' },
        dateFormat: 'DD/MM/YYYY',
        photo: {
            requirement: 'expected',
            reason: 'Common practice'
        },
        personalInfo: {
            fullName: { required: true },
            dateOfBirth: { required: true },
            nationality: { required: true },
            maritalStatus: { required: false },
            gender: { required: false },
            address: { required: true, fullOrCity: 'full' },
            religion: { required: false }
        },
        sectionOrder: ['personal_info', 'summary', 'experience', 'education', 'skills', 'languages'],
        formatting: {
            fontSize: '10-12pt',
            margins: '2cm',
            lineSpacing: '1.15',
            preferredFonts: ['Arial', 'Calibri'],
            colorAcceptance: 'acceptable'
        },
        culture: {
            formalityLevel: 'formal',
            humilityExpected: false,
            achievementStyle: 'quantified',
            honorificsImportant: false
        },
        ats: {
            prevalence: 'high',
            tips: [
                'Spanish for local companies',
                'English for multinational/tech',
                'Include CURP (national ID) if requested'
            ]
        },
        legalNotes: ['Federal Labour Law (LFT) applies']
    },

    BR: {
        code: 'BR',
        name: 'Brazil',
        language: 'Portuguese',
        documentType: 'cv',
        typicalLength: { pages: 2, description: '1-2 pages' },
        dateFormat: 'DD/MM/YYYY',
        photo: {
            requirement: 'expected',
            reason: 'Common practice, though changing'
        },
        personalInfo: {
            fullName: { required: true },
            dateOfBirth: { required: true },
            nationality: { required: true },
            maritalStatus: { required: false },
            gender: { required: false },
            address: { required: true, fullOrCity: 'full' },
            religion: { required: false }
        },
        sectionOrder: ['personal_info', 'summary', 'experience', 'education', 'skills', 'languages'],
        formatting: {
            fontSize: '10-12pt',
            margins: '2cm',
            lineSpacing: '1.15',
            preferredFonts: ['Arial', 'Calibri', 'Times New Roman'],
            colorAcceptance: 'acceptable'
        },
        culture: {
            formalityLevel: 'semi_formal',
            humilityExpected: false,
            achievementStyle: 'quantified',
            honorificsImportant: false
        },
        ats: {
            prevalence: 'high',
            tips: [
                'Portuguese for local companies',
                'English for tech/multinational',
                'CPF not required on CV'
            ]
        },
        legalNotes: ['CLT (Consolidação das Leis do Trabalho) applies']
    },

    AR: {
        code: 'AR',
        name: 'Argentina',
        language: 'Spanish',
        documentType: 'cv',
        typicalLength: { pages: 2, description: '1-2 pages' },
        dateFormat: 'DD/MM/YYYY',
        photo: {
            requirement: 'expected',
            reason: 'Common practice'
        },
        personalInfo: {
            fullName: { required: true },
            dateOfBirth: { required: true },
            nationality: { required: true },
            maritalStatus: { required: false },
            gender: { required: false },
            address: { required: true, fullOrCity: 'city_only' },
            religion: { required: false }
        },
        sectionOrder: ['personal_info', 'summary', 'experience', 'education', 'skills', 'languages'],
        formatting: {
            fontSize: '10-12pt',
            margins: '2cm',
            lineSpacing: '1.15',
            preferredFonts: ['Arial', 'Calibri'],
            colorAcceptance: 'acceptable'
        },
        culture: {
            formalityLevel: 'semi_formal',
            humilityExpected: false,
            achievementStyle: 'descriptive',
            honorificsImportant: false
        },
        ats: {
            prevalence: 'medium',
            tips: [
                'Spanish standard',
                'Include DNI number if requested',
                'Growing tech sector values modern formats'
            ]
        },
        legalNotes: ['Labour Contract Law applies']
    },

    CL: {
        code: 'CL',
        name: 'Chile',
        language: 'Spanish',
        documentType: 'cv',
        typicalLength: { pages: 2, description: '1-2 pages' },
        dateFormat: 'DD/MM/YYYY',
        photo: {
            requirement: 'expected',
            reason: 'Common practice'
        },
        personalInfo: {
            fullName: { required: true },
            dateOfBirth: { required: true },
            nationality: { required: true },
            maritalStatus: { required: false },
            gender: { required: false },
            address: { required: true, fullOrCity: 'city_only' },
            religion: { required: false }
        },
        sectionOrder: ['personal_info', 'summary', 'experience', 'education', 'skills', 'languages'],
        formatting: {
            fontSize: '10-12pt',
            margins: '2cm',
            lineSpacing: '1.15',
            preferredFonts: ['Arial', 'Calibri'],
            colorAcceptance: 'acceptable'
        },
        culture: {
            formalityLevel: 'formal',
            humilityExpected: false,
            achievementStyle: 'quantified',
            honorificsImportant: false
        },
        ats: {
            prevalence: 'high',
            tips: [
                'Spanish standard',
                'RUT number sometimes requested',
                'Modern formats accepted in tech'
            ]
        },
        legalNotes: ['Labour Code applies']
    },

    CO: {
        code: 'CO',
        name: 'Colombia',
        language: 'Spanish',
        documentType: 'cv',
        typicalLength: { pages: 2, description: '1-2 pages' },
        dateFormat: 'DD/MM/YYYY',
        photo: {
            requirement: 'expected',
            reason: 'Standard practice'
        },
        personalInfo: {
            fullName: { required: true },
            dateOfBirth: { required: true },
            nationality: { required: true },
            maritalStatus: { required: false },
            gender: { required: false },
            address: { required: true, fullOrCity: 'city_only' },
            religion: { required: false }
        },
        sectionOrder: ['personal_info', 'summary', 'experience', 'education', 'skills', 'languages'],
        formatting: {
            fontSize: '10-12pt',
            margins: '2cm',
            lineSpacing: '1.15',
            preferredFonts: ['Arial', 'Calibri'],
            colorAcceptance: 'acceptable'
        },
        culture: {
            formalityLevel: 'formal',
            humilityExpected: false,
            achievementStyle: 'descriptive',
            honorificsImportant: false
        },
        ats: {
            prevalence: 'medium',
            tips: [
                'Spanish standard',
                'English for multinational companies',
                'Growing BPO sector'
            ]
        },
        legalNotes: ['Substantive Labour Code applies']
    },

    PE: {
        code: 'PE',
        name: 'Peru',
        language: 'Spanish',
        documentType: 'cv',
        typicalLength: { pages: 2, description: '1-2 pages' },
        dateFormat: 'DD/MM/YYYY',
        photo: {
            requirement: 'expected',
            reason: 'Common practice'
        },
        personalInfo: {
            fullName: { required: true },
            dateOfBirth: { required: true },
            nationality: { required: true },
            maritalStatus: { required: false },
            gender: { required: false },
            address: { required: true, fullOrCity: 'city_only' },
            religion: { required: false }
        },
        sectionOrder: ['personal_info', 'summary', 'experience', 'education', 'skills'],
        formatting: {
            fontSize: '10-12pt',
            margins: '2cm',
            lineSpacing: '1.15',
            preferredFonts: ['Arial', 'Calibri'],
            colorAcceptance: 'acceptable'
        },
        culture: {
            formalityLevel: 'formal',
            humilityExpected: false,
            achievementStyle: 'descriptive',
            honorificsImportant: false
        },
        ats: {
            prevalence: 'medium',
            tips: ['Spanish standard', 'DNI commonly requested', 'Mining sector has specific requirements']
        },
        legalNotes: ['Labour Productivity Law applies']
    },

    // ─────────────────────────────────────────────────────────────
    // AFRICA
    // ─────────────────────────────────────────────────────────────
    ZA: {
        code: 'ZA',
        name: 'South Africa',
        language: 'English',
        documentType: 'cv',
        typicalLength: { pages: 3, description: '2-3 pages common' },
        dateFormat: 'DD/MM/YYYY',
        photo: {
            requirement: 'optional',
            reason: 'Not typically required'
        },
        personalInfo: {
            fullName: { required: true },
            dateOfBirth: { required: false },
            nationality: { required: true, reason: 'BEE requirements' },
            maritalStatus: { required: false },
            gender: { required: false },
            address: { required: false, fullOrCity: 'city_only' },
            religion: { required: false }
        },
        sectionOrder: ['personal_info', 'summary', 'experience', 'education', 'skills', 'references'],
        formatting: {
            fontSize: '10-12pt',
            margins: '2cm',
            lineSpacing: '1.15',
            preferredFonts: ['Arial', 'Calibri', 'Times New Roman'],
            colorAcceptance: 'acceptable'
        },
        culture: {
            formalityLevel: 'semi_formal',
            humilityExpected: false,
            achievementStyle: 'quantified',
            honorificsImportant: false
        },
        ats: {
            prevalence: 'high',
            tips: [
                'Include BEE (Black Economic Empowerment) status if relevant',
                'References commonly included or available',
                'ID number sometimes requested'
            ]
        },
        legalNotes: [
            'Employment Equity Act affects hiring',
            'BEE requirements in certain sectors'
        ]
    },

    NG: {
        code: 'NG',
        name: 'Nigeria',
        language: 'English',
        documentType: 'cv',
        typicalLength: { pages: 2, description: '2-3 pages' },
        dateFormat: 'DD/MM/YYYY',
        photo: {
            requirement: 'expected',
            reason: 'Standard practice',
            placement: 'top-right'
        },
        personalInfo: {
            fullName: { required: true },
            dateOfBirth: { required: true },
            nationality: { required: true },
            maritalStatus: { required: true },
            gender: { required: true },
            address: { required: true, fullOrCity: 'full' },
            religion: { required: false }
        },
        sectionOrder: ['personal_info', 'photo', 'summary', 'experience', 'education', 'skills', 'references'],
        formatting: {
            fontSize: '10-12pt',
            margins: '2cm',
            lineSpacing: '1.15',
            preferredFonts: ['Arial', 'Times New Roman'],
            colorAcceptance: 'minimal'
        },
        culture: {
            formalityLevel: 'formal',
            humilityExpected: false,
            achievementStyle: 'quantified',
            honorificsImportant: true
        },
        ats: {
            prevalence: 'medium',
            tips: [
                'English standard',
                'Include LGA (Local Government Area) of origin',
                'NYSC (National Youth Service Corps) completion status'
            ]
        },
        legalNotes: ['Federal Character principle may apply']
    },

    KE: {
        code: 'KE',
        name: 'Kenya',
        language: 'English/Swahili',
        documentType: 'cv',
        typicalLength: { pages: 2, description: '2 pages' },
        dateFormat: 'DD/MM/YYYY',
        photo: {
            requirement: 'optional',
            reason: 'Not typically required'
        },
        personalInfo: {
            fullName: { required: true },
            dateOfBirth: { required: true },
            nationality: { required: true },
            maritalStatus: { required: false },
            gender: { required: false },
            address: { required: true, fullOrCity: 'city_only' },
            religion: { required: false }
        },
        sectionOrder: ['personal_info', 'summary', 'experience', 'education', 'skills', 'references'],
        formatting: {
            fontSize: '10-12pt',
            margins: '2cm',
            lineSpacing: '1.15',
            preferredFonts: ['Arial', 'Calibri'],
            colorAcceptance: 'acceptable'
        },
        culture: {
            formalityLevel: 'formal',
            humilityExpected: false,
            achievementStyle: 'quantified',
            honorificsImportant: false
        },
        ats: {
            prevalence: 'medium',
            tips: [
                'English standard for professional roles',
                'Growing tech sector (Silicon Savannah)',
                'Include ID number if requested'
            ]
        },
        legalNotes: ['Employment Act applies']
    },

    GH: {
        code: 'GH',
        name: 'Ghana',
        language: 'English',
        documentType: 'cv',
        typicalLength: { pages: 2, description: '2 pages' },
        dateFormat: 'DD/MM/YYYY',
        photo: {
            requirement: 'expected',
            reason: 'Common practice'
        },
        personalInfo: {
            fullName: { required: true },
            dateOfBirth: { required: true },
            nationality: { required: true },
            maritalStatus: { required: false },
            gender: { required: false },
            address: { required: true, fullOrCity: 'full' },
            religion: { required: false }
        },
        sectionOrder: ['personal_info', 'summary', 'experience', 'education', 'skills', 'references'],
        formatting: {
            fontSize: '10-12pt',
            margins: '2cm',
            lineSpacing: '1.15',
            preferredFonts: ['Arial', 'Times New Roman'],
            colorAcceptance: 'acceptable'
        },
        culture: {
            formalityLevel: 'formal',
            humilityExpected: false,
            achievementStyle: 'descriptive',
            honorificsImportant: true
        },
        ats: {
            prevalence: 'medium',
            tips: ['English standard', 'References commonly included', 'National Service completion']
        },
        legalNotes: ['Labour Act applies']
    },

    // ─────────────────────────────────────────────────────────────
    // GLOBAL FALLBACK
    // ─────────────────────────────────────────────────────────────
    GLOBAL: {
        code: 'GLOBAL',
        name: 'Global/International',
        language: 'English',
        documentType: 'resume',
        typicalLength: { pages: 2, description: '1-2 pages recommended for international applications' },
        dateFormat: 'DD/MM/YYYY',
        photo: {
            requirement: 'optional',
            reason: 'Varies by country - check specific requirements'
        },
        personalInfo: {
            fullName: { required: true },
            dateOfBirth: { required: false, reason: 'Varies - exclude if unsure' },
            nationality: { required: false, reason: 'Include for work authorization context' },
            maritalStatus: { required: false },
            gender: { required: false },
            address: { required: false, fullOrCity: 'city_only' },
            religion: { required: false }
        },
        sectionOrder: ['summary', 'experience', 'skills', 'education', 'certifications'],
        formatting: {
            fontSize: '10-12pt',
            margins: '2cm',
            lineSpacing: '1.15',
            preferredFonts: ['Arial', 'Calibri', 'Helvetica'],
            colorAcceptance: 'minimal'
        },
        culture: {
            formalityLevel: 'semi_formal',
            humilityExpected: false,
            achievementStyle: 'quantified',
            honorificsImportant: false
        },
        ats: {
            prevalence: 'high',
            tips: [
                'Use clean, ATS-friendly format',
                'English for international applications',
                'Focus on achievements with metrics',
                'Research specific country requirements'
            ]
        },
        legalNotes: [
            'Research specific country requirements',
            'Work authorization often required'
        ]
    }
};

// ═══════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Get regional format for a country code
 */
export function getRegionalFormat(code: RegionCode): RegionalFormat {
    return REGIONAL_FORMATS[code] || REGIONAL_FORMATS.GLOBAL;
}

/**
 * Format a date according to regional preferences
 */
export function formatDateForRegion(
    date: Date | string,
    region: RegionCode
): FormattedDate {
    const format = REGIONAL_FORMATS[region]?.dateFormat || 'DD/MM/YYYY';

    const d = typeof date === 'string' ? new Date(date) : date;

    if (isNaN(d.getTime())) {
        return { display: String(date), format };
    }

    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();

    let display: string;
    switch (format) {
        case 'MM/DD/YYYY':
            display = `${month}/${day}/${year}`;
            break;
        case 'DD/MM/YYYY':
            display = `${day}/${month}/${year}`;
            break;
        case 'YYYY/MM/DD':
            display = `${year}/${month}/${day}`;
            break;
        case 'DD.MM.YYYY':
            display = `${day}.${month}.${year}`;
            break;
        case 'YYYY-MM-DD':
            display = `${year}-${month}-${day}`;
            break;
        default:
            display = `${day}/${month}/${year}`;
    }

    return { display, format };
}

/**
 * Get all countries where photo is expected/required
 */
export function getPhotoRequiredRegions(): RegionCode[] {
    return Object.entries(REGIONAL_FORMATS)
        .filter(([_, format]) =>
            format.photo.requirement === 'required' ||
            format.photo.requirement === 'expected'
        )
        .map(([code]) => code as RegionCode);
}

/**
 * Get all countries where photo is discouraged
 */
export function getPhotoDiscouragedRegions(): RegionCode[] {
    return Object.entries(REGIONAL_FORMATS)
        .filter(([_, format]) =>
            format.photo.requirement === 'discouraged' ||
            format.photo.requirement === 'illegal'
        )
        .map(([code]) => code as RegionCode);
}

/**
 * Check if personal info field is required in a region
 */
export function isFieldRequiredInRegion(
    field: keyof RegionalFormat['personalInfo'],
    region: RegionCode
): boolean {
    const format = getRegionalFormat(region);
    return format.personalInfo[field]?.required ?? false;
}

/**
 * Get recommended section order for a region
 */
export function getSectionOrderForRegion(region: RegionCode): string[] {
    return getRegionalFormat(region).sectionOrder;
}

/**
 * Get ATS tips for a region
 */
export function getATSTipsForRegion(region: RegionCode): string[] {
    return getRegionalFormat(region).ats.tips;
}

/**
 * Get document type terminology for region
 */
export function getDocumentType(region: RegionCode): DocumentType {
    return getRegionalFormat(region).documentType;
}

/**
 * Get formality level for region
 */
export function getFormalityLevel(region: RegionCode): 'very_formal' | 'formal' | 'semi_formal' | 'casual' {
    return getRegionalFormat(region).culture.formalityLevel;
}

/**
 * Check if region uses Europass format
 */
export function supportsEuropass(region: RegionCode): boolean {
    const europassRegions: RegionCode[] = ['DE', 'FR', 'ES', 'IT', 'PT', 'BE', 'NL', 'AT', 'PL'];
    return europassRegions.includes(region);
}

/**
 * Get regions grouped by continent
 */
export function getRegionsByContinent(): Record<string, RegionCode[]> {
    return {
        'North America': ['US', 'CA'],
        'Europe': ['UK', 'DE', 'FR', 'ES', 'IT', 'NL', 'BE', 'CH', 'AT', 'SE', 'NO', 'DK', 'FI', 'PL', 'IE', 'PT'],
        'Middle East': ['AE', 'SA', 'QA', 'KW', 'BH', 'OM', 'EG', 'JO', 'LB'],
        'Asia Pacific': ['IN', 'SG', 'AU', 'NZ', 'MY', 'PH', 'ID', 'TH', 'VN', 'JP', 'KR', 'CN', 'HK', 'TW'],
        'Latin America': ['MX', 'BR', 'AR', 'CL', 'CO', 'PE'],
        'Africa': ['ZA', 'NG', 'KE', 'GH']
    };
}

/**
 * Detect region from country name or code
 */
export function detectRegion(input: string): RegionCode {
    const normalized = input.toUpperCase().trim();

    // Direct code match
    if (normalized in REGIONAL_FORMATS) {
        return normalized as RegionCode;
    }

    // Country name mapping
    const countryNameMap: Record<string, RegionCode> = {
        'UNITED STATES': 'US',
        'USA': 'US',
        'AMERICA': 'US',
        'CANADA': 'CA',
        'UNITED KINGDOM': 'UK',
        'ENGLAND': 'UK',
        'BRITAIN': 'UK',
        'GERMANY': 'DE',
        'DEUTSCHLAND': 'DE',
        'FRANCE': 'FR',
        'SPAIN': 'ES',
        'ESPANA': 'ES',
        'ITALY': 'IT',
        'ITALIA': 'IT',
        'NETHERLANDS': 'NL',
        'HOLLAND': 'NL',
        'BELGIUM': 'BE',
        'SWITZERLAND': 'CH',
        'AUSTRIA': 'AT',
        'SWEDEN': 'SE',
        'NORWAY': 'NO',
        'DENMARK': 'DK',
        'FINLAND': 'FI',
        'POLAND': 'PL',
        'IRELAND': 'IE',
        'PORTUGAL': 'PT',
        'UAE': 'AE',
        'UNITED ARAB EMIRATES': 'AE',
        'DUBAI': 'AE',
        'SAUDI ARABIA': 'SA',
        'KSA': 'SA',
        'QATAR': 'QA',
        'KUWAIT': 'KW',
        'BAHRAIN': 'BH',
        'OMAN': 'OM',
        'EGYPT': 'EG',
        'JORDAN': 'JO',
        'LEBANON': 'LB',
        'INDIA': 'IN',
        'SINGAPORE': 'SG',
        'AUSTRALIA': 'AU',
        'NEW ZEALAND': 'NZ',
        'MALAYSIA': 'MY',
        'PHILIPPINES': 'PH',
        'INDONESIA': 'ID',
        'THAILAND': 'TH',
        'VIETNAM': 'VN',
        'JAPAN': 'JP',
        'SOUTH KOREA': 'KR',
        'KOREA': 'KR',
        'CHINA': 'CN',
        'HONG KONG': 'HK',
        'TAIWAN': 'TW',
        'MEXICO': 'MX',
        'BRAZIL': 'BR',
        'BRASIL': 'BR',
        'ARGENTINA': 'AR',
        'CHILE': 'CL',
        'COLOMBIA': 'CO',
        'PERU': 'PE',
        'SOUTH AFRICA': 'ZA',
        'NIGERIA': 'NG',
        'KENYA': 'KE',
        'GHANA': 'GH'
    };

    return countryNameMap[normalized] || 'GLOBAL';
}

/**
 * Get privacy/consent statement required for region
 */
export function getPrivacyStatement(region: RegionCode): string | null {
    const statements: Partial<Record<RegionCode, string>> = {
        IT: 'Autorizzo il trattamento dei miei dati personali ai sensi del D.Lgs. 196/2003 e del GDPR (Regolamento UE 2016/679).',
        PL: 'Wyrażam zgodę na przetwarzanie moich danych osobowych dla potrzeb niezbędnych do realizacji procesu rekrutacji zgodnie z Rozporządzeniem Parlamentu Europejskiego i Rady (UE) 2016/679.',
        DE: 'Ich willige in die Verarbeitung meiner personenbezogenen Daten gemäß DSGVO ein.',
    };

    return statements[region] || null;
}

/**
 * Generate regional formatting recommendations
 */
export function getFormattingRecommendations(region: RegionCode): string[] {
    const format = getRegionalFormat(region);
    const recommendations: string[] = [];

    // Photo recommendation
    if (format.photo.requirement === 'required' || format.photo.requirement === 'expected') {
        recommendations.push(`Include a professional photo (${format.photo.reason})`);
        if (format.photo.placement) {
            recommendations.push(`Place photo at ${format.photo.placement.replace('-', ' ')}`);
        }
    } else if (format.photo.requirement === 'discouraged') {
        recommendations.push(`Do not include a photo (${format.photo.reason})`);
    }

    // Length recommendation
    recommendations.push(`Keep to ${format.typicalLength.description}`);

    // Date format
    recommendations.push(`Use ${format.dateFormat} date format`);

    // Document type
    if (format.documentType === 'cv') {
        recommendations.push('Use "CV" or "Curriculum Vitae" as document title');
    } else if (format.documentType === 'resume') {
        recommendations.push('Use "Resume" as document title');
    }

    // Personal info
    if (format.personalInfo.dateOfBirth.required) {
        recommendations.push('Include date of birth');
    } else if (format.personalInfo.dateOfBirth.reason) {
        recommendations.push(`Date of birth: ${format.personalInfo.dateOfBirth.reason}`);
    }

    // Formality
    if (format.culture.formalityLevel === 'very_formal') {
        recommendations.push('Use formal language and professional tone throughout');
    }

    // Achievement style
    if (format.culture.achievementStyle === 'quantified') {
        recommendations.push('Quantify achievements with specific numbers and metrics');
    } else if (format.culture.achievementStyle === 'modest') {
        recommendations.push('Present achievements modestly, focus on team contributions');
    }

    // Font recommendations
    recommendations.push(`Recommended fonts: ${format.formatting.preferredFonts.join(', ')}`);

    return recommendations;
}

/**
 * Check if resume meets regional requirements
 */
export interface RegionalComplianceCheck {
    isCompliant: boolean;
    warnings: string[];
    suggestions: string[];
    missingRequired: string[];
}

export function checkRegionalCompliance(
    resumeData: {
        hasPhoto?: boolean;
        hasDateOfBirth?: boolean;
        hasNationality?: boolean;
        hasMaritalStatus?: boolean;
        hasGender?: boolean;
        hasAddress?: boolean;
        hasReligion?: boolean;
        pageCount?: number;
    },
    region: RegionCode
): RegionalComplianceCheck {
    const format = getRegionalFormat(region);
    const result: RegionalComplianceCheck = {
        isCompliant: true,
        warnings: [],
        suggestions: [],
        missingRequired: []
    };

    // Photo check
    if (format.photo.requirement === 'required' && !resumeData.hasPhoto) {
        result.missingRequired.push('Photo is required for this region');
        result.isCompliant = false;
    } else if (format.photo.requirement === 'expected' && !resumeData.hasPhoto) {
        result.warnings.push('Photo is expected (though not legally required) for this region');
    } else if (format.photo.requirement === 'discouraged' && resumeData.hasPhoto) {
        result.suggestions.push('Consider removing photo - discouraged in this region');
    }

    // DOB check
    if (format.personalInfo.dateOfBirth.required && !resumeData.hasDateOfBirth) {
        result.warnings.push('Date of birth is commonly expected in this region');
    } else if (!format.personalInfo.dateOfBirth.required && resumeData.hasDateOfBirth && format.personalInfo.dateOfBirth.reason) {
        result.suggestions.push(`Consider removing date of birth: ${format.personalInfo.dateOfBirth.reason}`);
    }

    // Nationality check
    if (format.personalInfo.nationality.required && !resumeData.hasNationality) {
        result.warnings.push('Nationality should be included for this region');
    }

    // Marital status check
    if (format.personalInfo.maritalStatus.required && !resumeData.hasMaritalStatus) {
        result.warnings.push('Marital status is expected in this region');
    } else if (!format.personalInfo.maritalStatus.required && resumeData.hasMaritalStatus) {
        result.suggestions.push('Marital status not required - consider removing');
    }

    // Page count check
    if (resumeData.pageCount) {
        if (resumeData.pageCount > format.typicalLength.pages + 1) {
            result.warnings.push(`Resume length (${resumeData.pageCount} pages) exceeds regional norm (${format.typicalLength.description})`);
        }
    }

    return result;
}

// Export default for convenience
export default {
    REGIONAL_FORMATS,
    getRegionalFormat,
    formatDateForRegion,
    getPhotoRequiredRegions,
    getPhotoDiscouragedRegions,
    isFieldRequiredInRegion,
    getSectionOrderForRegion,
    getATSTipsForRegion,
    getDocumentType,
    getFormalityLevel,
    supportsEuropass,
    getRegionsByContinent,
    detectRegion,
    getPrivacyStatement,
    getFormattingRecommendations,
    checkRegionalCompliance
};
