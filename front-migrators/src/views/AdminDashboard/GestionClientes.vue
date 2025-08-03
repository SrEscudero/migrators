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

    <div v-if="isAssignModalOpen" class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.5);">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Asignar Funcionario</h5>
            <button type="button" class="btn-close" @click="closeAssignModal" aria-label="Cerrar"></button>
          </div>
          <div class="modal-body">
            <p v-if="clienteParaAsignar">Asignando a: <strong>{{ clienteParaAsignar.Nombre }}</strong></p>
            <div v-if="isLoadingFuncionarios" class="text-center">Cargando funcionarios...</div>
            <div v-else>
              <label for="funcionarioSelect" class="form-label">Seleccione un funcionario:</label>
              <select id="funcionarioSelect" class="form-select" v-model="selectedFuncionarioId">
                <option :value="null" disabled>-- Elige un funcionario --</option>
                <option v-for="func in listaFuncionarios" :key="func.id" :value="func.id">
                  {{ func.nombre }} ({{ func.email }})
                </option>
              </select>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeAssignModal">Cancelar</button>
            <button type="button" class="btn btn-primary" @click="handleAssign" :disabled="!selectedFuncionarioId || isAssigning">
              <span v-if="isAssigning" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              {{ isAssigning ? 'Asignando...' : 'Asignar' }}
            </button>
          </div>
        </div>
      </div>
    </div>

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
          :error="error"
          :empty="!isLoading && filteredClientes.length === 0"
          loading-title="Cargando clientes..."
          error-title="Error de Red"
          :error-text="error"
          :show-retry-button="!!error"
          @retry="clienteStore.fetchClientes"
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
                        @click="clienteStore.deleteClienteById(cliente)"
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
import { storeToRefs } from 'pinia';
import { useClienteStore } from '@/stores/clienteStore.js';
import { obtenerFuncionarios } from '@/services/adminService.js'; 

import BaseModal from '@/components/shared/BaseModal.vue';
import StatePlaceholder from '@/components/shared/StatePlaceholder.vue';
import ActionButton from '@/components/shared/ActionButton.vue';
import ClienteRegistro from '@/components/AdminDashboard/ClienteRegistro.vue';

// --- STORES ---
const clienteStore = useClienteStore();
const { clientes, isLoading, error } = storeToRefs(clienteStore);

// --- ESTADO LOCAL DE LA VISTA ---
const isSaving = ref(false);
const searchQuery = ref('');
const mostrarFormulario = ref(false);
const esEdicion = ref(false);
const clienteSeleccionado = ref(null);
const clienteFormRef = ref(null);

// Estado para el modal de asignación
const isAssignModalOpen = ref(false);
const isLoadingFuncionarios = ref(false);
const isAssigning = ref(false);
const listaFuncionarios = ref([]);
const clienteParaAsignar = ref(null);
const selectedFuncionarioId = ref(null);

// --- COMPUTED ---
const filteredClientes = computed(() => {
  if (!searchQuery.value) return clientes.value;
  const queryLower = searchQuery.value.toLowerCase();
  return clientes.value.filter(c =>
    (c.Nombre?.toLowerCase().includes(queryLower)) ||
    (c.Email?.toLowerCase().includes(queryLower)) ||
    (c.funcionario_nombre?.toLowerCase().includes(queryLower))
  );
});

// --- MÉTODOS PARA CRUD DE CLIENTES ---
const handleGuardarCliente = async (clienteData) => {
  isSaving.value = true;
  try {
    const success = await clienteStore.saveCliente(
      clienteData,
      esEdicion.value,
      clienteSeleccionado.value?.cliente_id
    );
    if (success) {
      handleCerrarFormulario();
    }
  } catch (err) {
  } finally {
    isSaving.value = false;
  }
};

const handleAbrirFormulario = (cliente) => {
  esEdicion.value = !!cliente;
  clienteSeleccionado.value = cliente ? { ...cliente } : null;
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

// --- MÉTODOS PARA MODAL DE ASIGNACIÓN ---
const openAssignModal = async (cliente) => {
  clienteParaAsignar.value = cliente;
  selectedFuncionarioId.value = cliente.funcionario_asignado_id || null;
  isAssignModalOpen.value = true;
  
  if (listaFuncionarios.value.length === 0) {
    isLoadingFuncionarios.value = true;
    try {
      listaFuncionarios.value = await obtenerFuncionarios();
    } catch (err) {
      closeAssignModal();
    } finally {
      isLoadingFuncionarios.value = false;
    }
  }
};

const closeAssignModal = () => {
  isAssignModalOpen.value = false;
  clienteParaAsignar.value = null;
  selectedFuncionarioId.value = null;
};

const handleAssign = async () => {
  if (!clienteParaAsignar.value || !selectedFuncionarioId.value) return;
  isAssigning.value = true;
  try {
    const success = await clienteStore.assignCliente(clienteParaAsignar.value.cliente_id, selectedFuncionarioId.value);
    if (success) {
      closeAssignModal();
    }
  } catch (err) {
  } finally {
    isAssigning.value = false;
  }
};

// --- CICLO DE VIDA ---
onMounted(() => {
  clienteStore.fetchClientes();
});
</script>

<style scoped>
/* No se necesitan estilos aquí */
</style>