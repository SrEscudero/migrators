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
          :error="error"
          :empty="!isLoading && filteredFuncionarios.length === 0"
          loading-title="Cargando funcionarios..."
          error-title="Error de Red"
          :error-text="error"
          :show-retry-button="!!error"
          @retry="funcionarioStore.fetchFuncionarios"
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
                        @click="funcionarioStore.deleteFuncionario(func)"
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
import { useFuncionarioStore } from '@/stores/funcionarioStore.js';

import BaseModal from '@/components/shared/BaseModal.vue';
import StatePlaceholder from '@/components/shared/StatePlaceholder.vue';
import ActionButton from '@/components/shared/ActionButton.vue';
import FuncionarioForm from '@/components/AdminDashboard/FuncionarioForm.vue';

// --- LÓGICA DEL STORE ---
const funcionarioStore = useFuncionarioStore();
const { funcionarios, isLoading, error } = storeToRefs(funcionarioStore);

// --- ESTADO LOCAL DEL COMPONENTE (VISTA) ---
const isSaving = ref(false);
const searchQuery = ref('');
const mostrarFormulario = ref(false);
const esEdicion = ref(false);
const funcionarioSeleccionado = ref(null);
const funcionarioFormRef = ref(null);

// --- COMPUTED PROPERTIES ---
const filteredFuncionarios = computed(() => {
  if (!searchQuery.value) return funcionarios.value;
  const queryLower = searchQuery.value.toLowerCase();
  return funcionarios.value.filter(func =>
    (func.nombre?.toLowerCase().includes(queryLower)) ||
    (func.email?.toLowerCase().includes(queryLower))
  );
});

// --- MÉTODOS ---
const handleGuardarFuncionario = async (funcionarioData) => {
  isSaving.value = true;
  try {
    const success = await funcionarioStore.saveFuncionario(
      funcionarioData,
      esEdicion.value,
      funcionarioSeleccionado.value?.id
    );
    if (success) {
      handleCerrarFormulario();
    }
  } catch (err) {
    // El store y el interceptor ya manejan el error, no es necesario hacer nada aquí.
  } finally {
    isSaving.value = false;
  }
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
  // Este método sigue siendo útil para conectar el botón del modal con el formulario interno
  if (funcionarioFormRef.value) {
    funcionarioFormRef.value.submit(); 
  }
};

// --- CICLO DE VIDA ---
onMounted(() => {
  funcionarioStore.fetchFuncionarios();
});
</script>

<style scoped>
/* Estilos se heredan del SCSS global, no se necesita nada aquí */
</style>