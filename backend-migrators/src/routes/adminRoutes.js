import express from 'express';
import { crearFuncionario, listarClientes, asignarCliente, getFuncionarios, crearClienteAdmin, actualizarClienteAdmin } from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// --- RUTAS DE GESTIÓN DE PERSONAL (FUNCIONARIOS) ---
// Crear y listar funcionarios sigue siendo solo para el CEO.
router.post('/funcionarios', protect, authorize('ceo'), crearFuncionario);
router.get('/funcionarios', protect, authorize('ceo'), getFuncionarios);


// --- RUTAS DE GESTIÓN DE CLIENTES ---
// Para listar, crear o actualizar clientes, se necesita ser 'ceo' O tener el permiso específico.
const canManageClients = authorize('ceo', 'perm_gestionar_clientes');

router.get('/clientes', protect, canManageClients, listarClientes);
router.post('/clientes', protect, canManageClients, crearClienteAdmin);
router.put('/clientes/:clienteId', protect, canManageClients, actualizarClienteAdmin);

// Asignar un cliente a un funcionario es una tarea de alto nivel, la dejamos solo para el CEO.
router.patch('/clientes/:clienteId/asignar', protect, authorize('ceo'), asignarCliente);

export default router;