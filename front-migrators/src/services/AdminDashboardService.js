import axios from "axios";

// La URL base que activará el proxy de Vite.
const API_BASE_URL = '/api/noticias';

// Obtener todas las noticias
export const obtenerNoticias = async () => {
  try {
    // Petición a: /api/noticias
    const response = await axios.get(API_BASE_URL);
    return response.data || [];
  } catch (error) {
    console.error("❌ Error al obtener noticias:", error.response?.data || error.message);
    throw error;
  }
};

// Agregar una nueva noticia
export const agregarNoticia = async (noticia) => {
  try {
    console.log('📦 Datos que se están enviando al backend:', JSON.stringify(noticia, null, 2));
    // Petición a: /api/noticias
    const response = await axios.post(API_BASE_URL, noticia);
    return response.data;
  } catch (error) {
    console.error("❌ Error al agregar noticia:", error.response?.data || error.message);
    throw error;
  }
};

// Editar una noticia
export const editarNoticia = async (id, noticia) => {
  try {
    // Petición a: /api/noticias/{id}
    const response = await axios.put(`${API_BASE_URL}/${id}`, noticia);
    return response.data;
  } catch (error) {
    console.error("❌ Error al editar noticia:", error.response?.data || error.message);
    throw error;
  }
};

// Eliminar una noticia
export const eliminarNoticia = async (id) => {
  try {
    // Petición a: /api/noticias/{id}
    const urlDeEliminacion = `${API_BASE_URL}/${id}`;
    console.log(`[Service] Intentando DELETE a: ${urlDeEliminacion}`);
    const response = await axios.delete(urlDeEliminacion);
    console.log('[Service] Respuesta de DELETE:', response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error al eliminar noticia (servicio):", error.response?.data || error.message);
    throw error;
  }
};

// Eliminar múltiples noticias
export const eliminarNoticiasMultiples = async (ids) => {
  try {
    // Petición a: /api/noticias/bulk-delete
    const urlBulkDelete = `${API_BASE_URL}/bulk-delete`;
    console.log(`[Service] Intentando POST a ${urlBulkDelete} con IDs:`, ids);
    const response = await axios.post(urlBulkDelete, { ids });
    console.log('[Service] Respuesta de POST bulk-delete:', response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error al eliminar múltiples noticias (servicio):", error.response?.data || error.message);
    throw error;
  }
};

// Publicar una noticia borrador
export const publicarNoticiaBorrador = async (id) => {
  try {
    // Petición a: /api/noticias/{id}/publicar
    const response = await axios.post(`${API_BASE_URL}/${id}/publicar`);
    return response.data;
  } catch (error) {
    console.error(`❌ Error en servicio al publicar la noticia borrador ${id}:`, error.response?.data || error.message);
    throw error.response?.data || new Error('Error de red o del servidor al publicar borrador');
  }
};

// Marcar/desmarcar como destacada
export const toggleFeatureNoticia = async (id, destacada) => {
  try {
    // Petición a: /api/noticias/{id}/feature
    const response = await axios.put(`${API_BASE_URL}/${id}/feature`, { destacada });
    return response.data;
  } catch (error) {
    console.error(`❌ Error en servicio al destacar/desdestacar noticia ${id}:`, error.response?.data || error.message);
    throw error.response?.data || new Error('Error de red o del servidor al destacar noticia');
  }
};