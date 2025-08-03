import { defineStore } from 'pinia';
import { ref } from 'vue';
import Swal from 'sweetalert2';
import {
  getClientes,
  createClienteAdmin,
  updateClienteAdmin,
  deleteCliente,
  asignarCliente
} from '@/services/adminService.js';

export const useClienteStore = defineStore('cliente', () => {
    // --- STATE ---
    const clientes = ref([]);
    const isLoading = ref(false);
    const error = ref(null);

    // --- ACTIONS ---
    async function fetchClientes() {
        isLoading.value = true;
        error.value = null;
        try {
            clientes.value = await getClientes();
        } catch (err) {
            error.value = 'No se pudieron cargar los datos de los clientes.';
            clientes.value = [];
        } finally {
            isLoading.value = false;
        }
    }

    async function saveCliente(clienteData, esEdicion = false, id = null) {
        try {
            if (esEdicion) {
                await updateClienteAdmin(id, clienteData);
                Swal.fire('Actualizado', 'El cliente ha sido actualizado.', 'success');
            } else {
                await createClienteAdmin(clienteData);
                Swal.fire('Creado', 'El nuevo cliente ha sido registrado.', 'success');
            }
            await fetchClientes(); // Refrescar lista
            return true; // Indicar éxito
        } catch (err) {
            throw err; // El interceptor maneja el Swal
        }
    }
    
    async function assignCliente(clienteId, funcionarioId) {
        try {
            await asignarCliente(clienteId, funcionarioId);
            Swal.fire('¡Éxito!', 'El cliente ha sido asignado correctamente.', 'success');
            await fetchClientes(); // Refrescar para mostrar el nuevo funcionario asignado
            return true;
        } catch (err) {
            throw err;
        }
    }

    async function deleteClienteById(cliente) {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            html: `Se eliminará al cliente <strong>${cliente.Nombre}</strong>.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                await deleteCliente(cliente.cliente_id);
                Swal.fire('Eliminado', 'El cliente ha sido eliminado.', 'success');
                await fetchClientes();
            } catch (err) {
                // El interceptor se encarga del Swal de error
            }
        }
    }
    
    return {
        // State
        clientes,
        isLoading,
        error,
        // Actions
        fetchClientes,
        saveCliente,
        assignCliente,
        deleteClienteById,
    };
});