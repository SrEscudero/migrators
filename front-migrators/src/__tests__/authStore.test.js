// front-migrators/src/stores/__tests__/authStore.test.js

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useAuthStore } from '@/stores/authStore.js'; 
import * as authService from '@/services/authService';

// Simulamos (mock) el módulo del servicio de autenticación.
// Vitest interceptará las llamadas a este módulo.
vi.mock('@/services/authService', () => ({
  login: vi.fn(), // Creamos una función espía para `login`
}));

// Simulamos el router para espiar la función `push`
const mockRouterPush = vi.fn();
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: mockRouterPush,
  }),
}));

describe('Auth Store', () => {
  // Antes de cada test, creamos una nueva instancia de Pinia para que los tests no interfieran entre sí
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks(); // Limpiamos los contadores de llamadas de los mocks
  });

  it('debería tener un estado inicial nulo y no autenticado', () => {
    const store = useAuthStore();
    expect(store.user).toBe(null);
    expect(store.token).toBe(null);
    expect(store.isAuthenticated).toBe(false);
  });

  it('la acción login debería actualizar el estado correctamente y redirigir', async () => {
    const store = useAuthStore();
    const mockResponse = {
      user: { id: 1, nombre: 'Test Admin', rol: 'ceo' },
      token: 'fake-jwt-token-123'
    };

    // Le decimos a nuestro mock qué debe devolver cuando la acción lo llame
    authService.login.mockResolvedValue(mockResponse);

    // Llamamos a la acción del store
    await store.login({ email: 'ceo@test.com', password: 'password' });

    // Verificamos que el estado del store se actualizó como se esperaba
    expect(store.isAuthenticated).toBe(true);
    expect(store.token).toBe(mockResponse.token);
    expect(store.user.rol).toBe('ceo');

    // Verificamos que se intentó redirigir al usuario al panel de admin
    expect(mockRouterPush).toHaveBeenCalledWith('/admin');
  });
});