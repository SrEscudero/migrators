<template>
  <div class="container mt-4">
    <h2>Mi Perfil</h2>
    <div class="card">
      <div class="card-body">
        <p><strong>Nombre:</strong> {{ authStore.user?.Nombre }}</p>
        <p><strong>Email:</strong> {{ authStore.user?.Email }}</p>
        <p><strong>Rol:</strong> {{ authStore.user?.rol }}</p>
        <hr>
        <p class="text-muted">Próximamente: funcionalidad para cambiar contraseña y editar información.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/authStore';
const authStore = useAuthStore();
</script>