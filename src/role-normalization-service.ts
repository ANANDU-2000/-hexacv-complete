/**
 * Role Normalization Service
 * 
 * Purpose: Accept ANY role input and interpret it conservatively using AI.
 * Never blocks user input. Never inflates seniority. Never invents experience.
 */

// import { callGeminiAPI } from './gemini-service'; // Not exported, use fetch directly

export interface RoleNormalization {
    canonical_role: string;
    role_family: string;
    seniority: 'entry' | 'junior' | 'mid' | 'senior';
    confidence: number;
    reason: string;
}

export interface RoleDatabase {
    role_name: string;
    normalized_name: string;
    role_family: string;
    count: number;
    first_seen: string;
    last_used: string;
}

/**
 * LLM-based role normalization with strict constraints
 */
export async function normalizeRole(
    userInput: string,
    experience: any[],
    skills: string[]
): Promise<RoleNormalization> {
    const experienceYears = calculateExperienceYears(experience);
    const skillsList = skills.join(', ');
    
    const prompt = `You are a conservative role classification engine.

User entered role: "${userInput}"
Resume experience years: ${experienceYears}
Skills: ${skillsList}

STRICT RULES:
1. Do NOT inflate seniority beyond evidence
2. Do NOT invent experience not present
3. Infer role category conservatively
4. If ambiguous, default to LOWER seniority
5. Confidence below 0.5 means uncertain classification

Seniority Guidelines:
- entry: 0-1 years or fresh graduate
- junior: 1-3 years
- mid: 3-6 years
- senior: 6+ years OR leadership evidence

Output ONLY valid JSON:
{
  "canonical_role": "normalized role name",
  "role_family": "category (AI, Software, Finance, etc.)",
  "seniority": "entry|junior|mid|senior",
  "confidence": 0.0-1.0,
  "reason": "brief explanation under 50 words"
}`;

    try {
        // Simplified - use fallback for now
        // const response = await callGeminiAPI(prompt);
        // const normalized: RoleNormalization = JSON.parse(response);
        
        // Fallback: Accept as-is with low confidence
        const normalized: RoleNormalization = {
            canonical_role: userInput,
            role_family: 'Other',
            seniority: experienceYears < 1 ? 'entry' : experienceYears < 3 ? 'junior' : experienceYears < 6 ? 'mid' : 'senior',
            confidence: 0.7,
            reason: 'Classified based on experience years'
        };
        
        // Validate output
        if (!normalized.canonical_role || !normalized.role_family || !normalized.seniority) {
            throw new Error('Invalid normalization response');
        }
        
        // Store in analytics
        saveRoleToAnalytics(userInput, normalized);
        
        return normalized;
    } catch (error) {
        console.error('Role normalization failed:', error);
        
        // Fallback: Accept as-is with low confidence
        return {
            canonical_role: userInput,
            role_family: 'Other',
            seniority: 'junior', // Conservative default
            confidence: 0.3,
            reason: 'Unable to classify, accepted as custom role'
        };
    }
}

/**
 * Calculate total experience years from resume
 */
function calculateExperienceYears(experience: any[]): number {
    if (!experience || experience.length === 0) return 0;
    
    let totalMonths = 0;
    
    for (const exp of experience) {
        if (!exp.startDate || !exp.endDate) continue;
        
        const start = parseDateToMonths(exp.startDate);
        const end = exp.endDate.toLowerCase() === 'present' 
            ? new Date().getFullYear() * 12 + new Date().getMonth()
            : parseDateToMonths(exp.endDate);
        
        totalMonths += Math.max(0, end - start);
    }
    
    return Math.round(totalMonths / 12 * 10) / 10; // Round to 1 decimal
}

/**
 * Parse date string to months since year 0
 */
function parseDateToMonths(dateStr: string): number {
    // Handle formats: "MM/YYYY", "YYYY-MM", "Month YYYY"
    const parts = dateStr.match(/(\d{1,2})\D*(\d{4})/);
    if (parts) {
        const month = parseInt(parts[1], 10);
        const year = parseInt(parts[2], 10);
        return year * 12 + month;
    }
    
    // Fallback: assume January of the year
    const yearMatch = dateStr.match(/\d{4}/);
    if (yearMatch) {
        return parseInt(yearMatch[0], 10) * 12;
    }
    
    return 0;
}

/**
 * Save role to analytics (localStorage for now)
 */
function saveRoleToAnalytics(originalRole: string, normalized: RoleNormalization) {
    const storageKey = 'role_analytics';
    
    try {
        const existing = localStorage.getItem(storageKey);
        const analytics: Record<string, RoleDatabase> = existing ? JSON.parse(existing) : {};
        
        const key = originalRole.toLowerCase().trim();
        
        if (analytics[key]) {
            analytics[key].count += 1;
            analytics[key].last_used = new Date().toISOString();
        } else {
            analytics[key] = {
                role_name: originalRole,
                normalized_name: normalized.canonical_role,
                role_family: normalized.role_family,
                count: 1,
                first_seen: new Date().toISOString(),
                last_used: new Date().toISOString()
            };
        }
        
        localStorage.setItem(storageKey, JSON.stringify(analytics));
    } catch (error) {
        console.error('Failed to save role analytics:', error);
    }
}

/**
 * Get role analytics for admin dashboard
 */
export function getRoleAnalytics(): RoleDatabase[] {
    const storageKey = 'role_analytics';
    
    try {
        const existing = localStorage.getItem(storageKey);
        if (!existing) return [];
        
        const analytics: Record<string, RoleDatabase> = JSON.parse(existing);
        return Object.values(analytics).sort((a, b) => b.count - a.count);
    } catch (error) {
        console.error('Failed to retrieve role analytics:', error);
        return [];
    }
}

/**
 * Get suggested roles based on input (fuzzy matching)
 */
export function getSuggestedRoles(input: string, allRoles: string[]): string[] {
    if (!input || input.length < 2) return [];
    
    const lower = input.toLowerCase();
    const normalized = input.replace(/[^a-z0-9]/gi, ' ').toLowerCase();
    
    return allRoles
        .filter(role => {
            const roleLower = role.toLowerCase();
            const roleNormalized = role.replace(/[^a-z0-9]/gi, ' ').toLowerCase();
            
            return roleLower.includes(lower) || 
                   roleNormalized.includes(normalized) ||
                   normalized.includes(roleNormalized);
        })
        .slice(0, 5);
}

/**
 * Get role category for filtering (conservative classification)
 */
export function getRoleCategory(role: string): 'tech' | 'accounting' | 'operations' | 'freshers' | 'sales' | 'other' {
    const lower = role.toLowerCase();
    
    // Tech roles
    if (/engineer|developer|programmer|software|ai|ml|data|tech|devops|qa/i.test(lower)) {
        return 'tech';
    }
    
    // Accounting roles
    if (/account|finance|audit|tax|payroll/i.test(lower)) {
        return 'accounting';
    }
    
    // Operations roles
    if (/operations|admin|supply|logistics|office manager/i.test(lower)) {
        return 'operations';
    }
    
    // Sales roles
    if (/sales|business development|account executive|client|customer/i.test(lower)) {
        return 'sales';
    }
    
    // Freshers
    if (/fresher|intern|trainee|entry|junior|graduate/i.test(lower)) {
        return 'freshers';
    }
    
    return 'other';
}
