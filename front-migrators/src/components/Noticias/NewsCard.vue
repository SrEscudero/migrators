<template>
  <div class="card h-100 shadow-sm news-card-item">
    <a :href="news.url" target="_blank" rel="noopener noreferrer" class="news-card-link d-flex flex-column">
      <div class="card-img-container">
        <img
          :src="news.urlToImage || defaultImage"
          :alt="`Imagen para: ${news.title || 'noticia externa'}`"
          class="card-img-top"
          loading="lazy"
        />
        <div class="img-overlay"></div>
      </div>
      <div class="card-body d-flex flex-column">
        <h6 class="card-title mb-2">{{ news.title || "Título no disponible" }}</h6>
        <p class="card-text flex-grow-1">{{ news.description || "Descripción no disponible." }}</p>
      </div>
      <div class="card-footer news-card-footer">
        <small class="text-muted news-source">{{ news.source?.name || 'Fuente Desconocida' }}</small>
        <span class="external-link-indicator ms-auto">
            Ver más <i class="fas fa-external-link-alt fa-xs"></i>
        </span>
      </div>
    </a>
  </div>
</template>

<script>
import { computed } from 'vue';

export default {
  name: 'NewsCard',
  props: {
    news: { // Cambiado de Object a un tipo más específico si es posible, o validación
      type: Object,
      required: true,
      default: () => ({ title: 'Noticia sin título', url: '#', source: {name: ''} }) // Default más completo
    }
  },
  setup() {
    const defaultImage = computed(() => 'https://images.unsplash.com/photo-1495020689067-958852a7765e?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=60'); // Placeholder más genérico
    return { defaultImage };
  }
};
</script>

<style scoped>
.news-card-item {
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-md);
  transition: transform 0.25s ease-in-out, box-shadow 0.25s ease-in-out;
  background-color: var(--color-surface);
  overflow: hidden;
}
.news-card-item:hover {
  transform: translateY(-7px);
  box-shadow: var(--shadow-medium);
}

.news-card-link {
  text-decoration: none;
  color: inherit;
  display: flex;
  flex-direction: column;
  height: 100%;
}
.news-card-link:hover .card-title {
    color: var(--color-primary);
}


.card-img-container {
  width: 100%;
  height: 200px;
  position: relative;
  background-color: var(--color-background);
}
.card-img-top {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.35s ease-out;
}
.news-card-item:hover .card-img-top {
  transform: scale(1.08);
}
.img-overlay {
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  background: linear-gradient(to bottom, rgba(0,0,0,0) 70%, rgba(0,0,0,0.25) 100%);
  opacity: 1;
  pointer-events: none;
}

.card-body {
  padding: 1rem 1.25rem;
  flex-grow: 1;
}
.card-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 0.5rem;
  line-height: 1.3;
  height: 2.6em;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;  
  overflow: hidden;
  text-overflow: ellipsis;
}
.card-text {
  font-size: 0.85rem;
  line-height: 1.5;
  color: var(--color-text-muted);
  margin-bottom: 0.75rem;
  height: 5.1em;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;  
  overflow: hidden;
  text-overflow: ellipsis;
}

.news-card-footer {
  padding: 0.75rem 1.25rem;
  background-color: transparent;
  border-top: 1px solid var(--color-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.news-source {
  font-size: 0.78rem;
  color: var(--color-text-muted);
  font-style: italic;
}
.external-link-indicator {
    font-size: 0.8rem;
    color: var(--color-primary);
    font-weight: var(--font-weight-medium);
}
.external-link-indicator i {
    font-size: 0.7rem;
}
</style>