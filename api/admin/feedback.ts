import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getFeedbackCollection } from '../lib/mongo.js';

function isAdminAuthorized(req: VercelRequest): boolean {
  const adminKey = (req.headers['x-admin-key'] as string) || (req.query.adminKey as string);
  const expectedKey = process.env.ADMIN_SECRET_KEY;
  if (!expectedKey) {
    console.warn('ADMIN_SECRET_KEY not configured');
    return false;
  }
  return adminKey === expectedKey;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Admin-Key');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!isAdminAuthorized(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const feedbackCol = await getFeedbackCollection();
    const list = await feedbackCol.find({}).sort({ created_at: -1 }).limit(100).toArray();

    const feedback = list.map((d) => ({
      id: (d as { _id?: unknown })._id?.toString?.() ?? '',
      session_id: d.session_id ?? null,
      page: d.page ?? null,
      message: d.message,
      email: d.email ?? null,
      type: d.type ?? null,
      status: d.status ?? null,
      created_at: d.created_at instanceof Date ? d.created_at.toISOString() : String(d.created_at),
    }));

    return res.status(200).json({
      success: true,
      feedback,
    });
  } catch (err) {
    console.error('Admin feedback error', err);
    return res.status(500).json({ error: 'Failed to fetch feedback' });
  }
}

