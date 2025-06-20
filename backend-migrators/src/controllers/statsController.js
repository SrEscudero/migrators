// src/controllers/statsController.js

import { sql, connectDB } from '../config/db.js';

// Obtiene el conteo de noticias por estado
export const getStatsPorEstado = async (req, res) => {
  try {
    const pool = await connectDB();
    const result = await pool.request().query(`
      SELECT estado, COUNT(*) as total_noticias
      FROM Noticias 
      GROUP BY estado
    `);
    res.json(result.recordset);
  } catch (error) {
    console.error("Error al obtener estadísticas por estado:", error.message);
    res.status(500).json({ message: "Error al obtener estadísticas por estado", details: error.message });
  }
};

// Obtiene el conteo de noticias destacadas
export const getStatsDestacadas = async (req, res) => {
  try {
    const pool = await connectDB();
    const result = await pool.request().query(`
      SELECT destacada, COUNT(*) as total_noticias
      FROM Noticias 
      GROUP BY destacada
    `);
    res.json(result.recordset);
  } catch (error) {
    console.error("Error al obtener estadísticas de destacadas:", error.message);
    res.status(500).json({ message: "Error al obtener estadísticas de destacadas", details: error.message });
  }
};

// Obtiene el conteo de noticias publicadas por mes
export const getStatsPublicadasPorFecha = async (req, res) => {
  try {
    const pool = await connectDB();
    // Usamos FORMAT para obtener 'YYYY-MM' que es más fácil de ordenar y mostrar
    const result = await pool.request().query(`
      SELECT FORMAT(fecha_publicacion, 'yyyy-MM') as mes, COUNT(*) as total_noticias
      FROM Noticias 
      WHERE fecha_publicacion IS NOT NULL 
      GROUP BY FORMAT(fecha_publicacion, 'yyyy-MM')
      ORDER BY mes ASC
    `);
    res.json(result.recordset);
  } catch (error) {
    console.error("Error al obtener estadísticas por fecha:", error.message);
    res.status(500).json({ message: "Error al obtener estadísticas por fecha", details: error.message });
  }
};

// Obtiene el conteo de noticias por autor
export const getStatsPorAutor = async (req, res) => {
  try {
    const pool = await connectDB();
    const result = await pool.request().query(`
      SELECT autor, COUNT(*) as total_noticias
      FROM Noticias 
      GROUP BY autor 
      ORDER BY total_noticias DESC
    `);
    res.json(result.recordset);
  } catch (error) {
    console.error("Error al obtener estadísticas por autor:", error.message);
    res.status(500).json({ message: "Error al obtener estadísticas por autor", details: error.message });
  }
};