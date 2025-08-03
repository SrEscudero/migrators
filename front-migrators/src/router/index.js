import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';

// --- Vistas de Carga Rápida (Públicas y de Autenticación) ---
import Inicio from '@/views/inicio.vue';
import SobreNosotros from '@/views/sobre-nosotros.vue';
import Noticias from '@/views/noticias.vue';
import LoginView from '@/views/LoginView.vue';
import RegisterView from '@/views/RegisterView.vue';

// --- Componente Principal del Dashboard (el "cascarón") ---
import AdminDashboard from '@/views/AdminDashboard.vue';

// --- Componentes de las Secciones del Dashboard (para la definición de rutas) ---
import Estadisticas from '@/components/AdminDashboard/Estadisticas.vue';
import GestionClientes from '@/views/AdminDashboard/GestionClientes.vue';
import GestionFuncionarios from '@/views/AdminDashboard/GestionFuncionarios.vue';
import GestionVisitantes from '@/views/AdminDashboard/GestionVisitantes.vue';
import NoticiasWrapper from '@/views/AdminDashboard/NoticiasWrapper.vue';

const routes = [
  // --- Rutas Públicas Principales ---
  { path: '/', name: 'Inicio', component: Inicio },
  { path: '/sobre-nosotros', name: 'SobreNosotros', component: SobreNosotros },
  { path: '/noticias', name: 'Noticias', component: Noticias },

  // --- Rutas de Autenticación ---
  { path: "/acceder", name: "Acceder", component: LoginView },
  { path: "/cadastro", name: "Cadastro", component: RegisterView },

  // --- RUTA PRINCIPAL DEL DASHBOARD CON RUTAS ANIDADAS ---
  {
    path: '/admin',
    component: AdminDashboard,
    meta: { requiresAuth: true, hideLayout: true }, 
    redirect: '/admin/estadisticas',
    children: [
      { path: 'estadisticas', name: 'AdminEstadisticas', component: Estadisticas },
      { path: 'clientes', name: 'AdminClientes', component: GestionClientes },
      { path: 'funcionarios', name: 'AdminFuncionarios', component: GestionFuncionarios },
      { path: 'visitantes', name: 'AdminVisitantes', component: GestionVisitantes },
      { path: 'noticias', name: 'AdminNoticias', component: NoticiasWrapper }
    ]
  },

  // --- Rutas Protegidas Adicionales (se mantienen como estaban) ---
  {
    path: '/perfil',
    name: 'ProfileView',
    component: () => import('@/views/AdminDashboard/ProfileView.vue'),
    // La meta 'hideLayout' ya no es necesaria si este componente no usa el layout del dashboard
    meta: { requiresAuth: true } 
  },

  // --- Rutas del Módulo de Foro (se mantienen como estaban) ---
  {
    path: '/foro',
    name: 'Foro',
    component: () => import('@/views/Foro/ForumIndex.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/foro/:forumId',
    name: 'ThreadList',
    component: () => import('@/views/Foro/ThreadList.vue'),
    meta: { requiresAuth: true },
    props: true
  },
  {
    path: '/threads/:id',
    name: 'ThreadView',
    component: () => import('@/views/Foro/ThreadView.vue'),
    meta: { requiresAuth: true },
    props: true
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// --- GUARDIA DE NAVEGACIÓN MEJORADO (se mantiene tu lógica) ---
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);

  // Si la ruta requiere autenticación y el usuario no está logueado, va al login
  if (requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'Acceder' });
  } 
  // Si el usuario está logueado e intenta ir a la página de login o registro
  else if (['Acceder', 'Cadastro'].includes(to.name) && authStore.isAuthenticated) {
    // Lo redirigimos al panel de administración (la ruta base /admin se encargará de redirigir a /admin/estadisticas)
    next({ path: '/admin' });
  } 
  // En cualquier otro caso, permite la navegación
  else {
    next();
  }
});

export default router;