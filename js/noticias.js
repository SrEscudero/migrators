async function obtenerNoticias() {
    try {
        // Cargar configuración desde JSON
        const responseConfig = await fetch('./config/config_noticias.json');
        const config = await responseConfig.json();

        // Obtener el tiempo de la última actualización
        const lastUpdate = localStorage.getItem("lastUpdate");
        const now = new Date().getTime();
        const hoursSinceLastUpdate = lastUpdate ? (now - lastUpdate) / (1000 * 60 * 60) : Infinity;

        // Si se actualizó recientemente, usar caché
        if (hoursSinceLastUpdate < config.updateIntervalHours) {
            console.log("Usando noticias en caché");
            const cachedNews = localStorage.getItem("cachedNews");
            if (cachedNews) {
                return mostrarNoticias(JSON.parse(cachedNews));
            }
        }

        // Construcción de URL con parámetros
        let url = `${config.newsApiUrl}?q=${encodeURIComponent(config.query)}&language=${config.language}&pageSize=${config.pageSize}&apiKey=${config.apiKey}`;
        let response = await fetch(url);
        let data = await response.json();

        // Validar si hay noticias, si no, intentar con la consulta de respaldo
        if (!data.articles || data.articles.length === 0) {
            console.warn("No se encontraron noticias, probando con consulta alternativa...");
            url = `${config.newsApiUrl}?q=${encodeURIComponent(config.backupQuery)}&language=${config.language}&pageSize=${config.pageSize}&apiKey=${config.apiKey}`;
            response = await fetch(url);
            data = await response.json();
        }

        // Verificar si aún no hay noticias disponibles
        if (!data.articles || data.articles.length === 0) {
            console.error("No se encontraron noticias ni con la consulta alternativa.");
            return;
        }

        // Guardar en caché
        localStorage.setItem("cachedNews", JSON.stringify(data.articles));
        localStorage.setItem("lastUpdate", now);

        mostrarNoticias(data.articles);
    } catch (error) {
        console.error("Error al obtener noticias:", error);
    }
}

function mostrarNoticias(noticias) {
    const contenedor = document.querySelector(".noticias-carousel-container");
    contenedor.innerHTML = ""; // Limpiar contenido anterior

    noticias.forEach(noticia => {
        const noticiaElemento = document.createElement("div");
        noticiaElemento.classList.add("noticia");

        noticiaElemento.innerHTML = `
            <img src="${noticia.urlToImage || 'default-image.jpg'}" alt="Imagen de la noticia">
            <h3>${noticia.title}</h3>
            <p>${noticia.description || "Descripción no disponible."}</p>
            <a href="${noticia.url}" target="_blank">Leer más</a>
        `;

        contenedor.appendChild(noticiaElemento);
    });

    // Habilitar controles del carrusel
    configurarCarrusel();
}

function configurarCarrusel() {
    const track = document.getElementById("noticias-track");
    const prevBtn = document.getElementById("prev-btn");
    const nextBtn = document.getElementById("next-btn");

    prevBtn.addEventListener("click", () => {
        track.scrollBy({ left: -300, behavior: "smooth" });
    });

    nextBtn.addEventListener("click", () => {
        track.scrollBy({ left: 300, behavior: "smooth" });
    });
}

// Llamar a la función al cargar la página
document.addEventListener("DOMContentLoaded", obtenerNoticias);
