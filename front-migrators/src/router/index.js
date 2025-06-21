// src/router/index.js (VERSIÓN FINAL CORREGIDA)

import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';

// --- Vistas de Carga Rápida ---
import Inicio from '@/views/inicio.vue';
import SobreNosotros from '@/views/sobre-nosotros.vue';
import Noticias from '@/views/noticias.vue';
import LoginView from '@/views/LoginView.vue'; // MEJORA: Importado con alias @
import RegisterView from '@/views/RegisterView.vue'; // MEJORA: Importado con alias @

const routes = [
  // --- Rutas Públicas Principales ---
  {
    path: '/',
    name: 'Inicio',
    component: Inicio,
  },
  {
    path: '/sobre-nosotros',
    name: 'SobreNosotros',
    component: SobreNosotros,
  },
  {
    path: '/noticias',
    name: 'Noticias',
    component: Noticias,
  },

  // --- Rutas de Autenticación ---
  {
    path: "/acceder",
    name: "Acceder",
    component: LoginView,
  },
  {
    path: "/cadastro",
    name: "Cadastro",
    component: RegisterView,
  },

  // --- Rutas Protegidas (Tipo Aplicación, sin Header/Footer) ---
  {
    path: '/admin',
    name: 'AdminDashboard',
    component: () => import('@/views/AdminDashboard.vue'),
    meta: { requiresAuth: true, hideLayout: true } // MEJORA: Añadida meta para ocultar layout
  },

  {
    path: '/perfil',
    name: 'ProfileView',
    component: () => import('@/views/AdminDashboard/ProfileView.vue'),
    meta: { requiresAuth: true, hideLayout: true } // MEJORA: Añadida meta para ocultar layout
  },

  // --- Rutas del Módulo de Foro ---
  {
    path: '/foro',
    name: 'Foro',
    component: () => import('@/views/Foro/ForumIndex.vue'),
    meta: { requiresAuth: true, hideLayout: true } // MEJORA: Añadida meta para ocultar layout
  },
  {
    // CORRECCIÓN: Ruta duplicada eliminada. Esta es la única definición necesaria.
    path: '/foro/:forumId',
    name: 'ThreadList',
    component: () => import('@/views/Foro/ThreadList.vue'),
    meta: { requiresAuth: true, hideLayout: true }, // MEJORA: Añadida meta para ocultar layout
    props: true
  },
  {
    path: '/threads/:id',
    name: 'ThreadView',
    component: () => import('@/views/Foro/ThreadView.vue'),
    meta: { requiresAuth: true, hideLayout: true }, // MEJORA: Añadida meta para ocultar layout
    props: true
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// --- GUARDIA DE NAVEGACIÓN MEJORADO ---
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);

  // Si la ruta requiere autenticación y el usuario no está logueado, va al login
  if (requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'Acceder' });
  } 
  // Si el usuario está logueado e intenta ir a la página de login o registro
  else if (['Acceder', 'Cadastro'].includes(to.name) && authStore.isAuthenticated) {
    // Lo redirigimos a su panel correspondiente
    if (authStore.isAdmin) {
      next({ name: 'AdminDashboard' });
    } else {
      next({ name: 'ClienteDashboard' }); // CORRECCIÓN: Redirige al panel del cliente
    }
  } 
  // En cualquier otro caso, permite la navegación
  else {
    next();
  }
});

export default router;