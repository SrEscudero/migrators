<template>
  <nav class="navbar navbar-expand-lg navbar-light bg-white shadow-sm sticky-top">
    <div class="container">
      <router-link to="/" class="navbar-brand" aria-label="Página de inicio de Migrators">
        <img
          :src="logo"
          alt="Logo de Migrators"
          class="logo"
          @mouseover="hoverLogo = true"
          @mouseleave="hoverLogo = false"
          :class="{ 'logo-hover': hoverLogo }"
        />
      </router-link>

      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#mainNavbar"
        aria-controls="mainNavbar"
        aria-expanded="false"
        aria-label="Alternar menú de navegación"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="mainNavbar" ref="navbarCollapseRef">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
          <li class="nav-item" v-for="item in navItems" :key="item.route">
            <router-link :to="item.route" class="nav-link position-relative" @click="closeNavbar">
              {{ item.text }}
              <span class="active-indicator" aria-hidden="true"></span>
            </router-link>
          </li>
        </ul>

        <div class="d-flex align-items-center nav-actions">
          <template v-if="!isAuthenticated">
            <router-link
              to="/acceder"
              class="btn btn-primary rounded-pill px-4"
              aria-label="Acceder a la cuenta"
              @click="closeNavbar"
            >
              <i class="bi bi-box-arrow-in-right me-2"></i> Acceder
            </router-link>
          </template>

          <template v-else>
            <div class="dropdown user-menu">
              <button
                class="btn btn-light dropdown-toggle d-flex align-items-center"
                type="button"
                id="userMenuButton"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <i class="fas fa-user-circle me-2"></i>
                <span class="user-name-display">{{ user.nombre }}</span>
              </button>
              <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userMenuButton">
                <li v-if="isAdmin">
                   <router-link to="/admin" class="dropdown-item" @click="closeNavbar">
                    <i class="fas fa-tachometer-alt fa-fw me-2"></i>Panel Admin
                  </router-link>
                </li>
                <li v-if="isAdmin"><hr class="dropdown-divider"></li>
                <li>
                  <button class="dropdown-item text-danger" @click="handleLogout">
                    <i class="fas fa-sign-out-alt fa-fw me-2"></i>Cerrar Sesión
                  </button>
                </li>
              </ul>
            </div>
          </template>
        </div>
        </div>
    </div>
  </nav>
</template>

<script setup>
// 1. IMPORTACIONES ADICIONALES DE VUE Y BOOTSTRAP
import { useRouter } from 'vue-router';
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { Collapse } from 'bootstrap'; // Importa la clase Collapse de Bootstrap

import { useAuthStore } from '@/stores/authStore';
import { storeToRefs } from 'pinia';
import Swal from 'sweetalert2';
import logo from '@/assets/midia/icons/logo_trans.png';

const hoverLogo = ref(false);

const router = useRouter();

const authStore = useAuthStore();
const { isAuthenticated, user, isAdmin } = storeToRefs(authStore);
const { logout } = authStore;

const navItems = computed(() => {
  const publicItems = [
    { text: 'Inicio', route: '/' },
    { text: 'Sobre Nosotros', route: '/sobre-nosotros' },
    { text: 'Noticias', route: '/noticias' },
  ];
  return publicItems;
});

// 2. LÓGICA PARA MANEJAR EL MENÚ RESPONSIVE
const navbarCollapseRef = ref(null); // Ref para el elemento del DOM
let bsCollapse = null; // Variable para guardar la instancia de Bootstrap

onMounted(() => {
  if (navbarCollapseRef.value) {
    // Inicializa la instancia de Collapse de Bootstrap cuando el componente se monta
    bsCollapse = new Collapse(navbarCollapseRef.value, {
      toggle: false // Importante: no lo abras al cargar la página
    });
  }
});

onBeforeUnmount(() => {
  // Destruye la instancia al desmontar el componente para evitar fugas de memoria
  if (bsCollapse) {
    bsCollapse.dispose();
  }
});

const closeNavbar = () => {
  // Si la instancia de Bootstrap existe y el menú está visible, lo oculta
  if (bsCollapse && navbarCollapseRef.value.classList.contains('show')) {
    bsCollapse.hide();
  }
};
// FIN DE LA LÓGICA PARA EL MENÚ

const handleLogout = () => {
  Swal.fire({
    title: '¿Cerrar sesión?',
    text: "¿Estás seguro de que quieres salir?",
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#1D3557',
    cancelButtonColor: '#6c757d',
    confirmButtonText: 'Sí, salir',
    cancelButtonText: 'Cancelar'
  }).then(async (result) => { // La función ahora es async
    if (result.isConfirmed) {
      closeNavbar(); 
      await logout(); // Espera a que el store se limpie
      router.push('/acceder'); // El componente redirige al usuario
    }
  });
};
</script>

<style scoped>
.navbar {
  padding-top: 0.75rem;
  padding-bottom: 0.75rem;
  transition: box-shadow var(--transition-speed);
  background-color: var(--color-surface); /* Estandarizado */
  box-shadow: var(--shadow-soft);
}

.logo {
  width: 150px;
  height: auto;
  max-height: 40px;
  transition: all var(--transition-speed);
}
.logo.logo-hover {
  transform: scale(1.05);
}

.nav-link {
  font-family: var(--font-family-base);
  font-weight: var(--font-weight-medium);
  padding: 0.5rem 1rem;
  margin: 0 0.25rem;
  color: var(--color-text-muted); /* Estandarizado */
  position: relative;
  transition: all var(--transition-speed);
  border-radius: 0.25rem;
}

.nav-link:hover,
.nav-link:focus {
  color: var(--color-primary); /* Estandarizado */
}

.nav-link .active-indicator {
  position: absolute;
  bottom: 0;
  left: 1rem;
  right: 1rem;
  height: 3px;
  background-color: transparent;
  border-radius: 3px 3px 0 0;
  transform-origin: center;
  transition: all var(--transition-speed);
  opacity: 0;
  transform: scaleX(0);
}

.nav-link.router-link-exact-active {
  color: var(--color-primary) !important; /* Estandarizado */
  font-weight: var(--font-weight-bold);
}

.nav-link.router-link-exact-active .active-indicator {
  background-color: var(--color-primary); /* Estandarizado */
  opacity: 1;
  transform: scaleX(1);
}

.nav-link:not(.router-link-exact-active):hover .active-indicator {
  background-color: var(--color-primary); /* Estandarizado */
  transform: scaleX(0.5);
  opacity: 0.5;
}

.btn {
  font-weight: var(--font-weight-medium);
  transition: all var(--transition-speed);
}
.btn-primary {
  background-color: var(--color-primary); /* Estandarizado */
  border-color: var(--color-primary); /* Estandarizado */
  box-shadow: 0 4px 12px rgba(29, 53, 87, 0.25);
}
.btn-primary:hover {
  background-color: var(--color-primary-light); /* Estandarizado */
  border-color: var(--color-primary-light); /* Estandarizado */
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(69, 123, 157, 0.3);
}

.user-menu .dropdown-toggle {
  font-weight: var(--font-weight-medium);
}
.user-name-display {
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--color-text); /* Estandarizado */
}
.dropdown-item {
    display: flex;
    align-items: center;
    color: var(--color-text); /* Estandarizado */
}
.dropdown-item .fa-fw {
  width: 20px;
  text-align: center;
}
.dropdown-menu {
  box-shadow: 0 .5rem 1rem rgba(0,0,0,.15)!important;
  border: none;
  background-color: var(--color-surface); /* Estandarizado */
}
.dropdown-item:hover {
    background-color: var(--color-background); /* Estandarizado */
    color: var(--color-primary);
}


@media (max-width: 991.98px) {
  .navbar-collapse {
    padding-top: 1rem;
  }
  .nav-item {
    margin-bottom: 0.5rem;
  }
  .nav-actions {
    margin-top: 1rem;
    width: 100%;
    justify-content: flex-start;
  }
}
</style>