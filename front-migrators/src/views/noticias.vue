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
  /* Eliminamos las variables locales --pg-noticias-* */
  font-family: var(--font-family-base);
  background-color: var(--color-background);
}

.main-content-area {
  padding-top: 2rem;
  padding-bottom: 3rem;
}

.section-block {
  background-color: var(--color-surface);
  padding: 2.5rem 1.5rem;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-soft);
}

.section-block:not(:last-child) {
    margin-bottom: 3rem;
}

.section-title {
  font-family: var(--font-family-base);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
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
  background-color: var(--color-accent);
  margin: 0.5rem auto 0;
  border-radius: 2px;
}
.section-description {
  font-size: clamp(1rem, 2.5vw, 1.1rem);
  color: var(--color-text-muted);
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
}

.custom-separator {
  border: 0;
  height: 1px;
  background-image: linear-gradient(to right, transparent, var(--color-border), transparent);
  margin-top: 2rem;
  margin-bottom: 3rem;
}

.filters-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  padding: 1.5rem;
}

.filter-input-group .input-group-text {
    background-color: var(--color-background);
    border-color: var(--color-border);
    border-right: none;
    color: var(--color-primary-light);
}
.filter-input-group .form-control,
.filter-input-group .form-select {
    border-left: none;
    border-color: var(--color-border);
}
.filter-input-group .form-control:focus,
.filter-input-group .form-select:focus {
    border-color: var(--color-primary);
    box-shadow: 0 0 0 0.2rem rgba(29, 53, 87, 0.15);
}
.filter-submit-btn {
    background-color: var(--color-primary);
    border-color: var(--color-primary);
    font-weight: var(--font-weight-medium);
}
.filter-submit-btn:hover {
    background-color: var(--color-primary-light);
    border-color: var(--color-primary-light);
}

@media (min-width: 768px) {
  .filters-form {
    flex-direction: row;
    align-items: center;
  }
  .filters-form > .filter-input-group {
    flex: 1;
  }
}
</style>