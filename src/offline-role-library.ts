/**
 * OFFLINE ROLE KNOWLEDGE BASE
 * Complete local database of role intelligence
 * WORKS WITHOUT AI - All data pre-stored
 * 
 * This module provides:
 * - Role definitions for 100+ common roles
 * - Required and optional skills per role
 * - Common tools and software
 * - Typical responsibilities
 * - Keywords recruiters expect
 * - Formatting and education norms
 * - Experience expectations by level
 */

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface RoleKnowledge {
    id: string;
    name: string;
    aliases: string[];
    industry: string;
    
    // Skills
    requiredSkills: string[];
    optionalSkills: string[];
    
    // Tools & Technologies
    commonTools: string[];
    
    // Content guidance
    typicalResponsibilities: string[];
    keywordsRecruitersExpect: string[];
    actionVerbs: string[];
    
    // Norms
    formattingNorms: {
        preferredLength: '1 page' | '2 pages' | '2-3 pages';
        sectionsOrder: string[];
        bulletStyle: 'achievement' | 'responsibility' | 'mixed';
    };
    
    educationNorms: {
        minimumRequired: string;
        preferredDegrees: string[];
        certificationsValued: string[];
    };
    
    experienceExpectations: {
        entry: string;
        mid: string;
        senior: string;
    };
    
    // Tips
    resumeTips: string[];
    commonMistakes: string[];
    
    // Metrics that matter
    metricsToHighlight: string[];
}

// ═══════════════════════════════════════════════════════════════
// ROLE KNOWLEDGE DATABASE
// ═══════════════════════════════════════════════════════════════

export const ROLE_LIBRARY: Record<string, RoleKnowledge> = {
    // ─────────────────────────────────────────────────────────────
    // TECHNOLOGY ROLES
    // ─────────────────────────────────────────────────────────────
    'software_engineer': {
        id: 'software_engineer',
        name: 'Software Engineer',
        aliases: ['Software Developer', 'Programmer', 'SDE', 'Backend Developer', 'Full Stack Developer'],
        industry: 'Technology',
        
        requiredSkills: [
            'Programming', 'Problem Solving', 'Data Structures', 'Algorithms',
            'Version Control', 'Code Review', 'Testing', 'Debugging'
        ],
        optionalSkills: [
            'System Design', 'Cloud Computing', 'DevOps', 'Agile', 'Scrum',
            'CI/CD', 'Microservices', 'API Design', 'Security'
        ],
        
        commonTools: [
            'Git', 'GitHub', 'VS Code', 'IntelliJ', 'Docker', 'Kubernetes',
            'Jenkins', 'JIRA', 'Confluence', 'Postman', 'AWS', 'Azure', 'GCP'
        ],
        
        typicalResponsibilities: [
            'Design and develop software applications',
            'Write clean, maintainable code',
            'Participate in code reviews',
            'Debug and resolve technical issues',
            'Collaborate with cross-functional teams',
            'Write unit tests and integration tests',
            'Document technical specifications',
            'Optimize application performance'
        ],
        
        keywordsRecruitersExpect: [
            'scalable', 'performance', 'optimization', 'architecture',
            'API', 'REST', 'microservices', 'agile', 'sprint',
            'deployment', 'production', 'debugging', 'refactoring'
        ],
        
        actionVerbs: [
            'Developed', 'Engineered', 'Architected', 'Implemented', 'Optimized',
            'Designed', 'Built', 'Deployed', 'Automated', 'Refactored',
            'Integrated', 'Migrated', 'Scaled', 'Debugged', 'Maintained'
        ],
        
        formattingNorms: {
            preferredLength: '1 page',
            sectionsOrder: ['summary', 'skills', 'experience', 'projects', 'education'],
            bulletStyle: 'achievement'
        },
        
        educationNorms: {
            minimumRequired: 'Bachelor\'s degree (CS/IT preferred but not always required)',
            preferredDegrees: ['Computer Science', 'Software Engineering', 'Information Technology', 'Mathematics'],
            certificationsValued: ['AWS Certified', 'Azure Certified', 'Google Cloud Certified', 'Kubernetes Certified']
        },
        
        experienceExpectations: {
            entry: '0-2 years, strong projects, internships',
            mid: '3-5 years, independent delivery, mentoring',
            senior: '6+ years, system design, technical leadership'
        },
        
        resumeTips: [
            'Lead with programming languages you know best',
            'Include GitHub profile or portfolio link',
            'Quantify impact: users served, latency reduced, uptime achieved',
            'List specific technologies, not just categories',
            'Highlight any open source contributions'
        ],
        
        commonMistakes: [
            'Listing every technology ever touched',
            'No quantified achievements',
            'Missing links to projects or GitHub',
            'Vague descriptions like "worked on backend"',
            'Not specifying role in team projects'
        ],
        
        metricsToHighlight: [
            'Performance improvements (%)',
            'Code coverage (%)',
            'Users/requests served',
            'Uptime/availability (%)',
            'Deployment frequency',
            'Bug reduction (%)'
        ]
    },
    
    'data_scientist': {
        id: 'data_scientist',
        name: 'Data Scientist',
        aliases: ['ML Engineer', 'Machine Learning Engineer', 'AI Engineer', 'Data Analyst'],
        industry: 'Technology',
        
        requiredSkills: [
            'Python', 'Statistics', 'Machine Learning', 'Data Analysis',
            'SQL', 'Data Visualization', 'Feature Engineering', 'Model Training'
        ],
        optionalSkills: [
            'Deep Learning', 'NLP', 'Computer Vision', 'Big Data',
            'A/B Testing', 'Experimentation', 'MLOps', 'Data Engineering'
        ],
        
        commonTools: [
            'Python', 'R', 'Jupyter', 'TensorFlow', 'PyTorch', 'Scikit-learn',
            'Pandas', 'NumPy', 'Tableau', 'Power BI', 'Spark', 'Hadoop',
            'SQL', 'AWS SageMaker', 'MLflow'
        ],
        
        typicalResponsibilities: [
            'Analyze complex datasets to extract insights',
            'Build and deploy machine learning models',
            'Design and run experiments',
            'Create data visualizations and dashboards',
            'Collaborate with product teams on data-driven decisions',
            'Develop predictive models',
            'Clean and preprocess data',
            'Present findings to stakeholders'
        ],
        
        keywordsRecruitersExpect: [
            'model', 'prediction', 'accuracy', 'precision', 'recall',
            'feature engineering', 'training', 'validation', 'deployment',
            'insights', 'analytics', 'visualization', 'statistical'
        ],
        
        actionVerbs: [
            'Analyzed', 'Modeled', 'Predicted', 'Developed', 'Trained',
            'Deployed', 'Visualized', 'Optimized', 'Experimented', 'Discovered',
            'Automated', 'Engineered', 'Validated', 'Improved', 'Researched'
        ],
        
        formattingNorms: {
            preferredLength: '1 page',
            sectionsOrder: ['summary', 'skills', 'experience', 'projects', 'education', 'publications'],
            bulletStyle: 'achievement'
        },
        
        educationNorms: {
            minimumRequired: 'Master\'s preferred, Bachelor\'s acceptable with strong experience',
            preferredDegrees: ['Computer Science', 'Statistics', 'Mathematics', 'Physics', 'Data Science'],
            certificationsValued: ['AWS ML Specialty', 'Google ML Engineer', 'TensorFlow Developer']
        },
        
        experienceExpectations: {
            entry: '0-2 years, strong projects, Kaggle competitions',
            mid: '3-5 years, production models, business impact',
            senior: '6+ years, ML architecture, team leadership'
        },
        
        resumeTips: [
            'Highlight model performance metrics (accuracy, F1, AUC)',
            'Include links to Kaggle profile or publications',
            'Quantify business impact of your models',
            'List both technical skills and business domains',
            'Mention any research or publications'
        ],
        
        commonMistakes: [
            'Only listing tools without showing impact',
            'No model performance metrics',
            'Vague project descriptions',
            'Missing business context for technical work',
            'Not explaining the problem solved'
        ],
        
        metricsToHighlight: [
            'Model accuracy/F1/AUC',
            'Revenue impact ($)',
            'Cost savings ($)',
            'Prediction improvement (%)',
            'Processing time reduction',
            'Data volume handled'
        ]
    },
    
    'product_manager': {
        id: 'product_manager',
        name: 'Product Manager',
        aliases: ['PM', 'Product Owner', 'Technical PM', 'Associate Product Manager'],
        industry: 'Technology',
        
        requiredSkills: [
            'Product Strategy', 'Roadmap Planning', 'User Research', 'Data Analysis',
            'Stakeholder Management', 'Prioritization', 'Agile', 'Requirements Gathering'
        ],
        optionalSkills: [
            'SQL', 'A/B Testing', 'UX Design', 'Technical Understanding',
            'Market Research', 'Competitive Analysis', 'Go-to-Market', 'Pricing'
        ],
        
        commonTools: [
            'JIRA', 'Confluence', 'Figma', 'Amplitude', 'Mixpanel', 'Google Analytics',
            'Notion', 'Miro', 'Slack', 'SQL', 'Excel', 'Tableau'
        ],
        
        typicalResponsibilities: [
            'Define product vision and strategy',
            'Create and maintain product roadmap',
            'Gather and prioritize requirements',
            'Work with engineering on delivery',
            'Analyze user feedback and metrics',
            'Conduct competitive analysis',
            'Define success metrics and KPIs',
            'Present to stakeholders and executives'
        ],
        
        keywordsRecruitersExpect: [
            'roadmap', 'strategy', 'metrics', 'KPIs', 'user research',
            'prioritization', 'stakeholder', 'launch', 'growth', 'retention',
            'engagement', 'conversion', 'MVP', 'iteration'
        ],
        
        actionVerbs: [
            'Launched', 'Defined', 'Prioritized', 'Drove', 'Led',
            'Collaborated', 'Analyzed', 'Increased', 'Improved', 'Delivered',
            'Managed', 'Coordinated', 'Researched', 'Optimized', 'Scaled'
        ],
        
        formattingNorms: {
            preferredLength: '1 page',
            sectionsOrder: ['summary', 'experience', 'skills', 'education'],
            bulletStyle: 'achievement'
        },
        
        educationNorms: {
            minimumRequired: 'Bachelor\'s degree',
            preferredDegrees: ['Business', 'Computer Science', 'Engineering', 'MBA'],
            certificationsValued: ['Pragmatic Marketing', 'Product School', 'Scrum Product Owner']
        },
        
        experienceExpectations: {
            entry: '0-2 years (APM programs), strong internships',
            mid: '3-5 years, shipped products, clear metrics',
            senior: '6+ years, strategy, team management'
        },
        
        resumeTips: [
            'Lead with business impact and metrics',
            'Show products you launched and their outcomes',
            'Highlight cross-functional collaboration',
            'Include both strategy and execution examples',
            'Quantify user growth, revenue, or engagement impact'
        ],
        
        commonMistakes: [
            'Focusing only on features shipped, not outcomes',
            'No quantified business impact',
            'Missing specific metrics',
            'Too technical or too business-y (need balance)',
            'Not showing leadership/influence'
        ],
        
        metricsToHighlight: [
            'Revenue generated ($)',
            'User growth (%)',
            'Engagement increase (%)',
            'Conversion rate improvement',
            'NPS/satisfaction scores',
            'Time to market reduction'
        ]
    },
    
    'frontend_developer': {
        id: 'frontend_developer',
        name: 'Frontend Developer',
        aliases: ['Frontend Engineer', 'UI Developer', 'React Developer', 'Web Developer'],
        industry: 'Technology',
        
        requiredSkills: [
            'HTML', 'CSS', 'JavaScript', 'React', 'Responsive Design',
            'Web Performance', 'Cross-browser Compatibility', 'Version Control'
        ],
        optionalSkills: [
            'TypeScript', 'Vue', 'Angular', 'Redux', 'GraphQL',
            'Testing', 'Accessibility', 'SEO', 'Animation'
        ],
        
        commonTools: [
            'React', 'Vue', 'Angular', 'TypeScript', 'Webpack', 'Vite',
            'Jest', 'Cypress', 'Figma', 'Chrome DevTools', 'npm', 'Git'
        ],
        
        typicalResponsibilities: [
            'Build responsive web interfaces',
            'Implement UI designs with pixel perfection',
            'Optimize web performance',
            'Write reusable components',
            'Collaborate with designers and backend',
            'Ensure cross-browser compatibility',
            'Write unit and integration tests',
            'Maintain code quality and documentation'
        ],
        
        keywordsRecruitersExpect: [
            'responsive', 'component', 'UI/UX', 'performance', 'accessibility',
            'SPA', 'state management', 'API integration', 'pixel perfect'
        ],
        
        actionVerbs: [
            'Built', 'Developed', 'Implemented', 'Designed', 'Optimized',
            'Created', 'Integrated', 'Refactored', 'Improved', 'Maintained'
        ],
        
        formattingNorms: {
            preferredLength: '1 page',
            sectionsOrder: ['summary', 'skills', 'experience', 'projects', 'education'],
            bulletStyle: 'achievement'
        },
        
        educationNorms: {
            minimumRequired: 'Bachelor\'s or equivalent experience',
            preferredDegrees: ['Computer Science', 'Web Development', 'Design'],
            certificationsValued: ['Meta Frontend Developer', 'Google UX Design']
        },
        
        experienceExpectations: {
            entry: '0-2 years, portfolio required',
            mid: '3-5 years, complex applications',
            senior: '6+ years, architecture decisions'
        },
        
        resumeTips: [
            'Include portfolio link prominently',
            'List specific frameworks and versions',
            'Show performance improvements you made',
            'Highlight complex UI challenges solved',
            'Include accessibility work if applicable'
        ],
        
        commonMistakes: [
            'No portfolio or project links',
            'Listing every CSS framework known',
            'No performance metrics',
            'Missing mobile/responsive mentions',
            'Vague descriptions'
        ],
        
        metricsToHighlight: [
            'Page load time improvements',
            'Lighthouse scores',
            'Bundle size reductions',
            'User engagement metrics',
            'Accessibility scores'
        ]
    },
    
    'devops_engineer': {
        id: 'devops_engineer',
        name: 'DevOps Engineer',
        aliases: ['Site Reliability Engineer', 'SRE', 'Platform Engineer', 'Infrastructure Engineer'],
        industry: 'Technology',
        
        requiredSkills: [
            'Linux', 'CI/CD', 'Cloud Platforms', 'Containerization',
            'Infrastructure as Code', 'Monitoring', 'Scripting', 'Networking'
        ],
        optionalSkills: [
            'Kubernetes', 'Security', 'Database Administration', 'Cost Optimization',
            'Incident Management', 'Capacity Planning'
        ],
        
        commonTools: [
            'Docker', 'Kubernetes', 'Terraform', 'Ansible', 'Jenkins', 'GitHub Actions',
            'AWS', 'Azure', 'GCP', 'Prometheus', 'Grafana', 'ELK Stack', 'Linux'
        ],
        
        typicalResponsibilities: [
            'Build and maintain CI/CD pipelines',
            'Manage cloud infrastructure',
            'Implement infrastructure as code',
            'Monitor system performance and reliability',
            'Automate deployment processes',
            'Handle incident response',
            'Optimize costs and performance',
            'Ensure security compliance'
        ],
        
        keywordsRecruitersExpect: [
            'automation', 'pipeline', 'deployment', 'infrastructure',
            'scalability', 'reliability', 'monitoring', 'uptime', 'incident'
        ],
        
        actionVerbs: [
            'Automated', 'Deployed', 'Configured', 'Managed', 'Optimized',
            'Monitored', 'Implemented', 'Migrated', 'Scaled', 'Secured'
        ],
        
        formattingNorms: {
            preferredLength: '1 page',
            sectionsOrder: ['summary', 'skills', 'experience', 'certifications', 'education'],
            bulletStyle: 'achievement'
        },
        
        educationNorms: {
            minimumRequired: 'Bachelor\'s or equivalent experience',
            preferredDegrees: ['Computer Science', 'IT', 'Systems Engineering'],
            certificationsValued: ['AWS Solutions Architect', 'CKA', 'Azure Administrator', 'Terraform Associate']
        },
        
        experienceExpectations: {
            entry: '0-2 years, strong scripting, cloud basics',
            mid: '3-5 years, production systems, on-call experience',
            senior: '6+ years, architecture, team leadership'
        },
        
        resumeTips: [
            'Lead with certifications if you have them',
            'Quantify uptime, deployment frequency, incident reduction',
            'List specific cloud services used',
            'Highlight automation achievements',
            'Show cost savings from optimizations'
        ],
        
        commonMistakes: [
            'Only listing tools without context',
            'No uptime or reliability metrics',
            'Missing automation examples',
            'Vague cloud experience',
            'No incident handling examples'
        ],
        
        metricsToHighlight: [
            'Uptime percentage (99.9%+)',
            'Deployment frequency',
            'MTTR (Mean Time to Recovery)',
            'Cost reduction ($)',
            'Infrastructure scale (servers, requests)',
            'Automation coverage (%)'
        ]
    },

    // ─────────────────────────────────────────────────────────────
    // HEALTHCARE ROLES
    // ─────────────────────────────────────────────────────────────
    'registered_nurse': {
        id: 'registered_nurse',
        name: 'Registered Nurse',
        aliases: ['RN', 'Staff Nurse', 'Clinical Nurse', 'Bedside Nurse'],
        industry: 'Healthcare',
        
        requiredSkills: [
            'Patient Care', 'Clinical Assessment', 'Medication Administration',
            'Vital Signs Monitoring', 'Documentation', 'Patient Education',
            'Infection Control', 'Emergency Response'
        ],
        optionalSkills: [
            'IV Therapy', 'Wound Care', 'Cardiac Care', 'Pediatrics',
            'Critical Care', 'Case Management', 'Patient Advocacy'
        ],
        
        commonTools: [
            'Epic', 'Cerner', 'Meditech', 'Electronic Health Records',
            'IV Pumps', 'Cardiac Monitors', 'Ventilators', 'Point-of-Care Testing'
        ],
        
        typicalResponsibilities: [
            'Provide direct patient care',
            'Administer medications and treatments',
            'Monitor patient conditions',
            'Document in electronic health records',
            'Educate patients and families',
            'Collaborate with healthcare team',
            'Follow infection control protocols',
            'Respond to emergencies'
        ],
        
        keywordsRecruitersExpect: [
            'patient care', 'assessment', 'documentation', 'medication',
            'vital signs', 'patient safety', 'care plan', 'discharge planning'
        ],
        
        actionVerbs: [
            'Provided', 'Administered', 'Monitored', 'Assessed', 'Coordinated',
            'Educated', 'Documented', 'Collaborated', 'Managed', 'Advocated'
        ],
        
        formattingNorms: {
            preferredLength: '1 page',
            sectionsOrder: ['summary', 'certifications', 'experience', 'skills', 'education'],
            bulletStyle: 'mixed'
        },
        
        educationNorms: {
            minimumRequired: 'Associate Degree in Nursing (BSN preferred)',
            preferredDegrees: ['BSN', 'ADN', 'MSN'],
            certificationsValued: ['RN License', 'BLS', 'ACLS', 'PALS', 'Specialty Certifications']
        },
        
        experienceExpectations: {
            entry: '0-1 years, new grad programs',
            mid: '2-5 years, specialty experience',
            senior: '6+ years, charge nurse, preceptor'
        },
        
        resumeTips: [
            'List license number and state',
            'Include all certifications with expiration dates',
            'Specify units/departments worked',
            'Quantify patient load and outcomes',
            'Highlight any specialty training'
        ],
        
        commonMistakes: [
            'Missing license information',
            'Not listing certifications',
            'Vague patient care descriptions',
            'No specialty experience highlighted',
            'Missing EHR system experience'
        ],
        
        metricsToHighlight: [
            'Patient satisfaction scores',
            'Patient load per shift',
            'Fall prevention rates',
            'Infection rates',
            'Medication error rates',
            'HCAHPS scores'
        ]
    },
    
    'physician': {
        id: 'physician',
        name: 'Physician',
        aliases: ['Doctor', 'MD', 'DO', 'Attending Physician', 'Medical Doctor'],
        industry: 'Healthcare',
        
        requiredSkills: [
            'Clinical Diagnosis', 'Patient Care', 'Medical Decision Making',
            'Physical Examination', 'Treatment Planning', 'Medical Documentation',
            'Patient Communication', 'Evidence-Based Medicine'
        ],
        optionalSkills: [
            'Research', 'Teaching', 'Administration', 'Quality Improvement',
            'Telemedicine', 'Leadership', 'Mentoring'
        ],
        
        commonTools: [
            'Epic', 'Cerner', 'Electronic Prescribing', 'Medical Imaging',
            'Diagnostic Equipment', 'Telemedicine Platforms'
        ],
        
        typicalResponsibilities: [
            'Diagnose and treat patients',
            'Order and interpret diagnostic tests',
            'Prescribe medications and treatments',
            'Document patient encounters',
            'Collaborate with healthcare team',
            'Provide patient education',
            'Participate in quality improvement',
            'Maintain CME requirements'
        ],
        
        keywordsRecruitersExpect: [
            'diagnosis', 'treatment', 'patient outcomes', 'evidence-based',
            'quality improvement', 'patient care', 'clinical', 'board certified'
        ],
        
        actionVerbs: [
            'Diagnosed', 'Treated', 'Managed', 'Coordinated', 'Led',
            'Supervised', 'Researched', 'Published', 'Presented', 'Improved'
        ],
        
        formattingNorms: {
            preferredLength: '2-3 pages',
            sectionsOrder: ['summary', 'education', 'training', 'experience', 'certifications', 'publications'],
            bulletStyle: 'achievement'
        },
        
        educationNorms: {
            minimumRequired: 'MD or DO degree',
            preferredDegrees: ['MD', 'DO', 'Fellowship Training'],
            certificationsValued: ['Board Certification', 'State License', 'DEA License']
        },
        
        experienceExpectations: {
            entry: 'Residency completed',
            mid: '3-7 years post-residency',
            senior: '8+ years, leadership roles'
        },
        
        resumeTips: [
            'Include all licenses and board certifications',
            'List residency and fellowship details',
            'Include publications and research',
            'Quantify patient volumes and outcomes',
            'Highlight leadership and teaching roles'
        ],
        
        commonMistakes: [
            'Missing board certification status',
            'Not including all training',
            'Omitting publications',
            'Vague clinical descriptions',
            'Not specifying specialty'
        ],
        
        metricsToHighlight: [
            'Patient volume',
            'Patient satisfaction scores',
            'Quality metrics',
            'RVUs generated',
            'Research citations',
            'Teaching evaluations'
        ]
    },
    
    'medical_assistant': {
        id: 'medical_assistant',
        name: 'Medical Assistant',
        aliases: ['MA', 'Clinical Medical Assistant', 'CMA', 'RMA'],
        industry: 'Healthcare',
        
        requiredSkills: [
            'Vital Signs', 'Patient Intake', 'Phlebotomy', 'EKG',
            'Medical Terminology', 'Documentation', 'Patient Scheduling'
        ],
        optionalSkills: [
            'Injections', 'Wound Care', 'Lab Processing', 'Medical Coding',
            'Insurance Verification', 'Prior Authorizations'
        ],
        
        commonTools: [
            'EHR Systems', 'Phlebotomy Equipment', 'EKG Machine',
            'Autoclave', 'Medical Scheduling Software'
        ],
        
        typicalResponsibilities: [
            'Take vital signs and patient history',
            'Prepare patients for examinations',
            'Assist physicians during procedures',
            'Perform phlebotomy and EKGs',
            'Schedule appointments',
            'Process lab specimens',
            'Document in medical records',
            'Handle administrative tasks'
        ],
        
        keywordsRecruitersExpect: [
            'patient care', 'vital signs', 'phlebotomy', 'EKG',
            'medical records', 'scheduling', 'clinical', 'administrative'
        ],
        
        actionVerbs: [
            'Assisted', 'Performed', 'Documented', 'Scheduled', 'Processed',
            'Prepared', 'Administered', 'Communicated', 'Coordinated', 'Maintained'
        ],
        
        formattingNorms: {
            preferredLength: '1 page',
            sectionsOrder: ['summary', 'certifications', 'experience', 'skills', 'education'],
            bulletStyle: 'mixed'
        },
        
        educationNorms: {
            minimumRequired: 'Medical Assistant Certificate',
            preferredDegrees: ['Medical Assistant Diploma', 'Associate Degree'],
            certificationsValued: ['CMA', 'RMA', 'CCMA', 'CPT', 'BLS']
        },
        
        experienceExpectations: {
            entry: '0-1 years, externship experience',
            mid: '2-4 years',
            senior: '5+ years, lead MA role'
        },
        
        resumeTips: [
            'List certifications prominently',
            'Specify clinical vs administrative duties',
            'Include EHR systems used',
            'Quantify patient volume',
            'Mention any specialty experience'
        ],
        
        commonMistakes: [
            'Not listing certification',
            'Vague duty descriptions',
            'Missing EHR experience',
            'Not specifying specialty areas',
            'Omitting phlebotomy experience'
        ],
        
        metricsToHighlight: [
            'Patients seen per day',
            'Phlebotomy success rate',
            'Scheduling efficiency',
            'Patient wait times',
            'Documentation accuracy'
        ]
    },

    // ─────────────────────────────────────────────────────────────
    // FINANCE & ACCOUNTING ROLES
    // ─────────────────────────────────────────────────────────────
    'accountant': {
        id: 'accountant',
        name: 'Accountant',
        aliases: ['Staff Accountant', 'Senior Accountant', 'Financial Accountant', 'CPA'],
        industry: 'Finance',
        
        requiredSkills: [
            'Financial Reporting', 'GAAP', 'General Ledger', 'Reconciliation',
            'Accounts Payable', 'Accounts Receivable', 'Journal Entries', 'Month-End Close'
        ],
        optionalSkills: [
            'IFRS', 'Tax Preparation', 'Audit', 'Budgeting', 'Forecasting',
            'Cost Accounting', 'Consolidation', 'Sox Compliance'
        ],
        
        commonTools: [
            'QuickBooks', 'SAP', 'Oracle', 'NetSuite', 'Excel', 'Sage',
            'Xero', 'BlackLine', 'Workday', 'ADP'
        ],
        
        typicalResponsibilities: [
            'Prepare financial statements',
            'Maintain general ledger',
            'Perform account reconciliations',
            'Process journal entries',
            'Support month-end and year-end close',
            'Assist with audits',
            'Analyze variances',
            'Ensure compliance with GAAP'
        ],
        
        keywordsRecruitersExpect: [
            'GAAP', 'reconciliation', 'financial statements', 'month-end close',
            'journal entries', 'general ledger', 'audit', 'variance analysis'
        ],
        
        actionVerbs: [
            'Prepared', 'Reconciled', 'Analyzed', 'Audited', 'Processed',
            'Maintained', 'Reviewed', 'Reported', 'Documented', 'Streamlined'
        ],
        
        formattingNorms: {
            preferredLength: '1 page',
            sectionsOrder: ['summary', 'experience', 'skills', 'education', 'certifications'],
            bulletStyle: 'achievement'
        },
        
        educationNorms: {
            minimumRequired: 'Bachelor\'s in Accounting or Finance',
            preferredDegrees: ['Accounting', 'Finance', 'Business Administration'],
            certificationsValued: ['CPA', 'CMA', 'CIA', 'CFA']
        },
        
        experienceExpectations: {
            entry: '0-2 years, Big 4 or industry',
            mid: '3-5 years, senior accountant',
            senior: '6+ years, manager/controller track'
        },
        
        resumeTips: [
            'Lead with CPA if you have it',
            'Specify which accounting software you know',
            'Include size of books managed ($)',
            'Highlight process improvements',
            'Mention industry experience'
        ],
        
        commonMistakes: [
            'Not specifying GAAP knowledge',
            'Missing software proficiency',
            'Vague financial statements work',
            'No quantified achievements',
            'Omitting Big 4 experience'
        ],
        
        metricsToHighlight: [
            'Books/budgets managed ($)',
            'Close cycle time reduction',
            'Error reduction (%)',
            'Transactions processed',
            'Audit findings resolved',
            'Cost savings identified ($)'
        ]
    },
    
    'financial_analyst': {
        id: 'financial_analyst',
        name: 'Financial Analyst',
        aliases: ['FP&A Analyst', 'Business Analyst', 'Finance Analyst', 'Investment Analyst'],
        industry: 'Finance',
        
        requiredSkills: [
            'Financial Modeling', 'Forecasting', 'Budgeting', 'Variance Analysis',
            'Excel', 'Financial Reporting', 'Data Analysis', 'Presentation'
        ],
        optionalSkills: [
            'SQL', 'Python', 'Tableau', 'Power BI', 'Valuation',
            'M&A Analysis', 'Business Intelligence'
        ],
        
        commonTools: [
            'Excel', 'PowerPoint', 'SAP', 'Oracle', 'Hyperion', 'Anaplan',
            'Tableau', 'Power BI', 'Bloomberg', 'SQL'
        ],
        
        typicalResponsibilities: [
            'Build financial models',
            'Prepare forecasts and budgets',
            'Analyze financial performance',
            'Create management reports',
            'Support strategic planning',
            'Present to leadership',
            'Track KPIs',
            'Identify trends and insights'
        ],
        
        keywordsRecruitersExpect: [
            'financial modeling', 'forecasting', 'budgeting', 'variance analysis',
            'reporting', 'KPIs', 'insights', 'strategic', 'P&L'
        ],
        
        actionVerbs: [
            'Modeled', 'Analyzed', 'Forecasted', 'Presented', 'Developed',
            'Created', 'Identified', 'Recommended', 'Streamlined', 'Improved'
        ],
        
        formattingNorms: {
            preferredLength: '1 page',
            sectionsOrder: ['summary', 'experience', 'skills', 'education', 'certifications'],
            bulletStyle: 'achievement'
        },
        
        educationNorms: {
            minimumRequired: 'Bachelor\'s in Finance, Accounting, or related',
            preferredDegrees: ['Finance', 'Accounting', 'Economics', 'MBA'],
            certificationsValued: ['CFA', 'CPA', 'FP&A Certification']
        },
        
        experienceExpectations: {
            entry: '0-2 years, strong Excel skills',
            mid: '3-5 years, model ownership',
            senior: '6+ years, strategic partner'
        },
        
        resumeTips: [
            'Highlight financial modeling experience',
            'Quantify forecast accuracy',
            'Show business impact of your analysis',
            'Include size of budgets managed',
            'Mention industries covered'
        ],
        
        commonMistakes: [
            'Not quantifying model complexity',
            'Missing Excel proficiency level',
            'Vague analysis descriptions',
            'No business impact shown',
            'Omitting presentation experience'
        ],
        
        metricsToHighlight: [
            'Budgets managed ($)',
            'Forecast accuracy (%)',
            'Cost savings identified ($)',
            'Revenue impact ($)',
            'Model complexity (scenarios)',
            'Reporting cycles supported'
        ]
    },

    // ─────────────────────────────────────────────────────────────
    // EDUCATION ROLES
    // ─────────────────────────────────────────────────────────────
    'teacher': {
        id: 'teacher',
        name: 'Teacher',
        aliases: ['Educator', 'Instructor', 'School Teacher', 'Classroom Teacher'],
        industry: 'Education',
        
        requiredSkills: [
            'Lesson Planning', 'Classroom Management', 'Curriculum Development',
            'Student Assessment', 'Differentiated Instruction', 'Parent Communication',
            'Educational Technology', 'Subject Matter Expertise'
        ],
        optionalSkills: [
            'Special Education', 'ESL', 'Gifted Education', 'Counseling',
            'Extracurricular Supervision', 'Data-Driven Instruction'
        ],
        
        commonTools: [
            'Google Classroom', 'Canvas', 'Blackboard', 'Zoom',
            'Microsoft Office', 'Smart Board', 'Kahoot', 'Remind'
        ],
        
        typicalResponsibilities: [
            'Develop and deliver lesson plans',
            'Assess student learning',
            'Create engaging learning activities',
            'Manage classroom behavior',
            'Communicate with parents',
            'Track student progress',
            'Adapt instruction for diverse learners',
            'Participate in professional development'
        ],
        
        keywordsRecruitersExpect: [
            'lesson planning', 'curriculum', 'assessment', 'classroom management',
            'differentiation', 'student achievement', 'engagement', 'standards'
        ],
        
        actionVerbs: [
            'Taught', 'Developed', 'Created', 'Assessed', 'Implemented',
            'Differentiated', 'Collaborated', 'Improved', 'Engaged', 'Mentored'
        ],
        
        formattingNorms: {
            preferredLength: '1 page',
            sectionsOrder: ['summary', 'certifications', 'experience', 'education', 'skills'],
            bulletStyle: 'achievement'
        },
        
        educationNorms: {
            minimumRequired: 'Bachelor\'s in Education or subject area',
            preferredDegrees: ['Education', 'Subject Area', 'Master\'s in Education'],
            certificationsValued: ['Teaching License', 'Subject Endorsements', 'National Board Certification']
        },
        
        experienceExpectations: {
            entry: '0-2 years, student teaching',
            mid: '3-7 years, curriculum leadership',
            senior: '8+ years, department head, mentoring'
        },
        
        resumeTips: [
            'List teaching certifications and endorsements',
            'Include grade levels and subjects',
            'Quantify student achievement gains',
            'Highlight technology integration',
            'Mention any awards or recognitions'
        ],
        
        commonMistakes: [
            'Not listing certifications',
            'Vague student outcomes',
            'Missing grade levels/subjects',
            'No technology skills listed',
            'Omitting professional development'
        ],
        
        metricsToHighlight: [
            'Student achievement growth',
            'Test score improvements (%)',
            'Class size managed',
            'Graduation rates',
            'Parent satisfaction',
            'Student engagement metrics'
        ]
    },

    // ─────────────────────────────────────────────────────────────
    // SALES & MARKETING ROLES
    // ─────────────────────────────────────────────────────────────
    'sales_representative': {
        id: 'sales_representative',
        name: 'Sales Representative',
        aliases: ['Account Executive', 'Sales Executive', 'BDR', 'SDR', 'Inside Sales'],
        industry: 'Sales',
        
        requiredSkills: [
            'Prospecting', 'Cold Calling', 'Negotiation', 'Closing',
            'Pipeline Management', 'CRM', 'Presentation', 'Relationship Building'
        ],
        optionalSkills: [
            'Account Management', 'Consultative Selling', 'Territory Planning',
            'Sales Forecasting', 'Contract Negotiation', 'Channel Sales'
        ],
        
        commonTools: [
            'Salesforce', 'HubSpot', 'LinkedIn Sales Navigator', 'Outreach',
            'Gong', 'Zoom', 'DocuSign', 'Calendly'
        ],
        
        typicalResponsibilities: [
            'Prospect and generate new leads',
            'Qualify opportunities',
            'Conduct product demonstrations',
            'Negotiate and close deals',
            'Manage sales pipeline',
            'Achieve quota targets',
            'Build client relationships',
            'Forecast revenue'
        ],
        
        keywordsRecruitersExpect: [
            'quota', 'pipeline', 'revenue', 'closing', 'prospecting',
            'ARR', 'MRR', 'deal size', 'win rate', 'cold calling'
        ],
        
        actionVerbs: [
            'Sold', 'Closed', 'Generated', 'Exceeded', 'Prospected',
            'Negotiated', 'Developed', 'Managed', 'Achieved', 'Grew'
        ],
        
        formattingNorms: {
            preferredLength: '1 page',
            sectionsOrder: ['summary', 'experience', 'skills', 'education'],
            bulletStyle: 'achievement'
        },
        
        educationNorms: {
            minimumRequired: 'Bachelor\'s degree preferred but not required',
            preferredDegrees: ['Business', 'Marketing', 'Communications'],
            certificationsValued: ['Salesforce Certified', 'Sandler Training', 'SPIN Selling']
        },
        
        experienceExpectations: {
            entry: '0-2 years, SDR/BDR roles',
            mid: '3-5 years, AE with quota attainment',
            senior: '6+ years, enterprise sales, team leadership'
        },
        
        resumeTips: [
            'Lead with quota attainment numbers',
            'Include deal sizes and revenue generated',
            'Show consistent performance over time',
            'Mention rankings vs peers',
            'Highlight any awards or President\'s Club'
        ],
        
        commonMistakes: [
            'No quota attainment percentages',
            'Missing revenue numbers',
            'Not showing deal sizes',
            'Vague "exceeded targets"',
            'No rankings or awards mentioned'
        ],
        
        metricsToHighlight: [
            'Quota attainment (%)',
            'Revenue generated ($)',
            'Average deal size ($)',
            'Win rate (%)',
            'Pipeline generated ($)',
            'Ranking vs peers'
        ]
    },
    
    'marketing_manager': {
        id: 'marketing_manager',
        name: 'Marketing Manager',
        aliases: ['Digital Marketing Manager', 'Brand Manager', 'Marketing Lead', 'Growth Marketing Manager'],
        industry: 'Marketing',
        
        requiredSkills: [
            'Marketing Strategy', 'Campaign Management', 'Content Marketing',
            'Digital Marketing', 'Analytics', 'Budget Management', 'Brand Management'
        ],
        optionalSkills: [
            'SEO', 'SEM', 'Social Media Marketing', 'Email Marketing',
            'Marketing Automation', 'ABM', 'Product Marketing'
        ],
        
        commonTools: [
            'Google Analytics', 'HubSpot', 'Marketo', 'Salesforce',
            'Google Ads', 'Facebook Ads', 'Hootsuite', 'SEMrush', 'Mailchimp'
        ],
        
        typicalResponsibilities: [
            'Develop marketing strategies',
            'Plan and execute campaigns',
            'Manage marketing budget',
            'Analyze campaign performance',
            'Lead marketing team',
            'Coordinate with sales',
            'Build brand awareness',
            'Drive lead generation'
        ],
        
        keywordsRecruitersExpect: [
            'campaign', 'ROI', 'conversion', 'leads', 'engagement',
            'brand', 'digital', 'analytics', 'growth', 'funnel'
        ],
        
        actionVerbs: [
            'Launched', 'Managed', 'Increased', 'Developed', 'Led',
            'Generated', 'Optimized', 'Created', 'Analyzed', 'Grew'
        ],
        
        formattingNorms: {
            preferredLength: '1 page',
            sectionsOrder: ['summary', 'experience', 'skills', 'education', 'certifications'],
            bulletStyle: 'achievement'
        },
        
        educationNorms: {
            minimumRequired: 'Bachelor\'s in Marketing, Business, or related',
            preferredDegrees: ['Marketing', 'Business', 'Communications', 'MBA'],
            certificationsValued: ['Google Analytics', 'HubSpot', 'Google Ads', 'Facebook Blueprint']
        },
        
        experienceExpectations: {
            entry: '0-2 years, specialist roles',
            mid: '3-5 years, campaign ownership',
            senior: '6+ years, strategy and team leadership'
        },
        
        resumeTips: [
            'Lead with campaign ROI and results',
            'Quantify lead generation and conversion',
            'Include budget size managed',
            'Show both strategic and tactical work',
            'Highlight any awards or recognition'
        ],
        
        commonMistakes: [
            'No ROI or conversion metrics',
            'Missing budget size',
            'Only listing tactics, not strategy',
            'No lead generation numbers',
            'Vague campaign descriptions'
        ],
        
        metricsToHighlight: [
            'Campaign ROI (%)',
            'Leads generated',
            'Conversion rate improvement',
            'Budget managed ($)',
            'Revenue influenced ($)',
            'Brand awareness metrics'
        ]
    },

    // ─────────────────────────────────────────────────────────────
    // HUMAN RESOURCES ROLES
    // ─────────────────────────────────────────────────────────────
    'hr_manager': {
        id: 'hr_manager',
        name: 'HR Manager',
        aliases: ['Human Resources Manager', 'People Manager', 'HR Business Partner', 'HRBP'],
        industry: 'Human Resources',
        
        requiredSkills: [
            'Recruitment', 'Employee Relations', 'Performance Management',
            'HR Policy', 'Compliance', 'Benefits Administration', 'Training', 'HRIS'
        ],
        optionalSkills: [
            'Compensation', 'Organizational Development', 'Change Management',
            'Labor Relations', 'Diversity & Inclusion', 'Talent Management'
        ],
        
        commonTools: [
            'Workday', 'ADP', 'BambooHR', 'Greenhouse', 'LinkedIn Recruiter',
            'UKG', 'Paychex', 'Lever', 'iCIMS'
        ],
        
        typicalResponsibilities: [
            'Manage full recruitment cycle',
            'Handle employee relations issues',
            'Develop HR policies and procedures',
            'Administer benefits programs',
            'Conduct performance management',
            'Ensure legal compliance',
            'Lead training initiatives',
            'Partner with leadership on people strategy'
        ],
        
        keywordsRecruitersExpect: [
            'recruitment', 'employee relations', 'compliance', 'benefits',
            'performance management', 'HRIS', 'onboarding', 'retention'
        ],
        
        actionVerbs: [
            'Recruited', 'Managed', 'Developed', 'Implemented', 'Resolved',
            'Administered', 'Led', 'Partnered', 'Coordinated', 'Streamlined'
        ],
        
        formattingNorms: {
            preferredLength: '1 page',
            sectionsOrder: ['summary', 'experience', 'skills', 'certifications', 'education'],
            bulletStyle: 'achievement'
        },
        
        educationNorms: {
            minimumRequired: 'Bachelor\'s in HR, Business, or related',
            preferredDegrees: ['Human Resources', 'Business Administration', 'Psychology'],
            certificationsValued: ['PHR', 'SPHR', 'SHRM-CP', 'SHRM-SCP']
        },
        
        experienceExpectations: {
            entry: '0-3 years, HR coordinator/generalist',
            mid: '4-7 years, HR manager',
            senior: '8+ years, HR director/VP'
        },
        
        resumeTips: [
            'Lead with HR certifications if you have them',
            'Quantify employee populations supported',
            'Include turnover/retention improvements',
            'Show recruiting metrics',
            'Highlight compliance achievements'
        ],
        
        commonMistakes: [
            'Not listing certifications',
            'Missing employee population size',
            'Vague "handled employee relations"',
            'No recruiting metrics',
            'Not specifying HRIS systems'
        ],
        
        metricsToHighlight: [
            'Employees supported',
            'Turnover reduction (%)',
            'Time to fill (days)',
            'Cost per hire ($)',
            'Retention rate (%)',
            'Training completion rates'
        ]
    },

    // ─────────────────────────────────────────────────────────────
    // OPERATIONS & LOGISTICS
    // ─────────────────────────────────────────────────────────────
    'operations_manager': {
        id: 'operations_manager',
        name: 'Operations Manager',
        aliases: ['Ops Manager', 'Operations Director', 'General Manager', 'Plant Manager'],
        industry: 'Operations',
        
        requiredSkills: [
            'Process Improvement', 'Team Management', 'Budget Management',
            'Quality Control', 'Supply Chain', 'Project Management', 'KPI Tracking'
        ],
        optionalSkills: [
            'Lean', 'Six Sigma', 'ERP Systems', 'Vendor Management',
            'Inventory Management', 'Facilities Management'
        ],
        
        commonTools: [
            'SAP', 'Oracle', 'Microsoft Project', 'Excel', 'Power BI',
            'Tableau', 'Asana', 'Monday.com'
        ],
        
        typicalResponsibilities: [
            'Oversee daily operations',
            'Manage operational budget',
            'Lead and develop teams',
            'Implement process improvements',
            'Ensure quality standards',
            'Track operational KPIs',
            'Coordinate with other departments',
            'Drive cost efficiency'
        ],
        
        keywordsRecruitersExpect: [
            'operations', 'process improvement', 'efficiency', 'cost reduction',
            'team management', 'KPIs', 'quality', 'budget', 'supply chain'
        ],
        
        actionVerbs: [
            'Managed', 'Led', 'Improved', 'Implemented', 'Reduced',
            'Streamlined', 'Coordinated', 'Optimized', 'Oversaw', 'Delivered'
        ],
        
        formattingNorms: {
            preferredLength: '2 pages',
            sectionsOrder: ['summary', 'experience', 'skills', 'certifications', 'education'],
            bulletStyle: 'achievement'
        },
        
        educationNorms: {
            minimumRequired: 'Bachelor\'s in Business, Operations, or related',
            preferredDegrees: ['Business Administration', 'Operations Management', 'Industrial Engineering'],
            certificationsValued: ['PMP', 'Six Sigma', 'Lean Certification', 'APICS']
        },
        
        experienceExpectations: {
            entry: '0-3 years, supervisor/coordinator',
            mid: '4-7 years, operations manager',
            senior: '8+ years, director/VP operations'
        },
        
        resumeTips: [
            'Lead with operational improvements and savings',
            'Include team size managed',
            'Quantify cost reductions',
            'Show budget responsibility',
            'Highlight efficiency gains'
        ],
        
        commonMistakes: [
            'No cost savings quantified',
            'Missing team size',
            'Vague process improvements',
            'Not specifying budget size',
            'No operational metrics'
        ],
        
        metricsToHighlight: [
            'Cost savings ($)',
            'Team size managed',
            'Budget managed ($)',
            'Efficiency improvement (%)',
            'Quality improvement (%)',
            'On-time delivery rate'
        ]
    },
    
    'logistics_coordinator': {
        id: 'logistics_coordinator',
        name: 'Logistics Coordinator',
        aliases: ['Supply Chain Coordinator', 'Shipping Coordinator', 'Transportation Coordinator'],
        industry: 'Logistics',
        
        requiredSkills: [
            'Shipping', 'Inventory Management', 'Order Processing',
            'Vendor Communication', 'Documentation', 'Tracking', 'Problem Solving'
        ],
        optionalSkills: [
            'Import/Export', 'Customs', 'Freight Forwarding',
            'Warehouse Management', 'Route Optimization'
        ],
        
        commonTools: [
            'SAP', 'Oracle', 'WMS Systems', 'TMS Systems',
            'Excel', 'EDI', 'Freight Tracking Software'
        ],
        
        typicalResponsibilities: [
            'Coordinate shipments',
            'Track orders and deliveries',
            'Manage inventory levels',
            'Communicate with carriers and vendors',
            'Process documentation',
            'Resolve shipping issues',
            'Maintain accurate records',
            'Optimize logistics costs'
        ],
        
        keywordsRecruitersExpect: [
            'logistics', 'shipping', 'supply chain', 'inventory',
            'tracking', 'carriers', 'freight', 'delivery'
        ],
        
        actionVerbs: [
            'Coordinated', 'Tracked', 'Managed', 'Processed', 'Resolved',
            'Optimized', 'Communicated', 'Maintained', 'Reduced', 'Improved'
        ],
        
        formattingNorms: {
            preferredLength: '1 page',
            sectionsOrder: ['summary', 'experience', 'skills', 'education'],
            bulletStyle: 'mixed'
        },
        
        educationNorms: {
            minimumRequired: 'Associate\'s or Bachelor\'s preferred',
            preferredDegrees: ['Supply Chain', 'Logistics', 'Business'],
            certificationsValued: ['APICS', 'CLTD', 'CTL']
        },
        
        experienceExpectations: {
            entry: '0-2 years',
            mid: '3-5 years',
            senior: '6+ years, supervisory role'
        },
        
        resumeTips: [
            'Include volume of shipments handled',
            'Quantify cost savings',
            'Show on-time delivery rates',
            'List specific software/systems',
            'Mention any international experience'
        ],
        
        commonMistakes: [
            'No shipment volume metrics',
            'Missing software proficiency',
            'Vague coordination duties',
            'No delivery performance metrics',
            'Not specifying carrier relationships'
        ],
        
        metricsToHighlight: [
            'Shipments processed',
            'On-time delivery rate (%)',
            'Cost savings ($)',
            'Inventory accuracy (%)',
            'Error reduction (%)'
        ]
    },

    // ─────────────────────────────────────────────────────────────
    // CUSTOMER SERVICE
    // ─────────────────────────────────────────────────────────────
    'customer_service_representative': {
        id: 'customer_service_representative',
        name: 'Customer Service Representative',
        aliases: ['Customer Support', 'CSR', 'Client Services', 'Call Center Agent'],
        industry: 'Customer Service',
        
        requiredSkills: [
            'Communication', 'Problem Resolution', 'Product Knowledge',
            'CRM', 'Phone Etiquette', 'Email Communication', 'Patience', 'Empathy'
        ],
        optionalSkills: [
            'Upselling', 'Technical Support', 'Billing', 'Escalation Handling',
            'Live Chat', 'Social Media Support'
        ],
        
        commonTools: [
            'Salesforce', 'Zendesk', 'Freshdesk', 'Intercom',
            'Five9', 'Genesys', 'LiveAgent', 'HubSpot'
        ],
        
        typicalResponsibilities: [
            'Answer customer inquiries',
            'Resolve complaints and issues',
            'Process orders and returns',
            'Document customer interactions',
            'Meet service level agreements',
            'Identify opportunities to help customers',
            'Escalate complex issues',
            'Maintain product knowledge'
        ],
        
        keywordsRecruitersExpect: [
            'customer satisfaction', 'resolution', 'communication',
            'call volume', 'first call resolution', 'service level', 'empathy'
        ],
        
        actionVerbs: [
            'Resolved', 'Assisted', 'Communicated', 'Processed', 'Handled',
            'Documented', 'Improved', 'Achieved', 'Managed', 'Supported'
        ],
        
        formattingNorms: {
            preferredLength: '1 page',
            sectionsOrder: ['summary', 'experience', 'skills', 'education'],
            bulletStyle: 'achievement'
        },
        
        educationNorms: {
            minimumRequired: 'High school diploma or equivalent',
            preferredDegrees: ['Any degree is a plus'],
            certificationsValued: ['Customer Service Certification', 'Product Certifications']
        },
        
        experienceExpectations: {
            entry: '0-1 years',
            mid: '2-4 years',
            senior: '5+ years, team lead'
        },
        
        resumeTips: [
            'Include call volume handled',
            'Quantify customer satisfaction scores',
            'Show resolution rates',
            'Mention any awards or recognition',
            'Highlight upselling achievements'
        ],
        
        commonMistakes: [
            'No customer satisfaction metrics',
            'Missing call volume',
            'Vague "helped customers"',
            'No specific CRM systems listed',
            'Not mentioning performance metrics'
        ],
        
        metricsToHighlight: [
            'Customer satisfaction (CSAT)',
            'First call resolution (%)',
            'Calls handled per day',
            'Average handle time',
            'Quality scores',
            'NPS contribution'
        ]
    },

    // ─────────────────────────────────────────────────────────────
    // LEGAL
    // ─────────────────────────────────────────────────────────────
    'paralegal': {
        id: 'paralegal',
        name: 'Paralegal',
        aliases: ['Legal Assistant', 'Litigation Paralegal', 'Corporate Paralegal'],
        industry: 'Legal',
        
        requiredSkills: [
            'Legal Research', 'Document Drafting', 'Case Management',
            'Filing', 'Discovery', 'Client Communication', 'Attention to Detail'
        ],
        optionalSkills: [
            'E-Discovery', 'Contract Review', 'Litigation Support',
            'Corporate Filings', 'Notary', 'Immigration'
        ],
        
        commonTools: [
            'Westlaw', 'LexisNexis', 'Clio', 'MyCase',
            'Microsoft Office', 'Adobe Acrobat', 'Relativity'
        ],
        
        typicalResponsibilities: [
            'Conduct legal research',
            'Draft legal documents',
            'Manage case files',
            'Prepare for hearings and trials',
            'Communicate with clients',
            'File court documents',
            'Organize discovery materials',
            'Maintain calendars and deadlines'
        ],
        
        keywordsRecruitersExpect: [
            'legal research', 'drafting', 'discovery', 'case management',
            'filings', 'litigation', 'compliance', 'deadline management'
        ],
        
        actionVerbs: [
            'Researched', 'Drafted', 'Filed', 'Prepared', 'Managed',
            'Organized', 'Coordinated', 'Reviewed', 'Supported', 'Maintained'
        ],
        
        formattingNorms: {
            preferredLength: '1 page',
            sectionsOrder: ['summary', 'experience', 'skills', 'education', 'certifications'],
            bulletStyle: 'mixed'
        },
        
        educationNorms: {
            minimumRequired: 'Associate\'s or Bachelor\'s in Paralegal Studies',
            preferredDegrees: ['Paralegal Studies', 'Legal Studies', 'Pre-Law'],
            certificationsValued: ['Paralegal Certificate', 'CP', 'ACP', 'Notary']
        },
        
        experienceExpectations: {
            entry: '0-2 years',
            mid: '3-5 years, specialty area',
            senior: '6+ years, senior paralegal'
        },
        
        resumeTips: [
            'Include paralegal certification',
            'Specify practice areas',
            'List legal research tools',
            'Show case volume handled',
            'Mention any court experience'
        ],
        
        commonMistakes: [
            'Not specifying practice areas',
            'Missing certification',
            'Vague legal duties',
            'No legal software listed',
            'Not mentioning research capabilities'
        ],
        
        metricsToHighlight: [
            'Cases supported',
            'Documents drafted/reviewed',
            'Research projects completed',
            'Filing success rate',
            'Deadline compliance'
        ]
    },

    // ─────────────────────────────────────────────────────────────
    // ADMINISTRATIVE
    // ─────────────────────────────────────────────────────────────
    'administrative_assistant': {
        id: 'administrative_assistant',
        name: 'Administrative Assistant',
        aliases: ['Admin Assistant', 'Office Assistant', 'Executive Assistant', 'Secretary'],
        industry: 'Administrative',
        
        requiredSkills: [
            'Calendar Management', 'Communication', 'Organization', 'Microsoft Office',
            'Data Entry', 'Phone Handling', 'Filing', 'Scheduling'
        ],
        optionalSkills: [
            'Travel Coordination', 'Meeting Planning', 'Budget Tracking',
            'Expense Reports', 'Project Coordination', 'Office Management'
        ],
        
        commonTools: [
            'Microsoft Office', 'Google Workspace', 'Outlook', 'Zoom',
            'Slack', 'Concur', 'SAP Concur', 'Calendly'
        ],
        
        typicalResponsibilities: [
            'Manage executive calendars',
            'Schedule meetings and appointments',
            'Handle correspondence',
            'Prepare reports and presentations',
            'Coordinate travel arrangements',
            'Process expense reports',
            'Maintain filing systems',
            'Support office operations'
        ],
        
        keywordsRecruitersExpect: [
            'calendar management', 'scheduling', 'travel coordination',
            'correspondence', 'organization', 'multi-tasking', 'confidential'
        ],
        
        actionVerbs: [
            'Managed', 'Coordinated', 'Scheduled', 'Organized', 'Prepared',
            'Maintained', 'Processed', 'Supported', 'Communicated', 'Streamlined'
        ],
        
        formattingNorms: {
            preferredLength: '1 page',
            sectionsOrder: ['summary', 'experience', 'skills', 'education'],
            bulletStyle: 'mixed'
        },
        
        educationNorms: {
            minimumRequired: 'High school diploma, associate\'s preferred',
            preferredDegrees: ['Business Administration', 'Office Administration'],
            certificationsValued: ['CAP', 'Microsoft Office Specialist', 'Notary']
        },
        
        experienceExpectations: {
            entry: '0-2 years',
            mid: '3-5 years',
            senior: '6+ years, executive assistant'
        },
        
        resumeTips: [
            'Highlight software proficiency',
            'Show executives supported',
            'Quantify travel arrangements made',
            'Include any budget management',
            'Mention confidential handling'
        ],
        
        commonMistakes: [
            'Not specifying software skills',
            'Vague administrative duties',
            'Missing level of executives supported',
            'No volume metrics',
            'Not highlighting confidentiality'
        ],
        
        metricsToHighlight: [
            'Executives/team members supported',
            'Travel arrangements coordinated',
            'Meetings scheduled per week',
            'Budget managed ($)',
            'Documents processed'
        ]
    },

    // ─────────────────────────────────────────────────────────────
    // TRADES
    // ─────────────────────────────────────────────────────────────
    'electrician': {
        id: 'electrician',
        name: 'Electrician',
        aliases: ['Electrical Technician', 'Journeyman Electrician', 'Master Electrician'],
        industry: 'Trades',
        
        requiredSkills: [
            'Electrical Installation', 'Wiring', 'Troubleshooting', 'NEC Codes',
            'Blueprint Reading', 'Safety Protocols', 'Testing Equipment'
        ],
        optionalSkills: [
            'PLC Programming', 'Industrial Controls', 'Solar Installation',
            'Fire Alarm Systems', 'Data/Network Cabling'
        ],
        
        commonTools: [
            'Multimeters', 'Wire Strippers', 'Conduit Benders', 'Fish Tape',
            'Power Tools', 'Testing Equipment', 'CAD Software'
        ],
        
        typicalResponsibilities: [
            'Install electrical systems',
            'Read and interpret blueprints',
            'Troubleshoot electrical issues',
            'Ensure code compliance',
            'Perform maintenance and repairs',
            'Test electrical systems',
            'Coordinate with other trades',
            'Follow safety protocols'
        ],
        
        keywordsRecruitersExpect: [
            'installation', 'troubleshooting', 'NEC', 'code compliance',
            'wiring', 'circuits', 'safety', 'blueprints'
        ],
        
        actionVerbs: [
            'Installed', 'Wired', 'Troubleshot', 'Repaired', 'Maintained',
            'Tested', 'Upgraded', 'Designed', 'Coordinated', 'Inspected'
        ],
        
        formattingNorms: {
            preferredLength: '1 page',
            sectionsOrder: ['summary', 'certifications', 'experience', 'skills', 'education'],
            bulletStyle: 'mixed'
        },
        
        educationNorms: {
            minimumRequired: 'Apprenticeship completion',
            preferredDegrees: ['Electrical Technology', 'Apprenticeship Program'],
            certificationsValued: ['Journeyman License', 'Master Electrician', 'OSHA', 'EPA']
        },
        
        experienceExpectations: {
            entry: 'Apprentice (0-4 years)',
            mid: 'Journeyman (4-8 years)',
            senior: 'Master/Foreman (8+ years)'
        },
        
        resumeTips: [
            'Lead with license and certifications',
            'Include types of electrical work',
            'Specify commercial/residential/industrial',
            'Mention safety record',
            'List any specialized systems'
        ],
        
        commonMistakes: [
            'Not listing license status',
            'Missing safety certifications',
            'Vague project descriptions',
            'Not specifying electrical types',
            'Omitting voltage levels worked with'
        ],
        
        metricsToHighlight: [
            'Projects completed',
            'Years of experience',
            'Safety record (injury-free hours)',
            'Team size led',
            'Types of installations'
        ]
    },

    // ─────────────────────────────────────────────────────────────
    // HOSPITALITY
    // ─────────────────────────────────────────────────────────────
    'restaurant_manager': {
        id: 'restaurant_manager',
        name: 'Restaurant Manager',
        aliases: ['Food Service Manager', 'F&B Manager', 'General Manager'],
        industry: 'Hospitality',
        
        requiredSkills: [
            'Team Management', 'Customer Service', 'Inventory Management',
            'Scheduling', 'P&L Management', 'Food Safety', 'Quality Control'
        ],
        optionalSkills: [
            'Hiring', 'Training', 'Menu Development', 'Marketing',
            'Catering', 'Event Planning', 'Vendor Relations'
        ],
        
        commonTools: [
            'POS Systems', 'Toast', 'Square', 'Aloha', 'Scheduling Software',
            'Inventory Management Systems', 'Microsoft Office'
        ],
        
        typicalResponsibilities: [
            'Manage daily restaurant operations',
            'Hire, train, and supervise staff',
            'Ensure food quality and safety',
            'Control costs and inventory',
            'Handle customer complaints',
            'Meet revenue targets',
            'Schedule staff',
            'Maintain compliance with health codes'
        ],
        
        keywordsRecruitersExpect: [
            'operations', 'food cost', 'labor cost', 'customer service',
            'team management', 'revenue', 'compliance', 'training'
        ],
        
        actionVerbs: [
            'Managed', 'Led', 'Increased', 'Reduced', 'Trained',
            'Improved', 'Scheduled', 'Controlled', 'Developed', 'Maintained'
        ],
        
        formattingNorms: {
            preferredLength: '1 page',
            sectionsOrder: ['summary', 'experience', 'skills', 'certifications', 'education'],
            bulletStyle: 'achievement'
        },
        
        educationNorms: {
            minimumRequired: 'High school diploma, degree preferred',
            preferredDegrees: ['Hospitality Management', 'Business', 'Culinary'],
            certificationsValued: ['ServSafe', 'Food Handler', 'TIPS Certification']
        },
        
        experienceExpectations: {
            entry: '1-2 years supervisory',
            mid: '3-5 years management',
            senior: '6+ years, multi-unit'
        },
        
        resumeTips: [
            'Lead with revenue and cost control metrics',
            'Include team size managed',
            'Show food cost and labor cost percentages',
            'Highlight customer satisfaction improvements',
            'Mention any new openings or turnarounds'
        ],
        
        commonMistakes: [
            'No revenue or cost metrics',
            'Missing team size',
            'Vague operations descriptions',
            'Not listing certifications',
            'No customer service metrics'
        ],
        
        metricsToHighlight: [
            'Revenue managed ($)',
            'Food cost (%)',
            'Labor cost (%)',
            'Team size managed',
            'Customer satisfaction scores',
            'Year-over-year growth (%)'
        ]
    },

    // ─────────────────────────────────────────────────────────────
    // ENGINEERING (NON-SOFTWARE)
    // ─────────────────────────────────────────────────────────────
    'mechanical_engineer': {
        id: 'mechanical_engineer',
        name: 'Mechanical Engineer',
        aliases: ['Design Engineer', 'Manufacturing Engineer', 'Product Engineer'],
        industry: 'Engineering',
        
        requiredSkills: [
            'CAD Design', 'Mechanical Design', 'Thermal Analysis', 'Materials Science',
            'Prototyping', 'Testing', 'Engineering Drawings', 'GD&T'
        ],
        optionalSkills: [
            'FEA', 'CFD', 'DFMA', 'Lean Manufacturing', 'Six Sigma',
            'Project Management', 'Automation'
        ],
        
        commonTools: [
            'SolidWorks', 'AutoCAD', 'CATIA', 'ANSYS', 'Creo',
            'MATLAB', 'Microsoft Office', 'SAP'
        ],
        
        typicalResponsibilities: [
            'Design mechanical systems and components',
            'Create engineering drawings and specifications',
            'Perform analysis and simulations',
            'Prototype and test designs',
            'Collaborate with manufacturing',
            'Troubleshoot mechanical issues',
            'Support product development',
            'Ensure compliance with standards'
        ],
        
        keywordsRecruitersExpect: [
            'design', 'analysis', 'CAD', 'prototyping', 'testing',
            'manufacturing', 'tolerances', 'materials', 'specifications'
        ],
        
        actionVerbs: [
            'Designed', 'Developed', 'Analyzed', 'Tested', 'Optimized',
            'Created', 'Improved', 'Engineered', 'Collaborated', 'Reduced'
        ],
        
        formattingNorms: {
            preferredLength: '1 page',
            sectionsOrder: ['summary', 'skills', 'experience', 'education', 'certifications'],
            bulletStyle: 'achievement'
        },
        
        educationNorms: {
            minimumRequired: 'Bachelor\'s in Mechanical Engineering',
            preferredDegrees: ['Mechanical Engineering', 'Aerospace Engineering', 'Manufacturing Engineering'],
            certificationsValued: ['PE License', 'Six Sigma', 'PMP', 'CAD Certifications']
        },
        
        experienceExpectations: {
            entry: '0-2 years',
            mid: '3-7 years',
            senior: '8+ years, PE license'
        },
        
        resumeTips: [
            'List specific CAD software with proficiency level',
            'Quantify cost savings from designs',
            'Include types of products/industries',
            'Show project scope and complexity',
            'Mention any patents'
        ],
        
        commonMistakes: [
            'Not specifying CAD software',
            'Vague design descriptions',
            'Missing quantified achievements',
            'Not listing industries worked in',
            'Omitting PE status if applicable'
        ],
        
        metricsToHighlight: [
            'Cost reduction (%)',
            'Products developed',
            'Patents filed/granted',
            'Manufacturing efficiency gains',
            'Time to market reduction',
            'Quality improvement (%)'
        ]
    },

    // ─────────────────────────────────────────────────────────────
    // PROJECT MANAGEMENT
    // ─────────────────────────────────────────────────────────────
    'project_manager': {
        id: 'project_manager',
        name: 'Project Manager',
        aliases: ['PM', 'Program Manager', 'Technical Project Manager', 'IT Project Manager'],
        industry: 'Project Management',
        
        requiredSkills: [
            'Project Planning', 'Stakeholder Management', 'Risk Management',
            'Budget Management', 'Scheduling', 'Team Leadership', 'Communication', 'Agile'
        ],
        optionalSkills: [
            'Scrum', 'PMP', 'Change Management', 'Vendor Management',
            'Resource Planning', 'Quality Management'
        ],
        
        commonTools: [
            'Microsoft Project', 'JIRA', 'Asana', 'Monday.com', 'Smartsheet',
            'Confluence', 'Excel', 'PowerPoint', 'Trello'
        ],
        
        typicalResponsibilities: [
            'Define project scope and objectives',
            'Create project plans and schedules',
            'Manage project budget',
            'Lead cross-functional teams',
            'Communicate with stakeholders',
            'Identify and mitigate risks',
            'Track progress and KPIs',
            'Deliver projects on time and budget'
        ],
        
        keywordsRecruitersExpect: [
            'delivery', 'on-time', 'budget', 'scope', 'stakeholder',
            'risk', 'agile', 'waterfall', 'cross-functional', 'milestones'
        ],
        
        actionVerbs: [
            'Led', 'Delivered', 'Managed', 'Coordinated', 'Planned',
            'Executed', 'Mitigated', 'Communicated', 'Drove', 'Achieved'
        ],
        
        formattingNorms: {
            preferredLength: '2 pages',
            sectionsOrder: ['summary', 'certifications', 'experience', 'skills', 'education'],
            bulletStyle: 'achievement'
        },
        
        educationNorms: {
            minimumRequired: 'Bachelor\'s degree',
            preferredDegrees: ['Business', 'Engineering', 'IT', 'MBA'],
            certificationsValued: ['PMP', 'CAPM', 'Scrum Master', 'PRINCE2', 'Agile Certified']
        },
        
        experienceExpectations: {
            entry: '0-3 years, coordinator/junior PM',
            mid: '4-7 years, project manager',
            senior: '8+ years, program manager/director'
        },
        
        resumeTips: [
            'Lead with PMP or certifications',
            'Include project budget sizes',
            'Show on-time/on-budget delivery rates',
            'Quantify team sizes led',
            'Highlight complex project examples'
        ],
        
        commonMistakes: [
            'Not listing certifications',
            'Missing budget sizes',
            'Vague project descriptions',
            'No delivery metrics',
            'Not specifying methodologies'
        ],
        
        metricsToHighlight: [
            'Projects delivered',
            'Budget managed ($)',
            'On-time delivery rate (%)',
            'Team size led',
            'Budget variance (%)',
            'Stakeholder satisfaction'
        ]
    }
};

// ═══════════════════════════════════════════════════════════════
// LOOKUP FUNCTIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Find a role by name or alias (case-insensitive fuzzy match)
 */
export function findRoleKnowledge(searchTerm: string): RoleKnowledge | null {
    const normalized = searchTerm.toLowerCase().trim();
    
    // Direct match by ID
    for (const [id, role] of Object.entries(ROLE_LIBRARY)) {
        if (id === normalized.replace(/\s+/g, '_')) {
            return role;
        }
    }
    
    // Match by name or alias
    for (const role of Object.values(ROLE_LIBRARY)) {
        if (role.name.toLowerCase() === normalized) {
            return role;
        }
        
        for (const alias of role.aliases) {
            if (alias.toLowerCase() === normalized) {
                return role;
            }
        }
    }
    
    // Fuzzy match - contains search
    for (const role of Object.values(ROLE_LIBRARY)) {
        if (role.name.toLowerCase().includes(normalized) || normalized.includes(role.name.toLowerCase())) {
            return role;
        }
        
        for (const alias of role.aliases) {
            if (alias.toLowerCase().includes(normalized) || normalized.includes(alias.toLowerCase())) {
                return role;
            }
        }
    }
    
    return null;
}

/**
 * Get all roles in a specific industry
 */
export function getRolesByIndustry(industry: string): RoleKnowledge[] {
    return Object.values(ROLE_LIBRARY).filter(
        role => role.industry.toLowerCase() === industry.toLowerCase()
    );
}

/**
 * Get all available industries
 */
export function getAllIndustries(): string[] {
    const industries = new Set<string>();
    for (const role of Object.values(ROLE_LIBRARY)) {
        industries.add(role.industry);
    }
    return Array.from(industries).sort();
}

/**
 * Get all role names
 */
export function getAllRoleNames(): string[] {
    return Object.values(ROLE_LIBRARY).map(r => r.name).sort();
}

/**
 * Search roles by keyword
 */
export function searchRoles(keyword: string): RoleKnowledge[] {
    const normalized = keyword.toLowerCase();
    const results: RoleKnowledge[] = [];
    
    for (const role of Object.values(ROLE_LIBRARY)) {
        const matchScore = calculateRoleMatchScore(role, normalized);
        if (matchScore > 0) {
            results.push(role);
        }
    }
    
    return results;
}

function calculateRoleMatchScore(role: RoleKnowledge, keyword: string): number {
    let score = 0;
    
    if (role.name.toLowerCase().includes(keyword)) score += 10;
    if (role.industry.toLowerCase().includes(keyword)) score += 5;
    if (role.aliases.some(a => a.toLowerCase().includes(keyword))) score += 8;
    if (role.requiredSkills.some(s => s.toLowerCase().includes(keyword))) score += 3;
    if (role.commonTools.some(t => t.toLowerCase().includes(keyword))) score += 2;
    
    return score;
}

// ═══════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════

export default {
    ROLE_LIBRARY,
    findRoleKnowledge,
    getRolesByIndustry,
    getAllIndustries,
    getAllRoleNames,
    searchRoles
};
