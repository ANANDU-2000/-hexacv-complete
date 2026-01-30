export const COMMON_ROLES = [
    // Technology - AI/ML
    "AI Engineer",
    "Machine Learning Engineer",
    "AI/ML Engineer",
    "Data Scientist",
    "Deep Learning Engineer",
    "NLP Engineer",
    "Computer Vision Engineer",
    "MLOps Engineer",
    "Data Analyst",
    "Data Engineer",
    "Business Intelligence Analyst",
    "Analytics Engineer",
    // Technology - Software
    "Software Engineer",
    "Frontend Developer",
    "Backend Developer",
    "Full Stack Developer",
    "DevOps Engineer",
    "Product Manager",
    "UX Designer",
    "QA Engineer",
    "System Administrator",
    "Network Engineer",
    "Android Developer",
    "iOS Developer",
    "Cloud Engineer",
    "Security Engineer",
    "Database Administrator",
    // Business & Finance
    "Financial Analyst",
    "Accountant",
    "Business Analyst",
    "Project Manager",
    "Product Owner",
    "Management Consultant",
    "Investment Banker",
    "Risk Manager",
    // Marketing & Sales
    "Marketing Manager",
    "Digital Marketing Manager",
    "Sales Executive",
    "Account Manager",
    "Content Writer",
    "SEO Specialist",
    "Social Media Manager",
    "Brand Manager",
    // Healthcare
    "Registered Nurse",
    "Physician",
    "Medical Assistant",
    "Pharmacist",
    "Physical Therapist",
    "Dental Hygienist",
    // Education
    "Teacher",
    "Professor",
    "Academic Counselor",
    "Tutor",
    // Creative & Arts
    "Graphic Designer",
    "Art Director",
    "Copywriter",
    "Video Editor",
    "Photographer",
    "Interior Designer",
    // HR & Admin
    "Human Resources Manager",
    "Recruiter",
    "Administrative Assistant",
    "Office Manager",
    // Engineering (Non-Software)
    "Civil Engineer",
    "Mechanical Engineer",
    "Electrical Engineer",
    "Chemical Engineer",
    // Service & Trades
    "Chef",
    "Electrician",
    "Plumber",
    "Customer Service Representative",
    "Hotel Manager"
].sort();

export const ROLE_CATEGORIES = [
    'All',
    'Data',
    'Software',
    'Product',
    'Design',
    'Marketing',
    'Sales',
    'Finance',
    'HR',
    'Healthcare',
    'Education',
    'Operations',
    'Legal',
    'Manufacturing',
    'Logistics',
    'Hospitality',
    'Government',
    'Customer Support',
    'Retail',
    'Other'
];

const ROLE_TAXONOMY_BASE = [
    // Engineering
    'Software Engineer',
    'Senior Software Engineer',
    'Staff Software Engineer',
    'Principal Engineer',
    'Frontend Developer',
    'Frontend Engineer',
    'Backend Developer',
    'Backend Engineer',
    'Full Stack Developer',
    'Full Stack Engineer',
    'Web Developer',
    'Application Developer',
    // Data & AI
    'Data Scientist',
    'Senior Data Scientist',
    'Data Analyst',
    'Business Intelligence Analyst',
    'Machine Learning Engineer',
    'ML Engineer',
    'AI Engineer',
    'Applied AI Engineer',
    'Deep Learning Engineer',
    'NLP Engineer',
    'Computer Vision Engineer',
    'Data Engineer',
    'Analytics Engineer',
    // Cloud & DevOps
    'DevOps Engineer',
    'Site Reliability Engineer',
    'SRE',
    'Platform Engineer',
    'Cloud Engineer',
    'Cloud Architect',
    'AWS Engineer',
    'Azure Engineer',
    'Infrastructure Engineer',
    // Mobile
    'Mobile Developer',
    'iOS Developer',
    'Android Developer',
    'React Native Developer',
    'Flutter Developer',
    // Specialized Dev
    'React Developer',
    'Angular Developer',
    'Vue.js Developer',
    'Node.js Developer',
    'Python Developer',
    'Java Developer',
    'Golang Developer',
    'Rust Developer',
    '.NET Developer',
    'PHP Developer',
    'Ruby on Rails Developer',
    // QA & Testing
    'QA Engineer',
    'Quality Assurance Engineer',
    'Test Engineer',
    'SDET',
    'Automation Engineer',
    // Security
    'Security Engineer',
    'Cybersecurity Analyst',
    'Information Security Analyst',
    'Penetration Tester',
    'Security Architect',
    // Management & Leadership
    'Technical Lead',
    'Tech Lead',
    'Engineering Manager',
    'Director of Engineering',
    'VP of Engineering',
    'CTO',
    'Solutions Architect',
    'Enterprise Architect',
    'Technical Architect',
    // Product & Design
    'Product Manager',
    'Senior Product Manager',
    'Product Owner',
    'Program Manager',
    'Technical Program Manager',
    'Project Manager',
    'Scrum Master',
    'Agile Coach',
    'UI Designer',
    'UX Designer',
    'UI/UX Designer',
    'Product Designer',
    'Interaction Designer',
    'Visual Designer',
    'Graphic Designer',
    // Business & Analytics
    'Business Analyst',
    'Systems Analyst',
    'Technical Writer',
    'Documentation Engineer',
    'Customer Success Manager',
    'Technical Account Manager',
    'Pre-Sales Engineer',
    'Sales Engineer',
    'Solutions Consultant',
    // Other Tech
    'System Administrator',
    'Network Engineer',
    'Network Administrator',
    'Database Administrator',
    'DBA',
    'Blockchain Developer',
    'Game Developer',
    'Embedded Systems Engineer',
    'Firmware Engineer',
    'Hardware Engineer',
    // Operations & Supply Chain
    'Operations Manager',
    'Operations Analyst',
    'Supply Chain Analyst',
    'Supply Chain Manager',
    'Logistics Coordinator',
    'Logistics Manager',
    'Procurement Specialist',
    'Procurement Manager',
    'Warehouse Manager',
    'Inventory Analyst',
    // Manufacturing & Industrial
    'Manufacturing Engineer',
    'Process Engineer',
    'Industrial Engineer',
    'Quality Engineer',
    'Quality Manager',
    'Plant Manager',
    // Legal
    'Legal Counsel',
    'Corporate Lawyer',
    'Attorney',
    'Paralegal',
    'Legal Assistant',
    // Retail & Customer
    'Retail Manager',
    'Store Manager',
    'Merchandiser',
    'Customer Success Associate',
    'Customer Support Specialist',
    'Customer Service Manager',
    'Call Center Executive',
    // Government & Public
    'Public Policy Analyst',
    'Program Officer',
    'Government Relations Manager',
    // Non-Tech
    'Marketing Manager',
    'Digital Marketing Manager',
    'Content Writer',
    'Copywriter',
    'Content Strategist',
    'Brand Strategist',
    'HR Manager',
    'HR Business Partner',
    'Recruiter',
    'Technical Recruiter',
    'Financial Analyst',
    'Accountant',
    'Operations Manager',
    'Sales Executive',
    'Account Manager',
    'Consultant',
    'Management Consultant'
];

export const ROLE_TAXONOMY = Array.from(
    new Set([...COMMON_ROLES, ...ROLE_TAXONOMY_BASE])
).sort();

const CUSTOM_ROLES_KEY = 'customRoleLibraryV1';

export function getCustomRoles(): string[] {
    if (typeof window === 'undefined') return [];
    try {
        const raw = window.localStorage.getItem(CUSTOM_ROLES_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
            return parsed.filter(Boolean).map(String);
        }
        return [];
    } catch {
        return [];
    }
}

export function saveCustomRole(role: string) {
    if (typeof window === 'undefined') return;
    const clean = role.trim();
    if (!clean) return;
    const existing = getCustomRoles();
    if (existing.some(r => r.toLowerCase() === clean.toLowerCase())) return;
    const next = [clean, ...existing].slice(0, 5000);
    window.localStorage.setItem(CUSTOM_ROLES_KEY, JSON.stringify(next));
}

function getRolePool(): string[] {
    const custom = getCustomRoles();
    return Array.from(new Set([...custom, ...ROLE_TAXONOMY]));
}

const ABBREVIATIONS: Record<string, string[]> = {
    'swe': ['software engineer'],
    'sde': ['software engineer', 'software developer'],
    'fe': ['frontend', 'front end'],
    'be': ['backend', 'back end'],
    'fs': ['full stack', 'fullstack'],
    'ml': ['machine learning'],
    'ds': ['data scientist', 'data science'],
    'da': ['data analyst'],
    'de': ['data engineer', 'devops engineer'],
    'pm': ['product manager', 'project manager', 'program manager'],
    'qa': ['qa engineer', 'quality assurance'],
    'ux': ['ux designer', 'ui/ux'],
    'ui': ['ui designer', 'ui/ux'],
    'sre': ['site reliability', 'sre'],
    'tpm': ['technical program manager'],
    'em': ['engineering manager']
};

function normalizeRole(input: string): string {
    return input.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

function levenshtein(a: string, b: string): number {
    const m = a.length;
    const n = b.length;
    if (m === 0) return n;
    if (n === 0) return m;
    const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            const cost = a[i - 1] === b[j - 1] ? 0 : 1;
            dp[i][j] = Math.min(
                dp[i - 1][j] + 1,
                dp[i][j - 1] + 1,
                dp[i - 1][j - 1] + cost
            );
        }
    }
    return dp[m][n];
}

function fuzzyScore(input: string, target: string): number {
    const inputNorm = normalizeRole(input);
    const targetNorm = normalizeRole(target);
    if (!inputNorm) return 0;
    if (targetNorm === inputNorm) return 100;
    if (targetNorm.includes(inputNorm)) return 85;
    const inputWords = inputNorm.split(' ');
    const targetWords = targetNorm.split(' ');
    for (const iw of inputWords) {
        if (iw.length >= 2 && targetWords.some(tw => tw.startsWith(iw))) {
            return 70;
        }
    }
    if (ABBREVIATIONS[inputNorm]) {
        for (const expansion of ABBREVIATIONS[inputNorm]) {
            if (targetNorm.includes(expansion)) return 65;
        }
    }
    const distance = levenshtein(inputNorm, targetNorm);
    if (distance <= 2) return 60;
    if (distance <= 3) return 50;
    return 0;
}

export function getRoleSuggestions(input: string, limit: number = 20): string[] {
    const pool = getRolePool();
    if (!input || !input.trim()) {
        return Array.from(new Set([...getCustomRoles(), ...COMMON_ROLES])).slice(0, limit);
    }
    const results = pool
        .map(role => ({ role, score: fuzzyScore(input, role) }))
        .filter(r => r.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map(r => r.role);
    return results.length > 0 ? results : COMMON_ROLES.slice(0, limit);
}

export function getRoleCorrection(input: string): string | null {
    const normalized = normalizeRole(input);
    if (normalized.length < 4) return null;
    let best: { role: string; distance: number } | null = null;
    for (const role of ROLE_TAXONOMY) {
        const distance = levenshtein(normalized, normalizeRole(role));
        if (!best || distance < best.distance) {
            best = { role, distance };
        }
    }
    if (!best) return null;
    const threshold = normalized.length >= 8 ? 3 : 2;
    return best.distance <= threshold ? best.role : null;
}

export function categorizeRole(role?: string): string {
    if (!role) return 'Other';
    const lower = role.toLowerCase();
    if (/(data|analyst|scientist|analytics|bi)/.test(lower)) return 'Data';
    if (/(engineer|developer|software|full stack|frontend|backend)/.test(lower)) return 'Software';
    if (/(product|program|project)/.test(lower)) return 'Product';
    if (/(design|ux|ui|graphic|visual)/.test(lower)) return 'Design';
    if (/(marketing|seo|content|brand)/.test(lower)) return 'Marketing';
    if (/(sales|account|pre-sales)/.test(lower)) return 'Sales';
    if (/(finance|accountant|investment|risk)/.test(lower)) return 'Finance';
    if (/(hr|recruit|talent)/.test(lower)) return 'HR';
    if (/(health|medical|nurse|physician|pharmacist)/.test(lower)) return 'Healthcare';
    if (/(teacher|professor|tutor|education)/.test(lower)) return 'Education';
    if (/(operations|supply chain|procurement|inventory)/.test(lower)) return 'Operations';
    if (/(legal|law|attorney|paralegal|counsel)/.test(lower)) return 'Legal';
    if (/(manufacturing|industrial|process|plant|quality)/.test(lower)) return 'Manufacturing';
    if (/(logistics|warehouse|shipping)/.test(lower)) return 'Logistics';
    if (/(hotel|hospitality|chef|front office)/.test(lower)) return 'Hospitality';
    if (/(government|public policy|program officer|civil service)/.test(lower)) return 'Government';
    if (/(customer support|customer success|call center|service representative)/.test(lower)) return 'Customer Support';
    if (/(retail|store|merchandiser)/.test(lower)) return 'Retail';
    return 'Other';
}
