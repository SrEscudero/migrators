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
      <div class="user-menu" ref="userMenuRef">
        <button 
          class="user-btn" 
          :class="{ 'active': isDropdownOpen }" 
          @click="toggleDropdown"
          aria-haspopup="true"
          :aria-expanded="isDropdownOpen"
        >
          <div class="user-avatar">
            <i class="fas fa-user-circle"></i>
          </div>
          <span class="user-name">{{ user?.Nombre || 'Usuario' }}</span>
          <i class="fas fa-caret-down dropdown-arrow"></i>
        </button>

        <transition name="dropdown-animation">
          <ul v-show="isDropdownOpen" class="dropdown-menu">
            <li>
              <router-link to="/perfil" class="dropdown-item" @click="closeDropdown">
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
        </transition>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import { useTheme } from '@/composables/useTheme';
import Swal from 'sweetalert2';
import { storeToRefs } from 'pinia';

defineProps({
  isCollapsed: { type: Boolean, required: true },
});
const emit = defineEmits(['toggle-sidebar']);

// --- ESTADO REACTIVO ---
const authStore = useAuthStore();
const { user } = storeToRefs(authStore); // Se asegura que 'user' sea reactivo
const { theme, toggleTheme } = useTheme();

const isDropdownOpen = ref(false);
const windowWidth = ref(window.innerWidth);
const userMenuRef = ref(null); // Ref para el contenedor del menú

// --- MANEJO DEL MENÚ DESPLEGABLE ---
const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value;
};

const closeDropdown = () => {
  isDropdownOpen.value = false;
};

const handleClickOutside = (event) => {
  // Si el menú está abierto y el clic fue fuera de su contenedor, se cierra
  if (isDropdownOpen.value && userMenuRef.value && !userMenuRef.value.contains(event.target)) {
    closeDropdown();
  }
};

// Se vigila el estado del menú para añadir/quitar el listener de clic fuera
watch(isDropdownOpen, (isOpen) => {
  if (isOpen) {
    document.addEventListener('click', handleClickOutside, true);
  } else {
    document.removeEventListener('click', handleClickOutside, true);
  }
});

// --- ACCIONES ---
const handleThemeToggle = () => {
  toggleTheme();
  closeDropdown();
};

const handleLogout = async () => {
  closeDropdown();
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
  // Limpia el listener si el componente se destruye con el menú abierto
  document.removeEventListener('click', handleClickOutside, true);
});
</script>

<style scoped>
/* Tus estilos existentes se mantienen aquí */
.topbar {
  position: fixed;
  top: 0;
  left: var(--sidebar-width);
  width: calc(100% - var(--sidebar-width));
  height: var(--topbar-height);
  background-color: #ffffff;
  color: var(--text-color-dark);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1.5rem;
  z-index: 999;
  transition: all var(--transition-speed) ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border-bottom: 1px solid var(--border-color);
}
.topbar.collapsed {
  left: var(--sidebar-collapsed-width);
  width: calc(100% - var(--sidebar-collapsed-width));
}
.topbar-left, .topbar-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.sidebar-toggle-btn {
  color: var(--icon-color);
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
.user-menu {
  position: relative;
}
.user-btn {
  display: flex;
  align-items: center;
  background: none;
  border: none;
  color: var(--text-color-dark);
  cursor: pointer;
  padding: 0.5rem 0.75rem;
  border-radius: 9999px;
  transition: background-color var(--transition-speed) ease;
  gap: 0.75rem;
}
.user-btn:hover, .user-btn.active {
  background-color: var(--hover-color);
}
.user-avatar i {
  font-size: 1.75rem;
  color: var(--primary-color);
}
.user-name {
  font-size: 0.925rem;
  max-width: 150px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.dropdown-arrow {
  font-size: 0.9rem;
  transition: transform var(--transition-speed) ease;
}
.user-btn.active .dropdown-arrow {
  transform: rotate(180deg);
}
.dropdown-menu {
  position: absolute;
  right: 0;
  top: calc(100% + 0.5rem);
  min-width: 200px;
  background-color: #ffffff;
  border-radius: 0.5rem;
  box-shadow: var(--dropdown-shadow);
  list-style: none;
  padding: 0.5rem 0;
  margin: 0;
  z-index: 1000;
  border: 1px solid var(--border-color);
}
.dropdown-item {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 0.75rem 1.25rem;
  background: none;
  border: none;
  color: var(--text-color-dark);
  cursor: pointer;
  text-align: left;
  font-size: 0.925rem;
  transition: background-color var(--transition-speed) ease, color var(--transition-speed) ease;
  text-decoration: none;
}
.dropdown-item:hover {
  background-color: var(--hover-color);
  color: var(--primary-color);
}
.dropdown-item i {
  width: 20px;
  text-align: center;
}
.dropdown-divider {
  margin: 0.5rem 0;
  border-top: 1px solid var(--border-color);
}
.dropdown-animation-enter-active,
.dropdown-animation-leave-active {
  transition: all 0.2s ease;
  transform-origin: top right;
}
.dropdown-animation-enter-from,
.dropdown-animation-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(-10px);
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