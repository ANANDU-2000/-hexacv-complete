/**
 * KEYWORD MATCHER - FACTUAL ONLY
 * No scores, no percentages, no rankings
 * Just factual comparison
 */

// Synonym map for normalization
const SYNONYMS: Record<string, string[]> = {
    'javascript': ['js', 'ecmascript'],
    'typescript': ['ts'],
    'python': ['py'],
    'machine learning': ['ml'],
    'artificial intelligence': ['ai'],
    'react': ['reactjs', 'react.js'],
    'node': ['nodejs', 'node.js'],
    'angular': ['angularjs'],
    'vue': ['vuejs', 'vue.js'],
    'next': ['nextjs', 'next.js'],
    'postgresql': ['postgres', 'psql'],
    'mongodb': ['mongo'],
    'kubernetes': ['k8s'],
    'amazon web services': ['aws'],
    'google cloud platform': ['gcp'],
    'microsoft azure': ['azure'],
    'natural language processing': ['nlp'],
    'large language model': ['llm'],
    'retrieval augmented generation': ['rag'],
};

/**
 * Normalize text for comparison
 */
function normalize(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

/**
 * Extract keywords from text
 */
function extractKeywords(text: string): string[] {
    const normalized = normalize(text);
    const words = normalized.split(/[\s,]+/).filter(w => w.length > 1);
    
    // Also extract multi-word phrases
    const phrases: string[] = [];
    for (const [canonical, syns] of Object.entries(SYNONYMS)) {
        if (normalized.includes(canonical)) {
            phrases.push(canonical);
        }
        for (const syn of syns) {
            if (normalized.includes(syn)) {
                phrases.push(canonical); // Use canonical form
            }
        }
    }
    
    return [...new Set([...words, ...phrases])];
}

/**
 * Check if two keywords match (including synonyms)
 */
function keywordsMatch(kw1: string, kw2: string): boolean {
    const n1 = normalize(kw1);
    const n2 = normalize(kw2);
    
    if (n1 === n2) return true;
    if (n1.includes(n2) || n2.includes(n1)) return true;
    
    // Check synonyms
    for (const [canonical, syns] of Object.entries(SYNONYMS)) {
        const all = [canonical, ...syns].map(normalize);
        if (all.includes(n1) && all.includes(n2)) return true;
        if (all.some(a => n1.includes(a)) && all.some(a => n2.includes(a))) return true;
    }
    
    return false;
}

export interface MatchResult {
    matched: string[];
    missing: string[];
    comparedCount: number;
}

/**
 * Compare resume keywords against JD keywords
 * Returns ONLY: matched, missing, comparedCount
 * NO scores, NO percentages
 */
export function matchKeywords(resumeText: string, jdText: string): MatchResult {
    if (!jdText.trim() || !resumeText.trim()) {
        return { matched: [], missing: [], comparedCount: 0 };
    }
    
    const jdKeywords = extractKeywords(jdText);
    const resumeNormalized = normalize(resumeText);
    
    const matched: string[] = [];
    const missing: string[] = [];
    
    // Deduplicate JD keywords
    const uniqueJdKeywords = [...new Set(jdKeywords)];
    
    for (const kw of uniqueJdKeywords) {
        let found = false;
        
        // Direct check
        if (resumeNormalized.includes(normalize(kw))) {
            found = true;
        }
        
        // Synonym check
        if (!found) {
            for (const [canonical, syns] of Object.entries(SYNONYMS)) {
                const all = [canonical, ...syns].map(normalize);
                if (all.some(a => kw.includes(a) || a.includes(kw))) {
                    if (all.some(a => resumeNormalized.includes(a))) {
                        found = true;
                        break;
                    }
                }
            }
        }
        
        if (found) {
            matched.push(kw);
        } else {
            missing.push(kw);
        }
    }
    
    return {
        matched: [...new Set(matched)],
        missing: [...new Set(missing)],
        comparedCount: uniqueJdKeywords.length
    };
}

/**
 * Extract skill keywords from JD for display
 */
export function extractJDSkills(jdText: string): string[] {
    if (!jdText.trim()) return [];
    
    const normalized = normalize(jdText);
    const skills: string[] = [];
    
    // Technical skills to look for
    const techSkills = [
        'python', 'javascript', 'typescript', 'java', 'c++', 'go', 'rust', 'ruby', 'php',
        'react', 'angular', 'vue', 'node', 'express', 'django', 'flask', 'spring',
        'sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch',
        'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform', 'jenkins',
        'git', 'linux', 'agile', 'scrum', 'ci/cd',
        'machine learning', 'deep learning', 'nlp', 'computer vision', 'llm', 'rag',
        'tensorflow', 'pytorch', 'pandas', 'numpy', 'spark'
    ];
    
    for (const skill of techSkills) {
        if (normalized.includes(skill)) {
            skills.push(skill);
        }
    }
    
    return [...new Set(skills)];
}
