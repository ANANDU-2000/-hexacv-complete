import type { VercelRequest, VercelResponse } from '@vercel/node';

// Simple admin auth check
function isAdminAuthorized(req: VercelRequest): boolean {
    const adminKey = req.headers['x-admin-key'] || req.query.adminKey;
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

    // Check admin authorization
    if (!isAdminAuthorized(req)) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const { status, limit = '50' } = req.query;

        // In production, query your database:
        // const payments = await db.payments.find(
        //     status ? { status } : {},
        //     { limit: parseInt(limit as string), sort: { timestamp: -1 } }
        // );

        // For demo: return empty array (real data would come from database)
        const payments: any[] = [];

        return res.status(200).json({
            success: true,
            payments,
            total: payments.length
        });

    } catch (error: any) {
        console.error('Admin payments list error:', error);
        return res.status(500).json({ error: 'Failed to fetch payments' });
    }
}
