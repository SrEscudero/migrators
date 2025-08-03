<template>
  <form @submit.prevent="handleSubmit" class="funcionario-form">
    <div class="row">
      <div class="col-md-6 mb-3">
        <label for="nombre" class="form-label">Nombre Completo</label>
        <input type="text" class="form-control" id="nombre" v-model="formData.nombre" required>
      </div>
      <div class="col-md-6 mb-3">
        <label for="email" class="form-label">Correo Electrónico</label>
        <input type="email" class="form-control" id="email" v-model="formData.email" required>
      </div>
    </div>
    <div class="row">
      <div class="col-md-6 mb-3">
        <label for="password" class="form-label">Contraseña</label>
        <input type="password" class="form-control" id="password" v-model="formData.password" :required="!isEditing"
          :placeholder="isEditing ? 'Dejar en blanco para no cambiar' : ''">
      </div>
      <div class="col-md-6 mb-3">
        <label for="celular" class="form-label">Celular (Opcional)</label>
        <input type="tel" class="form-control" id="celular" v-model="formData.celular">
      </div>
    </div>

    <hr class="my-3">

    <h5 class="mb-3">Permisos del Funcionario</h5>
    <div class="row">
      <div class="col-md-6">
        <div class="form-check form-switch mb-2">
          <input class="form-check-input" type="checkbox" role="switch" id="perm-clientes"
            v-model="formData.permisos.gestionarClientes">
          <label class="form-check-label" for="perm-clientes">Gestionar Clientes</label>
        </div>
        <div class="form-check form-switch mb-2">
          <input class="form-check-input" type="checkbox" role="switch" id="perm-noticias"
            v-model="formData.permisos.publicarNoticias">
          <label class="form-check-label" for="perm-noticias">Publicar Noticias</label>
        </div>
      </div>
      <div class="col-md-6">
        <div class="form-check form-switch mb-2">
          <input class="form-check-input" type="checkbox" role="switch" id="perm-estadisticas"
            v-model="formData.permisos.verEstadisticas">
          <label class="form-check-label" for="perm-estadisticas">Ver Estadísticas</label>
        </div>
      </div>
    </div>
    
    <button type="submit" class="d-none"></button>

  </form>
</template>

<script setup>
import { reactive, watch } from 'vue';

const props = defineProps({
  isEditing: {
    type: Boolean,
    default: false,
  },
  initialData: {
    type: Object,
    default: () => null,
  },
});

const emit = defineEmits(['save']);

// Función para generar la estructura de datos por defecto
const createDefaultData = () => ({
  nombre: '',
  email: '',
  password: '',
  celular: '',
  permisos: {
    gestionarClientes: true,
    publicarNoticias: false,
    verEstadisticas: false,
  }
});

const formData = reactive(createDefaultData());

// Watch para actualizar el formulario cuando se edita un funcionario
watch(() => props.initialData, (newData) => {
  if (newData) {
    Object.assign(formData, createDefaultData(), newData);
    formData.password = ''; // Limpiamos el campo de contraseña en edición
  } else {
    Object.assign(formData, createDefaultData());
  }
}, { immediate: true, deep: true });


const handleSubmit = () => {
  const dataToSubmit = { ...formData };
  
  if (props.isEditing && !dataToSubmit.password) {
    delete dataToSubmit.password;
  }
  
  // Emitimos el evento 'save' con el objeto de datos completo, incluyendo los permisos.
  emit('save', dataToSubmit);
};

// --- ¡LA SOLUCIÓN AL ERROR! ---
// Hacemos que la función handleSubmit esté disponible para el padre
// con el nombre 'submit'.
defineExpose({
  submit: handleSubmit
});
</script>

<style scoped>
.funcionario-form {
  background-color: #fff;
}
</style>