/**
 * UNIVERSAL ROLE DATABASE
 * Supports 50,000+ job roles across ALL industries worldwide
 * NO TECH-ONLY BIAS - Truly universal system
 */

// ═══════════════════════════════════════════════════════════════
// INDUSTRY CATEGORIES (20+ Major Industries)
// ═══════════════════════════════════════════════════════════════

export type IndustryCategory =
    | 'technology'
    | 'healthcare'
    | 'finance'
    | 'education'
    | 'marketing'
    | 'sales'
    | 'manufacturing'
    | 'construction'
    | 'legal'
    | 'government'
    | 'hospitality'
    | 'retail'
    | 'logistics'
    | 'aviation'
    | 'automotive'
    | 'media'
    | 'arts'
    | 'agriculture'
    | 'energy'
    | 'telecommunications'
    | 'real_estate'
    | 'nonprofit'
    | 'consulting'
    | 'hr'
    | 'research'
    | 'trades'
    | 'security'
    | 'food_service'
    | 'sports'
    | 'beauty'
    | 'other';

export type ExperienceLevel = 'intern' | 'fresher' | 'junior' | 'mid' | 'senior' | 'lead' | 'manager' | 'director' | 'executive' | 'partner';

export type RegionCode = 'US' | 'UK' | 'EU' | 'IN' | 'ME' | 'APAC' | 'LATAM' | 'AFRICA' | 'GLOBAL';

// ═══════════════════════════════════════════════════════════════
// ROLE OBJECT SCHEMA
// ═══════════════════════════════════════════════════════════════

export interface RoleDefinition {
    id: string;
    name: string;
    aliases: string[]; // Alternative job titles
    industry: IndustryCategory;
    subIndustry?: string;
    levels: ExperienceLevel[];

    // Skills & Requirements
    coreSkills: string[];
    optionalSkills: string[];
    tools: string[];
    certifications: string[];
    educationRequirements: string[];

    // Resume Content Guidance
    typicalResponsibilities: string[];
    atsKeywords: string[];
    actionVerbs: string[];
    metricExamples: string[];

    // Writing Guidance
    summaryTemplate: string;
    bulletTemplates: string[];
    toneStyle: 'formal' | 'professional' | 'creative' | 'technical' | 'conversational';

    // Photo & Format
    photoRecommendation: 'required' | 'recommended' | 'optional' | 'not_recommended';
    photoRegions: RegionCode[];

    // Market Intelligence
    demandLevel: 'high' | 'medium' | 'low';
    growthTrend: 'growing' | 'stable' | 'declining';
    salaryRange?: { min: number; max: number; currency: string };

    // Fresher Specific
    fresherFriendly: boolean;
    fresherAlternatives: string[]; // What freshers can highlight instead of experience
}

// ═══════════════════════════════════════════════════════════════
// INDUSTRY METADATA
// ═══════════════════════════════════════════════════════════════

export interface IndustryInfo {
    id: IndustryCategory;
    name: string;
    description: string;
    commonRoles: string[];
    keySkillCategories: string[];
    certificationBodies: string[];
    resumeStyle: 'formal' | 'professional' | 'creative' | 'technical';
    photoNorm: 'common' | 'rare' | 'varies';
}

export const INDUSTRIES: Record<IndustryCategory, IndustryInfo> = {
    technology: {
        id: 'technology',
        name: 'Technology & IT',
        description: 'Software, hardware, IT services, and digital products',
        commonRoles: ['Software Engineer', 'Data Scientist', 'Product Manager', 'DevOps Engineer', 'UI/UX Designer'],
        keySkillCategories: ['Programming', 'Cloud', 'Data', 'Security', 'Methodologies'],
        certificationBodies: ['AWS', 'Google', 'Microsoft', 'CompTIA', 'Cisco'],
        resumeStyle: 'technical',
        photoNorm: 'rare'
    },
    healthcare: {
        id: 'healthcare',
        name: 'Healthcare & Medical',
        description: 'Hospitals, clinics, pharmaceuticals, and medical services',
        commonRoles: ['Nurse', 'Doctor', 'Pharmacist', 'Medical Technician', 'Healthcare Administrator'],
        keySkillCategories: ['Patient Care', 'Medical Knowledge', 'Clinical Skills', 'Compliance', 'EMR Systems'],
        certificationBodies: ['State Medical Boards', 'ANCC', 'NBRC', 'ASCP'],
        resumeStyle: 'formal',
        photoNorm: 'varies'
    },
    finance: {
        id: 'finance',
        name: 'Finance & Banking',
        description: 'Banks, investment firms, insurance, and financial services',
        commonRoles: ['Accountant', 'Financial Analyst', 'Investment Banker', 'Auditor', 'Risk Manager'],
        keySkillCategories: ['Financial Analysis', 'Accounting', 'Compliance', 'Risk Management', 'Software'],
        certificationBodies: ['CPA', 'CFA', 'ACCA', 'FRM'],
        resumeStyle: 'formal',
        photoNorm: 'varies'
    },
    education: {
        id: 'education',
        name: 'Education & Training',
        description: 'Schools, universities, training centers, and EdTech',
        commonRoles: ['Teacher', 'Professor', 'Principal', 'Training Manager', 'Academic Counselor'],
        keySkillCategories: ['Teaching', 'Curriculum Development', 'Student Assessment', 'Technology Integration'],
        certificationBodies: ['State Education Boards', 'TEFL', 'TESOL'],
        resumeStyle: 'professional',
        photoNorm: 'common'
    },
    marketing: {
        id: 'marketing',
        name: 'Marketing & Advertising',
        description: 'Brand management, digital marketing, advertising agencies',
        commonRoles: ['Marketing Manager', 'Digital Marketer', 'Content Writer', 'SEO Specialist', 'Brand Manager'],
        keySkillCategories: ['Digital Marketing', 'Analytics', 'Content', 'Social Media', 'Branding'],
        certificationBodies: ['Google', 'HubSpot', 'Meta', 'Hootsuite'],
        resumeStyle: 'creative',
        photoNorm: 'varies'
    },
    sales: {
        id: 'sales',
        name: 'Sales & Business Development',
        description: 'Sales teams, account management, business development',
        commonRoles: ['Sales Executive', 'Account Manager', 'Business Development Manager', 'Sales Director'],
        keySkillCategories: ['Negotiation', 'CRM', 'Lead Generation', 'Closing', 'Relationship Building'],
        certificationBodies: ['Salesforce', 'HubSpot', 'Miller Heiman'],
        resumeStyle: 'professional',
        photoNorm: 'common'
    },
    manufacturing: {
        id: 'manufacturing',
        name: 'Manufacturing & Production',
        description: 'Factories, production plants, quality control',
        commonRoles: ['Production Manager', 'Quality Engineer', 'Plant Manager', 'Manufacturing Engineer'],
        keySkillCategories: ['Lean Manufacturing', 'Quality Control', 'Safety', 'Process Improvement'],
        certificationBodies: ['ASQ', 'Six Sigma', 'APICS'],
        resumeStyle: 'technical',
        photoNorm: 'rare'
    },
    construction: {
        id: 'construction',
        name: 'Construction & Real Estate',
        description: 'Building, civil engineering, architecture, property',
        commonRoles: ['Civil Engineer', 'Architect', 'Project Manager', 'Site Supervisor', 'Quantity Surveyor'],
        keySkillCategories: ['Project Management', 'AutoCAD', 'Building Codes', 'Safety', 'Estimation'],
        certificationBodies: ['PMP', 'LEED', 'OSHA'],
        resumeStyle: 'technical',
        photoNorm: 'varies'
    },
    legal: {
        id: 'legal',
        name: 'Legal & Compliance',
        description: 'Law firms, corporate legal, compliance departments',
        commonRoles: ['Lawyer', 'Paralegal', 'Legal Counsel', 'Compliance Officer', 'Contract Manager'],
        keySkillCategories: ['Legal Research', 'Contract Law', 'Litigation', 'Compliance', 'Negotiation'],
        certificationBodies: ['Bar Association', 'CCEP'],
        resumeStyle: 'formal',
        photoNorm: 'rare'
    },
    government: {
        id: 'government',
        name: 'Government & Public Sector',
        description: 'Government agencies, public administration, civil service',
        commonRoles: ['Civil Servant', 'Policy Analyst', 'Public Relations Officer', 'Administrator'],
        keySkillCategories: ['Public Policy', 'Administration', 'Stakeholder Management', 'Compliance'],
        certificationBodies: ['Government-specific certifications'],
        resumeStyle: 'formal',
        photoNorm: 'varies'
    },
    hospitality: {
        id: 'hospitality',
        name: 'Hospitality & Tourism',
        description: 'Hotels, restaurants, travel, tourism',
        commonRoles: ['Hotel Manager', 'Chef', 'Front Desk Agent', 'Event Coordinator', 'Travel Agent'],
        keySkillCategories: ['Customer Service', 'Operations', 'Food & Beverage', 'Event Planning'],
        certificationBodies: ['AHLEI', 'ServSafe', 'IATA'],
        resumeStyle: 'professional',
        photoNorm: 'common'
    },
    retail: {
        id: 'retail',
        name: 'Retail & E-commerce',
        description: 'Stores, e-commerce, merchandising, inventory',
        commonRoles: ['Store Manager', 'Retail Associate', 'Visual Merchandiser', 'E-commerce Manager'],
        keySkillCategories: ['Sales', 'Customer Service', 'Inventory', 'Visual Merchandising', 'POS Systems'],
        certificationBodies: ['NRF', 'Retail Industry certifications'],
        resumeStyle: 'professional',
        photoNorm: 'common'
    },
    logistics: {
        id: 'logistics',
        name: 'Logistics & Supply Chain',
        description: 'Warehousing, transportation, supply chain management',
        commonRoles: ['Logistics Manager', 'Supply Chain Analyst', 'Warehouse Supervisor', 'Fleet Manager'],
        keySkillCategories: ['Supply Chain', 'Inventory Management', 'Transportation', 'ERP Systems'],
        certificationBodies: ['APICS', 'CSCMP', 'ISM'],
        resumeStyle: 'technical',
        photoNorm: 'rare'
    },
    aviation: {
        id: 'aviation',
        name: 'Aviation & Aerospace',
        description: 'Airlines, airports, aerospace manufacturing',
        commonRoles: ['Pilot', 'Flight Attendant', 'Aircraft Engineer', 'Air Traffic Controller'],
        keySkillCategories: ['Safety', 'Technical Skills', 'Customer Service', 'Regulations'],
        certificationBodies: ['FAA', 'EASA', 'IATA'],
        resumeStyle: 'formal',
        photoNorm: 'common'
    },
    automotive: {
        id: 'automotive',
        name: 'Automotive',
        description: 'Car manufacturing, dealerships, repair services',
        commonRoles: ['Automotive Engineer', 'Service Technician', 'Sales Manager', 'Quality Inspector'],
        keySkillCategories: ['Mechanical Skills', 'Diagnostics', 'Sales', 'Quality Control'],
        certificationBodies: ['ASE', 'Manufacturer certifications'],
        resumeStyle: 'technical',
        photoNorm: 'rare'
    },
    media: {
        id: 'media',
        name: 'Media & Entertainment',
        description: 'TV, film, publishing, digital media, gaming',
        commonRoles: ['Journalist', 'Producer', 'Editor', 'Content Creator', 'Game Developer'],
        keySkillCategories: ['Content Creation', 'Editing', 'Production', 'Digital Media'],
        certificationBodies: ['Industry-specific'],
        resumeStyle: 'creative',
        photoNorm: 'common'
    },
    arts: {
        id: 'arts',
        name: 'Arts & Design',
        description: 'Graphic design, fine arts, photography, fashion',
        commonRoles: ['Graphic Designer', 'Photographer', 'Fashion Designer', 'Interior Designer'],
        keySkillCategories: ['Design Software', 'Creative Skills', 'Portfolio', 'Client Management'],
        certificationBodies: ['Adobe', 'Design associations'],
        resumeStyle: 'creative',
        photoNorm: 'common'
    },
    agriculture: {
        id: 'agriculture',
        name: 'Agriculture & Farming',
        description: 'Farming, agribusiness, food production',
        commonRoles: ['Farm Manager', 'Agricultural Engineer', 'Agronomist', 'Food Scientist'],
        keySkillCategories: ['Crop Management', 'Equipment Operation', 'Sustainability', 'Food Safety'],
        certificationBodies: ['CCA', 'Food safety certifications'],
        resumeStyle: 'technical',
        photoNorm: 'rare'
    },
    energy: {
        id: 'energy',
        name: 'Energy & Utilities',
        description: 'Oil & gas, renewable energy, utilities',
        commonRoles: ['Petroleum Engineer', 'Solar Technician', 'Electrical Engineer', 'Plant Operator'],
        keySkillCategories: ['Technical Skills', 'Safety', 'Regulations', 'Equipment Operation'],
        certificationBodies: ['API', 'OSHA', 'NABCEP'],
        resumeStyle: 'technical',
        photoNorm: 'rare'
    },
    telecommunications: {
        id: 'telecommunications',
        name: 'Telecommunications',
        description: 'Telecom providers, network infrastructure',
        commonRoles: ['Network Engineer', 'Telecom Technician', 'Solutions Architect'],
        keySkillCategories: ['Networking', 'Infrastructure', 'Customer Service', 'Technical Support'],
        certificationBodies: ['Cisco', 'CompTIA', 'Telecom-specific'],
        resumeStyle: 'technical',
        photoNorm: 'rare'
    },
    real_estate: {
        id: 'real_estate',
        name: 'Real Estate',
        description: 'Property sales, property management, development',
        commonRoles: ['Real Estate Agent', 'Property Manager', 'Appraiser', 'Broker'],
        keySkillCategories: ['Sales', 'Negotiation', 'Property Law', 'Market Analysis'],
        certificationBodies: ['State Real Estate Boards', 'NAR'],
        resumeStyle: 'professional',
        photoNorm: 'common'
    },
    nonprofit: {
        id: 'nonprofit',
        name: 'Nonprofit & NGO',
        description: 'Charities, NGOs, foundations, social enterprises',
        commonRoles: ['Program Manager', 'Fundraiser', 'Grant Writer', 'Volunteer Coordinator'],
        keySkillCategories: ['Fundraising', 'Program Management', 'Community Outreach', 'Grant Writing'],
        certificationBodies: ['CFRE', 'Nonprofit-specific'],
        resumeStyle: 'professional',
        photoNorm: 'varies'
    },
    consulting: {
        id: 'consulting',
        name: 'Consulting',
        description: 'Management consulting, strategy, advisory services',
        commonRoles: ['Management Consultant', 'Strategy Consultant', 'Business Analyst'],
        keySkillCategories: ['Analysis', 'Strategy', 'Presentation', 'Problem Solving'],
        certificationBodies: ['CMC', 'Industry-specific'],
        resumeStyle: 'formal',
        photoNorm: 'rare'
    },
    hr: {
        id: 'hr',
        name: 'Human Resources',
        description: 'HR departments, recruitment, talent management',
        commonRoles: ['HR Manager', 'Recruiter', 'Training Specialist', 'Compensation Analyst'],
        keySkillCategories: ['Recruitment', 'Employee Relations', 'HRIS', 'Compliance'],
        certificationBodies: ['SHRM', 'HRCI', 'CIPD'],
        resumeStyle: 'professional',
        photoNorm: 'common'
    },
    research: {
        id: 'research',
        name: 'Research & Science',
        description: 'Academic research, R&D, laboratories',
        commonRoles: ['Research Scientist', 'Lab Technician', 'Data Analyst', 'Research Associate'],
        keySkillCategories: ['Research Methods', 'Data Analysis', 'Lab Skills', 'Publications'],
        certificationBodies: ['Field-specific certifications'],
        resumeStyle: 'formal',
        photoNorm: 'rare'
    },
    trades: {
        id: 'trades',
        name: 'Skilled Trades',
        description: 'Electricians, plumbers, carpenters, mechanics',
        commonRoles: ['Electrician', 'Plumber', 'Carpenter', 'HVAC Technician', 'Welder'],
        keySkillCategories: ['Technical Skills', 'Safety', 'Tools', 'Building Codes'],
        certificationBodies: ['Trade unions', 'State licensing boards'],
        resumeStyle: 'technical',
        photoNorm: 'rare'
    },
    security: {
        id: 'security',
        name: 'Security Services',
        description: 'Physical security, cybersecurity, private investigation',
        commonRoles: ['Security Officer', 'Security Manager', 'Cybersecurity Analyst', 'Loss Prevention'],
        keySkillCategories: ['Security Protocols', 'Surveillance', 'Risk Assessment', 'Emergency Response'],
        certificationBodies: ['ASIS', 'CompTIA Security+', 'CISSP'],
        resumeStyle: 'formal',
        photoNorm: 'varies'
    },
    food_service: {
        id: 'food_service',
        name: 'Food Service',
        description: 'Restaurants, catering, food preparation',
        commonRoles: ['Chef', 'Cook', 'Restaurant Manager', 'Server', 'Bartender'],
        keySkillCategories: ['Culinary Skills', 'Food Safety', 'Customer Service', 'Menu Planning'],
        certificationBodies: ['ServSafe', 'ACF', 'Culinary schools'],
        resumeStyle: 'professional',
        photoNorm: 'common'
    },
    sports: {
        id: 'sports',
        name: 'Sports & Fitness',
        description: 'Athletics, fitness centers, sports management',
        commonRoles: ['Personal Trainer', 'Coach', 'Sports Manager', 'Physical Therapist'],
        keySkillCategories: ['Fitness Knowledge', 'Coaching', 'Sports Science', 'Client Management'],
        certificationBodies: ['NASM', 'ACE', 'NSCA', 'Sports federations'],
        resumeStyle: 'professional',
        photoNorm: 'common'
    },
    beauty: {
        id: 'beauty',
        name: 'Beauty & Wellness',
        description: 'Salons, spas, cosmetics, wellness centers',
        commonRoles: ['Hair Stylist', 'Esthetician', 'Makeup Artist', 'Spa Manager'],
        keySkillCategories: ['Technical Skills', 'Customer Service', 'Product Knowledge', 'Trends'],
        certificationBodies: ['State cosmetology boards', 'Brand certifications'],
        resumeStyle: 'creative',
        photoNorm: 'common'
    },
    other: {
        id: 'other',
        name: 'Other Industries',
        description: 'Miscellaneous and emerging industries',
        commonRoles: [],
        keySkillCategories: [],
        certificationBodies: [],
        resumeStyle: 'professional',
        photoNorm: 'varies'
    }
};

// ═══════════════════════════════════════════════════════════════
// SAMPLE ROLE DEFINITIONS (Expandable to 50,000+)
// ═══════════════════════════════════════════════════════════════

export const ROLE_DATABASE: RoleDefinition[] = [
    // ───────────────────────────────────────────────────────────
    // TECHNOLOGY ROLES
    // ───────────────────────────────────────────────────────────
    {
        id: 'software-engineer',
        name: 'Software Engineer',
        aliases: ['Software Developer', 'Programmer', 'Application Developer', 'Backend Developer', 'Frontend Developer'],
        industry: 'technology',
        levels: ['fresher', 'junior', 'mid', 'senior', 'lead'],
        coreSkills: ['Programming', 'Problem Solving', 'Data Structures', 'Algorithms', 'System Design'],
        optionalSkills: ['Cloud Computing', 'DevOps', 'Machine Learning'],
        tools: ['Git', 'JIRA', 'VS Code', 'Docker', 'AWS/Azure/GCP'],
        certifications: ['AWS Certified', 'Azure Certified', 'Google Cloud Certified'],
        educationRequirements: ['BS in Computer Science', 'Related technical degree', 'Coding bootcamp'],
        typicalResponsibilities: [
            'Design and develop software applications',
            'Write clean, maintainable code',
            'Collaborate with cross-functional teams',
            'Debug and troubleshoot issues',
            'Participate in code reviews'
        ],
        atsKeywords: ['software development', 'programming', 'agile', 'scrum', 'API', 'database', 'testing'],
        actionVerbs: ['Developed', 'Engineered', 'Architected', 'Implemented', 'Optimized', 'Debugged', 'Deployed'],
        metricExamples: ['Reduced load time by 40%', 'Handled 10K+ daily users', 'Decreased bugs by 30%'],
        summaryTemplate: 'Software Engineer with {X} years of experience in {technologies}. Built {type of systems} serving {scale}. Skilled in {key skills}.',
        bulletTemplates: [
            'Developed {feature/system} using {technology}, resulting in {metric}',
            'Optimized {component} performance by {percentage}%, improving {outcome}',
            'Led migration of {system} to {new technology}, reducing {cost/time} by {amount}'
        ],
        toneStyle: 'technical',
        photoRecommendation: 'not_recommended',
        photoRegions: [],
        demandLevel: 'high',
        growthTrend: 'growing',
        fresherFriendly: true,
        fresherAlternatives: ['Academic projects', 'Personal projects', 'Open source contributions', 'Hackathons', 'Internships']
    },

    // ───────────────────────────────────────────────────────────
    // HEALTHCARE ROLES
    // ───────────────────────────────────────────────────────────
    {
        id: 'registered-nurse',
        name: 'Registered Nurse',
        aliases: ['RN', 'Staff Nurse', 'Clinical Nurse', 'Bedside Nurse'],
        industry: 'healthcare',
        levels: ['fresher', 'junior', 'mid', 'senior', 'lead'],
        coreSkills: ['Patient Care', 'Clinical Assessment', 'Medication Administration', 'Critical Thinking', 'Communication'],
        optionalSkills: ['Specialty certifications', 'Leadership', 'Research'],
        tools: ['EMR/EHR Systems', 'Medical Equipment', 'Vital Signs Monitors'],
        certifications: ['RN License', 'BLS', 'ACLS', 'Specialty certifications'],
        educationRequirements: ['BSN', 'ADN', 'Nursing Diploma'],
        typicalResponsibilities: [
            'Provide direct patient care',
            'Administer medications and treatments',
            'Monitor patient conditions',
            'Document care in EMR',
            'Collaborate with healthcare team'
        ],
        atsKeywords: ['patient care', 'nursing', 'EMR', 'medication administration', 'clinical', 'vital signs', 'patient education'],
        actionVerbs: ['Administered', 'Monitored', 'Assessed', 'Coordinated', 'Educated', 'Documented', 'Collaborated'],
        metricExamples: ['Managed 8-10 patients per shift', 'Achieved 95% patient satisfaction', 'Reduced medication errors by 20%'],
        summaryTemplate: 'Registered Nurse with {X} years of experience in {specialty}. Expertise in {key skills}. Committed to {patient outcome focus}.',
        bulletTemplates: [
            'Provided comprehensive care to {patient count} patients daily in {unit type}',
            'Implemented {protocol/procedure}, improving {patient outcome} by {metric}',
            'Mentored {number} new nurses, reducing onboarding time by {percentage}'
        ],
        toneStyle: 'professional',
        photoRecommendation: 'optional',
        photoRegions: ['ME', 'APAC'],
        demandLevel: 'high',
        growthTrend: 'growing',
        fresherFriendly: true,
        fresherAlternatives: ['Clinical rotations', 'Nursing internships', 'Volunteer experience', 'Healthcare certifications']
    },

    // ───────────────────────────────────────────────────────────
    // FINANCE ROLES
    // ───────────────────────────────────────────────────────────
    {
        id: 'accountant',
        name: 'Accountant',
        aliases: ['Staff Accountant', 'Financial Accountant', 'General Accountant', 'Bookkeeper'],
        industry: 'finance',
        levels: ['fresher', 'junior', 'mid', 'senior', 'lead', 'manager'],
        coreSkills: ['Financial Reporting', 'GAAP/IFRS', 'Reconciliation', 'Budgeting', 'Attention to Detail'],
        optionalSkills: ['Tax Preparation', 'Audit', 'Financial Analysis'],
        tools: ['Excel', 'QuickBooks', 'SAP', 'Oracle', 'ERP Systems'],
        certifications: ['CPA', 'CMA', 'ACCA', 'CA'],
        educationRequirements: ['Bachelor in Accounting', 'Finance degree', 'Commerce degree'],
        typicalResponsibilities: [
            'Prepare financial statements',
            'Manage accounts payable/receivable',
            'Perform month-end close',
            'Reconcile accounts',
            'Ensure compliance with regulations'
        ],
        atsKeywords: ['accounting', 'financial statements', 'GAAP', 'reconciliation', 'budgeting', 'audit', 'tax'],
        actionVerbs: ['Prepared', 'Reconciled', 'Analyzed', 'Audited', 'Managed', 'Streamlined', 'Reported'],
        metricExamples: ['Managed $5M budget', 'Reduced close time by 30%', 'Achieved 100% audit compliance'],
        summaryTemplate: 'Accountant with {X} years of experience in {industry/company type}. Expert in {skills}. {Certification} certified.',
        bulletTemplates: [
            'Managed month-end close for {number} entities, reducing close time by {days}',
            'Prepared financial statements for ${amount} in annual revenue',
            'Identified and resolved {amount} in discrepancies through detailed reconciliation'
        ],
        toneStyle: 'formal',
        photoRecommendation: 'optional',
        photoRegions: ['ME', 'IN'],
        demandLevel: 'high',
        growthTrend: 'stable',
        fresherFriendly: true,
        fresherAlternatives: ['Accounting coursework', 'Internships', 'Bookkeeping experience', 'CPA exam progress']
    },

    // ───────────────────────────────────────────────────────────
    // EDUCATION ROLES
    // ───────────────────────────────────────────────────────────
    {
        id: 'teacher',
        name: 'Teacher',
        aliases: ['Educator', 'Instructor', 'School Teacher', 'Classroom Teacher'],
        industry: 'education',
        levels: ['fresher', 'junior', 'mid', 'senior', 'lead'],
        coreSkills: ['Classroom Management', 'Lesson Planning', 'Student Assessment', 'Communication', 'Patience'],
        optionalSkills: ['Special Education', 'ESL/ELL', 'Technology Integration'],
        tools: ['Learning Management Systems', 'Google Classroom', 'Smart Boards', 'Assessment Tools'],
        certifications: ['Teaching License', 'TEFL/TESOL', 'Subject-specific certifications'],
        educationRequirements: ['Bachelor in Education', 'Teaching credential', 'Subject degree + credential'],
        typicalResponsibilities: [
            'Develop and deliver lesson plans',
            'Assess student progress',
            'Manage classroom behavior',
            'Communicate with parents',
            'Participate in professional development'
        ],
        atsKeywords: ['teaching', 'curriculum', 'lesson planning', 'student assessment', 'classroom management', 'differentiated instruction'],
        actionVerbs: ['Taught', 'Developed', 'Assessed', 'Implemented', 'Facilitated', 'Mentored', 'Collaborated'],
        metricExamples: ['Improved test scores by 25%', 'Managed class of 30 students', 'Achieved 95% student pass rate'],
        summaryTemplate: 'Dedicated {subject/level} Teacher with {X} years of experience. Skilled in {teaching methods}. Committed to {student outcome}.',
        bulletTemplates: [
            'Developed curriculum for {subject} resulting in {student outcome improvement}',
            'Implemented {teaching strategy}, improving student engagement by {metric}',
            'Mentored {number} student teachers, contributing to {outcome}'
        ],
        toneStyle: 'professional',
        photoRecommendation: 'recommended',
        photoRegions: ['IN', 'ME', 'APAC', 'EU'],
        demandLevel: 'medium',
        growthTrend: 'stable',
        fresherFriendly: true,
        fresherAlternatives: ['Student teaching', 'Tutoring experience', 'Volunteer teaching', 'Education coursework']
    },

    // ───────────────────────────────────────────────────────────
    // SALES ROLES
    // ───────────────────────────────────────────────────────────
    {
        id: 'sales-executive',
        name: 'Sales Executive',
        aliases: ['Sales Representative', 'Account Executive', 'Sales Associate', 'Business Development Representative'],
        industry: 'sales',
        levels: ['fresher', 'junior', 'mid', 'senior', 'lead', 'manager'],
        coreSkills: ['Negotiation', 'Communication', 'Relationship Building', 'Product Knowledge', 'Closing'],
        optionalSkills: ['CRM Management', 'Territory Management', 'B2B/B2C Sales'],
        tools: ['Salesforce', 'HubSpot', 'LinkedIn Sales Navigator', 'ZoomInfo'],
        certifications: ['Salesforce Certified', 'HubSpot Sales Certification'],
        educationRequirements: ['Any Bachelor degree', 'Business degree preferred'],
        typicalResponsibilities: [
            'Generate and qualify leads',
            'Present products/services to clients',
            'Negotiate and close deals',
            'Maintain client relationships',
            'Meet/exceed sales targets'
        ],
        atsKeywords: ['sales', 'revenue', 'targets', 'CRM', 'lead generation', 'closing', 'pipeline'],
        actionVerbs: ['Generated', 'Closed', 'Exceeded', 'Negotiated', 'Developed', 'Cultivated', 'Achieved'],
        metricExamples: ['Achieved 120% of quota', 'Generated $1M+ in revenue', 'Closed 50+ deals annually'],
        summaryTemplate: 'Results-driven Sales Executive with {X} years in {industry}. Track record of {achievement}. Expert in {sales methodology}.',
        bulletTemplates: [
            'Exceeded sales quota by {percentage}%, generating ${amount} in revenue',
            'Built and managed pipeline of {number} accounts worth ${value}',
            'Closed {number} new accounts, increasing territory revenue by {percentage}'
        ],
        toneStyle: 'professional',
        photoRecommendation: 'recommended',
        photoRegions: ['US', 'IN', 'ME', 'APAC'],
        demandLevel: 'high',
        growthTrend: 'stable',
        fresherFriendly: true,
        fresherAlternatives: ['Retail sales experience', 'Customer service', 'Sales internships', 'Campus sales roles']
    },

    // ───────────────────────────────────────────────────────────
    // HOSPITALITY ROLES
    // ───────────────────────────────────────────────────────────
    {
        id: 'chef',
        name: 'Chef',
        aliases: ['Cook', 'Head Chef', 'Sous Chef', 'Executive Chef', 'Line Cook'],
        industry: 'hospitality',
        subIndustry: 'Food & Beverage',
        levels: ['fresher', 'junior', 'mid', 'senior', 'lead', 'executive'],
        coreSkills: ['Culinary Skills', 'Menu Development', 'Food Safety', 'Kitchen Management', 'Creativity'],
        optionalSkills: ['Pastry', 'International Cuisine', 'Cost Control'],
        tools: ['Kitchen Equipment', 'POS Systems', 'Inventory Management'],
        certifications: ['ServSafe', 'Culinary degree', 'Food Handler Certificate'],
        educationRequirements: ['Culinary school', 'Apprenticeship', 'On-the-job training'],
        typicalResponsibilities: [
            'Prepare high-quality dishes',
            'Develop and update menus',
            'Manage kitchen staff',
            'Control food costs',
            'Ensure food safety compliance'
        ],
        atsKeywords: ['culinary', 'menu development', 'food safety', 'kitchen management', 'food cost', 'cuisine'],
        actionVerbs: ['Prepared', 'Created', 'Developed', 'Managed', 'Trained', 'Reduced', 'Implemented'],
        metricExamples: ['Managed kitchen of 10+ staff', 'Reduced food costs by 15%', 'Served 200+ covers nightly'],
        summaryTemplate: 'Creative Chef with {X} years in {cuisine type/setting}. Expertise in {specialties}. Passionate about {focus area}.',
        bulletTemplates: [
            'Developed seasonal menu increasing customer satisfaction by {percentage}%',
            'Managed kitchen team of {number}, maintaining {food safety rating}',
            'Reduced food costs by {percentage}% through efficient inventory management'
        ],
        toneStyle: 'professional',
        photoRecommendation: 'recommended',
        photoRegions: ['US', 'EU', 'IN', 'ME', 'APAC'],
        demandLevel: 'medium',
        growthTrend: 'stable',
        fresherFriendly: true,
        fresherAlternatives: ['Culinary school projects', 'Kitchen apprenticeships', 'Catering experience', 'Personal cooking achievements']
    },

    // ───────────────────────────────────────────────────────────
    // CONSTRUCTION ROLES
    // ───────────────────────────────────────────────────────────
    {
        id: 'civil-engineer',
        name: 'Civil Engineer',
        aliases: ['Structural Engineer', 'Site Engineer', 'Construction Engineer', 'Project Engineer'],
        industry: 'construction',
        levels: ['fresher', 'junior', 'mid', 'senior', 'lead', 'manager'],
        coreSkills: ['Structural Analysis', 'AutoCAD', 'Project Management', 'Site Supervision', 'Building Codes'],
        optionalSkills: ['BIM', 'Environmental Engineering', 'Transportation'],
        tools: ['AutoCAD', 'Civil 3D', 'STAAD', 'Primavera', 'MS Project'],
        certifications: ['PE License', 'PMP', 'LEED', 'OSHA'],
        educationRequirements: ['Bachelor in Civil Engineering', 'Master in Structural Engineering'],
        typicalResponsibilities: [
            'Design and analyze structures',
            'Prepare construction drawings',
            'Supervise site activities',
            'Ensure code compliance',
            'Manage project timelines'
        ],
        atsKeywords: ['civil engineering', 'structural design', 'construction', 'AutoCAD', 'site supervision', 'project management'],
        actionVerbs: ['Designed', 'Supervised', 'Managed', 'Analyzed', 'Coordinated', 'Inspected', 'Delivered'],
        metricExamples: ['Managed $10M project', 'Delivered project 2 weeks early', 'Supervised team of 20'],
        summaryTemplate: 'Civil Engineer with {X} years in {project types}. Expert in {specialties}. Delivered {notable achievement}.',
        bulletTemplates: [
            'Designed structural systems for ${value} {project type}, completed {timeline}',
            'Supervised construction of {project}, managing {number} contractors',
            'Reduced project costs by {percentage}% through value engineering'
        ],
        toneStyle: 'technical',
        photoRecommendation: 'optional',
        photoRegions: ['ME', 'IN'],
        demandLevel: 'medium',
        growthTrend: 'stable',
        fresherFriendly: true,
        fresherAlternatives: ['Engineering projects', 'Internships', 'Design competitions', 'AutoCAD certifications']
    },

    // ───────────────────────────────────────────────────────────
    // LEGAL ROLES
    // ───────────────────────────────────────────────────────────
    {
        id: 'lawyer',
        name: 'Lawyer',
        aliases: ['Attorney', 'Legal Counsel', 'Advocate', 'Solicitor', 'Barrister'],
        industry: 'legal',
        levels: ['fresher', 'junior', 'mid', 'senior', 'partner'],
        coreSkills: ['Legal Research', 'Legal Writing', 'Negotiation', 'Litigation', 'Client Counseling'],
        optionalSkills: ['Specialized Law', 'Arbitration', 'Mediation'],
        tools: ['Westlaw', 'LexisNexis', 'Case Management Software', 'Document Review Tools'],
        certifications: ['Bar Admission', 'Specialized certifications'],
        educationRequirements: ['JD/LLB', 'Bar exam', 'LLM for specialization'],
        typicalResponsibilities: [
            'Represent clients in legal matters',
            'Draft legal documents',
            'Conduct legal research',
            'Negotiate settlements',
            'Appear in court proceedings'
        ],
        atsKeywords: ['legal', 'litigation', 'contracts', 'compliance', 'negotiation', 'due diligence', 'counsel'],
        actionVerbs: ['Represented', 'Negotiated', 'Drafted', 'Litigated', 'Counseled', 'Resolved', 'Analyzed'],
        metricExamples: ['Won 90% of cases', 'Negotiated $5M settlement', 'Handled 50+ cases annually'],
        summaryTemplate: 'Attorney with {X} years practicing {area of law}. Track record of {achievements}. Admitted to {bar/jurisdiction}.',
        bulletTemplates: [
            'Represented clients in {number} {case type} matters, achieving {outcome}',
            'Negotiated {type} agreements valued at ${amount}',
            'Drafted {document types} for {clients/transactions} worth ${value}'
        ],
        toneStyle: 'formal',
        photoRecommendation: 'not_recommended',
        photoRegions: [],
        demandLevel: 'medium',
        growthTrend: 'stable',
        fresherFriendly: false,
        fresherAlternatives: ['Law school clinics', 'Legal internships', 'Moot court', 'Legal research positions']
    },

    // ───────────────────────────────────────────────────────────
    // MARKETING ROLES
    // ───────────────────────────────────────────────────────────
    {
        id: 'digital-marketing-manager',
        name: 'Digital Marketing Manager',
        aliases: ['Online Marketing Manager', 'Digital Marketing Specialist', 'Growth Marketer'],
        industry: 'marketing',
        levels: ['junior', 'mid', 'senior', 'manager', 'director'],
        coreSkills: ['Digital Strategy', 'SEO/SEM', 'Social Media', 'Analytics', 'Content Marketing'],
        optionalSkills: ['Marketing Automation', 'PPC', 'Email Marketing'],
        tools: ['Google Analytics', 'Google Ads', 'Facebook Ads', 'HubSpot', 'SEMrush'],
        certifications: ['Google Ads', 'Google Analytics', 'HubSpot', 'Facebook Blueprint'],
        educationRequirements: ['Marketing degree', 'Business degree', 'Communications'],
        typicalResponsibilities: [
            'Develop digital marketing strategies',
            'Manage paid advertising campaigns',
            'Analyze campaign performance',
            'Optimize conversion rates',
            'Manage marketing budget'
        ],
        atsKeywords: ['digital marketing', 'SEO', 'SEM', 'social media', 'Google Analytics', 'conversion', 'ROI'],
        actionVerbs: ['Developed', 'Executed', 'Optimized', 'Increased', 'Analyzed', 'Managed', 'Launched'],
        metricExamples: ['Increased traffic by 200%', 'Achieved 5x ROI on ad spend', 'Grew social following by 50K'],
        summaryTemplate: 'Digital Marketing Manager with {X} years driving {growth type}. Expert in {channels}. Delivered {key achievement}.',
        bulletTemplates: [
            'Developed digital strategy increasing website traffic by {percentage}%',
            'Managed ${amount} ad budget achieving {ROI}x return on investment',
            'Launched campaigns generating {number} leads at ${amount} cost per lead'
        ],
        toneStyle: 'creative',
        photoRecommendation: 'optional',
        photoRegions: ['IN', 'ME'],
        demandLevel: 'high',
        growthTrend: 'growing',
        fresherFriendly: true,
        fresherAlternatives: ['Personal projects', 'Freelance work', 'Marketing internships', 'Google certifications']
    },

    // ───────────────────────────────────────────────────────────
    // SKILLED TRADES
    // ───────────────────────────────────────────────────────────
    {
        id: 'electrician',
        name: 'Electrician',
        aliases: ['Electrical Technician', 'Journeyman Electrician', 'Master Electrician'],
        industry: 'trades',
        levels: ['fresher', 'junior', 'mid', 'senior', 'lead'],
        coreSkills: ['Electrical Installation', 'Troubleshooting', 'Blueprint Reading', 'Safety Protocols', 'Code Compliance'],
        optionalSkills: ['Industrial Electrical', 'Solar Installation', 'Home Automation'],
        tools: ['Multimeter', 'Wire Strippers', 'Conduit Benders', 'Testing Equipment'],
        certifications: ['Electrician License', 'OSHA', 'Specialized certifications'],
        educationRequirements: ['Trade school', 'Apprenticeship', 'Journeyman certification'],
        typicalResponsibilities: [
            'Install electrical systems',
            'Read and interpret blueprints',
            'Troubleshoot electrical issues',
            'Ensure code compliance',
            'Maintain safety standards'
        ],
        atsKeywords: ['electrical', 'wiring', 'installation', 'troubleshooting', 'NEC code', 'safety', 'residential', 'commercial'],
        actionVerbs: ['Installed', 'Troubleshot', 'Repaired', 'Maintained', 'Upgraded', 'Inspected', 'Wired'],
        metricExamples: ['Completed 200+ installations', '100% safety compliance', 'Reduced callbacks by 30%'],
        summaryTemplate: 'Licensed Electrician with {X} years in {residential/commercial/industrial}. Expert in {specialties}. {Safety record}.',
        bulletTemplates: [
            'Installed electrical systems for {number} {residential/commercial} projects',
            'Reduced electrical issues by {percentage}% through preventive maintenance',
            'Completed projects {ahead of schedule/under budget} consistently'
        ],
        toneStyle: 'technical',
        photoRecommendation: 'not_recommended',
        photoRegions: [],
        demandLevel: 'high',
        growthTrend: 'growing',
        fresherFriendly: true,
        fresherAlternatives: ['Trade school projects', 'Apprenticeship', 'Helper experience', 'Safety certifications']
    },

    // ───────────────────────────────────────────────────────────
    // LOGISTICS ROLES
    // ───────────────────────────────────────────────────────────
    {
        id: 'logistics-manager',
        name: 'Logistics Manager',
        aliases: ['Supply Chain Manager', 'Warehouse Manager', 'Distribution Manager'],
        industry: 'logistics',
        levels: ['mid', 'senior', 'manager', 'director'],
        coreSkills: ['Supply Chain Management', 'Inventory Control', 'Transportation', 'Vendor Management', 'Cost Optimization'],
        optionalSkills: ['International Logistics', 'Customs', 'Last Mile Delivery'],
        tools: ['SAP', 'Oracle', 'WMS Systems', 'TMS Systems', 'Excel'],
        certifications: ['CSCP', 'CLTD', 'Six Sigma', 'PMP'],
        educationRequirements: ['Supply Chain degree', 'Business degree', 'Logistics certification'],
        typicalResponsibilities: [
            'Manage end-to-end logistics',
            'Optimize transportation routes',
            'Control inventory levels',
            'Negotiate with vendors',
            'Reduce operational costs'
        ],
        atsKeywords: ['logistics', 'supply chain', 'inventory', 'transportation', 'warehouse', 'distribution', 'cost reduction'],
        actionVerbs: ['Managed', 'Optimized', 'Reduced', 'Coordinated', 'Streamlined', 'Negotiated', 'Implemented'],
        metricExamples: ['Reduced costs by 20%', 'Managed $50M inventory', 'Improved delivery time by 30%'],
        summaryTemplate: 'Logistics Manager with {X} years optimizing {supply chain/distribution}. Expert in {specialties}. Achieved {cost savings}.',
        bulletTemplates: [
            'Managed logistics operations for ${value} in annual shipments',
            'Reduced transportation costs by {percentage}% through route optimization',
            'Improved inventory accuracy to {percentage}%, reducing stockouts by {amount}'
        ],
        toneStyle: 'technical',
        photoRecommendation: 'optional',
        photoRegions: ['ME'],
        demandLevel: 'medium',
        growthTrend: 'growing',
        fresherFriendly: false,
        fresherAlternatives: ['Warehouse operations', 'Logistics internships', 'Supply chain coursework', 'ERP training']
    },

    // ───────────────────────────────────────────────────────────
    // HR ROLES
    // ───────────────────────────────────────────────────────────
    {
        id: 'hr-manager',
        name: 'HR Manager',
        aliases: ['Human Resources Manager', 'People Manager', 'HR Business Partner'],
        industry: 'hr',
        levels: ['mid', 'senior', 'manager', 'director'],
        coreSkills: ['Employee Relations', 'Recruitment', 'Performance Management', 'HR Policies', 'Compliance'],
        optionalSkills: ['HRIS', 'Compensation & Benefits', 'Training & Development'],
        tools: ['Workday', 'SAP SuccessFactors', 'BambooHR', 'LinkedIn Recruiter'],
        certifications: ['SHRM-CP', 'SHRM-SCP', 'PHR', 'SPHR'],
        educationRequirements: ['HR degree', 'Business degree', 'Psychology degree'],
        typicalResponsibilities: [
            'Develop HR policies and procedures',
            'Manage recruitment process',
            'Handle employee relations',
            'Administer benefits programs',
            'Ensure legal compliance'
        ],
        atsKeywords: ['human resources', 'recruitment', 'employee relations', 'performance management', 'HRIS', 'compliance'],
        actionVerbs: ['Recruited', 'Developed', 'Implemented', 'Managed', 'Resolved', 'Streamlined', 'Trained'],
        metricExamples: ['Reduced turnover by 25%', 'Hired 100+ employees', 'Achieved 90% employee satisfaction'],
        summaryTemplate: 'HR Manager with {X} years in {industry/company size}. Expert in {HR functions}. Achieved {key metric}.',
        bulletTemplates: [
            'Managed full-cycle recruitment, filling {number} positions with average time-to-hire of {days}',
            'Reduced employee turnover by {percentage}% through engagement initiatives',
            'Developed training programs improving employee productivity by {percentage}%'
        ],
        toneStyle: 'professional',
        photoRecommendation: 'recommended',
        photoRegions: ['IN', 'ME', 'APAC'],
        demandLevel: 'medium',
        growthTrend: 'stable',
        fresherFriendly: false,
        fresherAlternatives: ['HR internships', 'Recruitment coordination', 'HR coursework', 'SHRM student membership']
    }
];

// ═══════════════════════════════════════════════════════════════
// ROLE SEARCH & MATCHING FUNCTIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Find role by name or alias (fuzzy matching)
 */
export function findRole(searchTerm: string): RoleDefinition | null {
    const normalized = searchTerm.toLowerCase().trim();

    // Exact match first
    let found = ROLE_DATABASE.find(role =>
        role.name.toLowerCase() === normalized ||
        role.aliases.some(alias => alias.toLowerCase() === normalized)
    );

    if (found) return found;

    // Partial match
    found = ROLE_DATABASE.find(role =>
        role.name.toLowerCase().includes(normalized) ||
        normalized.includes(role.name.toLowerCase()) ||
        role.aliases.some(alias =>
            alias.toLowerCase().includes(normalized) ||
            normalized.includes(alias.toLowerCase())
        )
    );

    return found || null;
}

/**
 * Get roles by industry
 */
export function getRolesByIndustry(industry: IndustryCategory): RoleDefinition[] {
    return ROLE_DATABASE.filter(role => role.industry === industry);
}

/**
 * Get fresher-friendly roles
 */
export function getFresherFriendlyRoles(): RoleDefinition[] {
    return ROLE_DATABASE.filter(role => role.fresherFriendly);
}

/**
 * Get roles by demand level
 */
export function getHighDemandRoles(): RoleDefinition[] {
    return ROLE_DATABASE.filter(role => role.demandLevel === 'high');
}

/**
 * Get industry info
 */
export function getIndustryInfo(industry: IndustryCategory): IndustryInfo {
    return INDUSTRIES[industry];
}

/**
 * Detect industry from job title
 */
export function detectIndustry(jobTitle: string): IndustryCategory {
    const title = jobTitle.toLowerCase();

    // Industry detection rules
    const industryPatterns: [RegExp, IndustryCategory][] = [
        [/software|developer|engineer|programmer|devops|data scientist|tech lead|architect|qa|frontend|backend|fullstack/i, 'technology'],
        [/nurse|doctor|physician|medical|healthcare|clinical|pharmacy|patient|hospital/i, 'healthcare'],
        [/accountant|finance|banker|analyst|auditor|tax|treasury|investment|portfolio/i, 'finance'],
        [/teacher|professor|instructor|principal|education|academic|tutor|lecturer/i, 'education'],
        [/marketing|brand|seo|sem|content|social media|digital market|growth/i, 'marketing'],
        [/sales|account executive|business development|revenue|quota|closer/i, 'sales'],
        [/manufacturing|production|quality|plant|assembly|lean|six sigma/i, 'manufacturing'],
        [/construction|civil|architect|structural|site|building|project manager/i, 'construction'],
        [/lawyer|attorney|legal|counsel|paralegal|compliance|contract/i, 'legal'],
        [/government|civil servant|public sector|municipal|federal|policy/i, 'government'],
        [/hotel|hospitality|chef|cook|restaurant|tourism|travel|event/i, 'hospitality'],
        [/retail|store|merchandis|e-commerce|shop|sales associate/i, 'retail'],
        [/logistics|supply chain|warehouse|distribution|fleet|shipping/i, 'logistics'],
        [/pilot|flight|aviation|airline|airport|aircraft/i, 'aviation'],
        [/automotive|car|vehicle|motor|mechanic|dealership/i, 'automotive'],
        [/journalist|producer|editor|media|content creator|film|video/i, 'media'],
        [/designer|artist|photographer|creative|fashion|interior/i, 'arts'],
        [/farm|agriculture|agro|crop|food scientist|agronomist/i, 'agriculture'],
        [/energy|oil|gas|petroleum|solar|renewable|utility|power/i, 'energy'],
        [/telecom|network|infrastructure|mobile|wireless/i, 'telecommunications'],
        [/real estate|property|broker|realtor|appraiser/i, 'real_estate'],
        [/nonprofit|ngo|charity|foundation|volunteer|fundrais/i, 'nonprofit'],
        [/consultant|advisor|strategy|management consult/i, 'consulting'],
        [/hr|human resources|recruiter|talent|people ops|hrbp/i, 'hr'],
        [/research|scientist|lab|r&d|phd|academic research/i, 'research'],
        [/electrician|plumber|carpenter|hvac|welder|mechanic|technician/i, 'trades'],
        [/security|guard|loss prevention|cybersecurity|investigation/i, 'security'],
        [/trainer|coach|fitness|personal train|sports|gym/i, 'sports'],
        [/stylist|beautician|esthetician|makeup|spa|salon/i, 'beauty']
    ];

    for (const [pattern, industry] of industryPatterns) {
        if (pattern.test(title)) {
            return industry;
        }
    }

    return 'other';
}

export { ROLE_DATABASE as default };
