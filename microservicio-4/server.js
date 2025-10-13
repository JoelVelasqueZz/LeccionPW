const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`📍 ${req.method} ${req.path}`);
  next();
});

// URLs de los microservicios
const UNIDADES_API = process.env.UNIDADES_API;
const RUTAS_API = process.env.RUTAS_API;
const DISTANCIA_API = process.env.DISTANCIA_API;

// Función para manejar errores
const manejarError = (res, error, servicio) => {
  console.error(`❌ Error en ${servicio}:`, error.message);
  res.status(error.response?.status || 500).json({ 
    error: `Error al conectar con ${servicio}`,
    detalles: error.message 
  });
};

// ============================================
// RUTA DE BIENVENIDA
// ============================================

app.get('/', (req, res) => {
  res.json({
    mensaje: '🚀 Gateway API - Sistema de Rutas de Transporte',
    version: '1.0.0',
    endpoints: {
      unidades: {
        listar: 'GET /api/unidades',
        crear: 'POST /api/unidades',
        obtener: 'GET /api/unidades/:id'
      },
      rutas: {
        listar: 'GET /api/rutas',
        crear: 'POST /api/rutas',
        obtener: 'GET /api/rutas/:id'
      },
      distancia: 'GET /api/distancia?origen=X&destino=Y',
      rutasCompletas: 'GET /api/rutas-completas',
      health: 'GET /health'
    }
  });
});

// ============================================
// HEALTH CHECK
// ============================================

app.get('/health', async (req, res) => {
  const servicios = {
    'MS-Unidades': `${UNIDADES_API}/unidades`,
    'MS-Rutas': `${RUTAS_API}/rutas`,
    'MS-Distancia': `${DISTANCIA_API}/distancia?origen=Machala&destino=Guayaquil`
  };
  
  const estado = {
    gateway: '✅ Funcionando',
    timestamp: new Date().toISOString(),
    servicios: {}
  };
  
  for (let [nombre, url] of Object.entries(servicios)) {
    try {
      await axios.get(url, { timeout: 3000 });
      estado.servicios[nombre] = '✅ Conectado';
    } catch (error) {
      estado.servicios[nombre] = '❌ No disponible';
    }
  }
  
  res.json(estado);
});

// ============================================
// RUTAS DE UNIDADES
// ============================================

// GET /api/unidades - Listar todas las unidades
app.get('/api/unidades', async (req, res) => {
  try {
    const response = await axios.get(`${UNIDADES_API}/unidades`);
    res.json(response.data);
  } catch (error) {
    manejarError(res, error, 'MS-Unidades');
  }
});

// POST /api/unidades - Crear una unidad
app.post('/api/unidades', async (req, res) => {
  try {
    const response = await axios.post(`${UNIDADES_API}/unidades`, req.body);
    res.status(201).json(response.data);
  } catch (error) {
    manejarError(res, error, 'MS-Unidades');
  }
});

// GET /api/unidades/:id - Obtener una unidad por ID
app.get('/api/unidades/:id', async (req, res) => {
  try {
    const response = await axios.get(`${UNIDADES_API}/unidades/${req.params.id}`);
    res.json(response.data);
  } catch (error) {
    manejarError(res, error, 'MS-Unidades');
  }
});

// ============================================
// RUTAS DE RUTAS
// ============================================

// GET /api/rutas - Listar todas las rutas
app.get('/api/rutas', async (req, res) => {
  try {
    const response = await axios.get(`${RUTAS_API}/rutas`);
    res.json(response.data);
  } catch (error) {
    manejarError(res, error, 'MS-Rutas');
  }
});

// POST /api/rutas - Crear una ruta
app.post('/api/rutas', async (req, res) => {
  try {
    const response = await axios.post(`${RUTAS_API}/rutas`, req.body);
    res.status(201).json(response.data);
  } catch (error) {
    manejarError(res, error, 'MS-Rutas');
  }
});

// GET /api/rutas/:id - Obtener una ruta por ID
app.get('/api/rutas/:id', async (req, res) => {
  try {
    const response = await axios.get(`${RUTAS_API}/rutas/${req.params.id}`);
    res.json(response.data);
  } catch (error) {
    manejarError(res, error, 'MS-Rutas');
  }
});

// ============================================
// RUTAS DE DISTANCIA
// ============================================

// GET /api/distancia?origen=X&destino=Y
app.get('/api/distancia', async (req, res) => {
  try {
    const { origen, destino } = req.query;
    
    if (!origen || !destino) {
      return res.status(400).json({ 
        error: 'Se requieren los parámetros "origen" y "destino"' 
      });
    }
    
    const response = await axios.get(`${DISTANCIA_API}/distancia`, {
      params: { origen, destino }
    });
    
    res.json(response.data);
  } catch (error) {
    manejarError(res, error, 'MS-Distancia');
  }
});

// ============================================
// RUTA ESPECIAL: RUTAS COMPLETAS
// ============================================

// GET /api/rutas-completas
// Combina datos de Rutas + Unidades + Distancia
app.get('/api/rutas-completas', async (req, res) => {
  try {
    // 1. Obtener todas las rutas (que ya incluyen datos de unidad)
    const rutasResponse = await axios.get(`${RUTAS_API}/rutas`);
    const rutas = rutasResponse.data;
    
    // 2. Para cada ruta, agregar la información de distancia
    const rutasCompletas = await Promise.all(
      rutas.map(async (ruta) => {
        try {
          const distanciaResponse = await axios.get(`${DISTANCIA_API}/distancia`, {
            params: { 
              origen: ruta.origen, 
              destino: ruta.destino 
            }
          });
          
          return {
            ...ruta,
            distancia_km: distanciaResponse.data.distancia_km,
            duracion_horas: distanciaResponse.data.duracion_horas
          };
        } catch (error) {
          console.error(`Error al obtener distancia para ruta ${ruta.id}:`, error.message);
          return {
            ...ruta,
            distancia_km: null,
            duracion_horas: null
          };
        }
      })
    );
    
    res.json(rutasCompletas);
  } catch (error) {
    manejarError(res, error, 'Rutas Completas');
  }
});

// ============================================
// MANEJO DE RUTAS NO ENCONTRADAS
// ============================================

app.use((req, res) => {
  res.status(404).json({ 
    error: 'Ruta no encontrada',
    path: req.path 
  });
});

// ============================================
// INICIAR SERVIDOR
// ============================================

app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log(`🚀 Gateway API funcionando en http://localhost:${PORT}`);
  console.log('='.repeat(50));
  console.log('📊 Endpoints disponibles:');
  console.log(`   Health Check:      http://localhost:${PORT}/health`);
  console.log(`   Unidades:          http://localhost:${PORT}/api/unidades`);
  console.log(`   Rutas:             http://localhost:${PORT}/api/rutas`);
  console.log(`   Distancia:         http://localhost:${PORT}/api/distancia`);
  console.log(`   Rutas Completas:   http://localhost:${PORT}/api/rutas-completas`);
  console.log('='.repeat(50));
  console.log('📡 Conectando con microservicios:');
  console.log(`   MS-Unidades:   ${UNIDADES_API}`);
  console.log(`   MS-Rutas:      ${RUTAS_API}`);
  console.log(`   MS-Distancia:  ${DISTANCIA_API}`);
  console.log('='.repeat(50));
});