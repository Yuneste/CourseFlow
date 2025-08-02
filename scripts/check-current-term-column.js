const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkColumn() {
  try {
    console.log('Checking if current_term column exists...');
    
    // Try to select the column
    const { data, error } = await supabase
      .from('profiles')
      .select('id, current_term')
      .limit(1);
    
    if (error) {
      if (error.message.includes('column "current_term" does not exist')) {
        console.log('\n❌ Column "current_term" does NOT exist in profiles table');
        console.log('\nPlease run this SQL in your Supabase dashboard:');
        console.log('----------------------------------------');
        console.log(`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS current_term text;`);
        console.log('----------------------------------------');
      } else {
        console.error('Error checking column:', error);
      }
    } else {
      console.log('\n✅ Column "current_term" exists in profiles table');
      console.log('Sample data:', data);
    }
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

checkColumn();