import { statsRepository } from '../repositories/statsRepository.js';
import logger from '../config/logger.js';

/**
 * Función helper para manejar la lógica repetitiva de try/catch y respuesta.
 * @param {Function} repoMethod - El método del repositorio a ejecutar.
 * @param {Object} res - El objeto de respuesta de Express.
 * @param {string} errorMessage - Mensaje de error para el log y la respuesta.
 */
const handleStatsRequest = async (repoMethod, res, errorMessage) => {
    try {
        const data = await repoMethod();
        res.json(data);
    } catch (error) {
        logger.error(`${errorMessage}: %s`, error.message);
        res.status(500).json({ message: errorMessage, details: error.message });
    }
};

export const getStatsPorEstado = (req, res) => {
    handleStatsRequest(statsRepository.getStatsPorEstado, res, 'Error al obtener estadísticas por estado');
};

export const getStatsDestacadas = (req, res) => {
    handleStatsRequest(statsRepository.getStatsDestacadas, res, 'Error al obtener estadísticas de noticias destacadas');
};

export const getStatsPublicadasPorFecha = (req, res) => {
    handleStatsRequest(statsRepository.getStatsPublicadasPorFecha, res, 'Error al obtener estadísticas de publicaciones por fecha');
};

export const getStatsPorAutor = (req, res) => {
    handleStatsRequest(statsRepository.getStatsPorAutor, res, 'Error al obtener estadísticas por autor');
};