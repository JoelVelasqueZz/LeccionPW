const express = require('express');
const router = express.Router();
const httpService = require('../services/httpService');
const config = require('../config/config');

const MS_RUTAS_URL = config.services.rutas;

/**
 * GET /api/rutas
 * Obtiene todas las rutas (incluye datos de unidades)
 */
router.get('/', async (req, res, next) => {
  try {
    const data = await httpService.get(MS_RUTAS_URL, '/rutas');
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
 * GET /api/rutas/:id
 * Obtiene una ruta específica por ID
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await httpService.get(MS_RUTAS_URL, `/rutas/${id}`);
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
 * POST /api/rutas
 * Crea una nueva ruta
 * Body: { origen, destino, unidad_id }
 */
router.post('/', async (req, res, next) => {
  try {
    const data = await httpService.post(MS_RUTAS_URL, '/rutas', req.body);
    res.status(201).json({
      success: true,
      data,
      message: 'Ruta creada exitosamente',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/rutas/:id
 * Actualiza una ruta existente
 */
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await httpService.put(MS_RUTAS_URL, `/rutas/${id}`, req.body);
    res.json({
      success: true,
      data,
      message: 'Ruta actualizada exitosamente',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/rutas/:id
 * Elimina una ruta
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await httpService.delete(MS_RUTAS_URL, `/rutas/${id}`);
    res.json({
      success: true,
      data,
      message: 'Ruta eliminada exitosamente',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;