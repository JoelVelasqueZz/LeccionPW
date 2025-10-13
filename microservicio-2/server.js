const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json());

// Configuración PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// Verificar conexión
pool.connect()
  .then(() => console.log('✅ PostgreSQL Rutas conectada'))
  .catch(err => console.error('❌ Error PostgreSQL:', err));

// Crear tabla rutas
const crearTabla = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS rutas (
      id SERIAL PRIMARY KEY,
      origen VARCHAR(100) NOT NULL,
      destino VARCHAR(100) NOT NULL,
      unidad_id INTEGER NOT NULL
    )
  `;
  try {
    await pool.query(query);
    console.log('✅ Tabla rutas creada/verificada');
  } catch (error) {
    console.error('❌ Error al crear tabla:', error);
  }
};

crearTabla();

// RUTAS

// GET /rutas - Obtener todas las rutas CON datos de unidad
app.get('/rutas', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM rutas ORDER BY id');
    const rutas = result.rows;
    
    // Para cada ruta, obtener los datos de la unidad desde MS-Unidades
    for (let ruta of rutas) {
      try {
        const unidadRes = await axios.get(`${process.env.UNIDADES_API}/unidades/${ruta.unidad_id}`);
        ruta.unidad = unidadRes.data;
      } catch (error) {
        console.error(`Error al obtener unidad ${ruta.unidad_id}:`, error.message);
        ruta.unidad = null;
      }
    }
    
    res.json(rutas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /rutas - Crear una ruta
app.post('/rutas', async (req, res) => {
  const { origen, destino, unidad_id } = req.body;
  
  // Validación simple
  if (!origen || !destino || !unidad_id) {
    return res.status(400).json({ error: 'Todos los campos son requeridos' });
  }
  
  try {
    // Verificar que la unidad existe (consultando MS-Unidades)
    try {
      await axios.get(`${process.env.UNIDADES_API}/unidades/${unidad_id}`);
    } catch (error) {
      return res.status(404).json({ error: 'La unidad especificada no existe' });
    }
    
    // Crear la ruta
    const result = await pool.query(
      'INSERT INTO rutas (origen, destino, unidad_id) VALUES ($1, $2, $3) RETURNING *',
      [origen, destino, unidad_id]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET /rutas/:id - Obtener una ruta por ID
app.get('/rutas/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM rutas WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Ruta no encontrada' });
    }
    
    const ruta = result.rows[0];
    
    // Obtener datos de la unidad
    try {
      const unidadRes = await axios.get(`${process.env.UNIDADES_API}/unidades/${ruta.unidad_id}`);
      ruta.unidad = unidadRes.data;
    } catch (error) {
      ruta.unidad = null;
    }
    
    res.json(ruta);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 MS-Rutas funcionando en http://localhost:${PORT}`);
});