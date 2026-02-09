import type { VercelRequest, VercelResponse } from '@vercel/node';
import { query } from '../lib/db';

// Simple admin auth check
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
  // CORS headers
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
    const { range = '30' } = req.query;
    const days = Number(range) || 30;

    const sinceSql = `now() - interval '${days} days'`;

    const [totalsResult, listResult] = await Promise.all([
      query<{
        paid_count: string;
        paid_revenue: string;
      }>(
        `select
           count(*) filter (where status = 'PAID') as paid_count,
           coalesce(sum(amount_paise) filter (where status = 'PAID'), 0) as paid_revenue
         from payments
         where created_at >= ${sinceSql}`,
      ),
      query<{
        session_id: string;
        gateway_order_id: string;
        receipt_id: string;
        amount_paise: number;
        status: string;
        email: string | null;
        created_at: string;
        paid_at: string | null;
      }>(
        `select session_id, gateway_order_id, receipt_id, amount_paise, status, email, created_at, paid_at
         from payments
         order by created_at desc
         limit 100`,
      ),
    ]);

    const totalsRow = totalsResult.rows[0] || { paid_count: '0', paid_revenue: '0' };

    return res.status(200).json({
      success: true,
      totals: {
        paidCount: Number(totalsRow.paid_count),
        paidRevenueRupees: Number(totalsRow.paid_revenue) / 100,
        rangeDays: days,
      },
      payments: listResult.rows,
    });
  } catch (error: any) {
    console.error('Admin payments list error:', error);
    return res.status(500).json({ error: 'Failed to fetch payments' });
  }
}
