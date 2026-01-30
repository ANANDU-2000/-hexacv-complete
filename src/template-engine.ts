import { ResumeData } from './types';

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
// RENDER FUNCTIONS
// ============================================

/**
 * Render Experience Entries
 */
function renderExperience(experiences: ResumeData['experience']): string {
    if (!experiences || experiences.length === 0) return '';

    return experiences.map(exp => {
        const dateStr = `${escapeHTML(exp.startDate)} - ${escapeHTML(exp.endDate)}`;
        const bullets = (exp as any).highlights || (exp as any).bullets || [];
        const role = escapeHTML((exp as any).position || (exp as any).role || '');
        const company = escapeHTML(exp.company);

        return `
            <div class="entry experience-entry">
                <div class="job-header">
                    <div class="header-left">
                        <div class="job-title">${role}</div>
                        <div class="company-name">${company}</div>
                    </div>
                    <div class="date-range">${dateStr}</div>
                </div>
                <ul class="experience-highlights">
                    ${escapeHTMLArray(bullets).map((b: string) => `<li>${b}</li>`).join('\n                    ')}
                </ul>
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
 */
function renderProjects(projects: ResumeData['projects']): string {
    if (!projects || projects.length === 0) return '';

    return projects.map(proj => {
        const dateRange = (proj as any).startDate && (proj as any).endDate
            ? `${escapeHTML((proj as any).startDate)} - ${escapeHTML((proj as any).endDate)}`
            : '';
        const name = escapeHTML(proj.name);
        const description = escapeHTML(proj.description);
        const highlights = (proj as any).highlights || [];
        const tech = (proj as any).tech ? escapeHTMLArray((proj as any).tech) : [];

        return `
        <div class="entry project-entry">
            <div class="project-header">
                <div class="project-title">${name}</div>
                ${dateRange ? `<div class="project-date">${dateRange}</div>` : ''}
            </div>
            ${description ? `<div class="project-description">${description}</div>` : ''}
            ${highlights.length > 0 ? `
            <ul class="project-highlights">
                ${escapeHTMLArray(highlights).map((h: string) => `<li>${h}</li>`).join('\n                ')}
            </ul>` : ''}
            ${tech.length > 0 ? `<div class="project-tech"><strong>Tech:</strong> ${tech.join(', ')}</div>` : ''}
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
 */
function renderEducation(education: ResumeData['education']): string {
    if (!education || education.length === 0) return '';

    return education.map(edu => {
        const year = escapeHTML((edu as any).graduationDate || (edu as any).year || '');
        const institution = escapeHTML((edu as any).institution || '');
        const degree = escapeHTML((edu as any).degree || '');

        return `
            <div class="entry education-entry edu-entry">
                <div class="row entry-header role-header">
                    <div class="row-left left">
                        <div class="degree font-bold">${degree}</div>
                        <div class="school institution">${institution}</div>
                    </div>
                    <div class="date education-date education-year date-range">${year}</div>
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
    return escapeHTMLArray(languages).map(lang => `<li>${lang}</li>`).join('\n                    ');
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
 * Render Achievements
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

    // ATS-optimized section order
    let order: string[];
    if (isFresher) {
        order = ['profile', 'education', 'projects', 'skills', 'experience', 'additional'];
    } else if (technical) {
        order = ['profile', 'skills', 'experience', 'projects', 'education', 'additional'];
    } else {
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

    // Load template HTML
    const templateUrl = `/templates/${templateName}.html`;
    console.log('📥 Fetching:', templateUrl);

    try {
        const response = await fetch(templateUrl);
        if (!response.ok) {
            throw new Error(`Failed to fetch template: ${response.status} ${response.statusText}`);
        }

        let html = await response.text();

        // New structure mappings with backward compatibility
        const basics = (data.basics || {}) as any;
        const fullName = escapeHTML(basics.fullName || (data as any).name || 'Your Name');
        const jobTitle = escapeHTML(basics.targetRole || (data as any).jobTitle || 'Professional');
        const email = escapeHTML(basics.email || (data as any).email || 'email@example.com');
        const phone = escapeHTML(basics.phone || (data as any).phone || '');
        const address = escapeHTML(basics.location || (data as any).address || '');
        const linkedin = escapeHTML(basics.linkedin || (data as any).linkedin || '');
        const github = escapeHTML(basics.github || (data as any).github || '');
        const summary = escapeHTML(data.summary || (data as any).profile || '');
        const photoUrl = (data.includePhoto && data.photoUrl) ? escapeHTML(data.photoUrl) : '';

        // Replace placeholders (render functions already escape content)
        const replacements: Record<string, string> = {
            '{{FULL_NAME}}': fullName,
            '{{JOB_TITLE}}': jobTitle,
            '{{EMAIL}}': email,
            '{{PHONE}}': phone,
            '{{ADDRESS}}': address,
            '{{LOCATION}}': address,
            '{{LINKEDIN}}': linkedin,
            '{{GITHUB}}': github,
            '{{PHOTO_URL}}': photoUrl,
            '{{PROFILE}}': summary,
            '{{SUMMARY}}': summary,
            '{{EXPERIENCE_ENTRIES}}': renderExperience(data.experience),
            '{{SKILLS_LIST}}': renderSkills(data.skills, templateName),
            '{{PROJECTS_ENTRIES}}': renderProjects(data.projects || []),
            '{{PROJECTS_SECTION}}': renderProjectsSection(data.projects || []),
            '{{LINKEDIN_DISPLAY}}': linkedin ? ` | 🔗 ${linkedin}` : '',
            '{{GITHUB_DISPLAY}}': github ? ` | 💻 ${github}` : '',
            '{{EDUCATION_ENTRIES}}': renderEducation(data.education),
            '{{LANGUAGES}}': renderLanguages((data as any).languages),
            '{{CERTIFICATIONS_ENTRIES}}': renderCertifications((data as any).certifications),
            '{{ACHIEVEMENTS_ENTRIES}}': renderAchievements(data.achievements),
            '{{ADDITIONAL_INFO}}': renderAdditionalInfo(data),
            '{{REFERENCES}}': renderReferences((data as any).references),
            '{{TEMPLATE2_CONTENT}}': ''
        };

        if (templateName === 'template2') {
            replacements['{{TEMPLATE2_CONTENT}}'] = buildTemplate2Content(replacements, data);
        }

        console.log('🔄 Applying replacements:', Object.keys(replacements));

        // Apply replacements
        for (const [placeholder, value] of Object.entries(replacements)) {
            html = html.replace(new RegExp(placeholder, 'g'), value);
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
 */
export async function generatePDFFromTemplate(templateName: string, data: ResumeData): Promise<void> {
    const html = await populateTemplate(templateName, data);

    // Check if running in Electron
    if ((window as any).electronAPI?.downloadPDF) {
        console.log('🚀 Electron detected, using direct PDF download');
        (window as any).electronAPI.downloadPDF(html);
        return;
    }

    // Fallback: Create temporary iframe for printing (Browser environment)
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';

    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentWindow?.document;
    if (iframeDoc) {
        iframeDoc.open();
        iframeDoc.write(html);
        iframeDoc.close();

        // Trigger print
        setTimeout(() => {
            iframe.contentWindow?.print();
            setTimeout(() => document.body.removeChild(iframe), 1000);
        }, 500);
    }
}
