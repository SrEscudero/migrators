<template>
  <button
    type="button"
    :class="['action-btn', variantClass]"
    :title="tooltip"
    :aria-label="tooltip"
  >
    <i :class="['fas', icon]"></i>
  </button>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  // El ícono de Font Awesome que se mostrará (ej. 'fa-edit')
  icon: {
    type: String,
    required: true,
  },
  // El texto que aparecerá en el tooltip y en el aria-label
  tooltip: {
    type: String,
    required: true,
  },
  // La variante de color del botón
  variant: {
    type: String,
    default: 'default', // 'default', 'primary', 'danger', 'success', 'warning'
    validator: (value) => ['default', 'primary', 'danger', 'success', 'warning', 'info'].includes(value),
  },
});

// Calcula la clase CSS correcta basada en la variante
const variantClass = computed(() => {
  return `action-btn-${props.variant}`;
});
</script>

<style scoped>
.action-btn {
  background: none;
  border: none;
  border-radius: 50%;
  width: 34px;
  height: 34px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  font-size: 0.9rem;
}

.action-btn:hover {
  transform: scale(1.15);
}

.action-btn:focus-visible {
  outline: 2px solid var(--app-primary, #4f46e5);
  outline-offset: 1px;
}

/* Variantes de Color */
.action-btn-default {
  color: #64748b; /* gris */
}
.action-btn-default:hover {
  background-color: #f1f5f9;
  color: #475569;
}

.action-btn-primary {
  color: #4f46e5; /* azul */
}
.action-btn-primary:hover {
  background-color: rgba(79, 70, 229, 0.1);
}

.action-btn-danger {
  color: #ef4444; /* rojo */
}
.action-btn-danger:hover {
  background-color: rgba(239, 68, 68, 0.1);
}

.action-btn-success {
  color: #22c55e; /* verde */
}
.action-btn-success:hover {
  background-color: rgba(34, 197, 94, 0.1);
}

.action-btn-warning {
  color: #f59e0b; /* amarillo/naranja */
}
.action-btn-warning:hover {
  background-color: rgba(245, 158, 11, 0.1);
}

.action-btn-info {
    color: #3b82f6; /* azul info */
}
.action-btn-info:hover {
    background-color: rgba(59, 130, 246, 0.1);
}
</style>