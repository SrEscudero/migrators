import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';

// Obtener __dirname en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ruta correcta para leer el JSON
const configPath = path.resolve(__dirname, '../../config/config_noticias.json');

// Verificar si el archivo existe
if (!fs.existsSync(configPath)) {
    throw new Error(`Archivo de configuración no encontrado: ${configPath}`);
}

// Leer configuración desde el archivo JSON
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

// Variables de configuración
const {
    newsApiUrl,
    apiKey,
    query: defaultQuery,
    backupQuery,
    language,
    pageSize,
    updateIntervalHours
} = config;

// Variables para caché
let cachedNews = [];
let lastUpdated = null;

// Función para obtener noticias
export const fetchNews = async (query = null, category = null) => {
    try {
        // Verificar si las noticias en caché están actualizadas
        const now = Date.now();
        const hoursInMs = updateIntervalHours * 60 * 60 * 1000;

        if (cachedNews.length > 0 && lastUpdated && now - lastUpdated < hoursInMs) {
            console.log('Usando noticias en caché...');
            return cachedNews;
        }

        // Construir parámetros
        const params = {
            q: query || defaultQuery,
            apiKey,
            language,
            pageSize
        };

        if (category) {
            params.category = category;
        }

        console.log('Parámetros de la solicitud:', params); // Depuración

        // Hacer la solicitud a la API externa
        const response = await axios.get(newsApiUrl, { params });

        // Si no hay resultados, intentar con backupQuery
        let articles = response.data.articles;
        if (!articles || articles.length === 0) {
            console.log('No hay resultados, usando la consulta de respaldo...');
            const backupParams = {
                q: backupQuery,
                apiKey,
                language,
                pageSize
            };
            const backupResponse = await axios.get(newsApiUrl, { params: backupParams });
            articles = backupResponse.data.articles;
        }

        // Actualizar caché
        cachedNews = articles;
        lastUpdated = now;

        return articles;
    } catch (error) {
        console.error('❌ Error obteniendo noticias:', error.response?.data || error.message);
        return [];
    }
};