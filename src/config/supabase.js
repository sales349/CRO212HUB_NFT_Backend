// src/config/supabase.js
// Supabase client configuration for CRO212HUB

const { createClient } = require('@supabase/supabase-js');

// Validate environment variables
if (!process.env.SUPABASE_URL) {
  console.error('❌ Missing SUPABASE_URL in .env file');
  process.exit(1);
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing SUPABASE_SERVICE_ROLE_KEY in .env file');
  console.error('This key is required for admin operations (bypasses RLS)');
  process.exit(1);
}

// Create admin client with service_role key (bypasses RLS)
// Use this for all backend operations (create, update, delete)
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Create public client with anon key (respects RLS)
// Optional - use this if you need RLS-aware queries
const supabasePublic = process.env.SUPABASE_ANON_KEY
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY)
  : null;

// Test connection on startup
(async () => {
  try {
    const { data, error } = await supabaseAdmin
      .from('cro_212hub_projects')
      .select('count')
      .limit(1);

    if (error) {
      console.warn('⚠️  Supabase connection warning:', error.message);
    } else {
      console.log('✅ Supabase connected successfully (admin client)');
    }
  } catch (err) {
    console.warn('⚠️  Could not verify Supabase connection:', err.message);
  }
})();

// Export admin client as default (used for all backend operations)
module.exports = supabaseAdmin;

// Also export both clients for specific use cases
module.exports.supabaseAdmin = supabaseAdmin;
module.exports.supabasePublic = supabasePublic;
