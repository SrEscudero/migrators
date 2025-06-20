<template>
  <div class="auth-container">
    <div class="auth-card">
      <div class="auth-header text-center">
        <router-link to="/">
          <img src="@/assets/midia/icons/logo_trans.png" alt="Logo de Migrators" class="auth-logo">
        </router-link>
        <h1 class="h3 mb-3 fw-normal">Acceder a tu Cuenta</h1>
        <p class="text-muted">¡Bienvenido de nuevo! Ingresa tus credenciales.</p>
      </div>

      <form @submit.prevent="handleLogin" class="auth-form">
        <!-- Mensaje de Error -->
        <div v-if="errorMessage" class="alert alert-danger" role="alert">
          {{ errorMessage }}
        </div>

        <div class="form-floating mb-3">
          <input
            type="email"
            class="form-control"
            id="email"
            placeholder="nombre@ejemplo.com"
            v-model="email"
            required
            aria-describedby="emailHelp"
          >
          <label for="email">Correo Electrónico</label>
        </div>

        <div class="form-floating mb-3">
          <input
            type="password"
            class="form-control"
            id="password"
            placeholder="Contraseña"
            v-model="password"
            required
            aria-describedby="passwordHelp"
          >
          <label for="password">Contraseña</label>
        </div>

        <div class="d-grid">
          <button class="btn btn-primary btn-lg" type="submit" :disabled="isLoading">
            <span v-if="isLoading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            <span v-else>Entrar</span>
          </button>
        </div>

        <div class="auth-footer text-center mt-4">
          <p class="mb-0">¿No tienes una cuenta?
            <router-link to="/cadastro">Regístrate aquí</router-link>
          </p>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '@/stores/authStore'; // Correcto: Importamos el store

// Ya no necesitamos importar 'login' del servicio ni 'useRouter' aquí.
// El store se encargará de eso.

const authStore = useAuthStore(); // Correcto: Creamos la instancia del store
const email = ref('');
const password = ref('');
const isLoading = ref(false);
const errorMessage = ref(null);

const handleLogin = async () => {
  isLoading.value = true;
  errorMessage.value = null;
  try {
    // Correcto: Llamamos a la acción del store.
    // La acción 'login' ahora se encarga de la redirección por sí misma.
    await authStore.login({
      email: email.value,
      password: password.value,
    });

    // ¡ERROR A CORREGIR! Elimina este bloque if/else.
    // Ya no es necesario aquí. La variable 'loggedInUser' no existe en este contexto,
    // y la redirección ya ocurre dentro de la acción del store.

  } catch (error) {
    // Correcto: Si la acción del store falla, muestra el error.
    errorMessage.value = error.message;
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
/* Estilos para que coincida con tu diseño */
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f8f9fa; /* Color de fondo suave */
  padding: 2rem;
}

.auth-card {
  width: 100%;
  max-width: 420px;
  padding: 2.5rem;
  background: white;
  border-radius: 1rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.auth-logo {
  max-width: 180px;
  margin-bottom: 1.5rem;
}

.form-control:focus {
  border-color: #457B9D;
  box-shadow: 0 0 0 0.25rem rgba(69, 123, 157, 0.25);
}

.btn-primary {
  background-color: #1D3557;
  border-color: #1D3557;
  padding: 0.75rem;
  font-weight: 600;
}

.btn-primary:hover {
  background-color: #457B9D;
  border-color: #457B9D;
}

.auth-footer a {
  color: #1D3557;
  font-weight: 600;
  text-decoration: none;
}

.auth-footer a:hover {
  text-decoration: underline;
}
</style>