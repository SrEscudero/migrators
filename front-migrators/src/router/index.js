import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';

// Vistas
import Inicio from '@/views/inicio.vue';
import SobreNosotros from '@/views/sobre-nosotros.vue';
import Noticias from '@/views/noticias.vue';
import LoginView from '@/views/LoginView.vue';
import RegisterView from '@/views/RegisterView.vue';
import AdminDashboard from '@/views/AdminDashboard.vue';

// Componentes del Dashboard
import Estadisticas from '@/components/AdminDashboard/Estadisticas.vue';
import GestionClientes from '@/views/AdminDashboard/GestionClientes.vue';
import GestionFuncionarios from '@/views/AdminDashboard/GestionFuncionarios.vue';
import GestionVisitantes from '@/views/AdminDashboard/GestionVisitantes.vue';
import NoticiasWrapper from '@/views/AdminDashboard/NoticiasWrapper.vue';

// Un componente de marcador de posición para las rutas nuevas
const PlaceholderComponent = { template: '<div class="container pt-5 text-center"><h2>Página en Construcción</h2><p>Esta sección estará disponible próximamente.</p><router-link to="/">Volver al Inicio</router-link></div>' };

const routes = [
  // --- Rutas Públicas Principales ---
  { path: '/', name: 'Inicio', component: Inicio },
  { path: '/sobre-nosotros', name: 'SobreNosotros', component: SobreNosotros },
  { path: '/noticias', name: 'Noticias', component: Noticias },

  // --- Rutas de marcador de posición ---
  { path: '/conoce-mas', name: 'ConoceMas', component: PlaceholderComponent },
  { path: '/servicios', name: 'Servicios', component: PlaceholderComponent },
  { path: '/servicios/asesoria-legal', name: 'ServicioAsesoria', component: PlaceholderComponent },
  { path: '/servicios/guia-empleo', name: 'ServicioEmpleo', component: PlaceholderComponent },
  { path: '/servicios/adaptacion-cultural', name: 'ServicioCultura', component: PlaceholderComponent },
  { path: '/mapa', name: 'Mapa', component: PlaceholderComponent },
  { path: '/faqs', name: 'FAQs', component: PlaceholderComponent },
  { path: '/contacto', name: 'Contacto', component: PlaceholderComponent },
  { path: '/recursos', name: 'Recursos', component: PlaceholderComponent }, // <-- RUTA AÑADIDA

  // --- Rutas de Autenticación ---
  { path: "/acceder", name: "Acceder", component: LoginView },
  { path: "/cadastro", name: "Cadastro", component: RegisterView },

  // --- RUTA PRINCIPAL DEL DASHBOARD ---
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

  // --- Rutas Protegidas Adicionales ---
  {
    path: '/perfil',
    name: 'ProfileView',
    component: () => import('@/views/AdminDashboard/ProfileView.vue'),
    meta: { requiresAuth: true } 
  },

  // --- Rutas del Módulo de Foro ---
  { path: '/foro', name: 'Foro', component: () => import('@/views/Foro/ForumIndex.vue'), meta: { requiresAuth: true } },
  { path: '/foro/:forumId', name: 'ThreadList', component: () => import('@/views/Foro/ThreadList.vue'), meta: { requiresAuth: true }, props: true },
  { path: '/threads/:id', name: 'ThreadView', component: () => import('@/views/Foro/ThreadView.vue'), meta: { requiresAuth: true }, props: true },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);

  if (requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'Acceder' });
  } 
  else if (['Acceder', 'Cadastro'].includes(to.name) && authStore.isAuthenticated) {
    next({ path: '/admin' });
  } 
  else {
    next();
  }
});

export default router;