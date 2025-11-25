// src/services/rarity.js
// Rarity Calculation Service - Calculate trait frequencies and rarity scores

const supabase = require('../config/supabase');
const fs = require('fs').promises;
const path = require('path');

/**
 * Calculate trait frequencies across a collection
 * @param {Array} tokens - Array of token objects with attributes
 * @returns {Object} Trait frequency map
 */
function calculateTraitFrequencies(tokens) {
  const frequencies = {};
  const totalTokens = tokens.length;

  // Count each trait occurrence
  tokens.forEach(token => {
    token.attributes.forEach(attr => {
      const key = `${attr.trait_type}:${attr.value}`;
      frequencies[key] = (frequencies[key] || 0) + 1;
    });
  });

  // Calculate percentages
  const frequencyData = {};
  Object.entries(frequencies).forEach(([key, count]) => {
    const [traitType, traitValue] = key.split(':');
    if (!frequencyData[traitType]) {
      frequencyData[traitType] = {};
    }
    frequencyData[traitType][traitValue] = {
      count,
      percentage: (count / totalTokens) * 100
    };
  });

  return {
    raw: frequencies,
    byType: frequencyData,
    totalTokens
  };
}

/**
 * Calculate rarity score for a single token
 * Rarity score = sum of (1 / frequency) for each trait
 * @param {Object} token - Token with attributes
 * @param {Object} frequencies - Trait frequency map
 * @param {number} totalTokens - Total number of tokens in collection
 * @returns {number} Rarity score
 */
function calculateTokenRarityScore(token, frequencies, totalTokens) {
  let score = 0;

  token.attributes.forEach(attr => {
    const key = `${attr.trait_type}:${attr.value}`;
    const traitCount = frequencies[key] || 1;
    const traitFrequency = traitCount / totalTokens;

    // Rarity score: 1 / frequency
    // Rarer traits (lower frequency) have higher scores
    score += 1 / traitFrequency;
  });

  return score;
}

/**
 * Calculate rarity scores and ranks for all tokens in a project
 * @param {string} projectId - UUID of the project
 * @returns {Promise<Object>} Rarity calculation results
 */
async function calculateCollectionRarity(projectId) {
  console.log(`\n📊 Calculating rarity for project: ${projectId}`);

  // Fetch all generated tokens
  const { data: tokens, error } = await supabase
    .from('cro_212hub_generated_tokens')
    .select('*')
    .eq('project_id', projectId)
    .order('token_id', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch tokens: ${error.message}`);
  }

  if (!tokens || tokens.length === 0) {
    throw new Error('No tokens found for this project');
  }

  console.log(`📝 Found ${tokens.length} tokens`);

  // Calculate trait frequencies
  const frequencyData = calculateTraitFrequencies(tokens);
  console.log(`📈 Calculated frequencies for ${Object.keys(frequencyData.byType).length} trait types`);

  // Calculate rarity score for each token
  const tokensWithScores = tokens.map(token => {
    const score = calculateTokenRarityScore(token, frequencyData.raw, tokens.length);
    return {
      ...token,
      rarity_score: Math.round(score * 100) / 100 // Round to 2 decimal places
    };
  });

  // Sort by rarity score (highest = rarest)
  tokensWithScores.sort((a, b) => b.rarity_score - a.rarity_score);

  // Assign ranks
  tokensWithScores.forEach((token, index) => {
    token.rarity_rank = index + 1;
  });

  console.log(`🏆 Rarity scores calculated and ranked`);
  console.log(`   Rarest token: #${tokensWithScores[0].token_id} (score: ${tokensWithScores[0].rarity_score})`);
  console.log(`   Most common: #${tokensWithScores[tokens.length - 1].token_id} (score: ${tokensWithScores[tokens.length - 1].rarity_score})`);

  // Update database with scores and ranks
  console.log(`💾 Updating database with rarity data...`);

  let updated = 0;
  for (const token of tokensWithScores) {
    const { error: updateError } = await supabase
      .from('cro_212hub_generated_tokens')
      .update({
        rarity_score: token.rarity_score,
        rarity_rank: token.rarity_rank
      })
      .eq('id', token.id);

    if (updateError) {
      console.error(`Failed to update token ${token.token_id}:`, updateError.message);
    } else {
      updated++;
    }
  }

  console.log(`✅ Updated ${updated}/${tokens.length} tokens in database\n`);

  return {
    projectId,
    totalTokens: tokens.length,
    frequencies: frequencyData,
    tokens: tokensWithScores,
    rarestToken: tokensWithScores[0],
    mostCommonToken: tokensWithScores[tokens.length - 1]
  };
}

/**
 * Generate CSV report for rarity data
 * @param {string} projectId - UUID of the project
 * @returns {Promise<string>} Path to CSV file
 */
async function generateRarityCSV(projectId) {
  console.log(`\n📄 Generating CSV report for project: ${projectId}`);

  // Fetch all tokens with rarity data
  const { data: tokens, error } = await supabase
    .from('cro_212hub_generated_tokens')
    .select('*')
    .eq('project_id', projectId)
    .order('rarity_rank', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch tokens: ${error.message}`);
  }

  if (!tokens || tokens.length === 0) {
    throw new Error('No tokens found for this project');
  }

  // Get all unique trait types
  const traitTypes = new Set();
  tokens.forEach(token => {
    token.attributes.forEach(attr => {
      traitTypes.add(attr.trait_type);
    });
  });

  const traitTypesArray = Array.from(traitTypes).sort();

  // Build CSV header
  const headers = ['token_id', 'rarity_score', 'rarity_rank', ...traitTypesArray];
  const csvRows = [headers.join(',')];

  // Build CSV rows
  tokens.forEach(token => {
    const row = [
      token.token_id,
      token.rarity_score || 0,
      token.rarity_rank || 0
    ];

    // Add trait values in order
    traitTypesArray.forEach(traitType => {
      const attr = token.attributes.find(a => a.trait_type === traitType);
      const value = attr ? attr.value : 'None';
      // Escape commas and quotes in CSV
      const escapedValue = value.includes(',') || value.includes('"')
        ? `"${value.replace(/"/g, '""')}"`
        : value;
      row.push(escapedValue);
    });

    csvRows.push(row.join(','));
  });

  // Write CSV file
  const csvContent = csvRows.join('\n');
  const csvDir = path.join(process.cwd(), 'output', projectId);
  await fs.mkdir(csvDir, { recursive: true });

  const csvPath = path.join(csvDir, 'rarity_report.csv');
  await fs.writeFile(csvPath, csvContent, 'utf8');

  console.log(`✅ CSV report saved to: output/${projectId}/rarity_report.csv`);
  console.log(`   ${tokens.length} tokens exported\n`);

  return `output/${projectId}/rarity_report.csv`;
}

/**
 * Get rarity statistics for a project
 * @param {string} projectId - UUID of the project
 * @returns {Promise<Object>} Rarity statistics
 */
async function getRarityStatistics(projectId) {
  const { data: tokens, error } = await supabase
    .from('cro_212hub_generated_tokens')
    .select('rarity_score, rarity_rank')
    .eq('project_id', projectId);

  if (error) {
    throw new Error(`Failed to fetch tokens: ${error.message}`);
  }

  if (!tokens || tokens.length === 0) {
    return null;
  }

  const scores = tokens.map(t => t.rarity_score).filter(s => s != null);

  if (scores.length === 0) {
    return {
      calculated: false,
      message: 'Rarity not calculated yet'
    };
  }

  const sum = scores.reduce((a, b) => a + b, 0);
  const mean = sum / scores.length;

  const sortedScores = [...scores].sort((a, b) => a - b);
  const median = scores.length % 2 === 0
    ? (sortedScores[scores.length / 2 - 1] + sortedScores[scores.length / 2]) / 2
    : sortedScores[Math.floor(scores.length / 2)];

  return {
    calculated: true,
    totalTokens: tokens.length,
    scores: {
      min: Math.min(...scores),
      max: Math.max(...scores),
      mean: Math.round(mean * 100) / 100,
      median: Math.round(median * 100) / 100
    }
  };
}

/**
 * Get top N rarest tokens for a project
 * @param {string} projectId - UUID of the project
 * @param {number} limit - Number of tokens to return
 * @returns {Promise<Array>} Top rarest tokens
 */
async function getTopRarestTokens(projectId, limit = 10) {
  const { data, error } = await supabase
    .from('cro_212hub_generated_tokens')
    .select('*')
    .eq('project_id', projectId)
    .not('rarity_rank', 'is', null)
    .order('rarity_rank', { ascending: true })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to fetch tokens: ${error.message}`);
  }

  return data || [];
}

/**
 * Get trait rarity breakdown for a project
 * @param {string} projectId - UUID of the project
 * @returns {Promise<Object>} Trait rarity breakdown
 */
async function getTraitRarityBreakdown(projectId) {
  const { data: tokens, error } = await supabase
    .from('cro_212hub_generated_tokens')
    .select('attributes')
    .eq('project_id', projectId);

  if (error) {
    throw new Error(`Failed to fetch tokens: ${error.message}`);
  }

  if (!tokens || tokens.length === 0) {
    return null;
  }

  const frequencies = calculateTraitFrequencies(tokens);

  // Convert to array format for easier display
  const breakdown = {};
  Object.entries(frequencies.byType).forEach(([traitType, traits]) => {
    breakdown[traitType] = Object.entries(traits)
      .map(([traitValue, data]) => ({
        value: traitValue,
        count: data.count,
        percentage: Math.round(data.percentage * 100) / 100,
        rarity: data.count === 1 ? '1/1' : `${data.count}/${frequencies.totalTokens}`
      }))
      .sort((a, b) => a.count - b.count); // Sort by rarity (lowest count first)
  });

  return {
    totalTokens: frequencies.totalTokens,
    traitTypes: breakdown
  };
}

module.exports = {
  calculateCollectionRarity,
  generateRarityCSV,
  getRarityStatistics,
  getTopRarestTokens,
  getTraitRarityBreakdown,
  calculateTraitFrequencies,
  calculateTokenRarityScore
};
