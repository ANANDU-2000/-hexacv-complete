import type { VercelRequest, VercelResponse } from '@vercel/node';

// In-memory store for demo (use database in production)
// For production, use: MongoDB, PostgreSQL, Firebase, etc.
const payments: Map<string, any> = new Map();

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const paymentRecord = req.body;

        // Validate required fields
        if (!paymentRecord.paymentId || !paymentRecord.templateId || !paymentRecord.sessionId) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Store payment record with 'pending' status
        const record = {
            ...paymentRecord,
            status: 'pending',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        // In production, save to database
        // await db.payments.insert(record);
        payments.set(paymentRecord.paymentId, record);

        // Log for admin notification (in production, send email/webhook)
        console.log('New payment recorded for admin review:', {
            paymentId: paymentRecord.paymentId,
            templateId: paymentRecord.templateId,
            email: paymentRecord.email,
            amount: paymentRecord.amount
        });

        return res.status(200).json({
            success: true,
            message: 'Payment recorded for admin review',
            paymentId: paymentRecord.paymentId
        });

    } catch (error: any) {
        console.error('Payment record error:', error);
        return res.status(500).json({ error: 'Failed to record payment' });
    }
}
