import express from 'express';

// Controladores para las operaciones CRUD de noticias
import {
  obtenerNoticias,
  obtenerNoticiasPublicas,
  agregarNoticia,
  editarNoticia,
  eliminarNoticia,
  publicarBorrador,
  eliminarNoticiasMultiples,
  toggleFeatureNoticiaController,
} from '../controllers/noticiasController.js';

// NUEVAS IMPORTACIONES: Controladores para las estadísticas
// (Debes crear este archivo y sus funciones como se explicó en la respuesta anterior)
import {
  getStatsPorEstado,
  getStatsDestacadas,
  getStatsPublicadasPorFecha,
  getStatsPorAutor
} from '../controllers/statsController.js';

const router = express.Router();


// --- RUTA PÚBLICA ---
// Obtiene solo noticias publicadas y no expiradas
router.get('/publicas', obtenerNoticiasPublicas);


// --- RUTAS PARA ESTADÍSTICAS ---
// Resuelven los errores 404 que estabas viendo
router.get('/stats/estado', getStatsPorEstado);
router.get('/stats/destacadas', getStatsDestacadas);
router.get('/stats/publicadas-por-fecha', getStatsPublicadasPorFecha);
router.get('/stats/autores', getStatsPorAutor);


// --- RUTAS DE ADMINISTRACIÓN DE NOTICIAS ---
// Obtiene todas las noticias para el admin
router.get('/', obtenerNoticias);

// Crea una nueva noticia
router.post('/', agregarNoticia);

// Elimina múltiples noticias
router.post('/bulk-delete', eliminarNoticiasMultiples);

// Edita una noticia existente
router.put('/:id', editarNoticia);

// Elimina una noticia
router.delete('/:id', eliminarNoticia);

// Cambia el estado destacado de una noticia
router.put('/:id/feature', toggleFeatureNoticiaController);

// Cambia el estado de un borrador a 'publicado'
router.post('/:id/publicar', publicarBorrador);


export default router;