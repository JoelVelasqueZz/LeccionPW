const express = require('express');
const router = express.Router();
const httpService = require('../services/httpService');
const config = require('../config/config');

/**
 * GET /health
 * Verifica el estado del Gateway
 */
router.get('/', (req, res) => {
  res.json({
    success: true,
    service: 'API Gateway',
    status: 'running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.env
  });
});

/**
 * GET /health/services
 * Verifica el estado de todos los microservicios
 */
router.get('/services', async (req, res) => {
  const services = {
    unidades: await httpService.healthCheck(config.services.unidades),
    rutas: await httpService.healthCheck(config.services.rutas),
    distancia: await httpService.healthCheck(config.services.distancia)
  };

  const allAvailable = Object.values(services).every(s => s.available);

  res.status(allAvailable ? 200 : 503).json({
    success: allAvailable,
    gateway: 'running',
    services,
    timestamp: new Date().toISOString()
  });
});

/**
 * GET /info
 * Información del Gateway
 */
router.get('/info', (req, res) => {
  res.json({
    success: true,
    name: 'Sistema de Gestión de Rutas - API Gateway',
    version: '1.0.0',
    description: 'Gateway centralizado para microservicios de transporte',
    endpoints: {
      unidades: '/api/unidades',
      rutas: '/api/rutas',
      distancia: '/api/distancia',
      health: '/health'
    },
    microservices: {
      unidades: config.services.unidades,
      rutas: config.services.rutas,
      distancia: config.services.distancia
    },
    timestamp: new Date().toISOString()
  });
});

module.exports = router;