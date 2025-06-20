<template>
  <div class="map-component-wrapper theme-modern">
    <div class="search-controls-panel">
      <div class="panel-section">
        <h2 class="panel-title">Puntos de Atención</h2>
        <div class="search-input-group">
          <i class="fas fa-search search-icon" aria-hidden="true"></i>
          <input type="text" v-model="searchCity" @keydown.enter.prevent="triggerSearch"
            placeholder="Buscar por ciudad..." class="search-input" aria-label="Buscar Puntos de Atención por ciudad" />

          <button
            v-if="searchCity"
            @click="triggerSearch"
            class="search-action-button"
            aria-label="Buscar ciudad"
            title="Buscar ciudad">
            <i class="fas fa-arrow-right" aria-hidden="true"></i>
          </button>

          <button @click="locateUserAndShowNearby" class="locate-button" aria-label="Encontrar mi ubicación"
            title="Encontrar mi ubicación">
            <i class="fas fa-crosshairs" aria-hidden="true"></i>
          </button>

          <button v-if="searchCity" @click="resetSearch" class="reset-button" aria-label="Limpiar búsqueda"
            title="Limpiar búsqueda">
            <i class="fas fa-times" aria-hidden="true"></i>
          </button>
        </div>
      </div>

      <div class="panel-section results-section">
        <div class="results-header">
          <h3 class="results-title">
            {{ lastSearch ? `Resultados: "${lastSearch}"` : 'Resultados de Búsqueda' }}
          </h3>
          <span v-if="puntosFiltrados.length > 0" class="results-count">{{ puntosFiltrados.length }}</span>
        </div>

        <div v-if="uiState.noResults" class="no-results-message" role="alert">
          <i class="fas fa-info-circle icon"></i>
          <span v-if="lastSearch.includes('cercanos')">No se encontraron puntos de atención cercanos. Mostrando los más
            próximos.</span>
          <span v-else>No se encontraron puntos de atención para "<b>{{ lastSearch }}</b>".</span>
        </div>

        <ul v-else-if="puntosFiltrados.length > 0" class="results-list" role="listbox" ref="resultsListRef">
          <li v-for="(punto, index) in puntosFiltrados" :key="punto.id || index"
            :ref="el => { if (el) pointRefs[index] = el }" role="option" :aria-selected="selectedPoint?.id === punto.id"
            :class="{ 'selected': selectedPoint?.id === punto.id }" @click="selectPunto(punto, true)"
            @mouseenter="highlightMarker(punto, true)" @mouseleave="highlightMarker(punto, false)" tabindex="0"
            @keydown.enter.prevent="selectPunto(punto, true)" @keydown.space.prevent="selectPunto(punto, true)">
            <div class="point-icon-wrapper">
              <i class="fas fa-map-marker-alt"></i>
            </div>
            <div class="point-details">
              <strong>{{ punto.nome }}</strong>
              <small>{{ punto.endereco }}</small>
              <small v-if="punto.distance" class="point-distance">
                <i class="fas fa-road"></i> Aprox. {{ punto.distance.toFixed(1) }} km
              </small>
            </div>
          </li>
        </ul>

        <div v-else-if="puntosFiltrados.length === 0 && !uiState.loading && !uiState.noResults" class="no-results-message">
            <i class="fas fa-search-location icon"></i>
            <span>Usa la búsqueda o el botón de localización para encontrar un punto.</span>
        </div>
      </div>
    </div>

    <div class="map-main-container">
      <div id="map" ref="mapElementRef" aria-label="Mapa interactivo de puntos de atención"></div>
      <div v-if="uiState.loading" class="map-overlay-message loading-overlay" role="status" aria-live="polite">
        <div class="spinner"></div>
        <span>{{ uiState.statusMessage }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from "vue";
import L from "leaflet";
import 'leaflet/dist/leaflet.css';

// --- Iconos Personalizados SVG para marcadores ---
const createCustomIcon = (isActive = false, color = null) => {
  const iconColor = color ? color : (isActive ? '#0056b3' : '#007bff');
  const shadowOpacity = isActive ? 0.7 : 0.4;
  const iconSize = isActive ? [32, 32] : [28, 28];
  const html = `<div class="custom-marker-wrapper" style="font-size: ${iconSize[0]}px;"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${iconColor}" class="marker-icon"><path d="M12 0C7.589 0 4 3.589 4 8c0 4.411 8 16 8 16s8-11.589 8-16c0-4.411-3.589-8-8-8zm0 12a4 4 0 110-8 4 4 0 010 8z"/></svg><div class="marker-shadow" style="opacity: ${shadowOpacity};"></div></div>`;
  
  return L.divIcon({
    html: html,
    className: 'custom-leaflet-div-icon',
    iconSize: iconSize,
    iconAnchor: [iconSize[0] / 2, iconSize[1]],
    popupAnchor: [0, -iconSize[1]]
  });
};

const defaultIcon = createCustomIcon(false);
const activeIcon = createCustomIcon(true);
const userLocationIcon = createCustomIcon(false, '#28a745'); // Icono verde para el usuario

export default {
  name: "InteractiveMap",
  setup() {
    // --- Refs de Estado y UI ---
    const config = ref(null);
    const allPuntos = ref([]);
    const searchCity = ref("");
    const lastSearch = ref("");
    const puntosFiltrados = ref([]);
    const selectedPoint = ref(null);
    const uiState = ref({ loading: true, noResults: false, statusMessage: 'Cargando...' });

    // --- Refs de Elementos del DOM y Mapa ---
    const mapElementRef = ref(null);
    const resultsListRef = ref(null);
    const pointRefs = ref([]);
    let mapInstance = null;
    let markersLayer = null;
    let fetchController = null;
    let userLocationMarker = null;

    // --- Carga de Datos ---
    const loadConfigAndData = async () => {
      try {
        const configResponse = await fetch("/config/config_mapa.json");
        if (!configResponse.ok) throw new Error('Failed to load map config');
        config.value = await configResponse.json();

        const pointsResponse = await fetch(config.value.data.pointsURL);
        if (!pointsResponse.ok) throw new Error('Failed to load points data');
        allPuntos.value = await pointsResponse.json();

      } catch (error) {
        console.error("Initialization Error:", error);
        uiState.value.statusMessage = "Error al cargar datos.";
        if (!config.value) {
            config.value = { map: { initialView: [-14.235, -51.925], initialZoom: 4, tileLayerURL: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", tileLayerAttribution: "" }, api: {}, zoomLevels: { city: 12, point: 15, fitBoundsPadding: [50, 50] } };
        }
      }
    };

    // --- Lógica del Mapa ---
    const initMap = (onReadyCallback) => {
      if (!mapElementRef.value || mapInstance) {
        if (onReadyCallback) onReadyCallback();
        return;
      }
      
      uiState.value.loading = true;
      uiState.value.statusMessage = 'Inicializando mapa...';
      
      mapInstance = L.map(mapElementRef.value).setView(config.value.map.initialView, config.value.map.initialZoom);
      L.tileLayer(config.value.map.tileLayerURL, {
        attribution: config.value.map.tileLayerAttribution
      }).addTo(mapInstance);
      markersLayer = L.featureGroup().addTo(mapInstance);
      
      uiState.value.loading = false;

      if (onReadyCallback) {
        onReadyCallback();
      } else {
        // Fallback: solo renderiza marcadores en el mapa, deja la lista vacía
        renderMarkers([...allPuntos.value]); 
      }
    };

    const renderMarkers = (puntos) => {
      markersLayer.clearLayers();
      puntos.forEach(punto => {
        if (punto.lat != null && punto.lng != null) {
          const marker = L.marker([punto.lat, punto.lng], { icon: defaultIcon, 'data-id': punto.id })
            .addTo(markersLayer)
            .bindTooltip(punto.nome)
            .on('click', () => selectPunto(punto, true));
          
          punto.marker = marker;
        }
      });
    };

    const normalizeText = (text) => {
      return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    };
    
    // --- Lógica de Búsqueda y Filtro ---
    const triggerSearch = async () => {
      const city = searchCity.value.trim();
      if (city.length < 3) return;

      uiState.value.loading = true;
      uiState.value.noResults = false;
      lastSearch.value = city;
      
      if (fetchController) fetchController.abort();
      fetchController = new AbortController();

      try {
        const params = new URLSearchParams({
          city: city,
          countrycodes: config.value.api.nominatimCountryCodes,
          format: 'json',
          limit: 1
        });
        const response = await fetch(`${config.value.api.nominatimBaseURL}?${params}`, { signal: fetchController.signal });
        const data = await response.json();

        if (data.length > 0) {
          const normalizedCity = normalizeText(city);
          puntosFiltrados.value = allPuntos.value.filter(p => normalizeText(p.ciudad || "").includes(normalizedCity));
          
          renderMarkers(puntosFiltrados.value);

          if (puntosFiltrados.value.length > 0) {
            const bounds = markersLayer.getBounds();
            if (bounds.isValid()) {
              mapInstance.fitBounds(bounds, { padding: config.value.zoomLevels.fitBoundsPadding });
            }
          } else {
            mapInstance.flyTo([data[0].lat, data[0].lon], config.value.zoomLevels.city);
            uiState.value.noResults = true;
          }
        } else {
          puntosFiltrados.value = [];
          renderMarkers([]);
          uiState.value.noResults = true;
        }
      } catch (error) {
        if (error.name !== 'AbortError') console.error("Search Error:", error);
      } finally {
        uiState.value.loading = false;
      }
    };
    
    const resetSearch = () => {
      searchCity.value = "";
      lastSearch.value = "";
      selectedPoint.value = null;
      uiState.value.noResults = false;
      
      if (userLocationMarker) {
        userLocationMarker.remove();
        userLocationMarker = null;
      }
      
      puntosFiltrados.value = []; 
      
      renderMarkers([...allPuntos.value]); 
      
      mapInstance.flyTo(config.value.map.initialView, config.value.map.initialZoom);
    };

    // --- Lógica de Interacción ---
    const selectPunto = (punto, flyTo = false) => {
      if (selectedPoint.value?.marker) {
        selectedPoint.value.marker.setIcon(defaultIcon);
      }
      
      selectedPoint.value = punto;
      
      if (punto.marker) {
        punto.marker.setIcon(activeIcon);
        if (flyTo) {
          mapInstance.flyTo(punto.marker.getLatLng(), config.value.zoomLevels.point);
          const popupContent = `<b>${punto.nome}</b><br>${punto.endereco}`;
          punto.marker.bindPopup(popupContent).openPopup();
        }
      }

      const pointIndex = puntosFiltrados.value.findIndex(p => p.id === punto.id);
      if (pointIndex !== -1 && pointRefs.value[pointIndex]) {
        pointRefs.value[pointIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    };

    const highlightMarker = (punto, isHighlighted) => {
        if (punto?.marker && punto.id !== selectedPoint.value?.id) {
            punto.marker.setIcon(isHighlighted ? activeIcon : defaultIcon);
        }
    };
    
    // --- Lógica de Geolocalización y Puntos Cercanos ---
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
      const R = 6371; // Radio de la Tierra en km
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };
    
    const processUserLocation = (position) => {
      uiState.value.loading = true;
      uiState.value.statusMessage = 'Calculando puntos cercanos...';
      uiState.value.noResults = false;

      const userCoords = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };

      const pointsWithDistance = allPuntos.value.map(punto => ({
        ...punto,
        distance: calculateDistance(userCoords.lat, userCoords.lng, punto.lat, punto.lng)
      })).sort((a, b) => a.distance - b.distance);

      const nearbyPoints = pointsWithDistance.filter(p => p.distance <= 50);
      
      if (nearbyPoints.length > 0) {
        puntosFiltrados.value = nearbyPoints;
        lastSearch.value = 'cercanos a tu ubicación';
      } else {
        puntosFiltrados.value = pointsWithDistance.slice(0, 5);
        lastSearch.value = 'más cercanos a tu ubicación';
        uiState.value.noResults = true;
      }
      
      renderMarkers(puntosFiltrados.value);
      
      if (userLocationMarker) userLocationMarker.remove();
      userLocationMarker = L.marker([userCoords.lat, userCoords.lng], { icon: userLocationIcon })
        .addTo(mapInstance)
        .bindPopup("<b>Tu ubicación actual</b>");
        
      const bounds = markersLayer.getBounds();
      if (userLocationMarker) {
        bounds.extend(userLocationMarker.getLatLng());
      }
      
      if (bounds.isValid()) {
        mapInstance.fitBounds(bounds, { padding: config.value.zoomLevels.fitBoundsPadding });
      } else if (userLocationMarker) {
        mapInstance.flyTo([userCoords.lat, userCoords.lng], config.value.zoomLevels.city);
      }
      
      uiState.value.loading = false;
    };

    const locateUserAndShowNearby = () => {
      if (!navigator.geolocation) {
        alert("La geolocalización no es soportada por tu navegador.");
        return;
      }
      
      uiState.value.loading = true;
      uiState.value.statusMessage = 'Obteniendo tu ubicación...';

      navigator.geolocation.getCurrentPosition(
        processUserLocation, // Éxito
        (error) => { // Error
          console.error("Error de Geolocalización:", error.message);
          alert(`Error al obtener tu ubicación: ${error.message}\nMostrando vista general.`);
          uiState.value.loading = false;
          resetSearch();
        }
      );
    };

    // --- Ciclo de Vida ---
    onMounted(async () => {
      await loadConfigAndData();
      initMap(() => {
        // Al inicio, intenta localizar. Si falla, `resetSearch` limpiará el panel.
        locateUserAndShowNearby();
      });
    });

    onUnmounted(() => {
      if (mapInstance) {
        mapInstance.remove();
        mapInstance = null;
      }
    });

    return { 
      searchCity, lastSearch, puntosFiltrados, selectedPoint, uiState,
      mapElementRef, resultsListRef, pointRefs,
      triggerSearch, resetSearch, selectPunto, highlightMarker,
      locateUserAndShowNearby
    };
  },
};
</script>

<style scoped>
.theme-modern {
  --brand-blue: #007bff;
  --brand-blue-dark: #005bb5;
  --brand-blue-light: #e5f2ff;
  --brand-red: #ff3b30;
  
  --text-primary: #2c3e50;
  --text-secondary: #8a99a8;
  --text-on-brand-color: #ffffff;

  --surface-background: #ffffff;
  --app-background: #f8f9fa;
  --border-color: #e1e7ec;

  --shadow-color: rgba(44, 62, 80, 0.1);
  --focus-ring-color: rgba(0, 122, 255, 0.25);
  
  --border-radius-md: 8px;
  --border-radius-lg: 12px;
  --transition-speed: 0.2s;
}

.map-component-wrapper {
  display: grid;
  grid-template-columns: minmax(320px, 400px) 1fr;
  gap: 1.5rem;
  height: 90vh;
  max-height: 800px;
  border-radius: 25px;
  padding: 1.5rem;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  background-color: var(--app-background);
}

.search-controls-panel {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  background: var(--surface-background);
  border-radius: var(--border-radius-lg);
  box-shadow: 0 8px 24px var(--shadow-color);
  padding: 1.5rem;
  overflow: hidden;
}

.panel-section {
  display: flex;
  flex-direction: column;
}

.panel-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 1rem 0;
}

.search-input-group {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 14px;
  color: var(--text-secondary);
  font-size: 0.9rem;
  z-index: 2;
}

.search-input {
  width: 100%;
  padding: 12px 14px 12px 40px;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-md);
  font-size: 1rem;
  color: var(--text-primary);
  transition: all var(--transition-speed) ease;
}

.search-input::placeholder { color: var(--text-secondary); }

.search-input:focus {
  outline: none;
  border-color: var(--brand-blue);
  box-shadow: 0 0 0 3px var(--focus-ring-color);
}

.reset-button, .locate-button, .search-action-button {
  position: absolute;
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 4px;
  transition: all var(--transition-speed);
  opacity: 0.6;
  height: 100%;
  display: flex;
  align-items: center;
}

.reset-button:hover, .locate-button:hover, .search-action-button:hover {
  opacity: 1;
  color: var(--brand-blue);
}

.reset-button {
  right: 10px;
}

.search-action-button {
  right: 40px;
}

.locate-button {
  right: 10px;
}

.search-input:not(:placeholder-shown) ~ .locate-button {
    right: 70px;
}

.results-section {
  flex-grow: 1;
  min-height: 0;
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  padding: 0 0.25rem;
}

.results-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
}

.results-count {
  font-size: 0.8rem;
  font-weight: 700;
  background-color: var(--brand-blue-light);
  color: var(--brand-blue);
  padding: 2px 8px;
  border-radius: 1rem;
}

.results-list {
  list-style: none;
  padding: 0;
  margin: 0;
  overflow-y: auto;
  flex-grow: 1;
}

.results-list::-webkit-scrollbar { width: 6px; }
.results-list::-webkit-scrollbar-track { background: transparent; }
.results-list::-webkit-scrollbar-thumb { background: var(--border-color); border-radius: 3px; }
.results-list::-webkit-scrollbar-thumb:hover { background: var(--text-secondary); }

.results-list li {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem 1rem;
  border-radius: var(--border-radius-md);
  cursor: pointer;
  transition: background-color var(--transition-speed) ease-out;
  border-bottom: 1px solid var(--app-background);
}
.results-list li:last-child {
    border-bottom: none;
}
.results-list li:hover { background-color: var(--app-background); }
.results-list li.selected {
  background-color: var(--brand-blue);
  color: var(--text-on-brand-color);
  box-shadow: 0 4px 12px rgba(0, 122, 255, 0.2);
}

.point-icon-wrapper {
    color: var(--brand-blue);
    font-size: 1.1rem;
    padding-top: 0.2rem;
    flex-shrink: 0;
}
.results-list li.selected .point-icon-wrapper {
    color: var(--text-on-brand-color);
}

.point-details {
  line-height: 1.4;
  flex-grow: 1;
}

.point-details strong {
  font-weight: 600;
  display: block;
  color: var(--text-primary);
  margin-bottom: 0.35rem;
}

.point-details small { 
    color: var(--text-secondary);
    font-size: 0.9em;
    line-height: 1.5;
    display: block;
}

.point-details .point-distance {
  font-size: 0.8em;
  font-weight: 500;
  margin-top: 0.5rem;
  color: var(--brand-blue-dark);
}

.results-list li.selected .point-details strong,
.results-list li.selected .point-details small {
    color: var(--text-on-brand-color);
}

.results-list li.selected .point-distance {
    color: rgba(255, 255, 255, 0.9);
}

.no-results-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 2rem 1rem;
  color: var(--text-secondary);
  background-color: var(--app-background);
  border-radius: var(--border-radius-md);
  flex-grow: 1;
  height: 100%;
}

.no-results-message .icon {
    font-size: 2rem;
    margin-bottom: 1rem;
    color: var(--border-color);
}

.map-main-container {
  position: relative;
  border-radius: var(--border-radius-lg);
  overflow: hidden;
  box-shadow: 0 8px 24px var(--shadow-color);
}

#map { width: 100%; height: 100%; background-color: #eaf2f8; }

.map-overlay-message {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  background-color: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(4px);
  z-index: 1001;
  color: var(--text-primary);
  font-weight: 500;
}

.spinner {
  border: 4px solid var(--brand-blue-light);
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border-left-color: var(--brand-blue);
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

@media screen and (max-width: 992px) {
  .map-component-wrapper {
    grid-template-columns: 1fr;
    height: auto;
    padding: 1rem;
  }
  .search-controls-panel {
    height: auto;
    max-height: 45vh;
  }
  .map-main-container {
      min-height: 350px;
      height: 50vh;
  }
}
</style>