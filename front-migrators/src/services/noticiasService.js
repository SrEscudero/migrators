// src/services/noticiasService.js (CORREGIDO)

import apiClient from './api.js'; // <-- CAMBIO

const API_URL = '/api/noticias'; // <-- CAMBIO

export const obtenerNoticias = async () => {
  // El interceptor se encargará de cualquier error de red o del servidor
  const response = await apiClient.get(`${API_URL}/publicas`);
  return response.data || [];
};