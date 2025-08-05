// src/stores/authStore.js (VERSIÓN CORREGIDA Y SEGURA)

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import Swal from 'sweetalert2';
import { login as loginService, register as registerService } from '@/services/authService';
import apiClient from '@/services/api';

export const useAuthStore = defineStore('auth', () => {
    // El estado del usuario ahora se inicializa como null. Solo la memoria lo contendrá.
    const user = ref(null);
    // Este es nuestro nuevo indicador de sesión.
    const sessionActive = ref(JSON.parse(localStorage.getItem('sessionActive')) || false);

    const isAuthenticated = computed(() => !!user.value);
    const userRole = computed(() => (user.value ? user.value.rol : null));
    const isAdmin = computed(() => userRole.value === 'ceo' || userRole.value === 'funcionario');

    // Función interna para establecer los datos del usuario SOLO en la memoria (ref de Pinia).
    function setUser(userData) {
        user.value = userData;
        // Si recibimos datos, marcamos la sesión como activa en localStorage.
        if (userData) {
            sessionActive.value = true;
            localStorage.setItem('sessionActive', JSON.stringify(true));
        }
    }

    // Función para limpiar todo.
    function clearAuthData() {
        user.value = null;
        sessionActive.value = false;
        localStorage.removeItem('sessionActive');
    }

    async function login(credentials) {
        try {
            const data = await loginService(credentials);
            if (data.user) {
                setUser(data.user); // Usamos nuestra nueva función interna.
                return data.user; 
            }
        } catch (error) {
            clearAuthData();
            throw error;
        }
    }
    
    async function logout() {
        try {
            await apiClient.post('/api/usuarios/logout');
        } catch (error) {
            console.error("Error en la llamada al backend para logout:", error);
        } finally {
            clearAuthData(); // La función de limpieza se encarga de todo.
            Swal.fire({
                toast: true,
                icon: 'info',
                title: 'Has cerrado sesión.',
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000
            });
        }
    }

    // Nueva acción para obtener los datos del usuario si la sesión es válida en el backend.
    async function fetchUser() {
        // Solo intentamos buscar al usuario si el localStorage indica que debería haber una sesión.
        if (sessionActive.value && !user.value) {
            try {
                const response = await apiClient.get('/api/usuarios/me');
                setUser(response.data);
            } catch (error) {
                // Si la cookie es inválida o la sesión expiró, el interceptor 401
                // ya manejará el logout, pero por si acaso, limpiamos los datos aquí también.
                console.error("Fallo al obtener el usuario de la sesión, probablemente expiró.", error);
                clearAuthData();
            }
        }
    }
    
    // Esta función sigue siendo útil para actualizar el perfil en memoria tras un cambio.
    function updateUser(newUserData) {
        if (user.value) {
            user.value = { ...user.value, ...newUserData };
        }
    }

    return {
        user,
        isAuthenticated,
        userRole,
        isAdmin,
        login,
        logout,
        fetchUser, // Exponemos la nueva acción
        updateUser,
        // No necesitamos exponer register, sessionActive, setUser ni clearAuthData
    };
});