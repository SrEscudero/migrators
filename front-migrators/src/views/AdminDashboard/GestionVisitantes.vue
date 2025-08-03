<template>
  <div class="page-content-container">
    <div class="page-header">
      <div class="title-wrapper">
        <i class="fas fa-chart-area page-icon"></i>
        <h2 class="page-title">Análisis de Visitantes</h2>
      </div>
    </div>

    <div class="content-card">
      <div class="content-card-header">
        <h3 class="content-card-title">Historial de Visitas Recientes</h3>
      </div>
      <div class="content-card-body">
        <StatePlaceholder
          :loading="isLoading"
          :error="error"
          :empty="!isLoading && visitors.length === 0"
          loading-title="Cargando historial de visitas..."
          error-title="Error de Red"
          :error-text="error"
          :show-retry-button="!!error"
          @retry="visitorStore.fetchVisitors"
          empty-icon="fas fa-users-slash"
          empty-title="No hay visitas"
          empty-text="Aún no se ha registrado ninguna visita en la plataforma."
        >
          <div class="table-responsive">
            <table class="table table-hover align-middle">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Dirección IP</th>
                  <th>Ubicación</th>
                  <th>ISP</th>
                  <th>Puntuación Fraude</th>
                  <th>Alertas</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="visitor in visitors" :key="visitor.id">
                  <td>{{ new Date(visitor.fecha_visita).toLocaleString('es-ES') }}</td>
                  <td>{{ visitor.ip_address }}</td>
                  <td>
                    <span v-if="visitor.pais" :class="['fi', `fi-${visitor.pais.toLowerCase()}`]"></span>
                    {{ visitor.ciudad || 'N/A' }}, {{ visitor.pais || 'N/A' }}
                  </td>
                  <td>{{ visitor.isp || 'N/A' }}</td>
                  <td>
                    <span :class="getFraudScoreClass(visitor.fraud_score)">
                      {{ visitor.fraud_score }} / 100
                    </span>
                  </td>
                  <td>
                    <span v-if="visitor.is_vpn" class="badge bg-danger me-1" title="VPN Detectado">VPN</span>
                    <span v-if="visitor.is_proxy" class="badge bg-warning text-dark me-1" title="Proxy Detectado">Proxy</span>
                    <span v-if="visitor.is_tor" class="badge bg-dark" title="Red TOR Detectada">TOR</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </StatePlaceholder>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useVisitorStore } from '@/stores/visitorStore';
import StatePlaceholder from '@/components/shared/StatePlaceholder.vue';

const visitorStore = useVisitorStore();
const { visitors, isLoading, error } = storeToRefs(visitorStore);

onMounted(() => {
  visitorStore.fetchVisitors();
});

const getFraudScoreClass = (score) => {
  if (score === null) return 'text-muted';
  if (score > 75) return 'fw-bold text-danger';
  if (score > 50) return 'text-warning';
  return 'text-success';
};
</script>

<style scoped>
.fi {
  margin-right: 8px;
}
</style>