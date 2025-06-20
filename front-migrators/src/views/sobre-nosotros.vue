<template>
  <main class="about-page">
    <section class="hero-container" aria-labelledby="hero-heading">
      <div class="hero-content">
        <h1 id="hero-heading" class="hero-title"> <span class="highlight">Nuestra historia</span>, tu guía en este camino
        </h1>
        <p class="hero-description">
          <strong class="brand">Migrators</strong> nació de la experiencia migratoria para convertirse en el apoyo que 
          nosotros mismos hubiéramos necesitado al comenzar este viaje.
        </p>
      </div>
      <div class="hero-image-wrapper"> 
        <img
          src="../assets/midia/images/migrantes.jpg" 
          alt="Grupo de migrantes sonriendo y colaborando, simbolizando apoyo y comunidad." 
          class="hero-img" 
          loading="eager"
        />
        <div class="image-overlay" aria-hidden="true"></div>
      </div>
    </section>

    <section class="mission-section" aria-labelledby="mission-heading">
      <div class="mission-container">
        <div class="mission-text">
          <h2 id="mission-heading" class="section-title">
            <span class="highlight">Caminamos juntos</span> hacia un futuro mejor
          </h2>
          <div class="mission-content">
            <p>
              En Migrators creemos que <strong>ningún migrante debería sentirse solo</strong> en el proceso de adaptación 
              a un nuevo país. Nuestra plataforma ofrece:
            </p>
            <ul class="mission-list">
              <li><i class="fas fa-check-circle me-2 icon-bullet"></i>Información <strong>verificada y actualizada</strong> sobre trámites</li>
              <li><i class="fas fa-check-circle me-2 icon-bullet"></i>Guías <strong>paso a paso</strong> para procesos migratorios</li>
              <li><i class="fas fa-check-circle me-2 icon-bullet"></i>Recursos para la <strong>integración cultural</strong></li>
              <li><i class="fas fa-check-circle me-2 icon-bullet"></i>Una <strong>comunidad</strong> de apoyo mutuo</li>
            </ul>
          </div>
        </div>
        <div class="mission-image-wrapper">
          <img
            src="../assets/midia/images/documentos.jpg" 
            alt="Manos revisando y organizando documentos importantes sobre un escritorio." 
            loading="lazy"
          />
        </div>
      </div>
    </section>

    <section class="team-section" aria-labelledby="team-heading">
      <h2 id="team-heading" class="section-title text-center">Conoce a nuestro equipo</h2>
      <div class="team-container">
        <article class="team-member">
          <div class="member-photo">
            <img 
              src="@/assets/midia/images/kelvis-escudero.jpeg" 
              alt="Foto de Kelvis Escudero, Fundador y CEO de Migrators"
              loading="lazy"
            />
          </div>
          <div class="member-info">
            <h3 class="member-name">Kelvis Escudero</h3>
            <p class="member-position">Fundador & CEO</p>
            <p class="member-bio">
              Migrante venezolano con experiencia en 3 países. Analista de Sistemas comprometido 
              con facilitar el proceso migratorio para otros, transformando desafíos en oportunidades.
            </p>
            </div>
        </article>
      </div>
    </section>

    <section class="cta-section-about" aria-labelledby="cta-heading-about"> 
      <div class="cta-container">
        <h2 id="cta-heading-about" class="cta-title">¿Listo para comenzar tu viaje?</h2>
        <p class="cta-text">
          Descubre cómo podemos ayudarte en cada paso del proceso migratorio.
        </p>
        <router-link to="/recursos" class="cta-button-about" aria-label="Explorar recursos para migrantes">
          Explorar recursos
        </router-link>
      </div>
    </section>
  </main>
</template>

<script>
export default {
  name: 'SobreNosotros',
};
</script>

<style scoped>
/* Asegúrate que la fuente Poppins esté cargada globalmente o impórtala si es necesario */
/* @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700;800&display=swap'); */

.about-page {
  /* Variables CSS locales para este componente */
  --about-primary-color: #2c3e50; /* Azul oscuro/grisáceo */
  --about-secondary-color: #42b983; /* Verde Migrators */
  --about-accent-color: #2495ff; /* Rojo/coral para destacar */
  --about-text-color: #34495e; /* Gris oscuro para texto principal */
  --about-light-text-color: #7f8c8d; /* Gris más claro para texto secundario */
  --about-bg-color: #ffffff; /* Blanco */
  --about-light-bg-color: #f8f9fa; /* Un gris muy claro para fondos alternos */
  --about-shadow-soft: 0 4px 12px rgba(0, 0, 0, 0.08);
  --about-shadow-medium: 0 8px 25px rgba(0, 0, 0, 0.1);
  --about-shadow-strong: 0 12px 35px rgba(0, 0, 0, 0.12);
  --about-transition-duration: 0.4s;
  --about-font-family: 'Poppins', sans-serif;

  font-family: var(--about-font-family);
  color: var(--about-text-color);
  line-height: 1.7; /* Aumentado para mejor legibilidad general */
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem; /* Padding lateral base */
}

/* Estilos generales de sección para consistencia */
.hero-container, .mission-section, .team-section, .cta-section-about {
  margin: 4rem 0; /* Espaciado vertical consistente entre secciones */
  padding: 3rem 1.5rem; /* Padding interno base para secciones */
  animation: fadeIn 0.8s ease-out forwards;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(25px); }
  to { opacity: 1; transform: translateY(0); }
}

.section-title {
  font-size: clamp(1.8rem, 4vw, 2.4rem); /* Uso de clamp para fluidez */
  font-weight: 700;
  margin-bottom: 1.5rem;
  color: var(--about-primary-color);
  position: relative;
  line-height: 1.3;
}
.section-title.text-center { /* Para asegurar que el ::after también se centre */
    display: inline-block; /* Necesario para que el ::after se posicione relativo al texto */
}
.section-title.text-center::after {
    content: '';
    display: block;
    width: 60px;
    height: 4px;
    background-color: var(--about-secondary-color);
    margin: 0.75rem auto 0; /* Centrado del subrayado */
    border-radius: 2px;
}


/* Hero Section */
.hero-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: var(--about-light-bg-color); /* Fondo sutil para el hero */
  border-radius: 20px;
  box-shadow: var(--about-shadow-medium);
  position: relative;
  overflow: hidden; /* Para el overlay y efectos */
}

.hero-content {
  max-width: 58%; /* Un poco más de espacio para el texto */
  padding-right: 2rem; /* Espacio entre texto e imagen */
  z-index: 2;
}

.hero-title {
  font-size: clamp(2rem, 5vw, 3rem); /* Más impacto para el título del hero */
  font-weight: 800; /* Más peso */
  margin-bottom: 1.5rem;
  color: var(--about-primary-color);
  line-height: 1.25;
}

.highlight {
  color: var(--about-accent-color);
  position: relative;
  display: inline-block; /* Para el ::after */
}

.highlight::after { /* Subrayado del highlight */
  content: '';
  position: absolute;
  bottom: 3px; /* Ajustar posición */
  left: 0;
  width: 100%;
  height: 6px; /* Más sutil */
  background-color: rgba(54, 132, 250, 0.25); /* Color más suave */
  z-index: -1;
  transition: height 0.3s ease, background-color 0.3s ease;
  border-radius: 2px;
}
.hero-title:hover .highlight::after {
  height: 10px;
  background-color: rgba(54, 132, 250, 0.25);
}

.hero-description {
  font-size: clamp(1rem, 2.5vw, 1.2rem);
  line-height: 1.8;
  margin-bottom: 2rem;
  color: var(--about-text-color);
}

.brand {
  color: var(--about-secondary-color);
  font-weight: 700; /* Ligeramente más peso */
}

.hero-image-wrapper { /* Contenedor de imagen */
  position: relative;
  width: 42%; /* Ajustado */
  perspective: 1200px; /* Para efectos 3D */
}

.hero-img { /* Renombrado para evitar colisión */
  width: 100%;
  max-width: 450px; /* Límite para la imagen */
  height: auto;
  border-radius: 15px;
  box-shadow: var(--about-shadow-strong);
  transition: transform var(--about-transition-duration) cubic-bezier(0.25, 0.8, 0.25, 1), 
              box-shadow var(--about-transition-duration) cubic-bezier(0.25, 0.8, 0.25, 1);
  transform-style: preserve-3d; /* Para que las transformaciones 3D se apliquen bien */
}

.hero-image-wrapper:hover .hero-img {
  transform: rotateY(7deg) rotateX(3deg) scale(1.05) translateY(-5px);
  box-shadow: 0 20px 45px rgba(0,0,0,0.2);
}

.image-overlay { /* Overlay sutil sobre la imagen del hero */
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.05) 0%, rgba(44, 62, 80, 0.05) 100%);
  border-radius: 15px;
  z-index: 1;
  pointer-events: none; /* Para que no interfiera con el hover de la imagen */
}

/* Mission Section */
.mission-section {
  /* background-color: var(--about-bg-color); Se hereda de .about-page si es el mismo */
}

.mission-container {
  display: flex;
  align-items: center;
  gap: 3rem;
  background-color: var(--about-light-bg-color); /* Fondo diferenciado para esta sección */
  border-radius: 20px;
  padding: 3rem;
  box-shadow: var(--about-shadow-medium);
}

.mission-text { flex: 1.2; /* Dar un poco más de espacio al texto */ }
.mission-image-wrapper { flex: 0.8; } /* La imagen ocupa un poco menos */

.mission-section .section-title .highlight::after {
  bottom: 2px; /* Ajuste específico si es necesario */
  background-color: rgba(var(--about-accent-color-rgb, 231, 76, 60), 0.2); /* Usando variable con fallback */
}

.mission-content {
  font-size: clamp(1rem, 2vw, 1.1rem);
  line-height: 1.8;
}
.mission-content p { margin-bottom: 1.5rem; }

.mission-list {
  margin: 1.5rem 0;
  padding-left: 0; /* Quitar padding para alinear con íconos */
  list-style: none;
}
.mission-list li {
  margin-bottom: 1rem; /* Más espacio entre ítems */
  display: flex; /* Para alinear ícono y texto */
  align-items: flex-start; /* Alinear al inicio si el texto es multilínea */
}
.icon-bullet { /* Clase para los íconos de la lista */
  color: var(--about-secondary-color);
  margin-right: 0.8rem; /* Espacio entre ícono y texto */
  font-size: 1.1em; /* Tamaño del ícono relativo al texto */
  line-height: inherit; /* Alinear con la primera línea de texto */
  margin-top: 0.15em; /* Ajuste vertical fino */
}

.mission-image-wrapper img {
  width: 100%;
  height: auto;
  display: block;
  border-radius: 15px; /* Redondeado consistente */
  box-shadow: var(--about-shadow-soft);
  transition: transform 0.5s ease, box-shadow 0.5s ease;
}
.mission-image-wrapper:hover img {
  transform: scale(1.03) rotate(-1deg); /* Efecto hover más sutil */
  box-shadow: var(--about-shadow-medium);
}

/* Team Section */
.team-section { text-align: center; }
.team-container { max-width: 700px; margin: 2rem auto 0; } /* Contenedor más estrecho para un solo miembro */

.team-member {
  display: flex;
  flex-direction: column; /* Apilado por defecto, se cambiará en desktop */
  align-items: center;
  background-color: var(--about-bg-color);
  border-radius: 20px;
  padding: 2.5rem; /* Más padding */
  box-shadow: var(--about-shadow-medium);
  gap: 1.5rem; /* Espacio entre foto e info si se apilan */
  text-align: center; /* Centrar texto cuando está apilado */
}

.member-photo {
  width: 180px; /* Ligeramente más pequeño */
  height: 180px;
  border-radius: 50%;
  overflow: hidden;
  border: 6px solid var(--about-secondary-color);
  box-shadow: 0 8px 20px rgba(0,0,0,0.12);
  flex-shrink: 0; /* Evitar que se encoja */
}
.member-photo img { width: 100%; height: 100%; object-fit: cover; }

.member-info { flex: 1; }
.member-name { /* Renombrado desde h3 para especificidad */
  font-size: clamp(1.4rem, 3vw, 1.7rem);
  color: var(--about-primary-color);
  margin-bottom: 0.25rem;
  font-weight: 700;
}
.member-position {
  color: var(--about-secondary-color);
  font-weight: 600;
  margin-bottom: 1rem;
  font-size: 1rem;
}
.member-bio { line-height: 1.7; font-size: 0.95rem; }

/* Call to Action Section */
.cta-section-about { text-align: center; } /* Renombrado para evitar colisiones */
.cta-container {
  background: linear-gradient(135deg, var(--about-secondary-color) 0%, var(--about-primary-color) 100%); /* Gradiente con colores del tema */
  border-radius: 20px;
  padding: 3.5rem 2rem; /* Más padding vertical */
  color: white;
  box-shadow: var(--about-shadow-strong);
}
.cta-title {
  color: white; /* Texto blanco sobre fondo oscuro */
  font-size: clamp(1.8rem, 4vw, 2.2rem);
  font-weight: 700;
  margin-bottom: 1rem;
}
.cta-text {
  color: rgba(255, 255, 255, 0.9); /* Blanco semi-transparente */
  font-size: clamp(1rem, 2.5vw, 1.15rem);
  margin-bottom: 2.5rem;
  max-width: 600px;
  margin-left: auto; margin-right: auto;
}

.cta-button-about { /* Renombrado */
  color: var(--about-secondary-color); /* Color del texto del botón */
  background-color: white;
  border: 2px solid white; /* Borde sutil */
  padding: 0.9rem 2.5rem; /* Botón más grande */
  font-size: clamp(1rem, 2vw, 1.1rem);
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  font-weight: 600;
  text-decoration: none; /* Para router-link */
  display: inline-block;
}
.cta-button-about:hover, .cta-button-about:focus {
  background-color: transparent; /* Transparente al pasar el mouse */
  color: white; /* Texto blanco */
  border-color: white; /* Borde blanco */
  transform: translateY(-3px) scale(1.03);
  box-shadow: 0 7px 20px rgba(0,0,0,0.2);
  outline: none;
}

/* Efectos hover generales para secciones (opcional) */
.hero-container:hover, .mission-container:hover, .team-member:hover {
  /* El efecto de elevación ya está en el hover de la imagen del hero */
  /* Podrías añadir un transform: translateY(-5px); aquí si quieres que toda la tarjeta se eleve */
}


/* Diseño responsivo */
@media (min-width: 769px) { /* Estilos para desktop primero para la sección de equipo */
    .team-member {
        flex-direction: row; /* Lado a lado en desktop */
        text-align: left; /* Alinear texto a la izquierda en desktop */
        gap: 2.5rem; /* Más espacio en desktop */
    }
    .member-info {
        text-align: left;
    }
}

@media (max-width: 992px) { /* Tablets */
  .about-page { padding: 0 0.5rem; } /* Menos padding lateral general */
  .hero-container, .mission-section, .team-section, .cta-section-about {
    margin: 3rem 0; padding: 2.5rem 1rem;
  }
  .hero-title { font-size: clamp(1.8rem, 4.5vw, 2.5rem); }
  .section-title { font-size: clamp(1.7rem, 3.5vw, 2.2rem); }
  .hero-description, .mission-content { font-size: clamp(0.95rem, 2vw, 1.05rem); }
}

@media (max-width: 768px) { /* Móviles grandes */
  .hero-container, .mission-container {
    flex-direction: column;
    text-align: center;
    padding: 2.5rem 1.5rem; /* Consistente con tablet */
  }
  .hero-content, .mission-text {
    max-width: 100%;
    padding-right: 0; /* Sin padding extra en móvil */
    order: 2; /* Texto debajo de la imagen en Hero */
  }
  .hero-image-wrapper, .mission-image-wrapper {
    max-width: 90%; /* Imagen un poco más pequeña que el contenedor */
    width: 100%;
    margin: 0 auto 2rem auto; /* Espacio debajo de la imagen, centrado */
    order: 1; /* Imagen arriba */
  }
   .mission-image-wrapper { /* Misión no necesita invertir orden */
    order: initial;
    margin-top: 2rem;
  }

  .hero-title, .section-title { font-size: clamp(1.6rem, 5vw, 2rem); }
  .team-section { padding: 2.5rem 1rem; } /* Menos padding lateral */
  .team-member { padding: 1.5rem; } /* Menos padding interno */
  .member-photo { width: 150px; height: 150px; } /* Foto más pequeña */
  .cta-section-about { padding: 2.5rem 1rem; }
  .cta-container { padding: 2.5rem 1.5rem; }
  .cta-title { font-size: clamp(1.5rem, 4.5vw, 1.8rem); }
  .cta-text { font-size: clamp(0.9rem, 2.8vw, 1.05rem); }
}

@media (max-width: 480px) { /* Móviles pequeños */
  .about-page { padding: 0; }
  .hero-container, .mission-section, .team-section, .cta-section-about {
    margin: 2rem 0; padding: 2rem 0.8rem; border-radius: 10px; /* Menos redondeo */
  }
  .hero-title { font-size: clamp(1.5rem, 6vw, 1.8rem); }
  .section-title { font-size: clamp(1.4rem, 5vw, 1.7rem); }
  .hero-description, .mission-content { font-size: clamp(0.9rem, 3vw, 1rem); }
  .cta-button-about { padding: 0.8rem 1.8rem; font-size: 0.95rem; }
  .member-photo { width: 120px; height: 120px; border-width: 4px; }
}
</style>