<template>
  <section class="services-section" aria-labelledby="services-heading">
    <div class="container">
      <h2 id="services-heading" class="section-title"> <span class="title-decoration">Nuestros Servicios</span>
      </h2>
      <p class="section-subtitle">Descubre cómo podemos ayudarte en tu proceso migratorio</p>

      <div class="services-grid">
        <article
          v-for="(service, index) in services"
          :key="service.title" class="service-card"
          :style="{ '--dynamic-accent-color': serviceColors[index % serviceColors.length] }" 
          ><div class="card-image-container">
            <img
              :src="service.image"
              class="card-image"
              :alt="`Ilustración para ${service.title}`" loading="lazy"
              :aria-describedby="'desc-' + index"
            />
            <div class="image-overlay"></div>
          </div>
          <div class="card-content">
            <div class="service-icon" aria-hidden="true">
              <i :class="['fas', serviceIcons[index % serviceIcons.length]]"></i> </div>
            <h3 class="card-title">{{ service.title }}</h3>
            <p :id="'desc-' + index" class="card-description">{{ service.description }}</p>
            <router-link :to="service.link || '#'" class="card-button" :aria-label="'Más información sobre ' + service.title">
              Saber más
              <span class="button-icon" aria-hidden="true">→</span>
            </router-link>
            </div>
        </article>
      </div>
    </div>
  </section>
</template>

<script>
import asesoriaTramitesImage from '../../assets/midia/images/asesoria-tramites (2).jpg';
import guiaDeTrabajoImage from '../../assets/midia/images/guia-de-trabajo.jpg';
import culturaImage from '../../assets/midia/images/cultura.jpg';

export default {
  name: 'ServicesSection',
  data() {
    return {
      services: [
        {
          title: 'Asesoría para trámites legales',
          description: 'Te ayudamos con documentos esenciales como CPF, RNE y más.',
          image: asesoriaTramitesImage,
          link: '/servicios/asesoria-legal' // Ejemplo de enlace
        },
        {
          title: 'Guía para encontrar empleo',
          description: 'Consejos y recursos para insertarte en el mercado laboral brasileño.',
          image: guiaDeTrabajoImage,
          link: '/servicios/guia-empleo' // Ejemplo de enlace
        },
        {
          title: 'Adaptarte a la cultura brasileña',
          description: 'Aprende sobre idioma, costumbres y cómo sentirte en casa.',
          image: culturaImage,
          link: '/servicios/adaptacion-cultural' // Ejemplo de enlace
        },
      ],
      // Estos colores se usarán para la variable CSS --dynamic-accent-color en cada tarjeta
      serviceColors: ['#3498db', '#2ecc71', '#e74c3c', '#f39c12', '#9b59b6'], // Añadí más colores por si tienes más servicios
      // Estas serían las clases de íconos (ej. de Font Awesome)
      serviceIcons: ['fa-file-alt', 'fa-briefcase', 'fa-globe-americas', 'fa-comments', 'fa-heart'], // Ejemplo con fa-
    };
  },
  // methods: { // Ejemplo si los botones ejecutan métodos
  //   handleSaberMas(service) {
  //     console.log('Saber más sobre:', service.title);
  //     // this.$router.push(service.link || '/contacto');
  //   }
  // }
};
</script>

<style scoped>
.services-section {
  /* Eliminamos las variables locales --*-services */
  padding: 4rem 0;
  font-family: var(--font-family-base);
  background-color: var(--color-surface); /* Fondo blanco para esta sección */
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.section-title {
  font-size: clamp(2rem, 3vw, 2.5rem);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
  text-align: center;
  margin-bottom: 1rem;
  position: relative;
}

.title-decoration {
  position: relative;
  display: inline-block;
}

.title-decoration::after {
  content: '';
  position: absolute;
  bottom: 8px;
  left: 5%;
  width: 90%;
  height: 10px;
  background-color: rgba(66, 185, 131, 0.25);
  z-index: -1;
  transition: height 0.3s ease, background-color 0.3s ease;
  border-radius: 3px;
}

.section-title:hover .title-decoration::after {
  height: 14px;
  background-color: rgba(66, 185, 131, 0.4);
}

.section-subtitle {
  font-size: clamp(1rem, 1.5vw, 1.2rem);
  color: var(--color-text-muted);
  text-align: center;
  margin-bottom: 3rem;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.7;
}

.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2.5rem;
  margin-top: 2rem;
}

.service-card {
  background-color: var(--color-background); /* Fondo gris claro para las tarjetas */
  border-radius: var(--border-radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-soft);
  transition: transform var(--transition-speed), box-shadow var(--transition-speed);
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
}

.service-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 6px;
  background-color: var(--dynamic-accent-color, var(--color-secondary));
  z-index: 2;
  transition: height 0.3s ease;
}

.service-card:hover {
  transform: translateY(-12px);
  box-shadow: var(--shadow-medium);
}

.service-card:hover::before {
    height: 8px;
}

.card-image-container {
  position: relative;
  width: 100%;
  height: 220px;
  overflow: hidden;
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.5) 100%);
  opacity: 0.8;
  transition: opacity 0.5s ease;
}

.service-card:hover .card-image {
  transform: scale(1.1);
}

.service-card:hover .image-overlay {
  opacity: 0.6;
}

.card-content {
  padding: 1.8rem;
  position: relative;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  text-align: center;
}

.service-icon {
  width: 60px;
  height: 60px;
  background-color: var(--dynamic-accent-color, var(--color-secondary));
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: -45px auto 1rem auto;
  position: relative;
  z-index: 3;
  box-shadow: 0 6px 12px rgba(0,0,0,0.15);
  font-size: 1.6rem;
  border: 3px solid var(--color-background);
}

.card-title {
  font-size: clamp(1.2rem, 1.5vw, 1.4rem);
  font-weight: 600;
  color: var(--color-primary);
  margin-bottom: 0.8rem;
}

.card-description {
  font-size: clamp(0.9rem, 1vw, 1rem);
  line-height: 1.7;
  color: var(--color-text);
  margin-bottom: 1.5rem;
  flex-grow: 1;
}

.card-button {
  display: inline-block;
  width: auto;
  max-width: 200px;
  margin: 0 auto;
  padding: 0.75rem 1.8rem;
  background-color: var(--dynamic-accent-color, var(--color-secondary));
  color: white;
  border: none;
  border-radius: 50px;
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
  text-decoration: none;
}

.card-button:hover, .card-button:focus {
  background-color: var(--color-primary);
  transform: translateY(-3px) scale(1.03);
  box-shadow: 0 7px 15px rgba(0,0,0,0.2);
}

.button-icon {
  margin-left: 0.5rem;
  display: inline-block;
  transition: transform 0.3s ease;
}

.card-button:hover .button-icon {
  transform: translateX(4px);
}

/* Responsive */
@media (max-width: 992px) {
  .services-grid {
    gap: 2rem;
  }
  .section-title { font-size: clamp(1.8rem, 2.5vw, 2.2rem); }
  .section-subtitle { font-size: clamp(0.9rem, 1.2vw, 1.1rem); }
}

@media (max-width: 768px) {
  .services-section { padding: 3rem 0; }
  .services-grid {
    grid-template-columns: 1fr;
    max-width: 450px;
    margin-left: auto;
    margin-right: auto;
    gap: 2rem;
  }
  .section-title { font-size: clamp(1.6rem, 5vw, 2rem); }
  .card-content { padding: 1.5rem; }
}

@media (max-width: 480px) {
  .services-section { padding: 2.5rem 0; }
  .container { padding: 0 1rem; }
  .section-title { font-size: clamp(1.4rem, 6vw, 1.8rem); }
  .section-subtitle { font-size: clamp(0.85rem, 3vw, 1rem); margin-bottom: 2rem; }
  .services-grid { max-width: 100%; gap: 1.5rem; }
  .card-image-container { height: 200px; }
  .card-content { padding: 1.2rem; }
  .card-title { font-size: clamp(1.1rem, 4vw, 1.3rem); }
  .card-description { font-size: clamp(0.85rem, 2.5vw, 0.95rem); }
  .card-button { padding: 0.6rem 1.2rem; font-size: 0.9rem; }
}
</style>