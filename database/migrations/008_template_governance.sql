-- Template Governance Tables
-- Migration: 008_template_governance
-- Created: 2026-01-10

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

-- Create indexes
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