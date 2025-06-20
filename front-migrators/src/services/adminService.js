// src/services/adminService.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;
const ADMIN_API_URL = `${API_URL}/api/admin`;

/**
 * Obtiene el token del localStorage para autorizar peticiones.
 */
const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * [CEO-only] Crea un nuevo usuario funcionario.
 * @param {object} funcionarioData - Datos del nuevo funcionario.
 * @returns {Promise<object>}
 */
export async function crearFuncionario(funcionarioData) {
    try {
        const response = await axios.post(`${ADMIN_API_URL}/funcionarios`, funcionarioData, {
            headers: getAuthHeaders(),
        });
        return response.data;
    } catch (error) {
        console.error("Error en el servicio al crear funcionario:", error.response?.data?.message || error.message);
        throw new Error(error.response?.data?.message || 'Error al crear el funcionario.');
    }
}

/**
 * [NUEVA FUNCIÓN AÑADIDA]
 * Obtiene la lista de todos los usuarios con rol 'funcionario'.
 * @returns {Promise<Array>}
 */
export async function obtenerFuncionarios() {
    try {
        const response = await axios.get(`${ADMIN_API_URL}/funcionarios`, {
            headers: getAuthHeaders(),
        });
        return response.data;
    } catch (error) {
        console.error("Error en el servicio al obtener funcionarios:", error.response?.data?.message || error.message);
        throw new Error(error.response?.data?.message || 'Error al obtener los funcionarios.');
    }
}