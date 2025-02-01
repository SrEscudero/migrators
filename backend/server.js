const express = require('express');
const sql = require('mssql');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Leer la configuración desde el archivo JSON
const dbConfigPath = path.join(__dirname, '../config/config_db.json');
let dbConfig;
try {
    dbConfig = JSON.parse(fs.readFileSync(dbConfigPath, 'utf-8'));
} catch (err) {
    console.error('Error al leer el archivo config_db.json:', err.message);
    process.exit(1); // Detiene la ejecución si hay un error
}

// Parsear la string de conexión
const connectionString = dbConfig.StringConection;
if (!connectionString) {
    console.error('Error: La propiedad "StringConection" no está definida en config_db.json');
    process.exit(1);
}

const [serverPart, dbPart, userPart, passwordPart] = connectionString.split(';').filter(Boolean);

// Validar que todas las partes estén presentes
if (!serverPart || !dbPart || !userPart || !passwordPart) {
    console.error('Error: La cadena de conexión en config_db.json está incompleta');
    process.exit(1);
}

// Extraer los detalles de conexión desde el string
const server = serverPart.split('=')[1];
const database = dbPart.split('=')[1];
const user = userPart.split('=')[1];
const password = passwordPart.split('=')[1];

// Mostrar los valores extraídos para depuración
console.log('Server:', server);
console.log('Database:', database);
console.log('User:', user);
console.log('Password:', password);

// Configuración para el paquete `mssql`
const sqlConfig = {
    server,
    database,
    user,
    password,
    options: {
        encrypt: false, // Desactiva el cifrado si usas una instancia local
        trustServerCertificate: true, // Necesario para conexiones locales
        requestTimeout: 30000 // Tiempo de espera para consultas SQL
    },
    pool: {
        max: 10, // Número máximo de conexiones en el pool
        min: 0,  // Número mínimo de conexiones en el pool
        idleTimeoutMillis: 30000 // Tiempo de inactividad antes de cerrar una conexión
    }
};

// Conexión a la base de datos
sql.connect(sqlConfig)
    .then(() => {
        console.log('Conectado a SQL Server usando StringConection');
        console.log('Base de datos:', database); // Muestra la base de datos
    })
    .catch((err) => {
        console.error('Error al conectar:', err.message); // Muestra el mensaje de error específico
        console.error('Detalles del error:', err);
        process.exit(1); // Detener el servidor si no se puede conectar
    });

// Ruta raíz para verificar que el servidor está funcionando
app.get('/', (req, res) => {
    res.send('Servidor funcionando correctamente con StringConection');
});

// Ruta para obtener todas las noticias
app.get('/api/noticias', async (req, res) => {
    try {
        const result = await sql.query`SELECT * FROM noticias ORDER BY fecha_publicacion DESC`;
        if (result.recordset.length === 0) {
            return res.status(404).send('No hay noticias disponibles');
        }
        res.json(result.recordset);
    } catch (err) {
        console.error('Error al obtener noticias:', err.message);
        res.status(500).send(`Error al obtener noticias: ${err.message}`);
    }
});

// Ruta para crear una nueva noticia
app.post('/api/noticias', async (req, res) => {
    const { titulo, contenido, autor, image_url } = req.body;

    // Depuración: Mostrar los datos recibidos
    console.log('Datos recibidos:', req.body);

    // Validar campos obligatorios
    if (!titulo || !contenido || !autor) {
        return res.status(400).send('Faltan campos obligatorios: titulo, contenido, autor');
    }

    // Validar tipos de datos
    if (typeof titulo !== 'string' || typeof contenido !== 'string' || typeof autor !== 'string') {
        return res.status(400).send('Los campos deben ser cadenas de texto');
    }

    try {
        // Insertar la noticia en la base de datos
        const result = await sql.query`
            INSERT INTO noticias (titulo, contenido, autor, image_url)
            VALUES (${titulo}, ${contenido}, ${autor}, ${image_url})
        `;

        console.log('Noticia creada:', result); // Depuración
        res.status(201).send('Noticia creada correctamente');
    } catch (err) {
        console.error('Error al crear noticia:', err.message);

        // Manejo de errores específicos
        if (err.code === 'EREQUEST') {
            res.status(500).send(`Error en la consulta SQL: ${err.message}`);
        } else {
            res.status(500).send(`Error desconocido: ${err.message}`);
        }
    }
});

// Ruta para eliminar una noticia por ID
app.delete('/api/noticias/:id', async (req, res) => {
    const { id } = req.params;

    try {
        // Eliminar la noticia de la base de datos
        await sql.query`DELETE FROM noticias WHERE id = ${id}`;
        res.status(200).send('Noticia eliminada correctamente');
    } catch (err) {
        console.error('Error al eliminar noticia:', err.message);
        res.status(500).send(`Error al eliminar noticia: ${err.message}`);
    }
});

// Servidor escuchando en el puerto 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});