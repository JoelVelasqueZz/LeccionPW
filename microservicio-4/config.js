require('dotenv').config();

const config = {
  port: process.env.PORT || 8080,
  env: process.env.NODE_ENV || 'development',
  
  // URLs de los microservicios
  services: {
    unidades: process.env.MS_UNIDADES_URL || 'http://localhost:3001',
    rutas: process.env.MS_RUTAS_URL || 'http://localhost:3002',
    distancia: process.env.MS_DISTANCIA_URL || 'http://localhost:3003'
  },
  
  // Configuración de timeouts
  requestTimeout: parseInt(process.env.REQUEST_TIMEOUT) || 5000,
  
  // Configuración de CORS
  cors: {
    origin: ['http://localhost:4200', 'http://localhost:8080'],
    credentials: true,
    optionsSuccessStatus: 200
  }
};

module.exports = config;