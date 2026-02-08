/**
 * KEYWORD EXTRACTION ENGINE
 * Ported from keywordEngine.ts
 */

export interface ExtractedKeywords {
    skills: string[];
    tools: string[];
    technologies: string[];
    softSkills: string[];
    roleKeywords: string[];
    businessTerms: string[];
    allKeywords: string[];
}

export const TECHNICAL_SKILLS = [
    'python', 'javascript', 'typescript', 'java', 'c++', 'c#', 'go', 'rust', 'ruby', 'php', 'swift', 'kotlin', 'scala', 'r', 'matlab', 'perl', 'shell', 'bash', 'powershell',
    'react', 'angular', 'vue', 'svelte', 'next.js', 'nextjs', 'nuxt', 'gatsby', 'html', 'css', 'sass', 'less', 'tailwind', 'bootstrap', 'material ui', 'chakra',
    'node.js', 'nodejs', 'express', 'fastapi', 'django', 'flask', 'spring', 'spring boot', '.net', 'asp.net', 'rails', 'laravel', 'gin', 'fiber',
    'sql', 'mysql', 'postgresql', 'postgres', 'mongodb', 'redis', 'elasticsearch', 'dynamodb', 'cassandra', 'oracle', 'sqlite', 'mariadb', 'neo4j', 'graphql',
    'aws', 'azure', 'gcp', 'google cloud', 'docker', 'kubernetes', 'k8s', 'terraform', 'ansible', 'jenkins', 'ci/cd', 'github actions', 'gitlab ci', 'circleci',
    'machine learning', 'deep learning', 'tensorflow', 'pytorch', 'keras', 'scikit-learn', 'sklearn', 'pandas', 'numpy', 'opencv', 'nlp', 'computer vision', 'llm', 'rag', 'langchain', 'huggingface', 'transformers',
    'data analysis', 'data science', 'data engineering', 'etl', 'spark', 'hadoop', 'airflow', 'kafka', 'tableau', 'power bi', 'looker', 'dbt',
    'ios', 'android', 'react native', 'flutter', 'xamarin', 'ionic',
    'git', 'jira', 'confluence', 'figma', 'sketch', 'postman', 'swagger', 'linux', 'unix', 'vim', 'vscode'
];

export const SOFT_SKILLS = [
    'leadership', 'communication', 'teamwork', 'collaboration', 'problem solving', 'problem-solving', 'critical thinking', 'analytical', 'detail-oriented', 'detail oriented',
    'project management', 'time management', 'agile', 'scrum', 'kanban', 'stakeholder management', 'cross-functional', 'mentoring', 'coaching',
    'presentation', 'negotiation', 'conflict resolution', 'adaptability', 'creativity', 'innovation', 'strategic thinking', 'decision making'
];

export const ROLE_KEYWORDS = [
    'software engineer', 'software developer', 'frontend', 'front-end', 'backend', 'back-end', 'full stack', 'fullstack', 'devops', 'sre', 'site reliability',
    'data scientist', 'data analyst', 'data engineer', 'ml engineer', 'machine learning engineer', 'ai engineer',
    'product manager', 'project manager', 'scrum master', 'tech lead', 'engineering manager', 'architect', 'solution architect',
    'qa engineer', 'test engineer', 'automation engineer', 'security engineer', 'cloud engineer', 'platform engineer'
];

export const BUSINESS_TERMS = [
    'revenue', 'roi', 'kpi', 'metrics', 'growth', 'optimization', 'efficiency', 'scalability', 'performance', 'reliability',
    'compliance', 'gdpr', 'hipaa', 'soc2', 'pci', 'security', 'audit', 'governance',
    'b2b', 'b2c', 'saas', 'startup', 'enterprise', 'stakeholder', 'customer', 'user experience', 'ux'
];

export function extractKeywordsFromJD(text: string): ExtractedKeywords {
    const lowerText = text.toLowerCase();

    const found = {
        skills: new Set<string>(),
        tools: new Set<string>(),
        technologies: new Set<string>(),
        softSkills: new Set<string>(),
        roleKeywords: new Set<string>(),
        businessTerms: new Set<string>()
    };

    // Helper to check and add
    const checkAndAdd = (list: string[], set: Set<string>, extraCheck?: (k: string) => void) => {
        list.forEach(item => {
            const regex = new RegExp(`\\b${item.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
            if (regex.test(lowerText)) {
                set.add(item);
                if (extraCheck) extraCheck(item);
            }
        });
    };

    checkAndAdd(TECHNICAL_SKILLS, found.skills, (skill) => {
        // Categorize tools vs tech
        if (['docker', 'kubernetes', 'git', 'jenkins', 'terraform', 'ansible', 'jira', 'confluence', 'figma', 'postman'].some(t => skill.includes(t))) {
            found.tools.add(skill);
        } else {
            found.technologies.add(skill);
        }
    });

    checkAndAdd(SOFT_SKILLS, found.softSkills);
    checkAndAdd(ROLE_KEYWORDS, found.roleKeywords);
    checkAndAdd(BUSINESS_TERMS, found.businessTerms);

    const allKeywords = [
        ...found.skills,
        ...found.softSkills,
        ...found.roleKeywords,
        ...found.businessTerms
    ];

    return {
        skills: Array.from(found.skills),
        tools: Array.from(found.tools),
        technologies: Array.from(found.technologies),
        softSkills: Array.from(found.softSkills),
        roleKeywords: Array.from(found.roleKeywords),
        businessTerms: Array.from(found.businessTerms),
        allKeywords: [...new Set(allKeywords)]
    };
}
