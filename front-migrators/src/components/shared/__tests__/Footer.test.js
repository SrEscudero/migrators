// front-migrators/src/components/shared/Footer.test.js

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/vue';
import { createRouter, createWebHistory } from 'vue-router';
import Footer from '@/components/shared/Footer.vue'; // <-- RUTA CORREGIDA

// Opcional: Si los matchers como .toBeInTheDocument() no funcionan,
// podrías necesitar un archivo de setup global para Vitest o importar la siguiente línea:
// import '@testing-library/jest-dom/vitest';

describe('Footer.vue', () => {

  // Usamos 'beforeEach' para configurar y renderizar el componente antes de cada test 'it'.
  // Esto asegura un entorno limpio y aislado para cada prueba.
  beforeEach(() => {
    // 1. Definimos las rutas que el componente Footer necesita para evitar warnings de Vue Router.
    // No necesitan componentes reales, solo existir en la configuración.
    const dummyComponent = { template: '<div>Componente de prueba</div>' };
    const routes = [
      { path: '/', component: dummyComponent },
      { path: '/servicios', component: dummyComponent },
      { path: '/mapa', component: dummyComponent },
      { path: '/faqs', component: dummyComponent },
      { path: '/contacto', component: dummyComponent },
    ];

    // 2. Creamos una nueva instancia del router para cada test.
    const router = createRouter({
      history: createWebHistory(),
      routes, // Usamos las rutas de prueba que definimos arriba.
    });

    // 3. Renderizamos el componente pasándole el router como un plugin.
    render(Footer, {
      global: {
        plugins: [router],
      },
    });
  });

  it('Debería renderizar todas las secciones, títulos y enlaces correctamente', () => {
    // Afirmación 1: Verificar los títulos principales de las columnas
    // Usamos 'getByRole' con 'name' para ser específicos y evitar ambigüedades.
    expect(screen.getByRole('heading', { name: /Navegación/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Legal/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Contacto/i })).toBeInTheDocument();

    // Afirmación 2: Verificar la existencia de enlaces clave de navegación
    // 'getByRole' también funciona para encontrar enlaces por su texto accesible.
    expect(screen.getByRole('link', { name: /Inicio/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Servicios/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /FAQs/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Contacto' })).toBeInTheDocument(); // El link de la lista

    // Afirmación 3: Verificar la sección de suscripción (Newsletter)
    expect(screen.getByText(/Suscríbete a nuestro boletín/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Tu correo electrónico/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Suscribir/i })).toBeInTheDocument();

    // Afirmación 4: Verificar la información de contacto
    expect(screen.getByText(/info@migrators.org/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /info@migrators.org/i })).toBeInTheDocument();
    expect(screen.getByText(/^Brasil$/i)).toBeInTheDocument();

    // Afirmación 5: Verificar el texto de copyright
    expect(screen.getByText(/© 2025 Migrators. Todos los derechos reservados./i)).toBeInTheDocument();
  });

  it('Debería tener el logo de la empresa con el texto alternativo correcto', () => {
    const logo = screen.getByRole('img', { name: /Migrators Logo/i });
    expect(logo).toBeInTheDocument();
    // También podrías verificar el 'src' si fuera necesario, aunque es menos común
    // expect(logo).toHaveAttribute('src', '/src/assets/midia/icons/logo_trans.png');
  });
});