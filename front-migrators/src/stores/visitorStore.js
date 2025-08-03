import { defineStore } from 'pinia';
import { ref } from 'vue';
import apiClient from '@/services/api';

export const useVisitorStore = defineStore('visitor', () => {
    const visitors = ref([]);
    const isLoading = ref(false);
    const error = ref(null);

    async function fetchVisitors() {
        isLoading.value = true;
        error.value = null;
        try {
            // Llama al nuevo endpoint seguro que creamos
            const response = await apiClient.get('/api/admin/visitors');
            visitors.value = response.data;
        } catch (err) {
            error.value = 'No se pudo cargar el historial de visitantes.';
        } finally {
            isLoading.value = false;
        }
    }

    return { visitors, isLoading, error, fetchVisitors };
});