<template>
  <section class="noticias-carousel">
    <h2 class="text-center mb-4">Últimas Noticias</h2>
    <div class="noticias-carousel-wrapper position-relative">
      <!-- Botón de desplazamiento a la izquierda -->
      <button
        class="carousel-control-prev position-absolute top-50 translate-middle-y"
        id="prev-btn"
        @click="scrollCarousel('prev')"
      >
        <span class="carousel-control-prev-icon" aria-hidden="true"></span>
        <span class="visually-hidden">Anterior</span>
      </button>
      <!-- Contenedor de noticias (Slider) -->
      <div class="noticias-carousel-container overflow-hidden">
        <div
          class="d-flex gap-3 flex-nowrap"
          ref="noticiasTrack"
          id="noticias-track"
        >
          <div
            v-for="(noticia, index) in noticias"
            :key="index"
            class="noticia card bg-light border-0 shadow-sm"
          >
            <img
              :src="noticia.urlToImage || config.defaultImage"
              class="card-img-top"
              :alt="noticia.title"
            />
            <div class="card-body p-3 text-center">
              <h5 class="card-title">{{ noticia.title }}</h5>
              <p class="card-text">{{ noticia.description || "Sin descripción" }}</p>
              <a
                :href="noticia.url"
                target="_blank"
                class="btn btn-primary btn-sm"
                >Leer más</a
              >
            </div>
          </div>
        </div>
      </div>
      <!-- Botón de desplazamiento a la derecha -->
      <button
        class="carousel-control-next position-absolute top-50 translate-middle-y"
        id="next-btn"
        @click="scrollCarousel('next')"
      >
        <span class="carousel-control-next-icon" aria-hidden="true"></span>
        <span class="visually-hidden">Siguiente</span>
      </button>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from "vue";

// Referencia al contenedor del carrusel
const noticiasTrack = ref(null);

// Variables reactivas
const noticias = ref([]);
const config = ref({});

// Función para desplazar el carrusel
const scrollCarousel = (direction) => {
  if (!noticiasTrack.value) return;

  const scrollAmount = 300; // Cantidad de píxeles a desplazar
  if (direction === "next") {
    noticiasTrack.value.scrollBy({ left: scrollAmount, behavior: "smooth" });
  } else if (direction === "prev") {
    noticiasTrack.value.scrollBy({ left: -scrollAmount, behavior: "smooth" });
  }
};

// Función para obtener noticias
async function obtenerNoticias() {
  try {
    // Cargar configuración desde JSON
    const responseConfig = await fetch("/config/config_noticias.json");
    config.value = await responseConfig.json();

    // Obtener el tiempo de la última actualización
    const lastUpdate = localStorage.getItem("lastUpdate");
    const now = new Date().getTime();
    const hoursSinceLastUpdate =
      lastUpdate ? (now - lastUpdate) / (1000 * 60 * 60) : Infinity;

    // Si se actualizó recientemente, usar caché
    if (hoursSinceLastUpdate < config.value.updateIntervalHours) {
      console.log("Usando noticias en caché");
      const cachedNews = localStorage.getItem("cachedNews");
      if (cachedNews) {
        noticias.value = JSON.parse(cachedNews);
        return;
      }
    }

    // Construcción de URL con parámetros
    let url = `${config.value.newsApiUrl}?q=${encodeURIComponent(
      config.value.query
    )}&language=${config.value.language}&pageSize=${config.value.pageSize}&apiKey=${config.value.apiKey}`;
    let response = await fetch(url);
    let data = await response.json();

    // Validar si hay noticias, si no, intentar con la consulta de respaldo
    if (!data.articles || data.articles.length === 0) {
      console.warn("No se encontraron noticias, probando con consulta alternativa...");
      url = `${config.value.newsApiUrl}?q=${encodeURIComponent(
        config.value.backupQuery
      )}&language=${config.value.language}&pageSize=${config.value.pageSize}&apiKey=${config.value.apiKey}`;
      response = await fetch(url);
      data = await response.json();
    }

    // Verificar si aún no hay noticias disponibles
    if (!data.articles || data.articles.length === 0) {
      console.error("No se encontraron noticias ni con la consulta alternativa.");
      return;
    }

    // Guardar en caché
    noticias.value = data.articles;
    localStorage.setItem("cachedNews", JSON.stringify(data.articles));
    localStorage.setItem("lastUpdate", now);
  } catch (error) {
    console.error("Error al obtener noticias:", error);
  }
}

// Llamar a la función al cargar el componente
onMounted(() => {
  obtenerNoticias();
});
</script>

<style scoped>
/* Estilos personalizados */
.noticias-carousel {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background-color: #fff;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-radius: 10px;
}

.noticias-carousel h2 {
  font-size: 1.8rem;
  margin-bottom: 15px;
  color: #333;
  font-weight: bold;
}

.noticias-carousel-wrapper {
  position: relative;
}

.noticias-carousel-container {
  overflow-x: auto;
  white-space: nowrap;
  scrollbar-width: none; /* Oculta el scrollbar en Firefox */
}

.noticias-carousel-container::-webkit-scrollbar {
  display: none; /* Oculta el scrollbar en Webkit */
}

.noticia {
  min-width: 250px;
  flex: 0 0 auto;
  border-radius: 10px;
  overflow: hidden;
  transition: transform 0.3s ease;
}

.noticia:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 10px rgba(0, 0, 0, 0.2);
}

.noticia img {
  width: 100%;
  height: 150px;
  object-fit: cover;
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
}

.card-body {
  padding: 10px;
}

.card-title {
  font-size: 1rem;
  margin-bottom: 0.5rem;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.card-text {
  font-size: 0.9rem;
  color: #666;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

.btn-primary {
  font-size: 0.875rem;
  padding: 0.5rem 1rem;
}

/* Botones de control */
.carousel-control-prev,
.carousel-control-next {
  z-index: 10;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  padding: 10px;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.3s ease;
}

.carousel-control-prev:hover,
.carousel-control-next:hover {
  background-color: rgba(0, 0, 0, 0.8);
}

/* Responsividad */
@media (max-width: 768px) {
  .noticia {
    min-width: 200px;
  }

  .noticia img {
    height: 120px;
  }
}
</style>