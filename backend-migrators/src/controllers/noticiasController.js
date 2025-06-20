// Se importa connectDB directamente
import { connectDB, sql } from '../config/db.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_DIR = path.join(__dirname, '..', '..', 'public', 'uploads');

// La función ahora está CORREGIDA
async function getDbPool() {
  const pool = await connectDB();
  return pool;
}

export const obtenerNoticias = async (req, res) => {
    try {
        // Esto ahora funcionará
        const pool = await getDbPool();
        const result = await pool.request().query("SELECT * FROM Noticias ORDER BY fecha_publicacion DESC, id DESC");
        res.json(result.recordset || []);
    } catch (error) {
        console.error("Error en obtenerNoticias (admin):", error.message);
        res.status(500).json({ message: "Error al obtener noticias para admin", details: error.message });
    }
};

export const obtenerNoticiasPublicas = async (req, res) => {
    try {
        const pool = await getDbPool();
        const result = await pool.request()
            .input('estadoPublicado', sql.NVarChar, 'publicado')
            .query(`
                SELECT * FROM Noticias 
                WHERE estado = @estadoPublicado 
                  AND (fecha_expiracion IS NULL OR fecha_expiracion > GETDATE())
                ORDER BY fecha_publicacion DESC, id DESC
            `);
        res.json(result.recordset || []);
    } catch (error) {
        console.error("Error en obtenerNoticiasPublicas:", error.message);
        res.status(500).json({ message: "Error al obtener noticias públicas", details: error.message });
    }
};

export const agregarNoticia = async (req, res) => {
    const { titulo, autor, contenido, imagen_url = '', link, fecha_expiracion, estado = 'borrador', fecha_publicacion, destacada = false } = req.body;
    
    if (!titulo || !autor || !contenido || !link || !fecha_expiracion || !estado || (estado === 'publicado' && !fecha_publicacion)) {
        return res.status(400).json({ message: "Faltan campos obligatorios." });
    }

    try {
        const pool = await getDbPool();
        const request = pool.request();

      const fechaPublicacionFinal = (estado === 'publicado' && !fecha_publicacion) 
        ? new Date() 
        : (fecha_publicacion ? new Date(fecha_publicacion) : null);

      const fechaExpiracionValida = fecha_expiracion ? new Date(fecha_expiracion) : null;

        await request
            .input('titulo', sql.NVarChar(200), titulo)
            .input('autor', sql.NVarChar(100), autor)
            .input('contenido', sql.NText, contenido)
            .input('imagen_url', sql.NVarChar(500), imagen_url)
            .input('link', sql.NVarChar(500), link)
            .input('fecha_publicacion', sql.DateTime, fechaPublicacionFinal)
            .input('fecha_expiracion', sql.DateTime, fechaExpiracionValida)
            .input('estado', sql.NVarChar(50), estado)
            .input('destacada', sql.Bit, Boolean(destacada))
            .query(`INSERT INTO Noticias (titulo, autor, contenido, imagen_url, link, fecha_publicacion, fecha_expiracion, estado, destacada) 
                  VALUES (@titulo, @autor, @contenido, @imagen_url, @link, @fecha_publicacion, @fecha_expiracion, @estado, @destacada)`);

        res.status(201).json({ message: `Noticia agregada con estado '${estado}'` });
    } catch (error) {
        console.error("Error al agregar noticia:", error.message);
        res.status(500).json({ message: "Error al agregar noticia", details: error.message });
    }
};

// ... (El resto de las funciones como editarNoticia, eliminarNoticia, etc., no necesitan cambios ya que dependen de getDbPool() que ahora está corregido)
export const editarNoticia = async (req, res) => {
    const { id } = req.params;
    const { titulo, autor, contenido, imagen_url = '', link, fecha_expiracion, estado, fecha_publicacion, destacada } = req.body;

    if (!titulo || !autor || !contenido || !link || !fecha_expiracion || !estado || typeof destacada === 'undefined' || (estado === 'publicado' && !fecha_publicacion)) {
        return res.status(400).json({ message: "Faltan campos obligatorios para editar." });
    }
    
    try {
        const pool = await getDbPool();
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
        
        if (result.rowsAffected[0] === 0) return res.status(404).json({ message: "Noticia no encontrada" });
        
        res.status(200).json({ message: `Noticia actualizada con estado '${estado}'` });
    } catch (error) {
        console.error("Error al editar noticia:", error.message);
        res.status(500).json({ message: "Error al editar noticia", details: error.message });
    }
};

export const publicarBorrador = async (req, res) => {
    const { id } = req.params;
    const fechaActualDePublicacion = new Date();
    try {
        const pool = await getDbPool();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .input('nuevoEstado', sql.NVarChar(50), 'publicado')
            .input('fecha_publicacion_actual', sql.DateTime, fechaActualDePublicacion)
            .query(`UPDATE Noticias 
                    SET estado = @nuevoEstado, fecha_publicacion = @fecha_publicacion_actual
                    WHERE id = @id AND estado = 'borrador'`);
        
        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ message: "Borrador no encontrado o ya está publicado." });
        }
        res.status(200).json({ message: "Noticia publicada correctamente desde borrador." });
    } catch (error) {
        console.error("Error al publicar borrador:", error.message);
        res.status(500).json({ message: "Error al publicar borrador", details: error.message });
    }
};

export const eliminarNoticia = async (req, res) => {
    const { id } = req.params;
    const pool = await getDbPool();
    const transaction = new sql.Transaction(pool);
    try {
        await transaction.begin();
        const noticiaResult = await transaction.request()
            .input('id', sql.Int, id)
            .query("SELECT imagen_url FROM Noticias WHERE id = @id");
        let imagen_url = (noticiaResult.recordset[0] || {}).imagen_url;

        const deleteDbResult = await transaction.request()
            .input('id', sql.Int, id)
            .query("DELETE FROM Noticias WHERE id = @id");
            
        if (deleteDbResult.rowsAffected[0] === 0) {
            await transaction.rollback();
            return res.status(404).json({ message: "Noticia no encontrada para eliminar." });
        }

        if (imagen_url) {
            try {
                const filename = path.basename(imagen_url);
                const filePath = path.join(UPLOADS_DIR, filename);
                await fs.unlink(filePath);
            } catch (fileError) {
                console.warn(`[Controller] Advertencia al eliminar archivo: ${fileError.message}`);
            }
        }
        await transaction.commit();
        res.status(200).json({ message: "Noticia eliminada exitosamente" });
    } catch (error) {
        await transaction.rollback();
        res.status(500).json({ message: "Error del servidor al eliminar noticia", details: error.message });
    }
};

export const eliminarNoticiasMultiples = async (req, res) => {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ message: "Se requiere un array de IDs." });
    }
    const pool = await getDbPool();
    const transaction = new sql.Transaction(pool);
    try {
        await transaction.begin();
        const request = transaction.request();
        const idPlaceholders = ids.map((id, index) => {
            const paramName = `id${index}`;
            request.input(paramName, sql.Int, id);
            return `@${paramName}`;
        }).join(',');

        const noticiasResult = await request.query(`SELECT imagen_url FROM Noticias WHERE id IN (${idPlaceholders})`);
        const imagenesAEliminar = noticiasResult.recordset.map(n => n.imagen_url).filter(Boolean);

        const deleteDbResult = await request.query(`DELETE FROM Noticias WHERE id IN (${idPlaceholders})`);
        
        for (const imagen_url of imagenesAEliminar) {
            try {
                const filename = path.basename(imagen_url);
                const filePath = path.join(UPLOADS_DIR, filename);
                await fs.unlink(filePath);
            } catch (fileError) {
                console.warn(`[Controller] Advertencia al eliminar archivo (múltiple): ${fileError.message}`);
            }
        }
        await transaction.commit();
        res.status(200).json({ message: `${deleteDbResult.rowsAffected[0]} noticias eliminadas.` });
    } catch (error) {
        await transaction.rollback();
        res.status(500).json({ message: "Error del servidor al eliminar noticias múltiples.", details: error.message });
    }
};

export const toggleFeatureNoticiaController = async (req, res) => {
    const { id } = req.params;
    const { destacada } = req.body;
    if (typeof destacada !== 'boolean') {
        return res.status(400).json({ message: "El campo 'destacada' debe ser booleano." });
    }
    try {
        const pool = await getDbPool();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .input('destacada', sql.Bit, destacada)
            .query("UPDATE Noticias SET destacada = @destacada WHERE id = @id");
        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ message: "Noticia no encontrada." });
        }
        res.status(200).json({ message: `Noticia ${destacada ? 'destacada' : 'no destacada'} correctamente.` });
    } catch (error) {
        console.error("Error al actualizar estado destacado:", error.message);
        res.status(500).json({ message: "Error al actualizar estado destacado", details: error.message });
    }
};