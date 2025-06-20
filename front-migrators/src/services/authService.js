import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL}/api/usuarios`;

/**
 * Inicia sesión de un usuario.
 * @param {object} credentials - { email, password }
 * @returns {Promise<object>} - La respuesta completa de la API con { user, token }.
 */
export async function login(credentials) {
    try {
        const response = await axios.post(`${API_URL}/login`, credentials);
        // Devuelve toda la data para que el store la maneje
        return response.data;
    } catch (error) {
        console.error("Error en el servicio de login:", error.response?.data?.message || error.message);
        throw new Error(error.response?.data?.message || 'Error al iniciar sesión.');
    }
}

/**
 * Registra un nuevo cliente.
 * @param {object} userData - { nombre, email, password, celular, ... }
 * @returns {Promise<object>} - La respuesta del servidor.
 */
export async function register(userData) {
    try {
        // 'registro' fue el endpoint que usaste, lo cambiamos a '/register' por consistencia
        const response = await axios.post(`${API_URL}/register`, userData);
        return response.data;
    } catch (error) {
        console.error("Error en el servicio de registro:", error.response?.data?.message || error.message);
        throw new Error(error.response?.data?.message || 'Error al registrarse.');
    }
}

// Nota: La función logout y el manejo de estado han sido movidos al authStore.