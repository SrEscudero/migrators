// src/services/authService.js (CORREGIDO)

import apiClient from './api.js'; // <-- CAMBIO: Usamos apiClient en lugar de axios

const API_URL = '/api/usuarios'; // <-- CAMBIO: Solo la ruta relativa

/**
 * Inicia sesión de un usuario.
 * @param {object} credentials - { email, password }
 * @returns {Promise<object>}
 */
export async function login(credentials) {
  // CAMBIO: Ya no necesitamos try/catch. El interceptor maneja los errores.
  const response = await apiClient.post(`${API_URL}/login`, credentials);
  return response.data;
}

/**
 * Registra un nuevo cliente.
 * @param {object} userData - { nombre, email, password, celular, ... }
 * @returns {Promise<object>}
 */
export async function register(userData) {
  const response = await apiClient.post(`${API_URL}/register`, userData);
  return response.data;
}