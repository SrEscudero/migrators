// src/services/AdminDashboardService.js (CORREGIDO)

import apiClient from "./api.js"; // <-- CAMBIO

// La URL base que activará el proxy de Vite.
const API_URL = '/api/noticias'; // <-- CAMBIO

// Obtener todas las noticias
export const obtenerNoticias = async () => {
  const response = await apiClient.get(API_URL);
  return response.data || [];
};

// Agregar una nueva noticia
export const agregarNoticia = async (noticia) => {
  const response = await apiClient.post(API_URL, noticia);
  return response.data;
};

// Editar una noticia
export const editarNoticia = async (id, noticia) => {
  const response = await apiClient.put(`${API_URL}/${id}`, noticia);
  return response.data;
};

// Eliminar una noticia
export const eliminarNoticia = async (id) => {
  const response = await apiClient.delete(`${API_URL}/${id}`);
  return response.data;
};

// Eliminar múltiples noticias
export const eliminarNoticiasMultiples = async (ids) => {
  const response = await apiClient.post(`${API_URL}/bulk-delete`, { ids });
  return response.data;
};

// Publicar una noticia borrador
export const publicarNoticiaBorrador = async (id) => {
  const response = await apiClient.post(`${API_URL}/${id}/publicar`);
  return response.data;
};

// Marcar/desmarcar como destacada
export const toggleFeatureNoticia = async (id, destacada) => {
  const response = await apiClient.put(`${API_URL}/${id}/feature`, { destacada });
  return response.data;
};