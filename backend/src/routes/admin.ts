import express, { Request, Response } from 'express';
import { query } from '../db/index.js';
import { authLimiter } from '../middleware/security.js';

const router = express.Router();

// POST /api/admin/login - Admin authentication (rate limited)
router.post('/login', authLimiter, async (req: Request, res: Response) => {
    const { password } = req.body;
    
    if (!password || password !== process.env.ADMIN_PASSWORD) {
        return res.status(401).json({ error: 'Invalid password' });
    }
    
    // Set session cookie
    res.cookie('admin_session', 'authenticated', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        sameSite: 'strict'
    });
    
    res.json({ success: true });
});

// POST /api/admin/logout
router.post('/logout', (req: Request, res: Response) => {
    res.clearCookie('admin_session');
    res.json({ success: true });
});

// Simple session auth middleware
const adminAuth = (req: Request, res: Response, next: express.NextFunction) => {
    const session = req.cookies.admin_session;
    const legacyAuth = req.headers['x-admin-password'];
    
    if (session === 'authenticated' || legacyAuth === process.env.ADMIN_PASSWORD) {
        return next();
    }
    
    return res.status(401).json({ error: 'Unauthorized' });
};

// GET /api/admin/templates - Get all templates (including inactive)
router.get('/templates', adminAuth, async (req: Request, res: Response) => {
  try {
    const result = await query(
      `SELECT id, name, description, price, is_active, badge, best_for, 
              supports_photo, ats_safe, layout, role_families, 
              preview_image_url, html_file_path, created_at, updated_at
       FROM templates 
       ORDER BY created_at DESC`
    );

    res.json({ templates: result.rows });
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
});

// PATCH /api/admin/templates/:templateId - Update template
router.patch('/templates/:templateId', adminAuth, async (req: Request, res: Response) => {
  try {
    const { templateId } = req.params;
    const updates = req.body;

    const allowedFields = ['price', 'is_active', 'badge', 'name', 'description', 'best_for'];
    const updateFields: string[] = [];
    const updateValues: any[] = [];
    let paramCount = 1;

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        updateFields.push(`${field} = $${paramCount}`);
        updateValues.push(updates[field]);
        paramCount++;
      }
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    updateFields.push(`updated_at = NOW()`);
    updateValues.push(templateId);

    await query(
      `UPDATE templates SET ${updateFields.join(', ')} WHERE id = $${paramCount}`,
      updateValues
    );

    res.json({ success: true, message: 'Template updated' });
  } catch (error) {
    console.error('Error updating template:', error);
    res.status(500).json({ error: 'Failed to update template' });
  }
});

// GET /api/admin/analytics/conversion-funnel
router.get('/analytics/conversion-funnel', adminAuth, async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    const dateFilter = startDate && endDate 
      ? `WHERE timestamp BETWEEN $1 AND $2`
      : '';

    const params = startDate && endDate ? [startDate, endDate] : [];

    // Get event counts
    const eventsResult = await query(
      `SELECT event_type, COUNT(*) as count
       FROM analytics_events
       ${dateFilter}
       GROUP BY event_type`,
      params
    );

    const eventCounts: Record<string, number> = {};
    eventsResult.rows.forEach(row => {
      eventCounts[row.event_type] = parseInt(row.count);
    });

    const funnel = {
      pageVisits: eventCounts['page_visit'] || 0,
      resumeUploads: eventCounts['resume_upload'] || 0,
      templateViews: eventCounts['template_view'] || 0,
      paidTemplateClicks: eventCounts['template_click'] || 0,
      paymentsInitiated: eventCounts['payment_initiated'] || 0,
      paymentsVerified: eventCounts['payment_success'] || 0,
      downloads: eventCounts['download'] || 0,
    };

    const conversionRate = funnel.resumeUploads > 0
      ? ((funnel.paymentsVerified / funnel.resumeUploads) * 100).toFixed(1)
      : '0.0';

    res.json({ funnel, conversionRate: parseFloat(conversionRate) });
  } catch (error) {
    console.error('Error fetching conversion funnel:', error);
    res.status(500).json({ error: 'Failed to fetch conversion funnel' });
  }
});

// GET /api/admin/analytics/role-demand
router.get('/analytics/role-demand', adminAuth, async (req: Request, res: Response) => {
  try {
    const result = await query(
      `SELECT role, search_count, template_selections, avg_conversion_rate
       FROM role_demand
       ORDER BY search_count DESC
       LIMIT 20`
    );

    res.json({ roles: result.rows });
  } catch (error) {
    console.error('Error fetching role demand:', error);
    res.status(500).json({ error: 'Failed to fetch role demand' });
  }
});

// GET /api/admin/analytics/template-performance
router.get('/analytics/template-performance', adminAuth, async (req: Request, res: Response) => {
  try {
    const result = await query(
      `SELECT 
         t.id as template_id,
         t.name,
         COUNT(DISTINCT CASE WHEN ae.event_type = 'template_view' THEN ae.id END) as views,
         COUNT(DISTINCT CASE WHEN ae.event_type = 'template_click' THEN ae.id END) as clicks,
         COUNT(DISTINCT CASE WHEN o.status = 'verified' THEN o.id END) as payments,
         COALESCE(SUM(CASE WHEN o.status = 'verified' THEN o.amount ELSE 0 END), 0) / 100 as revenue
       FROM templates t
       LEFT JOIN analytics_events ae ON t.id = ae.template_id
       LEFT JOIN orders o ON t.id = o.template_id
       GROUP BY t.id, t.name
       ORDER BY revenue DESC`
    );

    const templates = result.rows.map(row => ({
      templateId: row.template_id,
      name: row.name,
      views: parseInt(row.views),
      clicks: parseInt(row.clicks),
      payments: parseInt(row.payments),
      conversionRate: row.clicks > 0 ? ((parseInt(row.payments) / parseInt(row.clicks)) * 100).toFixed(1) : '0.0',
      revenue: parseFloat(row.revenue)
    }));

    res.json({ templates });
  } catch (error) {
    console.error('Error fetching template performance:', error);
    res.status(500).json({ error: 'Failed to fetch template performance' });
  }
});

// GET /api/admin/enterprise/decision-audit
router.get('/enterprise/decision-audit', adminAuth, async (req: Request, res: Response) => {
  try {
    const result = await query(
      `SELECT 
         ci.created_at,
         ci.session_id,
         ci.detected_role_category,
         ci.detected_specific_role,
         ci.experience_level,
         ci.selected_template,
         ci.ats_score_range,
         ci.session_status,
         ci.step_reached
       FROM categorization_insights ci
       ORDER BY ci.created_at DESC
       LIMIT 50`
    );
    
    res.json({ decisions: result.rows });
  } catch (error) {
    console.error('Error fetching decision audit:', error);
    res.status(500).json({ error: 'Failed to fetch decision audit' });
  }
});

// GET /api/admin/enterprise/market-intelligence
router.get('/enterprise/market-intelligence', adminAuth, async (req: Request, res: Response) => {
  try {
    // Get role demand trends
    const roleDemandResult = await query(
      `SELECT 
         role, 
         search_count, 
         template_selections, 
         avg_conversion_rate,
         last_searched_at
       FROM role_demand 
       ORDER BY search_count DESC 
       LIMIT 20`
    );
    
    // Get top performing templates
    const templatePerformanceResult = await query(
      `SELECT 
         t.name as template_name,
         COUNT(DISTINCT o.id) as sales_count,
         COALESCE(SUM(o.amount), 0) / 100 as revenue,
         COUNT(DISTINCT ae.session_id) as views,
         CASE 
           WHEN COUNT(DISTINCT ae.session_id) > 0 
           THEN ROUND(COUNT(DISTINCT o.id)::DECIMAL * 100 / COUNT(DISTINCT ae.session_id), 2)
           ELSE 0 
         END as conversion_rate
       FROM templates t
       LEFT JOIN analytics_events ae ON t.id = ae.template_id AND ae.event_type = 'template_view'
       LEFT JOIN orders o ON t.id = o.template_id AND o.status = 'verified'
       WHERE t.is_active = true
       GROUP BY t.id, t.name
       ORDER BY revenue DESC`
    );
    
    // Get skill gap analysis
    const skillGapResult = await query(
      `SELECT 
         unnest(jd_keywords) as skill,
         COUNT(*) as demand_count
       FROM categorization_insights 
       WHERE jd_keywords IS NOT NULL 
         AND array_length(jd_keywords, 1) > 0
       GROUP BY skill
       ORDER BY demand_count DESC
       LIMIT 10`
    );
    
    res.json({ 
      roleDemand: roleDemandResult.rows,
      templatePerformance: templatePerformanceResult.rows,
      skillGaps: skillGapResult.rows
    });
  } catch (error) {
    console.error('Error fetching market intelligence:', error);
    res.status(500).json({ error: 'Failed to fetch market intelligence' });
  }
});

// GET /api/admin/enterprise/governance-controls
router.get('/enterprise/governance-controls', adminAuth, async (req: Request, res: Response) => {
  try {
    // Get system configuration
    const configResult = await query(
      `SELECT 
         key, 
         value, 
         description,
         updated_at
       FROM system_config 
       ORDER BY updated_at DESC`
    );
    
    // Get active A/B tests
    const abTestsResult = await query(
      `SELECT 
         test_name,
         variant_a,
         variant_b,
         winner,
         confidence_level,
         created_at
       FROM ab_tests 
       WHERE status = 'active'
       ORDER BY created_at DESC`
    );
    
    // Get model version info
    const modelVersionsResult = await query(
      `SELECT 
         model_name,
         version,
         deployment_date,
         performance_metrics
       FROM model_versions 
       ORDER BY deployment_date DESC`
    );
    
    res.json({ 
      systemConfig: configResult.rows,
      abTests: abTestsResult.rows,
      modelVersions: modelVersionsResult.rows
    });
  } catch (error) {
    console.error('Error fetching governance controls:', error);
    res.status(500).json({ error: 'Failed to fetch governance controls' });
  }
});

// GET /api/admin/intelligence/dashboard
router.get('/intelligence/dashboard', adminAuth, async (req: Request, res: Response) => {
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

// GET /api/admin/intelligence/template-analytics
router.get('/intelligence/template-analytics', adminAuth, async (req: Request, res: Response) => {
  try {
    const { periodDays = 30 } = req.query;

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

// GET /api/admin/intelligence/decision-audit
router.get('/intelligence/decision-audit', adminAuth, async (req: Request, res: Response) => {
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

// PUT /api/admin/intelligence/update-template/:templateId
router.put('/intelligence/update-template/:templateId', adminAuth, async (req: Request, res: Response) => {
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

// GET /api/admin/intelligence/system-metrics
router.get('/intelligence/system-metrics', adminAuth, async (req: Request, res: Response) => {
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

// GET /api/admin/ai-usage - AI usage and expense (cost) metrics
router.get('/ai-usage', adminAuth, async (req: Request, res: Response) => {
  try {
    const aiUsageResult = await query(`
      SELECT 
        COUNT(*) as total_calls,
        COALESCE(SUM(cost_usd), 0) as total_cost,
        COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE) as today_calls,
        COALESCE(SUM(cost_usd) FILTER (WHERE created_at >= CURRENT_DATE), 0) as today_cost,
        COUNT(*) FILTER (WHERE operation_type = 'categorization') as categorizations,
        COUNT(*) FILTER (WHERE operation_type IN ('rewrite_bullet', 'rewrite_summary')) as rewrites,
        COUNT(*) FILTER (WHERE operation_type = 'optimization') as optimizations
      FROM ai_usage_logs
    `);
    const row = aiUsageResult.rows[0] || {};
    const totalCalls = Number(row.total_calls) || 0;
    const totalCost = Number(row.total_cost) || 0;
    const todayCalls = Number(row.today_calls) || 0;
    const todayCost = Number(row.today_cost) || 0;
    res.json({
      totalAICalls: totalCalls,
      todayAICalls: todayCalls,
      aiCostTotal: totalCost,
      aiCostToday: todayCost,
      averageCostPerCall: totalCalls > 0 ? totalCost / totalCalls : 0,
      categorizations: Number(row.categorizations) || 0,
      rewrites: Number(row.rewrites) || 0,
      optimizations: Number(row.optimizations) || 0
    });
  } catch (error) {
    console.error('Error fetching AI usage metrics:', error);
    res.status(500).json({ error: 'Failed to fetch AI usage metrics' });
  }
});

export default router;
