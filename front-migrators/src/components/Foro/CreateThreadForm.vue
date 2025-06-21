<template>
  <div class="card mt-4">
    <div class="card-body">
      <h5 class="card-title">Crear Nuevo Hilo</h5>
      <form @submit.prevent="handleSubmit">
        <div class="mb-3">
          <label for="threadTitle" class="form-label">Título</label>
          <input type="text" class="form-control" id="threadTitle" v-model="title" required>
        </div>
        <div class="mb-3">
          <label for="threadContent" class="form-label">Mensaje</label>
          <textarea class="form-control" id="threadContent" rows="3" v-model="content" required></textarea>
        </div>
        <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
          {{ isSubmitting ? 'Publicando...' : 'Publicar Hilo' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { postNewThread } from '@/services/forumService';
import Swal from 'sweetalert2';

const props = defineProps({
  forumId: {
    type: [String, Number],
    required: true
  }
});

const emit = defineEmits(['thread-created']);

const title = ref('');
const content = ref('');
const isSubmitting = ref(false);

const handleSubmit = async () => {
  if (!title.value || !content.value) {
    Swal.fire('Campos vacíos', 'Por favor, completa el título y el mensaje.', 'warning');
    return;
  }

  isSubmitting.value = true;
  try {
    const newThreadData = {
      titulo: title.value,
      contenido: content.value
    };
    const response = await postNewThread(props.forumId, newThreadData);
    
    emit('thread-created', response.data);
    
    title.value = '';
    content.value = '';

    Swal.fire('¡Éxito!', 'Tu hilo ha sido publicado.', 'success');
  } catch (error) {
    // El interceptor de Axios ya maneja el SweetAlert de error.
    console.error("Error en el componente al crear hilo:", error);
  } finally {
    isSubmitting.value = false;
  }
};
</script>