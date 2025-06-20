// front-migrators/src/views/__tests__/LoginView.test.js

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/vue';
import { createPinia } from 'pinia';
import { createRouter, createWebHistory } from 'vue-router';
import LoginView from '@/views/LoginView.vue'; 
import { useAuthStore } from '@/stores/authStore';

// Creamos un router porque LoginView contiene <router-link>
const router = createRouter({
  history: createWebHistory(),
  routes: [{ path: '/', component: { template: 'Home' } }],
});

describe('LoginView.vue', () => {
  it('debería llamar a la acción de login del store al rellenar y enviar el formulario', async () => {
    const pinia = createPinia();
    const authStore = useAuthStore(pinia); // Obtenemos la instancia del store

    // Creamos un "spy" para "espiar" si la acción 'login' es llamada.
    const loginActionSpy = vi.spyOn(authStore, 'login');

    // Renderizamos el componente, proveyendo las dependencias que necesita (Pinia y Router)
    render(LoginView, {
      global: {
        plugins: [pinia, router],
      },
    });

    // "Actuamos" como un usuario usando Testing Library
    // 1. Encontrar los campos del formulario por su etiqueta (buena práctica de accesibilidad)
    const emailInput = screen.getByLabelText('Correo Electrónico');
    const passwordInput = screen.getByLabelText('Contraseña');
    const submitButton = screen.getByRole('button', { name: /entrar/i });

    // 2. Simular que el usuario escribe en los campos
    await fireEvent.update(emailInput, 'usuario@prueba.com');
    await fireEvent.update(passwordInput, 'contraseña123');

    // 3. Simular que el usuario hace clic en el botón de entrar
    await fireEvent.click(submitButton);

    // "Verificamos" (Assert) el resultado
    // ¿Se llamó a la función de login del store?
    expect(loginActionSpy).toHaveBeenCalledTimes(1);
    // ¿Se llamó con los datos que el usuario introdujo en el formulario?
    expect(loginActionSpy).toHaveBeenCalledWith({
      email: 'usuario@prueba.com',
      password: 'contraseña123',
    });
  });
});