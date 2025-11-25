// src/server.js
// CRO212HUB NFT Generator & Launchpad - Backend API Server

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware - Allow all CORS
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (generated images and metadata)
app.use('/output', express.static(path.join(__dirname, '../output')));

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'CRO212HUB NFT Generator API - Phase 2 Online',
    version: '1.0.0',
    status: 'operational',
    endpoints: {
      projects: '/api/projects',
      generate: '/api/generate',
      rarity: '/api/rarity',
      health: '/'
    }
  });
});

// API Routes
app.use('/api/projects', require('./routes/projects'));
app.use('/api/generate', require('./routes/generate'));
app.use('/api/rarity', require('./routes/rarity'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 CRO212HUB Backend API running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/`);
  console.log(`📁 Output files: http://localhost:${PORT}/output/\n`);
});

module.exports = app;
