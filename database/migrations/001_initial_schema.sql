-- Initial Database Schema for HexaResume
-- Migration: 001_initial_schema
-- Created: 2026-01-09

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
    session_id VARCHAR(100) NOT NULL,
    template_id VARCHAR(50),
    target_role VARCHAR(100),
    metadata JSONB,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Role demand table
CREATE TABLE IF NOT EXISTS role_demand (
    role VARCHAR(100) PRIMARY KEY,
    search_count INTEGER DEFAULT 0,
    template_selections JSONB DEFAULT '{}',
    avg_conversion_rate DECIMAL(5, 2) DEFAULT 0.0,
    last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_orders_session ON orders(session_id, template_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_events_type_time ON analytics_events(event_type, timestamp);
CREATE INDEX IF NOT EXISTS idx_events_template ON analytics_events(template_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_events_session ON analytics_events(session_id);
CREATE INDEX IF NOT EXISTS idx_role_demand_count ON role_demand(search_count DESC);
