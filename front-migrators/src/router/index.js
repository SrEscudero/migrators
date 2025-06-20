import { createRouter, createWebHistory } from 'vue-router';
import Inicio from '@/views/inicio.vue';
import SobreNosotros from '@/views/sobre-nosotros.vue';
import Noticias from '@/views/noticias.vue';
import AdminDashboard from '@/views/AdminDashboard.vue';
import LoginView from '../views/LoginView.vue';
import RegisterView from '../views/RegisterView.vue'; 
import { useAuthStore } from '@/stores/authStore'; // Importa el store

const routes = [
  {
    path: '/',
    name: 'Inicio',
    component: Inicio,
  },
  {
    path: "/acceder",
    name: "Acceder", // Este es el nombre correcto
    component: LoginView,
  },
  {
    path: "/cadastro",
    name: "Cadastro",
    component: RegisterView,
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
  {
    path: '/admin',
    name: 'AdminDashboard',
    component: AdminDashboard,
    meta: { requiresAuth: true } // Correcto: Ruta protegida
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// --- GUARDIA DE NAVEGACIÓN CORREGIDO ---
router.beforeEach((to, from, next) => {
  // El store se instancia aquí adentro para asegurar que Pinia ya esté activo.
  const authStore = useAuthStore();

  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);

  // Si la ruta requiere autenticación y el usuario no está logueado
  if (requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'Acceder' });
  } 
  // Si el usuario está logueado e intenta ir a la página de login
  else if (to.name === 'Acceder' && authStore.isAuthenticated) {
    // Lo redirigimos a su panel correspondiente
    if (authStore.isAdmin) {
      next({ name: 'AdminDashboard' });
    } else {
      next({ name: 'Inicio' }); // O a un dashboard de cliente si existiera
    }
  } 
  // En cualquier otro caso, permite la navegación
  else {
    next();
  }
});

export default router;