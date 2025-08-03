import { connectDB, sql } from '../config/db.js';

export const noticiaRepository = {
    async findAll() {
        const pool = await connectDB();
        const result = await pool.request().query("SELECT * FROM Noticias ORDER BY fecha_publicacion DESC, id DESC");
        return result.recordset || [];
    },

    async findPublicas() {
        const pool = await connectDB();
        const result = await pool.request()
            .input('estadoPublicado', sql.NVarChar, 'publicado')
            .query(`
                SELECT * FROM Noticias 
                WHERE estado = @estadoPublicado 
                AND (fecha_expiracion IS NULL OR fecha_expiracion > GETDATE())
                ORDER BY fecha_publicacion DESC, id DESC
            `);
        return result.recordset || [];
    },

    async findById(id) {
        const pool = await connectDB();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query("SELECT * FROM Noticias WHERE id = @id");
        return result.recordset[0];
    },

    async create(noticiaData) {
        const { titulo, autor, contenido, imagen_url, link, fecha_expiracion, estado, destacada } = noticiaData;
        const pool = await connectDB();
        const request = pool.request();
        const fechaPublicacionFinal = (estado === 'publicado') ? new Date() : null;
        const fechaExpiracionValida = new Date(fecha_expiracion);
        const esDestacada = Boolean(destacada);

        const result = await request
            .input('titulo', sql.NVarChar(200), titulo)
            .input('autor', sql.NVarChar(100), autor)
            .input('contenido', sql.NText, contenido)
            .input('imagen_url', sql.NVarChar(500), imagen_url || null)
            .input('link', sql.NVarChar(500), link)
            .input('fecha_publicacion', sql.DateTime, fechaPublicacionFinal)
            .input('fecha_expiracion', sql.DateTime, fechaExpiracionValida)
            .input('estado', sql.NVarChar(50), estado)
            .input('destacada', sql.Bit, esDestacada)
            .query(`
                INSERT INTO Noticias (titulo, autor, contenido, imagen_url, link, fecha_publicacion, fecha_expiracion, estado, destacada) 
                OUTPUT INSERTED.*
                VALUES (@titulo, @autor, @contenido, @imagen_url, @link, @fecha_publicacion, @fecha_expiracion, @estado, @destacada)
            `);
        return result.recordset[0];
    },

    async update(id, noticiaData) {
        const { titulo, autor, contenido, imagen_url = '', link, fecha_expiracion, estado, fecha_publicacion, destacada } = noticiaData;
        const pool = await connectDB();
        const fechaPublicacionValida = fecha_publicacion ? new Date(fecha_publicacion) : null;
        const fechaExpiracionValida = fecha_expiracion ? new Date(fecha_expiracion) : null;

        const result = await pool.request()
            .input('id', sql.Int, id)
            .input('titulo', sql.NVarChar(200), titulo)
            .input('autor', sql.NVarChar(100), autor)
            .input('contenido', sql.NText, contenido)
            .input('imagen_url', sql.NVarChar(500), imagen_url)
            .input('link', sql.NVarChar(500), link)
            .input('fecha_publicacion', sql.DateTime, fechaPublicacionValida)
            .input('fecha_expiracion', sql.DateTime, fechaExpiracionValida)
            .input('estado', sql.NVarChar(50), estado)
            .input('destacada', sql.Bit, Boolean(destacada))
            .query(`UPDATE Noticias SET titulo = @titulo, autor = @autor, contenido = @contenido, imagen_url = @imagen_url, 
                    link = @link, fecha_publicacion = @fecha_publicacion, fecha_expiracion = @fecha_expiracion, 
                    estado = @estado, destacada = @destacada WHERE id = @id`);
        return result.rowsAffected[0];
    },

    async publishDraft(id) {
        const pool = await connectDB();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .input('nuevoEstado', sql.NVarChar(50), 'publicado')
            .input('fecha_publicacion_actual', sql.DateTime, new Date())
            .query(`UPDATE Noticias SET estado = @nuevoEstado, fecha_publicacion = @fecha_publicacion_actual
                    WHERE id = @id AND estado = 'borrador'`);
        return result.rowsAffected[0];
    },

    async deleteById(id) {
        const pool = await connectDB();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query("DELETE FROM Noticias WHERE id = @id");
        return result.rowsAffected[0];
    },

    async deleteManyByIds(ids) {
        const pool = await connectDB();
        const request = pool.request();
        const idPlaceholders = ids.map((id, index) => {
            const paramName = `id${index}`;
            request.input(paramName, sql.Int, id);
            return `@${paramName}`;
        }).join(',');

        const result = await request.query(`DELETE FROM Noticias WHERE id IN (${idPlaceholders})`);
        return result.rowsAffected[0];
    },
    
    async findManyByIds(ids) {
        const pool = await connectDB();
        const request = pool.request();
        const idPlaceholders = ids.map((id, index) => {
            const paramName = `id${index}`;
            request.input(paramName, sql.Int, id);
            return `@${paramName}`;
        }).join(',');
        
        const result = await request.query(`SELECT * FROM Noticias WHERE id IN (${idPlaceholders})`);
        return result.recordset || [];
    },

    async toggleFeature(id, destacada) {
        const pool = await connectDB();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .input('destacada', sql.Bit, destacada)
            .query("UPDATE Noticias SET destacada = @destacada WHERE id = @id");
        return result.rowsAffected[0];
    }
};