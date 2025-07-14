<template>
  <div class="page-content-container">
    <div class="page-header">
      <div class="title-wrapper">
        <i class="fas fa-user-shield page-icon"></i>
        <h2 class="page-title">Gestión de Funcionarios</h2>
      </div>
      <div class="actions-wrapper">
        <button class="btn btn-primary" @click="handleAbrirFormulario(null)">
          <i class="fas fa-plus-circle me-2"></i>Crear Funcionario
        </button>
      </div>
    </div>

    <BaseModal
      v-if="mostrarFormulario"
      :title="esEdicion ? 'Editar Funcionario' : 'Registrar Nuevo Funcionario'"
      icon="fa-user-plus"
      @close="handleCerrarFormulario"
    >
      <FuncionarioForm
        ref="funcionarioFormRef"
        :is-editing="esEdicion"
        :initial-data="funcionarioSeleccionado"
        @save="handleGuardarFuncionario"
      />
      <template #footer>
        <button type="button" class="btn btn-secondary" @click="handleCerrarFormulario">Cancelar</button>
        <button type="button" class="btn btn-primary" @click="submitFormulario" :disabled="isSaving">
          <span v-if="isSaving" class="spinner-border spinner-border-sm me-2" role="status"></span>
          {{ isSaving ? 'Guardando...' : (esEdicion ? 'Actualizar' : 'Registrar') }}
        </button>
      </template>
    </BaseModal>

    <div class="content-card">
      <div class="content-card-header">
        <h3 class="content-card-title">Listado de Funcionarios</h3>
        <div class="search-box-wrapper">
           <i class="fas fa-search search-icon"></i>
           <input
              type="text"
              class="form-control"
              placeholder="Buscar por nombre o email..."
              v-model="searchQuery"
           >
        </div>
      </div>

      <div class="content-card-body">
        <StatePlaceholder
          :loading="isLoading"
          :error="errorState"
          :empty="!isLoading && filteredFuncionarios.length === 0"
          loading-title="Cargando funcionarios..."
          error-title="Error de Red"
          error-text="No se pudieron cargar los funcionarios. Por favor, intenta de nuevo."
          :show-retry-button="!!errorState"
          @retry="fetchFuncionarios"
          empty-icon="fas fa-user-slash"
          :empty-title="searchQuery ? 'Sin resultados' : 'No hay funcionarios'"
          :empty-text="searchQuery ? 'No se encontraron funcionarios que coincidan.' : 'Puedes crear el primer funcionario usando el botón de arriba.'"
        >
          <div class="table-responsive">
            <table class="table table-hover align-middle">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Celular</th>
                  <th class="text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="func in filteredFuncionarios" :key="func.id">
                  <td>{{ func.nombre }}</td>
                  <td>{{ func.email }}</td>
                  <td>{{ func.celular || 'N/A' }}</td>
                  <td class="actions-cell text-center">
                     <ActionButton
                        icon="fa-edit"
                        tooltip="Editar Funcionario"
                        variant="primary"
                        @click="handleAbrirFormulario(func)"
                      />
                     <ActionButton
                        icon="fa-trash"
                        tooltip="Eliminar Funcionario"
                        variant="danger"
                        class="ms-2"
                        @click="handleEliminar(func)"
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

import FuncionarioForm from '@/components/AdminDashboard/FuncionarioForm.vue';
import {
  crearFuncionario,
  obtenerFuncionarios,
  actualizarFuncionario,
  eliminarFuncionario
} from '@/services/adminService';

// --- El resto del script no cambia ---
const listaFuncionarios = ref([]);
const isLoading = ref(false);
const errorState = ref(null);
const isSaving = ref(false);
const searchQuery = ref('');
const filteredFuncionarios = computed(() => {
  if (!searchQuery.value) return listaFuncionarios.value;
  const queryLower = searchQuery.value.toLowerCase();
  return listaFuncionarios.value.filter(func =>
    (func.nombre && func.nombre.toLowerCase().includes(queryLower)) ||
    (func.email && func.email.toLowerCase().includes(queryLower))
  );
});
const mostrarFormulario = ref(false);
const esEdicion = ref(false);
const funcionarioSeleccionado = ref(null);
const funcionarioFormRef = ref(null);
const fetchFuncionarios = async () => {
  isLoading.value = true;
  errorState.value = null;
  try {
    listaFuncionarios.value = await obtenerFuncionarios();
  } catch (error) {
    errorState.value = error.message || 'Error desconocido';
    listaFuncionarios.value = [];
  } finally {
    isLoading.value = false;
  }
};
const handleGuardarFuncionario = async (funcionarioData) => {
  isSaving.value = true;
  try {
    if (esEdicion.value) {
      await actualizarFuncionario(funcionarioSeleccionado.value.id, funcionarioData);
      Swal.fire('Actualizado', 'Funcionario actualizado.', 'success');
    } else {
      await crearFuncionario(funcionarioData);
      Swal.fire('Creado', 'Funcionario registrado.', 'success');
    }
    handleCerrarFormulario();
    await fetchFuncionarios();
  } catch (error) {
    Swal.fire('Error', error.response?.data?.message || 'No se pudo guardar.', 'error');
  } finally {
    isSaving.value = false;
  }
};
const handleEliminar = (funcionario) => {
  Swal.fire({
    title: '¿Seguro?', html: `Se eliminará a <strong>${funcionario.nombre}</strong>.`, icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33', cancelButtonColor: '#6c757d', confirmButtonText: 'Sí, eliminar', cancelButtonText: 'Cancelar'
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        await eliminarFuncionario(funcionario.id);
        Swal.fire('Eliminado', 'El funcionario ha sido eliminado.', 'success');
        await fetchFuncionarios();
      } catch (error) {
        Swal.fire('Error', error.response?.data?.message || 'No se pudo eliminar.', 'error');
      }
    }
  });
};
const handleAbrirFormulario = (funcionario) => {
  esEdicion.value = !!funcionario;
  funcionarioSeleccionado.value = funcionario ? { ...funcionario } : null;
  mostrarFormulario.value = true;
};
const handleCerrarFormulario = () => {
  mostrarFormulario.value = false;
  funcionarioSeleccionado.value = null;
};
const submitFormulario = () => {
  if (funcionarioFormRef.value) {
    funcionarioFormRef.value.submit(); 
  }
};
onMounted(fetchFuncionarios);
</script>

<style scoped>
/* No se necesitan estilos aquí, ya que se heredan del archivo SCSS global */
</style>
