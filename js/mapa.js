// Inicializar el mapa de OpenStreetMap centrado en Brasil
var map = L.map('map').setView([-30.0331, -51.2300], 13); // Coordenadas iniciales
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

// Crear un marcador de búsqueda para almacenar los puntos de la ciudad
var markers = L.layerGroup().addTo(map);

// Datos de los puntos de atención
var puntos = [];

// Función para cargar los datos desde el archivo JSON
function cargarJson() {
    fetch('../data/direcciones.json')
        .then(response => response.json())
        .then(data => {
            puntos = data; // Guardar los datos cargados
            console.log("Datos cargados:", puntos); // Verifica si los datos se cargan correctamente
        })
        .catch(error => console.error("Error al cargar los puntos: ", error));
}

// Función para normalizar texto
function normalizarTexto(texto) {
    return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

// Función para obtener los puntos de una ciudad desde el JSON
function obtenerPuntosDeCiudad(ciudad) {
    return puntos.filter(punto => normalizarTexto(punto.ciudad) === normalizarTexto(ciudad));
}

// Función para buscar una ciudad y mostrar los puntos en el mapa
function buscarCiudad(ciudad) {
    if (ciudad.length < 3) return; // Evitar búsquedas de texto demasiado corto

    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${ciudad}&limit=1`)
        .then(response => response.json())
        .then(data => {
            if (data.length > 0) {
                var lat = parseFloat(data[0].lat);
                var lon = parseFloat(data[0].lon);
                map.setView([lat, lon], 13); // Centrar el mapa en la ciudad

                // Limpiar puntos anteriores
                markers.clearLayers();

                // Obtener puntos filtrados de la ciudad
                var puntosFiltrados = obtenerPuntosDeCiudad(ciudad);
                console.log("Puntos filtrados:", puntosFiltrados); // Verifica los puntos filtrados

                if (puntosFiltrados.length > 0) {
                    // Agregar los puntos de atención al mapa
                    puntosFiltrados.forEach(punto => {
                        L.marker([punto.lat, punto.lng]).addTo(markers)
                            .bindPopup(`<b>${punto.nome}</b><br>${punto.endereco}`);
                    });

                    // Actualizar el dropdown con los puntos de atención
                    actualizarDropdown(puntosFiltrados);
                } else {
                    console.log(`No se encontraron puntos de atención en ${ciudad}.`);
                    actualizarDropdown([]);
                }
            } else {
                console.log("Ciudad no encontrada. Intenta nuevamente.");
            }
        })
        .catch(error => console.log("Error al buscar la ciudad: ", error));
}

// Función para actualizar el dropdown con las direcciones
function actualizarDropdown(puntosFiltrados) {
    const dropdown = document.getElementById('direcciones-dropdown');
    dropdown.innerHTML = '<option value="">Selecciona un punto de atención</option>'; // Limpiar opciones previas

    // Agregar las opciones al dropdown
    puntosFiltrados.forEach((punto, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = `${punto.nome} - ${punto.endereco}`;
        dropdown.appendChild(option);
    });
}

// Manejar la entrada de búsqueda en el campo de texto
let debouncerTimer;
document.getElementById('search-city').addEventListener('input', function (event) {
    const ciudad = event.target.value;

    if (ciudad.length > 2) {
        clearTimeout(debouncerTimer);

        debouncerTimer = setTimeout(() => {
            buscarCiudad(ciudad);
        }, 500);
    } else {
        clearTimeout(debouncerTimer);
        markers.clearLayers(); // Limpiar el mapa si el texto es demasiado corto
        actualizarDropdown([]);
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

// Cargar los datos del JSON al iniciar
cargarJson();

// Recalcular el tamaño del mapa al cambiar el tamaño de la ventana
window.addEventListener('resize', function () {
    map.invalidate();
});

// Recalcular el tamaño del mapa al cambiar la pestaña  
map.on('load', function () {
    map.invalidateSize();
});