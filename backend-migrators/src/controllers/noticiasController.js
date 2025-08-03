import { noticiaRepository } from '../repositories/noticiaRepository.js';
import logger from '../config/logger.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB, sql } from '../config/db.js';

// Setup para obtener la ruta del directorio actual en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_DIR = path.join(__dirname, '..', '..', 'public', 'uploads');

export const obtenerNoticias = async (req, res) => {
    try {
        const noticias = await noticiaRepository.findAll();
        res.json(noticias);
    } catch (error) {
        logger.error("Error en obtenerNoticias (admin): %s", error.message);
        res.status(500).json({ message: "Error al obtener noticias para admin", details: error.message });
    }
};

export const obtenerNoticiasPublicas = async (req, res) => {
    try {
        const noticias = await noticiaRepository.findPublicas();
        res.json(noticias);
    } catch (error) {
        logger.error("Error en obtenerNoticiasPublicas: %s", error.message);
        res.status(500).json({ message: "Error al obtener noticias públicas", details: error.message });
    }
};

export const agregarNoticia = async (req, res) => {
    const noticiaData = req.body;
    
    // Validación de campos obligatorios
    const requiredFields = ['titulo', 'autor', 'contenido', 'link', 'fecha_expiracion', 'estado'];
    for (const field of requiredFields) {
        if (!noticiaData[field] || String(noticiaData[field]).trim() === '') {
            return res.status(400).json({ message: `El campo '${field}' es obligatorio.` });
        }
    }

    try {
        const nuevaNoticia = await noticiaRepository.create(noticiaData);
        logger.info(`Noticia '${nuevaNoticia.titulo}' agregada con ID: ${nuevaNoticia.id}`);
        res.status(201).json({ message: `Noticia agregada correctamente con estado '${nuevaNoticia.estado}'.` });
    } catch (error) {
        logger.error(`Error al agregar noticia: ${error.message}`);
        res.status(500).json({ message: "Error del servidor al agregar la noticia.", details: error.message });
    }
};

export const editarNoticia = async (req, res) => {
    const { id } = req.params;
    const noticiaData = req.body;

    // Validación similar a la de agregar
    const requiredFields = ['titulo', 'autor', 'contenido', 'link', 'fecha_expiracion', 'estado'];
    for (const field of requiredFields) {
        if (noticiaData[field] === undefined || String(noticiaData[field]).trim() === '') {
            return res.status(400).json({ message: `El campo '${field}' no puede estar vacío.` });
        }
    }

    try {
        const rowsAffected = await noticiaRepository.update(id, noticiaData);
        if (rowsAffected === 0) {
            return res.status(404).json({ message: "Noticia no encontrada" });
        }
        res.status(200).json({ message: `Noticia actualizada con estado '${noticiaData.estado}'` });
    } catch (error) {
        logger.error("Error al editar noticia %s: %s", id, error.message);
        res.status(500).json({ message: "Error al editar noticia", details: error.message });
    }
};

export const publicarBorrador = async (req, res) => {
    const { id } = req.params;
    try {
        const rowsAffected = await noticiaRepository.publishDraft(id);
        if (rowsAffected === 0) {
            return res.status(404).json({ message: "Borrador no encontrado o ya está publicado." });
        }
        res.status(200).json({ message: "Noticia publicada correctamente desde borrador." });
    } catch (error) {
        logger.error("Error al publicar borrador %s: %s", id, error.message);
        res.status(500).json({ message: "Error al publicar borrador", details: error.message });
    }
};

export const eliminarNoticia = async (req, res) => {
    const { id } = req.params;
    
    // La transacción se maneja aquí en el controlador porque involucra
    // tanto la base de datos como el sistema de archivos.
    const pool = await connectDB();
    const transaction = new sql.Transaction(pool);
    try {
        await transaction.begin();

        const noticia = await noticiaRepository.findById(id); 
        if (!noticia) {
            await transaction.rollback();
            return res.status(404).json({ message: "Noticia no encontrada para eliminar." });
        }
        
        // El repositorio no necesita saber de transacciones
        const requestConTransaccion = new sql.Request(transaction);
        await requestConTransaccion.input('id', sql.Int, id).query("DELETE FROM Noticias WHERE id = @id");
        
        if (noticia.imagen_url && !noticia.imagen_url.startsWith('http')) {
            try {
                const filename = path.basename(noticia.imagen_url);
                const filePath = path.join(UPLOADS_DIR, filename);
                await fs.unlink(filePath);
                logger.info(`Archivo de imagen eliminado: ${filePath}`);
            } catch (fileError) {
                // No detenemos la operación si falla la eliminación del archivo, solo lo advertimos
                logger.warn(`Advertencia al eliminar archivo: ${fileError.message}`);
            }
        }
        
        await transaction.commit();
        res.status(200).json({ message: "Noticia eliminada exitosamente" });
    } catch (error) {
        if (transaction) await transaction.rollback();
        logger.error("Error al eliminar noticia %s: %s", id, error.message);
        res.status(500).json({ message: "Error del servidor al eliminar noticia", details: error.message });
    }
};

export const eliminarNoticiasEnLote = async (req, res) => {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ message: "Se requiere un array de IDs." });
    }

    try {
        // Obtenemos la información de las noticias ANTES de borrarlas para saber qué archivos eliminar
        const noticias = await noticiaRepository.findManyByIds(ids);
        if (noticias.length === 0) {
            return res.status(404).json({ message: 'No se encontró ninguna noticia con los IDs proporcionados.' });
        }

        const imagenesAEliminar = noticias
            .map(n => n.imagen_url)
            .filter(url => url && !url.startsWith('http'));

        const deletedCount = await noticiaRepository.deleteManyByIds(ids);

        // Eliminamos los archivos asociados después de confirmar la eliminación en la DB
        for (const imagen_url of imagenesAEliminar) {
             try {
                const filename = path.basename(imagen_url);
                const filePath = path.join(UPLOADS_DIR, filename);
                await fs.unlink(filePath);
            } catch (fileError) {
                logger.warn(`Advertencia al eliminar archivo (múltiple): ${fileError.message}`);
            }
        }
        
        res.status(200).json({ message: `${deletedCount} noticias han sido eliminadas exitosamente.` });
    } catch (error) {
        logger.error('Error al eliminar noticias en lote: %s', error.message);
        res.status(500).json({ message: 'Error del servidor al eliminar las noticias.' });
    }
};

export const toggleFeatureNoticiaController = async (req, res) => {
    const { id } = req.params;
    const { destacada } = req.body;
    if (typeof destacada !== 'boolean') {
        return res.status(400).json({ message: "El campo 'destacada' debe ser booleano." });
    }
    try {
        const rowsAffected = await noticiaRepository.toggleFeature(id, destacada);
        if (rowsAffected === 0) {
            return res.status(404).json({ message: "Noticia no encontrada." });
        }
        res.status(200).json({ message: `Noticia ${destacada ? 'destacada' : 'no destacada'} correctamente.` });
    } catch (error) {
        logger.error("Error al actualizar estado destacado para ID %s: %s", id, error.message);
        res.status(500).json({ message: "Error al actualizar estado destacado", details: error.message });
    }
};