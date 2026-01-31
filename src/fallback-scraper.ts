/**
 * Fallback Resume Scraper
 * Rule-based parsing when AI fails - NEVER invents data
 */

export interface ScrapedResumeData {
    name: string | null;
    email: string | null;
    phone: string | null;
    linkedin: string | null;
    github: string | null;
    skills: string[];
    experienceBlocks: ExperienceBlock[];
    educationBlocks: EducationBlock[];
    confidence: ScrapingConfidence;
    warnings: string[];
}

export interface ExperienceBlock {
    title: string | null;
    company: string | null;
    dateRange: string | null;
    bullets: string[];
}

export interface EducationBlock {
    degree: string | null;
    institution: string | null;
    year: string | null;
}

export interface ScrapingConfidence {
    overall: 'high' | 'medium' | 'low';
    fields: Record<string, 'detected' | 'guessed' | 'not_found'>;
}

// ═══════════════════════════════════════════════════════════════
// REGEX PATTERNS
// ═══════════════════════════════════════════════════════════════

const PATTERNS = {
    // Email: Standard RFC-like pattern
    email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    
    // Phone: Various international formats
    phone: /(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}/g,
    
    // LinkedIn URL
    linkedin: /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[\w-]+\/?/gi,
    
    // GitHub URL
    github: /(?:https?:\/\/)?(?:www\.)?github\.com\/[\w-]+\/?/gi,
    
    // Date patterns (Month Year - Month Year or Present)
    dateRange: /(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s*['']?\d{2,4}\s*[-–—to]+\s*(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?|Present|Current|Now)\s*['']?\d{0,4}/gi,
    
    // Year only pattern
    year: /\b(19|20)\d{2}\b/g,
    
    // Education keywords
    educationKeywords: /\b(bachelor|master|phd|doctorate|b\.?s\.?|m\.?s\.?|b\.?a\.?|m\.?a\.?|b\.?e\.?|m\.?e\.?|b\.?tech|m\.?tech|mba|diploma|certificate)\b/gi,
    
    // Job title patterns
    jobTitle: /\b(engineer|developer|manager|analyst|designer|architect|lead|director|consultant|specialist|coordinator|administrator|executive|officer|intern)\b/gi,
    
    // Company indicators
    companyIndicators: /\b(inc\.?|corp\.?|ltd\.?|llc|pvt\.?|limited|technologies|solutions|systems|services|consulting|labs?|studio)\b/gi,
    
    // Bullet point starters
    bulletStart: /^[\s]*[•\-\*\>\✓\●\○\◆\◇\►]/,
    
    // Skills separators
    skillsSeparator: /[,;|•\n]+/
};

// Common skill keywords for extraction
const SKILL_KEYWORDS = [
    // Programming
    'python', 'java', 'javascript', 'typescript', 'c++', 'c#', 'ruby', 'go', 'rust', 'php',
    'swift', 'kotlin', 'scala', 'r', 'matlab', 'perl', 'shell', 'bash',
    // Frameworks
    'react', 'angular', 'vue', 'node', 'express', 'django', 'flask', 'spring', 'rails',
    'laravel', 'next.js', 'nuxt', 'svelte', 'fastapi', 'graphql',
    // Databases
    'sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch', 'dynamodb',
    'cassandra', 'oracle', 'firebase', 'sqlite',
    // Cloud & DevOps
    'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'terraform', 'ansible',
    'ci/cd', 'github actions', 'gitlab', 'circleci',
    // Data & ML
    'machine learning', 'deep learning', 'tensorflow', 'pytorch', 'pandas', 'numpy',
    'scikit-learn', 'spark', 'hadoop', 'tableau', 'power bi',
    // Tools
    'git', 'jira', 'confluence', 'slack', 'figma', 'sketch', 'postman', 'swagger',
    // Soft skills
    'agile', 'scrum', 'kanban', 'leadership', 'communication'
];

// ═══════════════════════════════════════════════════════════════
// MAIN SCRAPER FUNCTION
// ═══════════════════════════════════════════════════════════════

export function scrapeResumeText(text: string): ScrapedResumeData {
    const warnings: string[] = [];
    const confidence: ScrapingConfidence = {
        overall: 'medium',
        fields: {}
    };

    // Clean text
    const cleanText = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const lines = cleanText.split('\n').map(l => l.trim()).filter(l => l.length > 0);

    // Extract each field
    const email = extractEmail(cleanText, confidence, warnings);
    const phone = extractPhone(cleanText, confidence, warnings);
    const linkedin = extractLinkedIn(cleanText, confidence, warnings);
    const github = extractGitHub(cleanText, confidence, warnings);
    const name = extractName(lines, email, confidence, warnings);
    const skills = extractSkills(cleanText, confidence, warnings);
    const experienceBlocks = extractExperience(lines, confidence, warnings);
    const educationBlocks = extractEducation(lines, confidence, warnings);

    // Calculate overall confidence
    const detectedCount = Object.values(confidence.fields).filter(v => v === 'detected').length;
    const totalFields = Object.keys(confidence.fields).length;

    if (detectedCount / totalFields >= 0.7) {
        confidence.overall = 'high';
    } else if (detectedCount / totalFields >= 0.4) {
        confidence.overall = 'medium';
    } else {
        confidence.overall = 'low';
        warnings.push('Auto-detection had limited success. Please verify all fields.');
    }

    return {
        name,
        email,
        phone,
        linkedin,
        github,
        skills,
        experienceBlocks,
        educationBlocks,
        confidence,
        warnings
    };
}

// ═══════════════════════════════════════════════════════════════
// FIELD EXTRACTORS
// ═══════════════════════════════════════════════════════════════

function extractEmail(text: string, conf: ScrapingConfidence, warnings: string[]): string | null {
    const matches = text.match(PATTERNS.email);
    if (matches && matches.length > 0) {
        conf.fields.email = 'detected';
        // Return the first email that looks professional
        const professionalEmail = matches.find(e => 
            !e.includes('example') && 
            !e.includes('test') &&
            !e.includes('noreply')
        );
        return professionalEmail || matches[0];
    }
    conf.fields.email = 'not_found';
    warnings.push('Could not detect email address.');
    return null;
}

function extractPhone(text: string, conf: ScrapingConfidence, warnings: string[]): string | null {
    const matches = text.match(PATTERNS.phone);
    if (matches && matches.length > 0) {
        // Filter out year-like numbers
        const validPhones = matches.filter(p => {
            const digits = p.replace(/\D/g, '');
            return digits.length >= 10 && digits.length <= 15;
        });
        if (validPhones.length > 0) {
            conf.fields.phone = 'detected';
            return validPhones[0];
        }
    }
    conf.fields.phone = 'not_found';
    return null;
}

function extractLinkedIn(text: string, conf: ScrapingConfidence, _warnings: string[]): string | null {
    const matches = text.match(PATTERNS.linkedin);
    if (matches && matches.length > 0) {
        conf.fields.linkedin = 'detected';
        return matches[0];
    }
    conf.fields.linkedin = 'not_found';
    return null;
}

function extractGitHub(text: string, conf: ScrapingConfidence, _warnings: string[]): string | null {
    const matches = text.match(PATTERNS.github);
    if (matches && matches.length > 0) {
        conf.fields.github = 'detected';
        return matches[0];
    }
    conf.fields.github = 'not_found';
    return null;
}

function extractName(lines: string[], email: string | null, conf: ScrapingConfidence, warnings: string[]): string | null {
    // Strategy 1: First line that looks like a name
    for (let i = 0; i < Math.min(5, lines.length); i++) {
        const line = lines[i];
        
        // Skip if it's an email, phone, or URL
        if (PATTERNS.email.test(line) || PATTERNS.phone.test(line) || /http|www\.|@/.test(line)) {
            continue;
        }
        
        // Check if it looks like a name (2-4 words, mostly letters)
        const words = line.split(/\s+/);
        if (words.length >= 2 && words.length <= 4) {
            const isName = words.every(w => /^[A-Za-z\.\-']+$/.test(w) && w.length > 1);
            if (isName && line.length <= 50) {
                conf.fields.name = 'detected';
                return line;
            }
        }
    }

    // Strategy 2: Extract from email
    if (email) {
        const localPart = email.split('@')[0];
        const nameParts = localPart.split(/[._-]/).filter(p => p.length > 1);
        if (nameParts.length >= 2) {
            conf.fields.name = 'guessed';
            warnings.push('Name guessed from email. Please verify.');
            return nameParts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
        }
    }

    conf.fields.name = 'not_found';
    warnings.push('Could not detect name. Please fill manually.');
    return null;
}

function extractSkills(text: string, conf: ScrapingConfidence, warnings: string[]): string[] {
    const foundSkills: string[] = [];
    const lowerText = text.toLowerCase();

    // Strategy 1: Look for skills section
    const skillsSectionMatch = text.match(/skills?[:\s]*\n([^\n]+(?:\n[^\n]+)*)/i);
    if (skillsSectionMatch) {
        const skillsText = skillsSectionMatch[1];
        const tokens = skillsText.split(PATTERNS.skillsSeparator)
            .map(s => s.trim())
            .filter(s => s.length > 1 && s.length < 30);
        foundSkills.push(...tokens);
    }

    // Strategy 2: Match known skill keywords
    SKILL_KEYWORDS.forEach(skill => {
        if (lowerText.includes(skill.toLowerCase()) && !foundSkills.some(s => s.toLowerCase() === skill.toLowerCase())) {
            foundSkills.push(skill);
        }
    });

    // Deduplicate and clean
    const uniqueSkills = [...new Set(foundSkills.map(s => s.toLowerCase()))]
        .map(s => s.charAt(0).toUpperCase() + s.slice(1))
        .slice(0, 25);

    if (uniqueSkills.length >= 5) {
        conf.fields.skills = 'detected';
    } else if (uniqueSkills.length > 0) {
        conf.fields.skills = 'guessed';
        warnings.push('Limited skills detected. Add more manually.');
    } else {
        conf.fields.skills = 'not_found';
        warnings.push('Could not detect skills section.');
    }

    return uniqueSkills;
}

function extractExperience(lines: string[], conf: ScrapingConfidence, warnings: string[]): ExperienceBlock[] {
    const blocks: ExperienceBlock[] = [];
    let currentBlock: ExperienceBlock | null = null;
    let inExperienceSection = false;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const lowerLine = line.toLowerCase();

        // Detect experience section start
        if (/^(work\s*)?experience|employment|professional\s*experience/i.test(line)) {
            inExperienceSection = true;
            continue;
        }

        // Detect section end
        if (inExperienceSection && /^(education|skills|projects|certifications|achievements)/i.test(line)) {
            if (currentBlock) {
                blocks.push(currentBlock);
            }
            inExperienceSection = false;
            continue;
        }

        if (!inExperienceSection) continue;

        // Look for date range (indicates new entry)
        const dateMatch = line.match(PATTERNS.dateRange);
        if (dateMatch) {
            // Save previous block
            if (currentBlock) {
                blocks.push(currentBlock);
            }

            // Start new block
            currentBlock = {
                title: null,
                company: null,
                dateRange: dateMatch[0],
                bullets: []
            };

            // Try to extract title from same line or previous line
            const beforeDate = line.slice(0, line.indexOf(dateMatch[0])).trim();
            if (beforeDate && PATTERNS.jobTitle.test(beforeDate)) {
                currentBlock.title = beforeDate;
            } else if (i > 0 && PATTERNS.jobTitle.test(lines[i - 1])) {
                currentBlock.title = lines[i - 1];
            }
            continue;
        }

        // Look for bullets
        if (currentBlock && PATTERNS.bulletStart.test(line)) {
            const bulletText = line.replace(PATTERNS.bulletStart, '').trim();
            if (bulletText.length > 10) {
                currentBlock.bullets.push(bulletText);
            }
            continue;
        }

        // Try to detect company name
        if (currentBlock && !currentBlock.company && PATTERNS.companyIndicators.test(line)) {
            currentBlock.company = line;
        }
    }

    // Don't forget last block
    if (currentBlock) {
        blocks.push(currentBlock);
    }

    if (blocks.length > 0) {
        conf.fields.experience = 'detected';
    } else {
        conf.fields.experience = 'not_found';
        warnings.push('Could not detect experience section.');
    }

    return blocks;
}

function extractEducation(lines: string[], conf: ScrapingConfidence, warnings: string[]): EducationBlock[] {
    const blocks: EducationBlock[] = [];
    let inEducationSection = false;
    let currentBlock: EducationBlock | null = null;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Detect education section
        if (/^education/i.test(line)) {
            inEducationSection = true;
            continue;
        }

        // Detect section end
        if (inEducationSection && /^(experience|skills|projects|certifications)/i.test(line)) {
            if (currentBlock) blocks.push(currentBlock);
            inEducationSection = false;
            continue;
        }

        if (!inEducationSection) continue;

        // Look for degree keywords
        if (PATTERNS.educationKeywords.test(line)) {
            if (currentBlock) blocks.push(currentBlock);
            
            currentBlock = {
                degree: line,
                institution: null,
                year: null
            };

            // Look for year on same or next line
            const yearMatch = line.match(PATTERNS.year);
            if (yearMatch) {
                currentBlock.year = yearMatch[0];
            }
            continue;
        }

        // Look for institution (usually has University, College, Institute)
        if (currentBlock && !currentBlock.institution && /university|college|institute|school/i.test(line)) {
            currentBlock.institution = line;
            
            // Check for year
            const yearMatch = line.match(PATTERNS.year);
            if (yearMatch && !currentBlock.year) {
                currentBlock.year = yearMatch[0];
            }
        }
    }

    if (currentBlock) blocks.push(currentBlock);

    if (blocks.length > 0) {
        conf.fields.education = 'detected';
    } else {
        conf.fields.education = 'not_found';
        warnings.push('Could not detect education section.');
    }

    return blocks;
}

// ═══════════════════════════════════════════════════════════════
// CONVERT SCRAPED DATA TO RESUME FORMAT
// ═══════════════════════════════════════════════════════════════

export function convertScrapedToResumeData(scraped: ScrapedResumeData): Partial<{
    basics: {
        fullName: string;
        email: string;
        phone: string;
        linkedin: string;
        github: string;
        targetRole: string;
    };
    summary: string;
    experience: Array<{
        id: string;
        company: string;
        position: string;
        startDate: string;
        endDate: string;
        highlights: string[];
    }>;
    education: Array<{
        id: string;
        institution: string;
        degree: string;
        field: string;
        graduationDate: string;
    }>;
    skills: string[];
}> {
    return {
        basics: {
            fullName: scraped.name || '',
            email: scraped.email || '',
            phone: scraped.phone || '',
            linkedin: scraped.linkedin || '',
            github: scraped.github || '',
            targetRole: ''
        },
        summary: '',
        experience: scraped.experienceBlocks.map((block, i) => ({
            id: `exp-${i}-${Date.now()}`,
            company: block.company || '',
            position: block.title || '',
            startDate: parseStartDate(block.dateRange),
            endDate: parseEndDate(block.dateRange),
            highlights: block.bullets
        })),
        education: scraped.educationBlocks.map((block, i) => ({
            id: `edu-${i}-${Date.now()}`,
            institution: block.institution || '',
            degree: block.degree || '',
            field: '',
            graduationDate: block.year || ''
        })),
        skills: scraped.skills
    };
}

function parseStartDate(dateRange: string | null): string {
    if (!dateRange) return '';
    const parts = dateRange.split(/[-–—to]+/);
    return parts[0]?.trim() || '';
}

function parseEndDate(dateRange: string | null): string {
    if (!dateRange) return '';
    const parts = dateRange.split(/[-–—to]+/);
    const end = parts[1]?.trim() || '';
    if (/present|current|now/i.test(end)) return 'Present';
    return end;
}

// ═══════════════════════════════════════════════════════════════
// ERROR MESSAGE FOR UI
// ═══════════════════════════════════════════════════════════════

export function getScrapingMessage(scraped: ScrapedResumeData): {
    title: string;
    message: string;
    type: 'success' | 'warning' | 'info';
} {
    const { confidence, warnings } = scraped;

    if (confidence.overall === 'high') {
        return {
            title: 'Resume Parsed Successfully',
            message: 'Most fields were detected. Please verify the information is correct.',
            type: 'success'
        };
    }

    if (confidence.overall === 'medium') {
        return {
            title: 'Partial Detection',
            message: `Some fields need manual entry. ${warnings[0] || 'Please review all fields.'}`,
            type: 'warning'
        };
    }

    return {
        title: 'Manual Entry Recommended',
        message: 'Auto-detection had limited success. Please fill in the fields manually.',
        type: 'info'
    };
}
