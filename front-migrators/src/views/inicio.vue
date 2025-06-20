<template>
  <div class="home-page">
    <section class="hero-section text-white">
      <div class="container text-center">
        <h1 class="display-3 fw-bold mb-3 animate__animated animate__fadeInUp">Bienvenido a Migrators</h1>
        <p class="lead fs-4 mb-4 animate__animated animate__fadeInUp animate__delay-1s">
          Tu guía completa para la migración a Brasil
        </p>
        <button 
          @click="scrollToSection('services')" 
          class="btn btn-light btn-lg px-5 py-3 animate__animated animate__fadeInUp animate__delay-2s hero-cta-button" 
          aria-label="Conoce nuestros servicios"
        >
          Comenzar Ahora
          <i class="bi bi-arrow-right-circle ms-2"></i> 
        </button>
      </div>
    </section>

    <main id="main-content" class="main-content-container" role="main" tabindex="-1">
      <section 
        id="services" 
        :ref="el => sectionRefs.services = el"
        class="content-section py-5" 
        aria-labelledby="services-heading"
      >
        <div class="container">
          <h2 id="services-heading" class="section-title text-center mb-4">
            Nuestros Servicios
          </h2>
          <p class="section-description text-center mb-5">
            Descubre cómo podemos ayudarte en tu proceso migratorio
          </p>
          <ServicesCarousel />
        </div>
      </section>

      <section 
        id="map" 
        :ref="el => sectionRefs.map = el"
        class="content-section py-5 section-bg-alt section-full-width" 
        aria-labelledby="map-heading"
      >
        <div class="container">
            <h2 id="map-heading" class="section-title text-center mb-4">
            Encuentra Ayuda Cerca de Ti
            </h2>
            <p class="section-description text-center mb-5">
            Localiza puntos de atención para migrantes en todo Brasil
            </p>
        </div>
        <InteractiveMap />
      </section>

      <section 
        id="faqs" 
        :ref="el => sectionRefs.faqs = el"
        class="content-section py-5" 
        aria-labelledby="faqs-heading"
      >
        <div class="container">
          <h2 id="faqs-heading" class="section-title text-center mb-4">
            Preguntas Frecuentes
          </h2>
          <p class="section-description text-center mb-5">
            Encuentra respuestas a las dudas más comunes
          </p>
          <FaqSection />
        </div>
      </section>

      <section
        id="contact"
        :ref="el => sectionRefs.contact = el"
        class="content-section py-5 section-bg-alt"
        aria-labelledby="contact-heading"
      >
        <div class="container">
          <h2 id="contact-heading" class="section-title text-center mb-4">
            ¿Necesitas más ayuda?
          </h2>
          <p class="section-description text-center mb-5">
            Nuestro equipo está listo para asistirte. Ponte en contacto con nosotros.
          </p>
          <div class="text-center">
            <router-link to="/contacto" class="btn btn-primary btn-lg px-5 py-3">
              Ir a Contacto
              <i class="bi bi-envelope-fill ms-2"></i>
            </router-link>
          </div>
        </div>
      </section>
    </main>

    <AppFooter @scroll-to-contact="() => scrollToSection('contact')" />

    <nav class="quick-nav visually-hidden" aria-label="Navegación rápida">
      <ul>
        <li v-for="section in sectionsForNav" :key="section.id">
          <button @click="scrollToSection(section.id)">
            Ir a {{ section.title }}
          </button>
        </li>
      </ul>
    </nav>
  </div>
</template>

<script>
import { ref, reactive, onMounted, onUnmounted, defineAsyncComponent } from 'vue';
import { useHead } from '@vueuse/head';

// --- Carga Diferida de Componentes (Excelente práctica) ---
const ServicesCarousel = defineAsyncComponent({
  loader: () => import('@/components/Inicio/ServicesCarousel.vue'),
  loadingComponent: { template: '<div class="component-loading"><div class="spinner-border" role="status"><span class="visually-hidden">Cargando...</span></div></div>' }
});
const InteractiveMap = defineAsyncComponent({
  loader: () => import('@/components/Inicio/MapSection.vue'),
  loadingComponent: { template: '<div class="component-loading"><div class="spinner-border" role="status"><span class="visually-hidden">Cargando...</span></div></div>' }
});
const FaqSection = defineAsyncComponent({
  loader: () => import('@/components/Inicio/FaqSection.vue'),
  loadingComponent: { template: '<div class="component-loading"><div class="spinner-border" role="status"><span class="visually-hidden">Cargando...</span></div></div>' }
});
const AppFooter = defineAsyncComponent({
  loader: () => import('@/components/shared/Footer.vue'),
  loadingComponent: { template: '<footer class="text-center p-3">Cargando...</footer>' }
});

export default {
  name: 'HomePage',
  components: { ServicesCarousel, InteractiveMap, FaqSection, AppFooter },
  setup() {
    /** MEJORA: Se añaden metadatos Open Graph (og:*) y Twitter para un mejor compartido en redes sociales */
    useHead({
      title: 'Migrators - Guía Completa para Migrantes en Brasil',
      meta: [
        { name: 'description', content: 'Migrators: Tu plataforma de orientación integral para la vida en Brasil. Información sobre documentos (CPF, RNM), empleo, cultura y puntos de ayuda.' },
        { name: 'keywords', content: 'migración Brasil, migrantes Venezuela, documentos Brasil, CPF, RNM, RNE, empleo Brasil, cultura brasileña, ayuda migrantes, servicios migrantes, adaptación Brasil' },
        
        // Open Graph (para Facebook, WhatsApp, etc.)
        { property: 'og:title', content: 'Migrators - Guía Completa para Migrantes en Brasil' },
        { property: 'og:description', content: 'Tu plataforma de orientación integral para la vida en Brasil.' },
        { property: 'og:type', content: 'website' },
        { property: 'og:url', content: 'https://www.tu-dominio.com' }, // Reemplazar con tu URL real
        { property: 'og:image', content: 'https://www.tu-dominio.com/images/social-share.jpg' }, // URL a una imagen para compartir (ej. 1200x630px)

        // Twitter Card
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'Migrators - Guía Completa para Migrantes en Brasil' },
        { name: 'twitter:description', content: 'Tu plataforma de orientación integral para la vida en Brasil.' },
        { name: 'twitter:image', content: 'https://www.tu-dominio.com/images/social-share.jpg' }, // Misma imagen que OG
      ],
      link: [
        { rel: 'preload', href: '/images/hero-bg.webp', as: 'image', type: 'image/webp' },
        // Precargar la fuente si es crucial para el renderizado inicial
        // { rel: 'preload', href: 'https://fonts.gstatic.com/s/poppins/v20/pxiByp8kv8JHgFVrLCz7Z1xlFQ.woff2', as: 'font', type: 'font/woff2', crossorigin: 'anonymous' },
      ]
    });

    const sectionsForNav = ref([
      { id: 'services', title: 'Servicios' },
      { id: 'map', title: 'Mapa de Ayuda' },
      { id: 'faqs', title: 'Preguntas Frecuentes' },
      { id: 'contact', title: 'Contacto' }
    ]);
    
    /** MEJORA: Usar un objeto reactivo para las refs es más limpio y escalable que refs individuales. */
    const sectionRefs = reactive({});
    const observer = ref(null);

    const scrollToSection = (sectionId) => {
      const targetElement = sectionRefs[sectionId];
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        
        // La gestión de foco que tienes ya es excelente
        setTimeout(() => {
          const focusableElement = targetElement.querySelector('h2') || targetElement;
          if (focusableElement) {
            focusableElement.setAttribute('tabindex', '-1');
            focusableElement.focus({ preventScroll: true });
          }
        }, 700);
      }
    };

    const setupIntersectionObserver = () => {
      const sectionsToObserve = document.querySelectorAll('.content-section');
      if (!sectionsToObserve.length) return;

      observer.value = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
            observer.value.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
      
      sectionsToObserve.forEach(section => observer.value.observe(section));
    };

    onMounted(() => {
      setupIntersectionObserver();
    });

    onUnmounted(() => {
      if (observer.value) observer.value.disconnect();
    });

    return {
      sectionsForNav,
      sectionRefs,
      scrollToSection,
    };
  }
};
</script>

<style scoped>
/* --- MEJORA: Paleta de colores y variables de diseño refinadas --- */
:root {
  --brand-primary: #1D3557; /* Azul marino profundo */
  --brand-secondary: #457B9D; /* Azul acero */
  --brand-accent: #E63946; /* Rojo vibrante para CTAs importantes */
  --brand-light: #F1FAEE; /* Crema/blanco roto para fondos alternos */
  --brand-highlight: #A8DADC; /* Azul claro para acentos sutiles */
  
  --text-dark: #212529;
  --text-light: #6c757d;
  
  --font-body: 'Poppins', sans-serif;
  --section-padding-y: 6rem;
  --transition-smooth: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.home-page {
  background-color: #fff;
  font-family: var(--font-body);
}

/* --- Hero Section --- */
.hero-section {
  background: linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-secondary) 100%);
  padding: calc(var(--section-padding-y) + 2rem) 1rem;
  position: relative;
  overflow: hidden;
}
.hero-section::before {
  content: '';
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  background: url('/images/hero-bg.webp') no-repeat center center/cover;
  opacity: 0.06;
  transform: scale(1.1);
}
.hero-section .container {
  position: relative;
  z-index: 1;
}
/* MEJORA: Sombra de texto para mejorar legibilidad sobre el fondo */
.hero-section .display-3, .hero-section .lead {
    text-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
}
.hero-section .lead {
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
}
.hero-cta-button {
  font-weight: 600;
  padding: 0.85rem 2.5rem; 
  border-radius: 50px;
  transition: var(--transition-smooth);
  background-color: var(--brand-light);
  color: var(--brand-primary);
  border: 2px solid transparent;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}
.hero-cta-button:hover {
  background-color: transparent;
  border-color: var(--brand-light);
  color: var(--brand-light);
  transform: translateY(-4px);
  box-shadow: 0 6px 20px rgba(0,0,0,0.2);
}
.hero-cta-button i { transition: transform 0.2s ease-in-out; }
.hero-cta-button:hover i { transform: translateX(5px); }

/* --- Secciones de Contenido --- */
.content-section {
  padding-top: var(--section-padding-y);
  padding-bottom: var(--section-padding-y);
  opacity: 0;
  transform: translateY(50px);
  /* MEJORA: Animación de entrada más suave */
  transition: opacity 0.8s cubic-bezier(0.645, 0.045, 0.355, 1), transform 0.8s cubic-bezier(0.645, 0.045, 0.355, 1);
}
.section-bg-alt { background-color: var(--brand-light); }
.content-section.animate-in {
  opacity: 1;
  transform: translateY(0);
}

/* MEJORA: Sección de ancho completo para el mapa */
.section-full-width {
    padding-left: 0;
    padding-right: 0;
}

.section-title {
  font-size: clamp(2rem, 4vw, 2.8rem);
  font-weight: 700;
  color: var(--brand-primary);
  margin-bottom: 0.75rem;
  position: relative;
}
.section-title::after {
  content: '';
  display: block;
  width: 80px; /* Un poco más largo */
  height: 3px; /* Un poco más fino */
  background-color: var(--brand-highlight); /* Color de acento sutil */
  margin: 1rem auto 0; 
  border-radius: 2px;
}
.section-description {
  font-size: clamp(1.1rem, 2.5vw, 1.25rem);
  color: var(--text-light);
  max-width: 750px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.7;
}

/* --- Placeholder de Carga de Componentes --- */
.component-loading {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 300px;
    padding: 2rem;
    background-color: rgba(0,0,0,0.02);
    border-radius: 12px;
}
.component-loading .spinner-border {
    width: 3rem;
    height: 3rem;
    color: var(--brand-secondary);
}

/* --- Accesibilidad y Navegación Rápida (Skip Links) --- */
.quick-nav {
  position: fixed; top: 10px; left: 10px;
  background: #fff; padding: 0.5rem;
  z-index: 1050; border-radius: 4px; box-shadow: 0 2px 10px rgba(0,0,0,0.2);
}
.visually-hidden:not(:focus):not(:active) {
  position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
  overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0;
}

/* --- Media Queries --- */
@media (max-width: 992px) {
  :root { --section-padding-y: 4rem; }
}

@media (max-width: 768px) {
  :root { --section-padding-y: 3rem; }
  .hero-section { padding-top: 5rem; padding-bottom: 5rem; }
}
</style>