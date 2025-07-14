import express from 'express';

// Controladores para las operaciones CRUD de noticias
import {
  obtenerNoticias,
  obtenerNoticiasPublicas,
  agregarNoticia,
  editarNoticia,
  eliminarNoticia,
  publicarBorrador,
  // --- CORRECCIÓN AQUÍ ---
  eliminarNoticiasEnLote, // Cambiado de eliminarNoticiasMultiples a eliminarNoticiasEnLote
  toggleFeatureNoticiaController,
} from '../controllers/noticiasController.js';

// ... (tus otras importaciones de statsController)
import {
  getStatsPorEstado,
  getStatsDestacadas,
  getStatsPublicadasPorFecha,
  getStatsPorAutor
} from '../controllers/statsController.js';

const router = express.Router();


// --- RUTA PÚBLICA ---
router.get('/publicas', obtenerNoticiasPublicas);


// --- RUTAS PARA ESTADÍSTICAS ---
router.get('/stats/estado', getStatsPorEstado);
router.get('/stats/destacadas', getStatsDestacadas);
router.get('/stats/publicadas-por-fecha', getStatsPublicadasPorFecha);
router.get('/stats/autores', getStatsPorAutor);


// --- RUTAS DE ADMINISTRACIÓN DE NOTICIAS ---
router.get('/', obtenerNoticias);
router.post('/', agregarNoticia);

// --- CORRECCIÓN AQUÍ ---
// Ahora usamos la función importada correctamente
router.post('/bulk-delete', eliminarNoticiasEnLote);

// ... (resto de tus rutas)
router.put('/:id', editarNoticia);
router.delete('/:id', eliminarNoticia);
router.put('/:id/feature', toggleFeatureNoticiaController);
router.post('/:id/publicar', publicarBorrador);


export default router;