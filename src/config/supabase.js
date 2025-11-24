// src/config/supabase.js
// Supabase client configuration for CRO212HUB

const { createClient } = require('@supabase/supabase-js');

// Validate environment variables
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
  console.error('❌ Missing Supabase configuration!');
  console.error('Please set SUPABASE_URL and SUPABASE_KEY in your .env file');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Test connection on startup
(async () => {
  try {
    const { data, error } = await supabase
      .from('cro_212hub_projects')
      .select('count')
      .limit(1);

    if (error) {
      console.warn('⚠️  Supabase connection warning:', error.message);
    } else {
      console.log('✅ Supabase connected successfully');
    }
  } catch (err) {
    console.warn('⚠️  Could not verify Supabase connection:', err.message);
  }
})();

module.exports = supabase;
