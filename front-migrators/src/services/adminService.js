// src/services/adminService.js (COMPLETO Y CORREGIDO)

import apiClient from './api.js';

const ADMIN_API_URL = '/api/admin';

// --- GESTIÓN DE FUNCIONARIOS ---

// [CEO-only] Crea un nuevo usuario funcionario.
export async function crearFuncionario(funcionarioData) {
  const response = await apiClient.post(`${ADMIN_API_URL}/funcionarios`, funcionarioData);
  return response.data;
}

// Obtiene la lista de todos los usuarios con rol 'funcionario'.
export async function obtenerFuncionarios() {
  const response = await apiClient.get(`${ADMIN_API_URL}/funcionarios`);
  return response.data;
}

// [CEO-only] Actualiza un funcionario existente.
export async function actualizarFuncionario(id, funcionarioData) {
  const response = await apiClient.put(`${ADMIN_API_URL}/funcionarios/${id}`, funcionarioData);
  return response.data;
}

// [CEO-only] Elimina un funcionario.
export async function eliminarFuncionario(id) {
  const response = await apiClient.delete(`${ADMIN_API_URL}/funcionarios/${id}`);
  return response.data;
}


// --- GESTIÓN DE CLIENTES (AÑADIDO) ---

// Obtiene la lista completa de clientes.
export async function getClientes() {
    const response = await apiClient.get(`${ADMIN_API_URL}/clientes`);
    return response.data;
}

// Crea un nuevo cliente desde el panel de admin.
export async function createClienteAdmin(clienteData) {
    const response = await apiClient.post(`${ADMIN_API_URL}/clientes`, clienteData);
    return response.data;
}

// Actualiza un cliente existente desde el panel de admin.
export async function updateClienteAdmin(id, clienteData) {
    const response = await apiClient.put(`${ADMIN_API_URL}/clientes/${id}`, clienteData);
    return response.data;
}

// Elimina un cliente.
export async function deleteCliente(id) {
    const response = await apiClient.delete(`${ADMIN_API_URL}/clientes/${id}`);
    return response.data;
}

// Asigna un cliente a un funcionario.
export async function asignarCliente(clienteId, funcionarioId) {
    const response = await apiClient.patch(`${ADMIN_API_URL}/clientes/${clienteId}/asignar`, { funcionarioId });
    return response.data;
}