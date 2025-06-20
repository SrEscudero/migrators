<template>
  <div class="page-noticias">
    <main class="main-content-area py-4 py-lg-5">
      <div class="container">
        <section class="mb-5 pb-4 section-block">
          <MigratorsNews />
        </section>

        <hr class="custom-separator my-5" />

        <section class="section-block" aria-labelledby="otras-noticias-heading">
          <h2 id="otras-noticias-heading" class="section-title text-center">
            Otras Noticias sobre Migración
          </h2>
          <p class="section-description text-center mb-5">
            Mantente informado con actualidad de fuentes externas.
          </p>

          <div class="row mb-4 justify-content-center">
            <div class="col-md-10 col-lg-8">
              <form
                @submit.prevent="applyFilters"
                class="filters-form shadow-sm p-3 p-md-4 rounded"
              >
                <div class="input-group filter-input-group">
                  <span class="input-group-text"><i class="fas fa-search"></i></span>
                  <input
                    v-model="filters.query"
                    type="text"
                    class="form-control"
                    placeholder="Buscar en noticias externas..."
                    aria-label="Buscar en noticias externas"
                  />
                </div>
                <div class="input-group filter-input-group">
                  <span class="input-group-text"><i class="fas fa-tags"></i></span>
                  <select v-model="filters.category" class="form-select" aria-label="Categoría de noticias externas">
                    <option value="">Todas las categorías</option>
                    <option value="general">General</option>
                    <option value="business">Negocios</option>
                    <option value="health">Salud</option>
                    <option value="science">Ciencia</option>
                    <option value="technology">Tecnología</option>
                  </select>
                </div>
                <button type="submit" class="btn btn-primary filter-submit-btn">
                  <i class="fas fa-filter me-2"></i>Filtrar
                </button>
              </form>
            </div>
          </div>

          <NewsList :filters="filters" />
        </section>
      </div>
    </main>
  </div>
</template>

<script>
import NewsList from "@/components/Noticias/NewsList.vue";
import MigratorsNews from "@/components/Noticias/MigratorsNews.vue";

export default {
  name: 'PaginaNoticias',
  components: { NewsList, MigratorsNews },
  data() {
    return {
      filters: {
        query: "",
        category: "",
      },
    };
  },
  methods: {
    applyFilters() {
      // La lógica principal de recarga de datos está en el watch de NewsList.vue
      // Aquí podrías añadir validaciones o transformaciones a los filtros si fuera necesario
      console.log("Filtros enviados a NewsList:", JSON.parse(JSON.stringify(this.filters)));
    }
  }
};
</script>

<style scoped>
.page-noticias {
  --pg-noticias-font-family: 'Poppins', sans-serif;
  --pg-noticias-title-color: #2c3e50; /* Azul oscuro corporativo */
  --pg-noticias-text-color: #495057;
  --pg-noticias-primary-accent: #007bff; /* Un azul brillante para acentos */
  --pg-noticias-light-bg: #f8f9fa;
  --pg-noticias-border-color: #e0e6ed;
  --pg-noticias-shadow: 0 4px 12px rgba(0,0,0,0.08);

  font-family: var(--pg-noticias-font-family);
  background-color: var(--pg-noticias-light-bg); /* Fondo general de la página de noticias */
}

.main-content-area {
  padding-top: 2rem; /* Espacio desde el header si existe */
  padding-bottom: 3rem;
}

.section-block {
  background-color: #ffffff; /* Fondo blanco para las secciones dentro del bg general */
  padding: 2.5rem 1.5rem;
  border-radius: 12px;
  box-shadow: var(--pg-noticias-shadow);
}
.section-block:not(:last-child) {
    margin-bottom: 3rem;
}


.section-title {
  font-family: var(--pg-noticias-font-family);
  font-weight: 700;
  color: var(--pg-noticias-title-color);
  font-size: clamp(1.8rem, 4vw, 2.4rem);
  margin-bottom: 0.75rem !important;
  position: relative;
  padding-bottom: 0.5rem;
}
.section-title::after {
  content: '';
  display: block;
  width: 60px;
  height: 3px;
  background-color: var(--pg-noticias-primary-accent);
  margin: 0.5rem auto 0;
  border-radius: 2px;
}
.section-description {
  font-size: clamp(1rem, 2.5vw, 1.1rem);
  color: var(--pg-noticias-text-muted-color, #6c757d);
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
}

.custom-separator {
  border: 0;
  height: 1px;
  background-image: linear-gradient(to right, transparent, var(--pg-noticias-border-color), transparent);
  margin-top: 2rem;
  margin-bottom: 3rem;
}

.filters-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  background-color: var(--pg-noticias-form-bg, #ffffff);
  border: 1px solid var(--pg-noticias-border-color);
  padding: 1.5rem; /* Más padding */
}

.filter-input-group .input-group-text {
    background-color: #eef2f7; /* Fondo más suave para el icono */
    border-color: var(--pg-noticias-border-color);
    border-right: none;
    color: var(--pg-noticias-primary-accent);
}
.filter-input-group .form-control, 
.filter-input-group .form-select {
    border-left: none;
    border-color: var(--pg-noticias-border-color);
}
.filter-input-group .form-control:focus, 
.filter-input-group .form-select:focus {
    border-color: var(--pg-noticias-primary-accent);
    box-shadow: 0 0 0 0.2rem rgba(0,123,253,.15);
}
.filter-submit-btn {
    background-color: var(--pg-noticias-primary-accent);
    border-color: var(--pg-noticias-primary-accent);
    font-weight: 500;
}
.filter-submit-btn:hover {
    background-color: #0056b3; /* Un azul más oscuro */
    border-color: #0056b3;
}

@media (min-width: 768px) {
  .filters-form {
    flex-direction: row;
    align-items: center; /* Alinear verticalmente */
  }
  .filters-form > .filter-input-group {
    flex: 1;
  }
}
</style>