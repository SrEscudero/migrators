import express from 'express';
import { fetchNews } from '../services/newsService.js';

const router = express.Router();

// Endpoint para obtener noticias
router.get('/', async (req, res) => {
    try {
        const { q, category } = req.query;

        // Llamar al servicio fetchNews con los filtros
        const news = await fetchNews(q, category);

        // Enviar la respuesta
        res.json(news);
    } catch (error) {
        console.error('❌ Error en el endpoint /news:', error.message);
        res.status(500).json({ error: 'Error al obtener las noticias' });
    }
});

export default router;