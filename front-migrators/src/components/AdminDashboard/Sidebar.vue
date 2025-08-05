<template>
  <aside :class="['sidebar', { collapsed: isCollapsed }]" aria-label="Menú principal de navegación">
    <div class="sidebar-header">
      <router-link to="/" class="logo-link">
        <transition name="fade" mode="out-in">
          <img v-if="isCollapsed" src="@/assets/midia/icons/logo.png" alt="Logo Migrators Pequeño" class="collapsed-logo" key="collapsed" />
          <img v-else src="@/assets/midia/icons/logo_trans.png" alt="Logo Migrators Completo" class="logo-image" key="expanded" />
        </transition>
      </router-link>
    </div>

    <nav aria-label="Menú de navegación principal" class="menu-wrapper">
      <ul class="menu-items">
        <li v-for="(item, index) in menuItems" :key="item.text || index">
          
          <router-link
            v-if="item.routeName"
            :to="{ name: item.routeName }"
            class="menu-button"
            :title="isCollapsed ? item.text : null"
          >
            <i :class="['menu-icon', item.icon]"></i>
            <span class="menu-text">{{ item.text }}</span>
          </router-link>

          <router-link
            v-else-if="item.isRoute"
            :to="item.route"
            class="menu-button"
            :title="isCollapsed ? item.text : null"
          >
            <i :class="['menu-icon', item.icon]"></i>
            <span class="menu-text">{{ item.text }}</span>
          </router-link>
        </li>
      </ul>
    </nav>

     <div class="sidebar-footer">
        <button @click="$emit('toggle-sidebar')" class="collapse-btn" :aria-expanded="!isCollapsed"
            :aria-label="isCollapsed ? 'Expandir menú' : 'Contraer menú'">
            <i :class="isCollapsed ? 'fas fa-chevron-right' : 'fas fa-chevron-left'"></i>
        </button>
     </div>
  </aside>
</template>

<script setup>
defineProps({
  menuItems: { type: Array, required: true },
  isCollapsed: { type: Boolean, default: false }
});

defineEmits(['toggle-sidebar', 'set-sidebar-collapsed']);
</script>

<style scoped>
/* Las variables de dimensionamiento se quedan, pero las de color se van */
.sidebar {
  --sidebar-width: 280px;
  --sidebar-collapsed-width: 80px;
  --sidebar-overlay-width: 280px;

  position: fixed;
  top: 0;
  left: 0;
  width: var(--sidebar-width);
  height: 100vh;
  background-color: var(--color-surface); /* AHORA: Variable global */
  color: var(--color-text); /* AHORA: Variable global */
  transition: all var(--transition-speed) ease;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--color-border); /* AHORA: Variable global */
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.sidebar.collapsed {
  width: var(--sidebar-collapsed-width);
}

.sidebar-header {
  display: flex;
  justify-content: center;
  align-items: center;
  height: var(--topbar-height); /* Variable global de App.vue */
  padding: 0 1rem;
  border-bottom: 1px solid var(--color-border); /* AHORA: Variable global */
}

.logo-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  transition: opacity 0.2s ease;
}

.logo-link:hover {
  opacity: 0.9;
}

.logo-image {
  max-width: 80%;
  max-height: 40px;
  object-fit: contain;
  transition: opacity var(--transition-speed) ease;
}

.collapsed-logo {
  width: 36px;
  height: 36px;
  object-fit: contain;
}

.menu-wrapper {
  flex-grow: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 1rem 0.5rem;
}

.menu-items {
  list-style: none;
  padding: 0;
  margin: 0;
}

.menu-items li {
  position: relative;
  margin: 0.25rem 0;
  border-radius: 0.5rem;
  overflow: hidden;
}

.menu-button {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 0.75rem 1rem;
  background: transparent;
  border: none;
  color: var(--color-text); /* AHORA: Variable global */
  cursor: pointer;
  text-align: left;
  transition: all var(--transition-speed) ease;
  border-radius: 0.5rem;
  font-size: 0.925rem;
  position: relative;
  text-decoration: none;
}

.menu-button:hover {
  background-color: var(--color-background); /* AHORA: Variable global */
  color: var(--color-primary); /* AHORA: Variable global */
}

.menu-button:focus-visible {
  outline: 2px solid var(--color-primary); /* AHORA: Variable global */
  outline-offset: -2px;
}

/* Para el router-link-active de Vue Router */
.menu-button.router-link-active {
  background-color: rgba(29, 53, 87, 0.1); /* Color primario con opacidad */
  color: var(--color-primary); /* AHORA: Variable global */
  font-weight: 500;
}

.menu-button.router-link-active .menu-icon {
  color: var(--color-primary); /* AHORA: Variable global */
}

.menu-icon {
  font-size: 1.1rem;
  margin-right: 1rem;
  color: var(--color-text-muted); /* AHORA: Variable global */
  transition: color var(--transition-speed) ease;
  flex-shrink: 0;
  width: 24px;
  text-align: center;
}

.sidebar.collapsed .menu-button {
  justify-content: center;
}

.sidebar.collapsed .menu-icon {
  margin-right: 0;
}

.menu-text {
  transition: all var(--transition-speed) ease;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex-grow: 1;
}

.sidebar.collapsed .menu-text {
  display: none;
}

.sidebar-footer {
  display: flex;
  justify-content: center;
  align-items: center;
  height: var(--footer-height, 70px); /* Usamos un fallback por si no está global */
  border-top: 1px solid var(--color-border);
  padding: 0 1rem;
}

.collapse-btn {
  background: none;
  border: none;
  color: var(--color-text-muted);
  font-size: 1.1rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: all var(--transition-speed) ease;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.collapse-btn:hover {
  background-color: var(--color-background);
  color: var(--color-primary);
  transform: scale(1.05);
}

.collapse-btn:focus-visible {
  outline: 2px solid var(--color-primary);
}

/* Mobile styles */
@media (max-width: 767.98px) {
  .sidebar {
    width: var(--sidebar-overlay-width);
    transform: translateX(-100%);
    box-shadow: 4px 0 15px rgba(0, 0, 0, 0.1);
    z-index: 1100;
  }
  
  .sidebar:not(.collapsed) {
    transform: translateX(0);
  }
  
  .sidebar.collapsed {
    transform: translateX(-100%);
  }
  
  .menu-button {
    padding: 0.75rem 1rem;
  }
  
  .menu-text {
    display: block !important;
  }
}

/* Animations */
.fade-enter-active,
.fade-leave-active {
  transition: opacity calc(var(--transition-speed) / 2) ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>