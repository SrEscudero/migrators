// src/services/newsService.js (CORREGIDO)

import apiClient from './api.js'; // <-- CAMBIO

const API_URL = '/api/news'; // <-- CAMBIO: Apunta al proxy de noticias externas

// Obtiene noticias externas aplicando filtros
export const getExternalNews = async (filters) => {
  const response = await apiClient.get(API_URL, {
    params: {
      q: filters.query,
      category: filters.category,
    },
  });
  return response.data || [];
};