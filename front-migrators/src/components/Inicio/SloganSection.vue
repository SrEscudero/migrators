<template>
  <section class="slogan-container" aria-labelledby="slogan-heading">
    <div class="slogan-text">
      <h1 id="slogan-heading" class="slogan" tabindex="0">
        <span class="slogan-highlight">Caminemos juntos</span> hacia un nuevo comienzo, con confianza y esperanza.
      </h1>
      <p class="slogan-description">
        <strong class="brand-name">Migrators</strong> es una plataforma dedicada a ofrecer orientación e información esencial a los
        migrantes venezolanos que llegan a Brasil. Nuestro objetivo es facilitar los procesos de
        documentación, integración y adaptación, asegurando que cada paso sea claro y accesible.
      </p>
      <router-link to="/conoce-mas" class="cta-button" aria-label="Más información sobre nuestros servicios">
        Conoce más
      </router-link>
      </div>

    <div class="slogan-image">
      <img
        src="../../assets/midia/images/bandera-brasil.jpg"
        alt="Bandera de Brasil ondeando en el viento representando la acogida a migrantes"
        class="sombra-3d" loading="lazy"
      />
    </div>
  </section>
</template>

<script>
export default {
  name: "SloganSection",
  // methods: { // Ejemplo si el botón dispara un método
  //   handleConoceMasClick() {
  //     console.log("Botón 'Conoce más' clickeado");
  //     // Aquí tu lógica, por ejemplo, navegar o mostrar un modal
  //   }
  // }
};
</script>

<style scoped>
.slogan-container {
  /* Ya no se definen variables locales, se usan las globales de App.vue */
  font-family: var(--font-family-base);
  border-radius: var(--border-radius-lg);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 3rem;
  background-color: var(--color-surface);
  overflow: hidden;
  position: relative;
  margin: 2rem auto;
  max-width: 1200px;
  animation: fadeInUp 0.8s ease-out forwards;
  box-shadow: var(--shadow-medium);
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.slogan-text {
  max-width: 55%;
  position: relative;
  z-index: 2;
}

.slogan {
  font-size: clamp(1.8rem, 3vw, 2.5rem);
  font-weight: var(--font-weight-bold);
  margin-bottom: 1.5rem;
  color: var(--color-primary); /* Variable global */
  line-height: 1.3;
  letter-spacing: -0.02em;
}

.slogan-highlight {
  color: var(--color-accent); /* Variable global */
  position: relative;
  display: inline-block;
  transition: transform var(--transition-speed) ease, color var(--transition-speed) ease;
}

.slogan-highlight::after {
  content: '';
  position: absolute;
  bottom: 5px;
  left: 0;
  width: 100%;
  height: 8px;
  background-color: rgba(51, 200, 245, 0.25); /* Color de acento con opacidad */
  z-index: -1;
  transition: height var(--transition-speed) ease;
}

.slogan:hover .slogan-highlight::after {
  height: 12px;
}

.slogan-description {
  font-size: clamp(1rem, 2vw, 1.2rem);
  line-height: 1.8;
  color: var(--color-text); /* Variable global */
  margin-bottom: 2rem;
  letter-spacing: 0.01em;
}

.brand-name {
  color: var(--color-secondary); /* Variable global */
  font-weight: 800;
}

.slogan-image {
  position: relative;
  width: 40%;
  perspective: 1000px;
}

.slogan-image img {
  width: 100%;
  max-width: 400px;
  height: auto;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  transition: transform var(--transition-speed) ease, box-shadow var(--transition-speed) ease;
}

.cta-button {
  background-color: var(--color-secondary); /* Variable global */
  color: var(--color-surface); /* Variable global */
  border: none;
  padding: clamp(0.7rem, 1vw, 1rem) clamp(1.5rem, 2vw, 2.5rem);
  font-size: clamp(0.9rem, 1.2vw, 1.1rem);
  border-radius: 50px;
  cursor: pointer;
  transition: all var(--transition-speed) ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  font-weight: var(--font-weight-medium);
  text-decoration: none;
  display: inline-block;
}

.cta-button:hover, .cta-button:focus {
  background-color: var(--color-primary); /* Variable global */
  color: var(--color-surface); /* Variable global */
  transform: translateY(-4px);
  box-shadow: var(--shadow-medium);
}

.cta-button:active {
  transform: translateY(0);
  box-shadow: var(--shadow-soft);
}

/* Diseño responsivo */
@media (max-width: 992px) {
  .slogan {
    font-size: clamp(1.5rem, 2.5vw, 2rem);
  }
  .slogan-description {
    font-size: clamp(0.9rem, 1.5vw, 1.1rem);
  }
}

@media (max-width: 768px) {
  .slogan-container {
    flex-direction: column-reverse;
    text-align: center;
    padding: 2rem 1.5rem;
  }
  .slogan-text, .slogan-image {
    max-width: 100%;
    width: 100%;
  }
  .slogan-image {
    margin-bottom: 2rem;
    max-width: 80%;
    margin-left: auto;
    margin-right: auto;
  }
  .slogan-image img {
    max-width: 100%;
  }
  .slogan {
    font-size: clamp(1.4rem, 4vw, 1.8rem);
  }
  .slogan-description {
    font-size: clamp(0.9rem, 2.5vw, 1rem);
  }
}

@media (max-width: 480px) {
  .slogan-container {
    padding: 1.5rem 1rem;
  }
  .slogan {
    font-size: clamp(1.2rem, 5vw, 1.6rem);
  }
  .slogan-description {
    font-size: clamp(0.85rem, 3vw, 0.95rem);
  }
  .cta-button {
    padding: clamp(0.6rem, 2vw, 0.8rem) clamp(1.2rem, 4vw, 1.5rem);
    font-size: clamp(0.85rem, 2.5vw, 1rem);
    width: 100%;
    max-width: 300px;
    margin-left: auto;
    margin-right: auto;
  }
}
</style>