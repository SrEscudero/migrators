// src/services/api.js (Este archivo debe existir)

import axios from 'axios';
import Swal from 'sweetalert2';
import { useAuthStore } from '@/stores/authStore';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Interceptor de Petición (añade el token a cada llamada)
apiClient.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore();
    const token = authStore.token;
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de Respuesta (maneja los errores globalmente)
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const authStore = useAuthStore();
    
    if (!error.response) {
      Swal.fire('Error de Conexión', 'No se pudo conectar con el servidor.', 'error');
      return Promise.reject(error);
    }

    const { status, data } = error.response;

    switch (status) {
      case 401:
        Swal.fire({
          title: 'Sesión Expirada',
          text: 'Tu sesión ha expirado. Por favor, inicia sesión de nuevo.',
          icon: 'warning',
          timer: 3000,
          timerProgressBar: true,
        }).then(() => {
          authStore.logout();
        });
        break;
      case 403:
        Swal.fire('Acceso Denegado', 'No tienes los permisos necesarios.', 'error');
        break;
      default:
        Swal.fire('Ocurrió un Error', data.message || 'Error inesperado en el servidor.', 'error');
        break;
    }

    return Promise.reject(error);
  }
);

export default apiClient;