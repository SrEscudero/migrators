<template>
  <div class="container mt-4">
    <div v-if="loading" class="text-center p-5"><div class="spinner-border"></div></div>
    <div v-else-if="thread">
      <h2 class="mb-4">{{ thread.titulo }}</h2>
      
      <div class="post-card original-post mb-4">
        <div class="post-author">
          <div class="avatar">{{ thread.autorNombre.charAt(0) }}</div>
          <div class="author-info">
            <strong>{{ thread.autorNombre }}</strong>
            <small class="text-muted">Publicado el {{ new Date(thread.fecha_creacion).toLocaleString() }}</small>
          </div>
        </div>
        <div class="post-content">
          <p style="white-space: pre-wrap;">{{ thread.contenido }}</p>
        </div>
      </div>

      <div v-for="post in posts" :key="post.id" class="post-card mb-3">
        <div class="post-author">
          <div class="avatar">{{ post.autorNombre.charAt(0) }}</div>
          <div class="author-info">
            <strong>{{ post.autorNombre }}</strong>
            <small class="text-muted">Respondió el {{ new Date(post.fecha_creacion).toLocaleString() }}</small>
          </div>
        </div>
        <div class="post-content">
          <p style="white-space: pre-wrap;">{{ post.contenido }}</p>
        </div>
      </div>
      
      <CreatePostForm :thread-id="id" @post-created="handleNewPost" />
    </div>
    <router-link v-if="thread" :to="`/foro/${thread.forum_id}`" class="btn btn-secondary mt-4 mb-5">Volver a la lista de hilos</router-link>
  </div>
</template>

<script setup>
// El script no necesita cambios, ya obtiene los nuevos datos
import { ref, onMounted } from 'vue';
import { fetchThreadById } from '@/services/forumService';
import CreatePostForm from '@/components/Foro/CreatePostForm.vue';

const props = defineProps({ id: { type: [String, Number], required: true } });
const thread = ref(null);
const posts = ref([]);
const loading = ref(true);

onMounted(async () => { /* ...código existente... */ });
const handleNewPost = (newPost) => { posts.value.push(newPost); };
</script>

<style scoped>
.post-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: #fff;
}
.original-post {
    border-left: 4px solid var(--bs-primary);
}
.post-author {
  display: flex;
  align-items: center;
  padding: 1rem;
  background-color: #f8f9fa;
  border-bottom: 1px solid #e0e0e0;
}
.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: var(--bs-secondary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin-right: 1rem;
}
.author-info strong { display: block; }
.post-content {
  padding: 1.5rem;
}
</style>