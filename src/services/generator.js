// src/services/generator.js
// NFT Image Generator Service - Combines layered trait images using Sharp

const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');
const supabase = require('../config/supabase');

/**
 * Default layer order for trait composition
 * Traits are layered from bottom to top in this order
 */
const DEFAULT_LAYER_ORDER = [
  'Background',
  'Body',
  'Eyes',
  'Mouth',
  'Clothes',
  'Accessories'
];

/**
 * Get all traits for a project organized by layer type
 * @param {string} projectId - UUID of the project
 * @returns {Object} Traits organized by layer type
 */
async function getProjectTraits(projectId) {
  const { data: traits, error } = await supabase
    .from('cro_212hub_traits')
    .select('*')
    .eq('project_id', projectId)
    .order('layer_type', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch traits: ${error.message}`);
  }

  // Organize traits by layer type
  const traitsByLayer = {};
  traits.forEach(trait => {
    if (!traitsByLayer[trait.layer_type]) {
      traitsByLayer[trait.layer_type] = [];
    }
    traitsByLayer[trait.layer_type].push(trait);
  });

  return traitsByLayer;
}

/**
 * Select one random trait from each layer
 * @param {Object} traitsByLayer - Traits organized by layer type
 * @param {Array} layerOrder - Order of layers to process
 * @returns {Array} Selected traits (one per layer)
 */
function selectRandomTraits(traitsByLayer, layerOrder = DEFAULT_LAYER_ORDER) {
  const selectedTraits = [];

  layerOrder.forEach(layerType => {
    const availableTraits = traitsByLayer[layerType];
    if (availableTraits && availableTraits.length > 0) {
      // Select random trait from this layer
      const randomIndex = Math.floor(Math.random() * availableTraits.length);
      selectedTraits.push(availableTraits[randomIndex]);
    }
  });

  return selectedTraits;
}

/**
 * Combine trait images into a final NFT image using Sharp
 * @param {Array} traits - Array of trait objects with file_path
 * @param {string} outputPath - Path where the final image will be saved
 * @returns {Promise<Object>} Metadata about the generated image
 */
async function combineTraitImages(traits, outputPath) {
  if (!traits || traits.length === 0) {
    throw new Error('No traits provided for image generation');
  }

  // Start with the first layer (usually Background)
  const basePath = path.join(process.cwd(), traits[0].file_path);

  // Check if base image exists
  try {
    await fs.access(basePath);
  } catch (error) {
    throw new Error(`Base trait image not found: ${basePath}`);
  }

  let composite = sharp(basePath);

  // Get base image metadata
  const baseMetadata = await composite.metadata();
  const { width, height } = baseMetadata;

  // Prepare composite layers (all traits except the first one)
  const composites = [];

  for (let i = 1; i < traits.length; i++) {
    const traitPath = path.join(process.cwd(), traits[i].file_path);

    // Check if trait image exists
    try {
      await fs.access(traitPath);
      composites.push({
        input: traitPath,
        top: 0,
        left: 0
      });
    } catch (error) {
      console.warn(`Warning: Trait image not found: ${traitPath}, skipping...`);
    }
  }

  // Apply all layers
  if (composites.length > 0) {
    composite = composite.composite(composites);
  }

  // Ensure output directory exists
  const outputDir = path.dirname(outputPath);
  await fs.mkdir(outputDir, { recursive: true });

  // Save the final image
  await composite
    .png({ quality: 100 }) // Save as PNG with max quality
    .toFile(outputPath);

  return {
    width,
    height,
    format: 'png',
    path: outputPath,
    layerCount: traits.length
  };
}

/**
 * Generate a single NFT with random trait selection
 * @param {string} projectId - UUID of the project
 * @param {number} tokenId - Token ID (1, 2, 3, ...)
 * @param {Object} options - Generation options
 * @returns {Promise<Object>} Generated NFT data
 */
async function generateSingleNFT(projectId, tokenId, options = {}) {
  const { layerOrder = DEFAULT_LAYER_ORDER } = options;

  // Get all available traits
  const traitsByLayer = await getProjectTraits(projectId);

  // Select random traits
  const selectedTraits = selectRandomTraits(traitsByLayer, layerOrder);

  if (selectedTraits.length === 0) {
    throw new Error('No traits available for generation');
  }

  // Define output path
  const outputPath = path.join(
    process.cwd(),
    'output',
    projectId,
    'images',
    `${tokenId}.png`
  );

  // Combine trait images
  const imageMetadata = await combineTraitImages(selectedTraits, outputPath);

  // Prepare attributes for metadata
  const attributes = selectedTraits.map(trait => ({
    trait_type: trait.layer_type,
    value: trait.trait_name
  }));

  return {
    tokenId,
    imagePath: `output/${projectId}/images/${tokenId}.png`,
    attributes,
    imageMetadata,
    selectedTraits: selectedTraits.map(t => ({
      layer: t.layer_type,
      name: t.trait_name,
      filePath: t.file_path
    }))
  };
}

/**
 * Generate multiple NFTs for a project
 * @param {string} projectId - UUID of the project
 * @param {number} count - Number of NFTs to generate
 * @param {Object} options - Generation options
 * @returns {Promise<Array>} Array of generated NFT data
 */
async function generateCollection(projectId, count, options = {}) {
  const {
    layerOrder = DEFAULT_LAYER_ORDER,
    onProgress = null
  } = options;

  const results = [];
  const errors = [];

  console.log(`\n🎨 Starting generation of ${count} NFTs for project ${projectId}`);
  console.log(`📋 Layer order: ${layerOrder.join(' → ')}\n`);

  for (let tokenId = 1; tokenId <= count; tokenId++) {
    try {
      const result = await generateSingleNFT(projectId, tokenId, { layerOrder });
      results.push(result);

      // Progress callback
      if (onProgress) {
        onProgress({
          current: tokenId,
          total: count,
          percentage: Math.round((tokenId / count) * 100)
        });
      }

      console.log(`✓ Generated NFT #${tokenId} (${results.length}/${count})`);
    } catch (error) {
      const errorMsg = `Failed to generate NFT #${tokenId}: ${error.message}`;
      console.error(`✗ ${errorMsg}`);
      errors.push({ tokenId, error: errorMsg });
    }
  }

  console.log(`\n✅ Generation complete: ${results.length}/${count} successful`);
  if (errors.length > 0) {
    console.log(`⚠️  ${errors.length} errors occurred`);
  }

  return {
    successful: results,
    errors,
    total: count,
    successCount: results.length,
    errorCount: errors.length
  };
}

/**
 * Validate that all required trait layers exist for a project
 * @param {string} projectId - UUID of the project
 * @param {Array} requiredLayers - Required layer types
 * @returns {Promise<Object>} Validation result
 */
async function validateProjectTraits(projectId, requiredLayers = DEFAULT_LAYER_ORDER) {
  const traitsByLayer = await getProjectTraits(projectId);
  const availableLayers = Object.keys(traitsByLayer);
  const missingLayers = [];

  requiredLayers.forEach(layer => {
    if (!traitsByLayer[layer] || traitsByLayer[layer].length === 0) {
      missingLayers.push(layer);
    }
  });

  const isValid = missingLayers.length === 0;

  return {
    isValid,
    availableLayers,
    missingLayers,
    traitCounts: Object.fromEntries(
      Object.entries(traitsByLayer).map(([layer, traits]) => [layer, traits.length])
    )
  };
}

module.exports = {
  generateSingleNFT,
  generateCollection,
  getProjectTraits,
  selectRandomTraits,
  combineTraitImages,
  validateProjectTraits,
  DEFAULT_LAYER_ORDER
};
