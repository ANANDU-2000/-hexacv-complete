import { pool } from './index.js';

const createTablesSQL = `
-- Templates table
CREATE TABLE IF NOT EXISTS templates (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    price INTEGER NOT NULL CHECK (price >= 0),
    is_active BOOLEAN DEFAULT true,
    badge VARCHAR(20),
    best_for VARCHAR(100),
    supports_photo BOOLEAN DEFAULT false,
    ats_safe BOOLEAN DEFAULT true,
    layout VARCHAR(20) NOT NULL,
    role_families TEXT[] NOT NULL,
    preview_image_url VARCHAR(255),
    html_file_path VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id BIGSERIAL PRIMARY KEY,
    razorpay_order_id VARCHAR(100) UNIQUE NOT NULL,
    session_id VARCHAR(100) NOT NULL,
    template_id VARCHAR(50) NOT NULL REFERENCES templates(id),
    amount INTEGER NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'verified', 'failed')),
    razorpay_payment_id VARCHAR(100),
    razorpay_signature VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    verified_at TIMESTAMPTZ
);

-- Analytics events table
CREATE TABLE IF NOT EXISTS analytics_events (
    id BIGSERIAL PRIMARY KEY,
    event_type VARCHAR(50) NOT NULL,
    user_id VARCHAR(100),
    session_id VARCHAR(100) NOT NULL,
    template_id VARCHAR(50),
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session_id ON analytics_events(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON analytics_events(user_id);

-- Role demand table
CREATE TABLE IF NOT EXISTS role_demand (
    role VARCHAR(100) PRIMARY KEY,
    search_count INTEGER DEFAULT 0,
    template_selections JSONB DEFAULT '{}',
    avg_conversion_rate DECIMAL(5, 2) DEFAULT 0.0,
    last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- Categorization insights table
CREATE TABLE IF NOT EXISTS categorization_insights (
    id BIGSERIAL PRIMARY KEY,
    session_id VARCHAR(100) NOT NULL,
    detected_role_category VARCHAR(50),
    detected_specific_role VARCHAR(100),
    experience_level VARCHAR(20),
    industry_type VARCHAR(50),
    jd_keywords TEXT[],
    recommended_templates TEXT[],
    selected_template VARCHAR(50),
    ats_score_range INT[],
    session_status VARCHAR(20) CHECK (session_status IN ('drop', 'export', 'complete')),
    step_reached VARCHAR(20) CHECK (step_reached IN ('editor', 'template', 'finalize')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin users table (future use)
CREATE TABLE IF NOT EXISTS admin_users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'editor',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- System configuration table
CREATE TABLE IF NOT EXISTS system_config (
    id SERIAL PRIMARY KEY,
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT,
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- A/B tests table
CREATE TABLE IF NOT EXISTS ab_tests (
    id SERIAL PRIMARY KEY,
    test_name VARCHAR(100) NOT NULL,
    variant_a TEXT NOT NULL,
    variant_b TEXT NOT NULL,
    winner VARCHAR(20), -- 'variant_a', 'variant_b', or NULL if ongoing
    confidence_level DECIMAL(5, 2), -- percentage confidence in winner
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- Model versions table
CREATE TABLE IF NOT EXISTS model_versions (
    id SERIAL PRIMARY KEY,
    model_name VARCHAR(100) NOT NULL,
    version VARCHAR(50) NOT NULL,
    deployment_date TIMESTAMPTZ DEFAULT NOW(),
    performance_metrics JSONB,
    is_active BOOLEAN DEFAULT true,
    notes TEXT
);

-- Users table with enterprise features
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id VARCHAR(255) UNIQUE NOT NULL, -- Anonymous sessions
    email VARCHAR(255) UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_active TIMESTAMPTZ DEFAULT NOW(),
    is_enterprise BOOLEAN DEFAULT FALSE,
    enterprise_tenant_id UUID REFERENCES users(id), -- Self-referencing for enterprise hierarchy
    privacy_level SMALLINT DEFAULT 1, -- 1=public, 2=private, 3=confidential
    metadata JSONB -- Additional user properties
);

-- Resume sessions table
CREATE TABLE IF NOT EXISTS resume_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    session_token VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    status VARCHAR(50) DEFAULT 'active', -- active, completed, abandoned
    resume_data JSONB, -- Encrypted sensitive data
    metadata JSONB -- Additional session properties
);

-- Role intent table
CREATE TABLE IF NOT EXISTS role_intent (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES resume_sessions(id),
    detected_role VARCHAR(255) NOT NULL,
    confidence_score DECIMAL(3,2) NOT NULL, -- 0.00 to 1.00
    experience_level VARCHAR(50) NOT NULL, -- entry, mid, senior, lead, executive
    industry VARCHAR(100),
    sub_industry VARCHAR(100),
    detected_at TIMESTAMPTZ DEFAULT NOW(),
    validated_by_user BOOLEAN DEFAULT FALSE,
    validation_timestamp TIMESTAMPTZ
);

-- Job description analysis snapshots table
CREATE TABLE IF NOT EXISTS jd_analysis_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES resume_sessions(id),
    raw_jd_text TEXT NOT NULL,
    processed_jd_json JSONB NOT NULL, -- Extracted skills, requirements, etc.
    analysis_timestamp TIMESTAMPTZ DEFAULT NOW(),
    ai_model_version VARCHAR(50) NOT NULL,
    prompt_version VARCHAR(50) NOT NULL,
    analysis_duration_ms INTEGER,
    metadata JSONB -- Additional analysis metadata
);

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

-- Template master table
CREATE TABLE IF NOT EXISTS template_master (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    internal_name VARCHAR(255) UNIQUE NOT NULL, -- For system use
    external_name VARCHAR(255) NOT NULL, -- For user display
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL, -- technical, creative, executive, etc.
    industry VARCHAR(100),
    experience_level VARCHAR(50), -- entry, mid, senior, lead, executive
    ats_compatibility_score DECIMAL(3,2), -- 0.00 to 1.00
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    is_visible_to_users BOOLEAN DEFAULT FALSE, -- Internal vs external templates
    version_number INTEGER DEFAULT 1,
    creator_user_id UUID REFERENCES admin_users(id),
    config JSONB, -- Complete template configuration
    metadata JSONB -- Additional template metadata
);

-- Template variants table
CREATE TABLE IF NOT EXISTS template_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID NOT NULL REFERENCES template_master(id),
    variant_name VARCHAR(255) NOT NULL,
    variant_config JSONB NOT NULL, -- Layout, colors, fonts, etc.
    role_mappings JSONB, -- Which roles this variant serves
    experience_mappings JSONB, -- Which experience levels
    ats_risk_factors JSONB, -- Specific ATS compatibility concerns
    performance_metrics JSONB, -- Conversion rates, user satisfaction
    created_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

-- Template role mappings table
CREATE TABLE IF NOT EXISTS template_role_mappings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID NOT NULL REFERENCES template_master(id),
    role_name VARCHAR(255) NOT NULL,
    experience_level VARCHAR(50) NOT NULL, -- entry, mid, senior, lead, executive
    effectiveness_score DECIMAL(3,2) NOT NULL, -- How well this maps (0.00 to 1.00)
    priority_weight DECIMAL(3,2) DEFAULT 1.00, -- Relative priority in selection
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ATS risk ratings table
CREATE TABLE IF NOT EXISTS ats_risk_ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID NOT NULL REFERENCES template_master(id),
    risk_category VARCHAR(50) NOT NULL, -- layout, font, color, section, etc.
    risk_description TEXT NOT NULL,
    risk_severity VARCHAR(20) NOT NULL, -- low, medium, high, critical
    risk_probability DECIMAL(3,2) NOT NULL, -- 0.00 to 1.00
    mitigation_strategy TEXT NOT NULL,
    last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- Template version history table
CREATE TABLE IF NOT EXISTS template_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID NOT NULL REFERENCES template_master(id),
    version_number INTEGER NOT NULL,
    version_description TEXT NOT NULL,
    config_snapshot JSONB NOT NULL, -- Complete template configuration
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by_user_id UUID REFERENCES admin_users(id),
    change_reason VARCHAR(255) NOT NULL,
    is_current BOOLEAN DEFAULT FALSE
);

-- Role demand trends table
CREATE TABLE IF NOT EXISTS role_demand_trends (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_name VARCHAR(255) NOT NULL,
    industry VARCHAR(100),
    region VARCHAR(100),
    demand_score DECIMAL(5,2) NOT NULL, -- 0.00 to 100.00
    trend_direction VARCHAR(10) NOT NULL, -- increasing, decreasing, stable
    sample_size INTEGER NOT NULL,
    collected_date DATE NOT NULL,
    data_source VARCHAR(100) NOT NULL, -- linkedin_api, indeed_api, etc.
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Template performance metrics table
CREATE TABLE IF NOT EXISTS template_performance_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID NOT NULL REFERENCES template_master(id),
    metric_period_start DATE NOT NULL,
    metric_period_end DATE NOT NULL,
    sessions_using_template INTEGER NOT NULL,
    downloads_count INTEGER NOT NULL,
    conversion_rate DECIMAL(5,2) NOT NULL, -- 0.00 to 100.00
    user_satisfaction_score DECIMAL(3,2), -- 1.00 to 5.00
    average_completion_time_seconds INTEGER,
    drop_off_points JSONB, -- Where users abandon using this template
    calculated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User drop-off analysis table
CREATE TABLE IF NOT EXISTS user_drop_off_analysis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES resume_sessions(id),
    step_number INTEGER NOT NULL, -- 1, 2, 3 corresponding to steps
    step_name VARCHAR(100) NOT NULL, -- upload_resume, select_template, etc.
    exit_reason VARCHAR(100), -- timeout, error, user_cancelled, etc.
    user_action_before_exit TEXT, -- Last action taken
    abandonment_timestamp TIMESTAMPTZ NOT NULL,
    session_duration_seconds INTEGER,
    metadata JSONB -- Additional drop-off analysis metadata
);

-- Conversion metrics table
CREATE TABLE IF NOT EXISTS conversion_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES resume_sessions(id),
    template_id UUID REFERENCES template_master(id),
    role_intent_id UUID REFERENCES role_intent(id),
    started_at TIMESTAMPTZ NOT NULL,
    completed_at TIMESTAMPTZ,
    conversion_status VARCHAR(50) NOT NULL, -- started, in_progress, completed, abandoned
    time_to_completion_seconds INTEGER,
    user_satisfaction_rating INTEGER, -- 1-5 scale
    metadata JSONB -- Additional conversion metrics metadata
);

-- Prompt versions table
CREATE TABLE IF NOT EXISTS prompt_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prompt_name VARCHAR(255) NOT NULL,
    prompt_content TEXT NOT NULL,
    version_number INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by_user_id UUID REFERENCES admin_users(id),
    is_active BOOLEAN DEFAULT TRUE,
    deprecation_reason TEXT,
    deprecated_at TIMESTAMPTZ,
    metadata JSONB -- Additional prompt metadata
);

-- Scoring logic versions table
CREATE TABLE IF NOT EXISTS scoring_logic_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    logic_name VARCHAR(255) NOT NULL, -- template_scoring, role_detection, etc.
    version_number INTEGER NOT NULL,
    algorithm_definition JSONB NOT NULL, -- Complete algorithm spec
    parameters JSONB NOT NULL, -- Configurable parameters
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by_user_id UUID REFERENCES admin_users(id),
    is_active BOOLEAN DEFAULT TRUE,
    deprecation_reason TEXT,
    deprecated_at TIMESTAMPTZ
);

-- Decision audit logs table
CREATE TABLE IF NOT EXISTS decision_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES resume_sessions(id),
    decision_id UUID NOT NULL, -- References specific decision table
    decision_table_name VARCHAR(100) NOT NULL, -- Name of table containing decision
    decision_type VARCHAR(50) NOT NULL,
    decision_before JSONB, -- State before decision
    decision_after JSONB, -- State after decision
    decision_reason TEXT NOT NULL,
    decision_maker VARCHAR(50) NOT NULL, -- ai_model, admin_user, business_rule
    decision_timestamp TIMESTAMPTZ DEFAULT NOW(),
    user_ip_address INET,
    user_agent TEXT,
    metadata JSONB -- Additional audit metadata
);

-- Admin changes history table
CREATE TABLE IF NOT EXISTS admin_changes_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_user_id UUID NOT NULL REFERENCES admin_users(id),
    change_type VARCHAR(100) NOT NULL, -- template_update, logic_change, etc.
    affected_entity_type VARCHAR(100) NOT NULL, -- template, prompt, logic, etc.
    affected_entity_id UUID NOT NULL,
    change_description TEXT NOT NULL,
    old_values JSONB,
    new_values JSONB,
    change_timestamp TIMESTAMPTZ DEFAULT NOW(),
    reason_for_change TEXT,
    approval_required BOOLEAN DEFAULT FALSE,
    approval_status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected
    approved_by_user_id UUID REFERENCES admin_users(id),
    approved_at TIMESTAMPTZ,
    metadata JSONB -- Additional change metadata
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_orders_session ON orders(session_id, template_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_events_type_time ON analytics_events(event_type, timestamp);
CREATE INDEX IF NOT EXISTS idx_events_template ON analytics_events(template_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_events_session ON analytics_events(session_id);
CREATE INDEX IF NOT EXISTS idx_role_demand_count ON role_demand(search_count DESC);
CREATE INDEX IF NOT EXISTS idx_categorization_session ON categorization_insights(session_id);
CREATE INDEX IF NOT EXISTS idx_categorization_role_category ON categorization_insights(detected_role_category, created_at);
CREATE INDEX IF NOT EXISTS idx_categorization_experience_level ON categorization_insights(experience_level, created_at);
CREATE INDEX IF NOT EXISTS idx_categorization_industry_type ON categorization_insights(industry_type, created_at);
CREATE INDEX IF NOT EXISTS idx_categorization_created_at ON categorization_insights(created_at);
CREATE INDEX IF NOT EXISTS idx_system_config_key ON system_config(key);
CREATE INDEX IF NOT EXISTS idx_ab_tests_status ON ab_tests(status, created_at);
CREATE INDEX IF NOT EXISTS idx_model_versions_active ON model_versions(is_active, model_name);
CREATE INDEX IF NOT EXISTS idx_users_session_id ON users(session_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);
CREATE INDEX IF NOT EXISTS idx_resume_sessions_user_id ON resume_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_resume_sessions_token ON resume_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_resume_sessions_expires_at ON resume_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_resume_sessions_status ON resume_sessions(status);
CREATE INDEX IF NOT EXISTS idx_role_intent_session_id ON role_intent(session_id);
CREATE INDEX IF NOT EXISTS idx_role_intent_detected_role ON role_intent(detected_role);
CREATE INDEX IF NOT EXISTS idx_role_intent_confidence_score ON role_intent(confidence_score);
CREATE INDEX IF NOT EXISTS idx_jd_analysis_session_id ON jd_analysis_snapshots(session_id);
CREATE INDEX IF NOT EXISTS idx_jd_analysis_timestamp ON jd_analysis_snapshots(analysis_timestamp);
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
CREATE INDEX IF NOT EXISTS idx_template_master_internal_name ON template_master(internal_name);
CREATE INDEX IF NOT EXISTS idx_template_master_external_name ON template_master(external_name);
CREATE INDEX IF NOT EXISTS idx_template_master_category ON template_master(category);
CREATE INDEX IF NOT EXISTS idx_template_master_is_active ON template_master(is_active);
CREATE INDEX IF NOT EXISTS idx_template_master_is_visible ON template_master(is_visible_to_users);
CREATE INDEX IF NOT EXISTS idx_template_variants_template_id ON template_variants(template_id);
CREATE INDEX IF NOT EXISTS idx_template_variants_name ON template_variants(variant_name);
CREATE INDEX IF NOT EXISTS idx_template_variants_is_active ON template_variants(is_active);
CREATE INDEX IF NOT EXISTS idx_template_role_mappings_template_id ON template_role_mappings(template_id);
CREATE INDEX IF NOT EXISTS idx_template_role_mappings_role_name ON template_role_mappings(role_name);
CREATE INDEX IF NOT EXISTS idx_template_role_mappings_exp_level ON template_role_mappings(experience_level);
CREATE INDEX IF NOT EXISTS idx_template_role_mappings_effectiveness ON template_role_mappings(effectiveness_score);
CREATE INDEX IF NOT EXISTS idx_ats_risk_ratings_template_id ON ats_risk_ratings(template_id);
CREATE INDEX IF NOT EXISTS idx_ats_risk_ratings_category ON ats_risk_ratings(risk_category);
CREATE INDEX IF NOT EXISTS idx_ats_risk_ratings_severity ON ats_risk_ratings(risk_severity);
CREATE INDEX IF NOT EXISTS idx_template_versions_template_id ON template_versions(template_id);
CREATE INDEX IF NOT EXISTS idx_template_versions_number ON template_versions(version_number);
CREATE INDEX IF NOT EXISTS idx_template_versions_is_current ON template_versions(is_current);
CREATE INDEX IF NOT EXISTS idx_role_demand_trends_role_name ON role_demand_trends(role_name);
CREATE INDEX IF NOT EXISTS idx_role_demand_trends_collected_date ON role_demand_trends(collected_date);
CREATE INDEX IF NOT EXISTS idx_role_demand_trends_industry ON role_demand_trends(industry);
CREATE INDEX IF NOT EXISTS idx_template_performance_template_id ON template_performance_metrics(template_id);
CREATE INDEX IF NOT EXISTS idx_template_performance_period_start ON template_performance_metrics(metric_period_start);
CREATE INDEX IF NOT EXISTS idx_user_drop_off_session_id ON user_drop_off_analysis(session_id);
CREATE INDEX IF NOT EXISTS idx_user_drop_off_step_number ON user_drop_off_analysis(step_number);
CREATE INDEX IF NOT EXISTS idx_user_drop_off_abandonment_timestamp ON user_drop_off_analysis(abandonment_timestamp);
CREATE INDEX IF NOT EXISTS idx_conversion_metrics_session_id ON conversion_metrics(session_id);
CREATE INDEX IF NOT EXISTS idx_conversion_metrics_status ON conversion_metrics(conversion_status);
CREATE INDEX IF NOT EXISTS idx_conversion_metrics_started_at ON conversion_metrics(started_at);
CREATE INDEX IF NOT EXISTS idx_prompt_versions_name ON prompt_versions(prompt_name);
CREATE INDEX IF NOT EXISTS idx_prompt_versions_version ON prompt_versions(version_number);
CREATE INDEX IF NOT EXISTS idx_prompt_versions_is_active ON prompt_versions(is_active);
CREATE INDEX IF NOT EXISTS idx_scoring_logic_versions_name ON scoring_logic_versions(logic_name);
CREATE INDEX IF NOT EXISTS idx_scoring_logic_versions_version ON scoring_logic_versions(version_number);
CREATE INDEX IF NOT EXISTS idx_scoring_logic_versions_is_active ON scoring_logic_versions(is_active);
CREATE INDEX IF NOT EXISTS idx_decision_audit_logs_session_id ON decision_audit_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_decision_audit_logs_type ON decision_audit_logs(decision_type);
CREATE INDEX IF NOT EXISTS idx_decision_audit_logs_timestamp ON decision_audit_logs(decision_timestamp);
CREATE INDEX IF NOT EXISTS idx_admin_changes_history_admin_id ON admin_changes_history(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_changes_history_type ON admin_changes_history(change_type);
CREATE INDEX IF NOT EXISTS idx_admin_changes_history_timestamp ON admin_changes_history(change_timestamp);
CREATE INDEX IF NOT EXISTS idx_admin_changes_history_approval_status ON admin_changes_history(approval_status);
`;

async function migrate() {
  try {
    console.log('Starting database migration...');
    await pool.query(createTablesSQL);
    console.log('✓ Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrate();
