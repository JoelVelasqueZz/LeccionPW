const express = require('express');
const router = express.Router();
const httpService = require('../services/httpService');
const config = require('../config/config');

const MS_UNIDADES_URL = config.services.unidades;

/**
 * GET /api/unidades
 * Obtiene todas las unidades de transporte
 */
router.get('/', async (req, res, next) => {
  try {
    const data = await httpService.get(MS_UNIDADES_URL, '/unidades');
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
 * GET /api/unidades/:id
 * Obtiene una unidad específica por ID
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await httpService.get(MS_UNIDADES_URL, `/unidades/${id}`);
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
 * POST /api/unidades
 * Crea una nueva unidad de transporte
 * Body: { placa, chofer, capacidad }
 */
router.post('/', async (req, res, next) => {
  try {
    const data = await httpService.post(MS_UNIDADES_URL, '/unidades', req.body);
    res.status(201).json({
      success: true,
      data,
      message: 'Unidad creada exitosamente',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/unidades/:id
 * Actualiza una unidad existente
 */
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await httpService.put(MS_UNIDADES_URL, `/unidades/${id}`, req.body);
    res.json({
      success: true,
      data,
      message: 'Unidad actualizada exitosamente',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/unidades/:id
 * Elimina una unidad
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await httpService.delete(MS_UNIDADES_URL, `/unidades/${id}`);
    res.json({
      success: true,
      data,
      message: 'Unidad eliminada exitosamente',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;