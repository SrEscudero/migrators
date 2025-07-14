<template>
  <div class="page-content-container">
    <div class="page-header">
      <div class="title-wrapper">
        <i class="fas fa-users page-icon"></i>
        <h2 class="page-title">Gestión de Clientes</h2>
      </div>
      <div class="actions-wrapper">
        <button class="btn btn-primary" @click="handleAbrirFormulario(null)">
          <i class="fas fa-plus-circle me-2"></i>Nuevo Cliente
        </button>
      </div>
    </div>

    <BaseModal
      v-if="mostrarFormulario"
      :title="esEdicion ? 'Editar Cliente' : 'Registrar Nuevo Cliente'"
      icon="fa-user-plus"
      @close="handleCerrarFormulario"
    >
      <ClienteRegistro
        ref="clienteFormRef"
        :es-edicion="esEdicion"
        :cliente-inicial="clienteSeleccionado"
        @guardar="handleGuardarCliente"
      />
      <template #footer>
        <button type="button" class="btn btn-secondary" @click="handleCerrarFormulario">Cancelar</button>
        <button type="button" class="btn btn-primary" @click="submitFormulario" :disabled="isSaving">
          <span v-if="isSaving" class="spinner-border spinner-border-sm me-2"></span>
          {{ isSaving ? 'Guardando...' : (esEdicion ? 'Actualizar Cliente' : 'Registrar Cliente') }}
        </button>
      </template>
    </BaseModal>

    <div class="content-card">
      <div class="content-card-header">
        <h3 class="content-card-title">Listado de Clientes</h3>
        <div class="search-box-wrapper">
           <i class="fas fa-search search-icon"></i>
           <input
              type="text"
              class="form-control"
              placeholder="Buscar por nombre, email o funcionario..."
              v-model="searchQuery"
           >
        </div>
      </div>
      
      <div class="content-card-body">
        <StatePlaceholder
          :loading="isLoading"
          :error="errorState"
          :empty="!isLoading && filteredClientes.length === 0"
          loading-title="Cargando clientes..."
          error-title="Error de Red"
          error-text="No se pudieron cargar los datos de los clientes."
          :show-retry-button="!!errorState"
          @retry="fetchClientes"
          empty-icon="fas fa-user-slash"
          :empty-title="searchQuery ? 'Sin resultados' : 'No hay clientes'"
          :empty-text="searchQuery ? 'No se encontraron clientes que coincidan.' : 'Puedes registrar el primer cliente usando el botón de arriba.'"
        >
          <div class="table-responsive">
            <table class="table table-hover align-middle">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Contacto</th>
                  <th>Estado del Caso</th>
                  <th>Funcionario Asignado</th>
                  <th class="text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="cliente in filteredClientes" :key="cliente.cliente_id">
                  <td>
                    <div class="fw-bold">{{ cliente.Nombre }}</div>
                    <div class="text-muted small">ID: {{ cliente.cliente_id }}</div>
                  </td>
                  <td>
                    <div>{{ cliente.Email }}</div>
                    <div class="text-muted small">{{ cliente.Celular || 'Sin celular' }}</div>
                  </td>
                  <td>
                    <span class="badge bg-light text-dark">{{ cliente.estatus_documentos }}</span>
                  </td>
                  <td>
                    <span v-if="cliente.funcionario_nombre" class="badge bg-info-subtle text-info-emphasis">{{ cliente.funcionario_nombre }}</span>
                    <span v-else class="text-muted fst-italic">Sin asignar</span>
                  </td>
                  <td class="actions-cell text-center">
                     <ActionButton
                        icon="fa-user-tag"
                        tooltip="Asignar Funcionario"
                        variant="info"
                        @click="openAssignModal(cliente)"
                      />
                     <ActionButton
                        icon="fa-edit"
                        tooltip="Editar Cliente"
                        variant="primary"
                        class="ms-2"
                        @click="handleAbrirFormulario(cliente)"
                      />
                     <ActionButton
                        icon="fa-trash"
                        tooltip="Eliminar Cliente"
                        variant="danger"
                        class="ms-2"
                        @click="confirmDeleteCliente(cliente)"
                      />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </StatePlaceholder>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import Swal from 'sweetalert2';

// ====> ¡AQUÍ ESTÁ LA CORRECCIÓN! <====
// La ruta ahora apunta a la carpeta correcta `components/shared/`
import BaseModal from '@/components/shared/BaseModal.vue';
import StatePlaceholder from '@/components/shared/StatePlaceholder.vue';
import ActionButton from '@/components/shared/ActionButton.vue';

import ClienteRegistro from '@/components/AdminDashboard/ClienteRegistro.vue';
import {
  getClientes,
  deleteCliente,
  createClienteAdmin,
  updateClienteAdmin,
  asignarCliente
} from '@/services/adminService.js';

// --- El resto del script no cambia ---
const listaClientes = ref([]);
const isLoading = ref(false);
const errorState = ref(null);
const isSaving = ref(false);

const searchQuery = ref('');
const filteredClientes = computed(() => {
  if (!searchQuery.value) return listaClientes.value;
  const queryLower = searchQuery.value.toLowerCase();
  return listaClientes.value.filter(c =>
    (c.Nombre?.toLowerCase().includes(queryLower)) ||
    (c.Email?.toLowerCase().includes(queryLower)) ||
    (c.funcionario_nombre?.toLowerCase().includes(queryLower))
  );
});

const mostrarFormulario = ref(false);
const esEdicion = ref(false);
const clienteSeleccionado = ref(null);
const clienteFormRef = ref(null);

const fetchClientes = async () => {
  isLoading.value = true;
  errorState.value = null;
  try {
    listaClientes.value = await getClientes();
  } catch (error) {
    errorState.value = error.message || 'Error desconocido';
  } finally {
    isLoading.value = false;
  }
};

const handleGuardarCliente = async (clienteData) => {
  isSaving.value = true;
  try {
    if (esEdicion.value) {
      await updateClienteAdmin(clienteSeleccionado.value.cliente_id, clienteData);
      Swal.fire('Actualizado', 'El cliente ha sido actualizado.', 'success');
    } else {
      await createClienteAdmin(clienteData);
      Swal.fire('Creado', 'El nuevo cliente ha sido registrado.', 'success');
    }
    handleCerrarFormulario();
    await fetchClientes();
  } catch (error) {
    Swal.fire('Error', error.response?.data?.message || 'No se pudo guardar el cliente.', 'error');
  } finally {
    isSaving.value = false;
  }
};

const confirmDeleteCliente = (cliente) => {
  Swal.fire({
    title: '¿Estás seguro?',
    html: `Se eliminará al cliente <strong>${cliente.Nombre}</strong>.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    confirmButtonText: 'Sí, eliminar'
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        await deleteCliente(cliente.cliente_id);
        await fetchClientes();
        Swal.fire('Eliminado', 'El cliente ha sido eliminado.', 'success');
      } catch (error) {
        Swal.fire('Error', error.response?.data?.message || 'No se pudo eliminar el cliente.', 'error');
      }
    }
  });
};

const handleAbrirFormulario = (cliente) => {
  if (cliente) {
    esEdicion.value = true;
    clienteSeleccionado.value = { ...cliente };
  } else {
    esEdicion.value = false;
    clienteSeleccionado.value = null;
  }
  mostrarFormulario.value = true;
};

const handleCerrarFormulario = () => {
  mostrarFormulario.value = false;
};

const submitFormulario = () => {
  if (clienteFormRef.value) {
    clienteFormRef.value.submit();
  }
};

onMounted(fetchClientes);
</script>

<style scoped>
/* No se necesitan estilos aquí */
</style>
