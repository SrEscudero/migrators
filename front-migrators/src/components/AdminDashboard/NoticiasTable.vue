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
import StatePlaceholder from '@/components/shared/StatePlaceholder.vue'; // <-- AÑADIR IMPORTACIÓN
import ActionButton from '@/components/shared/ActionButton.vue'; // <-- AÑADIR IMPORTACIÓN

// Ya no necesitas las importaciones de Composition API aquí (ref, etc.)

const STATUS_FILTER_OPTIONS = Object.freeze({
  ALL: "all",
  PUBLISHED: "publicado",
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
    },
      components: {
      StatePlaceholder, // <-- REGISTRAR COMPONENTE
      ActionButton,   // <-- REGISTRAR COMPONENTE
  },
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
      selectedNoticias: [], // Almacenará los objetos de noticias completos
      STATUS_FILTER_OPTIONS,
      SORT_BY_OPTIONS
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
      const range = 1;
      const total = this.totalPages;
      const current = this.currentPage;
      if (total <= 1) return [];

      let start = Math.max(1, current - range);
      let end = Math.min(total, current + range);

      if (current <= range + 1) {
        end = Math.min(1 + (range * 2), total);
      }
      if (current >= total - range) {
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
    // *** MÉTODO CORREGIDO Y MOVIDO AQUÍ ***
    confirmBulkDelete() {
      if (this.selectedNoticias.length === 0) {
        Swal.fire('Atención', 'Debes seleccionar al menos una noticia para eliminar.', 'warning');
        return;
      }
      
      const idsToDelete = this.selectedNoticias.map(noticia => noticia.id);

      Swal.fire({
        title: `¿Eliminar ${this.selectedNoticias.length} noticias?`,
        text: "¡Esta acción no se puede revertir!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, ¡eliminar!',
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.isConfirmed) {
          // Emitimos el evento con el array de IDs para que el componente padre lo gestione
          this.$emit('bulk-delete', idsToDelete);
          // La limpieza de `this.selectedNoticias` se hará automáticamente por el `watch`
          // cuando la prop `noticias` se actualice desde el padre.
        }
      });
    },
    toggleFeatured(noticia) {
      this.$emit('feature', { id: noticia.id, destacada: !noticia.destacada });
    },
    changePage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
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
      this.sortBy = SORT_BY_OPTIONS.FECHA_DESC;
      this.applySorting();
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
        this.sortDirection = 'desc';
      }
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
        if (isChecked) {
          if (indexInSelected === -1) {
            this.selectedNoticias.push(noticiaEnPagina);
          }
        } else {
          if (indexInSelected > -1) {
            this.selectedNoticias.splice(indexInSelected, 1);
          }
        }
      });
    },
    handleSearchInput: debounce(function () {
      this.resetPage();
    }, 350)
  },
  watch: {
    noticias: {
      handler(newNoticias) {
        this.selectedNoticias = this.selectedNoticias.filter(selectedNoticia =>
          newNoticias.some(noticia => noticia.id === selectedNoticia.id)
        );
        if (this.currentPage > this.totalPages && this.totalPages > 0) {
          this.currentPage = this.totalPages;
        } else if (this.totalPages === 0 && this.filteredNoticias.length === 0) {
            this.currentPage = 1;
        }
      },
      deep: true,
      immediate: true
    },
    pageSize() {
      this.resetPage();
    },
    statusFilter() {
        this.resetPage();
    }
  },
  created() {
    this.applySorting();
  }
};
</script>

<style scoped>
.noticias-table-container {
  background-color: var(--color-surface);
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-soft);
  padding: 1.5rem;
  margin: 1.25rem 0;
}

.controls-section {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  gap: 1rem;
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
  flex: 1 1 180px;
}
.search-bar .input-group-text {
  background-color: var(--color-surface);
  border-right: none;
  color: var(--color-text-muted);
  border-radius: var(--border-radius-md) 0 0 var(--border-radius-md);
  border: 1px solid var(--color-border);
  border-right: 0;
}
.search-bar .form-control {
  border-left: none;
  box-shadow: none;
  border-radius: 0 var(--border-radius-md) var(--border-radius-md) 0;
  border: 1px solid var(--color-border);
}
.search-bar .form-control:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 0.2rem rgba(29, 53, 87, 0.15);
}
.form-select {
  border-radius: var(--border-radius-md);
  border-color: var(--color-border);
}
.form-select:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 0.2rem rgba(29, 53, 87, 0.15);
}

.action-buttons-group {
  display: flex;
  gap: 0.5rem;
  flex-shrink: 0;
}
.btn {
  border-radius: var(--border-radius-md);
  font-weight: var(--font-weight-medium);
  padding: 0.5rem 1rem;
  white-space: nowrap;
}
.btn-primary {
  background-color: var(--color-primary);
  border-color: var(--color-primary);
}
.btn-primary:hover {
  background-color: var(--color-primary-light);
  border-color: var(--color-primary-light);
}
.btn-danger {
  background-color: var(--color-danger);
  border-color: var(--color-danger);
}
.btn-danger:hover {
  background-color: #c82333; /* Darken danger color */
  border-color: #c82333;
}
.btn-outline-primary {
    color: var(--color-primary);
    border-color: var(--color-primary);
}
.btn-outline-primary:hover {
    background-color: var(--color-primary);
    color: var(--color-surface);
}

.table-info-section {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  font-size: 0.875rem;
  color: var(--color-text-muted);
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
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-soft);
  transition: opacity 0.3s ease;
  min-height: 300px;
  position: relative;
}
.loading-opacity { opacity: 0.6; pointer-events: none; }

.custom-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}
.custom-table thead th {
  background-color: var(--color-background);
  color: var(--color-text);
  font-weight: 600;
  border-bottom: 2px solid var(--color-border);
  padding: 0.9rem 1rem;
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
  background-color: #e9ecef; /* Fallback for hover */
  cursor: pointer;
}
.custom-table tbody tr {
  transition: background-color 0.2s ease;
  animation: tableRowFadeIn 0.3s ease-out forwards;
}
.custom-table tbody tr.row-hover {
  background-color: rgba(29, 53, 87, 0.05) !important;
}
.custom-table tbody tr.row-selected {
  background-color: rgba(29, 53, 87, 0.1) !important;
}
.custom-table td, .custom-table th {
  padding: 0.9rem 1rem;
  vertical-align: middle;
  border-bottom: 1px solid var(--color-border);
  overflow: hidden;
  text-overflow: ellipsis;
}
.custom-table .titulo-cell {
  max-width: 250px;
  white-space: nowrap;
}
.custom-table tbody tr:last-child td {
  border-bottom: none;
}

.sort-icon-muted { color: #adb5bd; }
.fa-sort-up, .fa-sort-down { color: var(--color-primary); }

.actions-header { text-align: center; }
.action-buttons-cell {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  white-space: nowrap;
}
.icon-btn {
  background: none;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  font-size: 1rem;
  padding: 0.375rem;
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
  background-color: rgba(44, 62, 80, 0.08);
}
.icon-btn:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 1px;
}
.icon-btn.view-btn { color: var(--color-accent); }
.icon-btn.edit-btn { color: #f1b44c; } /* Warning color */
.icon-btn.publish-btn { color: var(--color-secondary); }
.icon-btn.delete-btn { color: var(--color-danger); }
.icon-btn.feature-btn.featured i,
.icon-btn.feature-btn:hover i {
  color: #f1b44c; /* Warning color */
}

.form-check-input {
    border-color: var(--color-border);
}
.form-check-input:checked {
    background-color: var(--color-primary);
    border-color: var(--color-primary);
}
.form-check-input:focus {
    box-shadow: 0 0 0 0.2rem rgba(29, 53, 87, 0.15);
}

.pagination-wrapper { margin-top: 1.5rem; }
.pagination { gap: 0.25rem; }
.page-item.active .page-link {
  background-color: var(--color-primary);
  border-color: var(--color-primary);
  color: var(--color-surface);
  font-weight: 600;
}
.page-link {
  color: var(--color-primary);
  border-radius: var(--border-radius-md) !important;
  min-width: 38px;
  padding: 0.5rem 0.75rem;
  text-align: center;
  transition: all 0.2s ease;
  border: 1px solid var(--color-border);
}
.page-link:hover {
  background-color: var(--color-background);
  color: var(--color-primary-light);
  border-color: var(--color-border);
}
.page-item.disabled .page-link {
  color: var(--color-text-muted);
  background-color: transparent;
  border-color: var(--color-border);
}

.no-results-placeholder, .loading-placeholder {
  background-color: var(--color-background);
  border-radius: var(--border-radius-md);
  padding: 2.5rem;
  text-align: center;
  color: var(--color-text-muted);
  min-height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.loading-placeholder .spinner-border {
  width: 2.5rem;
  height: 2.5rem;
  color: var(--color-primary);
}

.custom-badge {
  font-weight: var(--font-weight-medium);
  padding: 0.35em 0.65em;
  border-radius: 50px;
  font-size: 0.8rem;
  line-height: 1;
}
.custom-badge.bg-success { background-color: var(--color-secondary) !important; }
.custom-badge.bg-warning { background-color: #f1b44c !important; }
.custom-badge.bg-secondary { background-color: var(--color-text-muted) !important; }

@keyframes tableRowFadeIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 991.98px) {
  .custom-table .titulo-cell { max-width: 200px; }
  .custom-table td, .custom-table th {
    white-space: normal;
  }
  .filter-controls {
    flex-direction: column;
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
    justify-content: flex-start;
  }
}

@media (max-width: 767.98px) {
  .noticias-table-container { padding: 1rem; }
  .controls-section, .filter-controls, .action-buttons-group, .table-info-section {
    gap: 0.75rem;
  }
  .btn, .form-select, .search-bar .form-control { font-size: 0.875rem; }
  .btn { padding: 0.4rem 0.8rem; }
  .add-btn .d-md-inline, .bulk-delete-btn .d-md-inline { display: none !important; }
  .add-btn i, .bulk-delete-btn i { margin-right: 0 !important; }

  .custom-table td, .custom-table th {
    padding: 0.6rem 0.75rem;
    font-size: 0.85rem;
  }
  .custom-table .titulo-cell { max-width: 150px; }
  .action-buttons-cell {
    gap: 0.25rem;
  }
  .icon-btn {
    font-size: 0.9rem;
    padding: 0.3rem;
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