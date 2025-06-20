<template>
  <div class="noticias-table-container">
    <div class="controls-section">
      <div class="filter-controls">
        <div class="search-bar-wrapper">
          <div class="input-group search-bar">
            <span class="input-group-text">
              <i class="fas fa-search"></i>
            </span>
            <input type="text" class="form-control"
              placeholder="Buscar por título, autor..." v-model="searchQuery" @input="handleSearchInput"
              aria-label="Buscar noticias" />
          </div>
        </div>
        <div class="status-filter-wrapper">
          <select class="form-select" v-model="statusFilter" @change="resetPage" aria-label="Filtrar por estado">
            <option :value="STATUS_FILTER_OPTIONS.ALL">Todos los estados</option>
            <option :value="STATUS_FILTER_OPTIONS.PUBLISHED">Publicadas</option>
            <option :value="STATUS_FILTER_OPTIONS.DRAFT">Borradores</option>
            <option :value="STATUS_FILTER_OPTIONS.ARCHIVED">Archivadas</option>
          </select>
        </div>
        <div class="sort-filter-wrapper">
          <select class="form-select" v-model="sortBy" @change="applySorting" aria-label="Ordenar por">
            <option :value="SORT_BY_OPTIONS.FECHA_DESC">Más recientes primero</option>
            <option :value="SORT_BY_OPTIONS.FECHA_ASC">Más antiguos primero</option>
            <option :value="SORT_BY_OPTIONS.TITULO_ASC">Título (A-Z)</option>
            <option :value="SORT_BY_OPTIONS.TITULO_DESC">Título (Z-A)</option>
          </select>
        </div>
      </div>

      <div class="action-buttons-group">
        <button class="btn btn-primary add-btn" @click="$emit('add')" aria-label="Añadir nueva noticia">
          <i class="fas fa-plus me-md-2"></i><span class="d-none d-md-inline">Nueva Noticia</span>
        </button>
        <button v-if="selectedNoticias.length > 0" class="btn btn-danger bulk-delete-btn" @click="confirmBulkDelete"
          aria-label="Eliminar noticias seleccionadas">
          <i class="fas fa-trash-alt me-md-2"></i><span class="d-none d-md-inline">Eliminar</span> ({{ selectedNoticias.length }})
        </button>
      </div>
    </div>

    <div class="table-info-section">
      <div class="count-info">
        Mostrando {{ showingStart }}-{{ showingEnd }} de {{ filteredNoticias.length }} noticias
        <span v-if="statusFilter !== STATUS_FILTER_OPTIONS.ALL">(Filtradas)</span>
        <span v-if="selectedNoticias.length > 0"> - {{ selectedNoticias.length }} seleccionadas</span>
      </div>
      <div class="page-size-selector">
        <span class="me-2">Mostrar:</span>
        <select class="form-select form-select-sm" v-model="pageSize" @change="resetPage"
          aria-label="Noticias por página">
          <option value="5">5</option>
          <option value="10">10</option>
          <option value="20">20</option>
          <option value="50">50</option>
        </select>
      </div>
    </div>

    <div class="table-responsive-wrapper" :class="{ 'loading-opacity': loading && paginatedNoticias.length > 0 }">
      <table class="table custom-table">
        <thead>
          <tr>
            <th scope="col" style="width: 40px;" class="checkbox-header">
              <input type="checkbox" class="form-check-input"
                :checked="paginatedNoticias.length > 0 && paginatedNoticias.every(n => isSelected(n.id))"
                :indeterminate="selectedNoticias.length > 0 && !paginatedNoticias.every(n => isSelected(n.id)) && paginatedNoticias.some(n => isSelected(n.id))"
                @change="toggleSelectAllPaginated" aria-label="Seleccionar todas las noticias en esta página" />
            </th>
            <th scope="col" @click="sortByColumn('titulo')">
              Título <i class="fas" :class="sortIcon('titulo')"></i>
            </th>
            <th scope="col" class="d-none d-lg-table-cell">Autor</th>
            <th scope="col" @click="sortByColumn('fecha_publicacion')">
              Fecha <i class="fas" :class="sortIcon('fecha_publicacion')"></i>
            </th>
            <th scope="col" class="d-none d-md-table-cell">Estado</th>
            <th scope="col" class="text-center actions-header" style="min-width: 180px;">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="noticia in paginatedNoticias" :key="noticia.id"
            :class="{
              'row-hover': hoveredRow === noticia.id,
              'row-selected': isSelected(noticia.id)
            }"
            @mouseover="hoveredRow = noticia.id"
            @mouseleave="hoveredRow = null">
            <td>
              <input type="checkbox" class="form-check-input" :checked="isSelected(noticia.id)" @change="() => toggleSelect(noticia)"
                :aria-label="`Seleccionar noticia ${noticia.titulo}`" />
            </td>
            <td :title="noticia.titulo" class="titulo-cell">
              {{ noticia.titulo }}
              <span v-if="noticia.destacada" class="badge bg-warning text-dark ms-2">
                <i class="fas fa-star"></i> Dest.
              </span>
            </td>
            <td :title="noticia.autor" class="d-none d-lg-table-cell">{{ noticia.autor }}</td>
            <td>{{ formatDate(noticia.fecha_publicacion) }}</td>
            <td class="d-none d-md-table-cell">
              <span class="badge custom-badge" :class="statusBadgeClass(noticia.estado)">
                {{ statusText(noticia.estado) }}
              </span>
            </td>
            <td class="action-buttons-cell">
              <button class="icon-btn view-btn" @click="$emit('view', noticia)" title="Ver detalles" aria-label="Ver detalles">
                <i class="fas fa-eye"></i>
              </button>
              <button class="icon-btn edit-btn" @click="$emit('edit', noticia)" title="Editar" aria-label="Editar">
                <i class="fas fa-edit"></i>
              </button>
              <button v-if="noticia.estado === STATUS_FILTER_OPTIONS.DRAFT" class="icon-btn publish-btn"
                @click="$emit('publish-draft', noticia.id)" title="Publicar Borrador" aria-label="Publicar Borrador">
                <i class="fas fa-upload"></i>
              </button>
              <button class="icon-btn delete-btn" @click="confirmDelete(noticia)" title="Eliminar" aria-label="Eliminar">
                <i class="fas fa-trash-alt"></i>
              </button>
              <button class="icon-btn feature-btn" @click="toggleFeatured(noticia)"
                :title="noticia.destacada ? 'Quitar de destacados' : 'Destacar'"
                :aria-label="noticia.destacada ? 'Quitar de destacados' : 'Destacar'"
                :class="{ 'featured': noticia.destacada }">
                <i class="fas fa-star"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="!loading && filteredNoticias.length === 0" class="no-results-placeholder">
      <i class="fas fa-inbox fa-3x mb-3"></i>
      <h5>No se encontraron noticias</h5>
      <p>Intenta ajustar tus filtros de búsqueda o crea una nueva.</p>
      <button class="btn btn-outline-primary" @click="resetFilters">
        <i class="fas fa-redo me-2"></i>Restablecer filtros
      </button>
    </div>

    <div v-if="loading && paginatedNoticias.length === 0" class="loading-placeholder">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Cargando...</span>
      </div>
      <p class="mt-2">Cargando noticias...</p>
    </div>

    <nav aria-label="Paginación" class="pagination-wrapper mt-4" v-if="filteredNoticias.length > 0 && totalPages > 1">
      <ul class="pagination justify-content-center flex-wrap">
        <li class="page-item" :class="{ disabled: currentPage === 1 }">
          <button class="page-link" @click="prevPage" aria-label="Página anterior">
            <i class="fas fa-chevron-left"></i>
          </button>
        </li>
        <li class="page-item" :class="{ active: 1 === currentPage }"
          v-if="totalPages > 1 && currentPage > 2 && !visiblePages.includes(1)">
          <button class="page-link" @click="changePage(1)" aria-label="Ir a página 1">1</button>
        </li>
        <li class="page-item disabled"
          v-if="currentPage > 3 && totalPages > 4 && !visiblePages.includes(1) && !visiblePages.includes(2)">
          <span class="page-link">...</span>
        </li>
        <li v-for="page in visiblePages" :key="page" class="page-item" :class="{ active: page === currentPage }">
          <button class="page-link" @click="changePage(page)" :aria-label="`Ir a página ${page}`"> {{ page }} </button>
        </li>
        <li class="page-item disabled"
          v-if="currentPage < totalPages - 2 && totalPages > 4 && !visiblePages.includes(totalPages) && !visiblePages.includes(totalPages-1)">
          <span class="page-link">...</span>
        </li>
        <li class="page-item" :class="{ active: totalPages === currentPage }"
          v-if="totalPages > 1 && currentPage < totalPages -1 && !visiblePages.includes(totalPages)">
          <button class="page-link" @click="changePage(totalPages)" :aria-label="`Ir a página ${totalPages}`">{{ totalPages }}</button>
        </li>
        <li class="page-item" :class="{ disabled: currentPage === totalPages }">
          <button class="page-link" @click="nextPage" aria-label="Página siguiente">
            <i class="fas fa-chevron-right"></i>
          </button>
        </li>
      </ul>
    </nav>
  </div>
</template>

<script>
import { debounce } from 'lodash-es';
import Swal from "sweetalert2";

const STATUS_FILTER_OPTIONS = Object.freeze({
  ALL: "all",
  PUBLISHED: "publicado", // Assuming 'publicado' is the value used in noticia.estado
  DRAFT: "borrador",
  ARCHIVED: "archivado",
});

const SORT_BY_OPTIONS = Object.freeze({
  FECHA_DESC: "fecha_desc",
  FECHA_ASC: "fecha_asc",
  TITULO_ASC: "titulo_asc",
  TITULO_DESC: "titulo_desc",
});

export default {
  name: 'NoticiasTable',
  props: {
    noticias: {
      type: Array,
      required: true,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  emits: ['add', 'view', 'edit', 'delete', 'bulk-delete', 'feature', 'publish-draft'],
  data() {
    return {
      hoveredRow: null,
      searchQuery: "",
      statusFilter: STATUS_FILTER_OPTIONS.ALL,
      currentPage: 1,
      pageSize: 10,
      sortBy: SORT_BY_OPTIONS.FECHA_DESC,
      sortDirection: "desc",
      sortField: "fecha_publicacion",
      selectedNoticias: [], // Stores full noticia objects
      STATUS_FILTER_OPTIONS, // Expose to template
      SORT_BY_OPTIONS      // Expose to template
    };
  },
  computed: {
    filteredNoticias() {
      const query = this.searchQuery.toLowerCase().trim();
      const status = this.statusFilter;

      let tempNoticias = this.noticias.filter(noticia => {
        const matchesSearch = !query ||
          noticia.titulo?.toLowerCase().includes(query) ||
          noticia.autor?.toLowerCase().includes(query) ||
          noticia.contenido?.toLowerCase().includes(query);

        const matchesStatus = status === STATUS_FILTER_OPTIONS.ALL || noticia.estado === status;
        return matchesSearch && matchesStatus;
      });

      tempNoticias.sort((a, b) => {
        if (a.destacada && !b.destacada) return -1;
        if (!a.destacada && b.destacada) return 1;

        let fieldA = a[this.sortField];
        let fieldB = b[this.sortField];

        if (this.sortField === 'fecha_publicacion' || this.sortField === 'fecha_expiracion') {
          fieldA = fieldA ? new Date(fieldA).getTime() : 0;
          fieldB = fieldB ? new Date(fieldB).getTime() : 0;
        } else if (typeof fieldA === 'string') {
          fieldA = fieldA.toLowerCase();
          fieldB = fieldB.toLowerCase();
        }

        if (fieldA < fieldB) return this.sortDirection === 'asc' ? -1 : 1;
        if (fieldA > fieldB) return this.sortDirection === 'asc' ? 1 : -1;
        return 0;
      });

      return tempNoticias;
    },
    paginatedNoticias() {
      const start = (this.currentPage - 1) * parseInt(this.pageSize);
      const end = start + parseInt(this.pageSize);
      return this.filteredNoticias.slice(start, end);
    },
    totalPages() {
      if (this.filteredNoticias.length === 0) return 1;
      return Math.ceil(this.filteredNoticias.length / parseInt(this.pageSize));
    },
    showingStart() {
      if (this.filteredNoticias.length === 0) return 0;
      return (this.currentPage - 1) * parseInt(this.pageSize) + 1;
    },
    showingEnd() {
      if (this.filteredNoticias.length === 0) return 0;
      const end = this.currentPage * parseInt(this.pageSize);
      return end > this.filteredNoticias.length ? this.filteredNoticias.length : end;
    },
    visiblePages() {
      const pages = [];
      const range = 1; // How many pages to show around current page
      const total = this.totalPages;
      const current = this.currentPage;
      if (total <= 1) return [];

      let start = Math.max(1, current - range);
      let end = Math.min(total, current + range);

      // Adjust start/end if current page is near beginning or end
      if (current <= range + 1) { // Near the beginning
        end = Math.min(1 + (range * 2), total);
      }
      if (current >= total - range) { // Near the end
        start = Math.max(1, total - (range * 2));
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      return pages;
    }
  },
  methods: {
    formatDate(dateString) {
      if (!dateString) return 'N/A';
      try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Fecha Inválida';
        return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
      } catch (e) {
        return 'Error Fecha';
      }
    },
    statusBadgeClass(status) {
      // These could also be custom classes styled with CSS variables
      return {
        [STATUS_FILTER_OPTIONS.PUBLISHED]: 'bg-success text-white',
        [STATUS_FILTER_OPTIONS.DRAFT]: 'bg-warning text-dark',
        [STATUS_FILTER_OPTIONS.ARCHIVED]: 'bg-secondary text-white'
      }[status] || 'bg-light text-dark';
    },
    statusText(status) {
      return {
        [STATUS_FILTER_OPTIONS.PUBLISHED]: 'Publicada',
        [STATUS_FILTER_OPTIONS.DRAFT]: 'Borrador',
        [STATUS_FILTER_OPTIONS.ARCHIVED]: 'Archivada'
      }[status] || status?.charAt(0).toUpperCase() + status?.slice(1) || 'Desconocido';
    },
    confirmDelete(noticia) {
      Swal.fire({
        title: '¿Estás seguro?',
        html: `¿Deseas eliminar la noticia "<strong>${noticia.titulo}</strong>"?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: 'var(--app-danger, #dc3545)',
        cancelButtonColor: 'var(--app-secondary, #6c757d)',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
        customClass: {
          popup: 'swal-popup-custom',
          confirmButton: 'swal-button-custom',
          cancelButton: 'swal-button-custom'
        }
      }).then((result) => {
        if (result.isConfirmed) {
          this.$emit('delete', noticia.id);
        }
      });
    },
    confirmBulkDelete() {
      if (this.selectedNoticias.length === 0) return;
      Swal.fire({
        title: '¿Estás seguro?',
        text: `¿Deseas eliminar ${this.selectedNoticias.length} noticias seleccionadas? Esta acción no se puede deshacer.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: 'var(--app-danger, #dc3545)',
        cancelButtonColor: 'var(--app-secondary, #6c757d)',
        confirmButtonText: 'Sí, eliminar todas',
        cancelButtonText: 'Cancelar',
         customClass: {
          popup: 'swal-popup-custom',
          confirmButton: 'swal-button-custom',
          cancelButton: 'swal-button-custom'
        }
      }).then((result) => {
        if (result.isConfirmed) {
          const ids = this.selectedNoticias.map(n => n.id);
          this.$emit('bulk-delete', ids);
          this.selectedNoticias = [];
        }
      });
    },
    toggleFeatured(noticia) {
      this.$emit('feature', { id: noticia.id, destacada: !noticia.destacada });
      // Feedback should be handled by parent after successful API call
    },
    changePage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
        // Deselect items from other pages when page changes
        // this.selectedNoticias = this.selectedNoticias.filter(sn => this.paginatedNoticias.some(pn => pn.id === sn.id));
      }
    },
    prevPage() {
      if (this.currentPage > 1) this.changePage(this.currentPage - 1);
    },
    nextPage() {
      if (this.currentPage < this.totalPages) this.changePage(this.currentPage + 1);
    },
    resetPage() {
      this.currentPage = 1;
    },
    resetFilters() {
      this.searchQuery = '';
      this.statusFilter = STATUS_FILTER_OPTIONS.ALL;
      this.sortBy = SORT_BY_OPTIONS.FECHA_DESC; // Reset to default sort
      this.applySorting(); // This will also call resetPage
      this.selectedNoticias = [];
    },
    applySorting() {
      switch (this.sortBy) {
        case SORT_BY_OPTIONS.FECHA_DESC: this.sortField = 'fecha_publicacion'; this.sortDirection = 'desc'; break;
        case SORT_BY_OPTIONS.FECHA_ASC: this.sortField = 'fecha_publicacion'; this.sortDirection = 'asc'; break;
        case SORT_BY_OPTIONS.TITULO_ASC: this.sortField = 'titulo'; this.sortDirection = 'asc'; break;
        case SORT_BY_OPTIONS.TITULO_DESC: this.sortField = 'titulo'; this.sortDirection = 'desc'; break;
        default: this.sortField = 'fecha_publicacion'; this.sortDirection = 'desc';
      }
      this.resetPage();
    },
    sortByColumn(column) {
      if (this.sortField === column) {
        this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        this.sortField = column;
        this.sortDirection = 'desc'; // Default to descending for new column
      }
      // Update the v-model 'sortBy' to reflect the change
      if (column === 'titulo') {
        this.sortBy = this.sortDirection === 'asc' ? SORT_BY_OPTIONS.TITULO_ASC : SORT_BY_OPTIONS.TITULO_DESC;
      } else if (column === 'fecha_publicacion') {
        this.sortBy = this.sortDirection === 'asc' ? SORT_BY_OPTIONS.FECHA_ASC : SORT_BY_OPTIONS.FECHA_DESC;
      }
      this.resetPage();
    },
    sortIcon(column) {
      if (this.sortField !== column) return 'fa-sort sort-icon-muted';
      return this.sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
    },
    toggleSelect(noticia) {
      const index = this.selectedNoticias.findIndex(n => n.id === noticia.id);
      if (index > -1) {
        this.selectedNoticias.splice(index, 1);
      } else {
        this.selectedNoticias.push(noticia);
      }
    },
    isSelected(noticiaId) {
      return this.selectedNoticias.some(n => n.id === noticiaId);
    },
    toggleSelectAllPaginated(event) {
      const isChecked = event.target.checked;
      this.paginatedNoticias.forEach(noticiaEnPagina => {
        const indexInSelected = this.selectedNoticias.findIndex(n => n.id === noticiaEnPagina.id);
        if (isChecked) { // Select all
          if (indexInSelected === -1) { // if not already selected, add it
            this.selectedNoticias.push(noticiaEnPagina);
          }
        } else { // Deselect all
          if (indexInSelected > -1) { // if selected, remove it
            this.selectedNoticias.splice(indexInSelected, 1);
          }
        }
      });
    },
    handleSearchInput: debounce(function () {
      this.resetPage();
    }, 350) // Slightly increased debounce time
  },
  watch: {
    noticias: {
      handler(newNoticias, oldNoticias) {
        // Keep selected items that are still in the main list
        this.selectedNoticias = this.selectedNoticias.filter(selectedNoticia =>
          newNoticias.some(noticia => noticia.id === selectedNoticia.id)
        );
        // Adjust current page if it becomes invalid after data change (e.g., deletion)
        if (this.currentPage > this.totalPages && this.totalPages > 0) {
          this.currentPage = this.totalPages;
        } else if (this.totalPages === 0 && this.filteredNoticias.length === 0) {
            this.currentPage = 1;
        }
      },
      deep: true,
      immediate: true // Run on component mount as well
    },
    pageSize() { // Already resets page, no need for immediate: true
      this.resetPage();
    },
    statusFilter() {
        this.resetPage();
    }
  },
  created() {
    // Initialize sorting based on default sortBy value
    this.applySorting();
  }
};
</script>

<style scoped>
/* Ensure these variables are defined globally, e.g., in App.vue or main.css */
/*
:root {
  --app-primary: #5664d2;
  --app-success: #1abc9c;
  --app-warning: #f1b44c;
  --app-danger: #f46a6a;
  --app-info: #50a5f1;
  --app-secondary: #74788d;
  --app-light: #f5f7fb;
  --app-dark: #343a40;
  --app-text-muted: #6c757d;
  --app-card-bg: #ffffff;
  --app-card-border: #e0e5ec;
  --app-border-radius-sm: 0.25rem;
  --app-border-radius: 0.5rem;
  --app-border-radius-lg: 0.75rem;
  --app-shadow-sm: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.05);
  --app-shadow: 0 0.4rem 0.8rem rgba(0, 0, 0, 0.07);
}
*/

.noticias-table-container {
  background-color: var(--app-card-bg, #fff);
  border-radius: var(--app-border-radius-lg, 0.75rem);
  box-shadow: var(--app-shadow, 0 4px 6px rgba(0, 0, 0, 0.1));
  padding: 1.5rem; /* 24px */
  margin: 1.25rem 0; /* 20px */
}

.controls-section {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  gap: 1rem; /* 16px */
}

.filter-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  flex-grow: 1;
}

.search-bar-wrapper,
.status-filter-wrapper,
.sort-filter-wrapper {
  min-width: 180px;
  flex: 1 1 180px; /* Grow, shrink, basis */
}
.search-bar .input-group-text {
  background-color: var(--app-card-bg, #fff);
  border-right: none;
  color: var(--app-text-muted, #6c757d);
  border-radius: var(--app-border-radius, 0.5rem) 0 0 var(--app-border-radius, 0.5rem);
  border: 1px solid var(--app-card-border, #ced4da);
  border-right: 0;
}
.search-bar .form-control {
  border-left: none;
  box-shadow: none;
  border-radius: 0 var(--app-border-radius, 0.5rem) var(--app-border-radius, 0.5rem) 0;
  border: 1px solid var(--app-card-border, #ced4da);
}
.search-bar .form-control:focus {
  border-color: var(--app-primary, #0d6efd);
  /* box-shadow: 0 0 0 0.2rem rgba(var(--app-primary-rgb), 0.25); Assuming --app-primary-rgb is defined */
}
.form-select {
  border-radius: var(--app-border-radius, 0.5rem);
  border-color: var(--app-card-border, #ced4da);
}
.form-select:focus {
  border-color: var(--app-primary, #0d6efd);
  box-shadow: 0 0 0 0.2rem rgba(var(--app-primary-rgb, 13,110,253), 0.25);
}

.action-buttons-group {
  display: flex;
  gap: 0.5rem; /* 8px */
  flex-shrink: 0; /* Prevent shrinking when filter controls take space */
}
.btn {
  border-radius: var(--app-border-radius, 0.5rem);
  font-weight: 500;
  padding: 0.5rem 1rem;
  white-space: nowrap;
}
.btn-primary {
  background-color: var(--app-primary, #0d6efd);
  border-color: var(--app-primary, #0d6efd);
}
.btn-primary:hover {
  background-color: var(--app-primary-hover, #0a58ca); /* Define --app-primary-hover */
  border-color: var(--app-primary-hover, #0a58ca);
}
.btn-danger {
  background-color: var(--app-danger, #dc3545);
  border-color: var(--app-danger, #dc3545);
}
.btn-danger:hover {
  background-color: var(--app-danger-hover, #c82333); /* Define --app-danger-hover */
  border-color: var(--app-danger-hover, #c82333);
}
.btn-outline-primary {
    color: var(--app-primary, #0d6efd);
    border-color: var(--app-primary, #0d6efd);
}
.btn-outline-primary:hover {
    background-color: var(--app-primary, #0d6efd);
    color: var(--app-card-bg, #fff);
}


.table-info-section {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem; /* 16px */
  font-size: 0.875rem; /* 14px */
  color: var(--app-text-muted, #6c757d);
}
.page-size-selector {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.page-size-selector .form-select-sm {
  width: auto;
  min-width: 70px;
}

.table-responsive-wrapper {
  overflow-x: auto;
  border: 1px solid var(--app-card-border, #dee2e6);
  border-radius: var(--app-border-radius, 0.5rem);
  box-shadow: var(--app-shadow-sm, 0 2px 4px rgba(0,0,0,0.05));
  transition: opacity 0.3s ease;
  min-height: 300px; /* Ensure it doesn't collapse when empty */
  position: relative; /* For potential overlays like loading spinners */
}
.loading-opacity { opacity: 0.6; pointer-events: none; }

.custom-table {
  width: 100%;
  border-collapse: collapse; /* Changed from separate for cleaner borders */
  font-size: 0.9rem; /* 14.4px */
}
.custom-table thead th {
  background-color: var(--app-light, #f8f9fa);
  color: var(--app-dark, #343a40);
  font-weight: 600;
  border-bottom: 2px solid var(--app-card-border, #dee2e6);
  padding: 0.9rem 1rem; /* 14.4px 16px */
  text-align: left;
  position: sticky;
  top: 0;
  z-index: 10;
  white-space: nowrap;
}
.custom-table thead th.checkbox-header, .custom-table td:first-child {
    text-align: center;
}
.custom-table thead th:hover {
  background-color: var(--app-card-border, #e9ecef); /* Slightly darker for hover */
  cursor: pointer;
}
.custom-table tbody tr {
  transition: background-color 0.2s ease;
  animation: tableRowFadeIn 0.3s ease-out forwards;
}
.custom-table tbody tr.row-hover {
  background-color: rgba(var(--app-primary-rgb, 13,110,253), 0.05) !important;
}
.custom-table tbody tr.row-selected {
  background-color: rgba(var(--app-primary-rgb, 13,110,253), 0.1) !important;
  /* box-shadow: inset 3px 0 0 var(--app-primary, #0d6efd); Optional: left border highlight */
}
.custom-table td, .custom-table th {
  padding: 0.9rem 1rem; /* 14.4px 16px */
  vertical-align: middle;
  border-bottom: 1px solid var(--app-card-border, #dee2e6);
  overflow: hidden;
  text-overflow: ellipsis;
}
.custom-table .titulo-cell {
  max-width: 250px; /* Adjust as needed */
  white-space: nowrap;
}
.custom-table tbody tr:last-child td {
  border-bottom: none;
}

.sort-icon-muted { color: var(--app-text-muted-lighter, #adb5bd); } /* Define --app-text-muted-lighter */
.fa-sort-up, .fa-sort-down { color: var(--app-primary, #0d6efd); }

.actions-header { text-align: center; }
.action-buttons-cell {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem; /* 8px */
  white-space: nowrap; /* Prevent wrapping of buttons themselves */
}
.icon-btn {
  background: none;
  border: none;
  color: var(--app-text-muted, #6c757d);
  cursor: pointer;
  font-size: 1rem;
  padding: 0.375rem; /* 6px */
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}
.icon-btn:hover {
  transform: scale(1.1);
  background-color: rgba(var(--app-dark-rgb, 52,58,64), 0.08); /* Define --app-dark-rgb */
}
.icon-btn:focus-visible { /* Modern focus styling */
  outline: 2px solid var(--app-primary, #0d6efd);
  outline-offset: 1px;
}
.icon-btn.view-btn { color: var(--app-info, #50a5f1); }
.icon-btn.edit-btn { color: var(--app-warning, #f1b44c); }
.icon-btn.publish-btn { color: var(--app-success, #1abc9c); }
.icon-btn.delete-btn { color: var(--app-danger, #dc3545); }
.icon-btn.feature-btn.featured i,
.icon-btn.feature-btn:hover i {
  color: var(--app-warning, #f1b44c);
}

.form-check-input {
    border-color: var(--app-card-border);
}
.form-check-input:checked {
    background-color: var(--app-primary);
    border-color: var(--app-primary);
}
.form-check-input:focus {
    box-shadow: 0 0 0 0.2rem rgba(var(--app-primary-rgb, 13,110,253), 0.25);
}


.pagination-wrapper { margin-top: 1.5rem; }
.pagination { gap: 0.25rem; /* 4px */ }
.page-item.active .page-link {
  background-color: var(--app-primary, #0d6efd);
  border-color: var(--app-primary, #0d6efd);
  color: var(--app-card-bg, #fff);
  font-weight: 600;
}
.page-link {
  color: var(--app-primary, #0d6efd);
  border-radius: var(--app-border-radius, 0.5rem) !important;
  min-width: 38px; /* Slightly smaller */
  padding: 0.5rem 0.75rem;
  text-align: center;
  transition: all 0.2s ease;
  border: 1px solid var(--app-card-border, #dee2e6);
}
.page-link:hover {
  background-color: var(--app-light, #f8f9fa);
  color: var(--app-primary-hover, #0a58ca);
  border-color: var(--app-card-border, #dee2e6);
}
.page-item.disabled .page-link {
  color: var(--app-text-muted, #6c757d);
  background-color: transparent;
  border-color: var(--app-card-border, #dee2e6);
}

.no-results-placeholder, .loading-placeholder {
  background-color: var(--app-light, #f8f9fa);
  border-radius: var(--app-border-radius, 0.5rem);
  padding: 2.5rem; /* 40px */
  text-align: center;
  color: var(--app-text-muted, #6c757d);
  min-height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.loading-placeholder .spinner-border {
  width: 2.5rem;
  height: 2.5rem;
  color: var(--app-primary);
}

.custom-badge {
  font-weight: 500;
  padding: 0.35em 0.65em; /* Bootstrap default */
  border-radius: var(--app-border-radius-lg, 50px); /* Pill shape */
  font-size: 0.8rem; /* 12.8px */
  line-height: 1;
}

@keyframes tableRowFadeIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Responsive Adjustments */
@media (max-width: 991.98px) { /* Below lg */
  .custom-table .titulo-cell { max-width: 200px; }
  .custom-table td, .custom-table th {
    white-space: normal; /* Allow text wrapping */
  }
  .filter-controls {
    flex-direction: column; /* Stack filters on smaller screens */
    width: 100%;
  }
  .search-bar-wrapper,
  .status-filter-wrapper,
  .sort-filter-wrapper {
    width: 100%;
    min-width: unset;
    flex-basis: auto;
  }
  .controls-section {
    flex-direction: column;
  }
  .action-buttons-group {
    width: 100%;
    justify-content: flex-start; /* Align buttons to start */
  }
}

@media (max-width: 767.98px) { /* Below md */
  .noticias-table-container { padding: 1rem; }
  .controls-section, .filter-controls, .action-buttons-group, .table-info-section {
    gap: 0.75rem;
  }
  .btn, .form-select, .search-bar .form-control { font-size: 0.875rem; }
  .btn { padding: 0.4rem 0.8rem; }
  .add-btn .d-md-inline, .bulk-delete-btn .d-md-inline { display: none !important; } /* Hide text on small screens */
  .add-btn i, .bulk-delete-btn i { margin-right: 0 !important; }


  .custom-table td, .custom-table th {
    padding: 0.6rem 0.75rem;
    font-size: 0.85rem;
  }
  .custom-table .titulo-cell { max-width: 150px; }
  .action-buttons-cell {
    gap: 0.25rem; /* 4px */
    /* flex-wrap: wrap; Optionally allow button wrapping if too many */
  }
  .icon-btn {
    font-size: 0.9rem;
    padding: 0.3rem; /* 4.8px */
    width: 28px;
    height: 28px;
  }
  .pagination-wrapper .page-link {
    min-width: 32px;
    padding: 0.4rem 0.6rem;
    font-size: 0.85rem;
  }
}
</style>