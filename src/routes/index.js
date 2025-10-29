const express = require('express');
const router = express.Router();

/**
 * 健康检查路由
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV
    }
  });
});

/**
 * API 根路由
 */
router.get('/', (req, res) => {
  res.json({
    success: true,
    data: {
      message: 'TCM Platform API',
      version: '1.0.0',
      documentation: '/api/docs'
    }
  });
});

module.exports = router;

