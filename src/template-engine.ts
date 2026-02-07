import { ResumeData } from './types';
import { extractJDKeywords } from './services/openaiService';
// PDF generation uses window.print() with proper DOM/font waiting
// html2pdf.js was removed - it rasterizes text which is bad for ATS

// ============================================
// SECURITY: HTML Escaping to prevent XSS
// ============================================

/**
 * Escape HTML special characters to prevent XSS attacks
 * All user-provided content MUST be escaped before insertion
 */
function escapeHTML(str: string | undefined | null): string {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

/**
 * Escape HTML in an array of strings
 */
function escapeHTMLArray(arr: string[] | undefined | null): string[] {
    if (!arr) return [];
    return arr.map(escapeHTML);
}

// ============================================
// URL NORMALIZATION FOR CONTACT LINE
// ============================================

/**
 * Normalize URL for display in contact line
 * - Removes https://, http://, www.
 * - Shortens long paths
 * - Keeps domain + username only
 * 
 * RULE: Contact line must be ONE line, no overflow
 */
function normalizeUrl(url: string | undefined | null, type: 'linkedin' | 'github' | 'other' = 'other'): string {
    if (!url) return '';

    let clean = url
        .replace(/^https?:\/\//, '')  // Remove protocol
        .replace(/^www\./, '')         // Remove www.
        .replace(/\/$/, '');           // Remove trailing slash

    // For LinkedIn: keep linkedin.com/in/username
    if (type === 'linkedin' && clean.includes('linkedin.com')) {
        const match = clean.match(/linkedin\.com\/in\/([^/]+)/);
        if (match) {
            clean = `linkedin.com/in/${match[1]}`;
        }
    }

    // For GitHub: keep github.com/username
    if (type === 'github' && clean.includes('github.com')) {
        const match = clean.match(/github\.com\/([^/]+)/);
        if (match) {
            clean = `github.com/${match[1]}`;
        }
    }

    return clean;
}

// ============================================
// KEYWORD HIGHLIGHTING
// ============================================

/**
 * Bold keywords in text (ATS-safe - uses <strong> tags)
 * Keywords are matched case-insensitively and wrapped in <strong>
 */
function boldKeywords(text: string, keywords: string[]): string {
    if (!text || !keywords || keywords.length === 0) return escapeHTML(text);

    let result = escapeHTML(text);

    // Sort keywords by length (longest first) to avoid partial replacements
    const sortedKeywords = [...keywords].sort((a, b) => b.length - a.length);

    sortedKeywords.forEach(keyword => {
        // Escape special regex characters in keyword
        const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        // Match word boundaries for cleaner highlighting
        const regex = new RegExp(`\\b(${escapedKeyword})\\b`, 'gi');
        result = result.replace(regex, '<strong>$1</strong>');
    });

    return result;
}

// ============================================
// RENDER FUNCTIONS
// ============================================

/**
 * Render Experience Entries
 * Outputs ATS-safe HTML with FIXED two-column layout:
 * - Role LEFT (70%) | Date RIGHT (30%) - using table display
 * - Company below role
 * - Bullets as list items
 * Keywords are highlighted with bold text
 * 
 * CRITICAL: Dates must be structurally separated, NOT styled inline
 * This ensures ATS parsers correctly identify date information
 */
function renderExperience(experiences: ResumeData['experience'], keywords: string[] = []): string {
    if (!experiences || experiences.length === 0) return '';

    return experiences.map(exp => {
        const startDate = escapeHTML(exp.startDate || '');
        const endDate = escapeHTML(exp.endDate || 'Present');
        const dateStr = startDate ? `${startDate} - ${endDate}` : '';
        const bullets = (exp as any).highlights || (exp as any).bullets || [];
        const role = escapeHTML((exp as any).position || (exp as any).role || '');
        const company = escapeHTML(exp.company);

        // New ATS-Optimized Structure
        return `
            <div class="experience-entry">
                <div class="entry-header">
                    <div class="left-col">
                        <span class="job-title">${role}</span>
                        <span class="company-info">${company}</span>
                    </div>
                    <div class="right-col">
                        <span class="date-range">${dateStr}</span>
                    </div>
                </div>
                ${bullets.length > 0 ? `<ul>
                    ${bullets.map((b: string) => `<li>${boldKeywords(b, keywords)}</li>`).join('\n                    ')}
                </ul>` : ''}
            </div>
        `.trim();
    }).join('\n\n        ');
}

/**
 * Render Skills List
 * Templates should use CSS to style skills appropriately
 * Engine provides both formats: comma-separated and list items
 */
function renderSkills(skills: ResumeData['skills'], templateName?: string): string {
    if (!skills || skills.length === 0) return '';

    let skillList: string[];

    // Handle new string[] skills
    if (typeof skills[0] === 'string') {
        skillList = escapeHTMLArray(skills as unknown as string[]);
    } else {
        // Handle old {category, items}[] skills
        const categories = skills as unknown as { category: string; items: string[] }[];
        skillList = escapeHTMLArray(categories.flatMap(s => s.items.filter(Boolean)));
    }

    // Template-specific rendering (kept for backward compatibility)
    // TODO: Move this logic to templates via CSS classes
    if (templateName === 'template3' || templateName === 'template2') {
        return skillList.map(item => `<li>${item}</li>`).join('\n                        ');
    }
    if (templateName === 'modern' || templateName === 'executive') {
        return skillList.map(item => `<div class="skill-item">${item}</div>`).join('\n                    ');
    }

    // Default: comma-separated (works for most templates)
    return skillList.join(', ');
}

/**
 * Render Projects
 * Outputs ATS-safe HTML with project name/date on first line, then bullets
 * Keywords are highlighted with bold text
 */
function renderProjects(projects: ResumeData['projects'], keywords: string[] = []): string {
    if (!projects || projects.length === 0) return '';

    return projects.map(proj => {
        const dateRange = (proj as any).startDate && (proj as any).endDate
            ? `${escapeHTML((proj as any).startDate)} - ${escapeHTML((proj as any).endDate)}`
            : (proj as any).date ? escapeHTML((proj as any).date) : '';
        const name = escapeHTML(proj.name);
        const description = (proj as any).description ? escapeHTML((proj as any).description) : '';
        const highlights = (proj as any).highlights || [];

        return `
        <div class="project-entry">
            <div class="entry-header">
                <div class="left-col">
                    <span class="project-title">${name}</span>
                </div>
                <div class="right-col">
                    ${dateRange ? `<span class="project-date">${dateRange}</span>` : ''}
                </div>
            </div>
            ${description ? `<div class="entry-content">${description}</div>` : ''}
            ${highlights.length > 0 ? `<ul>
                ${highlights.map((h: string) => `<li>${boldKeywords(h, keywords)}</li>`).join('\n                ')}
            </ul>` : ''}
        </div>
    `.trim();
    }).join('\n\n        ');
}

/**
 * Render Projects Sections
 */
function renderProjectsSection(projects: ResumeData['projects']): string {
    if (!projects || projects.length === 0) return '';
    return `
    <div class="section projects-section">
        <div class="section-title">PROJECTS</div>
        ${renderProjects(projects)}
    </div>
    `;
}

/**
 * Render Education Entries
 * Outputs ATS-safe HTML with FIXED two-column layout:
 * - Degree LEFT (70%) | Year RIGHT (30%) - using table display
 * - Institution below degree
 * 
 * CRITICAL: Years must be structurally separated, NOT styled inline
 */
function renderEducation(education: ResumeData['education']): string {
    if (!education || education.length === 0) return '';

    return education.map(edu => {
        const year = escapeHTML((edu as any).graduationDate || (edu as any).year || '');
        const institution = escapeHTML((edu as any).institution || '');
        const degree = escapeHTML((edu as any).degree || '');

        // ATS Critical Fix: Right Aligned Date, Italic Institution
        return `
            <div class="education-entry">
                <div class="entry-header">
                    <div class="left-col">
                        <span class="degree">${degree}</span>
                         <span class="institution">${institution}</span>
                    </div>
                    <div class="right-col">
                        <span class="date">${year}</span>
                    </div>
                </div>
            </div>
            `.trim();
    }).join('\n\n        ');
}

/**
 * Render Languages
 */
function renderLanguages(languages?: string[]): string {
    if (!languages || languages.length === 0) return '';
    return escapeHTMLArray(languages).map(lang => `< li > ${lang} </li>`).join('\n                    ');
}

/**
 * Render Certifications
 */
function renderCertifications(certifications?: any): string {
    if (!certifications || certifications.length === 0) return '';

    return certifications.map((cert: any) => `
        <div class="entry">
            <div class="row">
                <div class="row-left">
                    <div>${escapeHTML(cert.name)}</div>
                    <div class="company">${escapeHTML(cert.issuer)}</div>
                </div>
                <div class="date">${escapeHTML(cert.date)}</div>
            </div>
        </div>
    `.trim()).join('\n\n        ');
}

/**
 * Render Achievements as simple text lines (no bullets)
 * For ATS-safe templates that use plain text list
 */
function renderAchievementsText(achievements?: any[]): string {
    if (!achievements || achievements.length === 0) return '';
    return achievements.map(a => {
        const text = typeof a === 'string' ? a : a.description;
        return `<li>${escapeHTML(text)}</li>`;
    }).join('\n                ');
}

/**
 * Render Achievements as bullet list
 */
function renderAchievements(achievements?: any[]): string {
    if (!achievements || achievements.length === 0) return '';
    return achievements.map(a => {
        const text = typeof a === 'string' ? a : a.description;
        return `<li>${escapeHTML(text)}</li>`;
    }).join('\n                ');
}

/**
 * Render Additional Info (languages/certs/achievements)
 */
function renderAdditionalInfo(data: ResumeData): string {
    const parts: string[] = [];
    const languages = (data as any).languages as string[] | undefined;
    const certifications = (data as any).certifications as any[] | undefined;
    const achievements = data.achievements as any[] | undefined;

    if (languages && languages.length > 0) {
        parts.push(`<div class="info-item"><span class="info-label">Languages:</span> ${escapeHTMLArray(languages).join(', ')}</div>`);
    }
    if (certifications && certifications.length > 0) {
        const certs = certifications.map(cert => escapeHTML(cert.name || cert.title || '')).filter(Boolean).join(', ');
        if (certs) {
            parts.push(`<div class="info-item"><span class="info-label">Certifications:</span> ${certs}</div>`);
        }
    }
    if (achievements && achievements.length > 0) {
        const awards = achievements.map(a => escapeHTML(typeof a === 'string' ? a : a.description)).filter(Boolean).join(', ');
        if (awards) {
            parts.push(`<div class="info-item"><span class="info-label">Awards:</span> ${awards}</div>`);
        }
    }

    return parts.join('\n                ');
}

function isTechnicalRole(role?: string): boolean {
    if (!role) return false;
    const lower = role.toLowerCase();
    return /(engineer|developer|software|data|analyst|scientist|ml|ai|devops|cloud|full stack|backend|frontend|mobile|security|qa|sdet)/.test(lower);
}

function inferExperienceLevel(data: ResumeData): string {
    const level = (data as any).basics?.experienceLevel;
    if (level) return String(level);
    const experiences = data.experience || [];
    if (experiences.length === 0) return 'fresher';
    let totalYears = 0;
    experiences.forEach(exp => {
        if (!exp.startDate) return;
        const start = new Date(exp.startDate);
        const end = exp.endDate ? new Date(exp.endDate) : new Date();
        if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime())) {
            totalYears += (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365);
        }
    });
    if (totalYears < 1) return 'fresher';
    if (totalYears < 3) return '1-3';
    if (totalYears < 5) return '3-5';
    if (totalYears < 8) return '5-8';
    return '8+';
}

function buildTemplate2Content(replacements: Record<string, string>, data: ResumeData): string {
    const profile = replacements['{{PROFILE}}'];
    const skills = replacements['{{SKILLS_LIST}}'];
    const experience = replacements['{{EXPERIENCE_ENTRIES}}'];
    const projects = replacements['{{PROJECTS_ENTRIES}}'];
    const education = replacements['{{EDUCATION_ENTRIES}}'];
    const additional = replacements['{{ADDITIONAL_INFO}}'];

    const expLevel = inferExperienceLevel(data);
    const targetRole = (data as any).basics?.targetRole || (data as any).jobTitle || '';
    const technical = isTechnicalRole(targetRole);
    const isFresher = expLevel === 'fresher';

    // ATS-optimized section order - IMPROVED DYNAMIC ORDERING
    let order: string[];

    // Enhanced role-based ordering
    const roleLower = targetRole.toLowerCase();
    const isDataRole = /data|analyst|scientist|bi|analytics/.test(roleLower);
    const isDesignRole = /design|ux|ui|graphic|visual/.test(roleLower);
    const isProductRole = /product|program|project/.test(roleLower);
    const isSalesRole = /sales|account|business development/.test(roleLower);

    if (isFresher) {
        // Freshers: Education and projects first
        order = ['profile', 'education', 'projects', 'skills', 'experience', 'additional'];
    } else if (isDataRole) {
        // Data roles: Skills and projects critical
        order = ['profile', 'skills', 'projects', 'experience', 'education', 'additional'];
    } else if (isDesignRole) {
        // Design roles: Projects showcase work
        order = ['profile', 'projects', 'experience', 'skills', 'education', 'additional'];
    } else if (isProductRole) {
        // Product roles: Experience and skills
        order = ['profile', 'experience', 'skills', 'projects', 'education', 'additional'];
    } else if (isSalesRole) {
        // Sales roles: Experience first
        order = ['profile', 'experience', 'skills', 'education', 'projects', 'additional'];
    } else if (technical) {
        // Technical roles: Skills and experience
        order = ['profile', 'skills', 'experience', 'projects', 'education', 'additional'];
    } else {
        // Default: Standard professional order
        order = ['profile', 'experience', 'skills', 'education', 'projects', 'additional'];
    }

    const sections: Record<string, string> = {
        profile: profile ? `<section class="section summary-section"><h2 class="section-title">Professional Summary</h2><p class="summary-text">${profile}</p></section>` : '',
        skills: skills ? `<section class="section skills-section"><h2 class="section-title">Skills</h2><ul class="skills-list">${skills}</ul></section>` : '',
        experience: experience ? `<section class="section experience-section"><h2 class="section-title">Experience</h2>${experience}</section>` : '',
        projects: projects ? `<section class="section projects-section"><h2 class="section-title">Projects</h2>${projects}</section>` : '',
        education: education ? `<section class="section education-section"><h2 class="section-title">Education</h2>${education}</section>` : '',
        additional: additional ? `<section class="section additional-section"><h2 class="section-title">Additional Information</h2><div class="additional-info">${additional}</div></section>` : ''
    };

    return order.map(key => sections[key]).filter(Boolean).join('\n        ');
}

/**
 * Render References
 */
function renderReferences(references?: any[]): string {
    if (!references || references.length === 0) return '';

    return references.map(ref => `
        <div class="reference-item">
            <div class="name">${escapeHTML(ref.name)}</div>
            <div class="title detail">${escapeHTML(ref.title)}</div>
            <div class="detail">${escapeHTML(ref.company)}</div>
            <div class="contact detail">${escapeHTML(ref.contact)}</div>
        </div>
    `.trim()).join('\n            ');
}

/**
 * Main Template Population Function
 * All user content is HTML-escaped for XSS protection
 */
export async function populateTemplate(templateName: string, data: ResumeData): Promise<string> {
    console.log('🔧 populateTemplate called:', { templateName, data });

    // Load template HTML with cache busting
    const templateUrl = `/templates/${templateName}.html?t=${Date.now()}`;
    console.log('📥 Fetching:', templateUrl);

    try {
        const response = await fetch(templateUrl);
        if (!response.ok) {
            throw new Error(`Failed to fetch template: ${response.status} ${response.statusText}`);
        }

        let html = await response.text();

        // Extract keywords from job description for highlighting
        const jobDescription = data.jobDescription || '';
        const keywords = extractJDKeywords(jobDescription);
        console.log('🔑 Extracted keywords for highlighting:', keywords.length > 0 ? keywords.slice(0, 10) : 'none');

        // New structure mappings with backward compatibility
        const basics = (data.basics || {}) as any;
        const fullName = escapeHTML(basics.fullName || (data as any).name || 'Your Name');
        const jobTitle = escapeHTML(basics.targetRole || (data as any).jobTitle || 'Professional');
        const email = escapeHTML(basics.email || (data as any).email || 'email@example.com');
        const phone = escapeHTML(basics.phone || (data as any).phone || '');
        const address = escapeHTML(basics.location || (data as any).address || '');
        // Normalize URLs for rigid header
        const linkedInUrl = normalizeUrl(basics.linkedin || (data as any).linkedin, 'linkedin');
        const gitHubUrl = normalizeUrl(basics.github || (data as any).github, 'github');
        const summary = data.summary || (data as any).profile || '';
        const photoUrl = (data.includePhoto && data.photoUrl) ? escapeHTML(data.photoUrl) : '';

        // Construct strict contact line parts (normalized)
        const contactParts = [
            email,
            phone,
            linkedInUrl ? `<a href="${basics.linkedin || (data as any).linkedin}" target="_blank">${linkedInUrl}</a>` : '',
            gitHubUrl ? `<a href="${basics.github || (data as any).github}" target="_blank">${gitHubUrl}</a>` : ''
        ].filter(Boolean);

        // Assemble with a simple separator that allows wrapping
        const contactLine = contactParts.join(' | ');

        // Replace placeholders (render functions already escape content)
        const replacements: Record<string, string> = {
            '{{FULL_NAME}}': fullName,
            '{{JOB_TITLE}}': jobTitle,
            '{{EMAIL}}': email,
            '{{PHONE}}': phone,
            '{{ADDRESS}}': address,
            '{{LOCATION}}': address,
            '{{LINKEDIN}}': linkedInUrl, // content only
            '{{GITHUB}}': gitHubUrl,     // content only
            '{{CONTACT_LINE}}': contactLine, // Pre-built strict line
            '{{PHOTO_URL}}': photoUrl,
            '{{PROFILE}}': boldKeywords(summary, keywords), // Bold keywords in summary
            '{{SUMMARY}}': boldKeywords(summary, keywords),
            '{{SKILLS_LIST}}': renderSkills(data.skills || (data as any).skills, templateName),
            '{{SKILLS_TEXT}}': renderSkills(data.skills || (data as any).skills, 'ats-text'), // Comma-separated for ATS
            '{{EXPERIENCE_ENTRIES}}': renderExperience(data.experience || (data as any).experience || (data as any).work, keywords),
            '{{PROJECTS_ENTRIES}}': renderProjects(data.projects || (data as any).projects, keywords),
            '{{PROJECTS_LIST}}': renderProjects(data.projects || (data as any).projects, keywords), // Alias
            '{{EDUCATION_ENTRIES}}': renderEducation(data.education || (data as any).education),
            '{{LANGUAGES}}': (data as any).languages?.map((l: any) => `<li>${l.language}${l.fluency ? ': ' + l.fluency : ''}</li>`).join('') || '',
            '{{REFERENCES}}': (data as any).references?.map((r: any) => `<div class="reference-item"><div class="ref-name">${r.name}</div><div class="ref-org">${r.reference}</div></div>`).join('') || '',
            '{{ACHIEVEMENTS_TEXT}}': renderAchievementsText(data.achievements), // Simple lines for ATS
            '{{ACHIEVEMENTS_ENTRIES}}': renderAchievementsText(data.achievements), // Alias and old support
            '{{CERTIFICATIONS_ENTRIES}}': renderAchievementsText((data as any).certifications), // Share same list logic
            '{{ADDITIONAL_INFO}}': renderAdditionalInfo(data),
            '{{TEMPLATE2_CONTENT}}': ''
        };

        if (templateName === 'template2') {
            replacements['{{TEMPLATE2_CONTENT}}'] = buildTemplate2Content(replacements, data);
        }

        console.log('🔄 Applying replacements:', Object.keys(replacements));

        // Apply replacements (escape special characters for RegExp)
        for (const [placeholder, value] of Object.entries(replacements)) {
            const escapedPlaceholder = placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            html = html.replace(new RegExp(escapedPlaceholder, 'g'), value);
        }

        // Remove conditional blocks if empty
        html = html.replace(/\{\{#if\s+(\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g, (_match, variable, content) => {
            const hasContent = replacements[`{{${variable}}}`] && replacements[`{{${variable}}}`].trim().length > 0;
            return hasContent ? content : '';
        });

        console.log('✅ Template populated, final HTML length:', html.length);
        return html;
    } catch (error) {
        console.error('❌ Error in populateTemplate:', error);
        throw error;
    }
}

/**
 * Generate PDF from populated template
 * 
 * Uses window.print() with proper DOM/font waiting.
 * 
 * NOTE: Browser print dialog will show. User MUST:
 * - Uncheck "Headers and footers" in print settings
 * - Select "Save as PDF" as destination
 * 
 * html2pdf.js was removed because it rasterizes text (bad for ATS).
 */
export async function generatePDFFromTemplate(templateName: string, data: ResumeData): Promise<void> {
    const html = await populateTemplate(templateName, data);

    // Check if running in Electron
    if ((window as any).electronAPI?.downloadPDF) {
        console.log('Electron detected, using direct PDF download');
        (window as any).electronAPI.downloadPDF(html);
        return;
    }

    // Generate clean filename
    const basics = (data.basics || {}) as { fullName?: string };
    const fullName = basics.fullName || 'Resume';
    const sanitizedName = fullName.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_');
    const filename = `${sanitizedName}_Resume`;

    // Create invisible iframe for printing
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.width = '210mm';
    iframe.style.height = '297mm';
    iframe.style.left = '-9999px';
    iframe.style.top = '0';
    iframe.style.border = 'none';
    iframe.style.background = '#ffffff';

    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentWindow?.document;
    if (iframeDoc) {
        iframeDoc.open();
        iframeDoc.write(html);
        iframeDoc.title = filename;
        iframeDoc.close();

        // Wait for iframe to fully load
        await new Promise<void>((resolve) => {
            iframe.onload = () => resolve();
            setTimeout(resolve, 500);
        });

        // Wait for fonts
        try {
            await iframeDoc.fonts?.ready;
        } catch {
            // Ignore font loading errors
        }

        // Wait for images
        const images = iframeDoc.querySelectorAll('img');
        await Promise.all(
            Array.from(images).map(img => {
                if (img.complete) return Promise.resolve();
                return new Promise(resolve => {
                    img.onload = resolve;
                    img.onerror = resolve;
                });
            })
        );

        // Additional render tick
        await new Promise(resolve => setTimeout(resolve, 200));

        try {
            iframe.contentWindow?.focus();
            iframe.contentWindow?.print();
            console.log('✅ Print dialog opened for:', filename);
        } catch (error) {
            console.error('Print failed:', error);
            const printWindow = window.open('', '_blank');
            if (printWindow) {
                printWindow.document.write(html);
                printWindow.document.close();
                printWindow.print();
            }
        }

        // Cleanup after print dialog closes
        setTimeout(() => {
            if (document.body.contains(iframe)) {
                document.body.removeChild(iframe);
            }
        }, 2000);
    } else {
        document.body.removeChild(iframe);
        console.error('Failed to access iframe document');
    }
}
