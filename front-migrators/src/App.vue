<template>
  <div id="app">
    <Header v-if="!$route.meta.hideLayout" />

    <main>
      <template v-if="$route.path === '/'">
        <SloganSection />
        <ServicesCarousel />
        <MapSection />
        <FaqSection />
      </template>

      <router-view v-else />
    </main>

    <Footer v-if="!$route.meta.hideLayout" />
  </div>
</template>

<script>
import { onMounted, onBeforeUnmount } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
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
    const route = useRoute();
    const authStore = useAuthStore(); 

    const trackVisit = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/track-visit`, {
          method: 'POST'
        });
        if (!response.ok) throw new Error(`Error: ${response.status}`);
        const data = await response.json();
        console.log('✅ Visita registrada:', data);
      } catch (error) {
        console.error('❌ Error registrando visita:', error.message || 'Error desconocido');
      }
    };

    const trackExit = () => {
      try {
        const exitUrl = `${import.meta.env.VITE_API_URL}/api/exit`;
        navigator.sendBeacon(exitUrl); 
        console.log('📌 Salida registrada.');
      } catch (error) {
        console.error('❌ Error registrando salida:', error.message || 'Error desconocido');
      }
    };

    onMounted(() => {
      authStore.fetchUser();

      trackVisit(); 
      window.addEventListener('beforeunload', trackExit); 
    });

    onBeforeUnmount(() => {
      window.removeEventListener('beforeunload', trackExit);
    });

    return { route };
  },
};
</script>

<style>
:root {
  --color-primary: #1D3557; /* Azul marino profundo (usado en Login/Header) */
  --color-primary-light: #457B9D; /* Azul acero (usado en Login/Header) */
  --color-secondary: #42b983; /* Verde Migrators (usado en sobre-nosotros) */
  --color-accent: #33c8f5; /* Celeste/Turquesa (usado en SloganSection) */
  --color-danger: #E63946; /* Rojo para alertas o acciones destructivas */

  /* Paleta Neutral */
  --color-text: #2c3e50; /* Gris oscuro para texto principal */
  --color-text-muted: #6c757d; /* Gris más claro para texto secundario */
  --color-background: #f8f9fa; /* Fondo general de la app (gris muy claro) */
  --color-surface: #ffffff; /* Fondo para tarjetas, modales, etc. (blanco) */
  --color-border: #e0e6ed; /* Color para bordes sutiles */

  /* Tipografía */
  --font-family-base: 'Poppins', sans-serif;
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-bold: 700;

  /* Otros tokens de diseño */
  --border-radius-md: 0.75rem; /* 12px */
  --border-radius-lg: 1.25rem; /* 20px */
  --shadow-soft: 0 4px 12px rgba(0, 0, 0, 0.08);
  --shadow-medium: 0 8px 25px rgba(0, 0, 0, 0.1);
  --transition-speed: 0.3s;
  
  /* Variables de Layout del Dashboard */
  --topbar-height: 70px;
  --sidebar-width: 280px;
  --sidebar-collapsed-width: 80px;
}

/* Estilos para el modo oscuro */
body.dark-mode {
  --color-text: #e0e0e0;
  --color-text-muted: #a0a0a0;
  --color-background: #1a1a2e;
  --color-surface: #21213a;
  --color-border: #3a3a5a;
}

/* Estilos globales básicos */
body {
  font-family: var(--font-family-base);
  background-color: var(--color-background);
  color: var(--color-text);
  margin: 0;
  padding: 0;
}

h1, h2, h3, h4, h5, h6 {
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
}

/* --- LA CORRECCIÓN ESTÁ AQUÍ --- */
/*
ANTES:
main {
  padding: 1.5rem;
}
*/

/* AHORA:
   Esta regla ahora SOLO se aplica al <main> que es hijo directo de #app,
   ignorando el <main> del dashboard y resolviendo el conflicto.
*/
div#app > main {
  padding: 1.5rem;
}
</style>