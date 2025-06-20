<template>
  <div class="news-list-container mt-4">
    <div v-if="loading" class="text-center py-5 loading-indicator">
      <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;">
        <span class="visually-hidden">Cargando...</span>
      </div>
      <p class="text-muted mt-3">Buscando noticias externas...</p>
    </div>

    <div v-else-if="error" class="alert alert-warning text-center shadow-sm" role="alert">
      <i class="fas fa-exclamation-triangle me-2"></i> {{ error }}
    </div>

    <div v-else-if="paginatedNews.length > 0">
      <div class="row g-4">
        <div 
          v-for="newsItem in paginatedNews" 
          :key="newsItem.url || newsItem.title" 
          class="col-12 col-md-6 col-lg-4 d-flex align-items-stretch"
        >
          <NewsCard :news="newsItem" />
        </div>
      </div>

      <nav v-if="totalPages > 1" aria-label="Paginación de noticias externas" class="mt-5 d-flex justify-content-center">
        <ul class="pagination custom-pagination">
          <li class="page-item" :class="{ disabled: currentPage === 1 }">
            <button class="page-link" @click="prevPage" aria-label="Página anterior">
              <i class="fas fa-chevron-left"></i>
            </button>
          </li>
          <li 
            v-for="page in paginationRange" 
            :key="page.toString()"  
            class="page-item" 
            :class="{ active: page === currentPage, 'disabled': page === '...', 'ellipsis': page === '...' }"
          >
            <button v-if="page !== '...'" class="page-link" @click="goToPage(page)">{{ page }}</button>
            <span v-else class="page-link">...</span>
          </li>
          <li class="page-item" :class="{ disabled: currentPage === totalPages }">
            <button class="page-link" @click="nextPage" aria-label="Página siguiente">
              <i class="fas fa-chevron-right"></i>
            </button>
          </li>
        </ul>
      </nav>
    </div>
    <div v-else class="text-center py-5 no-results-message">
        <i class="fas fa-newspaper fa-3x text-muted mb-3"></i>
        <p class="text-muted fs-5">
          {{ filters.query || filters.category ? 'No se encontraron noticias con los filtros actuales.' : 'No hay noticias externas para mostrar.' }}
        </p>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'; // Eliminado onMounted si watch tiene immediate:true
import NewsCard from './NewsCard.vue';
// import { getExternalNews } from '@/services/externalNewsService'; // Ejemplo si usaras un servicio dedicado

export default {
  name: 'NewsList',
  props: {
    filters: {
      type: Object,
      required: true
    }
  },
  components: { NewsCard },
  setup(props) {
    const newsList = ref([]);
    const loading = ref(false); // Iniciar en false, se activa en fetchNews
    const error = ref(null);
    const currentPage = ref(1);
    const pageSize = 9; // 3x3 grid

    const fetchNews = async () => {
      loading.value = true;
      error.value = null;
      // currentPage.value = 1; // Resetear a primera página solo si los filtros cambian significativamente,
                              // no necesariamente en cada llamada a fetchNews si es por paginación.
                              // El watch se encarga de esto al cambiar props.filters.

      try {
        // Determina la URL base para el proxy de noticias externas en tu backend
        // Esta URL debe apuntar a TU backend, que luego llama a la API externa.
        const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000"; 
        // Asume que tienes un endpoint en tu backend como /api/external-news-proxy o similar
        // Y que tu `newsRoutes.js` (del backend, el que mostraste para external news) está montado en `/api/news`
        // Por lo tanto, la URL aquí debería ser para ESE endpoint.
        let API_URL_FETCH = `${baseUrl}/api/news`; // Si este es tu proxy para noticias EXTERNAS

        const queryParams = new URLSearchParams();
        if (props.filters.query) queryParams.append("q", props.filters.query);
        if (props.filters.category) queryParams.append("category", props.filters.category);
        
        if (queryParams.toString()) {
          API_URL_FETCH += `?${queryParams.toString()}`;
        }
        
        console.log(`[NewsList] Fetching from: ${API_URL_FETCH}`);
        const response = await fetch(API_URL_FETCH);
        if (!response.ok) {
          const errorData = await response.text(); // Intenta obtener más detalles del error
          throw new Error(`Error ${response.status}: ${response.statusText}. ${errorData}`);
        }

        const data = await response.json();
        // Adapta esto según la respuesta de TU PROXY de backend.
        // Si tu proxy ya devuelve un array de noticias directamente:
        newsList.value = Array.isArray(data) ? data : (data.articles || []);
      } catch (err) {
        console.error("❌ Error fetching external news:", err.message);
        error.value = err.message || "No se pudieron cargar las noticias externas. Intenta más tarde.";
      } finally {
        loading.value = false;
      }
    };

    const totalPages = computed(() => {
      if (!newsList.value || newsList.value.length === 0) return 1;
      return Math.ceil(newsList.value.length / pageSize);
    });

    const paginatedNews = computed(() => {
      if (!newsList.value) return [];
      const start = (currentPage.value - 1) * pageSize;
      return newsList.value.slice(start, start + pageSize);
    });

    const prevPage = () => {
      if (currentPage.value > 1) currentPage.value--;
    };
    const nextPage = () => {
      if (currentPage.value < totalPages.value) currentPage.value++;
    };
    const goToPage = (page) => {
      if (page !== '...' && page >= 1 && page <= totalPages.value) {
        currentPage.value = page;
      }
    };

    const paginationRange = computed(() => {
        const current = currentPage.value;
        const last = totalPages.value;
        const delta = 1; // Menos páginas a cada lado para un look más compacto
        const left = current - delta;
        const right = current + delta + 1;
        const range = [];
        const rangeWithDots = [];
        let l;

        if (last <= 1) return []; // No mostrar paginación si solo hay una página o ninguna

        for (let i = 1; i <= last; i++) {
            if (i === 1 || i === last || (i >= left && i < right)) {
                range.push(i);
            }
        }

        for (let i of range) {
            if (l) {
                if (i - l === 2) {
                    rangeWithDots.push(l + 1);
                } else if (i - l !== 1) {
                    rangeWithDots.push('...');
                }
            }
            rangeWithDots.push(i);
            l = i;
        }
        return rangeWithDots;
    });

    watch(() => props.filters, () => {
        currentPage.value = 1; // Resetear a primera página cuando los filtros cambian
        fetchNews();
    }, { deep: true, immediate: true });

    return {
      loading, error, paginatedNews, currentPage, totalPages,
      prevPage, nextPage, goToPage, paginationRange,
      filters: props.filters // Para el mensaje de "no resultados"
    };
  }
};
</script>

<style scoped>

.loading-indicator, .alert, .no-results-message {
    min-height: 250px; 
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    border-radius: 8px; /* Bordes redondeados para los mensajes */
}
.alert { /* Estilo específico para alertas */
    background-color: #fff3cd; /* Amarillo claro de Bootstrap warning */
    color: #664d03;
    border-color: #ffecb5;
}

/* Estilos para la paginación (Bootstrap-like pero personalizable) */
.custom-pagination {
    padding-left: 0;
    list-style: none;
}
.custom-pagination .page-item .page-link {
    position: relative;
    display: block;
    padding: 0.5rem 0.75rem;
    margin-left: -1px;
    line-height: 1.25;
    color: var(--pg-noticias-primary-accent, #007bff); /* Usar variable si está disponible */
    background-color: #fff;
    border: 1px solid #dee2e6;
    transition: color .15s ease-in-out,background-color .15s ease-in-out,border-color .15s ease-in-out,box-shadow .15s ease-in-out;
    cursor: pointer;
    min-width: 42px; /* Ancho mínimo */
    text-align: center;
}
.custom-pagination .page-item:first-child .page-link {
    border-top-left-radius: 0.35rem;
    border-bottom-left-radius: 0.35rem;
}
.custom-pagination .page-item:last-child .page-link {
    border-top-right-radius: 0.35rem;
    border-bottom-right-radius: 0.35rem;
}
.custom-pagination .page-item.active .page-link {
    z-index: 3;
    color: #fff;
    background-color: var(--pg-noticias-primary-accent, #007bff);
    border-color: var(--pg-noticias-primary-accent, #007bff);
}
.custom-pagination .page-item.disabled .page-link {
    color: #6c757d;
    pointer-events: none;
    background-color: #fff;
    border-color: #dee2e6;
}
.custom-pagination .page-item.ellipsis .page-link { /* Para los '...' */
    color: #6c757d;
    pointer-events: none;
}
.custom-pagination .page-item .page-link:hover {
    z-index: 2;
    color: #0056b3;
    background-color: #e9ecef;
    border-color: #dee2e6;
}
.custom-pagination .page-link i {
    font-size: 0.8em; /* Iconos un poco más pequeños */
}
</style>