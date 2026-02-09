import type { VercelRequest, VercelResponse } from '@vercel/node';
import { query } from '../lib/db';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY || '';

// Static fallback for role intelligence (no LLM call on server for this)
const FALLBACK_VERBS = ['Developed', 'Implemented', 'Led', 'Improved', 'Delivered', 'Built', 'Designed', 'Optimized'];
const FALLBACK_AVOID = ['Led team (if junior)', 'Executive-level claims for non-senior'];

function setCors(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

async function ensurePaid(req: VercelRequest): Promise<boolean> {
  const sessionId = (req.query.session_id as string) || '';
  if (!sessionId) return false;

  const result = await query<{ status: string }>(
    `select status
     from payments
     where session_id = $1
       and status = 'PAID'
     order by created_at desc
     limit 1`,
    [sessionId],
  );
  return !!result.rows[0];
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (!OPENAI_API_KEY) {
    return res.status(503).json({ error: 'Paid rewrite not configured' });
  }

  try {
    const isPaid = await ensurePaid(req);
    if (!isPaid) {
      return res.status(402).json({ error: 'Payment required for ATS wording improvements' });
    }

    const body = req.body as {
      originalText?: string;
      role?: string;
      market?: string;
      experienceLevel?: string;
      jdKeywords?: string[];
    };

    const originalText = typeof body.originalText === 'string' ? body.originalText.trim() : '';
    const role = typeof body.role === 'string' ? body.role : 'Professional';
    const experienceLevel = typeof body.experienceLevel === 'string' ? body.experienceLevel : 'mid';
    const jdKeywords = Array.isArray(body.jdKeywords) ? body.jdKeywords : [];

    if (!originalText) {
      return res.status(400).json({ error: 'Missing originalText' });
    }

    const systemPrompt = `Rewrite the following bullet point for a resume.
Context: Role: ${role}, Level: ${experienceLevel}.
Rules:
1. Use strong action verbs: ${FALLBACK_VERBS.join(', ')}.
2. Integrate keywords if implied: ${jdKeywords.length ? jdKeywords.join(', ') : 'none'}.
3. DO NOT fabricate facts.
4. Avoid restricted claims: ${FALLBACK_AVOID.join(', ')}.
Return JSON: { "rewritten": "...", "changes": ["..."] }`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: originalText },
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('OpenAI error', response.status, err);
      return res.status(502).json({ error: 'AI service error' });
    }

    const data = await response.json();
    const content = JSON.parse(data.choices?.[0]?.message?.content || '{}');
    const rewritten = content.rewritten || originalText;
    const changes = Array.isArray(content.changes) ? content.changes : [];

    const warnings: string[] = [];
    const lower = rewritten.toLowerCase();
    for (const avoid of FALLBACK_AVOID) {
      if (lower.includes(avoid.toLowerCase())) {
        warnings.push(`Contains "${avoid}" - may be questioned`);
      }
    }
    if (['fresher', '1-3'].includes(experienceLevel)) {
      const leadershipTerms = ['led team', 'managed', 'spearheaded', 'drove strategy'];
      for (const term of leadershipTerms) {
        if (lower.includes(term)) {
          warnings.push(`Leadership claim "${term}" may not match level`);
        }
      }
    }

    return res.status(200).json({
      rewritten,
      changes,
      warnings,
    });
  } catch (e: unknown) {
    console.error('Paid rewrite error', e);
    return res.status(500).json({ error: 'Rewrite failed' });
  }
}
