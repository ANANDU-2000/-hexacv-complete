-- Migration: 005_feedback_system.sql
-- Description: Create feedback table for user reviews and visitor analytics

-- Feedback table for storing user reviews
CREATE TABLE IF NOT EXISTS feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    message TEXT,
    user_name VARCHAR(100),
    user_email VARCHAR(255),
    template_id VARCHAR(50),
    is_approved BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_feedback_is_approved ON feedback(is_approved);
CREATE INDEX IF NOT EXISTS idx_feedback_rating ON feedback(rating);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feedback_template_id ON feedback(template_id);

-- Visitor analytics table for tracking daily visitors
CREATE TABLE IF NOT EXISTS visitor_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id VARCHAR(100) NOT NULL,
    ip_hash VARCHAR(64), -- Hashed IP for privacy
    user_agent TEXT,
    visit_date DATE DEFAULT CURRENT_DATE,
    pages_viewed INTEGER DEFAULT 1,
    referrer VARCHAR(500),
    country VARCHAR(100),
    city VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for visitor analytics
CREATE INDEX IF NOT EXISTS idx_visitor_session ON visitor_analytics(session_id);
CREATE INDEX IF NOT EXISTS idx_visitor_date ON visitor_analytics(visit_date);
CREATE INDEX IF NOT EXISTS idx_visitor_created_at ON visitor_analytics(created_at DESC);

-- Role demand tracking table (for admin analytics)
CREATE TABLE IF NOT EXISTS role_demand (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role VARCHAR(200) NOT NULL UNIQUE,
    search_count INTEGER DEFAULT 1,
    template_selections INTEGER DEFAULT 0,
    conversion_count INTEGER DEFAULT 0,
    avg_conversion_rate DECIMAL(5, 2) DEFAULT 0.00,
    last_searched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for role demand
CREATE INDEX IF NOT EXISTS idx_role_demand_search ON role_demand(search_count DESC);
CREATE INDEX IF NOT EXISTS idx_role_demand_role ON role_demand(role);

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_feedback_updated_at ON feedback;
CREATE TRIGGER update_feedback_updated_at
    BEFORE UPDATE ON feedback
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_role_demand_updated_at ON role_demand;
CREATE TRIGGER update_role_demand_updated_at
    BEFORE UPDATE ON role_demand
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample feedback for testing (will be replaced with real data)
-- These are marked as approved so they show up immediately
INSERT INTO feedback (rating, message, user_name, template_id, is_approved, is_featured) VALUES
    (5, 'Amazing tool! Got interviews within a week', 'Priya S.', 'template1free', TRUE, TRUE),
    (5, 'Best ATS resume builder I have used', 'Rahul K.', 'classic', TRUE, TRUE),
    (4, 'Very helpful for tech roles', 'Sarah M.', 'modern', TRUE, FALSE),
    (5, 'Landed my dream job!', 'Amit P.', 'minimal', TRUE, TRUE)
ON CONFLICT DO NOTHING;
