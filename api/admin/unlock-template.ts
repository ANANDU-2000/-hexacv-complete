import type { VercelRequest, VercelResponse } from '@vercel/node';

// Simple admin auth check (use proper auth in production)
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
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Admin-Key');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Check admin authorization
    if (!isAdminAuthorized(req)) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const { paymentId, sessionId, templateId } = req.body;

        if (!paymentId && (!sessionId || !templateId)) {
            return res.status(400).json({ 
                error: 'Provide either paymentId or both sessionId and templateId' 
            });
        }

        // In production, update database:
        // await db.payments.updateOne(
        //     { paymentId },
        //     { $set: { status: 'unlocked', unlockedAt: new Date() } }
        // );

        // For demo: log the unlock action
        console.log('Admin unlocked template:', {
            paymentId,
            sessionId,
            templateId,
            unlockedAt: new Date().toISOString()
        });

        // In production, you would also:
        // 1. Send email to user notifying them
        // 2. Update the UNLOCKED_TEMPLATES env var or database

        return res.status(200).json({
            success: true,
            message: 'Template unlocked successfully',
            data: {
                paymentId,
                sessionId,
                templateId,
                status: 'unlocked',
                unlockedAt: new Date().toISOString()
            }
        });

    } catch (error: any) {
        console.error('Admin unlock error:', error);
        return res.status(500).json({ error: 'Failed to unlock template' });
    }
}
