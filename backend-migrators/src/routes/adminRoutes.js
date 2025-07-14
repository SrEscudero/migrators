import express from 'express';
import { 
    crearFuncionario, 
    listarClientes, 
    asignarCliente, 
    getFuncionarios, 
    crearClienteAdmin, 
    actualizarClienteAdmin, 
    eliminarClienteAdmin, 
    actualizarFuncionario, 
    eliminarFuncionario 
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/funcionarios', protect, authorize('ceo'), getFuncionarios);
router.post('/funcionarios', protect, authorize('ceo'), crearFuncionario);
router.put('/funcionarios/:funcionarioId', protect, authorize('ceo'), actualizarFuncionario);
router.delete('/funcionarios/:funcionarioId', protect, authorize('ceo'), eliminarFuncionario);

router.get('/clientes', protect, authorize('perm_gestionar_clientes'), listarClientes);
router.post('/clientes', protect, authorize('perm_gestionar_clientes'), crearClienteAdmin);
router.put('/clientes/:clienteId', protect, authorize('perm_gestionar_clientes'), actualizarClienteAdmin);
router.delete('/clientes/:clienteId', protect, authorize('perm_gestionar_clientes'), eliminarClienteAdmin);

router.patch('/clientes/:clienteId/asignar', protect, authorize('ceo'), asignarCliente);

export default router;