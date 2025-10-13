const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

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
  .then(() => console.log('✅ PostgreSQL Unidades conectada'))
  .catch(err => console.error('❌ Error PostgreSQL:', err));

// Crear tabla unidades (se ejecuta automáticamente)
const crearTabla = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS unidades (
      id SERIAL PRIMARY KEY,
      placa VARCHAR(10) UNIQUE NOT NULL,
      chofer VARCHAR(100) NOT NULL,
      capacidad INTEGER NOT NULL
    )
  `;
  try {
    await pool.query(query);
    console.log('✅ Tabla unidades creada/verificada');
  } catch (error) {
    console.error('❌ Error al crear tabla:', error);
  }
};

crearTabla();

// RUTAS

// GET /unidades - Obtener todas las unidades
app.get('/unidades', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM unidades ORDER BY id');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /unidades - Crear una unidad
app.post('/unidades', async (req, res) => {
  const { placa, chofer, capacidad } = req.body;
  
  // Validación simple
  if (!placa || !chofer || !capacidad) {
    return res.status(400).json({ error: 'Todos los campos son requeridos' });
  }
  
  try {
    const result = await pool.query(
      'INSERT INTO unidades (placa, chofer, capacidad) VALUES ($1, $2, $3) RETURNING *',
      [placa, chofer, capacidad]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET /unidades/:id - Obtener una unidad por ID
app.get('/unidades/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM unidades WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Unidad no encontrada' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 MS-Unidades funcionando en http://localhost:${PORT}`);
});