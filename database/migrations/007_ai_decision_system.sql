-- AI Decision System Tables
-- Migration: 007_ai_decision_system
-- Created: 2026-01-10

-- Role detection results table
CREATE TABLE IF NOT EXISTS role_detection_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES resume_sessions(id),
    detected_roles JSONB NOT NULL, -- Array of roles with confidence scores
    primary_role VARCHAR(255) NOT NULL,
    secondary_roles JSONB, -- Ranked alternatives
    detection_method VARCHAR(50) NOT NULL, -- rule_based, ml_model, hybrid
    confidence_score DECIMAL(3,2) NOT NULL,
    explanation TEXT NOT NULL, -- Why this role was detected
    logic_version VARCHAR(50) NOT NULL,
    decision_timestamp TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB -- Additional decision metadata
);

-- Job description signals table
CREATE TABLE IF NOT EXISTS jd_signals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_snapshot_id UUID NOT NULL REFERENCES jd_analysis_snapshots(id),
    signal_type VARCHAR(50) NOT NULL, -- skill_requirement, experience_required, soft_skill, etc.
    signal_key VARCHAR(100) NOT NULL, -- "python_experience", "leadership", etc.
    signal_value TEXT NOT NULL,
    weight DECIMAL(3,2) NOT NULL, -- 0.00 to 1.00 importance score
    supporting_evidence TEXT, -- What in JD led to this signal
    extraction_method VARCHAR(50) NOT NULL, -- regex, nlp, manual
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Resume gap analysis table
CREATE TABLE IF NOT EXISTS resume_gap_analysis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES resume_sessions(id),
    gap_category VARCHAR(50) NOT NULL, -- skill_gap, experience_gap, missing_section
    gap_description TEXT NOT NULL,
    severity_level VARCHAR(20) NOT NULL, -- low, medium, high, critical
    recommendation TEXT NOT NULL,
    confidence_in_recommendation DECIMAL(3,2) NOT NULL,
    analysis_timestamp TIMESTAMPTZ DEFAULT NOW(),
    resolved_status VARCHAR(20) DEFAULT 'open', -- open, addressed, dismissed
    resolved_timestamp TIMESTAMPTZ,
    metadata JSONB -- Additional gap analysis metadata
);

-- Template scoring & ranking table
CREATE TABLE IF NOT EXISTS template_rankings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES resume_sessions(id),
    template_id UUID NOT NULL REFERENCES templates(id),
    rank_position INTEGER NOT NULL, -- 1 = highest ranked
    score DECIMAL(5,2) NOT NULL, -- Overall score 0.00 to 100.00
    score_breakdown JSONB NOT NULL, -- Detailed scoring per category
    rationale TEXT NOT NULL, -- Why this template ranks higher
    risk_factors JSONB, -- ATS compatibility risks, etc.
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Decision explanations table
CREATE TABLE IF NOT EXISTS decision_explanations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES resume_sessions(id),
    decision_type VARCHAR(50) NOT NULL, -- template_selection, role_detection, etc.
    decision_input JSONB NOT NULL, -- What data went into decision
    decision_output JSONB NOT NULL, -- What was decided
    decision_rationale TEXT NOT NULL, -- Why this decision was made
    confidence_score DECIMAL(3,2) NOT NULL,
    ai_model_version VARCHAR(50) NOT NULL,
    prompt_version VARCHAR(50) NOT NULL,
    logic_version VARCHAR(50) NOT NULL,
    decision_timestamp TIMESTAMPTZ DEFAULT NOW(),
    decision_source VARCHAR(50) NOT NULL, -- ai_model, business_rule, admin_override
    metadata JSONB -- Additional explanation metadata
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_role_detection_session_id ON role_detection_results(session_id);
CREATE INDEX IF NOT EXISTS idx_role_detection_primary_role ON role_detection_results(primary_role);
CREATE INDEX IF NOT EXISTS idx_role_detection_confidence_score ON role_detection_results(confidence_score);
CREATE INDEX IF NOT EXISTS idx_jd_signals_analysis_id ON jd_signals(analysis_snapshot_id);
CREATE INDEX IF NOT EXISTS idx_jd_signals_type ON jd_signals(signal_type);
CREATE INDEX IF NOT EXISTS idx_jd_signals_key ON jd_signals(signal_key);
CREATE INDEX IF NOT EXISTS idx_resume_gap_session_id ON resume_gap_analysis(session_id);
CREATE INDEX IF NOT EXISTS idx_resume_gap_category ON resume_gap_analysis(gap_category);
CREATE INDEX IF NOT EXISTS idx_resume_gap_severity ON resume_gap_analysis(severity_level);
CREATE INDEX IF NOT EXISTS idx_template_rankings_session_id ON template_rankings(session_id);
CREATE INDEX IF NOT EXISTS idx_template_rankings_template_id ON template_rankings(template_id);
CREATE INDEX IF NOT EXISTS idx_template_rankings_rank_position ON template_rankings(rank_position);
CREATE INDEX IF NOT EXISTS idx_template_rankings_score ON template_rankings(score);
CREATE INDEX IF NOT EXISTS idx_decision_explanations_session_id ON decision_explanations(session_id);
CREATE INDEX IF NOT EXISTS idx_decision_explanations_type ON decision_explanations(decision_type);
CREATE INDEX IF NOT EXISTS idx_decision_explanations_timestamp ON decision_explanations(decision_timestamp);