/**
 * Semantic Keyword Normalization Service
 * Maps related terms and synonyms for better ATS keyword matching
 */

// Comprehensive keyword mappings for semantic matching
export const KEYWORD_MAPPINGS: Record<string, string[]> = {
    // Cloud Technologies
    'cloud': ['aws', 'amazon web services', 's3', 'ec2', 'lambda', 'azure', 'microsoft azure', 'gcp', 'google cloud', 'google cloud platform', 'cloud computing', 'serverless', 'iaas', 'paas', 'saas', 'cloud infrastructure', 'cloud native', 'cloudformation', 'cloud services'],
    'aws': ['amazon web services', 's3', 'ec2', 'lambda', 'rds', 'dynamodb', 'cloudfront', 'route53', 'cloudwatch', 'eks', 'ecs', 'fargate', 'sqs', 'sns', 'kinesis', 'redshift', 'athena', 'glue', 'sagemaker', 'iam'],
    'azure': ['microsoft azure', 'azure devops', 'azure functions', 'azure blob', 'azure sql', 'azure ad', 'azure kubernetes', 'aks', 'azure pipelines', 'azure storage'],
    'gcp': ['google cloud', 'google cloud platform', 'bigquery', 'cloud run', 'gke', 'cloud functions', 'cloud storage', 'dataflow', 'pub/sub', 'vertex ai'],

    // DevOps & Infrastructure
    'devops': ['docker', 'kubernetes', 'k8s', 'ci/cd', 'continuous integration', 'continuous deployment', 'continuous delivery', 'jenkins', 'github actions', 'gitlab ci', 'terraform', 'ansible', 'puppet', 'chef', 'infrastructure as code', 'iac', 'helm', 'argocd', 'circleci', 'travis ci', 'devops engineer', 'site reliability', 'sre', 'gitops'],
    'docker': ['containerization', 'containers', 'docker compose', 'dockerfile', 'docker swarm', 'container orchestration'],
    'kubernetes': ['k8s', 'kubectl', 'helm', 'eks', 'aks', 'gke', 'openshift', 'container orchestration', 'pods', 'deployments', 'services'],
    'ci/cd': ['continuous integration', 'continuous deployment', 'continuous delivery', 'jenkins', 'github actions', 'gitlab ci', 'circleci', 'travis ci', 'azure pipelines', 'bamboo', 'teamcity', 'build automation', 'deployment automation', 'pipeline'],
    'terraform': ['infrastructure as code', 'iac', 'hcl', 'terragrunt', 'terraform cloud'],

    // AI/ML Technologies
    'ai': ['artificial intelligence', 'machine learning', 'ml', 'deep learning', 'neural networks', 'computer vision', 'nlp', 'natural language processing', 'ai engineer', 'ai/ml'],
    'machine learning': ['ml', 'deep learning', 'neural networks', 'sklearn', 'scikit-learn', 'xgboost', 'lightgbm', 'random forest', 'classification', 'regression', 'clustering', 'supervised learning', 'unsupervised learning', 'reinforcement learning', 'feature engineering', 'model training', 'hyperparameter tuning'],
    'deep learning': ['neural networks', 'cnn', 'rnn', 'lstm', 'transformer', 'attention mechanism', 'backpropagation', 'tensorflow', 'pytorch', 'keras'],
    'genai': ['generative ai', 'llm', 'large language model', 'gpt', 'chatgpt', 'openai', 'langchain', 'rag', 'retrieval augmented generation', 'prompt engineering', 'fine-tuning', 'embeddings', 'vector embeddings', 'claude', 'gemini', 'llama', 'mistral', 'hugging face', 'transformers'],
    'llm': ['large language model', 'gpt', 'chatgpt', 'openai', 'claude', 'gemini', 'llama', 'mistral', 'fine-tuning', 'prompt engineering', 'rag'],
    'nlp': ['natural language processing', 'text processing', 'sentiment analysis', 'named entity recognition', 'ner', 'tokenization', 'word embeddings', 'bert', 'spacy', 'nltk', 'text classification', 'language understanding'],
    'computer vision': ['cv', 'image processing', 'object detection', 'image classification', 'yolo', 'opencv', 'image recognition', 'ocr', 'face detection', 'semantic segmentation'],

    // ML Frameworks
    'tensorflow': ['tf', 'keras', 'tensorflow 2', 'tf.keras', 'tfx', 'tensorflow lite', 'tensorflow serving'],
    'pytorch': ['torch', 'torchvision', 'lightning', 'pytorch lightning'],

    // Data Science & Analytics
    'data science': ['data analysis', 'data analytics', 'statistical analysis', 'data scientist', 'analytics', 'business intelligence', 'bi', 'data-driven', 'exploratory data analysis', 'eda'],
    'pandas': ['dataframes', 'data manipulation', 'data wrangling', 'data cleaning', 'python pandas', 'pandas library'],
    'numpy': ['numerical computing', 'arrays', 'linear algebra', 'scientific computing', 'python numpy', 'numpy library', 'numpy arrays'],
    'spark': ['apache spark', 'pyspark', 'spark sql', 'databricks', 'big data processing'],
    'sql': ['mysql', 'postgresql', 'postgres', 'sqlite', 'oracle', 'sql server', 'mssql', 'database queries', 'relational database', 'rdbms', 'stored procedures', 'query optimization'],

    // Programming Languages
    'python': ['python3', 'python 3', 'django', 'flask', 'fastapi', 'pandas', 'numpy', 'scipy', 'matplotlib', 'jupyter', 'pip', 'conda', 'virtualenv', 'poetry', 'python including numpy', 'python with numpy', 'python/numpy'],
    'javascript': ['js', 'es6', 'es2015', 'ecmascript', 'vanilla javascript', 'vanilla js', 'node.js', 'nodejs'],
    'typescript': ['ts', 'typed javascript'],
    'java': ['jvm', 'spring', 'spring boot', 'maven', 'gradle', 'j2ee', 'jakarta', 'hibernate', 'jpa'],
    'c++': ['cpp', 'c plus plus', 'stl', 'standard template library'],
    'c#': ['csharp', 'c sharp', '.net', 'dotnet', 'asp.net', 'entity framework'],
    'go': ['golang', 'goroutines', 'go programming'],
    'rust': ['rustlang', 'cargo', 'rust programming'],
    'php': ['laravel', 'symfony', 'wordpress', 'composer'],
    'ruby': ['rails', 'ruby on rails', 'ror', 'bundler', 'gems'],
    'kotlin': ['android kotlin', 'kotlin/jvm'],
    'swift': ['ios development', 'swiftui', 'cocoa', 'xcode'],
    'scala': ['akka', 'play framework', 'sbt'],

    // Web Development - Frontend
    'react': ['reactjs', 'react.js', 'react js', 'jsx', 'hooks', 'redux', 'context api', 'next.js', 'nextjs', 'gatsby', 'react native', 'create react app', 'vite react'],
    'angular': ['angularjs', 'angular 2+', 'rxjs', 'ngrx', 'angular cli'],
    'vue': ['vuejs', 'vue.js', 'vue 3', 'vuex', 'pinia', 'nuxt', 'nuxt.js'],
    'svelte': ['sveltekit', 'svelte kit'],
    'frontend': ['front-end', 'front end', 'client-side', 'ui development', 'user interface', 'web development', 'responsive design', 'css', 'html', 'web ui'],
    'css': ['sass', 'scss', 'less', 'tailwind', 'tailwindcss', 'bootstrap', 'styled-components', 'css-in-js', 'css modules', 'postcss'],
    'html': ['html5', 'semantic html', 'markup'],

    // Web Development - Backend
    'node': ['nodejs', 'node.js', 'express', 'express.js', 'nestjs', 'fastify', 'koa', 'npm', 'yarn'],
    'backend': ['back-end', 'back end', 'server-side', 'api development', 'web services', 'microservices'],
    'api development': ['rest api', 'restful', 'restful api', 'api', 'graphql', 'api design', 'openapi', 'swagger', 'api gateway', 'web services', 'soap', 'grpc', 'api integration'],
    'rest': ['restful', 'rest api', 'restful api', 'restful services', 'http apis'],
    'graphql': ['apollo', 'apollo server', 'apollo client', 'relay'],
    'microservices': ['micro services', 'service-oriented architecture', 'soa', 'distributed systems', 'event-driven architecture', 'message queues'],
    'django': ['django rest framework', 'drf', 'python django'],
    'flask': ['flask api', 'python flask'],
    'fastapi': ['fast api', 'python fastapi'],
    'spring boot': ['spring framework', 'spring boot java', 'spring mvc', 'spring cloud'],

    // Databases
    'database': ['databases', 'db', 'data storage', 'data persistence', 'dbms'],
    'mysql': ['mariadb', 'percona'],
    'postgresql': ['postgres', 'psql', 'pg'],
    'mongodb': ['mongo', 'mongoose', 'nosql', 'document database'],
    'redis': ['caching', 'in-memory database', 'key-value store'],
    'elasticsearch': ['elastic', 'elk stack', 'opensearch', 'search engine'],
    'cassandra': ['apache cassandra', 'scylladb', 'wide-column store'],
    'nosql': ['document database', 'mongodb', 'dynamodb', 'couchbase', 'firebase'],
    'vector database': ['vector db', 'pinecone', 'weaviate', 'milvus', 'qdrant', 'chroma', 'faiss'],

    // Version Control & Collaboration
    'git': ['github', 'gitlab', 'bitbucket', 'version control', 'source control', 'git workflow', 'branching', 'merge', 'pull request', 'code review'],
    'github': ['github actions', 'github pages', 'github enterprise'],
    'gitlab': ['gitlab ci', 'gitlab ci/cd', 'gitlab runner'],
    'agile': ['scrum', 'kanban', 'sprint', 'agile methodology', 'agile development', 'jira', 'user stories', 'backlog', 'retrospective', 'daily standup'],
    'scrum': ['sprint planning', 'scrum master', 'product owner', 'sprint review'],

    // Testing
    'testing': ['unit testing', 'integration testing', 'e2e testing', 'end-to-end testing', 'test automation', 'qa', 'quality assurance', 'tdd', 'bdd'],
    'unit testing': ['jest', 'pytest', 'junit', 'mocha', 'jasmine', 'vitest', 'unittest'],
    'pytest': ['python testing', 'pytest fixtures'],
    'jest': ['javascript testing', 'react testing', 'enzyme', 'testing library'],
    'selenium': ['webdriver', 'browser automation', 'ui testing'],
    'cypress': ['e2e testing', 'integration testing', 'frontend testing'],

    // Mobile Development
    'mobile': ['mobile development', 'mobile app', 'ios', 'android', 'mobile application'],
    'ios': ['iphone', 'ipad', 'swift', 'objective-c', 'xcode', 'cocoa touch', 'swiftui', 'uikit'],
    'android': ['android studio', 'kotlin', 'java android', 'android sdk', 'material design', 'jetpack compose'],
    'react native': ['react-native', 'expo', 'mobile react'],
    'flutter': ['dart', 'flutter sdk', 'cross-platform mobile'],

    // Security
    'security': ['cybersecurity', 'information security', 'application security', 'appsec', 'infosec', 'secure coding', 'vulnerability', 'penetration testing', 'security audit'],
    'authentication': ['auth', 'oauth', 'oauth2', 'jwt', 'json web token', 'sso', 'single sign-on', 'saml', 'oidc', 'openid connect', 'mfa', '2fa'],
    'encryption': ['cryptography', 'ssl', 'tls', 'https', 'aes', 'rsa', 'hashing'],

    // Soft Skills & Business
    'communication': ['written communication', 'verbal communication', 'presentation skills', 'stakeholder communication'],
    'teamwork': ['collaboration', 'team player', 'cross-functional', 'team collaboration'],
    'leadership': ['team lead', 'tech lead', 'mentoring', 'team management', 'people management'],
    'problem solving': ['problem-solving', 'analytical skills', 'critical thinking', 'troubleshooting', 'debugging'],
    'project management': ['pm', 'program management', 'project planning', 'project delivery', 'pmp', 'prince2'],

    // Industry-specific
    'fintech': ['financial technology', 'banking', 'payments', 'trading', 'blockchain', 'cryptocurrency', 'defi'],
    'healthcare': ['healthtech', 'medical', 'clinical', 'hipaa', 'hl7', 'fhir', 'electronic health records', 'ehr'],
    'ecommerce': ['e-commerce', 'online retail', 'shopping', 'marketplace', 'payments'],

    // Additional mappings for common variations
    'full stack': ['fullstack', 'full-stack', 'frontend and backend', 'end-to-end development'],
    'system design': ['architecture', 'software architecture', 'distributed systems', 'scalability', 'high availability', 'system architecture'],
    'data structures': ['algorithms', 'dsa', 'data structures and algorithms', 'leetcode', 'competitive programming'],
    'linux': ['unix', 'bash', 'shell scripting', 'command line', 'cli', 'ubuntu', 'centos', 'debian', 'rhel'],
    'monitoring': ['observability', 'logging', 'metrics', 'alerting', 'grafana', 'prometheus', 'datadog', 'new relic', 'splunk', 'elk'],
};

/**
 * Normalize a keyword to its canonical form and get all related terms
 */
export function normalizeKeyword(keyword: string): string[] {
    const normalized = keyword.toLowerCase().trim();

    // Check if this keyword is a main category
    if (KEYWORD_MAPPINGS[normalized]) {
        return [normalized, ...KEYWORD_MAPPINGS[normalized]];
    }

    // Check if this keyword appears in any mapping
    for (const [mainKeyword, synonyms] of Object.entries(KEYWORD_MAPPINGS)) {
        if (synonyms.some(s => s.toLowerCase() === normalized)) {
            return [mainKeyword, ...synonyms];
        }
    }

    // No mapping found, return original
    return [normalized];
}

/**
 * Check if a JD keyword is semantically present in resume text
 */
export function findSemanticMatches(jdKeyword: string, resumeText: string): boolean {
    const relatedTerms = normalizeKeyword(jdKeyword);
    const resumeLower = resumeText.toLowerCase();

    // Check if ANY related term appears in resume
    return relatedTerms.some(term => {
        // Use word boundary matching to avoid partial matches
        const regex = new RegExp(`\\b${escapeRegex(term)}\\b`, 'i');
        return regex.test(resumeLower);
    });
}

/**
 * Get the canonical keyword for a term
 */
export function getCanonicalKeyword(keyword: string): string {
    const normalized = keyword.toLowerCase().trim();

    // Check if this is already a main category
    if (KEYWORD_MAPPINGS[normalized]) {
        return normalized;
    }

    // Find the main category this belongs to
    for (const [mainKeyword, synonyms] of Object.entries(KEYWORD_MAPPINGS)) {
        if (synonyms.some(s => s.toLowerCase() === normalized)) {
            return mainKeyword;
        }
    }

    return normalized;
}

/**
 * Escape special regex characters
 */
function escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Extract and normalize keywords from job description
 * Groups related terms and returns unique canonical keywords
 */
export function extractNormalizedKeywords(text: string): string[] {
    const textLower = text.toLowerCase();
    const foundKeywords = new Set<string>();

    // Check each main keyword category
    for (const [mainKeyword, synonyms] of Object.entries(KEYWORD_MAPPINGS)) {
        // Check if main keyword or any synonym exists in text
        const allTerms = [mainKeyword, ...synonyms];
        for (const term of allTerms) {
            const regex = new RegExp(`\\b${escapeRegex(term)}\\b`, 'i');
            if (regex.test(textLower)) {
                foundKeywords.add(mainKeyword);
                break;
            }
        }
    }

    return Array.from(foundKeywords);
}

/**
 * Calculate semantic match score between JD keywords and resume
 */
export function calculateSemanticMatchScore(
    jdKeywords: string[],
    resumeText: string
): { score: number; matched: string[]; missing: string[] } {
    const matched: string[] = [];
    const missing: string[] = [];

    for (const keyword of jdKeywords) {
        if (findSemanticMatches(keyword, resumeText)) {
            matched.push(keyword);
        } else {
            missing.push(keyword);
        }
    }

    const score = jdKeywords.length > 0 ? (matched.length / jdKeywords.length) * 100 : 0;

    return { score: Math.round(score), matched, missing };
}
