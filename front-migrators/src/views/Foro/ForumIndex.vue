<template>
  <div class="container mt-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1 class="mb-0">Foros de la Comunidad</h1>
      </div>
    <div v-if="loading" class="text-center p-5"><div class="spinner-border"></div></div>
    <div v-else class="forum-list">
      <div v-for="forum in forums" :key="forum.id" class="card forum-card mb-3">
        <div class="card-body">
          <div class="row align-items-center">
            <div class="col-md-7">
              <h4 class="card-title mb-1">
                <router-link :to="`/foro/${forum.id}`" class="text-decoration-none">
                  <i class="fas fa-comments me-2 text-primary"></i>{{ forum.titulo }}
                </router-link>
              </h4>
              <p class="card-text text-muted">{{ forum.descripcion }}</p>
            </div>
            <div class="col-md-2 text-center">
              <div class="stat-value">{{ forum.threadCount }}</div>
              <div class="stat-label">Hilos</div>
            </div>
            <div class="col-md-3 text-center">
              <div class="stat-value">{{ forum.postCount }}</div>
              <div class="stat-label">Mensajes</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// El script no necesita cambios, ya obtiene los nuevos datos
import { ref, onMounted } from 'vue';
import { fetchForums } from '@/services/forumService';
const forums = ref([]);
const loading = ref(true);
onMounted(async () => {
  try {
    const response = await fetchForums();
    forums.value = response.data;
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.forum-card {
  transition: all 0.2s ease-in-out;
  background-color: var(--color-surface);
  border-color: var(--color-border);
}
.forum-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-medium);
}
.stat-value {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-text);
}
.stat-label {
  font-size: 0.9rem;
  color: var(--color-text-muted);
}
.card-title a {
    color: var(--color-primary);
}
.card-title a:hover {
    color: var(--color-primary-light);
}
.card-text {
    color: var(--color-text-muted);
}
</style>