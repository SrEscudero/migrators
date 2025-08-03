import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import Swal from 'sweetalert2';
import {
  crearFuncionario,
  obtenerFuncionarios,
  actualizarFuncionario,
  eliminarFuncionario
} from '@/services/adminService';

export const useFuncionarioStore = defineStore('funcionario', () => {
    // --- STATE ---
    const funcionarios = ref([]);
    const isLoading = ref(false);
    const error = ref(null);

    // --- GETTERS (OPCIONAL, PERO BUENA PRÁCTICA) ---
    const totalFuncionarios = computed(() => funcionarios.value.length);

    // --- ACTIONS ---
    async function fetchFuncionarios() {
        isLoading.value = true;
        error.value = null;
        try {
            funcionarios.value = await obtenerFuncionarios();
        } catch (err) {
            error.value = 'No se pudieron cargar los funcionarios.';
            funcionarios.value = []; // Asegurarse de que esté vacío en caso de error
            // El interceptor de Axios ya muestra un Swal, así que no necesitamos otro aquí.
        } finally {
            isLoading.value = false;
        }
    }

    async function saveFuncionario(funcionarioData, esEdicion = false, id = null) {
        try {
            if (esEdicion) {
                await actualizarFuncionario(id, funcionarioData);
                Swal.fire('Actualizado', 'El funcionario ha sido actualizado correctamente.', 'success');
            } else {
                await crearFuncionario(funcionarioData);
                Swal.fire('Creado', 'El nuevo funcionario ha sido registrado con éxito.', 'success');
            }
            await fetchFuncionarios(); // Refrescar la lista después de guardar
            return true; // Indicar éxito para que el componente pueda cerrar el modal
        } catch (err) {
            // El interceptor ya muestra el error, pero lo relanzamos por si el componente necesita saber que falló.
            throw err;
        }
    }

    async function deleteFuncionario(funcionario) {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            html: `Se eliminará al funcionario <strong>${funcionario.nombre}</strong>.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                await eliminarFuncionario(funcionario.id);
                Swal.fire('Eliminado', 'El funcionario ha sido eliminado.', 'success');
                await fetchFuncionarios(); // Refrescar la lista
            } catch (err) {
                // El interceptor se encarga del Swal de error
            }
        }
    }

    return {
        // State
        funcionarios,
        isLoading,
        error,
        // Getters
        totalFuncionarios,
        // Actions
        fetchFuncionarios,
        saveFuncionario,
        deleteFuncionario,
    };
});