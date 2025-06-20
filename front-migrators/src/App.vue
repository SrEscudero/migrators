<template>
  <div id="app">
    <!-- Encabezado (no se muestra en /admin) -->
    <Header v-if="$route.path !== '/admin'" />

    <!-- Contenido principal -->
    <main>
      <template v-if="$route.path === '/'">
        <!-- Sección del eslogan -->
        <SloganSection />
        <!-- Carrusel de servicios -->
        <ServicesCarousel />
        <!-- Mapa interactivo -->
        <MapSection />
        <!-- Preguntas frecuentes -->
        <FaqSection />
      </template>

      <!-- Vista de las rutas -->
      <router-view v-else />
    </main>

    <!-- Pie de página (no se muestra en /admin) -->
    <Footer v-if="$route.path !== '/admin'" />
  </div>
</template>

<script>
import { onMounted, onBeforeUnmount } from 'vue';
import { useRoute } from 'vue-router';

// Importa los componentes
import Header from './components/shared/Header.vue';
import SloganSection from './components/Inicio/SloganSection.vue';
import ServicesCarousel from './components/Inicio/ServicesCarousel.vue';
import MapSection from './components/Inicio/MapSection.vue';
import FaqSection from './components/Inicio/FaqSection.vue';
import Footer from './components/shared/Footer.vue';

export default {
  components: {
    Header,
    SloganSection,
    ServicesCarousel,
    MapSection,
    FaqSection,
    Footer,
  },
  setup() {
    const route = useRoute(); // Obtiene la ruta actual

    // Función para registrar la visita
    const trackVisit = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/track-visit`);
        if (!response.ok) throw new Error(`Error: ${response.status}`);
        const data = await response.json();
        console.log('✅ Visita registrada:', data);
      } catch (error) {
        console.error('❌ Error registrando visita:', error.message || 'Error desconocido');
      }
    };

    // Función para registrar la salida
    const trackExit = () => {
      try {
        const exitUrl = `${import.meta.env.VITE_API_URL}/api/exit`;
        navigator.sendBeacon(exitUrl); // Usa sendBeacon para registrar la salida
        console.log('📌 Salida registrada.');
      } catch (error) {
        console.error('❌ Error registrando salida:', error.message || 'Error desconocido');
      }
    };

    // Llama a la función cuando la app se monta
    onMounted(() => {
      trackVisit(); // Registra la visita al cargar la página
      window.addEventListener('beforeunload', trackExit); // Registra la salida al cerrar la pestaña
    });

    // Elimina el listener cuando el componente se desmonta
    onBeforeUnmount(() => {
      window.removeEventListener('beforeunload', trackExit);
    });

    return { route };
  },
};
</script>

<style>

:root {
  --topbar-height: 70px;
  --sidebar-width: 250px;
  --sidebar-collapsed-width: 80px;
  --transition-speed: 0.3s;

  /* Colores base de tu dashboard (ejemplos) */
  --hover-color: #f0f7ff;
  --text-color-dark: #333333;
  --text-color-light: #f8f9fa;
  --icon-color: #6c757d;
  --border-color: #e0e0e0;
  --background-light: #ffffff;
  --background-grey: #f8f9fa;
}

/* Estilos globales */
body {
  font-family: 'Poppins', sans-serif;
  margin: 0;
  padding: 0;
  background-color: #f9f9f9;
  color: #333;
}

@media (max-width: 767.98px) { /* Breakpoint para móvil */
  :root {
    --topbar-height: 60px;
    /* En móvil, el sidebar puede tener un ancho diferente cuando es overlay */
    --sidebar-overlay-width: 280px;
  }
}

h1, h2, h3 {
  font-weight: 600;
}

img {
  max-width: 100%;
  height: auto;
}

main {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
}
</style>