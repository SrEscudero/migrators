// src/services/noticiasService.js (CORREGIDO)

import apiClient from './api.js'; // <-- CAMBIO

const API_URL = '/api/noticias'; // <-- CAMBIO

export const obtenerNoticias = async () => {
  // El interceptor se encargará de cualquier error de red o del servidor
  const response = await apiClient.get(`${API_URL}/publicas`);
  return response.data || [];
};

/**
 * [CORREGIDO] Elimina una o más noticias enviando un array de IDs.
 * Llama al endpoint POST /api/noticias/bulk-delete que tienes en tu backend.
 * @param {number[]} ids - Un array con los IDs de las noticias a eliminar.
 * @returns {Promise<object>}
 */
export async function deleteNoticias(ids) {
  if (!ids || ids.length === 0) {
    throw new Error('No se proporcionaron IDs para eliminar.');
  }

  // Hacemos un POST a la ruta correcta y enviamos los IDs en el cuerpo.
  const response = await apiClient.post(`${NOTICIAS_API_URL}/bulk-delete`, {
    ids: ids  // El backend espera un objeto { ids: [...] }
  });

  return response.data;
}