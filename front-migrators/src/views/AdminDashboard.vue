<template>
  <div class="dashboard-container">
    <Topbar
      :is-collapsed="isSidebarCollapsed"
      @toggle-sidebar="toggleSidebar"
    />
    <Sidebar
      :menu-items="menuItems"
      :is-collapsed="isSidebarCollapsed"
      @toggle-sidebar="toggleSidebar"
      @set-sidebar-collapsed="setSidebarCollapsedState"
    />

    <main ref="mainContentRef" :class="['main-content', { collapsed: isSidebarCollapsed }]">
      <div class="content-wrapper">

        <div v-if="$route.name === 'AdminNoticias'" class="content-section-container">
          <section class="content-section card-style">
            <h3 class="section-header">
              <i :class="noticiaEnEdicion.id ? 'fas fa-edit me-2' : 'fas fa-plus-circle me-2'"></i>
              {{ noticiaEnEdicion.id ? 'Editar Noticia' : 'Crear Nueva Noticia' }}
            </h3>
            <NoticiaForm
              :noticia="noticiaEnEdicion"
              @submit="submitNoticia"
              @save-draft="handleSaveDraft"
              @reset="resetNoticiaForm"
              @update:imageUrl="handleImageUpload"
            />
          </section>

          <section class="content-section card-style mt-4">
            <NoticiasTable
              :noticias="listaNoticias"
              :loading="isLoadingNoticias"
              @edit="handleEditNoticiaFromTable"
              @delete="confirmDeleteNoticia"
              @bulk-delete="confirmDeleteNoticiasMultiples"
              @publish-draft="confirmPublishDraft"
              @feature="toggleNewsFeature"
              @view="handleViewNoticiaModal"
            />
          </section>
        </div>

        <router-view v-else v-slot="{ Component }">
          <transition name="section-fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>

        <div v-if="noticiaParaVer" class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.6);">
          <div class="modal-dialog modal-xl modal-dialog-scrollable modal-dialog-centered">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title fw-bold"><i class="fas fa-eye me-2"></i>{{ noticiaParaVer.titulo }}</h5>
                <button type="button" class="btn-close" @click="noticiaParaVer = null" aria-label="Close"></button>
              </div>
              <div class="modal-body" v-html="sanitizeHTML(renderMarkdown(noticiaParaVer.contenido))"></div>
              <div class="modal-footer bg-light-subtle">
                <button type="button" class="btn btn-outline-secondary" @click="noticiaParaVer = null"><i class="fas fa-times me-2"></i>Cerrar</button>
                <button type="button" class="btn btn-primary" @click="handleEditNoticiaFromModal(noticiaParaVer)"><i class="fas fa-edit me-2"></i>Editar Noticia</button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from "vue";
import { useRouter, useRoute } from 'vue-router';
import Swal from "sweetalert2";
import DOMPurify from "dompurify";
import MarkdownIt from "markdown-it";

import { useAuthStore } from '@/stores/authStore';
import { useNewsStore } from '@/stores/newsStore';
import { storeToRefs } from 'pinia';

import Topbar from "@/components/AdminDashboard/Topbar.vue";
import Sidebar from "@/components/AdminDashboard/Sidebar.vue";
import NoticiaForm from "@/components/AdminDashboard/NoticiasForm.vue";
import NoticiasTable from "@/components/AdminDashboard/NoticiasTable.vue";

// --- STORES Y ROUTER ---
const authStore = useAuthStore();
const { user } = storeToRefs(authStore);
const newsStore = useNewsStore();
const { noticias: listaNoticias, noticiaEnEdicion, isLoading: isLoadingNoticias } = storeToRefs(newsStore);
const { fetchNoticias, selectNoticiaForEdit, resetNoticiaForm, saveNoticia, deleteNoticia, setEditingNewsImageUrl, publishDraft, deleteMultipleNoticias, toggleNewsFeature } = newsStore;
const router = useRouter();
const route = useRoute();

// --- ESTADO LOCAL DEL COMPONENTE ---
const isSidebarCollapsed = ref(window.innerWidth < 992);
const noticiaParaVer = ref(null);

// --- LÓGICA DE NAVEGACIÓN Y MENÚ (ACTUALIZADA) ---
const menuItems = computed(() => {
  const items = [];
  const currentUser = user.value;
  if (!currentUser) return [];

  if (currentUser.rol === 'ceo' || currentUser.perm_ver_estadisticas) items.push({ text: "Estadísticas", routeName: 'AdminEstadisticas', icon: "fas fa-chart-line" });
  if (currentUser.rol === 'ceo' || currentUser.perm_gestionar_clientes) items.push({ text: "Gestión de Clientes", routeName: 'AdminClientes', icon: "fas fa-users" });
  if (currentUser.rol === 'ceo') {
    items.push({ text: "Gestión de Funcionarios", routeName: 'AdminFuncionarios', icon: "fas fa-user-shield" });
    items.push({ text: "Análisis de Visitantes", routeName: 'AdminVisitantes', icon: "fas fa-chart-area" });
  }
  if (currentUser.rol === 'ceo' || currentUser.perm_publicar_noticias) {
    items.push({ text: "Gestión de Noticias", routeName: 'AdminNoticias', icon: "fas fa-newspaper" });
  }
  items.push({ text: "Foro de la Comunidad", isRoute: true, route: '/foro', icon: "fas fa-comments" });
  return items;
});

// --- LÓGICA DEL SIDEBAR ---
watch(isSidebarCollapsed, (newValue) => localStorage.setItem("sidebarCollapsed", JSON.stringify(newValue)));
const toggleSidebar = () => isSidebarCollapsed.value = !isSidebarCollapsed.value;
const setSidebarCollapsedState = (state) => isSidebarCollapsed.value = state;

// --- MANEJADORES DE EVENTOS ---
const submitNoticia = async (noticiaData) => { await saveNoticia(noticiaData, true); };
const handleSaveDraft = async (draftData) => { await saveNoticia(draftData, false); };

const handleEditNoticiaFromTable = (noticiaToEdit) => {
  selectNoticiaForEdit(noticiaToEdit);
  if (route.name !== 'AdminNoticias') {
    router.push({ name: 'AdminNoticias' });
  }
};

const handleEditNoticiaFromModal = (noticiaToEdit) => {
  if (noticiaParaVer.value) noticiaParaVer.value = null;
  handleEditNoticiaFromTable(noticiaToEdit);
};

const confirmDeleteNoticia = (id) => {
  Swal.fire({ title: '¿Estás seguro?', text: "Esta acción no se puede deshacer.", icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33', cancelButtonText: 'Cancelar', confirmButtonText: 'Sí, eliminar' }).then((result) => { if (result.isConfirmed) { deleteNoticia(id); } });
};

const confirmDeleteNoticiasMultiples = (ids) => {
  if (!ids || ids.length === 0) return Swal.fire("Atención", "No hay noticias seleccionadas.", "info");
  Swal.fire({ title: `¿Eliminar ${ids.length} noticias?`, text: "Esta acción no se puede deshacer.", icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33', cancelButtonText: 'Cancelar', confirmButtonText: 'Sí, eliminar todas' }).then((result) => { if (result.isConfirmed) { deleteMultipleNoticias(ids); } });
};

const confirmPublishDraft = (id) => {
  const noticia = listaNoticias.value.find(n => n.id === id);
  Swal.fire({ title: `¿Publicar "${noticia?.titulo || 'noticia'}"?`, text: "La noticia se hará visible.", icon: 'info', showCancelButton: true, confirmButtonColor: '#28a745', cancelButtonText: 'Cancelar', confirmButtonText: 'Sí, publicar' }).then((result) => { if (result.isConfirmed) { publishDraft(id); } });
};

const handleImageUpload = (url) => setEditingNewsImageUrl(url);
const handleViewNoticiaModal = (noticia) => noticiaParaVer.value = noticia;

// --- UTILIDADES ---
const md = new MarkdownIt({ html: true, linkify: true, typographer: true });
const sanitizeHTML = (html) => DOMPurify.sanitize(html, { USE_PROFILES: { html: true } });
const renderMarkdown = (content) => md.render(content || "");

// --- HOOKS ---
onMounted(() => {
  fetchNoticias();
});
</script>

<style scoped>
.dashboard-container {
  background-color: var(--color-background);
  /* Ya no necesita ser un contenedor flexbox */
}

/* El estilo clave para el contenido principal */
.main-content {
  /* Separación para dejar espacio al Topbar y Sidebar fijos */
  margin-top: var(--topbar-height);
  margin-left: var(--sidebar-width);
  
  /* Calculamos el alto y ancho para que ocupe exactamente el espacio restante */
  height: calc(100vh - var(--topbar-height));
  width: calc(100% - var(--sidebar-width));

  overflow-y: auto; /* Habilitamos el scroll solo para el área de contenido */
  padding: 1.5rem;
  transition: margin-left 0.3s ease, width 0.3s ease; /* Añadimos width a la transición */
}

/* Ajustes cuando el sidebar está colapsado */
.main-content.collapsed {
  margin-left: var(--sidebar-collapsed-width);
  width: calc(100% - var(--sidebar-collapsed-width));
}

.content-wrapper {
  margin: 0 auto;
}

/* Estilos para móvil donde el sidebar se oculta */
@media (max-width: 767.98px) {
  .main-content,
  .main-content.collapsed {
    margin-left: 0;
    width: 100%;
    padding: 1rem;
    padding-top: calc(var(--topbar-height) + 1rem); /* En móvil, el topbar sigue fijo pero el sidebar no */
    height: calc(100vh - var(--topbar-height));
  }
}

/* ... Estilos para transiciones y modales (se mantienen igual) ... */
.section-fade-enter-active,
.section-fade-leave-active {
  transition: opacity 0.2s ease;
}
.section-fade-enter-from,
.section-fade-leave-to {
  opacity: 0;
}
</style>