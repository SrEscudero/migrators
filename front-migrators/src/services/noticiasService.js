import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL}/api/noticias`;

export const obtenerNoticias = async () => {
    try {
        const response = await axios.get(API_URL);
        return response.data || [];
    } catch (error) {
        console.error("❌ Error al obtener noticias Migrators:", error.message);
        return [];
    }
};