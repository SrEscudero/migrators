<template>
  <header :class="['topbar', { 'collapsed': isCollapsed }]">
    <div class="topbar-left">
      <button class="sidebar-toggle-btn" @click="toggleMainSidebar" v-if="windowWidth < 768">
        <i class="fas fa-bars"></i>
      </button>
      <h1 class="title" v-if="!isCollapsedOnDesktop">Panel de Administración</h1>
      <h1 class="title-collapsed" v-else>Admin</h1>
    </div>
    
    <div class="topbar-right">
      <div class="user-menu" v-click-outside="closeDropdown">
        <button class="user-btn" :class="{ 'active': isDropdownOpen }" @click="toggleDropdown">
          <div class="user-avatar">
            <i class="fas fa-user-circle"></i>
          </div>
          <span class="user-name" v-if="!isCollapsedOnDesktop">{{ user?.Nombre || 'Usuario' }}</span>
          <i class="fas fa-caret-down dropdown-arrow"></i>
        </button>
        <transition name="dropdown-animation">
          <ul v-show="isDropdownOpen" class="dropdown-menu">
            <li>
              <router-link to="/perfil" class="dropdown-item" @click="closeDropdown">
                <i class="fas fa-user-cog me-2"></i> Mi perfil
              </router-link>
            </li>
            <li>
              <button class="dropdown-item text-danger" @click="handleLogout">
                <i class="fas fa-sign-out-alt me-2"></i> Cerrar sesión
              </button>
            </li>
          </ul>
        </transition>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import Swal from 'sweetalert2';
import vClickOutside from 'v-click-outside';
import { storeToRefs } from 'pinia';

const props = defineProps({
  isCollapsed: { type: Boolean, required: true },
});
const emit = defineEmits(['toggle-sidebar']);

const authStore = useAuthStore();
const { user } = storeToRefs(authStore);

const isDropdownOpen = ref(false);
const windowWidth = ref(window.innerWidth);

const toggleDropdown = () => { isDropdownOpen.value = !isDropdownOpen.value; };
const closeDropdown = () => { isDropdownOpen.value = false; };
const toggleMainSidebar = () => { emit('toggle-sidebar'); };

const handleLogout = () => {
  closeDropdown();
  Swal.fire({
    title: '¿Cerrar sesión?', text: "¿Estás seguro de que quieres salir?", icon: 'question',
    showCancelButton: true, confirmButtonColor: '#1D3557', cancelButtonColor: '#6c757d',
    confirmButtonText: 'Sí, salir', cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.isConfirmed) {
      authStore.logout();
    }
  });
};

const isCollapsedOnDesktop = computed(() => windowWidth.value >= 768 && props.isCollapsed);

const handleResize = () => { windowWidth.value = window.innerWidth; };
onMounted(() => window.addEventListener('resize', handleResize));
onBeforeUnmount(() => window.removeEventListener('resize', handleResize));

const vco = vClickOutside.directive;
</script>

<style scoped>
:root {
  --topbar-height: 70px;
  --sidebar-width: 280px;
  --sidebar-collapsed-width: 80px;
  --transition-speed: 0.3s;
  --primary-color: #4f46e5;
  --primary-hover: #4338ca;
  --hover-color: #f1f5f9;
  --text-color-dark: #1e293b;
  --text-color-light: #64748b;
  --icon-color: #64748b;
  --border-color: #e2e8f0;
  --dropdown-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

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

.topbar-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.topbar-right {
  display: flex;
  align-items: center;
}

.sidebar-toggle-btn {
  color: var(--icon-color);
  background: none;
  border: none;
  font-size: 1.2rem;
  padding: 0.5rem;
  cursor: pointer;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.sidebar-toggle-btn:hover {
  color: var(--primary-color);
  background-color: var(--hover-color);
}

.title, .title-collapsed {
  font-weight: 600;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.title {
  font-size: 1.25rem;
  color: var(--text-color-dark);
}

.title-collapsed {
  font-size: 1.1rem;
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
  transition: all var(--transition-speed) ease;
  gap: 0.5rem;
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
  transition: all var(--transition-speed) ease;
}

.dropdown-item:hover {
  background-color: var(--hover-color);
  color: var(--primary-color);
}

.dropdown-item i {
  width: 20px;
  text-align: center;
}

.text-danger {
  color: #ef4444;
}

.text-danger:hover {
  color: #dc2626;
}

.dropdown-animation-enter-active,
.dropdown-animation-leave-active {
  transition: all var(--transition-speed) ease;
  transform-origin: top right;
}

.dropdown-animation-enter-from,
.dropdown-animation-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

@media (max-width: 767.98px) {
  .topbar, .topbar.collapsed {
    left: 0 !important;
    width: 100% !important;
    padding: 0 1rem;
  }
  
  .title {
    font-size: 1.1rem;
  }
  
  .user-btn {
    padding: 0.5rem;
  }
  
  .user-name {
    display: none;
  }
  
  .user-avatar i {
    font-size: 1.5rem;
  }
}
</style>