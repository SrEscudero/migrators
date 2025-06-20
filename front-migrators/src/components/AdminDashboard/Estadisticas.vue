<template>
  <div class="estadisticas-container">
    <div v-if="loadingStats" class="loading-state text-center py-5">
      <div class="spinner-grow text-primary" role="status">
        <span class="visually-hidden">Cargando...</span>
      </div>
      <p class="mt-3 text-muted">Cargando estadísticas...</p>
    </div>

    <div v-else-if="errorMessage" class="error-state card-style text-center py-5">
      <i class="fas fa-exclamation-triangle fa-3x mb-3 text-danger"></i>
      <h4 class="mb-2">Error al cargar datos</h4>
      <p class="text-muted mb-4">{{ errorMessage }}</p>
      <button class="btn btn-primary" @click="fetchStats">
        <i class="fas fa-sync-alt me-2"></i>Reintentar
      </button>
    </div>

    <div v-else-if="!loadingStats && computedTotalNoticias === 0" class="empty-state card-style text-center py-5">
      <i class="fas fa-database fa-3x mb-3 text-primary"></i>
      <h4 class="mb-2">No hay datos disponibles</h4>
      <p class="text-muted mb-4">No se encontraron noticias para mostrar estadísticas.</p>
      <button class="btn btn-primary" @click="fetchStats">
        <i class="fas fa-sync-alt me-2"></i>Reintentar
      </button>
    </div>

    <transition name="fade-stats" mode="out-in">
      <div v-if="!loadingStats && !errorMessage && computedTotalNoticias > 0" class="stats-content">
        <div class="summary-grid">
          <div v-for="(card, index) in resumenCards" :key="index" class="summary-card">
            <div class="card-icon" :class="card.colorClass">
              <i :class="card.icono"></i>
            </div>
            <div class="card-details">
              <h5 class="card-title">{{ card.titulo }}</h5>
              <p class="card-value">{{ card.valor }}</p>
            </div>
          </div>
        </div>

        <div class="charts-grid">
          <div class="chart-card">
            <div class="chart-header">
              <i class="fas fa-chart-pie me-2 text-primary"></i>
              <h5>Distribución por Estado</h5>
            </div>
            <div class="chart-container">
              <apexchart
                type="donut"
                :options="opcionesGraficoEstados"
                :series="seriesGraficoEstados"
                height="300"
              ></apexchart>
            </div>
          </div>

          <div class="chart-card">
            <div class="chart-header">
              <i class="fas fa-star me-2 text-warning"></i>
              <h5>Noticias Destacadas</h5>
            </div>
            <div class="chart-container">
              <apexchart
                type="bar"
                :options="opcionesGraficoDestacadas"
                :series="seriesGraficoDestacadas"
                height="300"
              ></apexchart>
            </div>
          </div>

          <div class="chart-card wide-card">
            <div class="chart-header">
              <i class="fas fa-calendar-alt me-2 text-success"></i>
              <h5>Evolución Mensual</h5>
              <p class="chart-subtitle">Últimos 6 meses de actividad</p>
            </div>
            <div class="chart-container">
              <apexchart
                type="line"
                :options="opcionesGraficoPublicadasFecha"
                :series="seriesGraficoPublicadasFecha"
                height="300"
              ></apexchart>
            </div>
          </div>

          <div class="chart-card wide-card">
            <div class="chart-header">
              <i class="fas fa-users me-2 text-info"></i>
              <h5>Productividad por Autor</h5>
            </div>
            <div class="chart-container">
              <apexchart
                type="bar"
                :options="opcionesGraficoAutores"
                :series="seriesGraficoAutores"
                height="350"
              ></apexchart>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
// Import ApexCharts if you haven't registered it globally
// import VueApexCharts from 'vue3-apexcharts'; (and add to components if not global)

const loadingStats = ref(true);
const errorMessage = ref(null);
const statsEstadosData = ref([]);
const statsDestacadasData = ref([]);
const statsPublicadasFechaData = ref([]);
const statsAutoresData = ref([]);

// --- Constantes y Configuraciones ---
const API_BASE_URL = import.meta.env.VITE_API_URL;

// Colores consistentes con el tema principal
const CHART_COLORS = {
  primary: '#5664d2',
  success: '#1abc9c',
  warning: '#f1b44c',
  danger: '#f46a6a',
  info: '#50a5f1',
  secondary: '#74788d',
  muted: '#6c757d'
};

const NEWS_STATUS = {
  PUBLISHED: 'publicado',
  DRAFT: 'borrador',
  ARCHIVED: 'archivado'
};

const NEWS_STATUS_LABELS = {
  [NEWS_STATUS.PUBLISHED]: 'Publicadas',
  [NEWS_STATUS.DRAFT]: 'Borradores',
  [NEWS_STATUS.ARCHIVED]: 'Archivadas'
};

const NEWS_STATUS_COLORS_HEX = {
  [NEWS_STATUS.PUBLISHED]: CHART_COLORS.success,
  [NEWS_STATUS.DRAFT]: CHART_COLORS.warning,
  [NEWS_STATUS.ARCHIVED]: CHART_COLORS.secondary
};

const NEWS_STATUS_TEXT_CLASSES = {
  [NEWS_STATUS.PUBLISHED]: 'text-success',
  [NEWS_STATUS.DRAFT]: 'text-warning',
  [NEWS_STATUS.ARCHIVED]: 'text-secondary'
};


// --- Funciones de Fetching ---
const fetchStats = async () => {
  loadingStats.value = true;
  errorMessage.value = null; // Reset error on new fetch attempt
  try {
    const [resEstados, resDestacadas, resPublicadasFecha, resAutores] = await Promise.all([
      axios.get(`${API_BASE_URL}/api/noticias/stats/estado`),
      axios.get(`${API_BASE_URL}/api/noticias/stats/destacadas`),
      axios.get(`${API_BASE_URL}/api/noticias/stats/publicadas-por-fecha`),
      axios.get(`${API_BASE_URL}/api/noticias/stats/autores`)
    ]);

    statsEstadosData.value = resEstados.data;
    statsDestacadasData.value = resDestacadas.data;
    statsPublicadasFechaData.value = resPublicadasFecha.data;
    statsAutoresData.value = resAutores.data;

  } catch (error) {
    console.error("Error al cargar estadísticas:", error);
    errorMessage.value = "No se pudieron cargar las estadísticas. Por favor, inténtalo de nuevo más tarde.";
    // Potentially set more specific error messages based on error.response.status
  } finally {
    loadingStats.value = false;
  }
};

onMounted(() => {
  fetchStats();
});

// --- Computed Properties para Datos Agregados ---
const computedTotalNoticias = computed(() =>
  statsEstadosData.value.reduce((acc, s) => acc + s.total_noticias, 0)
);

const computedTotalPublicadas = computed(() =>
  statsEstadosData.value.find(s => s.estado === NEWS_STATUS.PUBLISHED)?.total_noticias || 0
);

const computedTotalBorradores = computed(() =>
  statsEstadosData.value.find(s => s.estado === NEWS_STATUS.DRAFT)?.total_noticias || 0
);

const computedTotalArchivadas = computed(() =>
  statsEstadosData.value.find(s => s.estado === NEWS_STATUS.ARCHIVED)?.total_noticias || 0
);

// --- Computed Properties para UI (Tarjetas Resumen) ---
const resumenCards = computed(() => [
  {
    titulo: 'Total Noticias',
    valor: computedTotalNoticias.value,
    icono: 'fas fa-newspaper',
    colorClass: 'text-primary' // General color
  },
  {
    titulo: NEWS_STATUS_LABELS[NEWS_STATUS.PUBLISHED],
    valor: computedTotalPublicadas.value,
    icono: 'fas fa-check-circle',
    colorClass: NEWS_STATUS_TEXT_CLASSES[NEWS_STATUS.PUBLISHED]
  },
  {
    titulo: NEWS_STATUS_LABELS[NEWS_STATUS.DRAFT],
    valor: computedTotalBorradores.value,
    icono: 'fas fa-edit',
    colorClass: NEWS_STATUS_TEXT_CLASSES[NEWS_STATUS.DRAFT]
  },
  {
    titulo: NEWS_STATUS_LABELS[NEWS_STATUS.ARCHIVED],
    valor: computedTotalArchivadas.value,
    icono: 'fas fa-archive',
    colorClass: NEWS_STATUS_TEXT_CLASSES[NEWS_STATUS.ARCHIVED]
  }
]);

// --- Computed Properties para Configuración de Gráficos ---

// Gráfico de Estados (Donut)
const opcionesGraficoEstados = computed(() => ({
  chart: {
    type: 'donut',
    toolbar: { show: false },
    animations: { enabled: true }
  },
  labels: statsEstadosData.value.map(s => NEWS_STATUS_LABELS[s.estado] || s.estado),
  colors: statsEstadosData.value.map(s => NEWS_STATUS_COLORS_HEX[s.estado] || CHART_COLORS.info),
  legend: {
    position: 'bottom',
    itemMargin: { horizontal: 10 }
  },
  dataLabels: {
    enabled: true,
    formatter: (val) => `${Math.round(val)}%`
  },
  plotOptions: {
    pie: {
      donut: {
        labels: {
          show: true,
          total: {
            show: true,
            label: 'Total',
            color: CHART_COLORS.muted
          }
        }
      }
    }
  },
  responsive: [{
    breakpoint: 480,
    options: {
      chart: { width: 200 }, // Note: ApexCharts might auto-adjust better
      legend: { position: 'bottom' }
    }
  }]
}));

const seriesGraficoEstados = computed(() =>
  statsEstadosData.value.map(s => s.total_noticias)
);

// Gráfico de Destacadas (Bar)
const opcionesGraficoDestacadas = computed(() => ({
  chart: {
    type: 'bar',
    toolbar: { show: false },
    animations: { enabled: true }
  },
  plotOptions: {
    bar: {
      borderRadius: 4,
      horizontal: false,
      columnWidth: '55%',
    }
  },
  dataLabels: { enabled: false },
  colors: [CHART_COLORS.primary, CHART_COLORS.warning], // Normal, Destacada
  xaxis: {
    categories: ['Normales', 'Destacadas'],
    labels: { style: { fontSize: '14px', colors: CHART_COLORS.muted } }
  },
  yaxis: {
    title: { text: 'Cantidad', style: { color: CHART_COLORS.muted } },
    labels: { style: { colors: CHART_COLORS.muted } }
  },
  tooltip: {
    y: { formatter: (val) => `${val} noticias` }
  }
}));

const seriesGraficoDestacadas = computed(() => {
  const noDestacadas = statsDestacadasData.value.find(s => !s.destacada)?.total_noticias || 0;
  const destacadas = statsDestacadasData.value.find(s => s.destacada)?.total_noticias || 0;
  return [{ name: 'Noticias', data: [noDestacadas, destacadas] }];
});

// Gráfico de Evolución Mensual (Line)
const opcionesGraficoPublicadasFecha = computed(() => ({
  chart: {
    type: 'line',
    toolbar: { show: false },
    zoom: { enabled: false },
    animations: { enabled: true }
  },
  stroke: {
    curve: 'smooth',
    width: 3
  },
  colors: [CHART_COLORS.success],
  markers: {
    size: 5,
    hover: { size: 7 }
  },
  xaxis: {
  categories: statsPublicadasFechaData.value.map(d => 
    new Date(d.fecha).toLocaleString('es-ES', { month: 'short', year: 'numeric' })
  ), 
    title: { text: 'Mes', style: { color: CHART_COLORS.muted } },
    labels: { style: { colors: CHART_COLORS.muted } }
  },
  yaxis: {
    title: { text: 'Noticias', style: { color: CHART_COLORS.muted } },
    labels: { style: { colors: CHART_COLORS.muted } },
    min: 0
  },
  tooltip: {
    y: { formatter: (val) => `${val} noticias` }
  }
}));

const seriesGraficoPublicadasFecha = computed(() => [{
  name: 'Publicaciones',
  data: statsPublicadasFechaData.value.map(d => d.total_noticias)
}]);

// Gráfico de Autores (Horizontal Bar)
const opcionesGraficoAutores = computed(() => ({
  chart: {
    type: 'bar',
    toolbar: { show: false },
    animations: { enabled: true }
  },
  plotOptions: {
    bar: {
      borderRadius: 4,
      horizontal: true,
    }
  },
  dataLabels: { 
    enabled: true,
    formatter: (val) => val, // Show actual number
    style: {
        colors: ['#fff'] // Color for datalabels text, adjust if needed
    },
    offsetX: -25, // Adjust offset to better position labels inside bars
  },
  colors: [CHART_COLORS.info],
  xaxis: {
    categories: statsAutoresData.value.map(a => a.autor),
    title: { text: 'Noticias', style: { color: CHART_COLORS.muted } },
    labels: { style: { colors: CHART_COLORS.muted } }
  },
  yaxis: {
    // title: { text: 'Autores', style: { color: CHART_COLORS.muted } }, // Can be redundant with categories
    labels: { style: { colors: CHART_COLORS.muted, fontSize: '13px' } }
  },
  tooltip: {
    x: { formatter: (val) => `Autor: ${val}` }, // Customizing tooltip for horizontal bar
    y: { title: { formatter: () => 'Noticias:'} }
  }
}));

const seriesGraficoAutores = computed(() => [{
  name: 'Noticias', // This name is used in tooltip if not customized elsewhere
  data: statsAutoresData.value.map(a => a.total_noticias)
}]);

</script>

<style scoped>
.estadisticas-container {
  width: 100%;
  height: 100%;
  /* Consider adding some base padding if not handled by a parent layout */
  /* padding: 1rem; */
}

.loading-state, .empty-state, .error-state {
  min-height: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.loading-state .spinner-grow {
  width: 3rem;
  height: 3rem;
}

.empty-state, .error-state {
  background-color: var(--app-card-bg, #fff); /* Added fallback */
  border-radius: 0.75rem;
  box-shadow: var(--app-shadow, 0 0.5rem 1rem rgba(0,0,0,0.15)); /* Added fallback */
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.summary-card {
  background-color: var(--app-card-bg, #fff);
  border-radius: 0.75rem;
  box-shadow: var(--app-shadow, 0 0.125rem 0.25rem rgba(0,0,0,0.075));
  padding: 1.5rem;
  display: flex;
  align-items: center;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  cursor: pointer;
}

.summary-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--app-shadow-lg, 0 0.5rem 1rem rgba(0,0,0,0.15));
}

.card-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
  flex-shrink: 0; /* Prevent icon from shrinking */
  background-color: rgba(86, 100, 210, 0.1); /* Default primary */
}

.card-icon.text-success { background-color: rgba(26, 188, 156, 0.1); }
.card-icon.text-warning { background-color: rgba(241, 180, 76, 0.1); }
.card-icon.text-secondary { background-color: rgba(116, 120, 141, 0.1); }
/* Ensure other colors if used have a background */
.card-icon.text-info { background-color: rgba(80, 165, 241, 0.1); }
.card-icon.text-danger { background-color: rgba(244, 106, 106, 0.1); }


.card-icon i {
  font-size: 1.25rem;
}

.card-details {
  flex: 1;
  min-width: 0; /* Prevent overflow issues with long text */
}

.card-title {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--app-text-muted, #6c757d);
  margin-bottom: 0.25rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--app-dark, #343a40);
  margin-bottom: 0;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 400px), 1fr)); /* Ensure minmax doesn't exceed 100% */
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.chart-card {
  background-color: var(--app-card-bg, #fff);
  border-radius: 0.75rem;
  box-shadow: var(--app-shadow, 0 0.125rem 0.25rem rgba(0,0,0,0.075));
  padding: 1.5rem;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  display: flex; /* Added for better internal structure */
  flex-direction: column; /* Added for better internal structure */
  cursor: default; /* Or pointer if they are interactive */
}
.chart-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--app-shadow-lg, 0 0.5rem 1rem rgba(0,0,0,0.15));
}


.chart-card.wide-card {
  grid-column: span 1; /* Default for mobile-first */
}

@media (min-width: 992px) { /* Apply wide-card for larger screens */
  .chart-card.wide-card {
    grid-column: span 2;
  }
}


.chart-header {
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  flex-wrap: wrap; /* Allow subtitle to wrap */
}

.chart-header h5 {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0;
  color: var(--app-dark, #343a40);
}

.chart-header i {
  font-size: 1.25rem;
  margin-right: 0.75rem;
}

.chart-subtitle {
  font-size: 0.85rem;
  color: var(--app-text-muted, #6c757d);
  margin-left: auto;
  margin-bottom: 0;
  white-space: nowrap;
}

.chart-container {
  min-height: 300px; /* Ensure charts have space */
  position: relative;
  flex-grow: 1; /* Allow container to fill card space */
  width: 100%; /* Ensure it takes full width */
}

.fade-stats-enter-active,
.fade-stats-leave-active {
  transition: opacity 0.3s ease;
}

.fade-stats-enter-from,
.fade-stats-leave-to {
  opacity: 0;
}

/* Responsive Adjustments */
@media (max-width: 1199.98px) {
  .summary-grid {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); /* Adjust minmax for tablets */
  }
  
  .charts-grid {
    grid-template-columns: 1fr; /* Stack charts on smaller screens */
  }
  
  .chart-card.wide-card {
    grid-column: span 1; /* Reset wide-card for stacked layout */
  }
}

@media (max-width: 767.98px) {
  .summary-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  .summary-card {
    padding: 1rem;
  }
  
  .chart-card {
    padding: 1rem;
  }

  .chart-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .chart-subtitle {
    margin-left: 0;
    margin-top: 0.5rem;
  }
  .chart-container {
    min-height: 250px; /* Slightly reduce height for mobile */
  }
}
</style>