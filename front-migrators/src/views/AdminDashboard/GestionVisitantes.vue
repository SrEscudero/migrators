<!-- src/views/admin/VisitorAnalysis.vue -->
<template>
  <div class="page-content-container">
    <!-- Encabezado -->
    <div class="page-header mb-4">
      <div class="title-wrapper d-flex align-items-center">
        <i class="fas fa-chart-line page-icon text-primary me-2" aria-hidden="true"></i>
        <h2 class="page-title mb-0">Análisis de Visitantes</h2>
      </div>
    </div>

    <!-- Tarjetas de resumen -->
    <div class="row g-4 mb-4">
      <div class="col-md-4">
        <SummaryCard
          title="Visitas Totales"
          :value="totalVisitors"
          icon="fas fa-users"
          color="primary"
        />
      </div>
      <div class="col-md-4">
        <SummaryCard
          title="Países Únicos"
          :value="uniqueCountries"
          icon="fas fa-globe-americas"
          color="success"
        />
      </div>
      <div class="col-md-4">
        <SummaryCard
          title="Alertas Detectadas"
          :value="totalAlerts"
          icon="fas fa-shield-alt"
          color="danger"
        />
      </div>
    </div>

    <!-- Mapa -->
    <div class="content-card mb-4">
      <div class="content-card-header">
        <h3 class="content-card-title">Mapa de Conexiones</h3>
      </div>
      <div class="content-card-body p-0" style="border-radius: 0.75rem; overflow: hidden; height: 400px;">
        <VisitorMap :visitors="filteredVisitors" />
      </div>
    </div>

    <!-- Tabla de visitas -->
    <div class="content-card">
      <div class="content-card-header d-flex flex-wrap justify-content-between align-items-center gap-3">
        <h3 class="content-card-title mb-0">Historial de Visitas</h3>
        <div class="search-box-wrapper position-relative w-100 w-md-auto">
          <i class="fas fa-search search-icon text-muted"></i>
          <input
            v-model="searchQuery"
            type="text"
            class="form-control ps-4"
            placeholder="Buscar por IP, país, ciudad..."
            aria-label="Buscar visitas"
          />
        </div>
      </div>

      <div class="content-card-body">
        <StatePlaceholder
          :loading="isLoading"
          :error="error"
          :empty="!isLoading && paginatedVisitors.length === 0"
          @retry="fetchVisitors"
          :empty-title="searchQuery ? 'No se encontraron resultados' : 'No hay visitas registradas'"
          empty-text="Los datos de visitantes aparecerán aquí cuando haya tráfico en el sitio."
        >
          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
              <thead class="table-light">
                <tr>
                  <th>Fecha</th>
                  <th>IP</th>
                  <th>Ubicación</th>
                  <th>ISP</th>
                  <th>Fraude</th>
                  <th>Alertas</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="visitor in paginatedVisitors" :key="visitor.id">
                  <td>{{ formatDate(visitor.fecha_visita) }}</td>
                  <td><code class="text-primary">{{ visitor.ip_address }}</code></td>
                  <td>
                    <span v-if="visitor.pais" :class="['fi', `fi-${visitor.pais.toLowerCase()}`]"></span>
                    {{ visitor.ciudad || 'N/A' }}, {{ visitor.pais || 'N/A' }}
                  </td>
                  <td>{{ visitor.isp || 'N/A' }}</td>
                  <td>
                    <span :class="getFraudScoreClass(visitor.fraud_score)">
                      {{ visitor.fraud_score ?? 'N/A' }}
                    </span>
                  </td>
                  <td>
                    <span v-if="visitor.is_vpn" class="badge bg-danger me-1" title="VPN">VPN</span>
                    <span v-if="visitor.is_proxy" class="badge bg-warning text-dark me-1" title="Proxy">Proxy</span>
                    <span v-if="visitor.is_tor" class="badge bg-dark" title="TOR">TOR</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </StatePlaceholder>
      </div>

      <!-- Paginación -->
      <div v-if="totalPages > 1" class="content-card-footer d-flex flex-wrap justify-content-between align-items-center gap-2">
        <small class="text-muted">Mostrando página {{ currentPage }} de {{ totalPages }}</small>
        <nav aria-label="Paginación de visitas">
          <ul class="pagination mb-0">
            <li class="page-item" :class="{ disabled: currentPage === 1 }">
              <button class="page-link" @click="prevPage" :disabled="currentPage === 1">Anterior</button>
            </li>
            <li class="page-item" :class="{ disabled: currentPage === totalPages }">
              <button class="page-link" @click="nextPage" :disabled="currentPage === totalPages">Siguiente</button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useVisitorStore } from '@/stores/visitorStore';
import VisitorMap from '@/components/AdminDashboard/VisitorMap.vue';
import StatePlaceholder from '@/components/shared/StatePlaceholder.vue';
import SummaryCard from '@/components/shared/SummaryCard.vue'; // Reutilizable

const visitorStore = useVisitorStore();
const { visitors, isLoading, error } = storeToRefs(visitorStore);

// Estado
const searchQuery = ref('');
const currentPage = ref(1);
const pageSize = 10;

// Debounce para búsqueda
let debounceTimer = null;
watch(searchQuery, () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    currentPage.value = 1;
  }, 300);
});

// Datos computados
const totalVisitors = computed(() => visitors.value.length);
const uniqueCountries = computed(() => new Set(visitors.value.map(v => v.pais).filter(Boolean)).size);
const totalAlerts = computed(() => visitors.value.filter(v => v.is_vpn || v.is_proxy || v.is_tor).length);

const filteredVisitors = computed(() => {
  const query = searchQuery.value.toLowerCase().trim();
  if (!query) return visitors.value;

  return visitors.value.filter(v =>
    (v.ip_address?.toLowerCase().includes(query)) ||
    (v.pais?.toLowerCase().includes(query)) ||
    (v.ciudad?.toLowerCase().includes(query)) ||
    (v.isp?.toLowerCase().includes(query))
  );
});

const totalPages = computed(() => Math.ceil(filteredVisitors.value.length / pageSize));
const paginatedVisitors = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return filteredVisitors.value.slice(start, start + pageSize);
});

// Métodos
const prevPage = () => {
  if (currentPage.value > 1) currentPage.value--;
};
const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++;
};

const fetchVisitors = () => {
  visitorStore.fetchVisitors();
};

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleString('es-ES', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
};

const getFraudScoreClass = (score) => {
  if (score === null || score === undefined) return 'text-muted';
  if (score > 75) return 'fw-bold text-danger';
  if (score > 50) return 'text-warning';
  return 'text-success';
};

onMounted(() => {
  fetchVisitors();
});
</script>

<style scoped>
.page-content-container {
  padding: 1.5rem;
  min-height: 100vh;
  background-color: #f8f9fa;
}

.page-header .page-icon {
  font-size: 1.5rem;
}

.search-box-wrapper {
  max-width: 350px;
  flex: 1;
}

.search-box-wrapper .search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
}

.search-box-wrapper input {
  border-radius: 0.5rem;
  padding-left: 2.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.content-card {
  background-color: #fff;
  border-radius: 0.75rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.content-card-header {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #e9ecef;
  background-color: #f8f9fa;
}

.content-card-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #343a40;
}

.content-card-body {
  padding: 1.5rem;
}

.content-card-footer {
  padding: 1rem 1.5rem;
  background-color: #f8f9fa;
  border-top: 1px solid #e9ecef;
}

.table th {
  font-weight: 600;
  color: #495057;
}

.table td, .table th {
  vertical-align: middle;
  white-space: nowrap;
}

code {
  font-size: 0.9em;
  padding: 0.2em 0.4em;
  border-radius: 0.25rem;
  background: #f1f3f5;
}

.fi {
  margin-right: 8px;
  vertical-align: middle;
}
</style>