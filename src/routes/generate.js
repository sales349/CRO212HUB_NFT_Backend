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

    // Fetch project details including layer_order, rarity_config, and base_uri
    const { data: project, error: projectError } = await supabase
      .from('cro_212hub_projects')
      .select('id, name, description, max_supply, status, layer_order, rarity_config, base_uri')
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
    // Use layer_order if available, otherwise validate that at least one layer exists
    const validation = await validateProjectTraits(projectId, project.layer_order);
    if (!validation.isValid) {
      return res.status(400).json({
        error: 'Missing required trait layers',
        missingLayers: validation.missingLayers,
        availableLayers: validation.availableLayers
      });
    }

    // Update project status to 'generating'
    await supabase
      .from('cro_212hub_projects')
      .update({ status: 'generating' })
      .eq('id', projectId);

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

    // Get layer order and rarity config from project
    const layerOrder = project.layer_order || undefined;
    const rarityConfig = project.rarity_config || null;

    // Step 1: Generate images
    const imageResults = await generateCollection(projectId, tokenCount, {
      layerOrder,
      rarityConfig,
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
        baseUri: project.base_uri || null,
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
      data: {
        project: {
          id: project.id,
          name: project.name,
          max_supply: project.max_supply,
          status: project.status,
          generated_count: tokenCount || 0,
          progress_percentage: Math.round(((tokenCount || 0) / project.max_supply) * 100)
        }
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
      data: {
        tokens: data,
        total: data.length
      }
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
 * GET /api/generate/:projectId/rarity-template
 * Download a sample CSV template with all traits and default weights
 */
router.get('/:projectId/rarity-template', async (req, res) => {
  try {
    const { projectId } = req.params;

    // Get project
    const { data: project, error: projectError } = await supabase
      .from('cro_212hub_projects')
      .select('id, name, layer_order')
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Get all traits
    const { data: traits, error: traitsError } = await supabase
      .from('cro_212hub_traits')
      .select('layer_type, trait_name')
      .eq('project_id', projectId)
      .order('layer_type', { ascending: true })
      .order('trait_name', { ascending: true });

    if (traitsError) {
      return res.status(500).json({ error: 'Failed to fetch traits' });
    }

    if (!traits || traits.length === 0) {
      return res.status(400).json({ error: 'No traits found for this project' });
    }

    // Generate CSV content
    let csvContent = 'Layer,Trait Name,Weight (%)\n';

    // Group traits by layer
    const traitsByLayer = {};
    traits.forEach(trait => {
      if (!traitsByLayer[trait.layer_type]) {
        traitsByLayer[trait.layer_type] = [];
      }
      traitsByLayer[trait.layer_type].push(trait.trait_name);
    });

    // Calculate default weight (equal distribution per layer)
    Object.keys(traitsByLayer).forEach(layerType => {
      const traitsInLayer = traitsByLayer[layerType];
      const defaultWeight = Math.round(100 / traitsInLayer.length);

      traitsInLayer.forEach((traitName, index) => {
        // Adjust last trait to ensure weights sum to 100%
        const weight = index === traitsInLayer.length - 1
          ? 100 - (defaultWeight * (traitsInLayer.length - 1))
          : defaultWeight;

        csvContent += `${layerType},${traitName},${weight}\n`;
      });
    });

    // Set headers for file download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${project.name.replace(/[^a-z0-9]/gi, '_')}_rarity_template.csv"`);
    res.send(csvContent);

  } catch (error) {
    console.error('Error generating rarity template:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/generate/:projectId/rarity-config
 * Save rarity configuration for weighted generation
 */
router.post('/:projectId/rarity-config', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { rarityConfig } = req.body;

    if (!rarityConfig || typeof rarityConfig !== 'object') {
      return res.status(400).json({ error: 'Invalid rarity configuration' });
    }

    // Validate configuration structure
    for (const [layerName, traits] of Object.entries(rarityConfig)) {
      if (typeof traits !== 'object') {
        return res.status(400).json({
          error: `Invalid traits configuration for layer: ${layerName}`
        });
      }

      // Check that weights are positive numbers
      for (const [traitName, weight] of Object.entries(traits)) {
        if (typeof weight !== 'number' || weight < 0) {
          return res.status(400).json({
            error: `Invalid weight for trait "${traitName}" in layer "${layerName}". Must be a positive number.`
          });
        }
      }
    }

    // Update project with rarity config
    const { data, error } = await supabase
      .from('cro_212hub_projects')
      .update({ rarity_config: rarityConfig })
      .eq('id', projectId)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: 'Failed to save rarity configuration' });
    }

    res.json({
      success: true,
      message: 'Rarity configuration saved successfully',
      data: {
        rarity_config: data.rarity_config
      }
    });

  } catch (error) {
    console.error('Error saving rarity config:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/generate/:projectId/rarity-config
 * Get current rarity configuration for a project
 */
router.get('/:projectId/rarity-config', async (req, res) => {
  try {
    const { projectId } = req.params;

    const { data: project, error } = await supabase
      .from('cro_212hub_projects')
      .select('id, name, rarity_config')
      .eq('id', projectId)
      .single();

    if (error || !project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json({
      success: true,
      data: {
        project_id: project.id,
        project_name: project.name,
        rarity_config: project.rarity_config || null
      }
    });

  } catch (error) {
    console.error('Error fetching rarity config:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/generate/:projectId/download
 * Download all generated images and metadata as ZIP
 */
router.get('/:projectId/download', async (req, res) => {
  try {
    const { projectId } = req.params;
    const archiver = require('archiver');
    const path = require('path');
    const fs = require('fs');

    // Get project
    const { data: project, error: projectError } = await supabase
      .from('cro_212hub_projects')
      .select('name')
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Set headers for ZIP download
    const zipFilename = `${project.name.replace(/[^a-z0-9]/gi, '_')}_collection.zip`;
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${zipFilename}"`);

    // Create ZIP archive
    const archive = archiver('zip', { zlib: { level: 9 } });

    archive.on('error', (err) => {
      console.error('Archive error:', err);
      res.status(500).send({ error: err.message });
    });

    // Pipe archive to response
    archive.pipe(res);

    // Add images folder
    const imagesPath = path.join(process.cwd(), 'output', projectId, 'images');
    if (fs.existsSync(imagesPath)) {
      archive.directory(imagesPath, 'images');
    }

    // Add metadata folder
    const metadataPath = path.join(process.cwd(), 'output', projectId, 'metadata');
    if (fs.existsSync(metadataPath)) {
      archive.directory(metadataPath, 'metadata');
    }

    // Finalize the archive
    await archive.finalize();

  } catch (error) {
    console.error('Error creating download:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message });
    }
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
      .select('id, name, max_supply, layer_order')
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Validate traits (use layer_order if available)
    const validation = await validateProjectTraits(projectId, project.layer_order);

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

/**
 * POST /api/generate/:projectId/update-base-uri
 * Update base URI in all metadata files (useful after uploading to IPFS)
 */
router.post('/:projectId/update-base-uri', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { baseUri } = req.body;

    if (!baseUri) {
      return res.status(400).json({ error: 'Base URI is required' });
    }

    // Validate baseUri format
    if (!baseUri.startsWith('ipfs://') && !baseUri.startsWith('https://') && !baseUri.startsWith('http://')) {
      return res.status(400).json({
        error: 'Base URI must start with ipfs://, https://, or http://'
      });
    }

    // Check project exists
    const { data: project, error: projectError } = await supabase
      .from('cro_212hub_projects')
      .select('id, name')
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Import metadata service
    const { updateMetadataBaseUri } = require('../services/metadata');

    // Update all metadata files
    const updatedCount = await updateMetadataBaseUri(projectId, baseUri);

    // Update project base_uri in database
    await supabase
      .from('cro_212hub_projects')
      .update({ base_uri: baseUri })
      .eq('id', projectId);

    res.json({
      success: true,
      message: `Updated ${updatedCount} metadata files with base URI: ${baseUri}`,
      updatedCount,
      baseUri
    });

  } catch (error) {
    console.error('Error updating base URI:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
