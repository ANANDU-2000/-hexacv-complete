import type { VercelRequest, VercelResponse } from '@vercel/node';
import { query } from '../lib/db';

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
    const result = await query<{
      id: string;
      session_id: string | null;
      page: string | null;
      message: string;
      email: string | null;
      type: string | null;
      status: string | null;
      created_at: string;
    }>(
      `select id, session_id, page, message, email, type, status, created_at
       from feedback
       order by created_at desc
       limit 100`,
    );

    return res.status(200).json({
      success: true,
      feedback: result.rows,
    });
  } catch (err) {
    console.error('Admin feedback error', err);
    return res.status(500).json({ error: 'Failed to fetch feedback' });
  }
}

