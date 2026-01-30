import express, { Request, Response } from 'express';
import { query } from '../db/index.js';

const router = express.Router();

// POST /api/analytics/categorization - Track resume categorization insights
router.post('/categorization', async (req: Request, res: Response) => {
  try {
    const {
      sessionId,
      detectedRoleCategory,
      detectedSpecificRole,
      experienceLevel,
      industryType,
      jdKeywords,
      recommendedTemplates,
      selectedTemplate,
      atsScoreRange,
      sessionStatus,
      stepReached
    } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID required' });
    }

    // Insert categorization insight into the database
    await query(
      `INSERT INTO categorization_insights (
        session_id, 
        detected_role_category, 
        detected_specific_role, 
        experience_level, 
        industry_type, 
        jd_keywords, 
        recommended_templates, 
        selected_template, 
        ats_score_range, 
        session_status, 
        step_reached
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        sessionId,
        detectedRoleCategory,
        detectedSpecificRole,
        experienceLevel,
        industryType,
        jdKeywords || [],
        recommendedTemplates || [],
        selectedTemplate,
        atsScoreRange,
        sessionStatus,
        stepReached
      ]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Error tracking categorization:', error);
    res.status(500).json({ error: 'Failed to track categorization' });
  }
});

// GET /api/analytics/categorization/stats - Get categorization statistics for admin dashboard
router.get('/categorization/stats', async (req: Request, res: Response) => {
  try {
    // Get role category distribution
    const roleCategoryResult = await query(`
      SELECT detected_role_category as category, COUNT(*) as count
      FROM categorization_insights
      WHERE created_at >= NOW() - INTERVAL '30 days'
      GROUP BY detected_role_category
      ORDER BY count DESC
    `);

    // Get experience level distribution
    const experienceLevelResult = await query(`
      SELECT experience_level, COUNT(*) as count
      FROM categorization_insights
      WHERE created_at >= NOW() - INTERVAL '30 days'
      GROUP BY experience_level
      ORDER BY count DESC
    `);

    // Get industry type distribution
    const industryTypeResult = await query(`
      SELECT industry_type, COUNT(*) as count
      FROM categorization_insights
      WHERE created_at >= NOW() - INTERVAL '30 days'
      GROUP BY industry_type
      ORDER BY count DESC
    `);

    // Get most common specific roles
    const roleDistributionResult = await query(`
      SELECT detected_specific_role as role, COUNT(*) as count
      FROM categorization_insights
      WHERE created_at >= NOW() - INTERVAL '30 days'
      GROUP BY detected_specific_role
      ORDER BY count DESC
      LIMIT 20
    `);

    // Get template recommendation effectiveness
    const templateEffectivenessResult = await query(`
      SELECT 
        unnest(recommended_templates) as template_id,
        COUNT(*) as recommendations,
        COUNT(CASE WHEN selected_template = unnest(recommended_templates) THEN 1 END) as selections
      FROM categorization_insights
      WHERE created_at >= NOW() - INTERVAL '30 days'
        AND recommended_templates IS NOT NULL 
        AND array_length(recommended_templates, 1) > 0
      GROUP BY template_id
      ORDER BY recommendations DESC
      LIMIT 10
    `);

    res.json({
      roleCategories: roleCategoryResult.rows,
      experienceLevels: experienceLevelResult.rows,
      industryTypes: industryTypeResult.rows,
      topRoles: roleDistributionResult.rows,
      templateEffectiveness: templateEffectivenessResult.rows
    });
  } catch (error) {
    console.error('Error fetching categorization stats:', error);
    res.status(500).json({ error: 'Failed to fetch categorization stats' });
  }
});

export default router;