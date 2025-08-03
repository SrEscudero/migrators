import axios from 'axios';
import logger from '../config/logger.js';

// La URL base de la API de ipquery.io
const API_URL = 'https://api.ipquery.io/';

/**
 * Enriquece una dirección IP usando la API gratuita de ipquery.io.
 * @param {string} ipAddress - La dirección IP a consultar.
 * @returns {Promise<Object|null>} Un objeto con los datos enriquecidos o null si hay un error.
 */
export const enrichIpData = async (ipAddress) => {
    try {
        // Hacemos la llamada a la API como indica la documentación: https://api.ipquery.io/1.1.1.1
        const response = await axios.get(`${API_URL}${ipAddress}`);

        // Verificamos que la respuesta contenga datos
        if (response.data && response.data.ip) {
            const data = response.data;
            
            // Mapeamos la respuesta de ipquery.io a los nombres de las columnas de nuestra base de datos
            const enrichedData = {
                pais: data.location?.country_code || null,
                ciudad: data.location?.city || null,
                isp: data.isp?.isp || null,
                is_proxy: data.risk?.is_proxy || false,
                is_vpn: data.risk?.is_vpn || false,
                is_tor: data.risk?.is_tor || false,
                // ipquery.io lo llama risk_score, nuestra tabla lo llama fraud_score
                fraud_score: data.risk?.risk_score || 0 
            };
            
            return enrichedData;
        }
        
        logger.warn(`[ipLookupService] La respuesta de ipquery.io para la IP ${ipAddress} no fue válida.`);
        return null;

    } catch (error) {
        // Si la API falla, registramos el error pero no detenemos la aplicación
        const errorMessage = error.response?.data?.message || error.message;
        logger.error(`[ipLookupService] Error al consultar la IP ${ipAddress}: ${errorMessage}`);
        return null;
    }
};