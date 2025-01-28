// Selección de elementos del carrusel
const items = document.querySelectorAll('.carousel-item');

// Función para activar el ítem actual y desactivar los demás
const activateItem = (item) => {
  items.forEach((el) => {
    el.classList.remove('active');
    el.setAttribute('aria-pressed', 'false');
  });
  item.classList.add('active');
  item.setAttribute('aria-pressed', 'true');
};

// Asegurar que todos los ítems estén cerrados al cargar la página
document.addEventListener('DOMContentLoaded', () => {
  items.forEach((item) => {
    item.classList.remove('active');
    item.setAttribute('aria-pressed', 'false');
  });
});

// Añadir eventos de mouse y touch a cada ítem del carrusel
items.forEach((item) => {
  item.setAttribute('role', 'button');
  item.setAttribute('aria-pressed', 'false');

  // Evento para dispositivos de escritorio
  item.addEventListener('mouseenter', () => {
    activateItem(item);
  });

  item.addEventListener('mouseleave', () => {
    item.classList.remove('active');
    item.setAttribute('aria-pressed', 'false');
  });

  // Evento para dispositivos móviles
  item.addEventListener('click', () => {
    activateItem(item);
  });
});

// Selección del botón de menú hamburguesa y navegación
const menuToggle = document.getElementById('menu-toggle');
const nav = document.querySelector('.nav');

// Verificar si los elementos existen antes de añadir eventos
if (menuToggle && nav) {
  // Función para alternar la visibilidad del menú
  const toggleMenu = () => {
    nav.classList.toggle('active');
  };

  // Añadir evento de clic al botón de menú hamburguesa
  menuToggle.addEventListener('click', toggleMenu);

  // Cerrar el menú al hacer clic en un enlace (opcional)
  const navLinks = document.querySelectorAll('.nav-links a');
  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      nav.classList.remove('active');
    });
  });
}

// Selección de preguntas frecuentes (FAQs)
const faqQuestions = document.querySelectorAll('.faq-question');

// Verificar si existen preguntas frecuentes antes de añadir eventos
if (faqQuestions.length > 0) {
  faqQuestions.forEach((question) => {
    question.addEventListener('click', () => {
      const faqItem = question.parentElement;
      const faqContent = faqItem.querySelector('.faq-content');

      // Alternar clase activa para abrir/cerrar la pregunta
      faqItem.classList.toggle('active');

      if (faqItem.classList.contains('active')) {
        // Expandir contenido
        faqContent.style.maxHeight = `${faqContent.scrollHeight}px`;
      } else {
        // Contraer contenido
        faqContent.style.maxHeight = '0';
      }

      // Cerrar otros items abiertos
      document.querySelectorAll('.faq-item').forEach((item) => {
        if (item !== faqItem && item.classList.contains('active')) {
          item.classList.remove('active');
          const otherContent = item.querySelector('.faq-content');
          otherContent.style.maxHeight = '0';
        }
      });
    });
  });
}
