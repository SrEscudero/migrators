<template>
  <div class="container mt-4">
    <CreateThreadForm :forum-id="forumId" @thread-created="handleNewThread" />

    <hr class="my-4">

    <h2>Hilos del Foro</h2>
    <div v-if="loading">Cargando hilos...</div>
    <div v-else-if="threads.length > 0">
        <ul class="list-group">
            <li v-for="thread in threads" :key="thread.id" class="list-group-item">
                {{ thread.titulo }}
            </li>
        </ul>
    </div>
    <div v-else class="alert alert-info">
        Aún no hay hilos en este foro. ¡Sé el primero en crear uno!
    </div>
    
    <router-link to="/foro" class="btn btn-secondary mt-3">Volver a los foros</router-link>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { fetchThreadsByForum } from '@/services/forumService';
import CreateThreadForm from '@/components/Foro/CreateThreadForm.vue';

const props = defineProps({
  forumId: {
    type: [String, Number],
    required: true
  }
});

const threads = ref([]);
const loading = ref(true);

const loadThreads = async () => {
    loading.value = true;
    try {
        const response = await fetchThreadsByForum(props.forumId);
        threads.value = response.data;
    } finally {
        loading.value = false;
    }
};

const handleNewThread = (newThread) => {
    threads.value.unshift(newThread);
};

onMounted(loadThreads);
</script>