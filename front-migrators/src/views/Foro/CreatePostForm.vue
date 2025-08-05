<template>
  <div class="card shadow-2 border-round p-4 mt-5">
    <h5 class="text-xl font-semibold mb-3">Escribe una respuesta</h5>
    <div class="flex flex-column gap-3">
      <Textarea
        v-model="content"
        rows="4"
        placeholder="Comparte tus pensamientos..."
        class="w-full"
        autoResize
        :invalid="error"
      />
      <small v-if="error" class="p-error">{{ error }}</small>
      <div class="flex justify-content-end">
        <Button
          label="Publicar Respuesta"
          icon="pi pi-send"
          @click="handleSubmit"
          :loading="isSubmitting"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useToast } from 'primevue/usetoast';

// Importa tu servicio del foro
import { postNewPost } from '@/services/forumService';

// Importa componentes de PrimeVue
import Textarea from 'primevue/textarea';
import Button from 'primevue/button';

const props = defineProps({
  threadId: {
    type: [String, Number],
    required: true
  }
});

const emit = defineEmits(['post-created']);

const toast = useToast();
const content = ref('');
const isSubmitting = ref(false);
const error = ref(null);

const handleSubmit = async () => {
  if (!content.value.trim()) {
    error.value = 'El contenido no puede estar vacío.';
    return;
  }
  error.value = null;
  isSubmitting.value = true;

  try {
    const response = await postNewPost(props.threadId, { contenido: content.value });
    
    // Emite el nuevo post al componente padre (ThreadView)
    emit('post-created', response.data);
    
    // Limpia el formulario
    content.value = '';
    
    toast.add({ 
      severity: 'success', 
      summary: 'Éxito', 
      detail: 'Tu respuesta ha sido publicada.', 
      life: 3000 
    });
  } catch (err) {
    toast.add({ 
      severity: 'error', 
      summary: 'Error', 
      detail: 'No se pudo publicar tu respuesta.', 
      life: 3000 
    });
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
.card {
  background-color: var(--color-surface);
  border-color: var(--color-border);
}
</style>