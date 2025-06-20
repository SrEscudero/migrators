<template>
  <div class="funcionario-form-card card border-light shadow-sm">
    <div class="card-body">
      <h4 class="card-title mb-4">Registro de Nuevo Funcionario</h4>
      <form @submit.prevent="handleSubmit">
        <div class="row">
          <div class="col-md-6 mb-3">
            <label for="nombre" class="form-label">Nombre Completo</label>
            <input type="text" class="form-control" id="nombre" v-model="funcionario.nombre" required>
          </div>
          <div class="col-md-6 mb-3">
            <label for="email" class="form-label">Correo Electrónico</label>
            <input type="email" class="form-control" id="email" v-model="funcionario.email" required>
          </div>
        </div>
        <div class="row">
          <div class="col-md-6 mb-3">
            <label for="password" class="form-label">Contraseña</label>
            <input type="password" class="form-control" id="password" v-model="funcionario.password" required>
          </div>
          <div class="col-md-6 mb-3">
            <label for="celular" class="form-label">Celular (Opcional)</label>
            <input type="tel" class="form-control" id="celular" v-model="funcionario.celular">
          </div>
        </div>

        <hr class="my-4">

        <!-- Sección de Permisos (Placeholder) -->
        <h5 class="mb-3">Permisos del Funcionario</h5>
        <div class="row">
          <div class="col-md-6">
            <div class="form-check form-switch mb-2">
              <input class="form-check-input" type="checkbox" role="switch" id="perm-clientes" v-model="funcionario.permisos.gestionarClientes">
              <label class="form-check-label" for="perm-clientes">Gestionar Clientes</label>
            </div>
            <div class="form-check form-switch mb-2">
              <input class="form-check-input" type="checkbox" role="switch" id="perm-noticias" v-model="funcionario.permisos.publicarNoticias">
              <label class="form-check-label" for="perm-noticias">Publicar Noticias</label>
            </div>
          </div>
          <div class="col-md-6">
             <div class="form-check form-switch mb-2">
              <input class="form-check-input" type="checkbox" role="switch" id="perm-estadisticas" v-model="funcionario.permisos.verEstadisticas">
              <label class="form-check-label" for="perm-estadisticas">Ver Estadísticas</label>
            </div>
          </div>
        </div>

        <!-- Botones de Acción -->
        <div class="d-flex justify-content-end gap-2 mt-4">
          <button type="button" class="btn btn-outline-secondary" @click="$emit('cancelar')">Cancelar</button>
          <button type="submit" class="btn btn-primary" :disabled="isLoading">
            <span v-if="isLoading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            <span v-else>Guardar Funcionario</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';

// Este componente emitirá eventos al padre (AdminDashboard)
const emit = defineEmits(['guardar', 'cancelar']);

const isLoading = ref(false);
const funcionario = reactive({
  nombre: '',
  email: '',
  password: '',
  celular: '',
  permisos: { // Placeholder para los permisos
    gestionarClientes: true,
    publicarNoticias: false,
    verEstadisticas: false,
  }
});

const handleSubmit = () => {
  isLoading.value = true;
  // Creamos una copia para no enviar el objeto de permisos al backend aún
  const dataToSubmit = {
    nombre: funcionario.nombre,
    email: funcionario.email,
    password: funcionario.password,
    celular: funcionario.celular,
  };
  emit('guardar', dataToSubmit);
  // El padre (AdminDashboard) se encargará de la lógica de la API
  // y de resetear el estado de isLoading.
};
</script>

<style scoped>
.funcionario-form-card {
  background-color: #fff;
}
</style>
