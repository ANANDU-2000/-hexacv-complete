import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getPaymentsCollection } from '../lib/mongo.js';

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
    const payments = await getPaymentsCollection();
    const doc = await payments.findOne(
      { session_id: sessionId },
      { sort: { created_at: -1 }, projection: { status: 1 } },
    );
    return res.status(200).json({
      success: true,
      status: doc?.status ?? 'NONE',
    });
  } catch (err) {
    console.error('Payment status error', err);
    return res.status(500).json({ error: 'Failed to fetch status' });
  }
}

