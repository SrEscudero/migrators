// src/composables/useAuth.js
import { ref, readonly } from 'vue';

// Estado reactivo para el usuario (privado al módulo)
const _user = ref(null);

// Función para decodificar el payload del token JWT
function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("Error al decodificar el token:", e);
    return null;
  }
}

// El composable que usarán tus componentes
export function useAuth() {
  const setUserFromToken = (token) => {
    if (token) {
      const payload = parseJwt(token);
      // El payload del token contiene la info (id, nombre, rol)
      _user.value = payload; 
    } else {
      _user.value = null;
    }
  };

  const login = (token) => {
    sessionStorage.setItem('token', token);
    setUserFromToken(token);
  };

  const logout = () => {
    sessionStorage.removeItem('token');
    _user.value = null;
  };

  // Función para verificar el estado al cargar la app
  const checkAuth = () => {
    const token = sessionStorage.getItem('token');
    setUserFromToken(token);
  };

  return {
    user: readonly(_user), // Exponemos como solo lectura para que no se modifique desde fuera
    login,
    logout,
    checkAuth
  };
}