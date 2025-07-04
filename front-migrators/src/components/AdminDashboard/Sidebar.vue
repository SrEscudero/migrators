<template>
  <aside :class="['sidebar', { collapsed: isCollapsed }]" aria-label="Menú principal de navegación">
    <div class="sidebar-header">
      <router-link to="/" :aria-label="isCollapsed && windowWidth >= 768 ? 'Logo pequeño' : 'Logo completo'"
        class="logo-link">
        <transition name="fade" mode="out-in">
          <img v-if="isCollapsed && windowWidth >= 768" src="@/assets/midia/icons/logo.png" alt="Logo pequeño"
            class="collapsed-logo" key="collapsed" />
          <img v-else src="@/assets/midia/icons/logo_trans.png" alt="Logo completo" class="logo-image" key="expanded" />
        </transition>
      </router-link>
    </div>

    <nav aria-label="Menú de navegación principal" class="menu-wrapper">
      <ul class="menu-items">
        <li v-for="(item, index) in menuItems" :key="index"
          :class="{ active: item.action === selectedOptionInternal && !item.isRoute }">
          <router-link v-if="item.isRoute" :to="item.route" class="menu-button"
            :aria-label="isCollapsed && windowWidth >= 768 ? item.text : null"
            :title="isCollapsed && windowWidth >= 768 ? item.text : null">
            <i :class="['menu-icon', item.icon]"></i>
            <span v-if="!(isCollapsed && windowWidth >= 768)" class="menu-text">{{ item.text }}</span>
            <span v-if="item.badge" class="badge">{{ item.badge }}</span>
          </router-link>

          <button v-else @click="handleSelectOption(item.action)" class="menu-button"
            :aria-current="item.action === selectedOptionInternal ? 'page' : null"
            :aria-label="isCollapsed && windowWidth >= 768 ? item.text : null"
            :title="isCollapsed && windowWidth >= 768 ? item.text : null">
            <i :class="['menu-icon', item.icon]"></i>
            <span v-if="!(isCollapsed && windowWidth >= 768)" class="menu-text">{{ item.text }}</span>
            <span v-if="item.badge" class="badge">{{ item.badge }}</span>
          </button>
        </li>
      </ul>
    </nav>

    <div class="sidebar-footer">
      <button @click="handleToggleSidebar" class="collapse-btn" :aria-expanded="!isCollapsed"
        :aria-label="isCollapsed ? 'Expandir menú' : 'Contraer menú'">
        <i :class="isCollapsed && windowWidth >=768 ? 'fas fa-bars' : 'fas fa-chevron-left'"></i>
      </button>
    </div>
  </aside>
</template>

<script>
import { ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { debounce } from 'lodash';

export default {
  name: "Sidebar",
  props: {
    menuItems: {
      type: Array,
      required: true,
      validator: (items) => items.every(item => {
        const hasBaseProps = 'text' in item && 'icon' in item;
        const isActionItem = 'action' in item;
        const isRouteItem = 'isRoute' in item && 'route' in item;
        return hasBaseProps && (isActionItem || isRouteItem);
      })
    },
    isCollapsed: {
      type: Boolean,
      required: true,
    }
  },
  emits: ["select-option", "toggle-sidebar", "set-sidebar-collapsed"],
  setup(props, { emit }) {
    const selectedOptionInternal = ref(null);
    const windowWidth = ref(window.innerWidth);

    const shouldAutoCollapse = () => {
      return windowWidth.value < 768;
    };

    const handleSelectOption = (option) => {
      selectedOptionInternal.value = option;
      emit("select-option", option);
      if (shouldAutoCollapse() && !props.isCollapsed) {
        emit("set-sidebar-collapsed", true);
      }
    };

    const handleToggleSidebar = () => {
      emit("toggle-sidebar");
    };

    const handleResize = debounce(() => {
      const oldWidth = windowWidth.value;
      windowWidth.value = window.innerWidth;
      if (oldWidth >= 768 && windowWidth.value < 768 && !props.isCollapsed) {
         emit("set-sidebar-collapsed", true);
      }
    }, 150);

    onMounted(() => {
      window.addEventListener('resize', handleResize);
      handleResize();
      if (shouldAutoCollapse() && !props.isCollapsed) {
        nextTick(() => {
            if (shouldAutoCollapse() && !props.isCollapsed) {
                 emit("set-sidebar-collapsed", true);
            }
        });
      }
    });

    onBeforeUnmount(() => {
      window.removeEventListener('resize', handleResize);
    });

    return {
      selectedOptionInternal,
      windowWidth,
      handleSelectOption,
      handleToggleSidebar,
    };
  }
};
</script>

<style scoped>
:root {
  --sidebar-width: 280px;
  --sidebar-collapsed-width: 80px;
  --topbar-height: 70px;
  --footer-height: 70px;
  --transition-speed: 0.3s;
  --primary-color: #4f46e5;
  --primary-hover: #4338ca;
  --hover-color: #f1f5f9;
  --active-color: #e0e7ff;
  --text-color-dark: #1e293b;
  --text-color-light: #64748b;
  --icon-color: #64748b;
  --border-color: #e2e8f0;
  --notification-color: #ef4444;
  --sidebar-bg: #ffffff;
  --sidebar-overlay-width: 280px;
}

.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: var(--sidebar-width);
  height: 100vh;
  background-color: var(--sidebar-bg);
  color: var(--text-color-dark);
  transition: all var(--transition-speed) ease;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--border-color);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.sidebar.collapsed {
  width: var(--sidebar-collapsed-width);
}

.sidebar-header {
  display: flex;
  justify-content: center;
  align-items: center;
  height: var(--topbar-height);
  padding: 0 1rem;
  border-bottom: 1px solid var(--border-color);
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
  color: var(--text-color-dark);
  cursor: pointer;
  text-align: left;
  transition: all var(--transition-speed) ease;
  border-radius: 0.5rem;
  font-size: 0.925rem;
  position: relative;
}

.menu-button:hover {
  background-color: var(--hover-color);
  color: var(--primary-color);
}

.menu-button:focus-visible {
  outline: 2px solid var(--primary-color);
  outline-offset: -2px;
}

.menu-items li.active .menu-button {
  background-color: var(--active-color);
  color: var(--primary-color);
  font-weight: 500;
}

.menu-items li.active .menu-icon {
  color: var(--primary-color);
}

.menu-icon {
  font-size: 1.1rem;
  margin-right: 1rem;
  color: var(--icon-color);
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

.badge {
  background-color: var(--notification-color);
  color: white;
  border-radius: 9999px;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  margin-left: auto;
}

.sidebar.collapsed .menu-text,
.sidebar.collapsed .badge {
  display: none;
}

.sidebar-footer {
  display: flex;
  justify-content: center;
  align-items: center;
  height: var(--footer-height);
  border-top: 1px solid var(--border-color);
  padding: 0 1rem;
}

.collapse-btn {
  background: none;
  border: none;
  color: var(--icon-color);
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
  background-color: var(--hover-color);
  color: var(--primary-color);
  transform: scale(1.05);
}

.collapse-btn:focus-visible {
  outline: 2px solid var(--primary-color);
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