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

      <div class="collapse navbar-collapse" id="mainNavbar">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
          <li class="nav-item" v-for="item in navItems" :key="item.route">
            <router-link :to="item.route" class="nav-link position-relative">
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
                  <router-link to="/admin" class="dropdown-item">
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
import { ref, computed } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import { storeToRefs } from 'pinia';
import Swal from 'sweetalert2';
import logo from '@/assets/midia/icons/logo_trans.png';

// Variable local para efecto hover del logo
const hoverLogo = ref(false);

// 1. Instanciamos el store de autenticación
const authStore = useAuthStore();

// 2. Usamos storeToRefs para extraer propiedades del store manteniendo su reactividad.
const { isAuthenticated, user, isAdmin } = storeToRefs(authStore);

// 3. Las acciones (funciones) se pueden desestructurar directamente.
const { logout } = authStore;

// 4. Creamos una propiedad computada para los items de navegación.
//    Esto añade dinámicamente el enlace al Admin Dashboard si el usuario es administrador.
const navItems = computed(() => {
  const publicItems = [
    { text: 'Inicio', route: '/' },
    { text: 'Sobre Nosotros', route: '/sobre-nosotros' },
    { text: 'Noticias', route: '/noticias' },
  ];

  // Ya no es necesario añadir 'Admin' aquí si lo queremos en el menú de usuario,
  // pero lo dejamos por si prefieres tenerlo en la barra principal también.
  // Si solo lo quieres en el dropdown, puedes quitar este bloque 'if'.
  if (isAdmin.value) {
    // publicItems.push({ text: 'Admin', route: '/admin' });
  }

  return publicItems;
});

const handleLogout = () => {
  Swal.fire({
    title: '¿Cerrar sesión?',
    text: "¿Estás seguro de que quieres salir?",
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#1D3557', // Azul oscuro
    cancelButtonColor: '#6c757d', // Gris
    confirmButtonText: 'Sí, salir',
    cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.isConfirmed) {
      logout(); // Llama a la acción de logout del store, que también redirige
    }
  });
};
</script>

<style scoped>
/* Variables (las mantenemos para consistencia local) */
:root {
  --nav-link-padding-x: 1rem;
  --nav-link-padding-y: 0.5rem;
  --nav-link-transition: all 0.3s ease;
  --active-indicator-height: 3px;
}

/* Navbar general */
.navbar {
  padding-top: 0.75rem;
  padding-bottom: 0.75rem;
  transition: box-shadow 0.3s ease;
}

/* Logo */
.logo {
  width: 150px;
  height: auto;
  max-height: 40px;
  transition: var(--nav-link-transition);
}
.logo.logo-hover {
  transform: scale(1.05);
}

/* Enlaces de navegación */
.nav-link {
  font-family: 'Poppins', sans-serif;
  font-weight: 550;
  padding: var(--nav-link-padding-y) var(--nav-link-padding-x);
  margin: 0 0.25rem;
  color: var(--bs-gray-700);
  position: relative;
  transition: var(--nav-link-transition);
  border-radius: 0.25rem;
}

.nav-link:hover,
.nav-link:focus {
  color: var(--bs-primary);
}

.nav-link .active-indicator {
  position: absolute;
  bottom: 0;
  left: var(--nav-link-padding-x);
  right: var(--nav-link-padding-x);
  height: var(--active-indicator-height);
  background-color: transparent;
  border-radius: var(--active-indicator-height) var(--active-indicator-height) 0 0;
  transform-origin: center;
  transition: var(--nav-link-transition);
  opacity: 0;
  transform: scaleX(0);
}

.nav-link.router-link-exact-active {
  color: #1D3557 !important; /* Azul oscuro para el activo */
  font-weight: 600;
}

.nav-link.router-link-exact-active .active-indicator {
  background-color: #1D3557; /* Azul oscuro para el indicador */
  opacity: 1;
  transform: scaleX(1);
}

.nav-link:not(.router-link-exact-active):hover .active-indicator {
  background-color: var(--bs-primary);
  transform: scaleX(0.5);
  opacity: 0.5;
}

/* Botones y Menú de Usuario */
.btn {
  font-weight: 500;
  transition: var(--nav-link-transition);
}
.btn-primary {
  background-color: #1D3557;
  border-color: #1D3557;
  box-shadow: 0 4px 12px rgba(29, 53, 87, 0.25);
}
.btn-primary:hover {
  background-color: #457B9D;
  border-color: #457B9D;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(69, 123, 157, 0.3);
}

.user-menu .dropdown-toggle {
  font-weight: 500;
}
.user-name-display {
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.dropdown-item {
    display: flex;
    align-items: center;
}
.dropdown-item .fa-fw {
  width: 20px;
  text-align: center;
}
.dropdown-menu {
  box-shadow: 0 .5rem 1rem rgba(0,0,0,.15)!important;
  border: none;
}

/* Responsividad */
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