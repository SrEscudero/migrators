import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { login as loginService, register as registerService } from '@/services/authService';
import Swal from 'sweetalert2';

export const useAuthStore = defineStore('auth', () => {
    // --- STATE ---
    // Inicializamos el estado desde localStorage para persistir la sesión
    const user = ref(JSON.parse(localStorage.getItem('user')));
    const token = ref(localStorage.getItem('token'));
    const router = useRouter();

    // --- GETTERS ---
    const isAuthenticated = computed(() => !!token.value);
    const userRole = computed(() => (user.value ? user.value.rol : null));
    const isAdmin = computed(() => userRole.value === 'ceo' || userRole.value === 'funcionario');

    // --- ACTIONS ---
    function setAuthData(userData, userToken) {
        user.value = userData;
        token.value = userToken;
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', userToken);
    }

    function clearAuthData() {
        user.value = null;
        token.value = null;
        localStorage.removeItem('user');
        localStorage.removeItem('token');
    }

    async function login(credentials) {
        try {
            const data = await loginService(credentials); // Llama al servicio
            if (data.user && data.token) {
                setAuthData(data.user, data.token); // Actualiza el estado
                
                // Lógica de redirección centralizada
                if (isAdmin.value) {
                    router.push('/admin');
                } else {
                    router.push('/');
                }
            }
            return true;
        } catch (error) {
            clearAuthData();
            throw error; // Relanza el error para que el componente lo maneje
        }
    }

    async function register(userData) {
        // Simplemente un wrapper, la lógica principal está en el servicio
        return await registerService(userData);
    }
    
    function logout() {
        clearAuthData();
        Swal.fire({
            toast: true,
            icon: 'info',
            title: 'Has cerrado sesión.',
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000
        });
        router.push('/acceder'); // Redirige al login
    }

    return {
        // State
        user,
        token,
        // Getters
        isAuthenticated,
        userRole,
        isAdmin,
        // Actions
        login,
        register,
        logout,
    };
});