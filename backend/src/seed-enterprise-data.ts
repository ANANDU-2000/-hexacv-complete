import { query } from './db/index.js';

// Seed enterprise data into the new tables
async function seedEnterpriseData() {
  try {
    console.log('🌱 Seeding enterprise data...');
    
    // Seed prompt versions
    await query(`
      INSERT INTO prompt_versions (prompt_name, prompt_content, version_number, created_by_user_id, is_active) 
      VALUES 
        ('role-detection-v1', 'Detect user role from resume data...', 1, 1, true),
        ('jd-analysis-v1', 'Analyze job description for key requirements...', 1, 1, true),
        ('template-ranking-v1', 'Rank templates based on role and experience...', 1, 1, true)
      ON CONFLICT DO NOTHING;
    `);
    
    // Seed scoring logic versions
    await query(`
      INSERT INTO scoring_logic_versions (logic_name, version_number, algorithm_definition, parameters, created_by_user_id, is_active)
      VALUES 
        ('template_scoring', 1, '{"weights": {"role_fit": 0.4, "ats_compatibility": 0.3, "historical_performance": 0.3}}', '{"role_fit_weight": 0.4, "ats_compat_weight": 0.3}', 1, true),
        ('role_detection', 1, '{"algorithm": "hybrid_nlp_rules", "confidence_threshold": 0.7}', '{"confidence_threshold": 0.7}', 1, true)
      ON CONFLICT DO NOTHING;
    `);
    
    // Seed template master records
    await query(`
      INSERT INTO template_master (
        id, internal_name, external_name, description, category, 
        industry, experience_level, ats_compatibility_score, 
        is_active, is_visible_to_users, version_number, 
        config, metadata
      ) VALUES 
        (gen_random_uuid(), 'tech_internal', 'Tech Professional', 'Optimized for technical roles', 'technical', 'Technology', 'mid', 0.95, true, true, 1, '{}', '{}'),
        (gen_random_uuid(), 'executive_internal', 'Executive Standard', 'Professional template for leadership roles', 'executive', 'General', 'senior', 0.90, true, true, 1, '{}', '{}'),
        (gen_random_uuid(), 'creative_internal', 'Creative Showcase', 'Visually appealing template for creative roles', 'creative', 'Design', 'mid', 0.80, true, true, 1, '{}', '{}'),
        (gen_random_uuid(), 'classic_internal', 'Classic ATS', 'Maximum ATS compatibility template', 'professional', 'General', 'entry', 0.98, true, true, 1, '{}', '{}')
      ON CONFLICT DO NOTHING;
    `);
    
    // Get template IDs for foreign key relationships
    const templateResults = await query(`
      SELECT id, internal_name FROM template_master WHERE is_active = true;
    `);
    
    // Seed template variants
    await query(`
      INSERT INTO template_variants (
        template_id, variant_name, variant_config, 
        role_mappings, experience_mappings, ats_risk_factors, 
        performance_metrics, is_active
      ) VALUES 
        ($1, 'dark_mode', '{"theme": "dark", "colors": {"primary": "#ffffff", "secondary": "#cccccc"}}', 
         '["Software Engineer", "Developer"]', '["entry", "mid"]', 
         '{"font_issues": "low", "layout_complexity": "medium"}', 
         '{"conversion_rate": 0.78, "satisfaction_score": 4.2}', true),
        ($2, 'light_mode', '{"theme": "light", "colors": {"primary": "#000000", "secondary": "#333333"}}', 
         '["Manager", "Director"]', '["senior", "lead"]', 
         '{"font_issues": "low", "layout_complexity": "low"}', 
         '{"conversion_rate": 0.72, "satisfaction_score": 4.5}', true)
      ON CONFLICT DO NOTHING;
    `, [templateResults.rows[0]?.id, templateResults.rows[1]?.id]);
    
    // Seed template role mappings
    await query(`
      INSERT INTO template_role_mappings (
        template_id, role_name, experience_level, 
        effectiveness_score, priority_weight
      ) VALUES 
        ($1, 'Software Engineer', 'entry', 0.9, 1.0),
        ($1, 'Software Engineer', 'mid', 0.95, 1.0),
        ($1, 'Frontend Developer', 'mid', 0.85, 0.9),
        ($2, 'Engineering Manager', 'senior', 0.92, 1.0),
        ($2, 'Director', 'lead', 0.88, 1.0),
        ($3, 'UI/UX Designer', 'mid', 0.94, 1.0),
        ($4, 'Any Role', 'entry', 0.98, 0.8)
      ON CONFLICT DO NOTHING;
    `, [
      templateResults.rows[0]?.id,  // tech template
      templateResults.rows[1]?.id,  // executive template
      templateResults.rows[2]?.id,  // creative template
      templateResults.rows[3]?.id   // classic template
    ]);
    
    // Seed ATS risk ratings
    await query(`
      INSERT INTO ats_risk_ratings (
        template_id, risk_category, risk_description, 
        risk_severity, risk_probability, mitigation_strategy
      ) VALUES 
        ($1, 'font', 'Using non-standard fonts may cause parsing issues', 'medium', 0.3, 'Use standard web fonts like Arial, Times New Roman'),
        ($1, 'layout', 'Complex layouts may not translate well to text-only ATS parsers', 'high', 0.7, 'Simplify layout, avoid text boxes and complex positioning'),
        ($4, 'color', 'Color-dependent information may be lost', 'low', 0.1, 'Ensure all important info is readable in black and white')
      ON CONFLICT DO NOTHING;
    `, [templateResults.rows[0]?.id, templateResults.rows[3]?.id]);
    
    // Seed role demand trends
    await query(`
      INSERT INTO role_demand_trends (
        role_name, industry, region, demand_score, 
        trend_direction, sample_size, collected_date, data_source
      ) VALUES 
        ('Software Engineer', 'Technology', 'Global', 92.5, 'increasing', 10000, CURRENT_DATE, 'internal_analytics'),
        ('Product Manager', 'Technology', 'Global', 78.3, 'increasing', 8500, CURRENT_DATE, 'internal_analytics'),
        ('Data Scientist', 'Technology', 'Global', 85.7, 'stable', 7200, CURRENT_DATE, 'internal_analytics'),
        ('UX Designer', 'Design', 'Global', 71.2, 'increasing', 6800, CURRENT_DATE, 'internal_analytics')
      ON CONFLICT DO NOTHING;
    `);
    
    console.log('✅ Enterprise data seeded successfully');
  } catch (error) {
    console.error('❌ Error seeding enterprise data:', error);
    throw error;
  }
}

// Run the seeding function
seedEnterpriseData().catch(error => {
  console.error('Failed to seed enterprise data:', error);
  process.exit(1);
});

export default seedEnterpriseData;