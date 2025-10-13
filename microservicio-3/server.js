const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3003;

// Middleware
app.use(cors());
app.use(express.json());

// Datos simulados de distancias entre ciudades ecuatorianas
const distancias = {
  'Machala-Guayaquil': { distancia_km: 180, duracion_horas: 2.5 },
  'Machala-Quito': { distancia_km: 600, duracion_horas: 8 },
  'Machala-Cuenca': { distancia_km: 195, duracion_horas: 3 },
  'Guayaquil-Quito': { distancia_km: 420, duracion_horas: 6 },
  'Guayaquil-Cuenca': { distancia_km: 243, duracion_horas: 3.5 },
  'Quito-Cuenca': { distancia_km: 497, duracion_horas: 7 },
  'Machala-Loja': { distancia_km: 210, duracion_horas: 3.5 },
  'Guayaquil-Manta': { distancia_km: 190, duracion_horas: 2.5 },
  'Quito-Ambato': { distancia_km: 135, duracion_horas: 2 },
  'Cuenca-Loja': { distancia_km: 210, duracion_horas: 3.5 }
};

// Función para normalizar nombres de ciudades (quitar acentos, mayúsculas)
const normalizarCiudad = (ciudad) => {
  return ciudad
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
};

// GET /distancia?origen=Machala&destino=Guayaquil
app.get('/distancia', (req, res) => {
  const { origen, destino } = req.query;
  
  // Validación
  if (!origen || !destino) {
    return res.status(400).json({ 
      error: 'Se requieren los parámetros "origen" y "destino"' 
    });
  }
  
  // Normalizar las ciudades
  const origenNorm = normalizarCiudad(origen);
  const destinoNorm = normalizarCiudad(destino);
  
  // Buscar la distancia (en ambas direcciones)
  const key1 = `${origenNorm}-${destinoNorm}`;
  const key2 = `${destinoNorm}-${origenNorm}`;
  
  // Buscar en el objeto de distancias
  let resultado = null;
  
  for (let key in distancias) {
    const keyNorm = key.toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    
    if (keyNorm === key1 || keyNorm === key2) {
      resultado = distancias[key];
      break;
    }
  }
  
  if (resultado) {
    res.json({
      origen,
      destino,
      distancia_km: resultado.distancia_km,
      duracion_horas: resultado.duracion_horas
    });
  } else {
    // Si no existe la ruta, devolver valores por defecto
    res.json({
      origen,
      destino,
      distancia_km: 100,
      duracion_horas: 1.5,
      nota: 'Distancia estimada (ruta no encontrada en base de datos)'
    });
  }
});

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ 
    mensaje: 'MS-Distancia funcionando',
    ejemplo: '/distancia?origen=Machala&destino=Guayaquil'
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 MS-Distancia funcionando en http://localhost:${PORT}`);
  console.log(`📍 Prueba: http://localhost:${PORT}/distancia?origen=Machala&destino=Guayaquil`);
});