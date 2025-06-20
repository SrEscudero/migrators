<template>
  <section 
    id="faqs" 
    class="faq-section"
    aria-labelledby="faqs-heading"
  >
    <div class="container">
      <div class="section-header">
        <h2 id="faqs-heading" class="section-title">
          <span class="title-decoration">Preguntas Frecuentes</span>
        </h2>
        <p class="section-subtitle">Encuentra respuestas a las dudas más comunes sobre migración</p>
      </div>

      <div class="faq-container">
        <div 
          v-for="(faq, index) in faqs" 
          :key="faq.question || index" class="faq-item"
          :class="{ 'active': activeIndex === index }"
        >
          <button
            class="faq-question"
            @click="toggleFAQ(index)"
            :aria-expanded="activeIndex === index ? 'true' : 'false'"
            :aria-controls="'faq-content-' + index"
          >
            <span class="question-text">{{ faq.question }}</span>
            <span class="toggle-icon" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" class="icon-svg">
                <path d="M8 10.59L2.705 5.295C2.52 5.11 2.265 5 2 5C1.45 5 1 5.45 1 6C1 6.265 1.11 6.52 1.295 6.705L7.295 12.705C7.685 13.095 8.315 13.095 8.705 12.705L14.705 6.705C14.89 6.52 15 6.265 15 6C15 5.45 14.55 5 14 5C13.735 5 13.48 5.11 13.295 5.295L8 10.59Z" fill="currentColor"/>
              </svg>
            </span>
          </button>
          <div 
            :id="'faq-content-' + index"
            class="faq-answer"
            role="region"
            :aria-hidden="activeIndex !== index"
          >
            <div class="answer-content">
              <p>{{ faq.answer }}</p>
              <div v-if="faq.links && faq.links.length > 0" class="faq-links">
                <a 
                  v-for="(link, linkIndex) in faq.links" 
                  :key="link.url || linkIndex"
                  :href="link.url" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  class="link-button"
                >
                  {{ link.text }}
                  <i class="fas fa-external-link-alt link-icon" aria-hidden="true"></i> </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      </div>
  </section>
</template>

<script>
export default {
  name: 'FAQSection',
  data() {
    return {
      activeIndex: null, // Solo un FAQ abierto a la vez
      faqs: [
        {
          question: "¿Cómo obtengo mi CPF?",
          answer: "Para obtener tu CPF (Cadastro de Pessoas Físicas) en Brasil, puedes seguir estos pasos:\n\n1. Online: Visita el sitio web de la Receita Federal y completa el formulario en línea.\n2. Presencial: Dirígete a una agencia de la Receita Federal, Banco do Brasil, Caixa Econômica Federal o Correios con tus documentos de identidad.",
          links: [
            { text: "Sitio oficial Receita Federal", url: "https://www.gov.br/receitafederal" },
            { text: "Guía paso a paso (ejemplo)", url: "#" }
          ]
        },
        {
          question: "¿Cuánto tiempo toma procesar mi RNE?",
          answer: "El tiempo para procesar el Registro Nacional de Migrantes (RNM, anteriormente RNE) puede variar, pero generalmente toma entre 6 a 12 meses. Es crucial verificar el estado en el sistema de la Policía Federal.\n\nRecomendaciones:\n- Verifica el estado de tu solicitud regularmente en el sitio de la PF.\n- Asegúrate de que todos los documentos presentados sean correctos y estén actualizados.\n- Mantén tus datos de contacto (teléfono, email, dirección) actualizados con la Policía Federal.",
          links: [
            { text: "Consultar estado RNM (ejemplo)", url: "#" }
          ]
        },
        {
          question: "¿Puedo trabajar mientras espero mis documentos?",
          answer: "Sí, en muchos casos puedes trabajar con el \"protocolo\" (comprobante de solicitud) de tu RNM o solicitud de refugio, pero esto depende del tipo de visa o solicitud y de la legislación vigente. \n\nEs fundamental consultar con la Policía Federal o un asesor legal migratorio para confirmar tu situación específica y los derechos laborales asociados a tu estatus actual.",
          links: [
            { text: "Tipos de visa Brasil (ejemplo)", url: "#" },
          ]
        },
        {
          question: "¿Cómo validar mi título universitario en Brasil?",
          answer: "El proceso de validación (revalidação o reconhecimento) de títulos extranjeros en Brasil se realiza a través de universidades públicas o privadas brasileñas que ofrezcan cursos similares y estén autorizadas. Los pasos generales incluyen:\n\n1. Traducción jurada al portugués de todos los documentos académicos.\n2. Legalización o apostilla de los documentos (según el Convenio de La Haya).\n3. Presentación de la solicitud y documentos en la plataforma Carolina Bori o directamente en la universidad elegida.\n4. Pago de tasas.\n5. Análisis documental y curricular por la universidad.\n\nEl proceso puede ser largo y los requisitos exactos pueden variar entre universidades."
        }
        // Añade más FAQs aquí
      ]
    };
  },
  methods: {
    toggleFAQ(index) {
      if (this.activeIndex === index) {
        this.activeIndex = null; // Cierra el actual si se hace clic de nuevo
      } else {
        this.activeIndex = index; // Abre el nuevo y cierra el anterior implícitamente
      }
    },
    // scrollToContact() { // Si tuvieras un botón de contacto aquí
    //   this.$emit('scroll-to-contact'); // Emitir al padre
    // }
  }
};
</script>

<style scoped>
/* Asegúrate de que la fuente Poppins esté cargada globalmente o impórtala aquí si es necesario */
/* @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap'); */

.faq-section {
  /* Variables CSS locales para este componente */
  --faq-primary-color: #2c3e50; /* Un azul oscuro para títulos y elementos primarios */
  --faq-secondary-color: #3498db; /* Un azul más brillante para acentos y enlaces */
  --faq-accent-color: #42b983; /* Un verde para toques de acento, como el subrayado del título */
  --faq-background-color: #f4f7f6; /* Un fondo muy claro, casi blanco pero más suave */
  --faq-card-background-color: #ffffff; /* Fondo de las tarjetas FAQ */
  --faq-text-color: #34495e; /* Color principal para texto de párrafos */
  --faq-light-text-color: #7f8c8d; /* Para subtítulos o texto menos importante */
  --faq-border-color: #e0e6ed; /* Un color de borde suave */
  --faq-shadow: 0 5px 15px rgba(0, 0, 0, 0.08); /* Sombra suave para tarjetas */
  --faq-strong-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  --faq-transition-duration: 0.35s; /* Duración de transición unificada */
  --faq-font-family: 'Poppins', sans-serif; /* Fuente principal */

  padding: 4rem 0;
  background-color: var(--faq-background-color);
  font-family: var(--faq-font-family);
  color: var(--faq-text-color);
}

.container {
  max-width: 850px; /* Un poco más de ancho para el contenido */
  margin: 0 auto;
  padding: 0 1.5rem;
}

.section-header {
  text-align: center;
  margin-bottom: 3rem; /* Más espacio antes de los FAQs */
}

.section-title {
  font-size: clamp(2rem, 4vw, 2.6rem); /* Ligeramente más grande */
  font-weight: 700;
  color: var(--faq-primary-color);
  margin-bottom: 0.75rem;
  position: relative;
  display: inline-block; /* Para que el after se ajuste al texto */
}

.title-decoration { /* El span ya está, no se necesita clase extra si el ::after va en .section-title */
  position: relative;
}

.section-title::after { /* Aplicado directamente al título para simplificar */
  content: '';
  position: absolute;
  bottom: -8px; /* Un poco más abajo */
  left: 50%;
  transform: translateX(-50%); /* Centrado perfecto */
  width: 70px; /* Ancho fijo o porcentual */
  height: 4px;
  background-color: var(--faq-accent-color);
  border-radius: 2px; /* Bordes redondeados */
  z-index: 0; /* Detrás del texto si el texto tuviera fondo */
}

.section-subtitle {
  color: var(--faq-light-text-color);
  font-size: clamp(1rem, 2vw, 1.15rem);
  max-width: 650px; /* Ligeramente más ancho */
  margin: 0 auto; /* Centrado */
  line-height: 1.6;
}

/* Items FAQ */
.faq-container {
  display: flex;
  flex-direction: column;
  gap: 1.25rem; /* Un poco más de espacio entre items */
}

.faq-item {
  background-color: var(--faq-card-background-color);
  border-radius: 10px; /* Bordes un poco más grandes */
  box-shadow: var(--faq-shadow);
  border: 1px solid var(--faq-border-color); /* Borde sutil */
  overflow: hidden; /* Mantenido para la animación de max-height */
  transition: box-shadow var(--faq-transition-duration) ease-in-out;
}

.faq-item:hover {
  box-shadow: var(--faq-strong-shadow);
  border-color: var(--faq-secondary-color); /* Cambio de color de borde en hover */
}

.faq-item.active {
  border-color: var(--faq-secondary-color);
}


.faq-question {
  width: 100%;
  padding: 1.5rem; /* Padding consistente */
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: transparent; /* Hereda de .faq-item */
  border: none;
  text-align: left;
  cursor: pointer;
  transition: background-color var(--faq-transition-duration) ease;
}

.faq-item.active .faq-question {
  background-color: rgba(var(--faq-secondary-color), 0.05); /* Fondo muy sutil para el activo */
  /* border-bottom: 1px solid var(--faq-border-color); */ /* Opcional: separador */
}


.faq-question:hover, .faq-question:focus {
  background-color: rgba(0,0,0,0.03); /* Ligero hover/focus */
  outline: none;
}

.question-text {
  font-weight: 600;
  color: var(--faq-primary-color);
  font-size: clamp(1.05rem, 2.5vw, 1.15rem);
  flex: 1;
  padding-right: 1rem; /* Espacio para el ícono */
}

.toggle-icon {
  transition: transform var(--faq-transition-duration) ease-in-out;
  color: var(--faq-secondary-color); /* Usar color secundario para el ícono */
  flex-shrink: 0; /* Evitar que el ícono se encoja */
}
.toggle-icon .icon-svg {
    width: 20px; /* Tamaño del SVG */
    height: 20px;
}

.faq-item.active .toggle-icon {
  transform: rotate(180deg);
}

.faq-answer {
  max-height: 0;
  overflow: hidden;
  transition: max-height var(--faq-transition-duration) ease-in-out, 
              padding var(--faq-transition-duration) ease-in-out; /* Animar padding también */
  padding: 0 1.5rem; /* Padding horizontal inicial para que no salte el texto */
  background-color: var(--faq-card-background-color); /* Para que no sea transparente durante la animación */
}

.faq-item.active .faq-answer {
  max-height: 600px; /* Aumentado por si hay respuestas largas */
  padding: 0.5rem 1.5rem 1.5rem 1.5rem; /* Padding cuando está abierto */
}

.answer-content p {
  color: var(--faq-text-color);
  line-height: 1.7; /* Mejor legibilidad */
  white-space: pre-line;
  margin-bottom: 1.25rem;
  font-size: clamp(0.9rem, 2vw, 1rem);
}
.answer-content p:last-child {
  margin-bottom: 0;
}

.faq-links {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem; /* Espacio entre botones de enlace */
  margin-top: 1.25rem;
}

.link-button {
  display: inline-flex; /* Para alinear ícono y texto */
  align-items: center;
  padding: 0.6rem 1.2rem;
  background-color: var(--faq-accent-color);
  color: var(--faq-card-background-color); /* Texto blanco o muy claro para contraste */
  border-radius: 6px;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  transition: background-color var(--faq-transition-duration) ease, transform var(--faq-transition-duration) ease;
}
.link-button .link-icon {
    margin-left: 0.5em;
    font-size: 0.8em;
}

.link-button:hover, .link-button:focus {
  background-color: darken(var(--faq-accent-color), 10%); /* Oscurecer un poco el color de acento */
  color: var(--faq-card-background-color);
  transform: translateY(-2px);
  outline: none;
}

/* Footer de la sección (si decides usarlo) */
/*
.faq-section-footer {
  text-align: center;
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid var(--faq-border-color);
}
.faq-section-footer p {
  color: var(--faq-text-color);
  margin-bottom: 1rem;
}
.contact-button-inline {
  padding: 0.75rem 1.5rem;
  background-color: var(--faq-secondary-color);
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color var(--faq-transition-duration) ease, transform var(--faq-transition-duration) ease;
  text-decoration: none;
}
.contact-button-inline:hover, .contact-button-inline:focus {
  background-color: darken(var(--faq-secondary-color), 10%);
  transform: translateY(-2px);
  outline: none;
}
*/

/* Responsive */
@media (max-width: 768px) {
  .faq-section {
    padding: 3rem 0; /* Reducido padding general */
  }
  .container {
    padding: 0 1rem; /* Menos padding lateral en el contenedor */
  }
  .section-header {
    margin-bottom: 2rem;
  }
  .section-title {
    font-size: clamp(1.6rem, 5vw, 2rem); /* Ajustado */
  }
  .section-subtitle {
    font-size: clamp(0.95rem, 2.5vw, 1.05rem); /* Ajustado */
  }
  .faq-container {
    gap: 1rem;
  }
  .faq-question {
    padding: 1.25rem; /* Un poco menos de padding */
  }
  .question-text {
    font-size: clamp(1rem, 3vw, 1.1rem);
  }
  .faq-item.active .faq-answer {
    padding: 0.5rem 1.25rem 1.25rem 1.25rem;
  }
  .answer-content p {
      font-size: clamp(0.85rem, 2.5vw, 0.95rem);
  }
  .link-button {
    padding: 0.5rem 1rem;
    font-size: 0.85rem;
  }
}

/* Accesibilidad - Preferencia de movimiento reducido */
@media (prefers-reduced-motion: reduce) {
  .faq-item,
  .faq-question,
  .toggle-icon,
  .faq-answer,
  .link-button,
  /* .contact-button-inline, */ /* Si se usa el footer */
  .title-decoration::after {
    transition-duration: 0.001s !important; /* Prácticamente sin transición */
    animation: none !important; /* Sin animaciones de keyframes */
  }
  
  .faq-item.active .faq-answer {
    max-height: none; /* Mostrar contenido directamente */
    overflow: visible; /* Asegurar visibilidad */
    padding-bottom: 1.5rem; /* Asegurar padding inferior */
  }
  
  .link-button:hover, .link-button:focus,
  /* .contact-button-inline:hover, .contact-button-inline:focus, */ /* Si se usa */
  .faq-item:hover {
    transform: none; /* Sin transformaciones en hover/focus */
  }
}
</style>