<template>
  <header
    :class="['topbar', { collapsed: isCollapsed }]"
    aria-label="Barra superior"
  >
    <button
      class="sidebar-toggle-btn d-lg-none"
      @click="toggleMainSidebar"
      aria-label="Toggle navigation menu"
    >
      <i class="fas fa-bars"></i>
    </button>

    <h1 class="title" v-if="!isCollapsedOnDesktop">Panel de Administración</h1>
    <h1 class="title-collapsed" v-else>Admin</h1>

    <div class="user-menu" v-click-outside="closeDropdown">
      <button
        class="user-btn"
        :class="{ active: isDropdownOpen }"
        @click="toggleDropdown"
        aria-haspopup="true"
        :aria-expanded="isDropdownOpen.toString()"
        aria-label="Menú de usuario"
      >
        <i class="fas fa-user-circle"></i>
        <span class="user-name" v-if="!isCollapsedOnDesktop">Usuario</span> <i class="fas fa-caret-down dropdown-arrow"></i>
      </button>

      <transition name="dropdown-animation">
        <ul
          v-show="isDropdownOpen"
          class="dropdown-menu"
          role="menu"
          aria-labelledby="userDropdownBtn" >
          <li role="none">
            <button
              class="dropdown-item"
              @click="navigateToProfile"
              role="menuitem"
            >
              <i class="fas fa-user-cog me-2"></i> Mi perfil
            </button>
          </li>
          <li role="none">
            <button
              class="dropdown-item"
              @click="logout"
              role="menuitem"
            >
              <i class="fas fa-sign-out-alt me-2"></i> Cerrar sesión
            </button>
          </li>
        </ul>
      </transition>
    </div>
  </header>
</template>

<script>
import vClickOutside from 'v-click-outside'; // [cite: 106]

export default {
  name: "Topbar",
  directives: {
    clickOutside: vClickOutside.directive, // [cite: 107]
  },
  props: {
    isCollapsed: { // Prop desde AdminDashboard
      type: Boolean,
      required: true,
    },
  },
  emits: ['toggle-sidebar'],
  data() {
    return {
      isDropdownOpen: false, // [cite: 107]
      windowWidth: window.innerWidth,
    };
  },
  computed: {
    isCollapsedOnDesktop() {
      // El estado 'isCollapsed' de la prop se refiere al sidebar principal.
      // Queremos que el nombre de usuario y título completo se muestren
      // a menos que el sidebar esté colapsado Y estemos en desktop.
      // En móvil, el topbar es siempre "colapsado" en términos de su propio layout.
      return this.windowWidth >= 768 && this.isCollapsed;
    }
  },
  methods: {
    toggleDropdown() {
      this.isDropdownOpen = !this.isDropdownOpen; // [cite: 108]
    },
    closeDropdown() {
      this.isDropdownOpen = false; // [cite: 109]
    },
    logout() {
      this.closeDropdown(); // [cite: 110]
      console.log("Cerrando sesión..."); // [cite: 110]
      // Implementar lógica de logout real
    },
    navigateToProfile() {
      this.closeDropdown(); // [cite: 111]
      console.log("Navegando a perfil..."); // [cite: 112]
      // Implementar navegación
    },
    toggleMainSidebar() {
      this.$emit('toggle-sidebar');
    },
    handleResize() {
      this.windowWidth = window.innerWidth;
    }
  },
  mounted() {
    window.addEventListener('resize', this.handleResize);
    this.handleResize(); // initial check
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.handleResize);
  }
};
</script>

<style scoped>
/* Fallback variables if not globally defined */
:root {
  --topbar-height: 70px;
  --sidebar-width: 250px;
  --sidebar-collapsed-width: 80px;
  --transition-speed: 0.3s;
  --primary-color: #3498db;
  --hover-color: #f0f7ff;
  --text-color-dark: #333333;
  --icon-color: #6c757d;
  --border-color: #e0e0e0;
}
@media (max-width: 767.98px) {
  :root {
    --topbar-height: 60px;
  }
}

.topbar {
  position: fixed; /* [cite: 114] */
  top: 0; /* [cite: 114] */
  left: var(--sidebar-width); /* Default left for expanded sidebar */ /* [cite: 114] */
  width: calc(100% - var(--sidebar-width)); /* Default width for expanded sidebar */ /* [cite: 114] */
  height: var(--topbar-height); /* [cite: 113, 114] */
  background-color: var(--background-light, #ffffff); /* [cite: 115] */
  color: var(--text-color-dark, #333333); /* [cite: 115] */
  display: flex; /* [cite: 115] */
  align-items: center; /* [cite: 115] */
  justify-content: space-between; /* [cite: 115] */
  padding: 0 20px; /* [cite: 115] */
  z-index: 999; /* Lower than sidebar if sidebar is an overlay */ /* [cite: 115] */
  transition: left var(--transition-speed) ease, width var(--transition-speed) ease; /* [cite: 115] */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05); /* [cite: 116] */
  border-bottom: 1px solid var(--border-color, #e0e0e0); /* [cite: 116] */
}

.topbar.collapsed { /* When sidebar is collapsed on desktop */
  left: var(--sidebar-collapsed-width); /* [cite: 116] */
  width: calc(100% - var(--sidebar-collapsed-width)); /* [cite: 117] */
}

.sidebar-toggle-btn {
  color: var(--icon-color, #6c757d);
  background: none;
  border: none;
  font-size: 1.2rem;
  padding: 0.5rem;
  margin-right: 1rem; /* Space between toggle and title */
  cursor: pointer;
}
.sidebar-toggle-btn:hover {
  color: var(--primary-color, #3498db);
}


.title, .title-collapsed {
  font-weight: 600; /* [cite: 117] */
  margin: 0; /* [cite: 117] */
  white-space: nowrap; /* [cite: 117] */
  overflow: hidden; /* [cite: 117] */
  text-overflow: ellipsis; /* [cite: 117] */
}
.title {
  font-size: 1.2rem; /* [cite: 117] */
  max-width: calc(100% - 250px); /* Adjust based on user menu width */ /* [cite: 118] */
}
.title-collapsed {
  font-size: 1.1rem; /* [cite: 118] */
}


.user-menu {
  position: relative; /* [cite: 119] */
}

.user-btn {
  display: flex; /* [cite: 119] */
  align-items: center; /* [cite: 119] */
  background: none; /* [cite: 119] */
  border: none; /* [cite: 119] */
  color: var(--icon-color, #6c757d); /* [cite: 119] */
  cursor: pointer; /* [cite: 119] */
  padding: 8px 12px; /* [cite: 119] */
  border-radius: 20px; /* [cite: 119] */
  transition: background-color var(--transition-speed) ease, color var(--transition-speed) ease; /* [cite: 120] */
}

.user-btn:hover, .user-btn.active {
  background-color: var(--hover-color, #f0f7ff); /* [cite: 120] */
  color: var(--primary-color, #3498db); /* [cite: 120] */
}

.user-btn i {
  font-size: 1.4rem; /* [cite: 121] */
}
.user-btn .fa-user-circle {
 margin-right: 8px; /* [cite: 121] */
}

.user-name {
  font-size: 0.9rem; /* [cite: 121] */
  margin-right: 8px; /* [cite: 121] */
  max-width: 120px; /* [cite: 122] */
  white-space: nowrap; /* [cite: 122] */
  overflow: hidden; /* [cite: 122] */
  text-overflow: ellipsis; /* [cite: 122] */
}

.dropdown-arrow {
  font-size: 0.9rem; /* [cite: 122] */
  transition: transform var(--transition-speed) ease; /* [cite: 122] */
}

.user-btn.active .dropdown-arrow {
  transform: rotate(180deg); /* [cite: 122] */
}

.dropdown-menu {
  position: absolute; /* [cite: 123] */
  right: 0; /* [cite: 123] */
  top: calc(100% + 8px); /* [cite: 123] */
  min-width: 200px; /* [cite: 123] */
  background-color: var(--background-light, #ffffff); /* [cite: 123] */
  border-radius: 8px; /* [cite: 123] */
  box-shadow: var(--dropdown-shadow, 0 4px 12px rgba(0, 0, 0, 0.1)); /* [cite: 114, 123] */
  list-style: none; /* [cite: 124] */
  padding: 8px 0; /* [cite: 124] */
  margin: 0; /* [cite: 124] */
  z-index: 1000; /* [cite: 124] */
}

.dropdown-item {
  display: flex; /* [cite: 124] */
  align-items: center; /* [cite: 124] */
  width: 100%; /* [cite: 124] */
  padding: 10px 16px; /* [cite: 125] */
  background: none; /* [cite: 125] */
  border: none; /* [cite: 125] */
  color: var(--text-color-dark, #333333); /* [cite: 125] */
  cursor: pointer; /* [cite: 125] */
  text-align: left; /* [cite: 125] */
  font-size: 0.9rem;
  transition: background-color var(--transition-speed) ease, color var(--transition-speed) ease; /* [cite: 125] */
}

.dropdown-item:hover {
  background-color: var(--hover-color, #f0f7ff); /* [cite: 126] */
  color: var(--primary-color, #3498db); /* [cite: 126] */
}

.dropdown-item i {
  width: 20px; /* [cite: 126] */
  text-align: center; /* [cite: 127] */
  /* margin-right is handled by me-2 bootstrap class in template */
}

.dropdown-animation-enter-active,
.dropdown-animation-leave-active {
  transition: all var(--transition-speed) ease; /* [cite: 127] */
  transform-origin: top right; /* [cite: 127] */
}

.dropdown-animation-enter-from,
.dropdown-animation-leave-to {
  opacity: 0; /* [cite: 127] */
  transform: scale(0.95); /* [cite: 128] */
}

/* --- Responsiveness for Topbar --- */
@media (max-width: 767.98px) { /* Mobile breakpoint */
  .topbar, .topbar.collapsed { /* Topbar always full width on mobile because sidebar is an overlay */
    left: 0 !important; /* [cite: 128] */
    width: 100% !important;
    padding: 0 10px; /* [cite: 128] */
    /* --topbar-height: 60px; // from global */
  }

  .title {
    font-size: 1rem; /* [cite: 129] */
    max-width: calc(100% - 150px); /* Account for toggle btn and user menu */ /* [cite: 129] */
  }
  .title-collapsed { /* This will be the one shown on mobile if logic for isCollapsedOnDesktop is used */
    font-size: 1rem; /* [cite: 130] */
  }

  .user-btn {
    padding: 6px 8px; /* [cite: 131] */
  }
  .user-btn i.fa-user-circle {
    font-size: 1.3rem; /* [cite: 132] */
    margin-right: 0; /* [cite: 132] */
  }
  .user-name {
    display: none; /* [cite: 133] */
  }
  .dropdown-menu {
    min-width: 180px; /* [cite: 134] */
  }
}

/* Hide d-lg-none by default on larger screens if Bootstrap isn't fully loaded/working for it */
@media (min-width: 992px) {
  .d-lg-none {
    display: none !important;
  }
}
</style>