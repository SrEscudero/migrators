// front-migrators/src/stores/authStore.js

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import Swal from 'sweetalert2';
import { login as loginService, register as registerService } from '@/services/authService';
import apiClient from '@/services/api'; // Se importa para llamar al endpoint de logout

export const useAuthStore = defineStore('auth', () => {
    // --- ESTADO (STATE) ---
    // El 'user' se recupera de localStorage para mantener el estado del UI al recargar la página.
    // El token ya no se gestiona aquí.
    const user = ref(JSON.parse(localStorage.getItem('user')));
    const router = useRouter();

    // --- GETTERS (COMPUTED) ---
    // El usuario está autenticado si su objeto existe en el store.
    const isAuthenticated = computed(() => !!user.value);
    const userRole = computed(() => (user.value ? user.value.rol : null));
    const isAdmin = computed(() => userRole.value === 'ceo' || userRole.value === 'funcionario');

    // --- ACCIONES (ACTIONS) ---

    /**
     * Guarda los datos del usuario en el store y en localStorage.
     * @param {object} userData - El objeto del usuario recibido del backend.
     */
    function setAuthData(userData) {
        user.value = userData;
        localStorage.setItem('user', JSON.stringify(userData));
    }

    /**
     * Limpia los datos de autenticación del store y de localStorage.
     */
    function clearAuthData() {
        user.value = null;
        localStorage.removeItem('user');
    }

    /**
     * Maneja el proceso de login. Llama al servicio, guarda los datos del usuario
     * y redirige según el rol.
     * @param {object} credentials - { email, password }
     */
    async function login(credentials) {
        try {
            const data = await loginService(credentials);
            if (data.user) {
                setAuthData(data.user);

                // Redirección centralizada después del login
                if (isAdmin.value) {
                    router.push('/admin');
                } else {
                    router.push('/');
                }
            }
            return true;
        } catch (error) {
            clearAuthData();
            // El interceptor de Axios ya muestra un Swal, pero relanzamos el error
            // por si el componente de login necesita reaccionar (ej. mostrar un mensaje local).
            throw error;
        }
    }

    /**
     * Wrapper para la acción de registro de un nuevo usuario.
     * @param {object} userData - Datos para el registro.
     */
    async function register(userData) {
        return await registerService(userData);
    }

    /**
     * Cierra la sesión. Llama al endpoint del backend para que borre la cookie httpOnly
     * y luego limpia el estado del frontend.
     */
    async function logout() {
        try {
            // Llama al backend para que invalide la cookie
            await apiClient.post('/api/usuarios/logout');
        } catch (error) {
            // Aunque falle la llamada al backend (ej. por pérdida de conexión),
            // es importante limpiar el estado del frontend para que el usuario vea
            // que la sesión se ha cerrado en la interfaz.
            logger.error("Error en la llamada al backend para logout:", error);
        } finally {
            clearAuthData();
            Swal.fire({
                toast: true,
                icon: 'info',
                title: 'Has cerrado sesión.',
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000
            });
            router.push('/acceder');
        }
    }

    // Añade esta función dentro de tu useAuthStore
    function updateUser(newUserData) {
        // Fusiona los nuevos datos con los existentes
        const updatedUser = { ...user.value, ...newUserData };
        user.value = updatedUser;
        localStorage.setItem('user', JSON.stringify(updatedUser));
    }

    return {
        // State
        user,
        // Getters
        isAuthenticated,
        userRole,
        isAdmin,
        // Actions
        login,
        register,
        logout,
        updateUser,
    };
});