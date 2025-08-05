<template>
  <div class="map-wrapper">
    <div ref="mapContainer" class="visitor-map"></div>
    <button @click="recenterMap" class="recenter-btn" title="Centrar mapa en los marcadores">
      <i class="fas fa-compress-arrows-alt"></i>
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster';

// Solución para íconos de marcadores en Vite/Webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const props = defineProps({
  visitors: {
    type: Array,
    required: true,
  },
});

const mapContainer = ref(null);
let map = null;
let markerClusterGroup = null;

// Inicializar el mapa
const initializeMap = () => {
  if (mapContainer.value && !map) {
    map = L.map(mapContainer.value).setView([-14.235, -51.925], 4);

    // Usamos un mapa con un estilo más limpio (CartoDB Positron)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      maxZoom: 19,
    }).addTo(map);

    // Inicializamos el grupo de marcadores para clustering
    markerClusterGroup = L.markerClusterGroup();
    map.addLayer(markerClusterGroup);
  }
};

// Actualizar marcadores con clustering
const updateMarkers = (visitors) => {
  if (!map || !markerClusterGroup) return;

  markerClusterGroup.clearLayers(); // Limpiamos el grupo de marcadores

  const newMarkers = [];
  visitors.forEach((visitor) => {
    if (visitor.lat && visitor.lon) {
      const marker = L.marker([visitor.lat, visitor.lon])
        .bindPopup(`
          <div style="font-family: sans-serif; font-size: 14px; line-height: 1.6;">
            <strong>IP:</strong> ${visitor.ip_address || 'N/A'}<br>
            <strong>Lugar:</strong> ${visitor.ciudad || 'N/A'}, ${visitor.pais || 'N/A'}<br>
            ${visitor.isp ? `<strong>ISP:</strong> ${visitor.isp}<br>` : ''}
            <small style="color: #6c757d;">${new Date(visitor.fecha_visita).toLocaleString('es-ES')}</small>
          </div>
        `);
      newMarkers.push(marker);
    }
  });

  markerClusterGroup.addLayers(newMarkers);
  recenterMap();
};

// Función para centrar el mapa en todos los marcadores
const recenterMap = () => {
    if (map && markerClusterGroup && markerClusterGroup.getBounds().isValid()) {
        map.fitBounds(markerClusterGroup.getBounds(), { padding: [50, 50] });
    }
};

onMounted(() => {
  nextTick(() => {
    initializeMap();
    if (props.visitors.length > 0) {
      updateMarkers(props.visitors);
    }
  });
});

onBeforeUnmount(() => {
  if (map) {
    map.remove();
    map = null;
  }
});

watch(
  () => props.visitors,
  (newVisitors) => {
    updateMarkers(newVisitors);
  },
  { deep: true }
);
</script>

<style scoped>
.map-wrapper {
  position: relative;
  height: 400px;
  width: 100%;
}

.visitor-map {
  height: 100%;
  width: 100%;
  border-radius: var(--border-radius-md); /* AHORA: Global */
  background-color: var(--color-background); /* AHORA: Global */
  border: 1px solid var(--color-border); /* AHORA: Global */
  box-shadow: var(--shadow-soft); /* AHORA: Global */
  z-index: 1;
}

.recenter-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 1000;
  background-color: var(--color-surface); /* AHORA: Global */
  color: var(--color-text); /* AHORA: Global */
  border: 1px solid var(--color-border); /* AHORA: Global */
  border-radius: var(--border-radius-md); /* AHORA: Global */
  width: 34px;
  height: 34px;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-soft); /* AHORA: Global */
  transition: all var(--transition-speed) ease;
}

.recenter-btn:hover {
  background-color: var(--color-background); /* AHORA: Global */
  color: var(--color-primary); /* AHORA: Global */
}
</style>