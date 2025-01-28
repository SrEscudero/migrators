async function obtenerNoticias() {
  try {
      // Cargar configuración
      const responseConfig = await fetch('./config/config_noticias.json');
      const config = await responseConfig.json();

      const lastUpdate = localStorage.getItem("lastUpdate");
      const now = new Date().getTime();
      const hoursSinceLastUpdate = lastUpdate ? (now - lastUpdate) / (1000 * 60 * 60) : Infinity;

      // Si ya se actualizó en menos de las horas configuradas, no hacer otra petición
      if (hoursSinceLastUpdate < config.updateIntervalHours) {
          console.log("Usando noticias en caché");
          return mostrarNoticias(JSON.parse(localStorage.getItem("cachedNews")));
      }

      // Construir la URL con la configuración
      let url = `${config.newsApiUrl}?q=${encodeURIComponent(config.query)}&language=${config.language}&pageSize=${config.pageSize}&apiKey=${config.apiKey}`;
      let response = await fetch(url);
      let data = await response.json();

      // Si no hay noticias relevantes, usar la consulta alternativa
      if (data.articles.length === 0) {
          url = `${config.newsApiUrl}?q=${encodeURIComponent(config.backupQuery)}&language=${config.language}&pageSize=${config.pageSize}&apiKey=${config.apiKey}`;
          response = await fetch(url);
          data = await response.json();
      }

      // Guardar en caché para evitar llamadas innecesarias
      localStorage.setItem("cachedNews", JSON.stringify(data.articles));
      localStorage.setItem("lastUpdate", now);

      mostrarNoticias(data.articles);
  } catch (error) {
      console.error("Error al obtener noticias:", error);
  }
}

function mostrarNoticias(noticias) {
  const contenedor = document.querySelector(".noticias-carousel-container");
  contenedor.innerHTML = "";

  noticias.forEach(noticia => {
      const noticiaElemento = document.createElement("div");
      noticiaElemento.classList.add("noticia");

      noticiaElemento.innerHTML = `
          <img src="${noticia.urlToImage || 'default-image.jpg'}" alt="Noticia">
          <h3>${noticia.title}</h3>
          <p>${noticia.description || "Descripción no disponible."}</p>
          <a href="${noticia.url}" target="_blank">Leer más</a>
      `;

      contenedor.appendChild(noticiaElemento);
  });
}

// Llamar a la función al cargar la página
document.addEventListener("DOMContentLoaded", obtenerNoticias);
