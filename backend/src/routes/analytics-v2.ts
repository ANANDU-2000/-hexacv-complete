import express from 'express';
import { query } from '../db/index.js';

const router = express.Router();

/**
 * ANALYTICS EVENT TRACKING
 * Records user events for metrics dashboard
 */

// POST /api/analytics/event
router.post('/event', async (req, res) => {
    try {
        const { eventType, userId, sessionId, templateId, metadata } = req.body;

        if (!eventType) {
            return res.status(400).json({ error: 'eventType required' });
        }

        // Insert event
        await query(
            `INSERT INTO analytics_events 
            (event_type, user_id, session_id, template_id, metadata, created_at) 
            VALUES ($1, $2, $3, $4, $5, NOW())`,
            [eventType, userId || null, sessionId || null, templateId || null, metadata || null]
        );

        res.json({ success: true });
    } catch (error: any) {
        console.error('Analytics event error:', error);
        res.status(500).json({ error: 'Failed to record event' });
    }
});

// GET /api/analytics/metrics
router.get('/metrics', async (req, res) => {
    try {
        const { startDate, endDate, metric } = req.query;

        // Daily active users
        if (metric === 'dau') {
            const result = await query(
                `SELECT DATE(created_at) as date, COUNT(DISTINCT session_id) as count
                FROM analytics_events
                WHERE created_at >= $1 AND created_at <= $2
                GROUP BY DATE(created_at)
                ORDER BY date DESC`,
                [startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), endDate || new Date()]
            );
            return res.json({ metric: 'dau', data: result.rows });
        }

        // Resume creation count
        if (metric === 'resume_created') {
            const result = await query(
                `SELECT DATE(created_at) as date, COUNT(*) as count
                FROM analytics_events
                WHERE event_type = 'resume_created'
                AND created_at >= $1 AND created_at <= $2
                GROUP BY DATE(created_at)
                ORDER BY date DESC`,
                [startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), endDate || new Date()]
            );
            return res.json({ metric: 'resume_created', data: result.rows });
        }

        // Template usage
        if (metric === 'template_usage') {
            const result = await query(
                `SELECT template_id, COUNT(*) as count
                FROM analytics_events
                WHERE event_type = 'template_selected'
                AND created_at >= $1 AND created_at <= $2
                GROUP BY template_id
                ORDER BY count DESC`,
                [startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), endDate || new Date()]
            );
            return res.json({ metric: 'template_usage', data: result.rows });
        }

        // Paid conversions
        if (metric === 'conversions') {
            const result = await query(
                `SELECT DATE(created_at) as date, COUNT(*) as count, SUM(amount) as revenue
                FROM orders
                WHERE status = 'completed'
                AND created_at >= $1 AND created_at <= $2
                GROUP BY DATE(created_at)
                ORDER BY date DESC`,
                [startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), endDate || new Date()]
            );
            return res.json({ metric: 'conversions', data: result.rows });
        }

        // Drop-off by step
        if (metric === 'drop_off') {
            const result = await query(
                `SELECT event_type as step, COUNT(*) as count
                FROM analytics_events
                WHERE event_type IN ('editor_loaded', 'template_viewed', 'pdf_downloaded')
                AND created_at >= $1 AND created_at <= $2
                GROUP BY event_type
                ORDER BY count DESC`,
                [startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), endDate || new Date()]
            );
            return res.json({ metric: 'drop_off', data: result.rows });
        }

        res.status(400).json({ error: 'Invalid metric type' });
    } catch (error: any) {
        console.error('Analytics metrics error:', error);
        res.status(500).json({ error: 'Failed to fetch metrics' });
    }
});

// GET /api/analytics/summary
router.get('/summary', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const end = endDate || new Date();

        // Aggregate metrics
        const [dau, totalResumes, totalRevenue, conversionRate] = await Promise.all([
            query(
                `SELECT COUNT(DISTINCT session_id) as count FROM analytics_events 
                WHERE created_at >= $1 AND created_at <= $2`,
                [start, end]
            ),
            query(
                `SELECT COUNT(*) as count FROM analytics_events 
                WHERE event_type = 'resume_created' 
                AND created_at >= $1 AND created_at <= $2`,
                [start, end]
            ),
            query(
                `SELECT COALESCE(SUM(amount), 0) as total FROM orders 
                WHERE status = 'completed' 
                AND created_at >= $1 AND created_at <= $2`,
                [start, end]
            ),
            query(
                `SELECT 
                    (SELECT COUNT(*) FROM orders WHERE status = 'completed' AND created_at >= $1 AND created_at <= $2)::float /
                    NULLIF((SELECT COUNT(*) FROM analytics_events WHERE event_type = 'template_viewed' AND created_at >= $1 AND created_at <= $2), 0) * 100 as rate`,
                [start, end]
            )
        ]);

        res.json({
            dailyActiveUsers: dau.rows[0]?.count || 0,
            totalResumes: totalResumes.rows[0]?.count || 0,
            totalRevenue: totalRevenue.rows[0]?.total || 0,
            conversionRate: conversionRate.rows[0]?.rate || 0
        });
    } catch (error: any) {
        console.error('Analytics summary error:', error);
        res.status(500).json({ error: 'Failed to fetch summary' });
    }
});

export default router;
