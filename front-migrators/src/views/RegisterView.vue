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
          <input type="password" class="form-control" id="confirmPassword" placeholder="Confirmar Contraseña" v-model="confirmPassword" required>
          <label for="confirmPassword">Confirmar Contraseña</label>
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
const confirmPassword = ref(''); // Variable para la confirmación
const celular = ref('');
const isLoading = ref(false);
const errorMessage = ref(null);

const handleRegister = async () => {
  // Validación de contraseña
  if (password.value !== confirmPassword.value) {
    errorMessage.value = 'Las contraseñas no coinciden.';
    return;
  }

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
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 2rem;
  position: relative;
  overflow: hidden;
  background-color: var(--color-background); /* Usar variable global */
}

.auth-container::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 100%;
  height: 100%;
  z-index: 0;
}

.auth-card {
  width: 100%;
  max-width: 440px;
  padding: 2.5rem;
  background: var(--color-surface); /* Usar variable global */
  border-radius: 16px;
  box-shadow: var(--shadow-medium); /* Usar variable global */
  position: relative;
  z-index: 1;
  border: 1px solid var(--color-border); /* Usar variable global */
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.auth-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 45px rgba(0, 0, 0, 0.12);
}

.auth-header {
  margin-bottom: 2rem;
}

.auth-logo {
  max-width: 200px;
  margin-bottom: 1.5rem;
  transition: transform 0.3s ease;
}

.auth-logo:hover {
  transform: scale(1.05);
}

.auth-header h1 {
  color: var(--color-primary); /* Usar variable global */
  font-weight: var(--font-weight-bold);
  font-size: 1.8rem;
  margin-bottom: 0.5rem;
}

.auth-header p {
  color: var(--color-text-muted); /* Usar variable global */
  font-size: 1rem;
}

.auth-form {
  margin-top: 1.5rem;
}

.form-floating {
  position: relative;
  margin-bottom: 1.25rem;
}

.form-control {
  height: 56px;
  padding: 1rem 1.25rem;
  border: 1px solid var(--color-border); /* Usar variable global */
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.form-control:focus {
  border-color: var(--color-primary-light); /* Usar variable global */
  box-shadow: 0 0 0 0.25rem rgba(69, 123, 157, 0.15);
  outline: none;
}

label {
  color: var(--color-text-muted); /* Usar variable global */
  padding: 0.5rem 1.25rem;
  font-size: 0.95rem;
}

.btn-primary {
  background-color: var(--color-primary); /* Usar variable global */
  border-color: var(--color-primary); /* Usar variable global */
  padding: 0.85rem;
  font-weight: 600;
  font-size: 1.05rem;
  border-radius: 10px;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
  text-transform: uppercase;
  margin-top: 0.5rem;
}

.btn-primary:hover {
  background-color: var(--color-primary-light); /* Usar variable global */
  border-color: var(--color-primary-light); /* Usar variable global */
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(29, 53, 87, 0.2);
}

.btn-primary:active {
  transform: translateY(0);
}

.btn-primary:disabled {
  background-color: #a8dadc;
  border-color: #a8dadc;
  transform: none;
  box-shadow: none;
}

.auth-footer {
  margin-top: 2rem;
  color: var(--color-text-muted); /* Usar variable global */
  font-size: 0.95rem;
}

.auth-footer a {
  color: var(--color-primary); /* Usar variable global */
  font-weight: 600;
  text-decoration: none;
  transition: color 0.2s ease;
  position: relative;
}

.auth-footer a:hover {
  color: var(--color-primary-light); /* Usar variable global */
  text-decoration: none;
}

.auth-footer a::after {
  content: '';
  position: absolute;
  width: 100%;
  height: 2px;
  bottom: -2px;
  left: 0;
  background-color: var(--color-primary-light); /* Usar variable global */
  transform: scaleX(0);
  transition: transform 0.25s ease;
}

.auth-footer a:hover::after {
  transform: scaleX(1);
}

.alert-danger {
  background-color: #fff3f3;
  border-color: #ffd6d6;
  color: var(--color-danger); /* Usar variable global */
  border-radius: 8px;
  padding: 0.75rem 1.25rem;
  margin-bottom: 1.5rem;
}

.spinner-border {
  vertical-align: middle;
  margin-right: 0.5rem;
}

.register-animation {
  animation: fadeInUp 0.6s ease;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive adjustments */
@media (max-width: 576px) {
  .auth-container {
    padding: 1rem;
  }
  
  .auth-card {
    padding: 1.75rem;
    border-radius: 12px;
  }
  
  .auth-logo {
    max-width: 160px;
  }
  
  .auth-header h1 {
    font-size: 1.5rem;
  }
  
  .btn-primary {
    padding: 0.75rem;
    font-size: 1rem;
  }
}
</style>