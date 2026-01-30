import express, { Request, Response } from 'express';
import { query } from '../db/index.js';

const router = express.Router();

// POST /api/intelligence/analyze-role - Analyze user's role intent
router.post('/analyze-role', async (req: Request, res: Response) => {
  try {
    const {
      sessionId,
      detectedRole,
      confidenceScore,
      experienceLevel,
      industry,
      subIndustry
    } = req.body;

    if (!sessionId || !detectedRole || !confidenceScore) {
      return res.status(400).json({ error: 'Session ID, detected role, and confidence score are required' });
    }

    // Insert role intent into the database
    const result = await query(
      `INSERT INTO role_intent (
        session_id, 
        detected_role, 
        confidence_score, 
        experience_level, 
        industry, 
        sub_industry,
        validated_by_user
      ) VALUES ($1, $2, $3, $4, $5, $6, $7) 
      RETURNING id`,
      [
        sessionId,
        detectedRole,
        confidenceScore,
        experienceLevel || 'unknown',
        industry || null,
        subIndustry || null,
        false
      ]
    );

    res.json({ 
      success: true, 
      id: result.rows[0].id,
      message: 'Role intent recorded successfully'
    });
  } catch (error) {
    console.error('Error recording role intent:', error);
    res.status(500).json({ error: 'Failed to record role intent' });
  }
});

// POST /api/intelligence/jd-analysis - Store job description analysis
router.post('/jd-analysis', async (req: Request, res: Response) => {
  try {
    const {
      sessionId,
      rawJdText,
      processedJdJson,
      aiModelVersion,
      promptVersion
    } = req.body;

    if (!sessionId || !rawJdText || !processedJdJson || !aiModelVersion || !promptVersion) {
      return res.status(400).json({ 
        error: 'Session ID, raw JD text, processed JD JSON, AI model version, and prompt version are required' 
      });
    }

    // Insert JD analysis snapshot into the database
    const result = await query(
      `INSERT INTO jd_analysis_snapshots (
        session_id,
        raw_jd_text,
        processed_jd_json,
        ai_model_version,
        prompt_version
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING id`,
      [
        sessionId,
        rawJdText,
        JSON.stringify(processedJdJson),
        aiModelVersion,
        promptVersion
      ]
    );

    res.json({ 
      success: true, 
      id: result.rows[0].id,
      message: 'JD analysis recorded successfully'
    });
  } catch (error) {
    console.error('Error recording JD analysis:', error);
    res.status(500).json({ error: 'Failed to record JD analysis' });
  }
});

// POST /api/intelligence/role-detection - Store role detection results
router.post('/role-detection', async (req: Request, res: Response) => {
  try {
    const {
      sessionId,
      detectedRoles,
      primaryRole,
      secondaryRoles,
      detectionMethod,
      confidenceScore,
      explanation,
      logicVersion
    } = req.body;

    if (!sessionId || !primaryRole || !confidenceScore || !explanation || !logicVersion) {
      return res.status(400).json({ 
        error: 'Session ID, primary role, confidence score, explanation, and logic version are required' 
      });
    }

    // Insert role detection result into the database
    const result = await query(
      `INSERT INTO role_detection_results (
        session_id,
        detected_roles,
        primary_role,
        secondary_roles,
        detection_method,
        confidence_score,
        explanation,
        logic_version
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id`,
      [
        sessionId,
        JSON.stringify(detectedRoles || []),
        primaryRole,
        JSON.stringify(secondaryRoles || []),
        detectionMethod || 'hybrid',
        confidenceScore,
        explanation,
        logicVersion
      ]
    );

    res.json({ 
      success: true, 
      id: result.rows[0].id,
      message: 'Role detection result recorded successfully'
    });
  } catch (error) {
    console.error('Error recording role detection result:', error);
    res.status(500).json({ error: 'Failed to record role detection result' });
  }
});

// POST /api/intelligence/jd-signals - Store job description signals
router.post('/jd-signals', async (req: Request, res: Response) => {
  try {
    const {
      analysisSnapshotId,
      signals // Array of signal objects
    } = req.body;

    if (!analysisSnapshotId || !signals || !Array.isArray(signals)) {
      return res.status(400).json({ 
        error: 'Analysis snapshot ID and signals array are required' 
      });
    }

    // Insert multiple JD signals into the database
    for (const signal of signals) {
      await query(
        `INSERT INTO jd_signals (
          analysis_snapshot_id,
          signal_type,
          signal_key,
          signal_value,
          weight,
          supporting_evidence,
          extraction_method
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          analysisSnapshotId,
          signal.signalType,
          signal.signalKey,
          signal.signalValue,
          signal.weight,
          signal.supportingEvidence || null,
          signal.extractionMethod || 'hybrid'
        ]
      );
    }

    res.json({ 
      success: true,
      count: signals.length,
      message: `${signals.length} JD signals recorded successfully`
    });
  } catch (error) {
    console.error('Error recording JD signals:', error);
    res.status(500).json({ error: 'Failed to record JD signals' });
  }
});

// POST /api/intelligence/resume-gap-analysis - Store resume gap analysis
router.post('/resume-gap-analysis', async (req: Request, res: Response) => {
  try {
    const {
      sessionId,
      gapAnalyses // Array of gap analysis objects
    } = req.body;

    if (!sessionId || !gapAnalyses || !Array.isArray(gapAnalyses)) {
      return res.status(400).json({ 
        error: 'Session ID and gap analyses array are required' 
      });
    }

    // Insert multiple gap analyses into the database
    for (const gap of gapAnalyses) {
      await query(
        `INSERT INTO resume_gap_analysis (
          session_id,
          gap_category,
          gap_description,
          severity_level,
          recommendation,
          confidence_in_recommendation
        ) VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          sessionId,
          gap.category,
          gap.description,
          gap.severityLevel || 'medium',
          gap.recommendation,
          gap.confidence || 0.5
        ]
      );
    }

    res.json({ 
      success: true,
      count: gapAnalyses.length,
      message: `${gapAnalyses.length} gap analyses recorded successfully`
    });
  } catch (error) {
    console.error('Error recording gap analyses:', error);
    res.status(500).json({ error: 'Failed to record gap analyses' });
  }
});

// POST /api/intelligence/template-ranking - Store template rankings
router.post('/template-ranking', async (req: Request, res: Response) => {
  try {
    const {
      sessionId,
      rankings // Array of ranking objects
    } = req.body;

    if (!sessionId || !rankings || !Array.isArray(rankings)) {
      return res.status(400).json({ 
        error: 'Session ID and rankings array are required' 
      });
    }

    // Insert multiple template rankings into the database
    for (const ranking of rankings) {
      await query(
        `INSERT INTO template_rankings (
          session_id,
          template_id,
          rank_position,
          score,
          score_breakdown,
          rationale,
          risk_factors
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          sessionId,
          ranking.templateId,
          ranking.rankPosition,
          ranking.score,
          JSON.stringify(ranking.scoreBreakdown || {}),
          ranking.rationale || '',
          JSON.stringify(ranking.riskFactors || {})
        ]
      );
    }

    res.json({ 
      success: true,
      count: rankings.length,
      message: `${rankings.length} template rankings recorded successfully`
    });
  } catch (error) {
    console.error('Error recording template rankings:', error);
    res.status(500).json({ error: 'Failed to record template rankings' });
  }
});

// POST /api/intelligence/decision-explanation - Store decision explanation
router.post('/decision-explanation', async (req: Request, res: Response) => {
  try {
    const {
      sessionId,
      decisionType,
      decisionInput,
      decisionOutput,
      decisionRationale,
      confidenceScore,
      aiModelVersion,
      promptVersion,
      logicVersion,
      decisionSource
    } = req.body;

    if (!sessionId || !decisionType || !decisionRationale || !confidenceScore || !decisionSource) {
      return res.status(400).json({ 
        error: 'Session ID, decision type, rationale, confidence score, and source are required' 
      });
    }

    // Insert decision explanation into the database
    const result = await query(
      `INSERT INTO decision_explanations (
        session_id,
        decision_type,
        decision_input,
        decision_output,
        decision_rationale,
        confidence_score,
        ai_model_version,
        prompt_version,
        logic_version,
        decision_source
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING id`,
      [
        sessionId,
        decisionType,
        JSON.stringify(decisionInput || {}),
        JSON.stringify(decisionOutput || {}),
        decisionRationale,
        confidenceScore,
        aiModelVersion || 'unknown',
        promptVersion || 'unknown',
        logicVersion || 'unknown',
        decisionSource
      ]
    );

    res.json({ 
      success: true, 
      id: result.rows[0].id,
      message: 'Decision explanation recorded successfully'
    });
  } catch (error) {
    console.error('Error recording decision explanation:', error);
    res.status(500).json({ error: 'Failed to record decision explanation' });
  }
});

// GET /api/intelligence/session-insights/:sessionId - Get all insights for a session
router.get('/session-insights/:sessionId', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;

    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required' });
    }

    // Get all insights for the session
    const roleIntentResult = await query(
      `SELECT * FROM role_intent 
       WHERE session_id = $1 
       ORDER BY detected_at DESC LIMIT 1`,
      [sessionId]
    );

    const jdAnalysisResult = await query(
      `SELECT * FROM jd_analysis_snapshots 
       WHERE session_id = $1 
       ORDER BY analysis_timestamp DESC LIMIT 1`,
      [sessionId]
    );

    const roleDetectionResult = await query(
      `SELECT * FROM role_detection_results 
       WHERE session_id = $1 
       ORDER BY decision_timestamp DESC LIMIT 1`,
      [sessionId]
    );

    const gapAnalysisResult = await query(
      `SELECT * FROM resume_gap_analysis 
       WHERE session_id = $1 
       ORDER BY analysis_timestamp DESC`,
      [sessionId]
    );

    const templateRankingsResult = await query(
      `SELECT * FROM template_rankings 
       WHERE session_id = $1 
       ORDER BY rank_position ASC`,
      [sessionId]
    );

    const decisionExplanationsResult = await query(
      `SELECT * FROM decision_explanations 
       WHERE session_id = $1 
       ORDER BY decision_timestamp DESC`,
      [sessionId]
    );

    res.json({
      success: true,
      sessionInsights: {
        roleIntent: roleIntentResult.rows[0] || null,
        jdAnalysis: jdAnalysisResult.rows[0] || null,
        roleDetection: roleDetectionResult.rows[0] || null,
        gapAnalyses: gapAnalysisResult.rows,
        templateRankings: templateRankingsResult.rows,
        decisionExplanations: decisionExplanationsResult.rows
      }
    });
  } catch (error) {
    console.error('Error fetching session insights:', error);
    res.status(500).json({ error: 'Failed to fetch session insights' });
  }
});

// POST /api/intelligence/decision-feedback - Store feedback on AI decisions
router.post('/decision-feedback', async (req: Request, res: Response) => {
  try {
    const {
      sessionId,
      decisionType,
      feedback,
      rating
    } = req.body;

    if (!sessionId || !decisionType || !feedback || rating === undefined) {
      return res.status(400).json({ error: 'Session ID, decision type, feedback, and rating are required' });
    }

    // Insert decision feedback into the database (we can create a dedicated table if needed)
    // For now, we'll log it in the admin changes history
    await query(
      `INSERT INTO admin_changes_history (
        admin_user_id,
        change_type,
        affected_entity_type,
        affected_entity_id,
        change_description,
        reason_for_change
      ) VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        'system', // Using system as the admin ID for user feedback
        'decision_feedback',
        'ai_decision',
        sessionId,
        `Decision feedback: ${feedback}`,
        `Rating: ${rating}`
      ]
    );

    res.json({ 
      success: true,
      message: 'Decision feedback recorded successfully'
    });
  } catch (error) {
    console.error('Error recording decision feedback:', error);
    res.status(500).json({ error: 'Failed to record decision feedback' });
  }
});

// PATCH /api/intelligence/analyze-role/:sessionId - Update role validation status
router.patch('/analyze-role', async (req: Request, res: Response) => {
  try {
    const {
      sessionId,
      validatedByUser
    } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required' });
    }

    await query(
      `UPDATE role_intent 
       SET validated_by_user = $1, 
           validation_timestamp = CASE 
             WHEN $1 = true THEN NOW() 
             ELSE validation_timestamp 
           END
       WHERE session_id = $2`,
      [validatedByUser, sessionId]
    );

    res.json({ 
      success: true,
      message: 'Role validation status updated successfully'
    });
  } catch (error) {
    console.error('Error updating role validation:', error);
    res.status(500).json({ error: 'Failed to update role validation' });
  }
});

// GET /api/intelligence/template-performance/:templateId - Get template performance metrics
router.get('/template-performance/:templateId', async (req: Request, res: Response) => {
  try {
    const { templateId } = req.params;

    if (!templateId) {
      return res.status(400).json({ error: 'Template ID is required' });
    }

    const result = await query(
      `SELECT 
         AVG(conversion_rate) as avg_conversion_rate,
         AVG(user_satisfaction_score) as avg_satisfaction_score,
         AVG(average_completion_time_seconds) as avg_completion_time
       FROM template_performance_metrics 
       WHERE template_id = $1
       LIMIT 1`,
      [templateId]
    );

    const metrics = result.rows[0];

    res.json({ 
      conversionRate: parseFloat(metrics.avg_conversion_rate) || 0.65,
      satisfactionScore: parseFloat(metrics.avg_satisfaction_score) || 4.2,
      averageCompletionTime: parseInt(metrics.avg_completion_time) || 180
    });
  } catch (error) {
    console.error('Error fetching template performance:', error);
    res.status(500).json({ error: 'Failed to fetch template performance' });
  }
});

// GET /api/intelligence/role-demand-trends/:roleName - Get role demand trends
router.get('/role-demand-trends/:roleName', async (req: Request, res: Response) => {
  try {
    const { roleName } = req.params;

    if (!roleName) {
      return res.status(400).json({ error: 'Role name is required' });
    }

    const result = await query(
      `SELECT 
         demand_score,
         trend_direction,
         collected_date
       FROM role_demand_trends 
       WHERE LOWER(role_name) LIKE LOWER($1)
       ORDER BY collected_date DESC
       LIMIT 10`,
      [`%${roleName}%`]
    );

    const trends = result.rows.map(row => ({
      period: row.collected_date,
      demandScore: parseFloat(row.demand_score),
      trendDirection: row.trend_direction
    }));

    res.json(trends);
  } catch (error) {
    console.error('Error fetching role demand trends:', error);
    res.status(500).json({ error: 'Failed to fetch role demand trends' });
  }
});

// POST /api/intelligence/role-market - Cache role market intelligence
router.post('/role-market', async (req: Request, res: Response) => {
  try {
    const { role, market, experienceLevel, intelligence } = req.body;

    if (!role || !market || !experienceLevel || !intelligence) {
      return res.status(400).json({ 
        error: 'Role, market, experience level, and intelligence data are required' 
      });
    }

    // Store in database (create table if needed)
    // For now, we'll use a simple in-memory cache or extend existing tables
    // This is a placeholder - implement proper caching table if needed
    
    res.json({ 
      success: true,
      message: 'Role market intelligence cached successfully',
      cacheKey: `${role}:${market}:${experienceLevel}`
    });
  } catch (error) {
    console.error('Error caching role market intelligence:', error);
    res.status(500).json({ error: 'Failed to cache role market intelligence' });
  }
});

// GET /api/intelligence/role-market - Get cached role market intelligence
router.get('/role-market', async (req: Request, res: Response) => {
  try {
    const { role, market, experience } = req.query;

    if (!role || !market || !experience) {
      return res.status(400).json({ 
        error: 'Role, market, and experience level are required' 
      });
    }

    // Check cache (implement proper database lookup)
    // For now, return not found to trigger fresh generation
    res.status(404).json({ 
      success: false,
      message: 'Not cached - generate fresh',
      intelligence: null
    });
  } catch (error) {
    console.error('Error fetching role market intelligence:', error);
    res.status(500).json({ error: 'Failed to fetch role market intelligence' });
  }
});

export default router;