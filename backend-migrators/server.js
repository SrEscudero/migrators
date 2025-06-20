// =================================================================
// IMPORTS
// =================================================================
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cron from 'node-cron';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import helmet from 'helmet'; 


// --- Import de la configuración de DB ---
import { connectDB } from './src/config/db.js';

// --- Import de Rutas ---
import noticiasRoutes from './src/routes/noticiasRoutes.js';
import newsRoutes from './src/routes/newsRoutes.js';
import hubspotRoutes from './src/routes/hubspotRoutes.js';
import userRoutes from './src/routes/userRoutes.js';
import adminRoutes from './src/routes/adminRoutes.js';

// --- Import de Servicios ---
import { logIP, getVisitorStats } from './src/services/visitorServices.js';

// =================================================================
// CONFIGURACIÓN INICIAL
// =================================================================
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// =================================================================
// MIDDLEWARES
// =================================================================

app.use(helmet());

// --- Configuración CORS ---
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://192.168.56.1:5173',
  'http://192.168.3.30:5173',
  'http://192.168.18.76:5173',
  'http://192.168.3.83:5173',
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// --- Middlewares para parsear el body y servir archivos estáticos ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// --- Logging de solicitudes ---
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// =================================================================
// CONFIGURACIÓN DE UPLOADS (MULTER)
// =================================================================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'public', 'uploads');
    fs.mkdirSync(uploadDir, { recursive: true }); // Asegura que el directorio exista
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    if (filetypes.test(file.mimetype) && filetypes.test(path.extname(file.originalname).toLowerCase())) {
      return cb(null, true);
    }
    cb(new Error('Solo se permiten imágenes (JPEG, PNG, GIF)'));
  }
});

// =================================================================
// CONEXIÓN A LA BASE DE DATOS
// =================================================================
connectDB().catch(err => console.error("Fallo inicial de conexión a DB:", err.message));


// =================================================================
// RUTAS DE LA APLICACIÓN
// =================================================================

// --- Rutas de Administración ---
app.use('/api/admin', adminRoutes);

// --- Rutas de Usuarios ---
app.use('/api/usuarios', userRoutes);

// --- Rutas existentes ---
app.use('/api/noticias', noticiasRoutes);
app.use('/api/news', newsRoutes); // Considera unificar /news y /noticias si son lo mismo
app.use('/api/hubspot', hubspotRoutes);

// Ruta para subir imágenes
app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'No se subió ningún archivo' });
  }

  const imageUrl = `/uploads/${req.file.filename}`; // Devolvemos solo la ruta relativa

  res.json({ success: true, url: imageUrl });
});

// --- Rutas de Tracking y Estadísticas ---
app.get('/api/track-visit', async (req, res) => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  try {
    await logIP(ip);
    res.json({ message: "Visita registrada correctamente" });
  } catch (error) {
    res.status(500).json({ error: "Error al registrar visita" });
  }
});

app.get('/api/stats', async (req, res) => {
  try {
    const stats = await getVisitorStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener estadísticas" });
  }
});


// =================================================================
// CRON JOB (TAREAS PROGRAMADAS)
// =================================================================
cron.schedule('0 * * * *', async () => {
  console.log('🕒 Ejecutando cron job para eliminar borradores antiguos...');
  try {
    const pool = await connectDB();
    const limitDate = new Date(Date.now() - 72 * 60 * 60 * 1000); // 72 horas atrás

    const result = await pool.request()
      .input('limitDate', sql.DateTime, limitDate)
      .query("DELETE FROM Noticias WHERE estado = 'borrador' AND fecha_registro <= @limitDate");

    console.log(`✅ Cron job: ${result.rowsAffected[0]} borradores eliminados.`);
  } catch (error) {
    console.error('❌ Cron job: Error al eliminar borradores antiguos:', error.message);
  }
});

// Se ejecuta cada hora para archivar noticias expiradas.
cron.schedule('0 * * * *', async () => {
  console.log('🕒 Ejecutando cron job para archivar noticias expiradas...');
  try {
    const pool = await connectDB();
    const result = await pool.request()
      .input('estadoPublicado', sql.NVarChar, 'publicado')
      .input('estadoArchivado', sql.NVarChar, 'archivado')
      .query(`
        UPDATE Noticias 
        SET estado = @estadoArchivado 
        WHERE estado = @estadoPublicado AND fecha_expiracion < GETDATE()
      `);
    
    if (result.rowsAffected[0] > 0) {
      console.log(`✅ Cron job: ${result.rowsAffected[0]} noticias expiradas fueron archivadas.`);
    } else {
      console.log('✅ Cron job: No se encontraron noticias para archivar.');
    }
  } catch (error) {
    console.error('❌ Cron job: Error al archivar noticias:', error.message);
  }
});

// =================================================================
// MANEJO DE ERRORES Y ARRANQUE DEL SERVIDOR
// =================================================================

// --- Manejo de errores global ---
app.use((err, req, res, next) => {
  console.error('🔥 Error global:', err.stack || err.message);
  res.status(err.status || 500).json({
    error: err.message || 'Error interno del servidor',
  });
});

// --- Iniciar servidor ---
// Solo inicia el servidor si el archivo se ejecuta directamente
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor backend corriendo en http://0.0.0.0:${PORT}`);
  });
}

// Exporta la app para que pueda ser utilizada por Supertest
export default app;