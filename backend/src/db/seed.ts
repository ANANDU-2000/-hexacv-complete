import { pool } from './index.js';

const seedData = `
-- Insert templates
INSERT INTO templates (id, name, description, price, is_active, badge, best_for, supports_photo, ats_safe, layout, role_families, html_file_path)
VALUES 
    ('classic', 'Classic ATS', 'Clean layout preferred by most recruiters', 0, true, 'FREE', 'All Roles', false, true, 'single-column', 
     ARRAY['Tech', 'Software', 'AI', 'Data', 'Accounting', 'Operations'], '/templates/template1free.html'),
    
    ('minimal', 'Minimal Tech', 'Clean spacing for tech roles', 0, true, 'FREE', 'Software Engineers', false, true, 'single-column',
     ARRAY['Tech', 'Software', 'AI', 'Data', 'Freshers'], '/templates/template1free.html'),
    
    ('professional', 'Professional Corporate', 'Better spacing and hierarchy for experienced roles', 49, true, 'POPULAR', 'Business Professionals', true, false, 'single-column',
     ARRAY['Accounting', 'Operations', 'Business', 'HR'], '/templates/professional.html'),
    
    ('modern', 'Photo Resume', 'Recommended for Gulf, sales, and client-facing roles', 79, true, NULL, 'Sales & Client-Facing', true, false, 'two-column',
     ARRAY['Sales', 'Marketing', 'Client-Facing', 'Gulf'], '/templates/modern.html')
ON CONFLICT (id) DO UPDATE SET
    price = EXCLUDED.price,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();
`;

async function seed() {
  try {
    console.log('Starting database seeding...');
    await pool.query(seedData);
    console.log('✓ Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seed();
