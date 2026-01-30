import express, { Request, Response } from 'express';
import { query } from '../db/index.js';

const router = express.Router();

// GET /api/admin/intelligence/dashboard - Get enterprise intelligence dashboard data
router.get('/dashboard', async (req: Request, res: Response) => {
  try {
    // Get recent sessions count
    const recentSessionsResult = await query(`
      SELECT COUNT(*) as count
      FROM resume_sessions
      WHERE created_at >= NOW() - INTERVAL '7 days'
    `);

    // Get template performance summary
    const templatePerformanceResult = await query(`
      SELECT 
        tm.external_name as template_name,
        COUNT(tpm.id) as usage_count,
        AVG(tpm.conversion_rate) as avg_conversion_rate,
        AVG(tpm.user_satisfaction_score) as avg_satisfaction
      FROM template_performance_metrics tpm
      JOIN template_master tm ON tpm.template_id = tm.id
      WHERE tpm.metric_period_start >= NOW() - INTERVAL '30 days'
      GROUP BY tm.id, tm.external_name
      ORDER BY usage_count DESC
      LIMIT 10
    `);

    // Get role demand trends
    const roleDemandResult = await query(`
      SELECT 
        role_name,
        demand_score,
        trend_direction
      FROM role_demand_trends
      ORDER BY demand_score DESC
      LIMIT 10
    `);

    // Get recent decision explanations
    const recentDecisionsResult = await query(`
      SELECT 
        de.decision_type,
        de.confidence_score,
        de.decision_source,
        de.decision_timestamp,
        ri.detected_role as role
      FROM decision_explanations de
      LEFT JOIN role_intent ri ON de.session_id = ri.session_id
      ORDER BY de.decision_timestamp DESC
      LIMIT 20
    `);

    res.json({
      success: true,
      dashboardData: {
        recentSessions: parseInt(recentSessionsResult.rows[0].count),
        templatePerformance: templatePerformanceResult.rows,
        roleDemandTrends: roleDemandResult.rows,
        recentDecisions: recentDecisionsResult.rows
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// GET /api/admin/intelligence/template-analytics - Get detailed template analytics
router.get('/template-analytics', async (req: Request, res: Response) => {
  try {
    const { templateId, periodDays = 30 } = req.query;

    let templateAnalyticsQuery = `
      SELECT 
        tm.external_name as template_name,
        tm.description,
        tm.category,
        tm.ats_compatibility_score,
        COUNT(tpm.id) as usage_count,
        AVG(tpm.conversion_rate) as avg_conversion_rate,
        AVG(tpm.user_satisfaction_score) as avg_satisfaction_score,
        AVG(tpm.average_completion_time_seconds) as avg_completion_time
      FROM template_master tm
      LEFT JOIN template_performance_metrics tpm ON tm.id = tpm.template_id
      WHERE tm.is_active = true
        AND tpm.metric_period_start >= NOW() - INTERVAL '${periodDays} days'
      GROUP BY tm.id, tm.external_name, tm.description, tm.category, tm.ats_compatibility_score
      ORDER BY usage_count DESC
    `;

    const templateAnalyticsResult = await query(templateAnalyticsQuery);

    res.json({
      success: true,
      templateAnalytics: templateAnalyticsResult.rows
    });
  } catch (error) {
    console.error('Error fetching template analytics:', error);
    res.status(500).json({ error: 'Failed to fetch template analytics' });
  }
});

// GET /api/admin/intelligence/decision-audit - Get decision audit logs
router.get('/decision-audit', async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, decisionType, decisionSource } = req.query;

    let baseQuery = `FROM decision_audit_logs dal
                     JOIN resume_sessions rs ON dal.session_id = rs.session_id
                     LEFT JOIN role_intent ri ON rs.id = ri.session_id`;

    const countResult = await query(`SELECT COUNT(*) as count ${baseQuery}`);

    let whereClause = '';
    const queryParams: any[] = [];
    let paramIndex = 1;

    if (decisionType) {
      whereClause += `WHERE dal.decision_type = $${paramIndex}`;
      queryParams.push(decisionType);
      paramIndex++;
    }

    if (decisionSource) {
      if (whereClause) {
        whereClause += ` AND dal.decision_source = $${paramIndex}`;
      } else {
        whereClause += `WHERE dal.decision_source = $${paramIndex}`;
      }
      queryParams.push(decisionSource);
      paramIndex++;
    }

    baseQuery = `FROM decision_audit_logs dal
                 JOIN resume_sessions rs ON dal.session_id = rs.session_id
                 LEFT JOIN role_intent ri ON rs.id = ri.session_id
                 ${whereClause}`;

    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
    const auditLogsResult = await query(`
      SELECT 
        dal.id,
        dal.decision_type,
        dal.decision_source,
        dal.confidence_score,
        dal.decision_timestamp,
        dal.decision_reason,
        ri.detected_role,
        ri.experience_level
      FROM decision_audit_logs dal
      JOIN resume_sessions rs ON dal.session_id = rs.session_id
      LEFT JOIN role_intent ri ON rs.id = ri.session_id
      ${whereClause}
      ORDER BY dal.decision_timestamp DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `, [...queryParams, parseInt(limit as string), offset]);

    res.json({
      success: true,
      decisionAuditLogs: auditLogsResult.rows,
      pagination: {
        currentPage: parseInt(page as string),
        totalPages: Math.ceil(parseInt(countResult.rows[0].count) / parseInt(limit as string)),
        totalRecords: parseInt(countResult.rows[0].count),
        recordsPerPage: parseInt(limit as string)
      }
    });
  } catch (error) {
    console.error('Error fetching decision audit logs:', error);
    res.status(500).json({ error: 'Failed to fetch decision audit logs' });
  }
});

// PUT /api/admin/intelligence/update-template - Update template configuration
router.put('/update-template/:templateId', async (req: Request, res: Response) => {
  try {
    const { templateId } = req.params;
    const { config, isActive, isVisibleToUsers, description } = req.body;

    if (!templateId) {
      return res.status(400).json({ error: 'Template ID is required' });
    }

    // Update the template
    await query(`
      UPDATE template_master 
      SET config = COALESCE($1, config),
          is_active = COALESCE($2, is_active),
          is_visible_to_users = COALESCE($3, is_visible_to_users),
          description = COALESCE($4, description),
          updated_at = NOW()
      WHERE id = $5
    `, [config, isActive, isVisibleToUsers, description, templateId]);

    // Log the admin change
    await query(`
      INSERT INTO admin_changes_history (
        admin_user_id,
        change_type,
        affected_entity_type,
        affected_entity_id,
        change_description,
        old_values,
        new_values,
        reason_for_change
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [
      'system', // Admin user ID would come from auth middleware in production
      'template_update',
      'template_master',
      templateId,
      'Template configuration updated via admin panel',
      '{}', // Could capture old values if needed
      JSON.stringify({ config, isActive, isVisibleToUsers, description }),
      'Admin configuration update'
    ]);

    res.json({
      success: true,
      message: 'Template updated successfully'
    });
  } catch (error) {
    console.error('Error updating template:', error);
    res.status(500).json({ error: 'Failed to update template' });
  }
});

// GET /api/admin/intelligence/system-metrics - Get system health and metrics
router.get('/system-metrics', async (req: Request, res: Response) => {
  try {
    // Get various system metrics
    const [
      userGrowth,
      templateUsage,
      decisionVolume,
      auditCompliance,
      systemHealth
    ] = await Promise.all([
      // User growth over time
      query(`
        SELECT 
          DATE_TRUNC('day', created_at) as date,
          COUNT(*) as new_users
        FROM users
        WHERE created_at >= NOW() - INTERVAL '30 days'
        GROUP BY DATE_TRUNC('day', created_at)
        ORDER BY date DESC
      `),
      
      // Template usage statistics
      query(`
        SELECT 
          tm.external_name as template_name,
          COUNT(tr.id) as selection_count,
          AVG(tr.score) as avg_score
        FROM template_rankings tr
        JOIN template_master tm ON tr.template_id = tm.id
        WHERE tr.created_at >= NOW() - INTERVAL '30 days'
        GROUP BY tm.id, tm.external_name
        ORDER BY selection_count DESC
      `),
      
      // Decision volume
      query(`
        SELECT 
          decision_type,
          COUNT(*) as decision_count,
          AVG(confidence_score) as avg_confidence
        FROM decision_explanations
        WHERE decision_timestamp >= NOW() - INTERVAL '30 days'
        GROUP BY decision_type
      `),
      
      // Audit compliance
      query(`
        SELECT 
          COUNT(*) as total_decisions,
          COUNT(CASE WHEN decision_reason IS NOT NULL THEN 1 END) as explained_decisions,
          ROUND(COUNT(CASE WHEN decision_reason IS NOT NULL THEN 1 END) * 100.0 / COUNT(*), 2) as explanation_coverage
        FROM decision_explanations
        WHERE decision_timestamp >= NOW() - INTERVAL '30 days'
      `),
      
      // System health checks
      query(`
        SELECT 
          COUNT(*) FILTER (WHERE status = 'active') as active_sessions,
          COUNT(*) FILTER (WHERE expires_at < NOW()) as expired_sessions,
          COUNT(*) as total_sessions
        FROM resume_sessions
      `)
    ]);

    res.json({
      success: true,
      systemMetrics: {
        userGrowth: userGrowth.rows,
        templateUsage: templateUsage.rows,
        decisionVolume: decisionVolume.rows,
        auditCompliance: auditCompliance.rows[0],
        systemHealth: systemHealth.rows[0]
      }
    });
  } catch (error) {
    console.error('Error fetching system metrics:', error);
    res.status(500).json({ error: 'Failed to fetch system metrics' });
  }
});

export default router;