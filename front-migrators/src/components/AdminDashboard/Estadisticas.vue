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
      <button class="btn btn-primary" @click="fetchStatsWithSetup">
        <i class="fas fa-sync-alt me-2"></i>Reintentar
      </button>
    </div>

    <div v-else-if="!loadingStats && computedTotalNoticias === 0" class="empty-state card-style text-center py-5">
      <i class="fas fa-database fa-3x mb-3 text-primary"></i>
      <h4 class="mb-2">No hay datos disponibles</h4>
      <p class="text-muted mb-4">No se encontraron noticias para mostrar estadísticas.</p>
      <button class="btn btn-primary" @click="fetchStatsWithSetup">
        <i class="fas fa-sync-alt me-2"></i>Reintentar
      </button>
    </div>

    <transition name="fade-stats" mode="out-in" v-else>
      <div class="stats-content">
        <div class="summary-wrapper">
          <SummaryCards :series="resumenCards" />
        </div>

        <draggable
          v-model="dashboardBlocks"
          tag="div"
          item-key="id"
          class="charts-grid-draggable"
          handle=".drag-handle"
          animation="250"
        >
          <template #item="{ element: block }">
            <div :class="['chart-card', block.width === 'full' ? 'wide-card' : '']">
              <div class="chart-header">
                <i :class="['drag-handle', block.icon]"></i>
                <div>
                  <h5>{{ block.title }}</h5>
                  <p v-if="block.subtitle" class="chart-subtitle">{{ block.subtitle }}</p>
                </div>
              </div>
              <div class="chart-container">
                <component
                  :is="block.component"
                  :options="block.props.options"
                  :series="block.props.series"
                  :height="block.props.height || '300'"
                />
              </div>
            </div>
          </template>
        </draggable>
      </div>
    </transition>
  </div>
</template>

<script setup>
// AJUSTE 1: Importamos markRaw de Vue
import { ref, onMounted, computed, markRaw } from 'vue';
import axios from 'axios';
import draggable from 'vuedraggable';
import VueApexCharts from 'vue3-apexcharts';

// AJUSTE 2: Usamos markRaw para evitar que Vue haga reactivos los componentes
const SummaryCards = markRaw({
  props: ['series'],
  template: `
    <div class="summary-grid">
      <div v-for="(card, index) in series" :key="index" class="summary-card">
        <div class="card-icon" :class="card.colorClass"><i :class="card.icono"></i></div>
        <div class="card-details">
          <h5 class="card-title">{{ card.titulo }}</h5>
          <p class="card-value">{{ card.valor }}</p>
        </div>
      </div>
    </div>
  `
});

const ApexChartComponent = markRaw(VueApexCharts);

// El resto del script se mantiene igual...
const loadingStats = ref(true);
const errorMessage = ref(null);
const statsEstadosData = ref([]);
const statsDestacadasData = ref([]);
const statsPublicadasFechaData = ref([]);
const statsAutoresData = ref([]);
const dashboardBlocks = ref([]);

const API_BASE_URL = import.meta.env.VITE_API_URL;
const CHART_COLORS = { primary: '#5664d2', success: '#1abc9c', warning: '#f1b44c', danger: '#f46a6a', info: '#50a5f1', secondary: '#74788d', muted: '#6c757d' };
const NEWS_STATUS = { PUBLISHED: 'publicado', DRAFT: 'borrador', ARCHIVED: 'archivado' };
const NEWS_STATUS_LABELS = { [NEWS_STATUS.PUBLISHED]: 'Publicadas', [NEWS_STATUS.DRAFT]: 'Borradores', [NEWS_STATUS.ARCHIVED]: 'Archivadas' };
const NEWS_STATUS_COLORS_HEX = { [NEWS_STATUS.PUBLISHED]: CHART_COLORS.success, [NEWS_STATUS.DRAFT]: CHART_COLORS.warning, [NEWS_STATUS.ARCHIVED]: CHART_COLORS.secondary };
const NEWS_STATUS_TEXT_CLASSES = { [NEWS_STATUS.PUBLISHED]: 'text-success', [NEWS_STATUS.DRAFT]: 'text-warning', [NEWS_STATUS.ARCHIVED]: 'text-secondary' };

const fetchStatsWithSetup = async () => {
  loadingStats.value = true;
  errorMessage.value = null;
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
    setupDashboardBlocks();
  } catch (error) {
    console.error("Error al cargar estadísticas:", error);
    errorMessage.value = "No se pudieron cargar las estadísticas. Por favor, inténtalo de nuevo más tarde.";
  } finally {
    loadingStats.value = false;
  }
};

onMounted(fetchStatsWithSetup);

const computedTotalNoticias = computed(() => statsEstadosData.value.reduce((acc, s) => acc + s.total_noticias, 0));
const computedTotalPublicadas = computed(() => statsEstadosData.value.find(s => s.estado === NEWS_STATUS.PUBLISHED)?.total_noticias || 0);
const computedTotalBorradores = computed(() => statsEstadosData.value.find(s => s.estado === NEWS_STATUS.DRAFT)?.total_noticias || 0);
const computedTotalArchivadas = computed(() => statsEstadosData.value.find(s => s.estado === NEWS_STATUS.ARCHIVED)?.total_noticias || 0);

const resumenCards = computed(() => [
  { titulo: 'Total Noticias', valor: computedTotalNoticias.value, icono: 'fas fa-newspaper', colorClass: 'text-primary' },
  { titulo: NEWS_STATUS_LABELS[NEWS_STATUS.PUBLISHED], valor: computedTotalPublicadas.value, icono: 'fas fa-check-circle', colorClass: NEWS_STATUS_TEXT_CLASSES[NEWS_STATUS.PUBLISHED] },
  { titulo: NEWS_STATUS_LABELS[NEWS_STATUS.DRAFT], valor: computedTotalBorradores.value, icono: 'fas fa-edit', colorClass: NEWS_STATUS_TEXT_CLASSES[NEWS_STATUS.DRAFT] },
  { titulo: NEWS_STATUS_LABELS[NEWS_STATUS.ARCHIVED], valor: computedTotalArchivadas.value, icono: 'fas fa-archive', colorClass: NEWS_STATUS_TEXT_CLASSES[NEWS_STATUS.ARCHIVED] }
]);

const opcionesGraficoEstados = computed(() => ({ chart: { type: 'donut', toolbar: { show: false } }, labels: statsEstadosData.value.map(s => NEWS_STATUS_LABELS[s.estado] || s.estado), colors: statsEstadosData.value.map(s => NEWS_STATUS_COLORS_HEX[s.estado] || CHART_COLORS.info), legend: { position: 'bottom' }, dataLabels: { enabled: true, formatter: (val) => `${Math.round(val)}%` }, plotOptions: { pie: { donut: { labels: { show: true, total: { show: true, label: 'Total', color: CHART_COLORS.muted } } } } } }));
const seriesGraficoEstados = computed(() => statsEstadosData.value.map(s => s.total_noticias));
const opcionesGraficoDestacadas = computed(() => ({ chart: { type: 'bar', toolbar: { show: false } }, plotOptions: { bar: { borderRadius: 4, horizontal: false, columnWidth: '55%' } }, dataLabels: { enabled: false }, colors: [CHART_COLORS.primary, CHART_COLORS.warning], xaxis: { categories: ['Normales', 'Destacadas'] }, tooltip: { y: { formatter: (val) => `${val} noticias` } } }));
const seriesGraficoDestacadas = computed(() => [{ name: 'Noticias', data: [statsDestacadasData.value.find(s => !s.destacada)?.total_noticias || 0, statsDestacadasData.value.find(s => s.destacada)?.total_noticias || 0] }]);
const opcionesGraficoPublicadasFecha = computed(() => ({ chart: { type: 'line', toolbar: { show: false } }, stroke: { curve: 'smooth', width: 3 }, colors: [CHART_COLORS.success], markers: { size: 5, hover: { size: 7 } }, xaxis: { categories: statsPublicadasFechaData.value.map(d => new Date(d.fecha).toLocaleString('es-ES', { month: 'short', year: 'numeric' })) }, yaxis: { min: 0 } }));
const seriesGraficoPublicadasFecha = computed(() => [{ name: 'Publicaciones', data: statsPublicadasFechaData.value.map(d => d.total_noticias) }]);
const opcionesGraficoAutores = computed(() => ({ chart: { type: 'bar', toolbar: { show: false } }, plotOptions: { bar: { borderRadius: 4, horizontal: true } }, dataLabels: { enabled: true, formatter: (val) => val, style: { colors: ['#fff'] }, offsetX: -25 }, colors: [CHART_COLORS.info], xaxis: { categories: statsAutoresData.value.map(a => a.autor) }, yaxis: { labels: { fontSize: '13px' } }, tooltip: { x: { formatter: (val) => `Autor: ${val}` } } }));
const seriesGraficoAutores = computed(() => [{ name: 'Noticias', data: statsAutoresData.value.map(a => a.total_noticias) }]);

const setupDashboardBlocks = () => {
  dashboardBlocks.value = [
    { id: 'distribution', title: 'Distribución por Estado', icon: 'fas fa-chart-pie drag-handle', component: ApexChartComponent, width: 'half', props: { options: opcionesGraficoEstados.value, series: seriesGraficoEstados.value } },
    { id: 'featured', title: 'Noticias Destacadas', icon: 'fas fa-star drag-handle', component: ApexChartComponent, width: 'half', props: { options: opcionesGraficoDestacadas.value, series: seriesGraficoDestacadas.value } },
    { id: 'evolution', title: 'Evolución Mensual', subtitle: 'Últimos 6 meses de actividad', icon: 'fas fa-calendar-alt drag-handle', component: ApexChartComponent, width: 'full', props: { options: opcionesGraficoPublicadasFecha.value, series: seriesGraficoPublicadasFecha.value } },
    { id: 'authors', title: 'Productividad por Autor', icon: 'fas fa-users drag-handle', component: ApexChartComponent, width: 'full', props: { options: opcionesGraficoAutores.value, series: seriesGraficoAutores.value, height: '350' } },
  ];
};
</script>

<style scoped>
.estadisticas-container {
  width: 100%;
}
.summary-wrapper {
  margin-bottom: 2rem;
}
.charts-grid-draggable {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 450px), 1fr));
  gap: 1.5rem;
}
.drag-handle {
  cursor: move;
  color: var(--color-text-muted); /* AHORA: Global */
  transition: color 0.2s ease;
  font-size: 1.25rem;
  margin-right: 0.75rem;
}
.drag-handle:hover {
  color: var(--color-text); /* AHORA: Global */
}
.chart-card.wide-card {
  grid-column: span 1;
}
@media (min-width: 1200px) {
  .chart-card.wide-card {
    grid-column: span 2;
  }
}
.chart-header {
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}
.sortable-ghost {
  opacity: 0.4;
  background: #c8ebfb; /* Mantenemos un color específico para el placeholder de drag&drop */
  border: 1px dashed var(--color-primary);
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
  background-color: var(--color-surface); /* AHORA: Global */
  border-radius: var(--border-radius-md); /* AHORA: Global */
  box-shadow: var(--shadow-medium); /* AHORA: Global */
}
.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 220px), 1fr));
  gap: 1.5rem;
}
.summary-card {
  background-color: var(--color-surface); /* AHORA: Global */
  border-radius: var(--border-radius-md); /* AHORA: Global */
  box-shadow: var(--shadow-soft); /* AHORA: Global */
  padding: 1.5rem;
  display: flex;
  align-items: center;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.summary-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-medium); /* AHORA: Global */
}
.card-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
  flex-shrink: 0;
  background-color: var(--color-background); /* AHORA: Global */
}
.card-icon.text-success { background-color: rgba(66, 185, 131, 0.1); }
.card-icon.text-warning { background-color: rgba(241, 180, 76, 0.1); }
.card-icon.text-secondary { background-color: rgba(108, 117, 125, 0.1); }
.card-icon.text-info { background-color: rgba(51, 200, 245, 0.1); }
.card-icon.text-danger { background-color: rgba(230, 57, 70, 0.1); }
.card-icon i {
  font-size: 1.25rem;
}
.card-details {
  flex: 1;
  min-width: 0;
}
.card-title {
  font-size: 0.9rem;
  font-weight: var(--font-weight-medium);
  color: var(--color-text-muted); /* AHORA: Global */
  margin-bottom: 0.25rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.card-value {
  font-size: 1.5rem;
  font-weight: var(--font-weight-bold);
  color: var(--color-text); /* AHORA: Global */
  margin-bottom: 0;
}
.chart-card {
  background-color: var(--color-surface); /* AHORA: Global */
  border-radius: var(--border-radius-md); /* AHORA: Global */
  box-shadow: var(--shadow-soft); /* AHORA: Global */
  padding: 1.5rem;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  display: flex;
  flex-direction: column;
}
.chart-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-medium);
}
.chart-header h5 {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0;
  color: var(--color-text); /* AHORA: Global */
}
.chart-subtitle {
  font-size: 0.85rem;
  color: var(--color-text-muted); /* AHORA: Global */
  margin-left: auto;
  margin-bottom: 0;
  white-space: nowrap;
}
.chart-container {
  min-height: 300px;
  position: relative;
  flex-grow: 1;
  width: 100%;
}
.fade-stats-enter-active,
.fade-stats-leave-active {
  transition: opacity 0.3s ease;
}
.fade-stats-enter-from,
.fade-stats-leave-to {
  opacity: 0;
}
@media (max-width: 767.98px) {
  .summary-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  .summary-card, .chart-card {
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
    min-height: 250px;
  }
}
</style>