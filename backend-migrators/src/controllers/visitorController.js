// Archivo: backend-migrators/src/controllers/visitorController.js

import { visitanteRepository } from '../repositories/visitanteRepository.js';
import logger from '../config/logger.js';

/**
 * Obtiene el historial completo de visitantes.
 * Solo accesible para el rol 'ceo'.
 */
export const getVisitorHistory = async (req, res) => {
    try {
        // Llama al repositorio para obtener todos los registros de visitantes
        const visitors = await visitanteRepository.findAll();
        res.status(200).json(visitors);
    } catch (error) {
        logger.error('Error al obtener el historial de visitantes: %s', error.message);
        res.status(500).json({ message: 'Error al obtener el historial de visitantes.' });
    }
};