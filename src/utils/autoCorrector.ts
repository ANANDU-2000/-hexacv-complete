/**
 * Auto-Correction Utility
 * Provides auto-correction for common typos and formatting issues
 */

export interface Correction {
    original: string;
    corrected: string;
    confidence: number;
    reason: string;
}

/**
 * Common typo corrections
 */
const COMMON_TYPOS: Record<string, string> = {
    // Technology
    'dotnet': '.NET',
    'dot net': '.NET',
    'asp.net': 'ASP.NET',
    'asp net': 'ASP.NET',
    'c#': 'C#',
    'c sharp': 'C#',
    'javascript': 'JavaScript',
    'typescript': 'TypeScript',
    'reactjs': 'React',
    'react js': 'React',
    'nodejs': 'Node.js',
    'node js': 'Node.js',
    'vuejs': 'Vue.js',
    'vue js': 'Vue.js',

    // Common words
    'resume': 'resume',
    'cv': 'CV',
    'api': 'API',
    'ui': 'UI',
    'ux': 'UX',
    'sql': 'SQL',
    'nosql': 'NoSQL',
    'aws': 'AWS',
    'azure': 'Azure',
    'gcp': 'GCP',

    // Experience levels
    'fresher': 'Fresher',
    'junior': 'Junior',
    'senior': 'Senior',
    'lead': 'Lead',
    'principal': 'Principal',
};

/**
 * Auto-correct text
 */
export function autoCorrect(text: string): Correction | null {
    if (!text || text.trim().length < 2) return null;

    const lowerText = text.toLowerCase().trim();

    // Check for exact matches
    if (COMMON_TYPOS[lowerText]) {
        return {
            original: text,
            corrected: COMMON_TYPOS[lowerText],
            confidence: 0.9,
            reason: 'Common typo correction'
        };
    }

    // Check for partial matches (case-insensitive)
    for (const [typo, correct] of Object.entries(COMMON_TYPOS)) {
        if (lowerText.includes(typo)) {
            const corrected = text.replace(new RegExp(typo, 'gi'), correct);
            if (corrected !== text) {
                return {
                    original: text,
                    corrected,
                    confidence: 0.7,
                    reason: `Corrected "${typo}" to "${correct}"`
                };
            }
        }
    }

    // Email validation and correction
    if (text.includes('@') && !text.includes(' ')) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(text)) {
            // Try to fix common email issues
            const fixed = text
                .replace(/\s+/g, '')
                .replace(/@gmail\.com/g, '@gmail.com')
                .replace(/@yahoo\.com/g, '@yahoo.com');

            if (emailRegex.test(fixed) && fixed !== text) {
                return {
                    original: text,
                    corrected: fixed,
                    confidence: 0.8,
                    reason: 'Email format correction'
                };
            }
        }
    }

    // LinkedIn URL correction
    if (text.toLowerCase().includes('linkedin')) {
        if (!text.startsWith('http://') && !text.startsWith('https://')) {
            const fixed = `https://${text.replace(/^https?:\/\//i, '')}`;
            return {
                original: text,
                corrected: fixed,
                confidence: 0.9,
                reason: 'Added https:// to LinkedIn URL'
            };
        }
    }

    // GitHub URL correction
    if (text.toLowerCase().includes('github')) {
        if (!text.startsWith('http://') && !text.startsWith('https://')) {
            const fixed = `https://${text.replace(/^https?:\/\//i, '')}`;
            return {
                original: text,
                corrected: fixed,
                confidence: 0.9,
                reason: 'Added https:// to GitHub URL'
            };
        }
    }

    return null;
}

/**
 * Auto-correct with suggestions
 */
export function autoCorrectWithSuggestions(text: string): {
    corrected: string;
    suggestions: string[];
    applied: boolean;
} {
    const correction = autoCorrect(text);

    if (correction && correction.confidence > 0.7) {
        return {
            corrected: correction.corrected,
            suggestions: [correction.reason],
            applied: true
        };
    }

    return {
        corrected: text,
        suggestions: [],
        applied: false
    };
}

/**
 * Clean text for display (fixes common tokenization errors)
 */
export function cleanResumeText(text: string): string {
    if (!text) return text;
    let current = text;

    const patterns = [
        { from: /Java Script/gi, to: 'JavaScript' },
        { from: /Tensor Flow/gi, to: 'TensorFlow' },
        { from: /Mongo DB/gi, to: 'MongoDB' },
        { from: /Git Hub/gi, to: 'GitHub' },
        { from: /Postgre SQL/gi, to: 'PostgreSQL' },
        { from: /Open AI/gi, to: 'OpenAI' },
        { from: /Lang Chain/gi, to: 'LangChain' },
        { from: /Fast API/gi, to: 'FastAPI' },
        { from: /Num Py/gi, to: 'NumPy' },
        { from: /S 3/gi, to: 'S3' },
        { from: /EC 2/gi, to: 'EC2' },
        { from: /F 1\//gi, to: 'F1/' }, // Specific for score
        { from: /React \. js/gi, to: 'React.js' },
        { from: /Node \. js/gi, to: 'Node.js' },
        { from: /Vue \. js/gi, to: 'Vue.js' },
        { from: /Micro Services/gi, to: 'Microservices' },
        { from: /Sci Kit/gi, to: 'Scikit' },
    ];

    patterns.forEach(p => {
        current = current.replace(p.from, p.to);
    });

    return current;
}

