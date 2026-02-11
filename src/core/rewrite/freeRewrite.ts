// FREE tier only: Groq (no OpenAI in frontend for free path)
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

export interface GrammarCheckResult {
    original: string;
    rewritten: string;
    changes: string[];
}

export async function fixGrammarOnly(text: string): Promise<GrammarCheckResult> {
    if (!GROQ_API_KEY || GROQ_API_KEY === 'your_groq_api_key_here') {
        console.warn("Groq API key missing");
        return { original: text, rewritten: text, changes: [] };
    }

    const systemPrompt = `Fix grammar, punctuation, and capitalization ONLY in the following text. Do not change the meaning or add content. Return JSON: { "rewritten": "...", "changes": ["..."] }`;

    try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${GROQ_API_KEY}`
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: text }
                ],
                temperature: 0.1,
                response_format: { type: 'json_object' }
            })
        });

        if (!response.ok) throw new Error('Groq API error');
        const data = await response.json();
        const content = JSON.parse(data.choices?.[0]?.message?.content || '{}');

        return {
            original: text,
            rewritten: content.rewritten || text,
            changes: content.changes || []
        };
    } catch (e) {
        console.error("Grammar fix failed", e);
        return { original: text, rewritten: text, changes: [] };
    }
}

export interface BulletResult {
    original: string;
    improved: string;
    changes: string[];
}

export async function improveBullet(text: string, role?: string): Promise<BulletResult> {
    if (!GROQ_API_KEY || GROQ_API_KEY === 'your_groq_api_key_here') {
        console.warn("Groq API key missing");
        return { original: text, improved: text, changes: [] };
    }

    const systemPrompt = `Improve the following resume bullet point${role ? ` for a ${role} role` : ''}.
Only fix grammar, punctuation, and clarity. Do not add numbers or achievements not stated. Do not exaggerate. Keep facts unchanged.
Return JSON: { "improved": "...", "changes": ["..."] }`;

    try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${GROQ_API_KEY}`
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: text }
                ],
                temperature: 0.2,
                response_format: { type: 'json_object' }
            })
        });

        if (!response.ok) throw new Error('Groq API error');
        const data = await response.json();
        const content = JSON.parse(data.choices?.[0]?.message?.content || '{}');

        return {
            original: text,
            improved: content.improved || text,
            changes: content.changes || []
        };
    } catch (e) {
        console.error("Bullet improvement failed", e);
        return { original: text, improved: text, changes: [] };
    }
}

export interface SkillsSuggestionResult {
    original: string[];
    suggested: string[];
    added: string[];
    removed: string[];
}

export async function suggestSkillsForRole(
    currentSkills: string[],
    experienceText: string, // content from experience + projects
    targetRole: string
): Promise<SkillsSuggestionResult> {
    if (!GROQ_API_KEY || GROQ_API_KEY === 'your_groq_api_key_here') {
        console.warn("Groq API key missing");
        return { original: currentSkills, suggested: currentSkills, added: [], removed: [] };
    }

    const systemPrompt = `You are a resume expert. Analyze the provided resume experience and the target role "${targetRole}".
Task: Rewrite the skills list to be highly relevant to the target role, but ONLY include skills that are genuinely supported by evidence in the experience text.
1. Identify technical skills from the experience text.
2. Filter for relevance to the target role: ${targetRole}.
3. Compare with the current skills list.
4. Return a JSON object with these exact keys:
   - "suggested": [list of string, the final recommended list of skills]
   - "added": [list of string, skills you found in experience not in current list]
   - "removed": [list of string, skills from current list that are not supported by experience or irrelevant]
Ensure "suggested" contains the specific skill names found. Normalize names where appropriate (e.g. "React.js" -> "React" if that's standard for the role).`;

    const userContent = `Experience Content:\n${experienceText}\n\nCurrent Skills List:\n${currentSkills.join(', ')}`;

    try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${GROQ_API_KEY}`
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userContent }
                ],
                temperature: 0.1,
                response_format: { type: 'json_object' }
            })
        });

        if (!response.ok) throw new Error('Groq API error');
        const data = await response.json();
        const content = JSON.parse(data.choices?.[0]?.message?.content || '{}');

        return {
            original: currentSkills,
            suggested: Array.isArray(content.suggested) ? content.suggested : currentSkills,
            added: Array.isArray(content.added) ? content.added : [],
            removed: Array.isArray(content.removed) ? content.removed : []
        };
    } catch (e) {
        console.error("Skills suggestion failed", e);
        return { original: currentSkills, suggested: currentSkills, added: [], removed: [] };
    }
}

export interface SimpleExperience {
    company: string;
    position: string;
    highlights: string[];
}

export async function rewriteExperienceForRole(
    experiences: SimpleExperience[],
    targetRole: string
): Promise<SimpleExperience[]> {
    if (!GROQ_API_KEY || GROQ_API_KEY === 'your_groq_api_key_here') {
        return experiences;
    }

    if (experiences.length === 0) return [];

    const systemPrompt = `You are a professional resume writer. Rewrite the resume experience bullets to be targeted for a "${targetRole}" role. 
Rules:
1. Use strong action verbs (e.g., "Architected", "Deployed", "Spearheaded").
2. Tailor valid points to ${targetRole} keywords (e.g. if target is "Frontend", emphasize React/UI work).
3. Do NOT invent new facts or numbers. Only polish existing content.
4. Keep the same number of experience entries and bullets.
5. Return JSON: { "experiences": [{ "company": "...", "position": "...", "highlights": ["..."] }] }
6. Ensure the order matches the input exactly.`;

    const userContent = JSON.stringify(experiences);

    try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${GROQ_API_KEY}`
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userContent }
                ],
                temperature: 0.2, // Low temp for fidelity
                response_format: { type: 'json_object' }
            })
        });

        if (!response.ok) throw new Error('Groq API error');
        const data = await response.json();
        const content = JSON.parse(data.choices?.[0]?.message?.content || '{}');

        if (Array.isArray(content.experiences)) {
            return content.experiences;
        }
        return experiences;
    } catch (e) {
        console.error("Experience rewrite failed", e);
        return experiences;
    }
}

export async function rewriteSummaryForRole(
    currentSummary: string,
    experienceText: string,
    skills: string[],
    targetRole: string
): Promise<string> {
    if (!GROQ_API_KEY || GROQ_API_KEY === 'your_groq_api_key_here') {
        return currentSummary;
    }

    const systemPrompt = `You are a professional resume writer. Write a compelling Professional Summary for a candidate targeting a "${targetRole}" role.
Rules:
1. Synthesize the provided experience and skills into a cohesive 3-4 sentence paragraph.
2. Highlight key achievements and technologies relevant to ${targetRole}.
3. Tone should be professional, confident, and concise. 
4. Strictly fix all grammar, spelling, and formatting errors (e.g., "Al" -> "AI", "S tar" -> "Star").
5. Avoid generic buzzwords (e.g., "hard worker"). Focus on value and impact.
6. If the user includes a personal statement about disability or unique background, refine it to be professional and strength-focused (e.g., highlighting adaptability and determination), unless it seems accidental.
7. Return JSON: { "summary": "..." }`;

    const userContent = `Current Summary (if any): ${currentSummary}\n\nExperience:\n${experienceText}\n\nSkills:\n${skills.join(', ')}`;

    try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${GROQ_API_KEY}`
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userContent }
                ],
                temperature: 0.3,
                response_format: { type: 'json_object' }
            })
        });

        if (!response.ok) throw new Error('Groq API error');
        const data = await response.json();
        const content = JSON.parse(data.choices?.[0]?.message?.content || '{}');

        return content.summary || currentSummary;
    } catch (e) {
        console.error("Summary rewrite failed", e);
        return currentSummary;
    }
}
