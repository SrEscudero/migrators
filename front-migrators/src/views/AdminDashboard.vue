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
                    @bulk-delete="() => {}"
                    @publish-draft="confirmPublishDraft"
                    @feature="() => {}" 
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
                <div class="modal-body">
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
  saveNoticia, deleteNoticia, setEditingNewsImageUrl, publishDraft, deleteMultipleNoticias 
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

    // --- AÑADE ESTE NUEVO ÍTEM PARA EL FORO ---
  items.push({ 
    text: "Foro de la Comunidad", 
    icon: "fas fa-comments",
    isRoute: true,       // <-- Propiedad especial
    route: '/foro'       // <-- La ruta de Vue Router a la que queremos ir
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
      deleteMultipleNoticias(ids); // Llama a la acción del store
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
const formatAdminDate = (dateString) => {
  if (!dateString) return "N/A";
  return new Intl.DateTimeFormat('es-ES', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(dateString));
};
const getStatusBadgeClass = (status) => ({ publicado: "bg-success-subtle text-success-emphasis", borrador: "bg-warning-subtle text-warning-emphasis", archivado: "bg-secondary-subtle text-secondary-emphasis" }[status] || "bg-light text-dark");
const getStatusText = (status) => ({ publicado: "Publicada", borrador: "Borrador", archivado: "Archivada" }[status] || "Desconocido");

// --- HOOKS ---
onMounted(() => {
  fetchNoticias();
});
</script>

<style scoped>
.dashboard-container {
  height: 100vh;
  overflow: hidden;
}

.dashboard-body {
  overflow: hidden;
  position: relative;
}

.main-content {
  flex-grow: 1;
  padding-top: 60px;
  overflow-y: auto;
  transition: margin-left 0.3s ease-in-out, width 0.3s ease-in-out;
  position: relative;
}

@media (min-width: 992px) {
  .main-content {
    margin-left: 260px;
  }

  .main-content.collapsed {
    margin-left: 80px;
  }
}

@media (max-width: 991.98px) {
  .main-content,
  .main-content.collapsed {
    margin-left: 0;
  }
}

.modal-backdrop.show {
  z-index: 1040;
}

.modal-view-news {
  z-index: 1050;
}

.modal-content {
  border-radius: 0.5rem;
  border: none;
  box-shadow: 0 5px 25px rgba(0, 0, 0, 0.15);
}

.modal-header {
  background-color: #0d6efd;
  color: white;
  border-bottom: none;
  padding: 1rem 1.5rem;
}

.modal-header .btn-close {
  filter: invert(1) grayscale(100%) brightness(200%);
}

.modal-title {
  font-size: 1.25rem;
}

.modal-body {
  padding: 1.5rem;
  line-height: 1.6;
}

.modal-body p {
  margin-bottom: 0.8rem;
  color: #6c757d;
}

.modal-body p strong {
  color: #343a40;
}

.modal-body p strong i.text-primary {
  color: #0d6efd !important;
}

.modal-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #dee2e6;
}

.badge.fs-0-9rem {
  font-size: 0.9rem;
  padding: 0.4em 0.7em;
}

.markdown-content img {
  max-width: 100%;
  height: auto;
  border-radius: 0.3rem;
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.05);
}

.markdown-content p {
  color: #343a40;
}
</style>