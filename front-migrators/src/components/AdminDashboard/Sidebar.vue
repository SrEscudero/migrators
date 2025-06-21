<template>
  <aside :class="['sidebar', { collapsed: isCollapsed }]" aria-label="Menú principal de navegación">
    <div class="sidebar-header">
      <router-link to="/" :aria-label="isCollapsed && windowWidth >= 768 ? 'Logo pequeño' : 'Logo completo'"
        class="logo-link">
        <transition name="fade" mode="out-in">
          <img v-if="isCollapsed && windowWidth >= 768" src="@/assets/midia/icons/logo.png" alt="Logo pequeño"
            class="collapsed-logo" key="collapsed" /> <img v-else src="@/assets/midia/icons/logo_trans.png"
            alt="Logo completo" class="logo-image" key="expanded" />
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
          </router-link>

          <button v-else @click="handleSelectOption(item.action)" class="menu-button"
            :aria-current="item.action === selectedOptionInternal ? 'page' : null"
            :aria-label="isCollapsed && windowWidth >= 768 ? item.text : null"
            :title="isCollapsed && windowWidth >= 768 ? item.text : null">
            <i :class="['menu-icon', item.icon]"></i>
            <span v-if="!(isCollapsed && windowWidth >= 768)" class="menu-text">{{ item.text }}</span>
          </button>
        </li>
      </ul>
    </nav>

    <div class="sidebar-footer">
      <button @click="handleToggleSidebar" class="collapse-btn" :aria-expanded="!isCollapsed"
        :aria-label="isCollapsed ? 'Expandir menú' : 'Contraer menú'"> <i
          :class="isCollapsed && windowWidth >=768 ? 'fas fa-bars' : 'fas fa-chevron-left'"></i> </button>
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
/* Fallback variables if not globally defined */
:root {
  --sidebar-width: 250px;
  --sidebar-collapsed-width: 80px;
  --topbar-height: 70px; /* igual que --header-height */
  --footer-height: 70px;
  --transition-speed: 0.3s;
  --primary-color: #3498db;
  --hover-color: #f0f7ff;
  --active-color: #e0e0e0;
  --text-color-dark: #333333;
  --icon-color: #6c757d;
  --border-color: #e0e0e0;
  --notification-color: #ff4757;
  --sidebar-overlay-width: 280px; /* Ancho del sidebar cuando es overlay en móvil */
}
@media (max-width: 767.98px) {
  :root {
    --topbar-height: 60px;
    --footer-height: 60px;
  }
}


.sidebar {
  position: fixed; /* [cite: 153] */
  top: 0; /* [cite: 153] */
  left: 0; /* [cite: 153] */
  width: var(--sidebar-width); /* [cite: 152, 153] */
  height: 100vh; /* [cite: 153] */
  background-color: var(--background-light, #ffffff); /* [cite: 153] */
  color: var(--text-color-dark, #333333); /* [cite: 153] */
  transition: width var(--transition-speed) ease, transform var(--transition-speed) ease; /* [cite: 153] */
  z-index: 1000; /* Debe estar por encima del contenido principal */ /* [cite: 153] */
  display: flex; /* [cite: 153] */
  flex-direction: column; /* [cite: 153] */
  border-right: 1px solid var(--border-color, #e0e0e0); /* [cite: 153] */
}

.sidebar.collapsed { /* Solo en desktop */
  width: var(--sidebar-collapsed-width); /* [cite: 154] */
}

.sidebar-header {
  display: flex; /* [cite: 154] */
  justify-content: center; /* [cite: 154] */
  align-items: center; /* [cite: 154] */
  height: var(--topbar-height); /* Sincronizado con topbar */ /* [cite: 152, 154] */
  background-color: var(--background-grey, #f8f9fa); /* [cite: 154] */
  border-bottom: 1px solid var(--border-color, #e0e0e0); /* [cite: 155] */
  flex-shrink: 0; /* [cite: 155] */
  padding: 0 10px; /* Espacio para el logo */
  box-sizing: border-box;
}

.logo-link {
  display: flex; /* [cite: 155] */
  align-items: center; /* [cite: 155] */
  justify-content: center; /* [cite: 155] */
  width: 100%; /* [cite: 155] */
  height: 100%; /* [cite: 155] */
  text-decoration: none; /* [cite: 156] */
}

.logo-image { /* Logo expandido */
  max-width: 100%; /* [cite: 156] */
  max-height: 40px; /* [cite: 156] */
  object-fit: contain; /* [cite: 156] */
  transition: opacity var(--transition-speed) ease; /* [cite: 156] */
}

.collapsed-logo { /* Logo colapsado (solo desktop) */
  width: 36px; /* [cite: 156] */
  height: 36px; /* [cite: 157] */
  object-fit: contain; /* [cite: 157] */
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity calc(var(--transition-speed) / 2) ease; /* [cite: 157] */
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0; /* [cite: 157] */
}

.menu-wrapper {
  flex-grow: 1; /* [cite: 158] */
  overflow-y: auto; /* [cite: 158] */
  overflow-x: hidden;
  scrollbar-width: thin; /* [cite: 158] */
  scrollbar-color: var(--icon-color, #6c757d) transparent; /* [cite: 158] */
  padding: 0.5rem 0;
}
.menu-wrapper::-webkit-scrollbar {
  width: 5px; /* [cite: 159] */
}
.menu-wrapper::-webkit-scrollbar-thumb {
  background-color: var(--icon-color, #6c757d); /* [cite: 159] */
  border-radius: 3px; /* [cite: 159] */
}

.menu-items {
  list-style: none; /* [cite: 158] */
  padding: 0; /* [cite: 158] */
  margin: 0; /* [cite: 158] */
}

.menu-items li {
  position: relative; /* [cite: 159] */
  margin: 4px 8px; /* [cite: 160] */
  border-radius: 6px; /* [cite: 160] */
  overflow: hidden; /* [cite: 160] */
}

.menu-button {
  display: flex; /* [cite: 160] */
  align-items: center; /* [cite: 160] */
  width: 100%; /* [cite: 160] */
  padding: 10px 15px; /* Ajustado */ /* [cite: 160] */
  background: transparent; /* [cite: 161] */
  border: none; /* [cite: 161] */
  color: var(--text-color-dark, #333333); /* [cite: 161] */
  cursor: pointer; /* [cite: 161] */
  text-align: left; /* [cite: 161] */
  transition: background-color var(--transition-speed) ease, color var(--transition-speed) ease; /* [cite: 161] */
  border-radius: inherit; /* [cite: 161] */
  font-size: 0.9rem;
}

.menu-button:hover {
  background-color: var(--hover-color, #f0f7ff); /* [cite: 162] */
  color: var(--primary-color, #3498db);
}
.menu-button:focus-visible { /* [cite: 162] */
  outline: 2px solid var(--primary-color, #3498db);
  outline-offset: -2px;
}

.menu-items li.active .menu-button {
  background-color: var(--active-color, #e0e0e0); /* [cite: 163] */
  color: var(--primary-color, #3498db);
  font-weight: 500; /* [cite: 163] */
}
.menu-items li.active .menu-button .menu-icon {
  color: var(--primary-color, #3498db);
}

.menu-icon {
  font-size: 1.1rem; /* Ajustado */ /* [cite: 163] */
  margin-right: 12px; /* Ajustado */ /* [cite: 163] */
  color: var(--icon-color, #6c757d); /* [cite: 164] */
  transition: color var(--transition-speed) ease; /* [cite: 164] */
  flex-shrink: 0; /* [cite: 164] */
  width: 20px; /* Para alinear iconos */
  text-align: center;
}
.sidebar.collapsed .menu-button { /* Solo desktop collapsed */
    justify-content: center;
}
.sidebar.collapsed .menu-icon { /* Solo desktop collapsed */
  margin-right: 0;
}

.menu-text {
  transition: opacity var(--transition-speed) ease; /* [cite: 165] */
  white-space: nowrap; /* [cite: 165] */
  overflow: hidden; /* [cite: 165] */
  text-overflow: ellipsis; /* [cite: 165] */
  flex-grow: 1;
}
.sidebar.collapsed .menu-text { /* Solo desktop collapsed */
  display: none; /* [cite: 165] */
}

.notification-badge {
  position: absolute; /* [cite: 166] */
  top: 8px; /* [cite: 166] */
  right: 8px; /* [cite: 166] */
  width: 8px; /* [cite: 166] */
  height: 8px; /* [cite: 166] */
  background-color: var(--notification-color, #ff4757); /* [cite: 166] */
  border-radius: 50%; /* [cite: 166] */
}
.sidebar.collapsed .notification-badge { /* Solo desktop collapsed */
  top: 12px; /* [cite: 167] */
  right: 12px; /* [cite: 167] */
}

.sidebar-footer {
  display: flex; /* [cite: 167] */
  justify-content: center; /* [cite: 167] */
  align-items: center; /* [cite: 167] */
  height: var(--footer-height); /* [cite: 168] */
  background-color: var(--background-grey, #f8f9fa); /* [cite: 168] */
  border-top: 1px solid var(--border-color, #e0e0e0); /* [cite: 168] */
  flex-shrink: 0; /* [cite: 168] */
}

.collapse-btn {
  background: none; /* [cite: 168] */
  border: none; /* [cite: 168] */
  color: var(--icon-color, #6c757d); /* [cite: 168] */
  font-size: 1.1rem; /* Ajustado */ /* [cite: 169] */
  cursor: pointer; /* [cite: 169] */
  padding: 10px; /* [cite: 169] */
  border-radius: 50%; /* [cite: 169] */
  transition: all var(--transition-speed) ease; /* [cite: 169] */
  width: 40px; /* [cite: 169] */
  height: 40px; /* [cite: 169] */
  display: flex; /* [cite: 169] */
  align-items: center; /* [cite: 169] */
  justify-content: center; /* [cite: 170] */
}
.collapse-btn:hover {
  background-color: var(--hover-color, #f0f7ff); /* [cite: 170] */
  color: var(--primary-color, #3498db); /* [cite: 170] */
  transform: scale(1.05); /* [cite: 170] */
}
.collapse-btn:focus-visible {
  outline: 2px solid var(--primary-color, #3498db); /* [cite: 170] */
}

/* --- Responsiveness for Sidebar --- */
@media (max-width: 767.98px) { /* Mobile breakpoint */
  .sidebar {
    width: var(--sidebar-overlay-width); /* Ancho cuando es overlay y está abierto */ /* [cite: 171] */
    transform: translateX(-100%); /* Oculto por defecto en móvil */
    box-shadow: 3px 0 15px rgba(0,0,0,0.1); /* Sombra para efecto overlay */
    /* --header-height & --footer-height are set globally for mobile */
  }
  .sidebar:not(.collapsed) { /* Cuando está abierto (isCollapsed = false) en móvil */
    transform: translateX(0);
  }
  .sidebar.collapsed {
    /* Cuando está colapsado (isCollapsed = true) en móvil, permanece oculto */
    width: var(--sidebar-overlay-width); /* Mantiene el ancho para la transición */
    transform: translateX(-100%);
  }

  .logo-image { /* Logo en móvil (siempre expandido dentro del sidebar overlay) */
    max-width: 100px; /* [cite: 172] */
    max-height: 36px;
  }
  /* .collapsed-logo no se usa en móvil según la lógica del template */

  .menu-button {
    padding: 10px 12px; /* [cite: 174] */
  }
  .menu-icon { /* En móvil, el texto siempre es visible si el sidebar está abierto */
    font-size: 1rem; /* [cite: 175] */
    margin-right: 12px; /* [cite: 175] */
  }
  .menu-text { /* Siempre visible en el sidebar overlay móvil */
    display: block !important; /* Sobrescribe la regla de .sidebar.collapsed .menu-text */
  }
  .sidebar.collapsed .menu-text { /* Cuando el sidebar se "cierra" en móvil (vuelve a translateX(-100%)) */
    display: none !important; /* Esto no debería ser necesario si está fuera de la pantalla */
  }

  /* Ocultar el botón de colapso del footer en móvil si el toggle está en el Topbar */
  /* .sidebar-footer .collapse-btn { display: none; } */
}

</style>