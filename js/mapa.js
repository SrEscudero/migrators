// Inicializar el mapa de OpenStreetMap centrado en Brasil
var map = L.map('map').setView([-30.0331, -51.2300], 13); // Coordenadas iniciales
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

// Crear un marcador de búsqueda para almacenar los puntos de la ciudad
var markers = L.layerGroup().addTo(map);

// Datos de los puntos de atención
var puntos = [
    {
        ciudad: "Passo Fundo",
        lat: -28.25370919608534,
        lng: -52.393565482571496,
        nombre: "Passo Fundo - Atención General",
        direccion: "Av. Brasil Leste, 200 - Petrópolis, Passo Fundo - RS, 99050-073"
    }
];

// Función para realizar la búsqueda de la ciudad
function buscarCiudad(ciudad) {
    // Evitar búsquedas de texto demasiado corto

    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${ciudad}&limit=1`)
        .then(response => response.json())
        .then(data => {
            if (data.length > 0) {
                var lat = parseFloat(data[0].lat);
                var lon = parseFloat(data[0].lon);
                map.setView([lat, lon], 13); // Centrar el mapa en la ciudad

                // Limpiar puntos anteriores
                markers.clearLayers();

                // Filtrar los puntos de atención relacionados con la ciudad
                var puntosFiltrados = puntos.filter(punto => punto.ciudad.toLowerCase() === ciudad.toLowerCase());

                if (puntosFiltrados.length > 0) {
                    // Agregar los puntos de atención al mapa
                    puntosFiltrados.forEach(punto => {
                        L.marker([punto.lat, punto.lng]).addTo(markers)
                            .bindPopup(`<b>${punto.nombre}</b><br>${punto.direccion}`);
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
        option.textContent = `${punto.nombre} - ${punto.direccion}`;
        dropdown.appendChild(option);
    });
}

let debouncerTimer;

function buscarCiudadEvent(ciudad) {
    //var ciudad = event.target.value;

    if (ciudad.length > 2) {
        clearTimeout(debouncerTimer);

        debouncerTimer = setTimeout(() => {
            buscarCiudad(ciudad);
        }, 500
        );
    } else {
        clearTimeout(debouncerTimer);
    }
}
// Manejar la entrada de búsqueda en el campo de texto
document.getElementById('search-city').addEventListener('input', function (event) {
    if (event.key === 'Enter') {

        buscarCiudadEvent(event.target.value);
    }
    else {
        buscarCiudadEvent(event.target.value);
    }
});

// Manejar el cambio en el dropdown (si el usuario selecciona una opción)
document.getElementById('direcciones-dropdown').addEventListener('change', function(event) {
    const selectedIndex = event.target.value;
    if (selectedIndex) {
        const puntoSeleccionado = puntos[selectedIndex];
        map.setView([puntoSeleccionado.lat, puntoSeleccionado.lng], 15);
        L.marker([puntoSeleccionado.lat, puntoSeleccionado.lng]).addTo(map)
            .bindPopup(`<b>${puntoSeleccionado.nombre}</b><br>${puntoSeleccionado.direccion}`)
            .openPopup();
    }
});
