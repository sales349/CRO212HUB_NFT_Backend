// src/server.js
// CRO212HUB NFT Generator & Launchpad - Backend API Server

require('dotenv').config();
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS - Must be FIRST before any other middleware
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    console.log(`[${new Date().toISOString()}] OPTIONS ${req.path} - Preflight request`);
    return res.status(200).end();
  }

  next();
});

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware (after body parsing so we can log body)
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  if (Object.keys(req.query).length > 0) {
    console.log('  Query params:', req.query);
  }
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('  Body params:', req.body);
  }
  next();
});

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
