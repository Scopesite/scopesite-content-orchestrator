import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const SUPABASE_URL = 'https://ifmlinqbztysxhmidkfa.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlmbWxpbnFienR5c3hobWlka2ZhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDU2MDMwNCwiZXhwIjoyMDc2MTM2MzA0fQ.Gn6exE8qbZ3OvMKe635eupMiFonLNd1M3t1Xr9QCy-Q';

async function runMigration() {
  console.log('📦 Reading migration file...');
  const sql = readFileSync('./supabase/migrations/002_enhanced_features.sql', 'utf-8');
  
  console.log('🔌 Connecting to Supabase via REST API...\n');
  
  // Use fetch to execute raw SQL via Supabase's PostgREST
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Prefer': 'return=representation'
    },
    body: JSON.stringify({ query: sql })
  });
  
  if (response.ok) {
    console.log('✅ Migration completed successfully!\n');
    console.log('📊 New tables created:');
    console.log('   - hashtag_sets & hashtag_usage');
    console.log('   - post_drafts');
    console.log('   - media_library');
    console.log('   - posting_windows');
    console.log('   - post_templates');
    console.log('   - account_mappings');
    console.log('   - calendar_events');
    console.log('   - post_analytics');
  } else {
    const error = await response.text();
    console.error('❌ Migration failed:', response.status, error);
    console.log('\n⚠️  Manual migration required.');
    console.log('\nPlease run the migration manually:');
    console.log('1. Go to: https://supabase.com/dashboard/project/ifmlinqbztysxhmidkfa/sql');
    console.log('2. Copy the contents of: supabase/migrations/002_enhanced_features.sql');
    console.log('3. Paste and click Run');
  }
}

runMigration().catch(err => {
  console.error('❌ Error:', err.message);
  console.log('\n⚠️  Manual migration required.');
  console.log('\nPlease run the migration manually:');
  console.log('1. Go to: https://supabase.com/dashboard/project/ifmlinqbztysxhmidkfa/sql');
  console.log('2. Copy the contents of: supabase/migrations/002_enhanced_features.sql');
  console.log('3. Paste and click Run');
});
