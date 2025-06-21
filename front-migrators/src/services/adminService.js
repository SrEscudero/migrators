// src/services/adminService.js (CORREGIDO)

import apiClient from './api.js'; // <-- CAMBIO

const ADMIN_API_URL = '/api/admin'; // <-- CAMBIO

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