// src/routes/rarity.js
// API routes for rarity calculation and reporting

const express = require('express');
const router = express.Router();
const path = require('path');
const {
  calculateCollectionRarity,
  generateRarityCSV,
  getRarityStatistics,
  getTopRarestTokens,
  getTraitRarityBreakdown
} = require('../services/rarity');

/**
 * POST /api/rarity/:projectId/calculate
 * Calculate rarity scores and ranks for all tokens in a project
 */
router.post('/:projectId/calculate', async (req, res) => {
  try {
    const { projectId } = req.params;

    // Run rarity calculation
    const results = await calculateCollectionRarity(projectId);

    res.json({
      success: true,
      message: 'Rarity calculated successfully',
      data: {
        projectId: results.projectId,
        totalTokens: results.totalTokens,
        rarestToken: {
          tokenId: results.rarestToken.token_id,
          score: results.rarestToken.rarity_score,
          rank: results.rarestToken.rarity_rank
        },
        mostCommonToken: {
          tokenId: results.mostCommonToken.token_id,
          score: results.mostCommonToken.rarity_score,
          rank: results.mostCommonToken.rarity_rank
        }
      }
    });
  } catch (error) {
    console.error('Error calculating rarity:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/rarity/:projectId/export-csv
 * Generate and download CSV report for rarity data
 */
router.post('/:projectId/export-csv', async (req, res) => {
  try {
    const { projectId } = req.params;

    // Generate CSV
    const csvPath = await generateRarityCSV(projectId);

    res.json({
      success: true,
      message: 'CSV report generated successfully',
      csvPath,
      downloadUrl: `/output/${projectId}/rarity_report.csv`
    });
  } catch (error) {
    console.error('Error generating CSV:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/rarity/:projectId/export-csv
 * Download CSV report (if it exists)
 */
router.get('/:projectId/export-csv', async (req, res) => {
  try {
    const { projectId } = req.params;

    // Generate fresh CSV
    const csvPath = await generateRarityCSV(projectId);

    // Send file for download
    const absolutePath = path.join(process.cwd(), csvPath);
    res.download(absolutePath, 'rarity_report.csv', (err) => {
      if (err) {
        console.error('Error sending file:', err);
        if (!res.headersSent) {
          res.status(500).json({
            success: false,
            error: 'Failed to download CSV'
          });
        }
      }
    });
  } catch (error) {
    console.error('Error downloading CSV:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/rarity/:projectId/statistics
 * Get rarity statistics for a project
 */
router.get('/:projectId/statistics', async (req, res) => {
  try {
    const { projectId } = req.params;

    const stats = await getRarityStatistics(projectId);

    if (!stats) {
      return res.status(404).json({
        success: false,
        error: 'No tokens found for this project'
      });
    }

    res.json({
      success: true,
      statistics: stats
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/rarity/:projectId/top-rarest
 * Get top N rarest tokens for a project
 */
router.get('/:projectId/top-rarest', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { limit = 10 } = req.query;

    const tokens = await getTopRarestTokens(projectId, parseInt(limit));

    res.json({
      success: true,
      tokens,
      count: tokens.length
    });
  } catch (error) {
    console.error('Error fetching top rarest tokens:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/rarity/:projectId/trait-breakdown
 * Get trait rarity breakdown for a project
 */
router.get('/:projectId/trait-breakdown', async (req, res) => {
  try {
    const { projectId } = req.params;

    const breakdown = await getTraitRarityBreakdown(projectId);

    if (!breakdown) {
      return res.status(404).json({
        success: false,
        error: 'No tokens found for this project'
      });
    }

    res.json({
      success: true,
      breakdown
    });
  } catch (error) {
    console.error('Error fetching trait breakdown:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
