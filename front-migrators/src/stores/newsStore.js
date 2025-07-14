import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import Swal from 'sweetalert2';
import {
  obtenerNoticias,
  agregarNoticia,
  editarNoticia,
  eliminarNoticia,
  publicarNoticiaBorrador,
  eliminarNoticiasMultiples,
  toggleFeatureNoticia,
} from '@/services/AdminDashboardService';

// Helper para tener un objeto de noticia limpio y reutilizable
const createInitialNoticia = () => ({
  id: null,
  titulo: "",
  contenido: "",
  imagen_url: "",
  link: "",
  autor: "",
  fecha_expiracion: "",
  fecha_publicacion: null,
  estado: 'borrador',
  destacada: false,
});

// Constantes para los filtros, para evitar errores de tipeo
const STATUS_FILTER_OPTIONS = { ALL: "all", PUBLISHED: "publicado", DRAFT: "borrador", ARCHIVED: "archivado" };
const SORT_BY_OPTIONS = { FECHA_DESC: "fecha_desc", FECHA_ASC: "fecha_asc", TITULO_ASC: "titulo_asc", TITULO_DESC: "titulo_desc" };

export const useNewsStore = defineStore('news', () => {
    // =================================
    //         ESTADO (STATE)
    // =================================
    const noticias = ref([]);
    const noticiaEnEdicion = ref(createInitialNoticia());
    const isLoading = ref(false);
    const error = ref(null);
    
    // Estado para los filtros y la selección de la tabla
    const searchQuery = ref('');
    const statusFilter = ref(STATUS_FILTER_OPTIONS.ALL);
    const sortBy = ref(SORT_BY_OPTIONS.FECHA_DESC);
    const selectedNoticias = ref([]);

    // =================================
    //         GETTERS (COMPUTED)
    // =================================
    const filteredAndSortedNoticias = computed(() => {
      let tempNoticias = [...noticias.value];

      if (statusFilter.value !== STATUS_FILTER_OPTIONS.ALL) {
        tempNoticias = tempNoticias.filter(n => n.estado === statusFilter.value);
      }
      
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase().trim();
        tempNoticias = tempNoticias.filter(n => 
          n.titulo?.toLowerCase().includes(query) || 
          n.autor?.toLowerCase().includes(query)
        );
      }

      tempNoticias.sort((a, b) => {
        if (a.destacada && !b.destacada) return -1;
        if (!a.destacada && b.destacada) return 1;

        switch (sortBy.value) {
            case SORT_BY_OPTIONS.TITULO_ASC: return a.titulo.localeCompare(b.titulo);
            case SORT_BY_OPTIONS.TITULO_DESC: return b.titulo.localeCompare(a.titulo);
            case SORT_BY_OPTIONS.FECHA_ASC: return new Date(a.fecha_publicacion) - new Date(b.fecha_publicacion);
            default: return new Date(b.fecha_publicacion) - new Date(a.fecha_publicacion);
        }
      });
      return tempNoticias;
    });

    // =================================
    //         ACCIONES (ACTIONS)
    // =================================

    // Todas las acciones se declaran aquí y pueden llamarse entre sí
    
    async function fetchNoticias() {
        isLoading.value = true;
        error.value = null;
        try {
            noticias.value = await obtenerNoticias();
        } catch (err) {
            error.value = 'No se pudieron cargar las noticias.';
            Swal.fire('Error', error.value, 'error');
        } finally {
            isLoading.value = false;
        }
    }

    async function saveNoticia(noticiaData, isPublishing = true) {
        isLoading.value = true;
        const dataToSave = { ...noticiaData, estado: isPublishing ? 'publicado' : 'borrador' };
        try {
            const isEditing = !!dataToSave.id;
            const serviceCall = isEditing ? editarNoticia(dataToSave.id, dataToSave) : agregarNoticia(dataToSave);
            await serviceCall;
            Swal.fire('Éxito', `Noticia ${isEditing ? 'actualizada' : 'guardada'} correctamente.`, 'success');
            await fetchNoticias(); // <--- Llamada interna correcta
            return true;
        } catch (err) {
            Swal.fire('Error', `No se pudo guardar la noticia: ${err.response?.data?.message || err.message}`, 'error');
            return false;
        } finally {
            isLoading.value = false;
        }
    }

    async function deleteNoticia(noticiaId) {
        isLoading.value = true;
        try {
            await eliminarNoticia(noticiaId);
            Swal.fire('Eliminada', 'La noticia ha sido eliminada.', 'success');
            await fetchNoticias(); // <--- Llamada interna correcta
        } catch (err) {
            Swal.fire('Error', err.response?.data?.message || 'No se pudo eliminar la noticia.', 'error');
        } finally {
            isLoading.value = false;
        }
    }

    async function deleteMultipleNoticias(ids) {
        isLoading.value = true;
        try {
            const response = await eliminarNoticiasMultiples(ids);
            Swal.fire('Eliminadas', response.message || `${ids.length} noticias eliminadas.`, 'success');
            await fetchNoticias(); // <--- Llamada interna correcta
        } catch (err) {
            Swal.fire('Error', 'No se pudieron eliminar las noticias.', 'error');
        } finally {
            isLoading.value = false;
        }
    }

    async function publishDraft(noticiaId) {
        isLoading.value = true;
        try {
            await publicarNoticiaBorrador(noticiaId);
            Swal.fire('Publicada', 'El borrador ha sido publicado.', 'success');
            await fetchNoticias(); // <--- Llamada interna correcta
        } catch (err) {
            Swal.fire('Error', 'No se pudo publicar el borrador.', 'error');
        } finally {
            isLoading.value = false;
        }
    }

    async function toggleFeature(noticiaToToggle) {
        try {
            await toggleFeatureNoticia(noticiaToToggle.id, !noticiaToToggle.destacada);
            await fetchNoticias(); // <--- Llamada interna correcta para refrescar
        } catch (err) {
            Swal.fire('Error', 'No se pudo cambiar el estado de destacado.', 'error');
        }
    }

    function selectNoticiaForEdit(noticia) { Object.assign(noticiaEnEdicion.value, noticia); }
    function resetNoticiaForm() { noticiaEnEdicion.value = createInitialNoticia(); }
    function setEditingNewsImageUrl(url) { if (noticiaEnEdicion.value) noticiaEnEdicion.value.imagen_url = url; }
    function setSearchQuery(query) { searchQuery.value = query; }
    function setStatusFilter(status) { statusFilter.value = status; }
    function setSortBy(sortOption) { sortBy.value = sortOption; }
    
    return {
        // State
        noticias, noticiaEnEdicion, isLoading, error,
        searchQuery, statusFilter, sortBy, selectedNoticias,
        // Getters
        filteredAndSortedNoticias,
        // Actions
        fetchNoticias, saveNoticia, deleteNoticia, deleteMultipleNoticias, publishDraft, toggleFeature,
        selectNoticiaForEdit, resetNoticiaForm, setEditingNewsImageUrl,
        setSearchQuery, setStatusFilter, setSortBy,
    };
});
