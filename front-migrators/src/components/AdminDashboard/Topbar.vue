<template>
  <header :class="['topbar', { 'collapsed': isCollapsed }]">
    <div class="topbar-left">
      <button 
        class="sidebar-toggle-btn" 
        @click="$emit('toggle-sidebar')"
        v-if="windowWidth < 768"
      >
        <i class="fas fa-bars"></i>
      </button>
      <h1 class="title">Panel de Administración</h1>
    </div>

    <div class="topbar-right">
      <div class="dropdown user-menu">
        <button 
          class="btn user-btn dropdown-toggle" 
          type="button"
          id="userMenuButton"
          data-bs-toggle="dropdown" 
          aria-expanded="false"
        >
          <div class="user-avatar">
            <i class="fas fa-user-circle"></i>
          </div>
          <span class="user-name">{{ user?.nombre || 'Usuario' }}</span>
        </button>

        <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userMenuButton">
          <li>
            <router-link to="/perfil" class="dropdown-item">
              <i class="fas fa-user-cog fa-fw me-2"></i> Mi Perfil
            </router-link>
          </li>
          <li>
            <button class="dropdown-item" @click="handleThemeToggle">
              <i class="fas fa-fw me-2" :class="theme === 'light' ? 'fa-moon' : 'fa-sun'"></i>
              <span>Tema: {{ theme === 'light' ? 'Oscuro' : 'Claro' }}</span>
            </button>
          </li>
          <li><hr class="dropdown-divider"></li>
          <li>
            <button class="dropdown-item text-danger" @click="handleLogout">
              <i class="fas fa-sign-out-alt fa-fw me-2"></i> Cerrar sesión
            </button>
          </li>
        </ul>
      </div>
    </div>
  </header>
</template>

<script setup>
// AJUSTE: Se eliminaron refs y watchers innecesarios (isDropdownOpen, etc.)
import { ref, onMounted, onUnmounted } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import { useTheme } from '@/composables/useTheme';
import Swal from 'sweetalert2';
import { storeToRefs } from 'pinia';

defineProps({
  isCollapsed: { type: Boolean, required: true },
});
defineEmits(['toggle-sidebar']);

// --- ESTADO REACTIVO ---
const authStore = useAuthStore();
const { user } = storeToRefs(authStore);
const { theme, toggleTheme } = useTheme();

const windowWidth = ref(window.innerWidth);

// --- ACCIONES ---
const handleThemeToggle = () => {
  toggleTheme();
};

const handleLogout = async () => {
  const result = await Swal.fire({
    title: '¿Cerrar sesión?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Sí, cerrar sesión',
    cancelButtonText: 'Cancelar',
  });
  if (result.isConfirmed) {
    await authStore.logout();
  }
};

// --- CICLO DE VIDA ---
const handleResize = () => { 
  windowWidth.value = window.innerWidth;
};

onMounted(() => {
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});
</script>

<style scoped>
.topbar {
  position: fixed;
  top: 0;
  left: var(--sidebar-width); /* Variable del componente Sidebar */
  width: calc(100% - var(--sidebar-width)); /* Variable del componente Sidebar */
  height: var(--topbar-height); /* Variable global de App.vue */
  background-color: var(--color-surface); /* AHORA: Variable global */
  color: var(--color-text); /* AHORA: Variable global */
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1.5rem;
  z-index: 999;
  transition: all var(--transition-speed) ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border-bottom: 1px solid var(--color-border); /* AHORA: Variable global */
}
.topbar.collapsed {
  left: var(--sidebar-collapsed-width); /* Variable del componente Sidebar */
  width: calc(100% - var(--sidebar-collapsed-width)); /* Variable del componente Sidebar */
}
.topbar-left, .topbar-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.sidebar-toggle-btn {
  color: var(--color-text-muted); /* AHORA: Variable global */
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.title {
  font-weight: 600;
  margin: 0;
  font-size: 1.25rem;
  white-space: nowrap;
}

.user-btn.dropdown-toggle {
  display: flex;
  align-items: center;
  background: none;
  border: none;
  color: var(--color-text); /* AHORA: Variable global */
  cursor: pointer;
  padding: 0.5rem 0.75rem;
  border-radius: 9999px;
  transition: background-color var(--transition-speed) ease;
  gap: 0.75rem;
}
.user-btn.dropdown-toggle:hover, .user-btn.dropdown-toggle.show {
  background-color: var(--color-background); /* AHORA: Variable global */
}

.user-btn.dropdown-toggle::after {
  display: none;
}
.user-avatar i {
  font-size: 1.75rem;
  color: var(--color-primary); /* AHORA: Variable global */
}
.user-name {
  font-size: 0.925rem;
  max-width: 150px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.dropdown-menu {
  position: absolute;
  right: 0;
  top: calc(100% + 0.5rem);
  min-width: 200px;
  background-color: var(--color-surface); /* AHORA: Variable global */
  border-radius: 0.5rem;
  box-shadow: 0 .5rem 1rem rgba(0,0,0,.15);
  list-style: none;
  padding: 0.5rem 0;
  margin: 0;
  z-index: 1000;
  border: 1px solid var(--color-border); /* AHORA: Variable global */
}
.dropdown-item {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 0.75rem 1.25rem;
  background: none;
  border: none;
  color: var(--color-text); /* AHORA: Variable global */
  cursor: pointer;
  text-align: left;
  font-size: 0.925rem;
  transition: background-color var(--transition-speed) ease, color var(--transition-speed) ease;
  text-decoration: none;
}
.dropdown-item:hover {
  background-color: var(--color-background); /* AHORA: Variable global */
  color: var(--color-primary); /* AHORA: Variable global */
}
.dropdown-item i {
  width: 20px;
  text-align: center;
}
.dropdown-divider {
  margin: 0.5rem 0;
  border-top: 1px solid var(--color-border); /* AHORA: Variable global */
}

@media (max-width: 767.98px) {
  .topbar, .topbar.collapsed {
    left: 0;
    width: 100%;
  }
  .title { display: none; }
  .user-name { display: none; }
}
</style>