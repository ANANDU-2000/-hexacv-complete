/**
 * UX Guidance Text System
 * Human-first, honest language - NO marketing speak
 */

// ═══════════════════════════════════════════════════════════════
// STEP-BY-STEP GUIDANCE
// ═══════════════════════════════════════════════════════════════

export const STEP_GUIDANCE = {
    step1: {
        title: 'Upload Your Resume',
        subtitle: 'Start with what you have',
        description: 'Upload your existing resume or start fresh. We\'ll help you improve it.',
        tips: [
            'PDF works best for accurate parsing',
            'We extract text - formatting may change',
            'Review all fields after upload'
        ]
    },
    step2: {
        title: 'Edit Your Details',
        subtitle: 'Make every word count',
        description: 'Refine your content. Focus on achievements and relevant skills.',
        tips: [
            'Use action verbs to start bullets',
            'Add numbers to show impact',
            'Paste a job description for keyword matching'
        ]
    },
    step3: {
        title: 'Choose a Template',
        subtitle: 'Professional formatting matters',
        description: 'Select a clean, ATS-friendly template that presents your content clearly.',
        tips: [
            'Simple layouts parse better in ATS systems',
            'Avoid graphics-heavy templates',
            'All templates are tested for readability'
        ]
    },
    step4: {
        title: 'Review & Download',
        subtitle: 'Final check before sending',
        description: 'Review your complete resume. Check for errors before downloading.',
        tips: [
            'Read through every section',
            'Check dates and contact info',
            'Download as PDF for best results'
        ]
    }
};

// ═══════════════════════════════════════════════════════════════
// FIELD-SPECIFIC GUIDANCE (Honest, practical)
// ═══════════════════════════════════════════════════════════════

export const FIELD_GUIDANCE = {
    targetRole: {
        label: 'Target Role',
        placeholder: 'e.g., Software Engineer, Product Manager',
        help: 'Use the exact job title from the posting when possible.',
        whyItMatters: 'Recruiters search by job title. Matching titles get seen first.',
        doThis: 'Use standard industry titles',
        avoidThis: 'Creative titles like "Code Ninja"'
    },
    jobDescription: {
        label: 'Job Description (Optional)',
        placeholder: 'Paste the full job description here...',
        help: 'We\'ll match your resume against keywords in the JD.',
        whyItMatters: 'Shows you exactly which keywords match and which are missing.',
        doThis: 'Paste the complete requirements section',
        avoidThis: 'Just the company name or job title'
    },
    fullName: {
        label: 'Full Name',
        placeholder: 'Your professional name',
        help: 'This appears at the top of your resume.',
        whyItMatters: 'Makes it easy for recruiters to identify and remember you.',
        doThis: 'Use the name you go by professionally',
        avoidThis: 'Nicknames or incomplete names'
    },
    email: {
        label: 'Email',
        placeholder: 'professional@email.com',
        help: 'How recruiters will contact you.',
        whyItMatters: 'This is the primary way employers reach out.',
        doThis: 'Use a professional email (firstname.lastname@)',
        avoidThis: 'Unprofessional addresses or old email providers'
    },
    phone: {
        label: 'Phone (Optional)',
        placeholder: '+1 (555) 000-0000',
        help: 'For quick follow-up calls.',
        whyItMatters: 'Some recruiters prefer to call. Include if comfortable.',
        doThis: 'Include country code for international roles',
        avoidThis: 'Work phone numbers'
    },
    summary: {
        label: 'Professional Summary',
        placeholder: 'Experienced [role] with [X] years in [industry]. Skilled in [key skills]. Achieved [notable result].',
        help: '2-3 sentences highlighting your value.',
        whyItMatters: 'Recruiters spend 6-7 seconds on initial scan. This is your hook.',
        doThis: 'Lead with your strongest qualification',
        avoidThis: 'Generic phrases like "hard-working professional"'
    },
    experience: {
        label: 'Work Experience',
        help: 'Focus on achievements, not just duties.',
        whyItMatters: 'This section carries the most weight for experienced candidates.',
        doThis: 'Start each bullet with an action verb',
        avoidThis: '"Responsible for..." or "Duties included..."'
    },
    skills: {
        label: 'Skills',
        placeholder: 'Add skill...',
        help: 'Technical and professional skills relevant to the role.',
        whyItMatters: 'Skills get matched against job requirements. Be specific.',
        doThis: 'List tools and technologies by name',
        avoidThis: 'Soft skills without context'
    },
    education: {
        label: 'Education',
        help: 'Degrees and relevant certifications.',
        whyItMatters: 'Required for some roles. Less important as experience grows.',
        doThis: 'Include degree, school, and year',
        avoidThis: 'High school if you have higher education'
    },
    projects: {
        label: 'Projects',
        help: 'Personal or professional projects that demonstrate skills.',
        whyItMatters: 'Great for recent graduates or career changers.',
        doThis: 'Include tech stack and your specific contribution',
        avoidThis: 'Group projects where your role is unclear'
    }
};

// ═══════════════════════════════════════════════════════════════
// BULLET WRITING GUIDANCE
// ═══════════════════════════════════════════════════════════════

export const BULLET_GUIDANCE = {
    formula: 'Action Verb + Task + Result/Impact',
    examples: {
        good: [
            'Developed REST API serving 10K+ daily users, reducing response time by 40%',
            'Led team of 5 engineers to deliver payment feature 2 weeks ahead of schedule',
            'Automated deployment pipeline, reducing release time from 2 hours to 15 minutes'
        ],
        bad: [
            'Responsible for API development',
            'Worked on various projects',
            'Helped the team with tasks'
        ]
    },
    actionVerbs: {
        technical: ['Built', 'Developed', 'Implemented', 'Architected', 'Optimized', 'Automated', 'Deployed', 'Integrated'],
        leadership: ['Led', 'Managed', 'Coordinated', 'Mentored', 'Directed', 'Supervised', 'Guided'],
        achievement: ['Increased', 'Reduced', 'Improved', 'Grew', 'Saved', 'Generated', 'Exceeded'],
        analysis: ['Analyzed', 'Evaluated', 'Researched', 'Assessed', 'Identified', 'Discovered']
    },
    tips: [
        'Start with the strongest verb',
        'Include specific numbers when possible',
        'Focus on impact, not just activities',
        'Keep bullets under 2 lines'
    ]
};

// ═══════════════════════════════════════════════════════════════
// ERROR MESSAGES (Clear, helpful, not scary)
// ═══════════════════════════════════════════════════════════════

export const ERROR_MESSAGES = {
    validation: {
        required: (field: string) => `${field} is required`,
        tooShort: (field: string, min: number) => `${field} should be at least ${min} characters`,
        tooLong: (field: string, max: number) => `${field} should be under ${max} characters`,
        invalidFormat: (field: string) => `Please enter a valid ${field}`,
        invalidCharacters: (field: string) => `${field} contains invalid characters`
    },
    upload: {
        fileType: 'Please upload a PDF or DOCX file',
        fileSize: 'File is too large. Maximum size is 5MB.',
        parseError: 'Could not read this file. Try a different format.',
        partial: 'Some fields could not be detected. Please review and fill in manually.'
    },
    ai: {
        unavailable: 'AI suggestions are temporarily unavailable. Your resume was saved with rule-based formatting.',
        timeout: 'Request took too long. Please try again.',
        rateLimit: 'Too many requests. Please wait a moment before trying again.'
    },
    payment: {
        failed: 'Payment could not be processed. No charges were made.',
        cancelled: 'Payment was cancelled. Your progress is saved.',
        timeout: 'Payment session expired. Please try again.'
    },
    general: {
        networkError: 'Could not connect to server. Check your internet connection.',
        unexpectedError: 'Something went wrong. Your work is saved. Please refresh the page.'
    }
};

// ═══════════════════════════════════════════════════════════════
// SUCCESS MESSAGES
// ═══════════════════════════════════════════════════════════════

export const SUCCESS_MESSAGES = {
    upload: 'Resume uploaded successfully. Please review the extracted information.',
    save: 'Changes saved',
    download: 'Your resume is ready. Check your downloads folder.',
    payment: 'Payment successful. You can now download the premium template.',
    feedback: 'Thanks for your feedback!'
};

// ═══════════════════════════════════════════════════════════════
// ATS EXPLANATION (Honest, no hype)
// ═══════════════════════════════════════════════════════════════

export const ATS_EXPLANATION = {
    whatItIs: 'ATS (Applicant Tracking System) is software that employers use to filter resumes before humans see them.',
    howItWorks: 'ATS scans for keywords matching the job description. Resumes without key terms may be filtered out.',
    whatWeDo: 'We compare your resume against the job description and show which keywords match.',
    whatWeDontDo: 'We don\'t guarantee you\'ll pass any specific ATS or get hired. We help you improve your chances.',
    honestTruth: 'Good content matters more than tricks. Focus on clearly describing your real experience and skills.'
};

// ═══════════════════════════════════════════════════════════════
// TEMPLATE SELECTION GUIDANCE
// ═══════════════════════════════════════════════════════════════

export const TEMPLATE_GUIDANCE = {
    general: 'Choose a template that presents your content clearly. Fancy designs don\'t help and may hurt.',
    byRole: {
        technical: 'Tech roles: Use clean layouts that emphasize skills and projects.',
        business: 'Business roles: Use professional layouts with clear section hierarchy.',
        creative: 'Creative roles: Simple layouts work for most applications. Save creative designs for portfolios.'
    },
    atsConsideration: 'All our templates are tested for ATS compatibility. They use standard sections and clean formatting.'
};

// ═══════════════════════════════════════════════════════════════
// FALLBACK MESSAGES (When AI fails)
// ═══════════════════════════════════════════════════════════════

export const FALLBACK_MESSAGES = {
    aiUnavailable: {
        title: 'AI Unavailable',
        message: 'We couldn\'t generate AI suggestions right now. We\'ve applied rule-based improvements instead.',
        action: 'Review the changes and edit as needed.'
    },
    partialParse: {
        title: 'Partial Detection',
        message: 'We detected some information from your resume but not everything.',
        action: 'Please fill in the missing fields manually.'
    },
    noKeywords: {
        title: 'No JD Provided',
        message: 'Paste a job description to see keyword matching.',
        action: 'We can\'t show gaps without knowing what role you\'re targeting.'
    }
};

// ═══════════════════════════════════════════════════════════════
// PRICING TRANSPARENCY
// ═══════════════════════════════════════════════════════════════

export const PRICING_MESSAGES = {
    free: {
        includes: 'Free template with basic formatting. Small watermark.',
        limitations: 'One template option. Includes branding watermark.'
    },
    paid: {
        includes: 'Premium templates. No watermark. Full formatting options.',
        value: 'One-time payment. Download as many times as you want.',
        guarantee: 'Not satisfied? Contact us for support.'
    },
    transparency: 'Prices are shown before checkout. No hidden fees.'
};

// ═══════════════════════════════════════════════════════════════
// HELPER FUNCTION TO GET GUIDANCE
// ═══════════════════════════════════════════════════════════════

export function getFieldGuidance(fieldName: string): typeof FIELD_GUIDANCE.targetRole | null {
    return FIELD_GUIDANCE[fieldName as keyof typeof FIELD_GUIDANCE] || null;
}

export function getErrorMessage(category: keyof typeof ERROR_MESSAGES, key: string): string {
    const categoryMessages = ERROR_MESSAGES[category];
    if (typeof categoryMessages === 'object' && key in categoryMessages) {
        const message = categoryMessages[key as keyof typeof categoryMessages];
        return typeof message === 'function' ? message('field') : message;
    }
    return 'An error occurred';
}
