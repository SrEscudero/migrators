import bcrypt from 'bcryptjs';
import { connectDB, sql } from '../config/db.js'; // Necesario para transacciones
import { usuarioRepository, clienteRepository } from '../repositories/usuarioRepository.js';
import { syncHubspotContact } from '../services/hubspotService.js';
import logger from '../config/logger.js';

export const crearFuncionario = async (req, res) => {
    const { nombre, email, password, celular, permisos } = req.body;
    if (!email || !password || !nombre) {
        return res.status(400).json({ message: 'Nombre, email y contraseña son obligatorios.' });
    }
    try {
        const existingUser = await usuarioRepository.findByEmail(email);
        if (existingUser) {
            return res.status(409).json({ message: 'Este email ya está en uso por otro usuario.' });
        }

        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        const newFuncionario = await usuarioRepository.createFuncionario({ nombre, email, password_hash, celular, permisos });
        
        res.status(201).json({ 
            message: 'Funcionario creado con éxito!',
            funcionario: newFuncionario
        });
    } catch (error) {
        logger.error('Error al crear funcionario: %s', error.message);
        res.status(500).json({ message: 'Error en el servidor al crear el funcionario.' });
    }
};

export const listarClientes = async (req, res) => {
    const { rol, id: funcionarioId } = req.user;
    try {
        let baseQuery = `
            SELECT 
                u.id AS cliente_id, u.Nombre, u.Email, u.Celular,
                c.estatus_documentos, c.funcionario_asignado_id, f.Nombre AS funcionario_nombre
            FROM Usuarios u
            JOIN Clientes c ON u.id = c.usuario_id
            LEFT JOIN Usuarios f ON c.funcionario_asignado_id = f.id
            WHERE u.rol = 'cliente'
        `;
        
        let finalQuery;
        const pool = await connectDB();
        const request = pool.request();

        if (rol === 'ceo') {
            finalQuery = baseQuery;
        } else if (rol === 'funcionario') {
            finalQuery = `${baseQuery} AND c.funcionario_asignado_id = @funcionarioId`;
            request.input('funcionarioId', sql.Int, funcionarioId);
        } else {
             return res.status(403).json({ message: 'Rol no autorizado para esta acción.' });
        }
        
        const result = await request.query(finalQuery);
        res.status(200).json(result.recordset);
    } catch (error) {
        logger.error('Error al listar clientes: %s', error.message);
        res.status(500).json({ message: 'Error en el servidor al listar los clientes.' });
    }
};

export const asignarCliente = async (req, res) => {
    const { clienteId } = req.params;
    const { funcionarioId } = req.body;
    if (!funcionarioId) {
        return res.status(400).json({ message: 'El ID del funcionario es obligatorio.' });
    }
    try {
        await clienteRepository.assignFuncionario(clienteId, funcionarioId);
        res.status(200).json({ message: 'Cliente asignado al funcionario correctamente.' });
    } catch (error) {
        logger.error('Error al asignar cliente %s al funcionario %s: %s', clienteId, funcionarioId, error.message);
        res.status(500).json({ message: 'Error en el servidor al asignar el cliente.' });
    }
};

export const crearClienteAdmin = async (req, res) => {
    const { nombre, email, password, celular, nacionalidad } = req.body;
    if (!nombre || !email || !password) {
        return res.status(400).json({ message: 'Nombre, email y contraseña son obligatorios.' });
    }

    const pool = await connectDB();
    const transaction = new sql.Transaction(pool);
    try {
        await transaction.begin();

        const userExists = await usuarioRepository.findByEmail(email);
        if (userExists) {
            await transaction.rollback();
            return res.status(409).json({ message: 'Este email ya está registrado.' });
        }

        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        const newUserId = await usuarioRepository.createCliente({ nombre, email, password_hash, celular }, transaction);

        await clienteRepository.create({
            usuario_id: newUserId,
            nacionalidad: nacionalidad,
            estatus_documentos: 'Registro por Admin'
        }, transaction);

        await transaction.commit();

        syncHubspotContact({ email, firstname: nombre, phone: celular });

        res.status(201).json({ message: 'Cliente creado por administrador con éxito!' });

    } catch (error) {
        if (transaction) await transaction.rollback();
        logger.error('Error al crear cliente por admin: %s', error.message);
        res.status(500).json({ message: 'Error en el servidor al registrar el cliente.' });
    }
};

export const actualizarClienteAdmin = async (req, res) => {
    // Esta función es un buen candidato para mover a `usuarioRepository`
    const { clienteId } = req.params;
    const { nombre, email, celular, nacionalidad } = req.body;

    try {
        const pool = await connectDB();
        await pool.request()
            .input('clienteId', sql.Int, clienteId)
            .input('nombre', sql.NVarChar, nombre)
            .input('email', sql.VarChar, email)
            .input('celular', sql.VarChar, celular)
            .query('UPDATE Usuarios SET Nombre = @nombre, Email = @email, Celular = @celular, fecha_actualizacion = GETDATE() WHERE Id = @clienteId');
        
        // Aquí podrías tener `clienteRepository.update` para actualizar la nacionalidad
        
        res.status(200).json({ message: 'Datos del cliente actualizados correctamente.' });
    } catch (error) {
        logger.error('Error al actualizar cliente por admin: %s', error.message);
        res.status(500).json({ message: 'Error en el servidor al actualizar el cliente.' });
    }
};

export const eliminarClienteAdmin = async (req, res) => {
    const { clienteId } = req.params;
    const pool = await connectDB();
    const transaction = new sql.Transaction(pool);
    try {
        await transaction.begin();
        // El `ON DELETE CASCADE` en la FK de la tabla Clientes simplifica esto.
        // Al eliminar el usuario, el cliente asociado se elimina automáticamente.
        const request = new sql.Request(transaction);
        const result = await request.input('clienteId', sql.Int, clienteId)
            .query('DELETE FROM Usuarios WHERE Id = @clienteId AND rol = \'cliente\'');

        if (result.rowsAffected[0] === 0) {
            await transaction.rollback();
            return res.status(404).json({ message: 'Cliente no encontrado.' });
        }

        await transaction.commit();
        res.status(200).json({ message: 'Cliente eliminado correctamente.' });
    } catch (error) {
        if (transaction) await transaction.rollback();
        logger.error('Error al eliminar cliente por admin: %s', error.message);
        res.status(500).json({ message: 'Error del servidor al eliminar el cliente.' });
    }
};

export const actualizarFuncionario = async (req, res) => {
    const { funcionarioId } = req.params;
    const { nombre, email, celular, permisos } = req.body;
    if (!nombre || !email) {
        return res.status(400).json({ message: 'El nombre y el email son obligatorios.' });
    }
    try {
        const rowsAffected = await usuarioRepository.updateFuncionario(funcionarioId, { nombre, email, celular, permisos });
        if (rowsAffected === 0) {
            return res.status(404).json({ message: 'Funcionario no encontrado.' });
        }
        res.status(200).json({ message: 'Funcionario actualizado con éxito.' });
    } catch (error) {
        logger.error('Error al actualizar funcionario: %s', error.message);
        res.status(500).json({ message: 'Error en el servidor al actualizar el funcionario.' });
    }
};

export const eliminarFuncionario = async (req, res) => {
    const { funcionarioId } = req.params;
    if (parseInt(funcionarioId, 10) === 1) { // Asumiendo que el CEO tiene ID 1
        return res.status(403).json({ message: 'No se puede eliminar al administrador principal.' });
    }
    try {
        const rowsAffected = await usuarioRepository.deleteFuncionarioById(funcionarioId);
        if (rowsAffected === 0) {
            return res.status(404).json({ message: 'Funcionario no encontrado.' });
        }
        res.status(200).json({ message: 'Funcionario eliminado con éxito.' });
    } catch (error) {
        logger.error('Error al eliminar funcionario: %s', error.message);
        res.status(500).json({ message: 'Error del servidor al eliminar el funcionario.' });
    }
};

export const getFuncionarios = async (req, res) => {
    try {
        const funcionarios = await usuarioRepository.findAllFuncionarios();
        res.status(200).json(funcionarios);
    } catch (error) {
        logger.error('Error al obtener funcionarios: %s', error.message);
        res.status(500).json({ message: 'Error en el servidor al obtener la lista de funcionarios.' });
    }
};