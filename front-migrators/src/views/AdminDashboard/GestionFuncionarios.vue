<template>
  <div class="gestion-funcionarios-container">
    <div class="header-container">
      <div class="title-container">
        <i class="fas fa-user-shield icon-title"></i>
        <h3>Gestión de Funcionarios</h3>
      </div>
      <button 
        class="btn btn-primary btn-add" 
        @click="handleAbrirFormulario" 
        v-if="!mostrarFormulario"
      >
        <i class="fas fa-user-plus"></i>
        <span>Crear Funcionario</span>
      </button>
    </div>

    <transition name="slide-fade">
      <FuncionarioForm
        v-if="mostrarFormulario"
        @guardar="handleGuardarFuncionario"
        @cancelar="handleCerrarFormulario"
        class="form-container"
      />
    </transition>

    <div class="table-section">
      <div class="table-header">
        <h4>Listado de Funcionarios</h4>
        <button 
          class="btn btn-refresh" 
          @click="fetchFuncionarios"
          :disabled="isLoading"
        >
          <i class="fas fa-sync" :class="{ 'fa-spin': isLoading }"></i>
        </button>
      </div>
      
      <div v-if="isLoading" class="loading-container">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Cargando...</span>
        </div>
      </div>
      
      <div v-else-if="listaFuncionarios.length > 0" class="table-responsive">
        <table class="table table-striped table-hover">
          <thead class="table-header">
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Celular</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="func in listaFuncionarios" :key="func.id">
              <td>{{ func.nombre }}</td>
              <td>{{ func.email }}</td>
              <td>{{ func.celular || 'N/A' }}</td>
              <td class="actions">
                <button class="btn btn-sm btn-edit" @click="handleEditar(func)">
                  <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-delete" @click="handleEliminar(func)">
                  <i class="fas fa-trash"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div v-else class="empty-state">
        <i class="fas fa-users-slash empty-icon"></i>
        <p>No hay funcionarios registrados</p>
        <button class="btn btn-primary" @click="handleAbrirFormulario">
          Crear primer funcionario
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import Swal from 'sweetalert2';
import FuncionarioForm from '../../components/AdminDashboard/FuncionarioForm.vue';
import { 
  crearFuncionario, 
  obtenerFuncionarios,
  actualizarFuncionario,
  eliminarFuncionario 
} from '../../services/adminService';

// Estado
const listaFuncionarios = ref([]);
const isLoading = ref(false);
const mostrarFormulario = ref(false);
const funcionarioEditando = ref(null);

// Métodos
const fetchFuncionarios = async () => {
  isLoading.value = true;
  try {
    listaFuncionarios.value = await obtenerFuncionarios();
  } catch (error) {
    showError('Error al cargar funcionarios', error);
    listaFuncionarios.value = [];
  } finally {
    isLoading.value = false;
  }
};

const handleAbrirFormulario = () => {
  funcionarioEditando.value = null;
  mostrarFormulario.value = true;
};

const handleCerrarFormulario = () => {
  mostrarFormulario.value = false;
  funcionarioEditando.value = null;
};

const handleGuardarFuncionario = async (funcionarioData) => {
  try {
    if (funcionarioEditando.value) {
      await actualizarFuncionario(funcionarioEditando.value.id, funcionarioData);
      showSuccess('Funcionario actualizado correctamente');
    } else {
      await crearFuncionario(funcionarioData);
      showSuccess('Funcionario creado correctamente');
    }
    
    mostrarFormulario.value = false;
    await fetchFuncionarios();
  } catch (error) {
    showError('Error al guardar funcionario', error);
  }
};

const handleEditar = (funcionario) => {
  funcionarioEditando.value = funcionario;
  mostrarFormulario.value = true;
};

const handleEliminar = async (funcionario) => {
  const result = await Swal.fire({
    title: '¿Estás seguro?',
    text: `Vas a eliminar a ${funcionario.nombre}`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  });

  if (result.isConfirmed) {
    try {
      await eliminarFuncionario(funcionario.id);
      showSuccess('Funcionario eliminado correctamente');
      await fetchFuncionarios();
    } catch (error) {
      showError('Error al eliminar funcionario', error);
    }
  }
};

const showSuccess = (message) => {
  Swal.fire({
    icon: 'success',
    title: '¡Éxito!',
    text: message,
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000
  });
};

const showError = (title, error) => {
  Swal.fire({
    icon: 'error',
    title: title,
    text: error.response?.data?.message || error.message || 'Ocurrió un error inesperado',
  });
};

// Ciclo de vida
onMounted(fetchFuncionarios);
</script>

<style scoped>
.gestion-funcionarios-container {
  padding: 2rem;
  background-color: #f8f9fa;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.title-container {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.icon-title {
  font-size: 1.5rem;
  color: #4e73df;
}

h3 {
  font-weight: 600;
  color: #2e3a59;
  margin: 0;
}

.btn-add {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-weight: 500;
}

.table-section {
  margin-top: 2rem;
  background: white;
  border-radius: 10px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.table-header h4 {
  color: #2e3a59;
  font-weight: 600;
  margin: 0;
}

.btn-refresh {
  color: #4e73df;
  background: transparent;
  border: none;
  font-size: 1.1rem;
  transition: transform 0.3s;
}

.btn-refresh:hover {
  transform: rotate(180deg);
  color: #2e59d9;
}

.table {
  margin-bottom: 0;
}

.table th {
  font-weight: 600;
  color: #6b7280;
  background-color: #f9fafb;
}

.table td {
  vertical-align: middle;
}

.actions {
  display: flex;
  gap: 0.5rem;
}

.btn-edit {
  color: #4e73df;
  background-color: rgba(78, 115, 223, 0.1);
  border: none;
}

.btn-delete {
  color: #e74a3b;
  background-color: rgba(231, 74, 59, 0.1);
  border: none;
}

.btn-edit:hover {
  background-color: rgba(78, 115, 223, 0.2);
}

.btn-delete:hover {
  background-color: rgba(231, 74, 59, 0.2);
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #6b7280;
}

.empty-icon {
  font-size: 3rem;
  color: #d1d5db;
  margin-bottom: 1rem;
}

.loading-container {
  display: flex;
  justify-content: center;
  padding: 2rem;
}

.form-container {
  margin-bottom: 2rem;
}

/* Transiciones */
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.3s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(-10px);
  opacity: 0;
}
</style>