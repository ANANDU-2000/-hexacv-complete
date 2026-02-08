import type { VercelRequest, VercelResponse } from '@vercel/node';
import { isUnlocked } from '../lib/store';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const template = (req.query.template ?? req.query.templateId ?? '').toString();
    const session = (req.query.session ?? req.query.sessionId ?? '').toString();

    if (!template || !session) {
      return res.status(400).json({ error: 'Missing template or session parameter' });
    }

    const unlocked = isUnlocked(session, template);

    return res.status(200).json({
      unlocked,
      templateId: template,
      sessionId: session,
    });
  } catch (error: unknown) {
    console.error('Unlock status check error:', error);
    return res.status(500).json({ error: 'Failed to check unlock status' });
  }
}
