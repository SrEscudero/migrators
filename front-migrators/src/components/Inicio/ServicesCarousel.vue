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
/* Importación de fuentes (idealmente en un CSS global o en index.html) */
/* @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap'); */

/* Variables CSS definidas en el contenedor principal del componente */
.services-section {
  --primary-color-services: #2c3e50; /* Renombradas para evitar colisiones si son locales */
  --secondary-color-services: #42b983;
  --text-color-services: #34495e;
  --light-text-services: #7f8c8d;
  --bg-color-services: #ffffff;
  --card-bg-services: #f8f9fa;
  --shadow-color-services: rgba(0, 0, 0, 0.1);
  --transition-duration-services: 0.4s;
  --font-family-services: 'Poppins', sans-serif; /* Asegúrate que Poppins esté cargada globalmente */

  padding: 4rem 0;
  background-color: var(--bg-color-services);
  font-family: var(--font-family-services);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.section-title {
  font-size: clamp(2rem, 3vw, 2.5rem);
  font-weight: 700;
  color: var(--primary-color-services);
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
  bottom: 8px; /* Ajustado para que no esté tan pegado */
  left: 5%; /* Centrado ligero */
  width: 90%; /* Ligeramente menos ancho que el texto */
  height: 10px; /* Un poco menos alto */
  background-color: rgba(66, 185, 131, 0.25); /* Más suave el color */
  z-index: -1;
  transition: height 0.3s ease, background-color 0.3s ease;
  border-radius: 3px; /* Bordes redondeados para el subrayado */
}

.section-title:hover .title-decoration::after {
  height: 14px; /* Crece un poco más */
  background-color: rgba(66, 185, 131, 0.4);
}

.section-subtitle {
  font-size: clamp(1rem, 1.5vw, 1.2rem);
  color: var(--light-text-services);
  text-align: center;
  margin-bottom: 3rem;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.7; /* Mejorado para legibilidad */
}

/* Grid de servicios */
.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2.5rem; /* Un poco más de espacio */
  margin-top: 2rem;
}

/* Tarjetas de servicio */
.service-card {
  background-color: var(--card-bg-services);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 8px 25px var(--shadow-color-services); /* Sombra más suave y difusa */
  transition: transform var(--transition-duration-services) ease, box-shadow var(--transition-duration-services) ease;
  position: relative;
  z-index: 1;
  display: flex; /* Para mejor control del contenido interno */
  flex-direction: column; /* Apilar contenido verticalmente */
}

.service-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 6px; /* Un poco más grueso */
  background-color: var(--dynamic-accent-color, var(--secondary-color-services)); /* Usa el color dinámico o uno por defecto */
  z-index: 2;
  transition: height 0.3s ease;
}

.service-card:hover {
  transform: translateY(-12px); /* Efecto de elevación más pronunciado */
  box-shadow: 0 18px 45px rgba(0, 0, 0, 0.12);
}
.service-card:hover::before {
    height: 8px; /* La barra de color crece un poco */
}


/* Contenedor de imagen */
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
  transition: transform 0.5s cubic-bezier(0.25, 0.8, 0.25, 1); /* Transición más suave */
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.5) 100%); /* Gradiente más sutil */
  opacity: 0.8; /* Ligeramente menos opaco */
  transition: opacity 0.5s ease;
}

.service-card:hover .card-image {
  transform: scale(1.1); /* Efecto de zoom más pronunciado */
}
.service-card:hover .image-overlay {
  opacity: 0.6; /* El overlay se hace más transparente al hacer hover */
}


/* Contenido de la tarjeta */
.card-content {
  padding: 1.8rem; /* Un poco más de padding */
  position: relative;
  flex-grow: 1; /* Permite que esta sección crezca para alinear botones */
  display: flex;
  flex-direction: column;
  text-align: center; /* Centrar contenido de texto */
}

.service-icon {
  width: 60px;
  height: 60px;
  background-color: var(--dynamic-accent-color, var(--secondary-color-services));
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: -45px auto 1rem auto; /* Ajustado para mejor superposición y espacio */
  position: relative;
  z-index: 3;
  box-shadow: 0 6px 12px rgba(0,0,0,0.15);
  font-size: 1.6rem; /* Tamaño del ícono */
  border: 3px solid var(--bg-color-services); /* Borde para destacar sobre la imagen */
}

.card-title {
  font-size: clamp(1.2rem, 1.5vw, 1.4rem);
  font-weight: 600;
  color: var(--primary-color-services);
  margin-bottom: 0.8rem; /* Menos espacio si el subtítulo es corto */
}

.card-description {
  font-size: clamp(0.9rem, 1vw, 1rem);
  line-height: 1.7; /* Mejorado para legibilidad */
  color: var(--text-color-services);
  margin-bottom: 1.5rem;
  flex-grow: 1; /* Empuja el botón hacia abajo */
}

/* Botón */
.card-button {
  display: inline-block; /* Cambiado para que funcione con margin auto */
  width: auto; /* Ajuste de ancho automático */
  max-width: 200px; /* Ancho máximo para el botón */
  margin: 0 auto; /* Centrar el botón si es más angosto que el contenido */
  padding: 0.75rem 1.8rem; /* Un poco más de padding */
  background-color: var(--dynamic-accent-color, var(--secondary-color-services));
  color: white;
  border: none;
  border-radius: 50px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
  text-decoration: none; /* Para <router-link> */
}

.card-button:hover, .card-button:focus {
  background-color: var(--primary-color-services); /* Color primario al hacer hover */
  transform: translateY(-3px) scale(1.03); /* Efecto más sutil */
  box-shadow: 0 7px 15px rgba(0,0,0,0.2);
}

.button-icon {
  margin-left: 0.5rem;
  display: inline-block; /* Para que la transformación funcione bien */
  transition: transform 0.3s ease;
}

.card-button:hover .button-icon {
  transform: translateX(4px);
}

/* Diseño responsivo */
@media (max-width: 992px) { /* Tablets */
  .services-grid {
    gap: 2rem; /* Mantener un buen espacio */
  }
  .section-title { font-size: clamp(1.8rem, 2.5vw, 2.2rem); }
  .section-subtitle { font-size: clamp(0.9rem, 1.2vw, 1.1rem); }
}

@media (max-width: 768px) { /* Móviles grandes */
  .services-section { padding: 3rem 0; }
  .services-grid {
    grid-template-columns: 1fr; /* Una columna */
    max-width: 450px; /* Un poco menos para no ocupar toda la pantalla */
    margin-left: auto;
    margin-right: auto;
    gap: 2rem; /* Espacio entre tarjetas apiladas */
  }
  .section-title { font-size: clamp(1.6rem, 5vw, 2rem); }
  .card-content { padding: 1.5rem; }
}

@media (max-width: 480px) { /* Móviles pequeños */
  .services-section { padding: 2.5rem 0; }
  .container { padding: 0 1rem; }
  .section-title { font-size: clamp(1.4rem, 6vw, 1.8rem); }
  .section-subtitle { font-size: clamp(0.85rem, 3vw, 1rem); margin-bottom: 2rem; }
  .services-grid { max-width: 100%; gap: 1.5rem; } /* Ocupar más ancho, menos gap */
  .card-image-container { height: 200px; } /* Imágenes un poco más pequeñas */
  .card-content { padding: 1.2rem; }
  .card-title { font-size: clamp(1.1rem, 4vw, 1.3rem); }
  .card-description { font-size: clamp(0.85rem, 2.5vw, 0.95rem); }
  .card-button { padding: 0.6rem 1.2rem; font-size: 0.9rem; }
}
</style>