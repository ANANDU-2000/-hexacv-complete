import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getPaymentsCollection } from '../lib/mongo.js';

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
    const { range = '30' } = req.query;
    const days = Number(range) || 30;
    const since = new Date();
    since.setDate(since.getDate() - days);

    const payments = await getPaymentsCollection();

    const [totalsCursor, listCursor] = await Promise.all([
      payments.aggregate([
        { $match: { created_at: { $gte: since }, status: 'PAID' } },
        {
          $group: {
            _id: null,
            paid_count: { $sum: 1 },
            paid_revenue: { $sum: '$amount_paise' },
          },
        },
      ]),
      payments.find({}).sort({ created_at: -1 }).limit(100),
    ]);

    const totalsArr = await totalsCursor.toArray();
    const totalsRow = totalsArr[0] || { paid_count: 0, paid_revenue: 0 };
    const list = await listCursor.toArray();

    return res.status(200).json({
      success: true,
      totals: {
        paidCount: Number(totalsRow.paid_count),
        paidRevenueRupees: Number(totalsRow.paid_revenue) / 100,
        rangeDays: days,
      },
      payments: list.map((d) => ({
        session_id: d.session_id,
        gateway_order_id: d.gateway_order_id,
        receipt_id: d.receipt_id,
        amount_paise: d.amount_paise,
        status: d.status,
        email: d.email ?? null,
        created_at: d.created_at instanceof Date ? d.created_at.toISOString() : d.created_at,
        paid_at: d.paid_at instanceof Date ? d.paid_at.toISOString() : d.paid_at ?? null,
      })),
    });
  } catch (error: unknown) {
    console.error('Admin payments list error:', error);
    return res.status(500).json({ error: 'Failed to fetch payments' });
  }
}
