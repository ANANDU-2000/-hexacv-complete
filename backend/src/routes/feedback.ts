import express, { Request, Response } from 'express';
import { query } from '../db/index.js';

const router = express.Router();

// POST /api/feedback - Submit new feedback
router.post('/', async (req: Request, res: Response) => {
    try {
        const { rating, message, userName, userEmail, templateId } = req.body;

        // Validate rating
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ error: 'Rating must be between 1 and 5' });
        }

        // Insert feedback (not approved by default)
        const result = await query(
            `INSERT INTO feedback (rating, message, user_name, user_email, template_id, is_approved)
             VALUES ($1, $2, $3, $4, $5, FALSE)
             RETURNING id, rating, message, user_name, created_at`,
            [rating, message || '', userName || '', userEmail || '', templateId || '']
        );

        res.status(201).json({
            success: true,
            message: 'Thank you for your feedback!',
            feedback: result.rows[0]
        });
    } catch (error) {
        console.error('Error submitting feedback:', error);
        res.status(500).json({ error: 'Failed to submit feedback' });
    }
});

// GET /api/feedback/approved - Get approved feedbacks for public display
router.get('/approved', async (req: Request, res: Response) => {
    try {
        const result = await query(
            `SELECT id, rating, message, user_name as "userName", template_id, created_at as "createdAt"
             FROM feedback
             WHERE is_approved = TRUE AND rating >= 4
             ORDER BY is_featured DESC, created_at DESC
             LIMIT 20`
        );

        res.json({ feedbacks: result.rows });
    } catch (error) {
        console.error('Error fetching approved feedbacks:', error);
        res.status(500).json({ error: 'Failed to fetch feedbacks' });
    }
});

// Admin routes (protected by admin auth middleware)
const adminAuth = (req: Request, res: Response, next: express.NextFunction) => {
    const adminPassword = req.headers['x-admin-password'];
    if (adminPassword !== process.env.ADMIN_PASSWORD) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
};

// GET /api/feedback/admin - Get all feedbacks for admin
router.get('/admin', adminAuth, async (req: Request, res: Response) => {
    try {
        const { status, rating, page = 1, limit = 20 } = req.query;
        const offset = (Number(page) - 1) * Number(limit);

        let whereClause = '';
        const params: any[] = [];
        let paramCount = 1;

        if (status === 'approved') {
            whereClause = `WHERE is_approved = TRUE`;
        } else if (status === 'pending') {
            whereClause = `WHERE is_approved = FALSE`;
        }

        if (rating) {
            whereClause += whereClause ? ' AND ' : 'WHERE ';
            whereClause += `rating = $${paramCount}`;
            params.push(Number(rating));
            paramCount++;
        }

        params.push(Number(limit), offset);

        const result = await query(
            `SELECT id, rating, message, user_name, user_email, template_id, 
                    is_approved, is_featured, created_at, updated_at
             FROM feedback
             ${whereClause}
             ORDER BY created_at DESC
             LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
            params
        );

        // Get total count
        const countResult = await query(
            `SELECT COUNT(*) FROM feedback ${whereClause}`,
            params.slice(0, -2)
        );

        res.json({
            feedbacks: result.rows,
            total: parseInt(countResult.rows[0].count),
            page: Number(page),
            limit: Number(limit)
        });
    } catch (error) {
        console.error('Error fetching feedbacks:', error);
        res.status(500).json({ error: 'Failed to fetch feedbacks' });
    }
});

// PATCH /api/feedback/admin/:id - Approve/reject feedback
router.patch('/admin/:id', adminAuth, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { isApproved, isFeatured } = req.body;

        const updates: string[] = [];
        const values: any[] = [];
        let paramCount = 1;

        if (isApproved !== undefined) {
            updates.push(`is_approved = $${paramCount}`);
            values.push(isApproved);
            paramCount++;
        }

        if (isFeatured !== undefined) {
            updates.push(`is_featured = $${paramCount}`);
            values.push(isFeatured);
            paramCount++;
        }

        if (updates.length === 0) {
            return res.status(400).json({ error: 'No updates provided' });
        }

        values.push(id);

        await query(
            `UPDATE feedback SET ${updates.join(', ')} WHERE id = $${paramCount}`,
            values
        );

        res.json({ success: true, message: 'Feedback updated' });
    } catch (error) {
        console.error('Error updating feedback:', error);
        res.status(500).json({ error: 'Failed to update feedback' });
    }
});

// DELETE /api/feedback/admin/:id - Delete feedback
router.delete('/admin/:id', adminAuth, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        await query('DELETE FROM feedback WHERE id = $1', [id]);

        res.json({ success: true, message: 'Feedback deleted' });
    } catch (error) {
        console.error('Error deleting feedback:', error);
        res.status(500).json({ error: 'Failed to delete feedback' });
    }
});

// GET /api/feedback/stats - Get feedback statistics for admin
router.get('/stats', adminAuth, async (req: Request, res: Response) => {
    try {
        const result = await query(`
            SELECT 
                COUNT(*) as total,
                COUNT(*) FILTER (WHERE is_approved = TRUE) as approved,
                COUNT(*) FILTER (WHERE is_approved = FALSE) as pending,
                COUNT(*) FILTER (WHERE rating = 5) as five_star,
                COUNT(*) FILTER (WHERE rating = 4) as four_star,
                COUNT(*) FILTER (WHERE rating = 3) as three_star,
                COUNT(*) FILTER (WHERE rating <= 2) as low_rating,
                ROUND(AVG(rating)::numeric, 2) as avg_rating
            FROM feedback
        `);

        res.json({ stats: result.rows[0] });
    } catch (error) {
        console.error('Error fetching feedback stats:', error);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

export default router;
