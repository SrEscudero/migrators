<template>
  <form @submit.prevent="submitForm" class="noticia-form">
    <div class="row g-3">
      <div class="col-12 col-md-6">
        <label for="titulo" class="form-label">
          <i class="fas fa-heading me-2"></i> Título <span class="text-danger">*</span>
        </label>
        <input type="text" class="form-control" :class="{ 'is-invalid': errors.titulo }" id="titulo"
          v-model="formData.titulo" @input="validateField('titulo')" maxlength="200" aria-label="Título de la noticia"
          aria-required="true" />
        <transition name="fade">
          <div v-if="errors.titulo" class="invalid-feedback" aria-live="polite"> {{ errors.titulo }}</div>
        </transition>
        <div class="form-text text-end text-muted small">
          {{ formData.titulo ? formData.titulo.length : 0 }}/200 caracteres
        </div>
      </div>

      <div class="col-12 col-md-6">
        <label for="autor" class="form-label">
          <i class="fas fa-user me-2"></i> Autor <span class="text-danger">*</span>
        </label>
        <input type="text" class="form-control" :class="{ 'is-invalid': errors.autor }" id="autor"
          v-model="formData.autor" @input="validateField('autor')" maxlength="100" aria-label="Autor de la noticia"
          aria-required="true" />
        <transition name="fade">
          <div v-if="errors.autor" class="invalid-feedback" aria-live="polite"> {{ errors.autor }}</div>
        </transition>
      </div>

      <div class="col-12">
        <label for="contenido" class="form-label">
          <i class="fas fa-align-left me-2"></i> Contenido <span class="text-danger">*</span>
        </label>
        <textarea class="form-control" :class="{ 'is-invalid': errors.contenido }" id="contenido" rows="6"
          v-model="formData.contenido" @input="validateField('contenido')" aria-label="Contenido de la noticia"
          aria-required="true" maxlength="5000"></textarea>
        <transition name="fade">
          <div v-if="errors.contenido" class="invalid-feedback" aria-live="polite"> {{ errors.contenido }}</div>
        </transition>
        <div class="form-text text-end text-muted small">
          {{ formData.contenido ? formData.contenido.length : 0 }}/5000 caracteres
        </div>
      </div>

      <transition name="fade">
        <div class="col-12" v-if="showRichTextEditor">
          <label class="form-label">Vista previa del contenido:</label>
          <div class="content-preview border p-3 rounded bg-light">
            <div v-html="renderedContent"></div>
          </div>
        </div>
      </transition>

      <div class="col-12 col-md-6">
        <label for="imagen_url" class="form-label">
          <i class="fas fa-image me-2"></i> Imagen de la Noticia
        </label>
        <div class="input-group">
          <input type="text" class="form-control" :class="{ 'is-invalid': errors.imagen_url }" id="imagen_url"
            v-model="formData.imagen_url" @input="clearError('imagen_url')" placeholder="Pega una URL o sube una imagen"
            aria-label="URL o subida de la imagen" />
          <button class="btn btn-primary" type="button" @click="openImageUploadModal" title="Abrir centro multimedia">
            <i class="fas fa-photo-video"></i>
          </button>
        </div>
        <transition name="fade">
          <div v-if="errors.imagen_url" class="invalid-feedback" aria-live="polite"> {{ errors.imagen_url }}</div>
        </transition>
        <transition name="fade">
          <div v-if="formData.imagen_url" class="mt-3">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <small class="text-muted">Vista previa:</small>
              <button class="btn btn-sm btn-outline-danger" @click.prevent="formData.imagen_url = ''"
                title="Quitar imagen">
                <i class="fas fa-trash-alt"></i>
              </button>
            </div>
            <img :src="formData.imagen_url" alt="Previsualización de la imagen"
              class="preview-img img-fluid rounded shadow-sm" @error="handleImageError" />
          </div>
        </transition>
      </div>
      <div class="col-12 col-md-6">
        <label class="form-label">
          <i class="fas fa-calendar-alt me-2"></i> Fecha de Publicación
        </label>
        <div class="form-control-plaintext bg-light rounded p-2">
          <i class="fas fa-clock me-2"></i>
          {{ currentDateTime }}
        </div>
      </div>

      <div class="col-12 col-md-6">
        <label for="fecha_expiracion" class="form-label">
          <i class="fas fa-clock me-2"></i> Fecha y Hora de Expiración <span class="text-danger">*</span>
        </label>
        <input type="datetime-local" class="form-control" :class="{ 'is-invalid': errors.fecha_expiracion }"
          id="fecha_expiracion" v-model="formData.fecha_expiracion" :min="minExpirationDateTime"
          aria-label="Fecha y hora de expiración" aria-required="true" />
        <transition name="fade">
          <div v-if="errors.fecha_expiracion" class="invalid-feedback" aria-live="polite"> {{ errors.fecha_expiracion }}
          </div>
        </transition>
        <transition name="fade">
          <div v-if="isExpiringSoon" class="alert alert-warning mt-2">
            <i class="fas fa-exclamation-triangle me-2"></i> Esta noticia expirará pronto.
          </div>
        </transition>
      </div>

      <div class="col-12 col-md-6">
        <label for="link" class="form-label">
          <i class="fas fa-link me-2"></i> Enlace de fuente <span class="text-danger">*</span>
        </label>
        <input type="url" class="form-control" :class="{ 'is-invalid': errors.link }" id="link" v-model="formData.link"
          @input="validateField('link')" placeholder="https://ejemplo.com" aria-label="Enlace relacionado"
          aria-required="true" />
        <transition name="fade">
          <div v-if="errors.link" class="invalid-feedback" aria-live="polite"> {{ errors.link }}</div>
        </transition>
      </div>

      <div class="col-12 col-md-6">
        <label for="estado" class="form-label">
          <i class="fas fa-tag me-2"></i> Estado de la Noticia <span class="text-danger">*</span>
        </label>
        <select class="form-select" :class="{ 'is-invalid': errors.estado }" id="estado" v-model="formData.estado"
          aria-label="Estado de la noticia" aria-required="true">
          <option value="borrador">Borrador</option>
          <option value="publicado">Publicado</option>
        </select>
        <transition name="fade">
          <div v-if="errors.estado" class="invalid-feedback" aria-live="polite"> {{ errors.estado }}</div>
        </transition>
      </div>
    </div>
    <div class="col-12 d-flex flex-column flex-md-row justify-content-center align-items-center gap-3 mt-4">
      <button type="submit" class="btn btn-primary flex-grow-1 flex-md-grow-0" :disabled="isSubmitting">
        <span v-if="isSubmitting" class="spinner-border spinner-border-sm" role="status"></span>
        <i v-else class="fas fa-paper-plane"></i>
        <span>{{ isSubmitting ? 'Publicando...' : (formData.id ? 'Actualizar y Publicar' : 'Publicar Noticia') }}</span>
      </button>

      <button type="button" class="btn btn-outline-success flex-grow-1 flex-md-grow-0" @click="saveAsDraft"
        :disabled="isSubmittingBorrador">
        <span v-if="isSubmittingBorrador" class="spinner-border spinner-border-sm" role="status"></span>
        <i v-else class="fas fa-save"></i>
        <span>{{ isSubmittingBorrador ? 'Guardando...' : 'Guardar como Borrador' }}</span>
      </button>

      <button type="button" class="btn btn-info text-white" @click="previewContent" v-if="!showRichTextEditor">
        <i class="fas fa-eye"></i> Vista Previa
      </button>
      <button type="button" class="btn btn-outline-secondary" @click="showRichTextEditor = false" v-else>
        <i class="fas fa-edit"></i> Volver a Editar
      </button>
      <button type="button" class="btn btn-outline-danger" @click="confirmReset">
        <i class="fas fa-trash-alt"></i> Limpiar
      </button>
    </div>

    <div class="modal fade" id="imageUploadModal" tabindex="-1" aria-labelledby="imageUploadModalLabel"
      aria-hidden="true">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content media-modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="imageUploadModalLabel"><i class="fas fa-photo-video me-2"></i>Centro Multimedia
            </h5>
            <button type="button" class="btn-close" @click="closeModal" aria-label="Cerrar"></button>
          </div>
          <div class="modal-body">
            <ul class="nav nav-tabs nav-fill mb-4">
              <li class="nav-item">
                <a class="nav-link" :class="{ active: activeTab === 'upload' }" href="#"
                  @click.prevent="activeTab = 'upload'">
                  <i class="fas fa-upload me-2"></i>Subir Archivo
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link" :class="{ active: activeTab === 'url' }" href="#"
                  @click.prevent="activeTab = 'url'">
                  <i class="fas fa-link me-2"></i>Enlazar desde URL
                </a>
              </li>
            </ul>

            <div class="tab-content">
              <div v-show="activeTab === 'upload'">
                <input type="file" ref="fileInput" @change="handleFileSelect" accept="image/*" class="d-none">

                <div v-if="!selectedFile" class="drop-zone" :class="{ 'is-drag-over': isDragOver }"
                  @click="$refs.fileInput.click()" @dragover.prevent="isDragOver = true"
                  @dragenter.prevent="isDragOver = true" @dragleave.prevent="isDragOver = false"
                  @drop.prevent="handleDrop">
                  <div class="drop-zone-content">
                    <i class="fas fa-cloud-upload-alt fa-3x text-primary mb-3"></i>
                    <h5 class="mb-2">Arrastra y suelta una imagen aquí</h5>
                    <p class="text-muted mb-2">o haz click para seleccionar un archivo</p>
                    <small class="text-muted">También puedes pegar desde el portapapeles (Ctrl+V)</small>
                    <small class="d-block mt-3">Formatos: JPG, PNG, GIF, WebP. Tamaño máx: 5MB.</small>
                  </div>
                </div>

                <div v-else class="preview-zone">
                  <h6 class="text-center mb-3">Vista Previa de la Imagen a Subir</h6>
                  <div class="d-flex justify-content-center align-items-center">
                    <div class="image-preview-container">
                      <img :src="createObjectURL(selectedFile)" alt="Previsualización de subida"
                        class="preview-img-modal" />
                      <button class="btn btn-sm btn-danger remove-preview-btn" @click="clearSelectedFile"
                        title="Quitar imagen">
                        <i class="fas fa-times"></i>
                      </button>
                    </div>
                  </div>
                  <div class="text-center mt-3">
                    <p class="mb-1"><strong>Archivo:</strong> {{ selectedFile.name }}</p>
                    <p class="text-muted"><strong>Tamaño:</strong> {{ (selectedFile.size / 1024 / 1024).toFixed(2) }} MB
                    </p>
                  </div>
                </div>
              </div>

              <div v-show="activeTab === 'url'">
                <div class="mb-3">
                  <label for="urlInput" class="form-label">Pega la URL de la imagen</label>
                  <div class="input-group">
                    <input type="url" id="urlInput" class="form-control" v-model="urlToLink"
                      placeholder="https://ejemplo.com/imagen.jpg">
                    <button class="btn btn-outline-secondary" @click="previewUrl">Previsualizar</button>
                  </div>
                </div>
                <div v-if="urlPreview" class="preview-zone">
                  <h6 class="text-center mb-3">Vista Previa de la URL</h6>
                  <div class="d-flex justify-content-center align-items-center">
                    <img :src="urlPreview" @error="urlPreviewError = true" alt="Previsualización de URL"
                      class="preview-img-modal" />
                  </div>
                </div>
                <div v-if="urlPreviewError" class="alert alert-danger mt-3">
                  No se pudo cargar la imagen desde esa URL.
                </div>
              </div>
            </div>

            <div v-if="uploadProgress > 0" class="progress mt-4" style="height: 10px;">
              <div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar"
                :style="{ width: uploadProgress + '%' }"></div>
            </div>

          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeModal">Cancelar</button>
            <button type="button" class="btn btn-primary" @click="confirmSelection" :disabled="!canConfirmSelection">
              <span v-if="isSubmittingUpload" class="spinner-border spinner-border-sm me-2" role="status"></span>
              {{ confirmButtonText }}
            </button>

          </div>
        </div>
      </div>
    </div>
  </form>
</template>

<script>
// Tus imports existentes (Swal, MarkdownIt, DOMPurify, Modal, axios)
import Swal from "sweetalert2";
import MarkdownIt from 'markdown-it';
import DOMPurify from 'dompurify';
import { Modal } from 'bootstrap';
import axios from 'axios';

export default {
  // Tus props y emits existentes
  props: {
    noticia: {
      type: Object,
      required: true,
      default: () => ({ id: null, titulo: '', autor: '', contenido: '', imagen_url: '', link: '', fecha_expiracion: '', estado: 'borrador' })
    }
  },
  emits: ['submit', 'save-draft', 'reset', 'update:imageUrl'],

  data() {
    return {
      formData: { ...this.noticia },
      errors: {},
      isSubmitting: false,
      isSubmittingBorrador: false,
      isSubmittingUpload: false,
      showRichTextEditor: false,
      imageUploadModalInstance: null,
      currentDateTime: this.formatDateTime(new Date()),
      minExpirationDateTime: this.calculateMinExpirationDateTime(),
      interval: null,

      // --- NUEVO ESTADO PARA EL MODAL MEJORADO ---
      activeTab: 'upload', // 'upload' o 'url'
      isDragOver: false,
      selectedFile: null,
      uploadProgress: 0,
      urlToLink: '',
      urlPreview: '',
      urlPreviewError: false,
    };
  },

  computed: {
    // Tus computed properties existentes (renderedContent, isExpiringSoon, requiredFields)
    renderedContent() {
      const md = new MarkdownIt();
      const rawHtml = md.render(this.formData.contenido || '*No hay contenido para mostrar*');
      return DOMPurify.sanitize(rawHtml);
    },
    isExpiringSoon() {
      if (!this.formData.fecha_expiracion) return false;
      const expirationDate = new Date(this.formData.fecha_expiracion);
      const now = new Date();
      const timeDifference = expirationDate.getTime() - now.getTime();
      return timeDifference > 0 && timeDifference <= 24 * 60 * 60 * 1000; // 24 horas
    },
    requiredFields() {
      return ['titulo', 'autor', 'contenido', 'link', 'fecha_expiracion', 'estado'];
    },

    canConfirmSelection() {
      if (this.isSubmittingUpload) return false;
      if (this.activeTab === 'upload' && this.selectedFile) return true;
      if (this.activeTab === 'url' && this.urlPreview && !this.urlPreviewError) return true;
      return false;
    },
    confirmButtonText() {
      if (this.isSubmittingUpload) return 'Subiendo...';
      if (this.activeTab === 'upload') return 'Subir y Usar Imagen';
      if (this.activeTab === 'url') return 'Usar Imagen de URL';
      return 'Confirmar';
    }
  },

  methods: {
    // Tus métodos existentes (formatDateTime, validateField, etc.)
    // (Copia y pega todos tus métodos existentes aquí, no cambian)
    formatDateTime(date) {
      if (!date) return '';
      const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true };
      return new Intl.DateTimeFormat('es-ES', options).format(new Date(date));
    },

    calculateMinExpirationDateTime() {
      const now = new Date();

      // Añadimos un pequeño margen, por ejemplo, 1 minuto, para asegurar que la hora sea futura
      now.setMinutes(now.getMinutes() + 1);

      // Obtenemos los componentes de la fecha y hora LOCALES
      const year = now.getFullYear();
      const month = (now.getMonth() + 1).toString().padStart(2, '0'); // Los meses son 0-indexados
      const day = now.getDate().toString().padStart(2, '0');
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');

      // Formateamos la cadena al formato que el input espera: 'YYYY-MM-DDTHH:mm'
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    },

    validateField(field) {
      if (this.errors[field]) delete this.errors[field];
      const value = this.formData[field] ? String(this.formData[field]).trim() : '';

      switch (field) {
        case 'titulo':
          if (!value) this.errors[field] = 'El título es obligatorio.';
          else if (value.length > 200) this.errors[field] = 'Máximo 200 caracteres.';
          break;
        case 'autor':
          if (!value) this.errors[field] = 'El autor es obligatorio.';
          break;
        case 'contenido':
          if (!value) this.errors[field] = 'El contenido es obligatorio.';
          break;
        case 'link':
          if (!value) this.errors[field] = 'El enlace es obligatorio.';
          else if (!this.isValidUrl(value)) this.errors[field] = 'La URL no es válida.';
          break;
        case 'fecha_expiracion':
          if (!this.formData.fecha_expiracion) {
            this.errors[field] = 'La fecha de expiración es obligatoria.';
          } else if (new Date(this.formData.fecha_expiracion) <= new Date()) {
            this.errors[field] = 'La fecha debe ser futura.';
          }
          break;
        case 'estado':
          if (!['borrador', 'publicado'].includes(this.formData.estado)) {
            this.errors[field] = 'El estado no es válido.';
          }
          break;
      }
    },

    validateForm() {
      this.errors = {};
      this.requiredFields.forEach(field => this.validateField(field));

      // --- LÓGICA DE VALIDACIÓN CORREGIDA ---
      const imageUrl = this.formData.imagen_url;
      // La validación falla SOLAMENTE si la URL tiene un valor,
      // no es una URL válida (http/https), Y TAMPOCO es una ruta relativa (que empieza con /)
      if (imageUrl && !this.isValidUrl(imageUrl) && !imageUrl.startsWith('/')) {
        this.errors.imagen_url = 'El valor debe ser una URL válida o una ruta de imagen subida.';
      }
      
      return Object.keys(this.errors).length === 0;
    },

    isValidUrl(string) {
      try {
        const url = new URL(string);
        return ['http:', 'https:'].includes(url.protocol);
      } catch (_) {
        return false;
      }
    },

    clearError(field) {
      if (this.errors[field]) delete this.errors[field];
    },

    submitForm() {
      if (!this.validateForm()) {
        this.scrollToFirstError();
        return Swal.fire("Error de Validación", "Por favor, corrige los errores.", "error");
      }
      this.$emit('submit', this.formData); 
    },

    saveAsDraft() {
      if (!this.validateForm()) {
        this.scrollToFirstError();
        return Swal.fire("Error de Validación", "Corrige los errores antes de guardar.", "error");
      }
      this.$emit('save-draft', this.formData);
    },

    scrollToFirstError() {
      this.$nextTick(() => {
        const firstErrorField = document.querySelector('.is-invalid');
        if (firstErrorField) {
          firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
          firstErrorField.focus({ preventScroll: true });
        }
      });
    },

    previewContent() {
      if (!this.formData.contenido || this.formData.contenido.trim() === '') {
        return Swal.fire("Contenido Vacío", "No hay nada que previsualizar.", "warning");
      }
      this.showRichTextEditor = true;
    },

    confirmReset() {
      Swal.fire({
        title: '¿Estás seguro?',
        text: "Se borrarán todos los datos del formulario.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Sí, limpiar',
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.isConfirmed) {
          this.resetForm();
        }
      });
    },

    resetForm() {
      this.$emit('reset');
    },

    handleImageError() {
      this.errors.imagen_url = 'No se pudo cargar la imagen desde la URL.';
      // Opcional: mostrar un Swal de error
    },


    // --- MÉTODOS MEJORADOS Y NUEVOS PARA EL MODAL ---
    openImageUploadModal() {
      // Resetear estado del modal al abrir
      this.activeTab = 'upload';
      this.clearSelectedFile();
      this.urlToLink = '';
      this.urlPreview = '';
      this.urlPreviewError = false;
      if (this.imageUploadModalInstance) {
        this.imageUploadModalInstance.show();
      }
    },

    closeModal() {
      if (this.imageUploadModalInstance) {
        this.imageUploadModalInstance.hide();
      }
    },

    createObjectURL(file) {
      return file ? URL.createObjectURL(file) : '';
    },

    clearSelectedFile() {
      this.selectedFile = null;
      if (this.$refs.fileInput) this.$refs.fileInput.value = '';
    },

    handleFileSelect(event) {
      console.log("Archivo seleccionado", event.target.files[0]);
      if (event.target.files && event.target.files[0]) {
        this.processFile(event.target.files[0]);
      }
    },

    handleDrop(event) {
      this.isDragOver = false;
      if (event.dataTransfer.files && event.dataTransfer.files[0]) {
        this.processFile(event.dataTransfer.files[0]);
      }
    },

    handlePaste(event) {
      // Solo actuar si el modal está abierto
      if (!this.imageUploadModalInstance || !this.imageUploadModalInstance._isShown) return;

      const items = (event.clipboardData || event.originalEvent.clipboardData).items;
      for (const item of items) {
        if (item.type.indexOf('image') === 0) {
          const file = item.getAsFile();
          this.processFile(file);
          // Cambiar a la pestaña de subida si el usuario estaba en la de URL
          this.activeTab = 'upload';
          break;
        }
      }
    },

    processFile(file) {
      if (!file.type.startsWith('image/')) {
        return Swal.fire("Archivo No Válido", "Por favor, selecciona un archivo de imagen.", "error");
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB
        return Swal.fire("Archivo Pesado", "El tamaño máximo permitido es 5MB.", "error");
      }
      this.selectedFile = file;
    },

    previewUrl() {
      this.urlPreviewError = false;
      if (this.isValidUrl(this.urlToLink)) {
        this.urlPreview = this.urlToLink;
      } else {
        this.urlPreview = '';
        Swal.fire("URL Inválida", "Por favor, introduce una URL válida.", "error");
      }
    },

    async confirmSelection() {
      if (this.activeTab === 'upload' && this.selectedFile) {
        await this.uploadImage();
      } else if (this.activeTab === 'url' && this.urlPreview && !this.urlPreviewError) {
        this.formData.imagen_url = this.urlPreview;
        this.closeModal();
      }
    },

    async uploadImage() {
      if (!this.selectedFile) return;
      this.isSubmittingUpload = true;
      this.uploadProgress = 0;
      const uploadFormData = new FormData();
      uploadFormData.append('image', this.selectedFile);

      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const response = await axios.post(`${apiUrl}/api/upload`, uploadFormData, {
          onUploadProgress: (e) => {
            if (e.total) this.uploadProgress = Math.round((e.loaded * 100) / e.total);
          }
        });
        if (response.data && response.data.url) {
          // AHORA, EN LUGAR DE ACTUALIZAR EL ESTADO LOCAL,
          // EMITIMOS EL EVENTO AL PADRE CON LA NUEVA URL.
          this.$emit('update:imageUrl', response.data.url);
          this.closeModal();
        }
      } catch (error) {
        console.error("Error al subir imagen:", error);
        Swal.fire("Error al Subir", "No se pudo subir la imagen.", "error");
      } finally {
        this.isSubmittingUpload = false;
        this.uploadProgress = 0;
      }
    },
  },

  mounted() {
    this.interval = setInterval(() => {
      this.currentDateTime = this.formatDateTime(new Date());
      this.minExpirationDateTime = this.calculateMinExpirationDateTime();
    }, 60000);

    const modalElement = document.getElementById('imageUploadModal');
    if (modalElement) {
      this.imageUploadModalInstance = new Modal(modalElement);
    }

    // Añadir listener para pegar imágenes
    window.addEventListener('paste', this.handlePaste);
  },

  beforeUnmount() {
    clearInterval(this.interval);
    if (this.imageUploadModalInstance) {
      this.imageUploadModalInstance.dispose();
    }
    if (this.selectedFile) {
      URL.revokeObjectURL(this.createObjectURL(this.selectedFile));
    }
    // Limpiar listener
    window.removeEventListener('paste', this.handlePaste);
  },

  watch: {
    noticia: {
      handler(newVal) {
        this.formData = { ...newVal };
        this.errors = {};
        this.showRichTextEditor = false;
      },
      deep: true,
      immediate: true
    }
  }
};
</script>

<style scoped>
.noticia-form {
  background: var(--color-surface);
  border-radius: var(--border-radius-md);
  padding: 24px;
}

.form-label {
  font-weight: var(--font-weight-medium);
  color: var(--color-text);
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.form-label span.text-danger {
  margin-left: 4px;
}

.form-control,
.form-select {
  border-radius: var(--border-radius-md);
  padding: 10px 15px;
  transition: all var(--transition-speed) ease;
  font-size: .95rem;
  background-color: var(--color-background);
  color: var(--color-text);
  border-color: var(--color-border);
}

.form-control:focus,
.form-select:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 .25rem rgba(29, 53, 87, 0.15);
  background-color: var(--color-surface);
}

.form-control.is-invalid,
.form-select.is-invalid {
  border-color: var(--color-danger);
}

.form-control.is-invalid:focus,
.form-select.is-invalid:focus {
  box-shadow: 0 0 0 .25rem rgba(220, 53, 69, .25);
}

.form-control-plaintext {
  border: 1px solid var(--color-border);
  padding: 10px 15px;
  background-color: var(--color-background) !important;
}

.preview-img {
  max-width: 100%;
  height: auto;
  max-height: 200px;
  border-radius: var(--border-radius-md);
  transition: transform .3s ease, opacity .4s ease;
  object-fit: cover;
  border: 1px solid var(--color-border);
}

.preview-img:hover {
  transform: scale(1.03);
}

.content-preview {
  min-height: 150px;
  max-height: 400px;
  overflow-y: auto;
  background-color: var(--color-background);
  border-color: var(--color-border);
  font-size: .9rem;
}

.content-preview > div > :first-child {
  margin-top: 0;
}

.content-preview > div > :last-child {
  margin-bottom: 0;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: var(--border-radius-md);
  font-weight: var(--font-weight-medium);
  transition: all .2s ease;
  letter-spacing: .5px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity .4s ease, transform .4s ease
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px)
}

/* Estilos para el Modal de Subida de Archivos */
.media-modal-content {
  border-radius: var(--border-radius-md);
  border: none;
  box-shadow: var(--shadow-medium);
  background-color: var(--color-surface);
}

.media-modal-content .modal-header {
  background-color: var(--color-background);
  border-bottom: 1px solid var(--color-border);
  color: var(--color-text);
}

.media-modal-content .nav-link {
  color: var(--color-text-muted);
  font-weight: var(--font-weight-medium);
  border-bottom: 3px solid transparent;
  transition: all 0.2s ease-in-out;
}

.media-modal-content .nav-link.active {
  color: var(--color-primary);
  background-color: transparent !important;
  border-bottom-color: var(--color-primary);
}

.media-modal-content .nav-link:hover {
  color: var(--color-primary);
  border-bottom-color: rgba(29, 53, 87, 0.5);
}

.drop-zone {
  border: 2px dashed var(--color-border);
  border-radius: var(--border-radius-md);
  padding: 40px;
  text-align: center;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out, border-color 0.2s ease-in-out;
}

.drop-zone:hover, .drop-zone.is-drag-over {
  background-color: var(--color-background);
  border-color: var(--color-primary);
}

.drop-zone.is-drag-over {
  border-style: solid;
}

.preview-zone {
  border: 2px solid var(--color-border);
  border-radius: var(--border-radius-md);
  padding: 20px;
}

.preview-img-modal {
  max-width: 100%;
  max-height: 250px;
  border-radius: var(--border-radius-md);
  object-fit: contain;
  box-shadow: var(--shadow-soft);
}

.remove-preview-btn {
  position: absolute;
  top: -10px;
  right: -10px;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}
</style>