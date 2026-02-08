
/**
 * AI Refinement Logic
 * Handles improving bullet points and summaries
 */

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || '';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

export async function refineResumeSummary(profile: string, jobTitle: string, jd?: string): Promise<string> {
    if (!profile?.trim() || !GROQ_API_KEY) return profile;

    const prompt = `Refine this professional summary to be more impactful for a ${jobTitle} role.
    ${jd ? `JD Context: ${jd.slice(0, 1000)}` : ''}
    RULES: No preamble. VERBATIM facts only. Max 60 words.
    ORIGINAL: ${profile}`;

    try {
        const response = await fetch(GROQ_API_URL, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.3
            })
        });
        const data = await response.json();
        return data.choices?.[0]?.message?.content?.trim() || profile;
    } catch (e) {
        return profile;
    }
}

export async function refineExperienceHighlights(highlights: string[], position: string, company: string, jd: string): Promise<string[]> {
    if (!highlights || highlights.length === 0 || !GROQ_API_KEY) return highlights;

    const prompt = `Refine these resume bullet points for ${position} at ${company}.
    JD Alignment: ${jd.slice(0, 1000)}
    RULES: Return ONLY refined bullets, one per line. No numbers.
    ORIGINAL:
    ${highlights.join('\n')}`;

    try {
        const response = await fetch(GROQ_API_URL, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.2
            })
        });
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content?.trim() || '';
        return content.split('\n').filter((l: string) => l.trim().length > 0);
    } catch (e) {
        return highlights;
    }
}
