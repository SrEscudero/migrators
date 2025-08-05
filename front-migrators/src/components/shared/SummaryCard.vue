<!-- src/components/shared/SummaryCard.vue -->
<template>
  <div class="summary-card">
    <div :class="['card-icon', `bg-${color}`, 'text-white']">
      <i :class="icon"></i>
    </div>
    <div class="card-details">
      <h5 class="card-title">{{ title }}</h5>
      <p class="card-value mb-0">{{ value }}</p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, required: true },
  value: { type: [Number, String], required: true },
  icon: { type: String, required: true },
  color: { type: String, default: 'primary' }
});
</script>

<style scoped>
.summary-card {
  background-color: #fff;
  border-radius: 0.75rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  padding: 1.5rem;
  display: flex;
  align-items: center;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.summary-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}

.card-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
  flex-shrink: 0;
}

.card-icon i {
  font-size: 1.25rem;
}

.card-details {
  flex: 1;
  min-width: 0;
}

.card-title {
  font-size: 0.9rem;
  font-weight: 500;
  color: #6c757d;
  margin-bottom: 0.5rem; /* Espacio adicional */
}

.card-value {
  font-size: 2rem; /* Aumentar el tamaño del número */
  font-weight: 700;
  color: #343a40;
  margin-bottom: 0;
}
</style>