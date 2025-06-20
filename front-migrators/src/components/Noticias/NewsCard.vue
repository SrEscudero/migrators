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
  border: 1px solid #e9ecef;
  border-radius: 0.75rem; /* Consistencia */
  transition: transform 0.25s ease-in-out, box-shadow 0.25s ease-in-out;
  background-color: #fff;
  overflow: hidden; /* Para el overlay de imagen y bordes redondeados */
}
.news-card-item:hover {
  transform: translateY(-7px);
  box-shadow: 0 14px 28px rgba(0,0,0,0.1), 0 10px 10px rgba(0,0,0,0.08); /* Sombra más pronunciada */
}

.news-card-link {
  text-decoration: none;
  color: inherit; /* Heredar color de texto */
  display: flex;
  flex-direction: column;
  height: 100%;
}
.news-card-link:hover .card-title {
    color: var(--pg-noticias-primary-accent, #007bff); /* Color primario al hacer hover en el título */
}


.card-img-container {
  width: 100%;
  height: 200px; /* Altura fija y consistente */
  position: relative;
  background-color: #f0f0f0; /* Color de fondo mientras carga la imagen */
}
.card-img-top {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.35s ease-out;
}
.news-card-item:hover .card-img-top {
  transform: scale(1.08); /* Zoom más notable */
}
.img-overlay {
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  background: linear-gradient(to bottom, rgba(0,0,0,0) 70%, rgba(0,0,0,0.25) 100%);
  opacity: 1; /* Siempre visible para dar profundidad */
  pointer-events: none; /* Para que no interfiera con el enlace */
}

.card-body {
  padding: 1rem 1.25rem; /* Padding ajustado */
  flex-grow: 1; /* Para que el cuerpo crezca y empuje el footer */
}
.card-title {
  font-size: 1rem; /* Reducido ligeramente para noticias externas */
  font-weight: 600;
  color: var(--pg-noticias-title-color, #2c3e50);
  margin-bottom: 0.5rem;
  line-height: 1.3;
  /* Truncado de título a 2 líneas */
  height: 2.6em; /* Aprox. 2 líneas basado en line-height */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;  
  overflow: hidden;
  text-overflow: ellipsis;
}
.card-text {
  font-size: 0.85rem;
  line-height: 1.5;
  color: var(--pg-noticias-text-color, #495057);
  margin-bottom: 0.75rem;
  /* Truncado de descripción a 3-4 líneas */
  height: 5.1em; /* Aprox. 3 líneas basado en line-height (0.85rem * 1.5 * 3) */
  display: -webkit-box;
  -webkit-line-clamp: 4; /* Aumentado a 4 líneas */
  -webkit-box-orient: vertical;  
  overflow: hidden;
  text-overflow: ellipsis;
}

.news-card-footer {
  padding: 0.75rem 1.25rem;
  background-color: transparent; /* O un color muy sutil #fcfcfc */
  border-top: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.news-source {
  font-size: 0.78rem; /* Más pequeño */
  color: var(--pg-noticias-text-muted-color, #6c757d);
  font-style: italic;
}
.external-link-indicator {
    font-size: 0.8rem;
    color: var(--pg-noticias-primary-accent, #007bff);
    font-weight: 500;
}
.external-link-indicator i {
    font-size: 0.7rem; /* Ícono más pequeño */
}
</style>