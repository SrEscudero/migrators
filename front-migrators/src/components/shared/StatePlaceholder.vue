<template>
  <div v-if="loading" class="state-placeholder-container" role="status" aria-live="polite">
    <div class="state-content">
      <div class="spinner-border text-primary mb-3" style="width: 3rem; height: 3rem;" role="presentation"></div>
      <h5 class="state-title">{{ loadingTitle }}</h5>
      <p class="text-muted">{{ loadingText }}</p>
    </div>
  </div>

  <div v-else-if="error" class="state-placeholder-container" role="alert">
    <div class="state-content">
      <i class="fas fa-exclamation-triangle fa-3x text-danger mb-3" aria-hidden="true"></i>
      <h5 class="state-title">{{ errorTitle }}</h5>
      <p class="text-muted">{{ errorText }}</p>
      <button v-if="showRetryButton" class="btn btn-primary mt-3" @click="$emit('retry')">
        <i class="fas fa-sync-alt me-2"></i>Reintentar
      </button>
    </div>
  </div>

  <div v-else-if="empty" class="state-placeholder-container">
     <div class="state-content">
        <i :class="['fa-3x mb-3 text-muted', emptyIcon]" aria-hidden="true"></i>
        <h5 class="state-title">{{ emptyTitle }}</h5>
        <p class="text-muted">{{ emptyText }}</p>
        <button v-if="showAddButton" class="btn btn-primary mt-3" @click="$emit('add')">
           <i class="fas fa-plus-circle me-2"></i>{{ addButtonText }}
        </button>
     </div>
  </div>

  <div v-else>
    <slot></slot>
  </div>
</template>

<script setup>
defineProps({
  loading: { type: Boolean, default: false },
  error: { type: [Boolean, String], default: false },
  empty: { type: Boolean, default: false }, // Prop para controlar el estado vacío

  loadingTitle: { type: String, default: 'Cargando...' },
  loadingText: { type: String, default: 'Por favor, espera un momento.' },

  errorTitle: { type: String, default: 'Ocurrió un Error' },
  errorText: { type: String, default: 'No se pudieron cargar los datos.' },
  showRetryButton: { type: Boolean, default: false },

  emptyIcon: { type: String, default: 'fas fa-inbox' },
  emptyTitle: { type: String, default: 'No hay nada aquí' },
  emptyText: { type: String, default: 'Parece que no hay datos para mostrar.' },
  showAddButton: { type: Boolean, default: false },
  addButtonText: { type: String, default: 'Agregar Nuevo' }
});

defineEmits(['retry', 'add']);
</script>

<style scoped>
.state-placeholder-container {
  background-color: #f8fafc;
  border-radius: 0.5rem;
  min-height: 300px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 2rem;
}
.state-content {
  max-width: 450px;
}
.state-title {
  color: #334155;
  font-weight: 600;
  margin-top: 1rem;
}
</style>