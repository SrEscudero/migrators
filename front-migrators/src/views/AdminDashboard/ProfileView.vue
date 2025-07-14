<template>
  <div class="page-content-container">
    <div class="page-header">
      <h2 class="page-title">Mi Perfil</h2>
    </div>
    <div class="content-card">
      <form @submit.prevent="handleUpdateProfile" class="p-4">
        <div class="row">
          <div class="col-md-6 mb-3">
            <label for="profileName" class="form-label">Nombre Completo</label>
            <input type="text" class="form-control" id="profileName" v-model="profileData.nombre">
          </div>
          <div class="col-md-6 mb-3">
            <label for="profileEmail" class="form-label">Correo Electrónico</label>
            <input type="email" class="form-control" id="profileEmail" v-model="profileData.email" disabled>
            <small class="form-text text-muted">El email no se puede cambiar.</small>
          </div>
        </div>
        <hr class="my-3">
        <h5 class="mb-3">Cambiar Contraseña</h5>
        <div class="row">
          <div class="col-md-6 mb-3">
            <label for="newPassword" class="form-label">Nueva Contraseña</label>
            <input type="password" class="form-control" id="newPassword" v-model="passwordData.newPassword" placeholder="Dejar en blanco para no cambiar">
          </div>
          <div class="col-md-6 mb-3">
            <label for="confirmPassword" class="form-label">Confirmar Nueva Contraseña</label>
            <input type="password" class="form-control" id="confirmPassword" v-model="passwordData.confirmPassword" placeholder="Dejar en blanco para no cambiar">
          </div>
        </div>
        <div class="d-flex justify-content-end mt-3">
          <button type="submit" class="btn btn-primary" :disabled="isSaving">
            <span v-if="isSaving" class="spinner-border spinner-border-sm me-2"></span>
            {{ isSaving ? 'Guardando...' : 'Guardar Cambios' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import { storeToRefs } from 'pinia';
import Swal from 'sweetalert2';
import apiClient from '@/services/api';

const authStore = useAuthStore();
const { user } = storeToRefs(authStore);

const isSaving = ref(false);

const profileData = reactive({
  nombre: user.value?.Nombre || '',
  email: user.value?.Email || '',
});

const passwordData = reactive({
  newPassword: '',
  confirmPassword: '',
});

const handleUpdateProfile = async () => {
  if (passwordData.newPassword && passwordData.newPassword !== passwordData.confirmPassword) {
    Swal.fire('Error', 'Las contraseñas no coinciden.', 'error');
    return;
  }
  
  isSaving.value = true;
  
  try {
    const payload = {
      nombre: profileData.nombre,
    };
    if (passwordData.newPassword) {
      payload.password = passwordData.newPassword;
    }
    
    // Hacemos la llamada al nuevo endpoint del backend
    const response = await apiClient.put('/api/usuarios/me', payload);
    
    // Actualizamos el estado en Pinia con los nuevos datos
    authStore.updateUser(response.data.user);
    
    Swal.fire('¡Éxito!', 'Tu perfil ha sido actualizado.', 'success');
    passwordData.newPassword = '';
    passwordData.confirmPassword = '';
    
  } catch (error) {
    Swal.fire('Error', error.response?.data?.message || 'No se pudo actualizar el perfil.', 'error');
  } finally {
    isSaving.value = false;
  }
};
</script>