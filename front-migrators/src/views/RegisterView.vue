<template>
  <div class="auth-container">
    <div class="auth-card">
      <div class="auth-header text-center">
        <router-link to="/">
          <img src="@/assets/midia/icons/logo_trans.png" alt="Logo de Migrators" class="auth-logo">
        </router-link>
        <h1 class="h3 mb-3 fw-normal">Crea tu Cuenta de Cliente</h1>
        <p class="text-muted">Únete a nuestra comunidad y mantente informado.</p>
      </div>

      <form @submit.prevent="handleRegister" class="auth-form">
        <div v-if="errorMessage" class="alert alert-danger" role="alert">
          {{ errorMessage }}
        </div>

        <div class="form-floating mb-3">
          <input type="text" class="form-control" id="nombre" placeholder="Nombre Completo" v-model="nombre" required>
          <label for="nombre">Nombre Completo</label>
        </div>

        <div class="form-floating mb-3">
          <input type="email" class="form-control" id="email" placeholder="nombre@ejemplo.com" v-model="email" required>
          <label for="email">Correo Electrónico</label>
        </div>

        <div class="form-floating mb-3">
          <input type="password" class="form-control" id="password" placeholder="Contraseña" v-model="password" required>
          <label for="password">Contraseña</label>
        </div>

        <div class="form-floating mb-3">
          <input type="tel" class="form-control" id="celular" placeholder="Número de Celular" v-model="celular">
          <label for="celular">Celular (Opcional)</label>
        </div>

        <div class="d-grid">
          <button class="btn btn-primary btn-lg" type="submit" :disabled="isLoading">
            <span v-if="isLoading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            <span v-else>Registrarme</span>
          </button>
        </div>

        <div class="auth-footer text-center mt-4">
          <p class="mb-0">¿Ya tienes una cuenta?
            <router-link to="/acceder">Inicia sesión</router-link>
          </p>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import Swal from 'sweetalert2';
import { register } from '@/services/authService';

const router = useRouter();

const nombre = ref('');
const email = ref('');
const password = ref('');
const celular = ref('');
const isLoading = ref(false);
const errorMessage = ref(null);

const handleRegister = async () => {
  isLoading.value = true;
  errorMessage.value = null;
  try {
    await register({
      nombre: nombre.value,
      email: email.value,
      password: password.value,
      celular: celular.value,
    });

    await Swal.fire({
      icon: 'success',
      title: '¡Registro Exitoso!',
      text: 'Tu cuenta ha sido creada. Ahora serás redirigido para iniciar sesión.',
      timer: 3000,
      timerProgressBar: true,
      showConfirmButton: false
    });

    router.push('/acceder');

  } catch (error) {
    errorMessage.value = error.message;
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
/* Usamos los mismos estilos que LoginView.vue para consistencia */
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f8f9fa;
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