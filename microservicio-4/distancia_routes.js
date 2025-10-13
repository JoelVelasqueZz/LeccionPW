const express = require('express');
const router = express.Router();
const httpService = require('../services/httpService');
const config = require('../config/config');

const MS_DISTANCIA_URL = config.services.distancia;

/**
 * GET /api/distancia?origen=Machala&destino=Guayaquil
 * Calcula la distancia y duración entre dos ciudades
 * Query params: origen, destino
 */
router.get('/', async (req, res, next) => {
  try {
    const { origen, destino } = req.query;
    
    // Validación de parámetros
    if (!origen || !destino) {
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'Se requieren los parámetros origen y destino',
        timestamp: new Date().toISOString()
      });
    }

    const data = await httpService.get(MS_DISTANCIA_URL, '/distancia', {
      origen,
      destino
    });

    res.json({
      success: true,
      data,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/distancia
 * Calcula distancia entre múltiples rutas
 * Body: { rutas: [{ origen, destino }] }
 */
router.post('/batch', async (req, res, next) => {
  try {
    const { rutas } = req.body;
    
    if (!rutas || !Array.isArray(rutas) || rutas.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'Se requiere un array de rutas con origen y destino',
        timestamp: new Date().toISOString()
      });
    }

    // Procesar múltiples rutas
    const resultados = await Promise.all(
      rutas.map(async (ruta) => {
        try {
          const data = await httpService.get(MS_DISTANCIA_URL, '/distancia', {
            origen: ruta.origen,
            destino: ruta.destino
          });
          return {
            success: true,
            ...data
          };
        } catch (error) {
          return {
            success: false,
            origen: ruta.origen,
            destino: ruta.destino,
            error: error.message
          };
        }
      })
    );

    res.json({
      success: true,
      data: resultados,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;