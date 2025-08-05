// Archivo completo: src/controllers/forumController.js

import { forumRepository } from '../repositories/forumRepository.js';
import { usuarioRepository } from '../repositories/usuarioRepository.js';
import logger from '../config/logger.js';

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
        const [thread, posts] = await Promise.all([
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
        const newThreadData = await forumRepository.createThread({
            titulo, contenido, autor_id, forum_id: forumId
        });
        const author = await usuarioRepository.findById(autor_id);
        const responseThread = { ...newThreadData, autorNombre: author.Nombre, replyCount: 0 };
        res.status(201).json(responseThread);
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
        const author = await usuarioRepository.findById(autor_id);
        const responsePost = { ...newPost, autorNombre: author.Nombre };

        res.status(201).json(responsePost);
    } catch (error) {
        logger.error('Error al crear el post: %s', error.message);
        res.status(500).json({ message: 'Error del servidor al crear el post.' });
    }
};

export const updatePost = async (req, res) => {
    const { postId } = req.params;
    const { contenido } = req.body;
    const currentUser = req.user;

    if (!contenido) {
        return res.status(400).json({ message: 'El contenido no puede estar vacío.' });
    }

    try {
        const post = await forumRepository.findPostById(postId);

        if (!post) {
            return res.status(404).json({ message: 'Publicación no encontrada.' });
        }

        // --- ¡VERIFICACIÓN DE SEGURIDAD CLAVE! ---
        if (post.autor_id !== currentUser.id && currentUser.rol !== 'ceo') {
            logger.warn(`Intento de edición no autorizado del post ${postId} por el usuario ${currentUser.id}`);
            return res.status(403).json({ message: 'No tienes permiso para editar esta publicación.' });
        }

        await forumRepository.updatePost(postId, contenido);
        res.status(200).json({ message: 'Publicación actualizada correctamente.' });

    } catch (error) {
        logger.error('Error al actualizar el post %s: %s', postId, error.message);
        res.status(500).json({ message: 'Error del servidor al actualizar la publicación.' });
    }
};

export const deleteThread = async (req, res) => {
    const { threadId } = req.params;
    const currentUser = req.user;

    try {
        const thread = await forumRepository.getThreadById(threadId);

        if (!thread) {
            return res.status(404).json({ message: 'Hilo no encontrado.' });
        }

        // --- ¡VERIFICACIÓN DE SEGURIDAD CLAVE! ---
        if (thread.autor_id !== currentUser.id && currentUser.rol !== 'ceo') {
            logger.warn(`Intento de borrado no autorizado del hilo ${threadId} por el usuario ${currentUser.id}`);
            return res.status(403).json({ message: 'No tienes permiso para borrar este hilo.' });
        }
        
        await forumRepository.deleteThread(threadId);
        res.status(200).json({ message: 'Hilo eliminado correctamente.' });

    } catch (error) {
        logger.error('Error al eliminar el hilo %s: %s', threadId, error.message);
        res.status(500).json({ message: 'Error del servidor al eliminar el hilo.' });
    }
};

export const deletePost = async (req, res) => {
    const { postId } = req.params;
    const currentUser = req.user;

    try {
        const post = await forumRepository.findPostById(postId);

        if (!post) {
            return res.status(404).json({ message: 'Publicación no encontrada.' });
        }

        // --- ¡VERIFICACIÓN DE SEGURIDAD CLAVE! ---
        if (post.autor_id !== currentUser.id && currentUser.rol !== 'ceo') {
            logger.warn(`Intento de borrado no autorizado del post ${postId} por el usuario ${currentUser.id}`);
            return res.status(403).json({ message: 'No tienes permiso para borrar esta publicación.' });
        }
        
        await forumRepository.deletePost(postId);
        res.status(200).json({ message: 'Publicación eliminada correctamente.' });

    } catch (error) {
        logger.error('Error al eliminar el post %s: %s', postId, error.message);
        res.status(500).json({ message: 'Error del servidor al eliminar la publicación.' });
    }
};