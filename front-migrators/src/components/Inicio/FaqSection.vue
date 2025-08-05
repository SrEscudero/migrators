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
.faq-section {
  /* Eliminamos las variables locales --faq-* */
  --faq-transition-duration: 0.35s; /* Mantenemos esta para una transición específica si se desea */
  padding: 4rem 0;
  font-family: var(--font-family-base);
  color: var(--color-text);
  background-color: var(--color-background); /* Fondo estandarizado */
}

.container {
  max-width: 850px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.section-header {
  text-align: center;
  margin-bottom: 3rem;
}

.section-title {
  font-size: clamp(2rem, 4vw, 2.6rem);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
  margin-bottom: 0.75rem;
  position: relative;
  display: inline-block;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  width: 70px;
  height: 4px;
  background-color: var(--color-accent);
  border-radius: 2px;
}

.section-subtitle {
  color: var(--color-text-muted);
  font-size: clamp(1rem, 2vw, 1.15rem);
  max-width: 650px;
  margin: 0 auto;
  line-height: 1.6;
}

.faq-container {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.faq-item {
  background-color: var(--color-surface);
  border-radius: 10px;
  box-shadow: var(--shadow-soft);
  border: 1px solid var(--color-border);
  overflow: hidden;
  transition: box-shadow var(--faq-transition-duration) ease-in-out;
}

.faq-item:hover {
  box-shadow: var(--shadow-medium);
  border-color: var(--color-primary-light);
}

.faq-item.active {
  border-color: var(--color-primary-light);
}

.faq-question {
  width: 100%;
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: transparent;
  border: none;
  text-align: left;
  cursor: pointer;
  transition: background-color var(--faq-transition-duration) ease;
}

.faq-item.active .faq-question {
  background-color: rgba(69, 123, 157, 0.05); /* Usando color-primary-light con opacidad */
}

.faq-question:hover, .faq-question:focus {
  background-color: rgba(0,0,0,0.03);
  outline: none;
}

.question-text {
  font-weight: 600;
  color: var(--color-primary);
  font-size: clamp(1.05rem, 2.5vw, 1.15rem);
  flex: 1;
  padding-right: 1rem;
}

.toggle-icon {
  transition: transform var(--faq-transition-duration) ease-in-out;
  color: var(--color-primary-light);
  flex-shrink: 0;
}
.toggle-icon .icon-svg {
    width: 20px;
    height: 20px;
}

.faq-item.active .toggle-icon {
  transform: rotate(180deg);
}

.faq-answer {
  max-height: 0;
  overflow: hidden;
  transition: max-height var(--faq-transition-duration) ease-in-out,
              padding var(--faq-transition-duration) ease-in-out;
  padding: 0 1.5rem;
  background-color: var(--color-surface);
}

.faq-item.active .faq-answer {
  max-height: 600px;
  padding: 0.5rem 1.5rem 1.5rem 1.5rem;
}

.answer-content p {
  color: var(--color-text);
  line-height: 1.7;
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
  gap: 0.75rem;
  margin-top: 1.25rem;
}

.link-button {
  display: inline-flex;
  align-items: center;
  padding: 0.6rem 1.2rem;
  background-color: var(--color-secondary);
  color: var(--color-surface);
  border-radius: 6px;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: var(--font-weight-medium);
  transition: background-color var(--faq-transition-duration) ease, transform var(--faq-transition-duration) ease;
}
.link-button .link-icon {
    margin-left: 0.5em;
    font-size: 0.8em;
}

.link-button:hover, .link-button:focus {
  background-color: #369669; /* Un verde secundario ligeramente más oscuro */
  color: var(--color-surface);
  transform: translateY(-2px);
  outline: none;
}

/* Responsive */
@media (max-width: 768px) {
  .faq-section {
    padding: 3rem 0;
  }
  .container {
    padding: 0 1rem;
  }
  .section-header {
    margin-bottom: 2rem;
  }
  .section-title {
    font-size: clamp(1.6rem, 5vw, 2rem);
  }
  .section-subtitle {
    font-size: clamp(0.95rem, 2.5vw, 1.05rem);
  }
  .faq-container {
    gap: 1rem;
  }
  .faq-question {
    padding: 1.25rem;
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
</style>