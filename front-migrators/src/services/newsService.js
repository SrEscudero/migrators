// Archivo: front-migrators/src/services/newsService.js

import axios from 'axios';

// ¡CORREGIDO! Apunta a la ruta relativa que activará el proxy.
const API_BASE_URL = '/api/news';

export const fetchNews = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    if (filters.query) {
      params.append('q', filters.query);
    }
    if (filters.category) {
      params.append('category', filters.category);
    }

    const requestUrl = `${API_BASE_URL}?${params.toString()}`;
    console.log(`[Frontend Service] Petición a: ${requestUrl}`);

    const response = await axios.get(requestUrl);
    return response.data || [];
  } catch (error) {
    console.error('Error en newsService:', error.response?.data || error.message);
    return [];
  }
};