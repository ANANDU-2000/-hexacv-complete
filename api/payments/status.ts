import type { VercelRequest, VercelResponse } from '@vercel/node';
import { query } from '../lib/db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sessionId = (req.query.session_id as string) || '';

  if (!sessionId) {
    return res.status(400).json({ error: 'session_id is required' });
  }

  try {
    const result = await query<{ status: string }>(
      `select status
       from payments
       where session_id = $1
       order by created_at desc
       limit 1`,
      [sessionId],
    );

    const row = result.rows[0];
    return res.status(200).json({
      success: true,
      status: row?.status ?? 'NONE',
    });
  } catch (err) {
    console.error('Payment status error', err);
    return res.status(500).json({ error: 'Failed to fetch status' });
  }
}

