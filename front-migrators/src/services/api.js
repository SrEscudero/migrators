import axios from 'axios';
import Swal from 'sweetalert2';
import { useAuthStore } from '@/stores/authStore';

// Crea la instancia de Axios
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Permite que Axios envíe y reciba cookies httpOnly
});

// Interceptor de Petición (Request)
// Ya no es necesario para añadir el token, pero lo dejamos por si se necesita en el futuro.
apiClient.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de Respuesta (Response)
// Este interceptor maneja los errores de forma global.
apiClient.interceptors.response.use(
  (response) => {
    // Si la respuesta es exitosa, simplemente la devuelve.
    return response;
  },
  (error) => {
    // Si el error es 401 (No autorizado), significa que la sesión expiró.
    if (error.response && error.response.status === 401) {
      const authStore = useAuthStore();
      
      // Solo ejecuta el logout si el usuario estaba previamente autenticado en el frontend.
      // Esto evita bucles de logout si el error 401 ocurre por otras razones.
      if (authStore.isAuthenticated) {
        Swal.fire({
          title: 'Sesión Expirada',
          text: 'Tu sesión ha expirado. Por favor, inicia sesión de nuevo.',
          icon: 'warning',
          confirmButtonColor: '#1D3557',
        }).then(() => {
          // Llama a la acción de logout del store, que limpiará el estado y redirigirá.
          authStore.logout();
        });
      }
    } else {
      // Para otros errores (500, 404, etc.), muestra un mensaje genérico.
      const errorMessage = error.response?.data?.message || error.message || 'Ocurrió un error inesperado.';
      Swal.fire({
        title: 'Error',
        text: errorMessage,
        icon: 'error',
        confirmButtonColor: '#d33',
      });
    }

    // Rechaza la promesa para que el error pueda ser capturado por el código que hizo la llamada.
    return Promise.reject(error);
  }
);

export default apiClient;