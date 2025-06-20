import { defineStore } from 'pinia';
import { ref, reactive } from 'vue';
import Swal from 'sweetalert2';

// Importamos todos los servicios de noticias que vamos a necesitar
import {
  obtenerNoticias,
  agregarNoticia,
  editarNoticia,
  eliminarNoticia,
  publicarNoticiaBorrador,
  eliminarNoticiasMultiples,
  toggleFeatureNoticia,
} from '@/services/AdminDashboardService';

// Helper para tener un objeto de noticia limpio
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

export const useNewsStore = defineStore('news', () => {
    // === STATE ===
    const noticias = ref([]);
    const noticiaEnEdicion = reactive(createInitialNoticia());
    const isLoading = ref(false);
    const error = ref(null);

    // === ACTIONS ===

    async function fetchNoticias() {
        isLoading.value = true;
        error.value = null;
        try {
            noticias.value = await obtenerNoticias();
        } catch (err) {
            error.value = 'No se pudieron cargar las noticias.';
            console.error(err);
        } finally {
            isLoading.value = false;
        }
    }

    function selectNoticiaForEdit(noticia) {
        Object.assign(noticiaEnEdicion, noticia);
    }

    function resetNoticiaForm() {
        Object.assign(noticiaEnEdicion, createInitialNoticia());
    }

    function setEditingNewsImageUrl(url) {
      if (noticiaEnEdicion) {
        noticiaEnEdicion.imagen_url = url;
      }
    }

    async function saveNoticia(noticiaData, isPublishing = true) {
        isLoading.value = true;
        const dataToSave = { ...noticiaData };
        const isNewNotice = !dataToSave.id;

        if (isPublishing) {
            dataToSave.estado = 'publicado';
            if (isNewNotice && !dataToSave.fecha_publicacion) {
                dataToSave.fecha_publicacion = new Date().toISOString();
            }
        }
        
        if(dataToSave.fecha_expiracion) {
            dataToSave.fecha_expiracion = new Date(dataToSave.fecha_expiracion).toISOString();
        }

        try {
            const isEditing = !!dataToSave.id;
            const serviceCall = isEditing
                ? editarNoticia(dataToSave.id, dataToSave)
                : agregarNoticia(dataToSave);

            await serviceCall;
            Swal.fire('Éxito', `Noticia ${isEditing ? 'actualizada' : 'guardada'} correctamente.`, 'success');
            await fetchNoticias();
            return true;
        } catch (err) {
            const apiErrorMessage = err.response?.data?.message || err.message || "Error desconocido.";
            Swal.fire('Error', `No se pudo guardar la noticia: ${apiErrorMessage}`, 'error');
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
            await fetchNoticias();
        } catch (err) {
            Swal.fire('Error', 'No se pudo eliminar la noticia.', 'error');
        } finally {
            isLoading.value = false;
        }
    }

    async function deleteMultipleNoticias(ids) {
        isLoading.value = true;
        try {
            const response = await eliminarNoticiasMultiples(ids);
            Swal.fire('Eliminadas', response.message || `${ids.length} noticias han sido eliminadas.`, 'success');
            await fetchNoticias();
        } catch (err) {
            Swal.fire('Error', 'No se pudieron eliminar las noticias seleccionadas.', 'error');
            console.error(err);
        } finally {
            isLoading.value = false;
        }
    }
    
    async function toggleNewsFeature({ id, destacada }) {
        try {
            await toggleFeatureNoticia(id, destacada);
            const index = noticias.value.findIndex(n => n.id === id);
            if (index !== -1) {
                noticias.value[index].destacada = destacada;
            }
            Swal.fire({
                toast: true, position: "top-end", icon: "success",
                title: destacada ? "Noticia destacada" : "Quitada de destacadas",
                showConfirmButton: false, timer: 2000,
            });
        } catch (err) {
            Swal.fire('Error', 'No se pudo actualizar el estado de destacado.', 'error');
            console.error(err);
        }
    }

    async function publishDraft(noticiaId) {
        isLoading.value = true;
        try {
            await publicarNoticiaBorrador(noticiaId);
            Swal.fire('Publicada', 'La noticia ha sido publicada con éxito.', 'success');
            await fetchNoticias();
        } catch (err) {
            Swal.fire('Error', 'No se pudo publicar la noticia.', 'error');
        } finally {
            isLoading.value = false;
        }
    }
    
    // Objeto 'return' final con todas las acciones y estado exportados
    return {
        // State
        noticias,
        noticiaEnEdicion,
        isLoading,
        error,
        // Actions
        fetchNoticias,
        selectNoticiaForEdit,
        resetNoticiaForm,
        saveNoticia,
        deleteNoticia,
        publishDraft,
        setEditingNewsImageUrl,
        deleteMultipleNoticias,
        toggleNewsFeature,
    };
});