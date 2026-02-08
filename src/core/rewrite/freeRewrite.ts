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
