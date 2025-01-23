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


// Selección del botón de menú hamburguesa y enlaces de navegación
const menuToggle = document.getElementById('menu-toggle');
const navLinks = document.querySelector('.nav-links');

// Función para alternar la visibilidad del menú
const toggleMenu = () => {
  navLinks.classList.toggle('active');
};

// Añadir evento de clic al botón de menú hamburguesa
menuToggle.addEventListener('click', toggleMenu);

document.querySelectorAll('.faq-question').forEach((question) => {
  question.addEventListener('click', () => {
    const faqItem = question.parentElement;
    faqItem.classList.toggle('active');

    // Cerrar otros items abiertos
    document.querySelectorAll('.faq-item').forEach((item) => {
      if (item !== faqItem && item.classList.contains('active')) {
        item.classList.remove('active');
      }
    });
  });
});
