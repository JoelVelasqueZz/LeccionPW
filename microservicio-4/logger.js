const morgan = require('morgan');

/**
 * Middleware de logging para peticiones HTTP
 */
const requestLogger = morgan((tokens, req, res) => {
  return [
    '🔵',
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    '-',
    tokens['response-time'](req, res), 'ms',
    '-',
    tokens.res(req, res, 'content-length'), 'bytes'
  ].join(' ');
});

/**
 * Logger personalizado para errores
 */
const logError = (error, service = 'Gateway') => {
  console.error(`❌ [${service}] Error:`, {
    message: error.message,
    status: error.response?.status,
    data: error.response?.data,
    timestamp: new Date().toISOString()
  });
};

/**
 * Logger personalizado para información
 */
const logInfo = (message, data = null) => {
  console.log(`ℹ️ [Gateway] ${message}`, data ? data : '');
};

/**
 * Logger personalizado para warnings
 */
const logWarning = (message, data = null) => {
  console.warn(`⚠️ [Gateway] ${message}`, data ? data : '');
};

module.exports = {
  requestLogger,
  logError,
  logInfo,
  logWarning
};