const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkProfileData() {
  try {
    // Get the first few profiles to see the data
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, email, full_name, current_term, country, updated_at')
      .order('updated_at', { ascending: false })
      .limit(5);
    
    if (error) {
      console.error('Error fetching profiles:', error);
      return;
    }
    
    console.log('Recent profiles:');
    console.log('================');
    profiles.forEach(profile => {
      console.log(`\nID: ${profile.id}`);
      console.log(`Email: ${profile.email}`);
      console.log(`Name: ${profile.full_name}`);
      console.log(`Current Term: ${profile.current_term || '(not set)'}`);
      console.log(`Country: ${profile.country || '(not set)'}`);
      console.log(`Updated: ${profile.updated_at}`);
    });
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

checkProfileData();