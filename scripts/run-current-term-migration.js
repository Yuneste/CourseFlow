const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  try {
    console.log('Running migration to add current_term column...');
    
    // Add current_term column to profiles table
    const { error } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE profiles 
        ADD COLUMN IF NOT EXISTS current_term text;
        
        COMMENT ON COLUMN profiles.current_term IS 'User selected current academic term, overrides system calculated term';
      `
    });

    if (error) {
      console.error('Migration failed:', error);
      
      // If RPC doesn't exist, try direct query
      console.log('Trying alternative approach...');
      const { error: altError } = await supabase
        .from('profiles')
        .select('current_term')
        .limit(1);
      
      if (altError && altError.message.includes('column "current_term" does not exist')) {
        console.error('Column does not exist. Please run the migration manually in Supabase dashboard.');
        console.log('\nSQL to run:');
        console.log(`
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS current_term text;

COMMENT ON COLUMN profiles.current_term IS 'User selected current academic term, overrides system calculated term';
        `);
      } else if (!altError) {
        console.log('Column already exists!');
      }
    } else {
      console.log('Migration completed successfully!');
    }
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

runMigration();