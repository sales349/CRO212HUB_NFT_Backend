// src/routes/projects.js
// API routes for NFT project management

const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');

// Configure multer for trait image uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const projectId = req.params.id;
    const layerType = req.body.layerType || 'Unknown';
    const uploadPath = path.join(process.cwd(), 'uploads', 'traits', projectId, layerType);

    // Create directory if it doesn't exist
    await fs.mkdir(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Keep original filename
    cb(null, file.originalname);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max file size
  },
  fileFilter: (req, file, cb) => {
    // Only accept PNG images
    if (file.mimetype === 'image/png') {
      cb(null, true);
    } else {
      cb(new Error('Only PNG images are allowed'));
    }
  }
});

// ============================================================================
// Project CRUD Operations
// ============================================================================

/**
 * POST /api/projects
 * Create a new NFT project
 */
router.post('/', async (req, res) => {
  try {
    const {
      name,
      symbol,
      description,
      max_supply,
      mint_price,
      wallet_address,
      treasury_address,
      revenue_split,
      // Legacy field names (for backward compatibility)
      treasury_wallet,
      platform_fee_bps
    } = req.body;

    console.log(`Creating new project: ${name} (${symbol})`);
    console.log(`Wallet: ${wallet_address || 'not provided'}`);

    // Validate required fields
    if (!name || !symbol || !max_supply || !mint_price) {
      console.log('Validation failed: missing required fields');
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: name, symbol, max_supply, mint_price'
      });
    }

    // Map frontend field names to backend/database field names
    const projectData = {
      name,
      symbol,
      description: description || '',
      max_supply: parseInt(max_supply),
      mint_price: mint_price.toString(),
      wallet_address: wallet_address || null,
      treasury_wallet: treasury_address || treasury_wallet || null,
      platform_fee_bps: revenue_split ? Math.round(revenue_split * 100) : (platform_fee_bps || 500),
      status: 'setup'
    };

    console.log('Inserting project data:', projectData);

    // Insert project into database
    const { data, error } = await supabase
      .from('cro_212hub_projects')
      .insert(projectData)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to create project',
        details: error.message
      });
    }

    console.log(`Project created successfully with ID: ${data.id}`);
    res.status(201).json({
      success: true,
      data: data
    });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/projects
 * List all projects
 */
router.get('/', async (req, res) => {
  try {
    console.log('Fetching all projects from database...');
    const { data, error } = await supabase
      .from('cro_212hub_projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: 'Failed to fetch projects' });
    }

    console.log(`Successfully fetched ${data?.length || 0} projects`);
    res.json({
      success: true,
      data: data
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/projects/:id
 * Get a specific project by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('cro_212hub_projects')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Project not found' });
      }
      console.error('Database error:', error);
      return res.status(500).json({ error: 'Failed to fetch project' });
    }

    // Get trait count and token count
    const { count: traitCount } = await supabase
      .from('cro_212hub_traits')
      .select('*', { count: 'exact', head: true })
      .eq('project_id', id);

    const { count: tokenCount } = await supabase
      .from('cro_212hub_generated_tokens')
      .select('*', { count: 'exact', head: true })
      .eq('project_id', id);

    res.json({
      success: true,
      data: {
        ...data,
        trait_count: traitCount || 0,
        token_count: tokenCount || 0
      }
    });
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /api/projects/:id
 * Update a project
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Remove fields that shouldn't be updated
    delete updates.id;
    delete updates.created_at;

    const { data, error } = await supabase
      .from('cro_212hub_projects')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: 'Failed to update project' });
    }

    res.json({
      success: true,
      data: data
    });
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/projects/:id
 * Delete a project and all associated data
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Delete project (cascades to traits and tokens)
    const { error } = await supabase
      .from('cro_212hub_projects')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: 'Failed to delete project' });
    }

    // TODO: Delete uploaded trait files and generated outputs

    res.json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/projects/:id/public
 * Get public project info (for mint page)
 */
router.get('/:id/public', async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('cro_212hub_projects')
      .select('id, name, symbol, description, max_supply, mint_price, contract_address, status')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Project not found' });
      }
      return res.status(500).json({ error: 'Failed to fetch project' });
    }

    res.json({
      success: true,
      data: data
    });
  } catch (error) {
    console.error('Error fetching public project:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// Trait Management
// ============================================================================

/**
 * POST /api/projects/:id/traits
 * Upload trait images for a project
 */
router.post('/:id/traits', upload.array('traits', 50), async (req, res) => {
  try {
    const { id: projectId } = req.params;
    const { layerType } = req.body;
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    if (!layerType) {
      return res.status(400).json({ error: 'layerType is required' });
    }

    // Verify project exists
    const { data: project, error: projectError } = await supabase
      .from('cro_212hub_projects')
      .select('id')
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Save trait metadata to database
    const traits = files.map(file => ({
      project_id: projectId,
      layer_type: layerType,
      trait_name: path.parse(file.originalname).name, // Filename without extension
      file_name: file.originalname,
      file_path: `uploads/traits/${projectId}/${layerType}/${file.originalname}`
    }));

    const { data, error } = await supabase
      .from('cro_212hub_traits')
      .insert(traits)
      .select();

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: 'Failed to save trait metadata' });
    }

    // Update project status
    await supabase
      .from('cro_212hub_projects')
      .update({ status: 'traits_uploaded' })
      .eq('id', projectId);

    res.status(201).json({
      success: true,
      message: `Uploaded ${files.length} traits`,
      traits: data
    });
  } catch (error) {
    console.error('Error uploading traits:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/projects/:id/traits
 * Get all traits for a project
 */
router.get('/:id/traits', async (req, res) => {
  try {
    const { id: projectId } = req.params;

    const { data, error } = await supabase
      .from('cro_212hub_traits')
      .select('*')
      .eq('project_id', projectId)
      .order('layer_type', { ascending: true })
      .order('trait_name', { ascending: true });

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: 'Failed to fetch traits' });
    }

    // Organize by layer type
    const traitsByLayer = {};
    data.forEach(trait => {
      if (!traitsByLayer[trait.layer_type]) {
        traitsByLayer[trait.layer_type] = [];
      }
      traitsByLayer[trait.layer_type].push(trait);
    });

    res.json({
      success: true,
      data: data,
      traitsByLayer
    });
  } catch (error) {
    console.error('Error fetching traits:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
