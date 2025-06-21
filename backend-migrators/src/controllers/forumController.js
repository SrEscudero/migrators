// src/controllers/forumController.js (VERSIÓN COMPLETA Y FINAL)

import { connectDB, sql } from '../config/db.js';
import logger from '../config/logger.js';

// --- FUNCIONES DE LECTURA (GET) ---
export const getAllForums = async (req, res) => {
  try {
    const pool = await connectDB();
    const result = await pool.request().query(`
      SELECT f.*, 
      (SELECT COUNT(*) FROM Threads WHERE forum_id = f.id) AS threadCount,
      (SELECT COUNT(*) FROM Posts p JOIN Threads t ON p.thread_id = t.id WHERE t.forum_id = f.id) AS postCount
      FROM Forums f ORDER BY f.titulo ASC
    `);
    res.status(200).json(result.recordset);
  } catch (error) {
    logger.error('Error al obtener foros: %s', error.message);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

export const getThreadsByForum = async (req, res) => {
  try {
    const { forumId } = req.params;
    const pool = await connectDB();
    const result = await pool.request().input('forumId', sql.Int, forumId)
      .query(`
        SELECT t.*, u.Nombre AS autorNombre,
        (SELECT COUNT(*) FROM Posts WHERE thread_id = t.id) AS replyCount
        FROM Threads t JOIN Usuarios u ON t.autor_id = u.id
        WHERE t.forum_id = @forumId ORDER BY t.fecha_creacion DESC
      `);
    res.status(200).json(result.recordset);
  } catch (error) {
    logger.error('Error al obtener hilos del foro %s: %s', req.params.forumId, error.message);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

export const getThreadAndPosts = async (req, res) => {
  const { threadId } = req.params;
  try {
    const pool = await connectDB();
    // No es necesaria una transacción para operaciones de solo lectura
    await pool.request().input('threadId', sql.Int, threadId).query('UPDATE Threads SET views = views + 1 WHERE id = @threadId');
    const threadResult = await pool.request().input('threadId', sql.Int, threadId).query(`SELECT t.*, u.Nombre AS autorNombre FROM Threads t JOIN Usuarios u ON t.autor_id = u.id WHERE t.id = @threadId`);
    const postsResult = await pool.request().input('threadId', sql.Int, threadId).query(`SELECT p.*, u.Nombre AS autorNombre FROM Posts p JOIN Usuarios u ON p.autor_id = u.id WHERE p.thread_id = @threadId ORDER BY p.fecha_creacion ASC`);
    if (threadResult.recordset.length === 0) {
      return res.status(404).json({ message: 'Hilo no encontrado.' });
    }
    res.status(200).json({
      thread: threadResult.recordset[0],
      posts: postsResult.recordset
    });
  } catch (error) {
    logger.error('Error al obtener el hilo y sus posts: %s', error.message);
    res.status(500).json({ message: 'Error del servidor' });
  }
};


// --- FUNCIONES DE CREACIÓN (POST) ---
export const createThread = async (req, res) => {
  const { titulo, contenido } = req.body;
  const { forumId } = req.params;
  const autor_id = req.user.id;
  if (!titulo || !contenido) {
    return res.status(400).json({ message: 'El título y el contenido son obligatorios.' });
  }
  try {
    const pool = await connectDB();
    const result = await pool.request()
      .input('titulo', sql.NVarChar, titulo)
      .input('contenido', sql.NText, contenido)
      .input('autor_id', sql.Int, autor_id)
      .input('forum_id', sql.Int, forumId)
      .query(`INSERT INTO Threads (titulo, contenido, autor_id, forum_id) OUTPUT INSERTED.* VALUES (@titulo, @contenido, @autor_id, @forum_id)`);
    res.status(201).json(result.recordset[0]);
  } catch (error) {
    logger.error('Error al crear el hilo: %s', error.message);
    res.status(500).json({ message: 'Error del servidor al crear el hilo.' });
  }
};

export const createPost = async (req, res) => {
  const { contenido } = req.body;
  const { threadId } = req.params;
  const autor_id = req.user.id;
  if (!contenido) {
    return res.status(400).json({ message: 'El contenido de la respuesta es obligatorio.' });
  }
  try {
    const pool = await connectDB();
    const result = await pool.request()
      .input('contenido', sql.NText, contenido)
      .input('autor_id', sql.Int, autor_id)
      .input('thread_id', sql.Int, threadId)
      .query(`INSERT INTO Posts (contenido, autor_id, thread_id) OUTPUT INSERTED.* VALUES (@contenido, @autor_id, @thread_id)`);
    res.status(201).json(result.recordset[0]);
  } catch (error) {
    logger.error('Error al crear el post: %s', error.message);
    res.status(500).json({ message: 'Error del servidor al crear el post.' });
  }
};


// --- FUNCIONES DE EDICIÓN (UPDATE/PUT) ---
export const updatePost = async (req, res) => {
  const { postId } = req.params;
  const { contenido } = req.body;
  const requestingUserId = req.user.id;
  const requestingUserRol = req.user.rol;
  if (!contenido) {
    return res.status(400).json({ message: 'El contenido no puede estar vacío.' });
  }
  try {
    const pool = await connectDB();
    const request = pool.request();
    const postResult = await request.input('postId', sql.Int, postId).query('SELECT autor_id FROM Posts WHERE id = @postId');
    if (postResult.recordset.length === 0) {
      return res.status(404).json({ message: 'Post no encontrado.' });
    }
    const autor_id = postResult.recordset[0].autor_id;
    if (autor_id !== requestingUserId && requestingUserRol !== 'ceo') {
      return res.status(403).json({ message: 'No tienes permiso para editar este post.' });
    }
    await request.input('newContenido', sql.NText, contenido).query('UPDATE Posts SET contenido = @newContenido WHERE id = @postId');
    res.status(200).json({ message: 'Respuesta actualizada con éxito.' });
  } catch (error) {
    logger.error('Error al actualizar el post %s: %s', postId, error.message);
    res.status(500).json({ message: 'Error del servidor al actualizar el post.' });
  }
};

// --- FUNCIONES DE ELIMINACIÓN (DELETE) ---
export const deleteThread = async (req, res) => {
  const { threadId } = req.params;
  const requestingUserId = req.user.id;
  const requestingUserRol = req.user.rol;
  try {
    const pool = await connectDB();
    const request = pool.request();
    const threadResult = await request.input('threadId', sql.Int, threadId).query('SELECT autor_id FROM Threads WHERE id = @threadId');
    if (threadResult.recordset.length === 0) {
      return res.status(404).json({ message: 'Hilo no encontrado.' });
    }
    const autor_id = threadResult.recordset[0].autor_id;
    if (autor_id !== requestingUserId && requestingUserRol !== 'ceo') {
      return res.status(403).json({ message: 'No tienes permiso para eliminar este hilo.' });
    }
    await request.query('DELETE FROM Threads WHERE id = @threadId');
    res.status(200).json({ message: 'Hilo eliminado con éxito.' });
  } catch (error) {
    logger.error('Error al eliminar el hilo %s: %s', threadId, error.message);
    res.status(500).json({ message: 'Error del servidor al eliminar el hilo.' });
  }
};

export const deletePost = async (req, res) => {
  const { postId } = req.params;
  const requestingUserId = req.user.id;
  const requestingUserRol = req.user.rol;
  try {
    const pool = await connectDB();
    const request = pool.request();
    const postResult = await request.input('postId', sql.Int, postId).query('SELECT autor_id FROM Posts WHERE id = @postId');
    if (postResult.recordset.length === 0) {
      return res.status(404).json({ message: 'Post no encontrado.' });
    }
    const autor_id = postResult.recordset[0].autor_id;
    if (autor_id !== requestingUserId && requestingUserRol !== 'ceo') {
      return res.status(403).json({ message: 'No tienes permiso para eliminar este post.' });
    }
    await request.query('DELETE FROM Posts WHERE id = @postId');
    res.status(200).json({ message: 'Respuesta eliminada con éxito.' });
  } catch (error) {
    logger.error('Error al eliminar el post %s: %s', postId, error.message);
    res.status(500).json({ message: 'Error del servidor al eliminar el post.' });
  }
};

// YA NO HAY UN BLOQUE `export { ... }` AL FINAL