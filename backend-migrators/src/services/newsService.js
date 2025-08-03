// Archivo: backend-migrators/src/services/newsService.js (VERSIÓN CORREGIDA Y SEGURA)

import axios from 'axios';
import dotenv from 'dotenv';
import logger from '../config/logger.js'; // Usamos el logger para un mejor registro

// Carga las variables de entorno del archivo .env
dotenv.config();

// --- CONFIGURACIÓN SEGURA ---
// La configuración ya no se lee de un archivo JSON, sino que se define aquí.
// La API Key secreta se lee de forma segura desde las variables de entorno.
const newsApiUrl = 'https://newsapi.org/v2/everything';
const apiKey = process.env.NEWS_API_KEY; // <-- ¡CORREGIDO! Clave segura.
const defaultQuery = 'migrantes';
const backupQuery = 'refugiados';
const language = 'es';
const pageSize = 20; // Podemos pedir un poco más para tener variedad en el frontend.
const updateIntervalHours = 0.5;

// --- GESTIÓN DE CACHÉ ---
// Esta lógica se mantiene para mejorar el rendimiento y no abusar de la API externa.
let cachedNews = [];
let lastUpdated = null;

/**
 * Obtiene noticias de la API externa, gestionando una caché interna
 * para evitar llamadas repetidas.
 * @param {string | null} query - Término de búsqueda opcional.
 * @param {string | null} category - Categoría opcional.
 * @returns {Promise<Array>} - Un arreglo de artículos de noticias.
 */
export const fetchNews = async (query = null, category = null) => {
    // Verificar primero que la API Key esté configurada
    if (!apiKey) {
        logger.error('[newsService] ¡La variable de entorno NEWS_API_KEY no está configurada!');
        // Devolvemos un arreglo vacío para no romper la aplicación si la clave falta.
        return [];
    }

    try {
        const now = Date.now();
        const hoursInMs = updateIntervalHours * 60 * 60 * 1000;

        // Si no hay filtros personalizados y la caché es reciente, la devolvemos.
        if (!query && !category && cachedNews.length > 0 && lastUpdated && (now - lastUpdated < hoursInMs)) {
            logger.info('[newsService] Devolviendo noticias desde la caché.');
            return cachedNews;
        }

        // Si hay filtros, la llamada es específica y no debe usar la caché general.
        // Construimos los parámetros para la llamada a la API.
        const params = {
            q: query || defaultQuery,
            apiKey,
            language,
            pageSize
        };

        if (category) {
            params.category = category;
        }

        logger.info(`[newsService] Solicitando noticias externas con parámetros: ${JSON.stringify({q: params.q, category: params.category})}`);
        const response = await axios.get(newsApiUrl, { params });

        let articles = response.data.articles;

        // Lógica de respaldo si la consulta principal no devuelve resultados.
        if (!articles || articles.length === 0) {
            logger.warn(`[newsService] No se encontraron noticias para "${params.q}". Intentando con consulta de respaldo "${backupQuery}".`);
            const backupParams = { ...params, q: backupQuery };
            delete backupParams.category; // La consulta de respaldo es general.
            const backupResponse = await axios.get(newsApiUrl, { params: backupParams });
            articles = backupResponse.data.articles;
        }

        // Si no hay filtros, actualizamos la caché para futuras solicitudes.
        if (!query && !category) {
            logger.info(`[newsService] Actualizando la caché con ${articles.length} noticias.`);
            cachedNews = articles;
            lastUpdated = now;
        }

        return articles || []; // Aseguramos devolver siempre un array.

    } catch (error) {
        // Manejo de errores mejorado para dar más contexto.
        const errorMessage = error.response?.data?.message || error.message;
        logger.error(`[newsService] Error al obtener noticias externas: ${errorMessage}`);
        // En caso de error, es mejor devolver un array vacío que lanzar una excepción que rompa el flujo.
        return [];
    }
};