const { logError } = require('./logger');

/**
 * Middleware de manejo de errores centralizado
 */
const errorHandler = (err, req, res, next) => {
  logError(err, 'ErrorHandler');
  
  // Error de timeout
  if (err.code === 'ECONNABORTED') {
    return res.status(504).json({
      success: false,
      error: 'Gateway Timeout',
      message: 'El servicio tardó demasiado en responder',
      timestamp: new Date().toISOString()
    });
  }
  
  // Error de conexión
  if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
    return res.status(503).json({
      success: false,
      error: 'Service Unavailable',
      message: 'No se pudo conectar con el microservicio',
      details: err.message,
      timestamp: new Date().toISOString()
    });
  }
  
  // Error de respuesta del microservicio
  if (err.response) {
    return res.status(err.response.status || 500).json({
      success: false,
      error: err.response.statusText || 'Error en microservicio',
      message: err.response.data?.message || err.response.data || 'Error desconocido',
      timestamp: new Date().toISOString()
    });
  }
  
  // Error genérico
  return res.status(500).json({
    success: false,
    error: 'Internal Server Error',
    message: err.message || 'Error interno del servidor',
    timestamp: new Date().toISOString()
  });
};

/**
 * Middleware para rutas no encontradas
 */
const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Not Found',
    message: `Ruta ${req.method} ${req.url} no encontrada`,
    timestamp: new Date().toISOString()
  });
};

module.exports = {
  errorHandler,
  notFoundHandler
};