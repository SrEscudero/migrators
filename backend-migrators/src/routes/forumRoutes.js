// src/routes/forumRoutes.js (VERSIÓN COMPLETA)

import express from 'express';
import { 
  getAllForums, 
  getThreadsByForum, 
  getThreadAndPosts,
  createThread, 
  createPost,
  updatePost,
  deleteThread,
  deletePost
} from '../controllers/forumController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Rutas de Lectura (GET)
router.get('/', protect, getAllForums);
router.get('/:forumId/threads', protect, getThreadsByForum);
router.get('/threads/:threadId', protect, getThreadAndPosts);

// Rutas de Escritura (POST)
router.post('/:forumId/threads', protect, createThread);
router.post('/threads/:threadId/posts', protect, createPost);

// Rutas de Edición (PUT/PATCH)
router.put('/posts/:postId', protect, updatePost); // Usamos PUT para reemplazar el contenido

// Rutas de Eliminación (DELETE)
router.delete('/threads/:threadId', protect, deleteThread);
router.delete('/posts/:postId', protect, deletePost);

export default router;