-- User & Session Intelligence Tables
-- Migration: 006_user_intelligence
-- Created: 2026-01-10

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

-- Create indexes
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