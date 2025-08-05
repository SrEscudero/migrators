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
.about-page {
  /* Eliminamos todas las variables locales --about-* */
  font-family: var(--font-family-base);
  color: var(--color-text);
  line-height: 1.7;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

/* Estilos generales de sección para consistencia */
.hero-container, .mission-section, .team-section, .cta-section-about {
  margin: 4rem 0;
  padding: 3rem 1.5rem;
  animation: fadeIn 0.8s ease-out forwards;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(25px); }
  to { opacity: 1; transform: translateY(0); }
}

.section-title {
  font-size: clamp(1.8rem, 4vw, 2.4rem);
  font-weight: var(--font-weight-bold);
  margin-bottom: 1.5rem;
  color: var(--color-primary);
  position: relative;
  line-height: 1.3;
}

.section-title.text-center {
    display: inline-block;
}
.section-title.text-center::after {
    content: '';
    display: block;
    width: 60px;
    height: 4px;
    background-color: var(--color-secondary);
    margin: 0.75rem auto 0;
    border-radius: 2px;
}


/* Hero Section */
.hero-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: var(--color-background);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-medium);
  position: relative;
  overflow: hidden;
}

.hero-content {
  max-width: 58%;
  padding-right: 2rem;
  z-index: 2;
}

.hero-title {
  font-size: clamp(2rem, 5vw, 3rem);
  font-weight: 800;
  margin-bottom: 1.5rem;
  color: var(--color-primary);
  line-height: 1.25;
}

.highlight {
  color: var(--color-accent);
  position: relative;
  display: inline-block;
}

.highlight::after {
  content: '';
  position: absolute;
  bottom: 3px;
  left: 0;
  width: 100%;
  height: 6px;
  background-color: rgba(51, 200, 245, 0.25);
  z-index: -1;
  transition: height 0.3s ease, background-color 0.3s ease;
  border-radius: 2px;
}
.hero-title:hover .highlight::after {
  height: 10px;
  background-color: rgba(51, 200, 245, 0.3);
}

.hero-description {
  font-size: clamp(1rem, 2.5vw, 1.2rem);
  line-height: 1.8;
  margin-bottom: 2rem;
  color: var(--color-text);
}

.brand {
  color: var(--color-secondary);
  font-weight: var(--font-weight-bold);
}

.hero-image-wrapper {
  position: relative;
  width: 42%;
  perspective: 1200px;
}

.hero-img {
  width: 100%;
  max-width: 450px;
  height: auto;
  border-radius: 15px;
  box-shadow: 0 12px 35px rgba(0,0,0,0.12);
  transition: transform var(--transition-speed) cubic-bezier(0.25, 0.8, 0.25, 1),
              box-shadow var(--transition-speed) cubic-bezier(0.25, 0.8, 0.25, 1);
  transform-style: preserve-3d;
}

.hero-image-wrapper:hover .hero-img {
  transform: rotateY(7deg) rotateX(3deg) scale(1.05) translateY(-5px);
  box-shadow: 0 20px 45px rgba(0,0,0,0.2);
}

.image-overlay {
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  background: linear-gradient(135deg, rgba(66, 185, 131, 0.05) 0%, rgba(44, 62, 80, 0.05) 100%);
  border-radius: 15px;
  z-index: 1;
  pointer-events: none;
}

/* Mission Section */
.mission-container {
  display: flex;
  align-items: center;
  gap: 3rem;
  background-color: var(--color-background);
  border-radius: var(--border-radius-lg);
  padding: 3rem;
  box-shadow: var(--shadow-medium);
}

.mission-text { flex: 1.2; }
.mission-image-wrapper { flex: 0.8; }

.mission-content {
  font-size: clamp(1rem, 2vw, 1.1rem);
  line-height: 1.8;
}
.mission-content p { margin-bottom: 1.5rem; }

.mission-list {
  margin: 1.5rem 0;
  padding-left: 0;
  list-style: none;
}
.mission-list li {
  margin-bottom: 1rem;
  display: flex;
  align-items: flex-start;
}
.icon-bullet {
  color: var(--color-secondary);
  margin-right: 0.8rem;
  font-size: 1.1em;
  line-height: inherit;
  margin-top: 0.15em;
}

.mission-image-wrapper img {
  width: 100%;
  height: auto;
  display: block;
  border-radius: 15px;
  box-shadow: var(--shadow-soft);
  transition: transform 0.5s ease, box-shadow 0.5s ease;
}
.mission-image-wrapper:hover img {
  transform: scale(1.03) rotate(-1deg);
  box-shadow: var(--shadow-medium);
}

/* Team Section */
.team-section { text-align: center; }
.team-container { max-width: 700px; margin: 2rem auto 0; }

.team-member {
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: var(--color-surface);
  border-radius: var(--border-radius-lg);
  padding: 2.5rem;
  box-shadow: var(--shadow-medium);
  gap: 1.5rem;
  text-align: center;
}

.member-photo {
  width: 180px;
  height: 180px;
  border-radius: 50%;
  overflow: hidden;
  border: 6px solid var(--color-secondary);
  box-shadow: 0 8px 20px rgba(0,0,0,0.12);
  flex-shrink: 0;
}
.member-photo img { width: 100%; height: 100%; object-fit: cover; }

.member-info { flex: 1; }
.member-name {
  font-size: clamp(1.4rem, 3vw, 1.7rem);
  color: var(--color-primary);
  margin-bottom: 0.25rem;
  font-weight: var(--font-weight-bold);
}
.member-position {
  color: var(--color-secondary);
  font-weight: 600;
  margin-bottom: 1rem;
  font-size: 1rem;
}
.member-bio { line-height: 1.7; font-size: 0.95rem; }

/* Call to Action Section */
.cta-section-about { text-align: center; }
.cta-container {
  background: linear-gradient(135deg, var(--color-secondary) 0%, var(--color-primary) 100%);
  border-radius: var(--border-radius-lg);
  padding: 3.5rem 2rem;
  color: white;
  box-shadow: 0 12px 35px rgba(0,0,0,0.12);
}
.cta-title {
  color: white;
  font-size: clamp(1.8rem, 4vw, 2.2rem);
  font-weight: var(--font-weight-bold);
  margin-bottom: 1rem;
}
.cta-text {
  color: rgba(255, 255, 255, 0.9);
  font-size: clamp(1rem, 2.5vw, 1.15rem);
  margin-bottom: 2.5rem;
  max-width: 600px;
  margin-left: auto; margin-right: auto;
}

.cta-button-about {
  color: var(--color-secondary);
  background-color: white;
  border: 2px solid white;
  padding: 0.9rem 2.5rem;
  font-size: clamp(1rem, 2vw, 1.1rem);
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  font-weight: 600;
  text-decoration: none;
  display: inline-block;
}
.cta-button-about:hover, .cta-button-about:focus {
  background-color: transparent;
  color: white;
  border-color: white;
  transform: translateY(-3px) scale(1.03);
  box-shadow: 0 7px 20px rgba(0,0,0,0.2);
  outline: none;
}

/* Diseño responsivo */
@media (min-width: 769px) {
    .team-member {
        flex-direction: row;
        text-align: left;
        gap: 2.5rem;
    }
    .member-info {
        text-align: left;
    }
}

@media (max-width: 992px) {
  .about-page { padding: 0 0.5rem; }
  .hero-container, .mission-section, .team-section, .cta-section-about {
    margin: 3rem 0; padding: 2.5rem 1rem;
  }
  .hero-title { font-size: clamp(1.8rem, 4.5vw, 2.5rem); }
  .section-title { font-size: clamp(1.7rem, 3.5vw, 2.2rem); }
  .hero-description, .mission-content { font-size: clamp(0.95rem, 2vw, 1.05rem); }
}

@media (max-width: 768px) {
  .hero-container, .mission-container {
    flex-direction: column;
    text-align: center;
    padding: 2.5rem 1.5rem;
  }
  .hero-content, .mission-text {
    max-width: 100%;
    padding-right: 0;
    order: 2;
  }
  .hero-image-wrapper, .mission-image-wrapper {
    max-width: 90%;
    width: 100%;
    margin: 0 auto 2rem auto;
    order: 1;
  }
   .mission-image-wrapper {
    order: initial;
    margin-top: 2rem;
  }

  .hero-title, .section-title { font-size: clamp(1.6rem, 5vw, 2rem); }
  .team-section { padding: 2.5rem 1rem; }
  .team-member { padding: 1.5rem; }
  .member-photo { width: 150px; height: 150px; }
  .cta-section-about { padding: 2.5rem 1rem; }
  .cta-container { padding: 2.5rem 1.5rem; }
  .cta-title { font-size: clamp(1.5rem, 4.5vw, 1.8rem); }
  .cta-text { font-size: clamp(0.9rem, 2.8vw, 1.05rem); }
}

@media (max-width: 480px) {
  .about-page { padding: 0; }
  .hero-container, .mission-section, .team-section, .cta-section-about {
    margin: 2rem 0; padding: 2rem 0.8rem; border-radius: 10px;
  }
  .hero-title { font-size: clamp(1.5rem, 6vw, 1.8rem); }
  .section-title { font-size: clamp(1.4rem, 5vw, 1.7rem); }
  .hero-description, .mission-content { font-size: clamp(0.9rem, 3vw, 1rem); }
  .cta-button-about { padding: 0.8rem 1.8rem; font-size: 0.95rem; }
  .member-photo { width: 120px; height: 120px; border-width: 4px; }
}
</style>