import type { VercelRequest, VercelResponse } from '@vercel/node';

// In production, this would query your database
// For demo, we check a simple JSON store or environment variable

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { template, session } = req.query;

        if (!template || !session) {
            return res.status(400).json({ error: 'Missing template or session parameter' });
        }

        // In production, query your database:
        // const payment = await db.payments.findOne({
        //     templateId: template,
        //     sessionId: session,
        //     status: 'unlocked'
        // });
        // return res.status(200).json({ unlocked: !!payment });

        // For demo: check environment variable for unlocked sessions
        // Format: UNLOCKED_TEMPLATES=session1:template2,session2:template2
        const unlockedList = process.env.UNLOCKED_TEMPLATES || '';
        const key = `${session}:${template}`;
        const isUnlocked = unlockedList.split(',').includes(key);

        return res.status(200).json({
            unlocked: isUnlocked,
            templateId: template,
            sessionId: session
        });

    } catch (error: any) {
        console.error('Unlock status check error:', error);
        return res.status(500).json({ error: 'Failed to check unlock status' });
    }
}
