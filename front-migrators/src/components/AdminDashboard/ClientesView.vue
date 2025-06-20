<template>
  <div class="clientes-view-container">
    
    <div class="table-toolbar d-flex justify-content-between align-items-center mb-3">
      <div class="search-filter">
        <div class="input-group">
          <span class="input-group-text"><i class="fas fa-search"></i></span>
          <input type="text" class="form-control" placeholder="Buscar cliente..." v-model="filtro">
        </div>
      </div>
      <div class="actions">
        <button class="btn btn-primary" @click="$emit('nuevo-cliente')">
          <i class="fas fa-plus me-2"></i>Registrar Cliente
        </button>
      </div>
    </div>

    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status"><span class="visually-hidden">Cargando...</span></div>
      <p class="mt-2 text-muted">Cargando clientes...</p>
    </div>

    <div v-else-if="clientesFiltrados.length > 0" class="table-responsive">
      <table class="table table-hover align-middle">
        <thead class="table-light">
          <tr>
            <th scope="col">Nombre</th>
            <th scope="col">Email y Celular</th>
            <th scope="col">Estado del Caso</th>
            <th scope="col">Funcionario Asignado</th>
            <th scope="col" class="text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="cliente in clientesFiltrados" :key="cliente.cliente_id">
            <td>
              <div class="d-flex align-items-center">
                <div class="avatar me-3">{{ getInitial(cliente.Nombre) }}</div>
                <div>
                  <div class="fw-bold">{{ cliente.Nombre }}</div>
                  <div class="text-muted small">ID: {{ cliente.cliente_id }}</div>
                </div>
              </div>
            </td>
            <td>
              <div>{{ cliente.Email }}</div>
              <div class="text-muted small">{{ cliente.Celular || 'No disponible' }}</div>
            </td>
            <td>
              <span class="badge bg-light text-dark">{{ cliente.estatus_documentos }}</span>
            </td>
            <td>
              <span v-if="cliente.funcionario_nombre" class="badge bg-info-subtle text-info-emphasis">{{ cliente.funcionario_nombre }}</span>
              <span v-else class="text-muted fst-italic">Sin asignar</span>
            </td>
            <td class="text-center">
              <button class="btn btn-sm btn-outline-secondary me-2" @click="openAssignModal(cliente)" title="Asignar/Reasignar Funcionario">
                <i class="fas fa-user-tag"></i>
              </button>
              <button class="btn btn-sm btn-outline-primary" @click="$emit('editar-cliente', cliente)" title="Editar Cliente">
                <i class="fas fa-edit"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else class="text-center py-5">
      <i class="fas fa-users-slash fa-3x text-muted mb-3"></i>
      <h4>No se encontraron clientes</h4>
    </div>

    <div v-if="isModalOpen" class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.5);">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Asignar Funcionario</h5>
            <button type="button" class="btn-close" @click="closeAssignModal" aria-label="Cerrar"></button>
          </div>
          <div class="modal-body">
            <p v-if="selectedClient">Asignando a: <strong>{{ selectedClient.Nombre }}</strong></p>
            <div v-if="loadingFuncionarios" class="text-center">Cargando funcionarios...</div>
            <div v-else>
              <label for="funcionarioSelect" class="form-label">Seleccione un funcionario:</label>
              <select id="funcionarioSelect" class="form-select" v-model="selectedFuncionarioId">
                <option :value="null" disabled>-- Elige un funcionario --</option>
                <option v-for="func in funcionarios" :key="func.id" :value="func.id">
                  {{ func.nombre }} ({{ func.email }})
                </option>
              </select>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeAssignModal">Cancelar</button>
            <button type="button" class="btn btn-primary" @click="handleAssign" :disabled="!selectedFuncionarioId || assigning">
              <span v-if="assigning" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              {{ assigning ? 'Asignando...' : 'Asignar' }}
            </button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import Swal from 'sweetalert2';
import { obtenerFuncionarios } from '@/services/adminService';
import { asignarCliente } from '@/services/clienteService';

const props = defineProps({
  clientes: { type: Array, required: true, default: () => [] },
  loading: { type: Boolean, required: true, default: false }
});

const emit = defineEmits(['nuevo-cliente', 'editar-cliente', 'refresh-clientes']);

// --- ESTADO LOCAL ---
const filtro = ref('');
const isModalOpen = ref(false);
const loadingFuncionarios = ref(false);
const assigning = ref(false);
const funcionarios = ref([]);
const selectedClient = ref(null);
const selectedFuncionarioId = ref(null);

// --- LÓGICA DE FILTRADO Y VISUALIZACIÓN ---
const clientesFiltrados = computed(() => {
  if (!filtro.value) return props.clientes;
  const busquedaLower = filtro.value.toLowerCase();
  return props.clientes.filter(c =>
    c.Nombre.toLowerCase().includes(busquedaLower) ||
    c.Email.toLowerCase().includes(busquedaLower)
  );
});

const getInitial = (nombre) => nombre ? nombre.charAt(0).toUpperCase() : '?';

// --- LÓGICA DEL MODAL DE ASIGNACIÓN ---
const openAssignModal = async (cliente) => {
  selectedClient.value = cliente;
  isModalOpen.value = true;
  loadingFuncionarios.value = true;
  try {
    // Reutilizamos el servicio que ya lista los funcionarios
    funcionarios.value = await obtenerFuncionarios();
  } catch (error) {
    Swal.fire('Error', 'No se pudo cargar la lista de funcionarios.', 'error');
    closeAssignModal();
  } finally {
    loadingFuncionarios.value = false;
  }
};

const closeAssignModal = () => {
  isModalOpen.value = false;
  selectedClient.value = null;
  selectedFuncionarioId.value = null;
  funcionarios.value = [];
};

const handleAssign = async () => {
  if (!selectedClient.value || !selectedFuncionarioId.value) return;
  assigning.value = true;
  try {
    await asignarCliente(selectedClient.value.cliente_id, selectedFuncionarioId.value);
    Swal.fire('¡Éxito!', 'El cliente ha sido asignado correctamente.', 'success');
    emit('refresh-clientes'); // Emitimos un evento para que el padre refresque la lista
    closeAssignModal();
  } catch (error) {
    Swal.fire('Error', `No se pudo asignar el cliente: ${error.message}`, 'error');
  } finally {
    assigning.value = false;
  }
};
</script>

<style scoped>
/* Tus estilos existentes para ClientesView.vue se mantienen aquí */
.clientes-view-container { padding: 1rem; }
.table-toolbar { padding-bottom: 1rem; }
.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #e9ecef;
  color: #495057;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}
.table th { font-weight: 600; color: #6c757d; }
.table td { vertical-align: middle; }
.badge { padding: 0.5em 0.75em; }
.fa-users-slash { opacity: 0.5; }
</style>