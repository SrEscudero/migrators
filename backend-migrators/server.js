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
import cookieParser from 'cookie-parser';
import compression from 'compression';
import session from 'express-session'; // <-- 1. IMPORTA express-session

// --- Import de la configuración de DB ---
import { connectDB, sql } from './src/config/db.js';

// --- Import del Logger ---
import logger from './src/config/logger.js';

// --- Import de Rutas ---
import noticiasRoutes from './src/routes/noticiasRoutes.js';
import newsRoutes from './src/routes/newsRoutes.js';
import hubspotRoutes from './src/routes/hubspotRoutes.js';
import userRoutes from './src/routes/userRoutes.js';
import adminRoutes from './src/routes/adminRoutes.js';
import forumRoutes from './src/routes/forumRoutes.js';

// --- NUEVOS IMPORTS para el seguimiento de visitantes ---
import { enrichIpData } from './src/services/ipLookupService.js';
import { visitanteRepository } from './src/repositories/visitanteRepository.js';

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

app.use(compression());
app.use(helmet());

const frontendURL = process.env.FRONTEND_URL || 'http://localhost:5173';

app.use(cors({
  origin: frontendURL,
  credentials: true, 
}));

app.use(express.json());
app.use(cookieParser()); // cookieParser debe ir ANTES de session
app.use(express.urlencoded({ extended: true }));

// =================================================================
// --- 2. AÑADE ESTE BLOQUE DE CÓDIGO AQUÍ ---
// =================================================================
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    rolling: true, 
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 10 * 60 * 1000, 
        sameSite: 'strict'
    }
}));
// =================================================================

app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

app.use((req, res, next) => {
    logger.http(`Request: ${req.method} ${req.originalUrl} - IP: ${req.ip}`);
    next();
});

// =================================================================
// CONFIGURACIÓN DE UPLOADS (MULTER)
// =================================================================
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, 'public', 'uploads');
        fs.mkdirSync(uploadDir, { recursive: true });
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
});

// =================================================================
// CONEXIÓN A LA BASE DE DATOS
// =================================================================
connectDB().catch(err => logger.error("Fallo inicial de conexión a DB: %s", err.message));

// =================================================================
// RUTAS DE LA APLICACIÓN
// =================================================================

// --- Montaje de los enrutadores ---
app.use('/api/admin', adminRoutes);
app.use('/api/usuarios', userRoutes);
app.use('/api/noticias', noticiasRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/hubspot', hubspotRoutes);
app.use('/api/forums', forumRoutes);

// --- Ruta para subir imágenes ---
app.post('/api/upload', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No se subió ningún archivo' });
    }
    res.json({ url: `/uploads/${req.file.filename}` });
});

// --- NUEVA RUTA DE TRACKING DE VISITAS ---
app.post('/api/track-visit', async (req, res) => {
    try {
        const ip = req.ip;
        const userAgent = req.headers['user-agent'];
        const enrichedData = await enrichIpData(ip);
        const visitorData = {
            ip_address: ip,
            user_agent: userAgent,
            ...enrichedData
        };
        await visitanteRepository.create(visitorData);
        res.status(200).json({ message: 'Visita registrada con éxito.' });
    } catch (error) {
        logger.error('Error al registrar visita: %s', error.message);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

// =================================================================
// CRON JOBS (TAREAS PROGRAMADAS)
// =================================================================
cron.schedule('0 * * * *', async () => {
    logger.info('🕒 Ejecutando cron job para archivar noticias expiradas...');
    try {
        const pool = await connectDB();
        const result = await pool.request()
            .query(`UPDATE Noticias SET estado = 'archivado' WHERE estado = 'publicado' AND fecha_expiracion < GETDATE()`);
        
        if (result.rowsAffected[0] > 0) {
            logger.info(`✅ Cron job: ${result.rowsAffected[0]} noticias expiradas fueron archivadas.`);
        }
    } catch (error) {
        logger.error('❌ Cron job: Error al archivar noticias: %s', error.message);
    }
});

// =================================================================
// MANEJO DE ERRORES Y ARRANQUE DEL SERVIDOR
// =================================================================
app.use((err, req, res, next) => {
    logger.error(`${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
    res.status(err.status || 500).json({
        message: err.message || 'Error interno del servidor',
    });
});

if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, '0.0.0.0', () => {
        logger.info(`🚀 Servidor backend corriendo en http://localhost:${PORT}`);
    });
}

export default app;