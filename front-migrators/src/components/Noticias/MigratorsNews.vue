<template>
  <div class="migrators-news-section">
    <h2 class="section-title text-center">Noticias de Migrators</h2>

    <div v-if="loading" class="text-center my-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Cargando...</span>
      </div>
    </div>

    <div v-else-if="paginatedNews.length > 0" class="row g-4">
      <div
        v-for="newsItem in paginatedNews"
        :key="newsItem.id"
        class="col-12 col-md-6 col-lg-4 d-flex align-items-stretch"
      >
        <div class="card h-100 shadow-sm news-card">
          <router-link
            :to="`/noticias-migrators/${newsItem.id}`"
            class="news-card-link-internal"
            :aria-label="`Ver detalle de la noticia: ${newsItem.titulo}`"
          >
            <div class="card-img-container">
              <img
                :src="newsItem.imagen_url || 'https://via.placeholder.com/400x220/E9ECEF/6C757D?text=Migrators'"
                class="card-img-top"
                :alt="`Imagen para ${newsItem.titulo}`"
                loading="lazy"
              />
              <span v-if="newsItem.destacada" class="badge bg-warning text-dark position-absolute top-0 end-0 m-2 featured-badge">
                <i class="fas fa-star me-1"></i>Destacada
              </span>
            </div>
          </router-link>
          <div class="card-body d-flex flex-column">
            <h5 class="card-title">
              <router-link
                :to="`/noticias-migrators/${newsItem.id}`"
                class="title-link"
                :aria-label="`Ver detalle de la noticia: ${newsItem.titulo}`"
              >
                {{ newsItem.titulo }}
              </router-link>
            </h5>
            <p class="card-text text-secondary flex-grow-1">
              {{ truncateText(newsItem.contenido, 120) }}
            </p>
            <div class="card-meta mt-2">
              <small class="text-muted d-block mb-1">
                <i class="fas fa-user-edit me-1 meta-icon"></i> Por: {{ newsItem.autor || 'Equipo Migrators' }}
              </small>
              <small class="text-muted d-block">
                <i class="fas fa-calendar-alt me-1 meta-icon"></i>
                {{ formatDate(newsItem.fecha_publicacion) }}
              </small>
            </div>

            <a
              v-if="newsItem.link"
              :href="newsItem.link"
              target="_blank"
              rel="noopener noreferrer"
              class="btn btn-sm btn-outline-primary mt-3 align-self-start read-more-btn"
              :aria-label="`Leer artículo completo de ${newsItem.titulo} en la fuente original`"
            >
              Leer en la Fuente <i class="fas fa-external-link-alt ms-1"></i>
            </a>
            <router-link
              v-else
              :to="`/noticias-migrators/${newsItem.id}`"
              class="btn btn-sm btn-outline-primary mt-3 align-self-start read-more-btn"
            >
              Ver Detalles <i class="fas fa-arrow-right ms-1"></i>
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="alert alert-info text-center mt-4">
      No hay noticias disponibles en este momento.
    </div>

    <div v-if="error" class="alert alert-danger text-center mt-4">
      {{ error }}
    </div>

    <nav aria-label="Paginación de noticias" class="mt-5" v-if="totalPages > 1">
      <ul class="pagination justify-content-center flex-wrap gap-2">
        <li class="page-item" :class="{ disabled: currentPage === 1 }">
          <button class="page-link rounded-start" @click="prevPage" aria-label="Página anterior">
            <i class="fas fa-chevron-left"></i>
          </button>
        </li>
        <li class="page-item" :class="{ active: page === currentPage }" v-for="page in visiblePages" :key="page">
          <button class="page-link" @click="changePage(page)" :aria-label="`Ir a página ${page}`">
            {{ page }}
          </button>
        </li>
        <li class="page-item" :class="{ disabled: currentPage === totalPages }">
          <button class="page-link rounded-end" @click="nextPage" aria-label="Página siguiente">
            <i class="fas fa-chevron-right"></i>
          </button>
        </li>
      </ul>
    </nav>

  </div>
</template>

<script>
import { ref, onMounted, computed } from "vue";
import axios from "axios";

export default {
  name: 'MigratorsNews',
  setup() {
    const newsList = ref([]);
    const loading = ref(true);
    const error = ref(null);

    // Nuevos estados para paginación
    const currentPage = ref(1);
    const pageSize = 6; // Mostrar 6 noticias por página

    const fetchNews = async () => {
      loading.value = true;
      error.value = null;
      try {
        // Asumiendo que tu API devuelve TODAS las noticias publicadas.
        // Si tienes muchísimas noticias, lo ideal sería que la paginación
        // la gestione el backend (ej. /api/noticias/publicas?page=1&limit=6)
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/noticias/publicas`);
        newsList.value = (response.data || []).map(item => ({
          ...item,
          destacada: item.destacada || false
        }));
      } catch (err) {
        console.error("❌ Error al obtener noticias publicadas de Migrators:", err.response?.data || err.message);
        error.value = "No se pudieron cargar las noticias de Migrators en este momento.";
      } finally {
        loading.value = false;
      }
    };

    // Propiedad computada para ordenar las noticias (la mantenemos igual)
    const sortedNewsList = computed(() => {
      const sorted = [...newsList.value];
      sorted.sort((a, b) => {
        if (a.destacada && !b.destacada) return -1;
        if (!a.destacada && b.destacada) return 1;

        const dateA = a.fecha_publicacion ? new Date(a.fecha_publicacion) : new Date(0);
        const dateB = b.fecha_publicacion ? new Date(b.fecha_publicacion) : new Date(0);

        return dateB.getTime() - dateA.getTime();
      });
      return sorted;
    });

    // Propiedad computada para obtener las noticias de la página actual
    const paginatedNews = computed(() => {
      const start = (currentPage.value - 1) * pageSize;
      const end = start + pageSize;
      return sortedNewsList.value.slice(start, end);
    });

    // Propiedad computada para el número total de páginas
    const totalPages = computed(() => {
      if (sortedNewsList.value.length === 0) return 1;
      return Math.ceil(sortedNewsList.value.length / pageSize);
    });

    // Propiedad computada para las páginas visibles en la paginación (ej. 1, 2, 3, ..., 7)
    const visiblePages = computed(() => {
        const pages = [];
        const total = totalPages.value;
        const current = currentPage.value;
        const maxVisible = 5; // Número máximo de botones de página a mostrar directamente (ej. 1 2 3 4 5)

        if (total <= maxVisible) {
            for (let i = 1; i <= total; i++) {
                pages.push(i);
            }
        } else {
            let startPage = Math.max(1, current - Math.floor(maxVisible / 2));
            let endPage = Math.min(total, startPage + maxVisible - 1);

            if (endPage - startPage + 1 < maxVisible) { // Ajustar si no se llenan los maxVisible al final
                startPage = Math.max(1, endPage - maxVisible + 1);
            }

            for (let i = startPage; i <= endPage; i++) {
                pages.push(i);
            }

            // Añadir elipses y primera/última página si es necesario
            if (startPage > 1) {
                if (startPage > 2) pages.unshift('...');
                pages.unshift(1);
            }
            if (endPage < total) {
                if (endPage < total - 1) pages.push('...');
                pages.push(total);
            }
        }
        return pages;
    });


    // Métodos para cambiar de página
    const changePage = (page) => {
      if (typeof page === 'number' && page >= 1 && page <= totalPages.value) {
        currentPage.value = page;
        window.scrollTo({ top: 0, behavior: 'smooth' }); // Opcional: desplazar al inicio de la página al cambiar
      }
    };

    const prevPage = () => {
      if (currentPage.value > 1) {
        changePage(currentPage.value - 1);
      }
    };

    const nextPage = () => {
      if (currentPage.value < totalPages.value) {
        changePage(currentPage.value + 1);
      }
    };

    const truncateText = (text, length) => {
      if (!text) return 'Contenido no disponible.';
      const cleanText = text.replace(/<[^>]+>/g, '');
      if (cleanText.length <= length) return cleanText;
      return cleanText.substring(0, length) + "...";
    };

    const formatDate = (dateString) => {
      if (!dateString) return 'Fecha no disponible';
      try {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('es-ES', options);
      } catch (e) {
        return 'Fecha inválida';
      }
    };

    onMounted(fetchNews);

    return {
      newsList,
      sortedNewsList,
      paginatedNews, // Usar esta en el template para el v-for
      loading,
      error,
      currentPage,
      totalPages,
      visiblePages,
      changePage,
      prevPage,
      nextPage,
      truncateText,
      formatDate
    };
  },
};
</script>

<style scoped>
.migrators-news-section {
  padding: 3rem 0;
}

.section-title {
  color: var(--color-primary);
  font-size: 2.5rem;
  font-weight: var(--font-weight-bold);
  margin-bottom: 3rem;
  position: relative;
  display: inline-block;
  left: 50%;
  transform: translateX(-50%);
  white-space: nowrap;
}

.section-title::after {
  content: '';
  display: block;
  width: 60px;
  height: 4px;
  background-color: var(--color-accent);
  margin: 0.75rem auto 0;
  border-radius: 2px;
}

.news-card {
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-md);
  transition: transform var(--transition-speed) ease, box-shadow var(--transition-speed) ease;
  background-color: var(--color-surface);
  display: flex;
  flex-direction: column;
  height: 100%;
}

.news-card:hover {
  transform: translateY(-8px);
  box-shadow: var(--shadow-medium);
}

.card-img-container {
  width: 100%;
  height: 200px;
  overflow: hidden;
  border-top-left-radius: var(--border-radius-md);
  border-top-right-radius: var(--border-radius-md);
  position: relative;
}

.card-img-top {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.news-card:hover .card-img-top {
  transform: scale(1.05);
}

.featured-badge {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.3em 0.6em;
}

.card-body {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.card-title {
  font-size: 1.15rem;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 0.75rem;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  min-height: 3.45em;
}

.card-text {
  font-size: 0.9rem;
  line-height: 1.6;
  color: var(--color-text-muted);
  margin-bottom: 1rem;
  flex-grow: 1;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  min-height: 5.76em;
}

.card-meta {
  font-size: 0.8rem;
  margin-bottom: 1rem;
  color: var(--color-text-muted);
}

.meta-icon {
  color: var(--color-primary-light);
}

.read-more-btn {
  font-weight: var(--font-weight-medium);
  font-size: 0.85rem;
  padding: 0.5rem 1rem;
  border-color: var(--color-primary);
  color: var(--color-primary);
  margin-top: auto;
}

.read-more-btn:hover {
  background-color: var(--color-primary);
  color: white;
}

.news-card-link-internal, .title-link {
  text-decoration: none;
  color: inherit;
}
.title-link:hover {
  color: var(--color-primary);
}

.pagination .page-item .page-link {
  border-radius: 0.5rem !important;
  margin: 0 0.25rem;
  min-width: 40px;
  text-align: center;
  color: var(--color-primary);
  border: 1px solid var(--color-border);
  transition: all var(--transition-speed) ease;
}

.pagination .page-item.active .page-link {
  background-color: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
  z-index: 2;
  box-shadow: 0 2px 5px rgba(29, 53, 87, 0.2);
}

.pagination .page-item .page-link:hover:not(.active) {
  background-color: var(--color-background);
  color: var(--color-primary-light);
  border-color: var(--color-border);
}

.pagination .page-item.disabled .page-link {
  color: var(--color-text-muted);
  pointer-events: none;
  background-color: var(--color-surface);
  border-color: var(--color-border);
  opacity: 0.6;
}
</style>