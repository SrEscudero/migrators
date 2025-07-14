<template>
  <div class="dashboard-container d-flex flex-column h-100">
    <Topbar :is-collapsed="isSidebarCollapsed" @toggle-sidebar="toggleSidebar" />

    <div class="dashboard-body d-flex flex-grow-1">
      <Sidebar
        ref="sidebarRef"
        :menu-items="menuItems"
        :is-collapsed="isSidebarCollapsed"
        @select-option="selectOption"
        @toggle-sidebar="toggleSidebar"
        @set-sidebar-collapsed="setSidebarCollapsedState"
      />
      <main ref="mainContentRef" :class="['main-content', { collapsed: isSidebarCollapsed }]">
        <div class="content-wrapper">
          <transition name="section-fade" mode="out-in">
            <div :key="currentView" class="content-section-container">

              <section v-if="currentView === VIEW_OPTIONS.ESTADISTICAS" class="content-section card-style">
                <Estadisticas />
              </section>

              <section v-else-if="currentView === VIEW_OPTIONS.CLIENTES" class="content-section card-style">
                <GestionClientes />
              </section>

              <section v-else-if="currentView === VIEW_OPTIONS.FUNCIONARIOS" class="content-section card-style">
                <GestionFuncionarios />
              </section>

              <section v-else-if="currentView === VIEW_OPTIONS.PUBLICAR" class="content-section card-style">
                <h3 class="section-header">
                  <i :class="noticiaEnEdicion.id ? 'fas fa-edit me-2' : 'fas fa-plus-circle me-2'"></i>
                  {{ noticiaEnEdicion.id ? 'Editar Noticia' : 'Crear Nueva Noticia' }}
                </h3>
                <NoticiaForm
                    ref="noticiaFormComponentRef"
                    :noticia="noticiaEnEdicion"
                    @submit="submitNoticia"
                    @save-draft="handleSaveDraft"
                    @reset="resetNoticiaForm"
                    @update:imageUrl="handleImageUpload"
                />
              </section>

              <section v-else-if="currentView === VIEW_OPTIONS.LISTAR" class="content-section card-style">
                <h3 class="section-header"><i class="fas fa-list-alt me-2"></i>Listado de Noticias</h3>
                <div v-if="isLoadingNoticias" class="loading-placeholder text-center py-5">
                  <div class="spinner-border" role="status">
                    <span class="visually-hidden">Cargando noticias...</span>
                  </div>
                  <p class="mt-2 text-muted">Cargando noticias...</p>
                </div>
                <NoticiasTable
                    v-else
                    :noticias="listaNoticias"
                    :loading="isLoadingNoticias"
                    @add="handleAddNewNoticiaFromTable"
                    @edit="handleEditNoticiaFromTable"
                    @delete="confirmDeleteNoticia"
                    @bulk-delete="confirmDeleteNoticiasMultiples"
                    @publish-draft="confirmPublishDraft"
                    @feature="toggleNewsFeature"
                    @view="handleViewNoticiaModal"
                />
              </section>

              <section v-else-if="currentView" class="content-section card-style">
                <h3 class="section-header"><i class="fas fa-exclamation-triangle me-2"></i>Vista no encontrada</h3>
                <p>La opción seleccionada no corresponde a una vista válida.</p>
              </section>
              <div v-else class="loading-placeholder text-center py-5">
                  <div class="spinner-border" role="status"></div>
              </div>
            </div>
          </transition>

          <div v-if="noticiaParaVer" class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.6);">
            <div class="modal-dialog modal-xl modal-dialog-scrollable modal-dialog-centered">
              <div class="modal-content">
                <div class="modal-header">
                  <h5 class="modal-title fw-bold"><i class="fas fa-eye me-2"></i>{{ noticiaParaVer.titulo }}</h5>
                  <button type="button" class="btn-close" @click="noticiaParaVer = null" aria-label="Close"></button>
                </div>
                <div class="modal-body" v-html="sanitizeHTML(renderMarkdown(noticiaParaVer.contenido))">
                </div>
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
  </div>
</template>

<script setup>
// Imports de Vue y librerías
import { ref, onMounted, watch, reactive, computed } from "vue";
import Swal from "sweetalert2";
import DOMPurify from "dompurify";
import MarkdownIt from "markdown-it";

// Stores de Pinia
import { useAuthStore } from '@/stores/authStore';
import { useNewsStore } from '@/stores/newsStore';
import { storeToRefs } from 'pinia';

// Componentes
import Topbar from "../components/AdminDashboard/Topbar.vue";
import Sidebar from "../components/AdminDashboard/Sidebar.vue";
import Estadisticas from "../components/AdminDashboard/Estadisticas.vue";
import GestionClientes from "./AdminDashboard/GestionClientes.vue";
import GestionFuncionarios from "./AdminDashboard/GestionFuncionarios.vue";
import NoticiaForm from "../components/AdminDashboard/NoticiasForm.vue";
import NoticiasTable from "../components/AdminDashboard/NoticiasTable.vue";

// --- STORES ---
const authStore = useAuthStore();
const { user } = storeToRefs(authStore);

const newsStore = useNewsStore();
const {
  noticias: listaNoticias, noticiaEnEdicion, isLoading: isLoadingNoticias
} = storeToRefs(newsStore);
const {
  fetchNoticias, selectNoticiaForEdit, resetNoticiaForm,
  saveNoticia, deleteNoticia, setEditingNewsImageUrl, publishDraft, deleteMultipleNoticias, toggleNewsFeature
} = newsStore;

// --- ESTADO LOCAL DEL COMPONENTE ---
const sidebarRef = ref(null);
const mainContentRef = ref(null);
const noticiaFormComponentRef = ref(null);
const noticiaParaVer = ref(null);
const VIEW_OPTIONS = { ESTADISTICAS: "estadisticas", LISTAR: "listar", PUBLICAR: "publicar", CLIENTES: "clientes", FUNCIONARIOS: "funcionarios" };

// --- LÓGICA DE NAVEGACIÓN Y MENÚ ---
const menuItems = computed(() => {
  const items = [];
  const currentUser = user.value;
  if (!currentUser) return [];

  if (currentUser.rol === 'ceo' || currentUser.perm_ver_estadisticas) items.push({ text: "Estadísticas", action: VIEW_OPTIONS.ESTADISTICAS, icon: "fas fa-chart-line" });
  if (currentUser.rol === 'ceo' || currentUser.perm_gestionar_clientes) items.push({ text: "Gestión de Clientes", action: VIEW_OPTIONS.CLIENTES, icon: "fas fa-users" });
  if (currentUser.rol === 'ceo') items.push({ text: "Gestión de Funcionarios", action: VIEW_OPTIONS.FUNCIONARIOS, icon: "fas fa-user-shield" });
  if (currentUser.rol === 'ceo' || currentUser.perm_publicar_noticias) {
    items.push({ text: "Listar Noticias", action: VIEW_OPTIONS.LISTAR, icon: "fas fa-list-alt" });
    items.push({ text: "Crear Noticia", action: VIEW_OPTIONS.PUBLICAR, icon: "fas fa-plus-circle" });
  }

  items.push({
    text: "Foro de la Comunidad",
    icon: "fas fa-comments",
    isRoute: true,
    route: '/foro'
  });

  return items;
});

const currentView = ref(null);
watch(menuItems, (newMenu) => {
  if (newMenu.length > 0 && !newMenu.some(item => item.action === currentView.value)) {
    currentView.value = newMenu[0].action;
  } else if (newMenu.length === 0) {
    currentView.value = null;
  }
}, { immediate: true });

const selectOption = (optionKey) => {
  currentView.value = optionKey;
};

// --- LÓGICA DEL SIDEBAR ---
const isSidebarCollapsed = ref(window.innerWidth < 992);
watch(isSidebarCollapsed, (newValue) => localStorage.setItem("sidebarCollapsed", JSON.stringify(newValue)));
const toggleSidebar = () => isSidebarCollapsed.value = !isSidebarCollapsed.value;
const setSidebarCollapsedState = (state) => isSidebarCollapsed.value = state;

// --- MANEJADORES DE EVENTOS ---
const submitNoticia = async (noticiaData) => {
  const success = await saveNoticia(noticiaData, true);
  if (success) {
    currentView.value = VIEW_OPTIONS.LISTAR;
    resetNoticiaForm();
  }
};
const handleSaveDraft = async (draftData) => {
  const success = await saveNoticia(draftData, false);
  if (success) {
    currentView.value = VIEW_OPTIONS.LISTAR;
    resetNoticiaForm();
  }
};
const handleEditNoticiaFromTable = (noticiaToEdit) => {
  selectNoticiaForEdit(noticiaToEdit);
  currentView.value = VIEW_OPTIONS.PUBLICAR;
};
const handleEditNoticiaFromModal = (noticiaToEdit) => {
  if (noticiaParaVer.value) noticiaParaVer.value = null;
  handleEditNoticiaFromTable(noticiaToEdit);
};
const handleAddNewNoticiaFromTable = () => {
  resetNoticiaForm();
  currentView.value = VIEW_OPTIONS.PUBLICAR;
};
const confirmDeleteNoticia = (id) => {
  Swal.fire({
    title: '¿Estás seguro?', text: "Esta acción no se puede deshacer.", icon: 'warning',
    showCancelButton: true, confirmButtonColor: '#d33', cancelButtonText: 'Cancelar', confirmButtonText: 'Sí, eliminar',
  }).then((result) => { if (result.isConfirmed) { deleteNoticia(id); } });
};

// *** MÉTODO QUE MANEJA EL EVENTO DE LA TABLA ***
const confirmDeleteNoticiasMultiples = (ids) => {
  if (!ids || ids.length === 0) {
    Swal.fire("Atención", "No hay noticias seleccionadas.", "info");
    return;
  }
  Swal.fire({
    title: `¿Eliminar ${ids.length} noticias?`,
    text: "Esta acción no se puede deshacer.",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#6c757d',
    confirmButtonText: 'Sí, eliminar todas',
    cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.isConfirmed) {
      // Llama a la acción del store para eliminar las noticias
      deleteMultipleNoticias(ids);
    }
  });
};

const confirmPublishDraft = (id) => {
  const noticia = listaNoticias.value.find(n => n.id === id);
  Swal.fire({
      title: `¿Publicar "${noticia?.titulo || 'noticia'}"?`, text: "La noticia se hará visible.", icon: 'info',
      showCancelButton: true, confirmButtonColor: '#28a745', cancelButtonText: 'Cancelar', confirmButtonText: 'Sí, publicar',
  }).then((result) => { if (result.isConfirmed) { publishDraft(id); } });
};
const handleImageUpload = (url) => {
  setEditingNewsImageUrl(url);
};
const handleViewNoticiaModal = (noticia) => {
    noticiaParaVer.value = noticia;
};

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
  height: 100vh;
  overflow: hidden;
  background-color: #f8f9fa; /* Color de fondo general para el área del dashboard */
}

.dashboard-body {
  overflow: hidden;
  position: relative;
}

.main-content {
  flex-grow: 1;
  /* La altura ahora será 100% del contenedor .dashboard-body */
  height: 100%; 
  overflow-y: auto; /* Mantenemos el scroll interno */
  transition: margin-left 0.3s ease-in-out;
  /* Añadimos padding-top para dejar espacio para el Topbar */
  padding: calc(var(--topbar-height) + 1.5rem) 1.5rem 1.5rem 1.5rem;
}

@media (min-width: 768px) {
  .main-content {
    margin-left: 260px;
  }
  .main-content.collapsed {
    margin-left: 80px;
  }
}

@media (max-width: 767.98px) {
  .main-content,
  .main-content.collapsed {
    margin-left: 0;
    padding: 1rem;
  }
}

.content-wrapper {
  max-width: 1400px; /* Ancho máximo para el contenido para que no se estire demasiado */
  margin: 0 auto;
}

.content-section {
  padding: 1.5rem;
  background-color: #ffffff;
  border-radius: 0.75rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}

.section-header {
  font-size: 1.5rem;
  font-weight: 600;
  color: #343a40;
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #e9ecef;
}

/* Transiciones */
.section-fade-enter-active,
.section-fade-leave-active {
  transition: opacity 0.2s ease;
}
.section-fade-enter-from,
.section-fade-leave-to {
  opacity: 0;
}

/* Estilos para el modal y placeholders */
.modal-content {
  border-radius: 0.5rem;
  border: none;
}
.modal-header {
  border-bottom: none;
}
.modal-body {
  line-height: 1.7;
}
.loading-placeholder {
  min-height: 400px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #6c757d;
}



</style>