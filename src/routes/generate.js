// src/routes/generate.js
// API routes for NFT generation

const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { generateCollection, validateProjectTraits } = require('../services/generator');
const { generateCollectionMetadata } = require('../services/metadata');

/**
 * POST /api/generate/:projectId
 * Generate NFT images and metadata for a project
 */
router.post('/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { count } = req.body;

    // Fetch project details
    const { data: project, error: projectError } = await supabase
      .from('cro_212hub_projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Determine how many tokens to generate
    const tokenCount = count ? parseInt(count) : project.max_supply;

    if (tokenCount > project.max_supply) {
      return res.status(400).json({
        error: `Cannot generate more than max_supply (${project.max_supply})`
      });
    }

    // Validate that project has traits
    const validation = await validateProjectTraits(projectId);
    if (!validation.isValid) {
      return res.status(400).json({
        error: 'Missing required trait layers',
        missingLayers: validation.missingLayers,
        availableLayers: validation.availableLayers
      });
    }

    // Send initial response (generation will continue in background)
    res.json({
      success: true,
      message: `Starting generation of ${tokenCount} NFTs`,
      projectId,
      projectName: project.name,
      tokenCount
    });

    // Start generation process
    console.log(`\n🎨 Starting NFT generation for project: ${project.name}`);
    console.log(`📊 Generating ${tokenCount} tokens\n`);

    // Step 1: Generate images
    const imageResults = await generateCollection(projectId, tokenCount, {
      onProgress: (progress) => {
        console.log(`Progress: ${progress.current}/${progress.total} (${progress.percentage}%)`);
      }
    });

    if (imageResults.successCount === 0) {
      console.error('❌ No images were generated successfully');
      await supabase
        .from('cro_212hub_projects')
        .update({ status: 'error' })
        .eq('id', projectId);
      return;
    }

    // Step 2: Generate metadata
    const metadataResults = await generateCollectionMetadata(
      projectId,
      project.name,
      imageResults.successful.map(result => ({
        tokenId: result.tokenId,
        imagePath: result.imagePath,
        attributes: result.attributes
      })),
      {
        description: project.description,
        onProgress: (progress) => {
          console.log(`Metadata progress: ${progress.current}/${progress.total} (${progress.percentage}%)`);
        }
      }
    );

    // Update project status
    await supabase
      .from('cro_212hub_projects')
      .update({ status: 'generated' })
      .eq('id', projectId);

    console.log(`\n✅ Generation complete for project: ${project.name}`);
    console.log(`   Images: ${imageResults.successCount}/${tokenCount}`);
    console.log(`   Metadata: ${metadataResults.successCount}/${tokenCount}\n`);

  } catch (error) {
    console.error('Error generating NFTs:', error);

    // Update project status to error
    try {
      await supabase
        .from('cro_212hub_projects')
        .update({ status: 'error' })
        .eq('id', req.params.projectId);
    } catch (updateError) {
      console.error('Failed to update project status:', updateError);
    }
  }
});

/**
 * GET /api/generate/:projectId/status
 * Get generation status for a project
 */
router.get('/:projectId/status', async (req, res) => {
  try {
    const { projectId } = req.params;

    // Get project
    const { data: project, error: projectError } = await supabase
      .from('cro_212hub_projects')
      .select('id, name, max_supply, status')
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Get token count
    const { count: tokenCount } = await supabase
      .from('cro_212hub_generated_tokens')
      .select('*', { count: 'exact', head: true })
      .eq('project_id', projectId);

    res.json({
      success: true,
      project: {
        id: project.id,
        name: project.name,
        max_supply: project.max_supply,
        status: project.status,
        generated_count: tokenCount || 0,
        progress_percentage: Math.round(((tokenCount || 0) / project.max_supply) * 100)
      }
    });
  } catch (error) {
    console.error('Error fetching generation status:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/generate/:projectId/tokens
 * Get all generated tokens for a project
 */
router.get('/:projectId/tokens', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { limit, offset } = req.query;

    let query = supabase
      .from('cro_212hub_generated_tokens')
      .select('*')
      .eq('project_id', projectId)
      .order('token_id', { ascending: true });

    if (limit) {
      query = query.limit(parseInt(limit));
    }

    if (offset) {
      query = query.range(parseInt(offset), parseInt(offset) + parseInt(limit || 50) - 1);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: 'Failed to fetch tokens' });
    }

    res.json({
      success: true,
      tokens: data,
      count: data.length
    });
  } catch (error) {
    console.error('Error fetching tokens:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/generate/:projectId/tokens/:tokenId
 * Get a specific generated token
 */
router.get('/:projectId/tokens/:tokenId', async (req, res) => {
  try {
    const { projectId, tokenId } = req.params;

    const { data, error } = await supabase
      .from('cro_212hub_generated_tokens')
      .select('*')
      .eq('project_id', projectId)
      .eq('token_id', parseInt(tokenId))
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Token not found' });
      }
      return res.status(500).json({ error: 'Failed to fetch token' });
    }

    res.json({
      success: true,
      token: data
    });
  } catch (error) {
    console.error('Error fetching token:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/generate/:projectId/validate
 * Validate project is ready for generation
 */
router.post('/:projectId/validate', async (req, res) => {
  try {
    const { projectId } = req.params;

    // Check project exists
    const { data: project, error: projectError } = await supabase
      .from('cro_212hub_projects')
      .select('id, name, max_supply')
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Validate traits
    const validation = await validateProjectTraits(projectId);

    res.json({
      success: true,
      valid: validation.isValid,
      project: {
        id: project.id,
        name: project.name,
        max_supply: project.max_supply
      },
      validation: {
        isValid: validation.isValid,
        availableLayers: validation.availableLayers,
        missingLayers: validation.missingLayers,
        traitCounts: validation.traitCounts
      }
    });
  } catch (error) {
    console.error('Error validating project:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
