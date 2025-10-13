const createApp = require('./app');
const config = require('./config/config');
const { logInfo, logError } = require('./middlewares/logger');

// Crear la aplicación Express
const app = createApp();

// Iniciar el servidor
const server = app.listen(config.port, () => {
  console.log('\n' + '='.repeat(60));
  console.log('🚀 API GATEWAY - SISTEMA DE GESTIÓN DE RUTAS');
  console.log('='.repeat(60));
  logInfo(`Servidor corriendo en http://localhost:${config.port}`);
  logInfo(`Entorno: ${config.env}`);
  console.log('\n📡 Microservicios configurados:');
  console.log(`   • Unidades:  ${config.services.unidades}`);
  console.log(`   • Rutas:     ${config.services.rutas}`);
  console.log(`   • Distancia: ${config.services.distancia}`);
  console.log('\n📍 Endpoints disponibles:');
  console.log(`   • GET  http://localhost:${config.port}/`);
  console.log(`   • GET  http://localhost:${config.port}/health`);
  console.log(`   • GET  http://localhost:${config.port}/health/services`);
  console.log(`   • GET  http://localhost:${config.port}/health/info`);
  console.log(`   • *    http://localhost:${config.port}/api/unidades`);
  console.log(`   • *    http://localhost:${config.port}/api/rutas`);
  console.log(`   • GET  http://localhost:${config.port}/api/distancia`);
  console.log('\n' + '='.repeat(60) + '\n');
});

// Manejo de cierre graceful
process.on('SIGTERM', () => {
  logInfo('SIGTERM recibido. Cerrando servidor...');
  server.close(() => {
    logInfo('Servidor cerrado correctamente');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logInfo('\nSIGINT recibido. Cerrando servidor...');
  server.close(() => {
    logInfo('Servidor cerrado correctamente');
    process.exit(0);
  });
});

// Manejo de errores no capturados
process.on('uncaughtException', (error) => {
  logError(error, 'UncaughtException');
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

module.exports = server;