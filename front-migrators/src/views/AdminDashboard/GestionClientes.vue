<template>
  <div class="gestion-clientes-container">
    <div class="header-section">
      <h2 class="section-title">
        <i class="fas fa-users me-2"></i>Gestión de Clientes
      </h2>
      <button 
        class="btn btn-primary"
        @click="handleNuevoCliente"
        v-if="!mostrarFormulario"
      >
        <i class="fas fa-plus-circle me-2"></i>Nuevo Cliente
      </button>
    </div>

    <transition name="slide-fade">
      <ClienteRegistro
        v-if="mostrarFormulario"
        :cliente-inicial="clienteSeleccionado"
        :es-edicion="esEdicion"
        @guardar="handleGuardarCliente"
        @cancelar="handleCerrarFormulario"
        class="form-container"
      />
    </transition>

    <div class="content-section">
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">
            <i class="fas fa-list-alt me-2"></i>Listado de Clientes
          </h3>
          <div class="search-box">
            <i class="fas fa-search"></i>
            <input 
              type="text" 
              placeholder="Buscar clientes..." 
              v-model="searchQuery"
              class="search-input"
            >
          </div>
        </div>
        
        <div class="card-body">
          <div v-if="isLoading" class="loading-state">
            <div class="spinner"></div>
            <p>Cargando clientes...</p>
          </div>
          
          <div v-else-if="filteredClientes.length > 0" class="table-responsive">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Teléfono</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="cliente in filteredClientes" :key="cliente.id">
                  <td>{{ cliente.nombre }}</td>
                  <td>{{ cliente.email }}</td>
                  <td>{{ cliente.telefono || 'N/A' }}</td>
                  <td class="actions">
                    <button 
                      class="btn btn-sm btn-outline-primary"
                      @click="handleEditarCliente(cliente)"
                    >
                      <i class="fas fa-edit"></i>
                    </button>
                    <button 
                      class="btn btn-sm btn-outline-danger ms-2"
                      @click="confirmDeleteCliente(cliente.id)"
                    >
                      <i class="fas fa-trash-alt"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div v-else class="empty-state">
            <i class="fas fa-user-slash"></i>
            <p>No se encontraron clientes</p>
            <button 
              class="btn btn-primary"
              @click="handleNuevoCliente"
            >
              <i class="fas fa-plus-circle me-2"></i>Agregar Cliente
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import Swal from 'sweetalert2';
import ClienteRegistro from '@/components/AdminDashboard/ClienteRegistro.vue';
import { getClientes, deleteCliente } from '@/services/clienteService.js';

// Estado
const listaClientes = ref([]);
const isLoading = ref(false);
const mostrarFormulario = ref(false);
const clienteSeleccionado = ref(null);
const esEdicion = ref(false);
const searchQuery = ref('');

// Computed
const filteredClientes = computed(() => {
  if (!searchQuery.value) return listaClientes.value;
  return listaClientes.value.filter(cliente => 
    cliente.nombre.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    cliente.email.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

// Métodos
const fetchClientes = async () => {
  isLoading.value = true;
  try {
    listaClientes.value = await getClientes();
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: `No se pudieron cargar los clientes: ${error.message}`,
      confirmButtonColor: '#4f46e5'
    });
    listaClientes.value = [];
  } finally {
    isLoading.value = false;
  }
};

const handleNuevoCliente = () => {
  clienteSeleccionado.value = null;
  esEdicion.value = false;
  mostrarFormulario.value = true;
};

const handleEditarCliente = (cliente) => {
  clienteSeleccionado.value = { ...cliente };
  esEdicion.value = true;
  mostrarFormulario.value = true;
};

const handleGuardarCliente = async (clienteData) => {
  try {
    mostrarFormulario.value = false;
    await fetchClientes();
    Swal.fire({
      icon: 'success',
      title: 'Éxito',
      text: `Cliente ${esEdicion.value ? 'actualizado' : 'creado'} correctamente`,
      confirmButtonColor: '#4f46e5'
    });
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: error.message,
      confirmButtonColor: '#4f46e5'
    });
  }
};

const handleCerrarFormulario = () => {
  mostrarFormulario.value = false;
};

const confirmDeleteCliente = (id) => {
  Swal.fire({
    title: '¿Estás seguro?',
    text: "Esta acción no se puede deshacer",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#4f46e5',
    cancelButtonColor: '#6c757d',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        await deleteCliente(id);
        await fetchClientes();
        Swal.fire({
          icon: 'success',
          title: 'Eliminado',
          text: 'El cliente ha sido eliminado',
          confirmButtonColor: '#4f46e5'
        });
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.message,
          confirmButtonColor: '#4f46e5'
        });
      }
    }
  });
};

// Lifecycle
onMounted(fetchClientes);
</script>

<style scoped>
.gestion-clientes-container {
  padding: 1.5rem;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.form-container {
  margin-bottom: 2rem;
  background: #ffffff;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  border: 1px solid #e2e8f0;
}

.card {
  border: none;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.card-header {
  background-color: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0;
  color: #1e293b;
}

.search-box {
  position: relative;
  width: 250px;
}

.search-box i {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #64748b;
}

.search-input {
  width: 100%;
  padding: 0.5rem 1rem 0.5rem 2.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  font-size: 0.925rem;
  transition: all 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.card-body {
  padding: 1.5rem;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.spinner {
  width: 3rem;
  height: 3rem;
  border: 0.25rem solid rgba(79, 70, 229, 0.1);
  border-top-color: #4f46e5;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
}

.empty-state i {
  font-size: 3rem;
  color: #64748b;
  margin-bottom: 1rem;
}

.empty-state p {
  color: #64748b;
  margin-bottom: 1.5rem;
}

.table {
  margin-bottom: 0;
}

.table th {
  font-weight: 600;
  color: #334155;
  background-color: #f8fafc;
  border-bottom-width: 1px;
}

.table td {
  vertical-align: middle;
}

.actions {
  white-space: nowrap;
}

.btn {
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn-primary {
  background-color: #4f46e5;
  border-color: #4f46e5;
}

.btn-primary:hover {
  background-color: #4338ca;
  border-color: #4338ca;
}

.btn-outline-primary {
  color: #4f46e5;
  border-color: #4f46e5;
}

.btn-outline-primary:hover {
  background-color: #4f46e5;
  color: white;
}

.btn-outline-danger {
  color: #ef4444;
  border-color: #ef4444;
}

.btn-outline-danger:hover {
  background-color: #ef4444;
  color: white;
}

/* Animations */
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.2s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(-10px);
  opacity: 0;
}

@media (max-width: 768px) {
  .header-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .search-box {
    width: 100%;
  }
}
</style>