// test_supabase.js
// Test script to verify Supabase connection and insert test data

require('dotenv').config();
const supabase = require('./src/config/supabase');

async function testSupabase() {
  console.log('\n🧪 Testing Supabase Connection\n');
  console.log('Supabase URL:', process.env.SUPABASE_URL);
  console.log('Supabase Key:', process.env.SUPABASE_KEY ? '✓ Present' : '✗ Missing');
  console.log('-------------------------------------------\n');

  try {
    // Test 1: Check if tables exist
    console.log('📋 Test 1: Checking if tables exist...');
    const { data: tables, error: tablesError } = await supabase
      .from('cro_212hub_projects')
      .select('count')
      .limit(1);

    if (tablesError) {
      console.error('❌ Tables not found or not accessible');
      console.error('Error:', tablesError.message);
      console.log('\n⚠️  Please run the SQL schema in Supabase SQL Editor:');
      console.log('   1. Go to your Supabase project dashboard');
      console.log('   2. Click "SQL Editor" in the sidebar');
      console.log('   3. Copy contents of supabase_schema.sql');
      console.log('   4. Paste and run the script\n');
      return;
    }

    console.log('✅ Tables exist and are accessible\n');

    // Test 2: Count existing records
    console.log('📊 Test 2: Checking existing data...');
    const { data: projectCount } = await supabase
      .from('cro_212hub_projects')
      .select('*', { count: 'exact', head: true });

    const { data: traitCount } = await supabase
      .from('cro_212hub_traits')
      .select('*', { count: 'exact', head: true });

    const { data: tokenCount } = await supabase
      .from('cro_212hub_generated_tokens')
      .select('*', { count: 'exact', head: true });

    console.log(`   Projects: ${projectCount?.count || 0}`);
    console.log(`   Traits: ${traitCount?.count || 0}`);
    console.log(`   Tokens: ${tokenCount?.count || 0}\n`);

    // Test 3: Insert a test project
    console.log('➕ Test 3: Inserting test project...');
    const { data: newProject, error: insertError } = await supabase
      .from('cro_212hub_projects')
      .insert({
        name: 'Test Collection',
        symbol: 'TEST',
        description: 'A test NFT collection for development',
        max_supply: 100,
        mint_price: '1.0',
        status: 'setup'
      })
      .select()
      .single();

    if (insertError) {
      console.error('❌ Failed to insert project');
      console.error('Error:', insertError.message);
      return;
    }

    console.log('✅ Test project created successfully!');
    console.log('   Project ID:', newProject.id);
    console.log('   Name:', newProject.name);
    console.log('   Symbol:', newProject.symbol);
    console.log('   Max Supply:', newProject.max_supply);
    console.log('   Status:', newProject.status);
    console.log('   Created:', new Date(newProject.created_at).toLocaleString());
    console.log('\n');

    // Test 4: Fetch the project back
    console.log('🔍 Test 4: Fetching project from database...');
    const { data: fetchedProject, error: fetchError } = await supabase
      .from('cro_212hub_projects')
      .select('*')
      .eq('id', newProject.id)
      .single();

    if (fetchError) {
      console.error('❌ Failed to fetch project');
      console.error('Error:', fetchError.message);
      return;
    }

    console.log('✅ Project fetched successfully!');
    console.log('   Fetched:', fetchedProject.name);
    console.log('\n');

    // Test 5: Insert sample traits
    console.log('🎨 Test 5: Inserting sample traits...');
    const sampleTraits = [
      { layer_type: 'Background', trait_name: 'Jungle Ruins', file_name: 'jungle-ruins.png', file_path: `uploads/traits/${newProject.id}/Background/jungle-ruins.png` },
      { layer_type: 'Background', trait_name: 'Cosmic Void', file_name: 'cosmic-void.png', file_path: `uploads/traits/${newProject.id}/Background/cosmic-void.png` },
      { layer_type: 'Body', trait_name: 'Lioness Base', file_name: 'lioness-base.png', file_path: `uploads/traits/${newProject.id}/Body/lioness-base.png` },
      { layer_type: 'Eyes', trait_name: 'Green Eyes', file_name: 'green-eyes.png', file_path: `uploads/traits/${newProject.id}/Eyes/green-eyes.png` }
    ];

    const traitsWithProjectId = sampleTraits.map(trait => ({
      ...trait,
      project_id: newProject.id
    }));

    const { data: insertedTraits, error: traitsError } = await supabase
      .from('cro_212hub_traits')
      .insert(traitsWithProjectId)
      .select();

    if (traitsError) {
      console.error('❌ Failed to insert traits');
      console.error('Error:', traitsError.message);
      return;
    }

    console.log(`✅ ${insertedTraits.length} traits inserted successfully!`);
    insertedTraits.forEach(trait => {
      console.log(`   - ${trait.layer_type}: ${trait.trait_name}`);
    });
    console.log('\n');

    // Test 6: Insert sample generated token
    console.log('🖼️  Test 6: Inserting sample generated token...');
    const { data: newToken, error: tokenError } = await supabase
      .from('cro_212hub_generated_tokens')
      .insert({
        project_id: newProject.id,
        token_id: 1,
        image_path: `output/${newProject.id}/images/1.png`,
        metadata_path: `output/${newProject.id}/metadata/1.json`,
        attributes: [
          { trait_type: 'Background', value: 'Jungle Ruins' },
          { trait_type: 'Body', value: 'Lioness Base' },
          { trait_type: 'Eyes', value: 'Green Eyes' }
        ],
        rarity_score: 245.67,
        rarity_rank: 5
      })
      .select()
      .single();

    if (tokenError) {
      console.error('❌ Failed to insert token');
      console.error('Error:', tokenError.message);
      return;
    }

    console.log('✅ Sample token created successfully!');
    console.log('   Token ID:', newToken.token_id);
    console.log('   Rarity Score:', newToken.rarity_score);
    console.log('   Rarity Rank:', newToken.rarity_rank);
    console.log('   Attributes:', newToken.attributes.length);
    console.log('\n');

    // Final summary
    console.log('🎉 All tests passed successfully!');
    console.log('-------------------------------------------');
    console.log('✅ Supabase connection working');
    console.log('✅ All tables accessible');
    console.log('✅ Can insert and fetch data');
    console.log('✅ Relationships working correctly');
    console.log('\n📊 Database Summary:');
    const { count: finalProjectCount } = await supabase
      .from('cro_212hub_projects')
      .select('*', { count: 'exact', head: true });
    const { count: finalTraitCount } = await supabase
      .from('cro_212hub_traits')
      .select('*', { count: 'exact', head: true });
    const { count: finalTokenCount } = await supabase
      .from('cro_212hub_generated_tokens')
      .select('*', { count: 'exact', head: true });

    console.log(`   Total Projects: ${finalProjectCount}`);
    console.log(`   Total Traits: ${finalTraitCount}`);
    console.log(`   Total Tokens: ${finalTokenCount}`);
    console.log('\n');

  } catch (error) {
    console.error('\n❌ Unexpected error:', error.message);
    console.error(error);
  }
}

// Run the tests
testSupabase()
  .then(() => {
    console.log('✅ Test script completed\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Test script failed:', error);
    process.exit(1);
  });
