-- Governance & Audit Tables
-- Migration: 010_governance_audit
-- Created: 2026-01-10

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