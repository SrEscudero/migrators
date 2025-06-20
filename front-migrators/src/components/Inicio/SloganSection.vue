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
/* Variables CSS definidas en el contenedor principal del componente */
.slogan-container {
  --primary-color: #1a202c;
  --secondary-color: #2f855a;
  --accent-color: #33c8f5;
  --text-color: #4a5568;
  --light-text: #718096;
  --bg-color: #ffffff;
  --shadow-color: rgba(0, 0, 0, 0.1);
  --transition-duration: 0.3s; /* Renombrado de --transition-time y estandarizado a 0.3s */
  --font-family: 'Poppins', sans-serif; /* Asegúrate que Poppins esté cargada globalmente */

  font-family: var(--font-family);
  border-radius: 25px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 3rem;
  background-color: var(--bg-color);
  overflow: hidden;
  position: relative;
  margin: 2rem auto;
  max-width: 1200px;
  animation: fadeInUp 0.8s ease-out forwards;
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15);
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
  font-weight: 700;
  margin-bottom: 1.5rem;
  color: var(--primary-color);
  line-height: 1.3;
  letter-spacing: -0.02em;
}

.slogan-highlight {
  color: var(--accent-color);
  position: relative;
  display: inline-block;
  transition: transform var(--transition-duration) ease, color var(--transition-duration) ease;
}

.slogan-highlight::after {
  content: '';
  position: absolute;
  bottom: 5px;
  left: 0;
  width: 100%;
  height: 8px;
  background-color: rgba(63, 193, 216, 0.3); /* Color celeste/turquesa suave */
  z-index: -1;
  transition: height var(--transition-duration) ease;
}

.slogan:hover .slogan-highlight::after {
  height: 12px;
}

.slogan-description {
  font-size: clamp(1rem, 2vw, 1.2rem);
  line-height: 1.8;
  color: var(--text-color);
  margin-bottom: 2rem;
  letter-spacing: 0.01em;
}

.brand-name {
  color: var(--secondary-color);
  font-weight: 800; /* Un poco más de peso para destacar */
}

/* Estilos para la imagen */
.slogan-image {
  position: relative;
  width: 40%;
  perspective: 1000px; /* Útil si añades transformaciones 3D a la imagen */
}

.slogan-image img {
  width: 100%;
  max-width: 400px; /* Limita el tamaño máximo de la imagen si es necesario */
  height: auto; /* Mantiene la proporción */
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  /* transform-style: preserve-3d; */ /* Solo necesario si el img tiene hijos 3D, no para el img mismo */
  transition: transform var(--transition-duration) ease, box-shadow var(--transition-duration) ease;
}

/* Ejemplo de efecto 3D sutil en la imagen al pasar el cursor (opcional) */
/*
.slogan-image img:hover {
  transform: rotateY(5deg) rotateX(2deg) scale(1.05);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.25);
}
*/

/* Botón CTA */
.cta-button {
  background-color: rgba(66, 185, 131, 0.6); /* Un verde de Bootstrap con transparencia */
  color: rgba(0, 91, 52, 0.856); /* Texto más oscuro para contraste */
  border: none;
  padding: clamp(0.7rem, 1vw, 1rem) clamp(1.5rem, 2vw, 2.5rem);
  font-size: clamp(0.9rem, 1.2vw, 1.1rem);
  border-radius: 50px; /* Botón píldora */
  cursor: pointer;
  transition: all var(--transition-duration) ease;
  box-shadow: 0 4px 6px var(--shadow-color);
  font-weight: 600;
  text-decoration: none; /* Si usas <a> */
  display: inline-block; /* Si usas <a> */
}

.cta-button:hover, .cta-button:focus { /* Combinado hover y focus para consistencia */
  background-color: var(--secondary-color); /* Usando la variable --secondary-color */
  color: var(--bg-color); /* Texto blanco para contraste */
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

.cta-button:active {
  transform: translateY(0);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

/* Quitado :focus separado si el :hover ya lo cubre, a menos que necesites estilos de focus muy específicos
.cta-button:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(47, 136, 96, 0.6), 0 0 8px rgba(0, 0, 0, 0.2);
}
*/

/* Diseño responsivo */
@media (max-width: 992px) { /* Tablets y pantallas medianas */
  .slogan {
    font-size: clamp(1.5rem, 2.5vw, 2rem);
  }
  .slogan-description {
    font-size: clamp(0.9rem, 1.5vw, 1.1rem);
  }
}

@media (max-width: 768px) { /* Móviles grandes y tablets en vertical */
  .slogan-container {
    flex-direction: column-reverse; /* Imagen arriba, texto abajo */
    text-align: center;
    padding: 2rem 1.5rem;
  }

  .slogan-text, .slogan-image {
    max-width: 100%;
    width: 100%;
  }

  .slogan-image {
    /* margin-top: 2rem; */ /* Eliminado porque column-reverse ya la pone arriba */
    margin-bottom: 2rem; /* Añadido espacio debajo de la imagen */
    max-width: 80%; /* Hacer la imagen un poco más pequeña que el contenedor */
    margin-left: auto;
    margin-right: auto;
  }
  
  .slogan-image img {
    max-width: 100%; /* La imagen se ajusta a su contenedor .slogan-image */
  }

  .slogan {
    /* margin-top: 2rem; */ /* Eliminado, el espaciado lo da el margin-bottom de la imagen */
    font-size: clamp(1.4rem, 4vw, 1.8rem); /* Ajustado clamp para mejor lectura en móviles */
  }

  .slogan-description {
    font-size: clamp(0.9rem, 2.5vw, 1rem); /* Ajustado clamp */
  }
}

@media (max-width: 480px) { /* Móviles pequeños */
  .slogan-container {
    padding: 1.5rem 1rem;
  }
  .slogan {
    font-size: clamp(1.2rem, 5vw, 1.6rem); /* Ajustado clamp */
  }
  .slogan-description {
    font-size: clamp(0.85rem, 3vw, 0.95rem); /* Ajustado clamp */
  }
  .cta-button {
    padding: clamp(0.6rem, 2vw, 0.8rem) clamp(1.2rem, 4vw, 1.5rem);
    font-size: clamp(0.85rem, 2.5vw, 1rem); /* Ajustado clamp */
    width: 100%; /* Botón ocupa todo el ancho en móviles muy pequeños */
    max-width: 300px; /* Pero con un máximo para no ser excesivo */
    margin-left: auto;
    margin-right: auto;
  }
}
</style>