// src/services/clienteService.js (CORREGIDO)

import apiClient from './api.js'; // <-- CAMBIO

const ADMIN_API_URL = '/api/admin'; // <-- CAMBIO

// CAMBIO: La función getAuthHeaders() ya no es necesaria.
// El interceptor de request se encarga de añadir el token automáticamente.

/**
 * Obtiene la lista de clientes.
 */
export async function getClientes() {
  // CAMBIO: Ya no se pasan las cabeceras manualmente
  const response = await apiClient.get(`${ADMIN_API_URL}/clientes`);
  return response.data;
}

/**
 * Asigna un cliente a un funcionario. (Solo CEO)
 */
export async function asignarCliente(clienteId, funcionarioId) {
  const response = await apiClient.patch(`${ADMIN_API_URL}/clientes/${clienteId}/asignar`, { funcionarioId });
  return response.data;
}

/**
 * Actualiza el estado de un cliente. (CEO y Funcionario)
 */
export async function actualizarEstatusCliente(clienteId, estatus) {
  const response = await apiClient.patch(`${ADMIN_API_URL}/clientes/${clienteId}/estatus`, { estatus });
  return response.data;
}


/**
 * [NUEVO] Elimina un cliente por su ID.
 */
export async function deleteCliente(clienteId) {
  // El interceptor de Axios ya maneja el token y los errores.
  const response = await apiClient.delete(`${ADMIN_API_URL}/clientes/${clienteId}`);
  return response.data;
}