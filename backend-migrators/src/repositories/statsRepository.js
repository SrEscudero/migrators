import { connectDB, sql } from '../config/db.js';

export const statsRepository = {
    async getStatsPorEstado() {
        const pool = await connectDB();
        const result = await pool.request().query(`
            SELECT estado, COUNT(*) as total_noticias
            FROM Noticias
            GROUP BY estado
            ORDER BY estado;
        `);
        return result.recordset;
    },

    async getStatsDestacadas() {
        const pool = await connectDB();
        const result = await pool.request().query(`
            SELECT destacada, COUNT(*) as total_noticias
            FROM Noticias
            GROUP BY destacada;
        `);
        return result.recordset;
    },

    async getStatsPublicadasPorFecha() {
        const pool = await connectDB();
        const result = await pool.request().query(`
            SELECT
                FORMAT(fecha_publicacion, 'yyyy-MM-01') as fecha,
                COUNT(*) as total_noticias
            FROM Noticias
            WHERE estado = 'publicado' AND fecha_publicacion IS NOT NULL
            GROUP BY FORMAT(fecha_publicacion, 'yyyy-MM-01')
            ORDER BY fecha DESC;
        `);
        return result.recordset;
    },

    async getStatsPorAutor() {
        const pool = await connectDB();
        const result = await pool.request().query(`
            SELECT autor, COUNT(*) as total_noticias
            FROM Noticias
            WHERE estado = 'publicado'
            GROUP BY autor
            ORDER BY total_noticias DESC;
        `);
        return result.recordset;
    }
};