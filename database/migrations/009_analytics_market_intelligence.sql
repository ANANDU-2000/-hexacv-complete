-- Analytics & Market Intelligence Tables
-- Migration: 009_analytics_market_intelligence
-- Created: 2026-01-10

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

-- Create indexes
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