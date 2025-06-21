<template>
  <div class="container mt-4">
    <div class="d-flex justify-content-between align-items-center mb-3">
        <h2 class="mb-0">Hilos de Discusión</h2>
        <button class="btn btn-primary" @click="showForm = !showForm">
            <i class="fas fa-plus me-2"></i>Crear Nuevo Hilo
        </button>
    </div>
    <CreateThreadForm v-if="showForm" :forum-id="forumId" @thread-created="handleNewThread" class="mb-4" />

    <div class="list-group thread-list">
      <div v-if="loading" class="text-center p-5"><div class="spinner-border"></div></div>
      <router-link v-else v-for="thread in threads" :key="thread.id" :to="`/threads/${thread.id}`" class="list-group-item list-group-item-action">
        <div class="row align-items-center">
          <div class="col-md-7">
            <h5 class="mb-1">{{ thread.titulo }}</h5>
            <small class="text-muted">por {{ thread.autorNombre }}</small>
          </div>
          <div class="col-md-2 text-center">
            <span class="badge bg-primary rounded-pill">{{ thread.replyCount }}</span> Respuestas
          </div>
          <div class="col-md-3 text-center">
            <span class="badge bg-secondary rounded-pill">{{ thread.views }}</span> Vistas
          </div>
        </div>
      </router-link>
      <div v-if="!loading && threads.length === 0" class="list-group-item">
        Aún no hay hilos en este foro. ¡Sé el primero en crear uno!
      </div>
    </div>
    <router-link to="/foro" class="btn btn-secondary mt-4">Volver a los foros</router-link>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { fetchThreadsByForum } from '@/services/forumService';
import CreateThreadForm from '@/components/Foro/CreateThreadForm.vue';

const props = defineProps({ forumId: { type: [String, Number], required: true } });
const threads = ref([]);
const loading = ref(true);
const showForm = ref(false);

const loadThreads = async () => { /* ...código existente... */ };
const handleNewThread = (newThread) => {
    // Para que la nueva info (replyCount, etc.) esté disponible, volvemos a cargar todo
    loadThreads();
    showForm.value = false; // Ocultamos el formulario después de crear
};
onMounted(loadThreads);
</script>