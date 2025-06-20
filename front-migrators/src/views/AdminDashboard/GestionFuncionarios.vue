<template>
  <div class="gestion-funcionarios-container">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h3 class="m-0">
        <i class="fas fa-user-shield me-2"></i>Gestión de Funcionarios
      </h3>
      <button class="btn btn-success" @click="handleAbrirFormulario" v-if="!mostrarFormulario">
        <i class="fas fa-user-plus me-2"></i>Crear Funcionario
      </button>
    </div>

    <transition name="fade">
      <FuncionarioForm
        v-if="mostrarFormulario"
        @guardar="handleGuardarFuncionario"
        @cancelar="handleCerrarFormulario"
        class="mb-4"
      />
    </transition>

    <div class="table-responsive">
      <h4 class="mt-5 mb-3">Listado de Funcionarios</h4>
      <div v-if="isLoading" class="text-center py-5">Cargando...</div>
      <table v-else-if="listaFuncionarios.length > 0" class="table table-hover">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Email</th>
            <th>Celular</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="func in listaFuncionarios" :key="func.id">
            <td>{{ func.nombre }}</td>
            <td>{{ func.email }}</td>
            <td>{{ func.celular || 'N/A' }}</td>
          </tr>
        </tbody>
      </table>
      <div v-else class="text-center py-5 border rounded bg-light">
        <p class="text-muted">No hay funcionarios registrados.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import Swal from 'sweetalert2';

// Importa los componentes hijos y los servicios necesarios
// CORRECTO
import FuncionarioForm from '../../components/AdminDashboard/FuncionarioForm.vue';
import { crearFuncionario, obtenerFuncionarios } from '../../services/adminService'; // Asegúrate que esta ruta es correcta y el servicio existe

// --- ESTADO ---
const listaFuncionarios = ref([]);
const isLoading = ref(false);
const mostrarFormulario = ref(false);

// --- MÉTODOS ---
const fetchFuncionarios = async () => {
  isLoading.value = true;
  try {
    // Este servicio debe existir en tu adminService.js y llamar a una ruta del backend
    listaFuncionarios.value = await obtenerFuncionarios();
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Error al Cargar Funcionarios',
      text: error.message || 'Hubo un problema al cargar los funcionarios.',
    });
    listaFuncionarios.value = [];
  } finally {
    isLoading.value = false;
  }
};

const handleAbrirFormulario = () => {
  mostrarFormulario.value = true;
};

const handleCerrarFormulario = () => {
  mostrarFormulario.value = false;
};

const handleGuardarFuncionario = async (funcionarioData) => {
  try {
    // Llama al backend para crear el funcionario
    const response = await crearFuncionario(funcionarioData);

    // Muestra un mensaje de éxito
    Swal.fire({
      icon: 'success',
      title: '¡Éxito!',
      text: response.message || 'Funcionario creado correctamente.',
    });

    // Cierra el formulario
    mostrarFormulario.value = false;

    // Refresca la lista de funcionarios
    await fetchFuncionarios();
  } catch (error) {
    // Maneja errores del backend
    Swal.fire({
      icon: 'error',
      title: 'Error al Crear Funcionario',
      text: error.response?.data?.message || error.message || 'Hubo un problema al crear el funcionario.',
    });
  }
};

// --- HOOK DE CICLO DE VIDA ---
onMounted(fetchFuncionarios);
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
h3 {
  font-weight: 600;
}
</style>