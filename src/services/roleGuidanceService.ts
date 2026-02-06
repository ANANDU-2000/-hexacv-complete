/**
 * Role Guidance Service
 * Provides role-specific suggestions for resume optimization
 */

import { ResumeData } from '../types';

export interface RoleProfile {
    title: string;
    aliases: string[];
    level: 'Intern' | 'Junior' | 'Mid' | 'Senior' | 'Lead' | 'Principal';
    mustHaveSkills: string[];
    niceToHaveSkills: string[];
    experiencePatterns: string[];
    commonProjects: string[];
    industryKeywords: string[];
    summaryTemplates: string[];
}

export const ROLE_PROFILES: Record<string, RoleProfile> = {
    'applied-ai-engineer': {
        title: 'Applied AI Engineer',
        aliases: ['ai engineer', 'ml engineer', 'machine learning engineer', 'ai/ml engineer'],
        level: 'Mid',
        mustHaveSkills: [
            'Python', 'Machine Learning', 'Deep Learning',
            'TensorFlow', 'PyTorch', 'Model Deployment',
            'API Development', 'Cloud (AWS/GCP/Azure)'
        ],
        niceToHaveSkills: [
            'GenAI', 'LLMs', 'RAG', 'LangChain', 'Vector Databases',
            'MLOps', 'CI/CD', 'Docker', 'Kubernetes', 'Hugging Face'
        ],
        experiencePatterns: [
            'Built ML models achieving X% accuracy improvement',
            'Deployed models to production serving Y requests/sec',
            'Reduced inference latency by Z%',
            'Implemented end-to-end ML pipeline for [use case]',
            'Trained and fine-tuned LLMs for [specific task]',
            'Built RAG system processing X documents with Y% accuracy'
        ],
        commonProjects: [
            'Recommendation System',
            'NLP/Text Analysis Pipeline',
            'Computer Vision Application',
            'Chatbot/Conversational AI',
            'Predictive Analytics Model',
            'Document Intelligence System'
        ],
        industryKeywords: [
            'model training', 'inference', 'model serving', 'feature engineering',
            'hyperparameter tuning', 'data pipeline', 'ETL', 'preprocessing',
            'embeddings', 'fine-tuning', 'prompt engineering', 'RAG'
        ],
        summaryTemplates: [
            'AI/ML Engineer with X years experience building production ML systems',
            'Skilled in deploying and scaling machine learning models on cloud infrastructure'
        ]
    },

    'software-engineer': {
        title: 'Software Engineer',
        aliases: ['software developer', 'swe', 'developer', 'programmer', 'backend engineer', 'frontend engineer'],
        level: 'Mid',
        mustHaveSkills: [
            'JavaScript/TypeScript', 'Python or Java', 'SQL',
            'Git', 'REST APIs', 'Data Structures', 'Algorithms'
        ],
        niceToHaveSkills: [
            'React/Vue/Angular', 'Node.js', 'Docker',
            'AWS/GCP/Azure', 'CI/CD', 'Microservices', 'System Design'
        ],
        experiencePatterns: [
            'Built feature serving X users with Y% uptime',
            'Reduced API latency by X% through optimization',
            'Implemented X feature increasing user engagement by Y%',
            'Refactored legacy codebase reducing technical debt by X%',
            'Led development of X module used by Y team members'
        ],
        commonProjects: [
            'E-commerce Platform',
            'REST API Service',
            'Real-time Dashboard',
            'Authentication System',
            'Data Processing Pipeline'
        ],
        industryKeywords: [
            'scalability', 'performance', 'optimization', 'clean code',
            'testing', 'code review', 'agile', 'sprint'
        ],
        summaryTemplates: [
            'Software Engineer with X years building scalable web applications',
            'Full-stack developer experienced in designing and implementing production systems'
        ]
    },

    'data-scientist': {
        title: 'Data Scientist',
        aliases: ['data analyst', 'analytics engineer', 'business analyst', 'bi analyst'],
        level: 'Mid',
        mustHaveSkills: [
            'Python', 'SQL', 'Statistics', 'Machine Learning',
            'Pandas', 'NumPy', 'Data Visualization'
        ],
        niceToHaveSkills: [
            'TensorFlow/PyTorch', 'Spark', 'Tableau/PowerBI',
            'A/B Testing', 'Experimentation', 'BigQuery', 'Snowflake'
        ],
        experiencePatterns: [
            'Built predictive model achieving X% accuracy',
            'Analyzed data driving $X revenue impact',
            'Developed dashboard used by X stakeholders',
            'Identified insights leading to Y% improvement in Z',
            'Designed A/B testing framework for X experiments'
        ],
        commonProjects: [
            'Customer Segmentation',
            'Churn Prediction Model',
            'Revenue Forecasting',
            'A/B Testing Framework',
            'Analytics Dashboard'
        ],
        industryKeywords: [
            'data analysis', 'insights', 'modeling', 'forecasting',
            'experimentation', 'metrics', 'KPIs', 'visualization'
        ],
        summaryTemplates: [
            'Data Scientist with X years experience in statistical modeling and analytics',
            'Analytics professional skilled in deriving actionable insights from complex datasets'
        ]
    },

    'devops-engineer': {
        title: 'DevOps Engineer',
        aliases: ['sre', 'site reliability engineer', 'platform engineer', 'infrastructure engineer', 'cloud engineer'],
        level: 'Mid',
        mustHaveSkills: [
            'Docker', 'Kubernetes', 'CI/CD', 'Linux',
            'AWS/GCP/Azure', 'Terraform', 'Git'
        ],
        niceToHaveSkills: [
            'Ansible', 'Jenkins', 'GitHub Actions', 'Prometheus',
            'Grafana', 'ELK Stack', 'ArgoCD', 'Helm'
        ],
        experiencePatterns: [
            'Reduced deployment time from X hours to Y minutes',
            'Achieved X% uptime for production systems',
            'Implemented infrastructure as code for X services',
            'Built CI/CD pipeline reducing release cycle by Y%',
            'Managed Kubernetes clusters serving X requests/day'
        ],
        commonProjects: [
            'CI/CD Pipeline',
            'Infrastructure Automation',
            'Monitoring Stack',
            'Container Orchestration',
            'Cloud Migration'
        ],
        industryKeywords: [
            'automation', 'infrastructure', 'reliability', 'scaling',
            'monitoring', 'alerting', 'deployment', 'containerization'
        ],
        summaryTemplates: [
            'DevOps Engineer with X years building reliable cloud infrastructure',
            'Platform engineer focused on automation and operational excellence'
        ]
    },

    'product-manager': {
        title: 'Product Manager',
        aliases: ['pm', 'product owner', 'program manager', 'project manager'],
        level: 'Mid',
        mustHaveSkills: [
            'Product Roadmap', 'User Research', 'Analytics',
            'Stakeholder Management', 'Agile/Scrum', 'Jira'
        ],
        niceToHaveSkills: [
            'SQL', 'A/B Testing', 'Figma', 'Technical Background',
            'Market Research', 'Pricing Strategy', 'Go-to-Market'
        ],
        experiencePatterns: [
            'Led product launch achieving X users in first Y months',
            'Increased feature adoption by X% through UX improvements',
            'Managed backlog of X features across Y teams',
            'Drove X% revenue growth through product optimization',
            'Defined and prioritized roadmap for X product lines'
        ],
        commonProjects: [
            'New Product Launch',
            'Feature Optimization',
            'User Experience Redesign',
            'Platform Migration',
            'Growth Initiative'
        ],
        industryKeywords: [
            'roadmap', 'prioritization', 'user stories', 'sprint planning',
            'stakeholders', 'metrics', 'OKRs', 'customer feedback'
        ],
        summaryTemplates: [
            'Product Manager with X years driving product strategy and execution',
            'Customer-focused PM skilled in translating user needs into product features'
        ]
    },

    'frontend-engineer': {
        title: 'Frontend Engineer',
        aliases: ['frontend developer', 'ui developer', 'react developer', 'web developer'],
        level: 'Mid',
        mustHaveSkills: [
            'JavaScript', 'TypeScript', 'React/Vue/Angular',
            'HTML', 'CSS', 'Responsive Design', 'Git'
        ],
        niceToHaveSkills: [
            'Next.js', 'Tailwind CSS', 'Testing (Jest/Cypress)',
            'Performance Optimization', 'Accessibility', 'GraphQL'
        ],
        experiencePatterns: [
            'Built UI components used across X product surfaces',
            'Improved page load time by X% through optimization',
            'Implemented responsive design for X screen sizes',
            'Developed component library used by Y developers',
            'Achieved X% Lighthouse performance score'
        ],
        commonProjects: [
            'Component Library',
            'Dashboard UI',
            'E-commerce Frontend',
            'Mobile-first Web App',
            'Design System Implementation'
        ],
        industryKeywords: [
            'responsive', 'accessibility', 'performance', 'user experience',
            'components', 'state management', 'bundling', 'testing'
        ],
        summaryTemplates: [
            'Frontend Engineer with X years building performant web applications',
            'UI developer focused on creating accessible, responsive user interfaces'
        ]
    },

    'backend-engineer': {
        title: 'Backend Engineer',
        aliases: ['backend developer', 'server developer', 'api developer'],
        level: 'Mid',
        mustHaveSkills: [
            'Python/Java/Go/Node.js', 'SQL', 'REST APIs',
            'Database Design', 'Git', 'System Design'
        ],
        niceToHaveSkills: [
            'GraphQL', 'Microservices', 'Message Queues',
            'Caching (Redis)', 'Docker', 'Cloud Services'
        ],
        experiencePatterns: [
            'Built API serving X requests/second with Y ms latency',
            'Designed database schema supporting X million records',
            'Implemented microservices reducing coupling by Y%',
            'Optimized queries reducing database load by X%',
            'Built authentication system securing X user accounts'
        ],
        commonProjects: [
            'REST API Service',
            'Microservices Architecture',
            'Authentication System',
            'Data Processing Pipeline',
            'Third-party Integration'
        ],
        industryKeywords: [
            'scalability', 'performance', 'caching', 'database',
            'security', 'authentication', 'authorization', 'API design'
        ],
        summaryTemplates: [
            'Backend Engineer with X years building scalable server-side systems',
            'API developer experienced in designing high-performance backend services'
        ]
    },

    'fullstack-engineer': {
        title: 'Full Stack Engineer',
        aliases: ['full stack developer', 'full-stack developer', 'generalist engineer'],
        level: 'Mid',
        mustHaveSkills: [
            'JavaScript/TypeScript', 'React/Vue/Angular', 'Node.js/Python',
            'SQL', 'REST APIs', 'Git', 'HTML/CSS'
        ],
        niceToHaveSkills: [
            'Docker', 'AWS/GCP', 'CI/CD', 'GraphQL',
            'Testing', 'System Design', 'DevOps'
        ],
        experiencePatterns: [
            'Built end-to-end feature serving X users',
            'Developed full-stack application from scratch to production',
            'Implemented frontend and backend for X module',
            'Reduced development time by Y% through code reuse',
            'Owned feature development lifecycle from design to deployment'
        ],
        commonProjects: [
            'Full-Stack Web Application',
            'E-commerce Platform',
            'SaaS Product',
            'Internal Tool',
            'MVP Development'
        ],
        industryKeywords: [
            'end-to-end', 'full lifecycle', 'ownership', 'versatile',
            'frontend', 'backend', 'database', 'deployment'
        ],
        summaryTemplates: [
            'Full Stack Engineer with X years building end-to-end web applications',
            'Versatile developer experienced across the full software development lifecycle'
        ]
    }
};

/**
 * Find the best matching role profile for a target role
 */
export function findRoleProfile(targetRole: string): RoleProfile | null {
    const normalizedRole = targetRole.toLowerCase().trim();
    const roleKey = normalizedRole.replace(/\s+/g, '-');

    // Direct match
    if (ROLE_PROFILES[roleKey]) {
        return ROLE_PROFILES[roleKey];
    }

    // Search by aliases
    for (const [key, profile] of Object.entries(ROLE_PROFILES)) {
        if (profile.aliases.some(alias => normalizedRole.includes(alias) || alias.includes(normalizedRole))) {
            return profile;
        }
    }

    // Partial match on title
    for (const [key, profile] of Object.entries(ROLE_PROFILES)) {
        if (profile.title.toLowerCase().includes(normalizedRole) || normalizedRole.includes(profile.title.toLowerCase())) {
            return profile;
        }
    }

    return null;
}

export interface RoleSuggestions {
    highlightThese: string[];
    addTheseSkills: string[];
    rewriteSuggestions: { section: string; suggestion: string }[];
    experiencePatterns: string[];
    projectIdeas: string[];
}

/**
 * Get role-specific suggestions for resume optimization
 */
export function getRoleSuggestions(
    targetRole: string,
    resumeData: ResumeData
): RoleSuggestions {
    const profile = findRoleProfile(targetRole);

    if (!profile) {
        return {
            highlightThese: [],
            addTheseSkills: [],
            rewriteSuggestions: [],
            experiencePatterns: [],
            projectIdeas: []
        };
    }

    // Extract user skills from resume
    const userSkills: string[] = [];
    if (resumeData.skills && Array.isArray(resumeData.skills)) {
        if (typeof resumeData.skills[0] === 'string') {
            userSkills.push(...(resumeData.skills as string[]).map(s => s.toLowerCase()));
        } else {
            (resumeData.skills as any[]).forEach(cat => {
                if (cat.items && Array.isArray(cat.items)) {
                    userSkills.push(...cat.items.map((s: string) => s.toLowerCase()));
                }
            });
        }
    }

    // Find skills to highlight (user has these)
    const highlightThese = profile.mustHaveSkills.filter(skill =>
        userSkills.some(us => 
            us.includes(skill.toLowerCase()) || 
            skill.toLowerCase().includes(us)
        )
    );

    // Find missing must-have skills
    const missingMustHaves = profile.mustHaveSkills.filter(skill =>
        !userSkills.some(us => 
            us.includes(skill.toLowerCase()) || 
            skill.toLowerCase().includes(us)
        )
    );

    // Also suggest nice-to-have skills user doesn't have
    const missingNiceToHaves = profile.niceToHaveSkills.filter(skill =>
        !userSkills.some(us => 
            us.includes(skill.toLowerCase()) || 
            skill.toLowerCase().includes(us)
        )
    ).slice(0, 5);

    const suggestions: RoleSuggestions = {
        highlightThese,
        addTheseSkills: [...missingMustHaves.slice(0, 5), ...missingNiceToHaves.slice(0, 3)],
        rewriteSuggestions: [],
        experiencePatterns: profile.experiencePatterns,
        projectIdeas: profile.commonProjects
    };

    // Add section-specific rewrite suggestions
    if (highlightThese.length > 0) {
        suggestions.rewriteSuggestions.push({
            section: 'Professional Summary',
            suggestion: `Emphasize your experience with ${highlightThese.slice(0, 3).join(', ')} as these are critical for ${profile.title} roles.`
        });
    }

    if (profile.experiencePatterns.length > 0) {
        suggestions.rewriteSuggestions.push({
            section: 'Experience',
            suggestion: `Use quantified metrics like "${profile.experiencePatterns[0]}" to demonstrate impact.`
        });
    }

    if (missingMustHaves.length > 0) {
        suggestions.rewriteSuggestions.push({
            section: 'Skills',
            suggestion: `Consider adding or learning: ${missingMustHaves.slice(0, 3).join(', ')} - these are commonly required for ${profile.title} positions.`
        });
    }

    if (profile.commonProjects.length > 0) {
        suggestions.rewriteSuggestions.push({
            section: 'Projects',
            suggestion: `Highlight projects related to: ${profile.commonProjects.slice(0, 3).join(', ')} which are valued in ${profile.title} roles.`
        });
    }

    return suggestions;
}

/**
 * Get industry keywords for a role
 */
export function getRoleKeywords(targetRole: string): string[] {
    const profile = findRoleProfile(targetRole);
    if (!profile) return [];

    return [
        ...profile.mustHaveSkills,
        ...profile.niceToHaveSkills,
        ...profile.industryKeywords
    ];
}
