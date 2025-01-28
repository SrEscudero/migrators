// Variables para almacenar la configuración
let config = {};

// Cargar la configuración desde el archivo JSON
function cargarConfiguracion() {
    return fetch('./config/config_mapa.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al cargar la configuración');
            }
            return response.json();
        })
        .then(data => {
            config = data; // Guardar la configuración cargada
            console.log("Configuración cargada:", config);
        })
        .catch(error => {
            console.error("Error al cargar la configuración: ", error);
        });
}

// Inicializar el mapa de OpenStreetMap centrado en Brasil
var map;
var markers;
var overlayBloqueo;

function inicializarMapa() {
    map = L.map('map').setView(config.map.initialView, config.map.initialZoom);
    L.tileLayer(config.map.tileLayerURL).addTo(map);

    // Crear un grupo de capas para los marcadores
    markers = L.layerGroup().addTo(map);

    // Capa de bloqueo
    overlayBloqueo = L.layerGroup().addTo(map);

    // Mensaje de bloqueo
    var bloqueoMessage = L.divIcon({
        className: 'bloqueo-message',
        html: '<div class="bloqueo-overlay">Haz clic para desbloquear el mapa</div>',
        iconSize: [map.getSize().x, map.getSize().y]
    });

    L.marker([0, 0], { icon: bloqueoMessage }).addTo(overlayBloqueo);

    // Bloquear la interacción del mapa inicialmente
    map.scrollWheelZoom.disable();
    map.dragging.disable();
    map.touchZoom.disable();

    // Desbloquear el mapa al hacer clic
    map.on('click', function () {
        overlayBloqueo.clearLayers();
        map.scrollWheelZoom.enable();
        map.dragging.enable();
        map.touchZoom.enable();
    });
}

// Datos de los puntos de atención
var puntos = [];

// Función para cargar los datos desde el archivo JSON
function cargarJson() {
    fetch(config.data.direccionesURL)
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al cargar los datos');
            }
            return response.json();
        })
        .then(data => {
            puntos = data; // Guardar los datos cargados
            console.log("Datos cargados:", puntos);
        })
        .catch(error => {
            console.error("Error al cargar los puntos: ", error);
        });
}

// Función para normalizar texto
function normalizarTexto(texto) {
    return texto
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase();
}

// Función para obtener los puntos de una ciudad desde el JSON
function obtenerPuntosDeCiudad(ciudad) {
    return puntos.filter(punto => {
        const ciudadCoincide = normalizarTexto(punto.ciudad) === normalizarTexto(ciudad);
        const coordenadasValidas = !isNaN(punto.lat) && !isNaN(punto.lng);
        return ciudadCoincide && coordenadasValidas;
    });
}

// Función para buscar una ciudad y mostrar los puntos en el mapa
let fetchController = null;
let lastSearch = '';

function buscarCiudad(ciudad) {
    if (ciudad.length < 3) return;

    if (fetchController) {
        fetchController.abort(); // Cancelar la solicitud anterior
    }

    fetchController = new AbortController();

    fetch(`${config.api.nominatimURL}${ciudad}&limit=${config.api.limit}`, {
        signal: fetchController.signal
    })
        .then(response => response.json())
        .then(data => {
            if (data.length > 0) {
                var lat = parseFloat(data[0].lat);
                var lon = parseFloat(data[0].lon);
                map.setView([lat, lon], 13);

                markers.clearLayers();

                var puntosFiltrados = obtenerPuntosDeCiudad(ciudad);
                console.log("Puntos filtrados:", puntosFiltrados);

                if (puntosFiltrados.length > 0) {
                    puntosFiltrados.forEach(punto => {
                        L.marker([punto.lat, punto.lng]).addTo(markers)
                            .bindPopup(`<b>${punto.nome}</b><br>${punto.endereco}`);
                    });

                    actualizarDropdown(puntosFiltrados);
                } else {
                    console.log(`No se encontraron puntos de atención en ${ciudad}.`);
                    actualizarDropdown([]);
                }
            } else {
                console.log("Ciudad no encontrada. Intenta nuevamente.");
            }
        })
        .catch(error => {
            if (error.name !== 'AbortError') {
                console.log("Error al buscar la ciudad: ", error);
            }
        });
}

// Función para actualizar el dropdown con las direcciones
function actualizarDropdown(puntosFiltrados) {
    const dropdown = document.getElementById('direcciones-dropdown');
    dropdown.innerHTML = '<option value="">Selecciona un punto de atención</option>';

    puntosFiltrados.forEach((punto, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = `${punto.nome} - ${punto.endereco}`;
        dropdown.appendChild(option);
    });
}

// Manejar la entrada de búsqueda en el campo de texto
let debouncerTimer;
const searchInput = document.getElementById('search-city');

searchInput.addEventListener('input', function (event) {
    const ciudad = event.target.value.trim();

    if (ciudad.length > 2 && ciudad !== lastSearch) {
        clearTimeout(debouncerTimer);

        debouncerTimer = setTimeout(() => {
            lastSearch = ciudad;
            buscarCiudad(ciudad);
        }, 500); // Buscar después de 500ms de inactividad
    } else if (ciudad.length <= 2) {
        clearTimeout(debouncerTimer);
        markers.clearLayers();
        actualizarDropdown([]);
    }
});

// Buscar al presionar Enter
searchInput.addEventListener('keypress', function (event) {
    if (event.key === 'Enter') {
        const ciudad = event.target.value.trim();
        if (ciudad.length > 2) {
            buscarCiudad(ciudad);
        }
    }
});

// Manejar el cambio en el dropdown
document.getElementById('direcciones-dropdown').addEventListener('change', function (event) {
    const selectedIndex = event.target.value;
    if (selectedIndex) {
        const ciudad = document.getElementById('search-city').value;
        const puntosFiltrados = obtenerPuntosDeCiudad(ciudad);
        const puntoSeleccionado = puntosFiltrados[selectedIndex];
        map.setView([puntoSeleccionado.lat, puntoSeleccionado.lng], 15);
        L.marker([puntoSeleccionado.lat, puntoSeleccionado.lng]).addTo(map)
            .bindPopup(`<b>${puntoSeleccionado.nome}</b><br>${puntoSeleccionado.endereco}`)
            .openPopup();
    }
});

// Cargar la configuración y luego inicializar el mapa y cargar los datos
cargarConfiguracion().then(() => {
    inicializarMapa();
    cargarJson();
});

// Recalcular el tamaño del mapa al cambiar el tamaño de la ventana
window.addEventListener('resize', function () {
    map.invalidateSize();
});

// Recalcular el tamaño del mapa al cambiar la pestaña
window.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible') {
        map.invalidateSize();
    }
});