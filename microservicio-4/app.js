const express = require('express');
const cors = require('cors');
const config = require('./config/config');
const { requestLogger } = require('./middlewares/logger');
const { errorHandler, notFoundHandler } = require('./middlewares/errorHandler');

// Importar rutas
const unidadesRoutes = require('./routes/unidades.routes');
const rutasRoutes = require('./routes/rutas.routes');
const distanciaRoutes = require('./routes/distancia.routes');
const healthRoutes = require('./routes/health.routes');

/**
 * Configura y retorna la aplicación Express
 */
function createApp() {
  const app = express();

  // ========== MIDDLEWARES GLOBALES ==========
  
  // CORS - Permitir peticiones desde Angular
  app.use(cors(config.cors));

  // Parser de JSON
  app.use(express.json());

  // Parser de URL encoded
  app.use(express.urlencoded({ extended: true }));

  // Logger de peticiones HTTP
  app.use(requestLogger);

  // ========== RUTAS PRINCIPALES ==========
  
  // Ruta raíz
  app.get('/', (req, res) => {
    res.json({
      success: true,
      message: '🚀 API Gateway - Sistema de Gestión de Rutas de Transporte',
      version: '1.0.0',
      endpoints: {
        health: '/health',
        info: '/health/info',
        services_status: '/health/services',
        unidades: '/api/unidades',
        rutas: '/api/rutas',
        distancia: '/api/distancia'
      },
      documentation: 'Consulte el README.md para más información',
      timestamp: new Date().toISOString()
    });
  });

  // Health check
  app.use('/health', healthRoutes);

  // ========== RUTAS DE MICROSERVICIOS ==========
  
  // MS-Unidades
  app.use('/api/unidades', unidadesRoutes);

  // MS-Rutas
  app.use('/api/rutas', rutasRoutes);

  // MS-Distancia
  app.use('/api/distancia', distanciaRoutes);

  // ========== MANEJO DE ERRORES ==========
  
  // Ruta no encontrada (404)
  app.use(notFoundHandler);

  // Manejador global de errores
  app.use(errorHandler);

  return app;
}

module.exports = createApp;