// src/services/clienteService.js
import axios from 'axios';

// La URL base de la API se obtiene de las variables de entorno de Vite
const API_URL = import.meta.env.VITE_API_URL;
const ADMIN_API_URL = `${API_URL}/api/admin`;

/**
 * Obtiene el token del localStorage para añadirlo a las cabeceras.
 * Esta función es crucial para todas las peticiones a rutas protegidas.
 */
const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    if (token) {
        return { Authorization: `Bearer ${token}` };
    }
    return {};
};

/**
 * Obtiene la lista de clientes.
 * La API devolverá todos los clientes si el token es de un CEO,
 * o solo los clientes asignados si el token es de un funcionario.
 * @returns {Promise<Array>} - La lista de clientes.
 */
export async function getClientes() {
    try {
        const response = await axios.get(`${ADMIN_API_URL}/clientes`, {
            headers: getAuthHeaders(),
        });
        return response.data;
    } catch (error) {
        console.error("Error en el servicio al obtener clientes:", error.response?.data?.message || error.message);
        throw new Error(error.response?.data?.message || 'Error al cargar los clientes.');
    }
}

/**
 * Asigna un cliente a un funcionario. (Solo CEO)
 * @param {number} clienteId - El ID del cliente a asignar.
 * @param {number} funcionarioId - El ID del funcionario que recibirá al cliente.
 * @returns {Promise<object>} - El mensaje de éxito del servidor.
 */
export async function asignarCliente(clienteId, funcionarioId) {
    try {
        const response = await axios.patch(`${ADMIN_API_URL}/clientes/${clienteId}/asignar`, 
            { funcionarioId }, // El funcionarioId va en el cuerpo de la petición
            {
                headers: getAuthHeaders(),
            }
        );
        return response.data;
    } catch (error) {
        console.error("Error en el servicio al asignar cliente:", error.response?.data?.message || error.message);
        throw new Error(error.response?.data?.message || 'Error al asignar el cliente.');
    }
}

/**
 * Actualiza el estado de un cliente. (CEO y Funcionario)
 * @param {number} clienteId - El ID del cliente a actualizar.
 * @param {string} estatus - El nuevo estado del cliente.
 * @returns {Promise<object>} - El mensaje de éxito del servidor.
 */
export async function actualizarEstatusCliente(clienteId, estatus) {
    try {
        const response = await axios.patch(`${ADMIN_API_URL}/clientes/${clienteId}/estatus`,
            { estatus }, // El nuevo estatus va en el cuerpo de la petición
            {
                headers: getAuthHeaders(),
            }
        );
        return response.data;
    } catch (error)
    {
        console.error("Error en el servicio al actualizar estado:", error.response?.data?.message || error.message);
        throw new Error(error.response?.data?.message || 'Error al actualizar el estado del cliente.');
    }
}