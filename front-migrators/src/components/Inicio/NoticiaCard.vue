<template>
    <div class="card shadow-sm h-100">
      <img
        :src="noticia.urlToImage || config.defaultImage"
        class="card-img-top"
        :alt="noticia.title"
        style="height: 200px; object-fit: cover;"
      />
      <div class="card-body d-flex flex-column">
        <h5 class="card-title">{{ noticia.title }}</h5>
        <p class="card-text flex-grow-1">{{ noticia.description || "Sin descripción" }}</p>
        <div class="d-grid gap-2">
          <router-link
            v-if="noticia.source === 'internal'"
            :to="`/noticia/${noticia.id}`"
            class="btn btn-primary"
          >
            Leer más
          </router-link>
          <a
            v-else
            :href="noticia.url"
            target="_blank"
            class="btn btn-secondary"
          >
            Ver en la fuente
          </a>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  // Elimina la importación de defineProps
  const props = defineProps({
    noticia: {
      type: Object,
      required: true,
    },
  });
  </script>
  
  <style scoped>
  .card {
    border: none;
    border-radius: 10px;
    transition: transform 0.3s ease;
  }
  
  .card:hover {
    transform: translateY(-5px);
  }
  
  .card-img-top {
    border-top-left-radius: 10px;
    border-top-right-radius: 10px;
  }
  </style>