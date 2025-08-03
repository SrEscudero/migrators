import { forumRepository } from '../repositories/forumRepository.js';
import { usuarioRepository } from '../repositories/usuarioRepository.js';
import logger from '../config/logger.js';
import { connectDB, sql } from '../config/db.js';

export const getAllForums = async (req, res) => {
    try {
        const forums = await forumRepository.getAllForumsWithCounts();
        res.status(200).json(forums);
    } catch (error) {
        logger.error('Error al obtener foros: %s', error.message);
        res.status(500).json({ message: 'Error del servidor' });
    }
};

export const getThreadsByForum = async (req, res) => {
    try {
        const { forumId } = req.params;
        const threads = await forumRepository.getThreadsByForumId(forumId);
        res.status(200).json(threads);
    } catch (error) {
        logger.error('Error al obtener hilos del foro %s: %s', req.params.forumId, error.message);
        res.status(500).json({ message: 'Error del servidor' });
    }
};

export const getThreadAndPosts = async (req, res) => {
    const { threadId } = req.params;
    try {
        // Ejecutamos las operaciones en paralelo para mayor eficiencia
        const [thread, posts, _] = await Promise.all([
            forumRepository.getThreadById(threadId),
            forumRepository.getPostsByThreadId(threadId),
            forumRepository.incrementThreadView(threadId)
        ]);

        if (!thread) {
            return res.status(404).json({ message: 'Hilo no encontrado.' });
        }
        
        res.status(200).json({ thread, posts });
    } catch (error) {
        logger.error('Error al obtener el hilo y sus posts: %s', error.message);
        res.status(500).json({ message: 'Error del servidor' });
    }
};

export const createThread = async (req, res) => {
    const { titulo, contenido } = req.body;
    const { forumId } = req.params;
    const autor_id = req.user.id;
    if (!titulo || !contenido) {
        return res.status(400).json({ message: 'El título y el contenido son obligatorios.' });
    }
    try {
        const newThread = await forumRepository.createThread({
            titulo, contenido, autor_id, forum_id: forumId
        });
        res.status(201).json(newThread);
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
        const newPost = await forumRepository.createPost({
            contenido, autor_id, thread_id: threadId
        });
        // Podríamos enriquecer el objeto devuelto con el nombre del autor
        const author = await usuarioRepository.findById(autor_id);
        const responsePost = { ...newPost, autorNombre: author.Nombre };

        res.status(201).json(responsePost);
    } catch (error) {
        logger.error('Error al crear el post: %s', error.message);
        res.status(500).json({ message: 'Error del servidor al crear el post.' });
    }
};

// --- PENDIENTE ---
// Los métodos de update y delete para hilos y posts seguirían un patrón similar,
// llamando a los métodos correspondientes del repositorio y añadiendo lógica de permisos.
// Por brevedad, no los incluyo aquí, pero la estructura sería idéntica a los demás.
export const updatePost = async (req, res) => {
    // Implementación futura usando forumRepository.updatePost(postId, contenido)...
    res.status(501).json({ message: 'No implementado' });
}
export const deleteThread = async (req, res) => {
    // Implementación futura usando forumRepository.deleteThread(threadId)...
    res.status(501).json({ message: 'No implementado' });
}
export const deletePost = async (req, res) => {
    // Implementación futura usando forumRepository.deletePost(postId)...
    res.status(501).json({ message: 'No implementado' });
}