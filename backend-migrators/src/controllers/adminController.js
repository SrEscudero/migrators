// src/controllers/adminController.js

import bcrypt from 'bcryptjs';
import { connectDB, sql } from '../config/db.js';
import { syncHubspotContact } from '../services/hubspotService.js';
import logger from '../config/logger.js'; 

const crearFuncionario = async (req, res) => {
    // 1. Extraemos 'permisos' del cuerpo de la petición.
    const { nombre, email, password, celular, permisos } = req.body;
    
    if (!email || !password || !nombre) {
        return res.status(400).json({ message: 'Nombre, email y contraseña son obligatorios.' });
    }
    try {
        const pool = await connectDB();
        const userExistsResult = await pool.request()
            .input('email', sql.VarChar, email)
            .query('SELECT COUNT(*) as total FROM Usuarios WHERE Email = @email');

        if (userExistsResult.recordset[0].total > 0) {
            return res.status(409).json({ message: 'Este email ya está en uso por otro usuario.' });
        }

        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        const request = pool.request()
            .input('nombre', sql.NVarChar, nombre)
            .input('email', sql.VarChar, email)
            .input('password_hash', sql.NVarChar, password_hash)
            .input('celular', sql.VarChar, celular)
            // 2. Añadimos los inputs para los permisos.
            // Aseguramos que si 'permisos' no viene, se use false (0).
            .input('perm_gestionar_clientes', sql.Bit, permisos?.gestionarClientes || false)
            .input('perm_publicar_noticias', sql.Bit, permisos?.publicarNoticias || false)
            .input('perm_ver_estadisticas', sql.Bit, permisos?.verEstadisticas || false);

        // 3. Actualizamos la consulta INSERT para incluir las nuevas columnas.
        const insertResult = await request.query(`
            INSERT INTO Usuarios (
                Nombre, Email, password_hash, Celular, rol, fecha_creacion, fecha_actualizacion,
                perm_gestionar_clientes, perm_publicar_noticias, perm_ver_estadisticas
            ) 
            OUTPUT INSERTED.Id, INSERTED.Nombre, INSERTED.Email, INSERTED.rol
            VALUES (
                @nombre, @email, @password_hash, @celular, 'funcionario', SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET(),
                @perm_gestionar_clientes, @perm_publicar_noticias, @perm_ver_estadisticas
            )
        `);
        
        res.status(201).json({ 
            message: 'Funcionario creado con éxito!',
            funcionario: insertResult.recordset[0]
        });

    } catch (error) {
        logger.error('Error al crear funcionario: %s', error.message);
        res.status(500).json({ message: 'Error en el servidor al crear el funcionario.' });
    }
};

const listarClientes = async (req, res) => {
    const { rol, Id: funcionarioId } = req.user;
    try {
        const pool = await connectDB();
        let query;
        const baseQuery = `
            SELECT 
                u.Id AS cliente_id, u.Nombre, u.Email, u.Celular,
                c.estatus_documentos, c.funcionario_asignado_id, f.Nombre AS funcionario_nombre
            FROM Usuarios u
            JOIN Clientes c ON u.Id = c.usuario_id
            LEFT JOIN Usuarios f ON c.funcionario_asignado_id = f.Id
            WHERE u.rol = 'cliente'
        `;
        if (rol === 'ceo') {
            query = baseQuery;
        } else if (rol === 'funcionario') {
            query = `${baseQuery} AND c.funcionario_asignado_id = @funcionarioId`;
        } else {
            return res.status(403).json({ message: 'Rol no autorizado para esta acción.' });
        }
        const request = pool.request();
        if (rol === 'funcionario') {
            request.input('funcionarioId', sql.Int, funcionarioId);
        }
        const result = await request.query(query);
        res.status(200).json(result.recordset);
    } catch (error) {
        logger.error('Error al listar clientes: %s', error.message);
        res.status(500).json({ message: 'Error en el servidor al listar los clientes.' });
    }
};

const asignarCliente = async (req, res) => {
    const { clienteId } = req.params;
    const { funcionarioId } = req.body;
    if (!funcionarioId) {
        return res.status(400).json({ message: 'El ID del funcionario es obligatorio.' });
    }
    try {
        const pool = await connectDB();
        await pool.request()
            .input('clienteId', sql.Int, clienteId)
            .input('funcionarioId', sql.Int, funcionarioId)
            .query(`UPDATE Clientes SET funcionario_asignado_id = @funcionarioId, fecha_asignacion = GETDATE() WHERE usuario_id = @clienteId`);
        res.status(200).json({ message: 'Cliente asignado al funcionario correctamente.' });
    } catch (error) {
        console.error('Error al asignar cliente:', error.message);
        res.status(500).json({ message: 'Error en el servidor al asignar el cliente.' });
    }
};

/**
 * [NUEVO] Crea un nuevo perfil de cliente a partir de un usuario existente o crea un nuevo usuario.
 * Esta es una versión simplificada. Podría ser más compleja si es necesario.
 */
const crearClienteAdmin = async (req, res) => {
    // Esta función es muy similar a la de registro en userController,
    // pero la ejecuta un administrador.
    const { nombre, email, password, celular, nacionalidad } = req.body;

    if (!nombre || !email || !password) {
        return res.status(400).json({ message: 'Nombre, email y contraseña son obligatorios.' });
    }

    let transaction;
    try {
        const pool = await connectDB();
        transaction = new sql.Transaction(pool);
        await transaction.begin();

        const userExistsRequest = new sql.Request(transaction);
        userExistsRequest.input('email', sql.VarChar, email);
        const userExistsResult = await userExistsRequest.query('SELECT COUNT(*) as total FROM Usuarios WHERE Email = @email');

        if (userExistsResult.recordset[0].total > 0) {
            await transaction.rollback();
            return res.status(409).json({ message: 'Este email ya está registrado.' });
        }

        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        const insertUserRequest = new sql.Request(transaction);
        insertUserRequest.input('nombre', sql.NVarChar, nombre);
        insertUserRequest.input('email', sql.VarChar, email);
        insertUserRequest.input('password_hash', sql.NVarChar, password_hash);
        insertUserRequest.input('celular', sql.VarChar, celular);
        const insertUserResult = await insertUserRequest.query(`
            INSERT INTO Usuarios (Nombre, Email, password_hash, Celular, rol) 
            OUTPUT INSERTED.Id 
            VALUES (@nombre, @email, @password_hash, @celular, 'cliente')
        `);
        const newUserId = insertUserResult.recordset[0].Id;

        const insertClientRequest = new sql.Request(transaction);
        insertClientRequest.input('newUserId', sql.Int, newUserId);
        insertClientRequest.input('nacionalidad', sql.NVarChar, nacionalidad);
        await insertClientRequest.query(`
            INSERT INTO Clientes (usuario_id, estatus_documentos, Nacionalidad) 
            VALUES (@newUserId, 'Registro por Admin', @nacionalidad)
        `);

        await transaction.commit();

        syncHubspotContact({
            email: email,
            firstname: nombre,
            phone: celular,
        });

        res.status(201).json({ message: 'Cliente creado por administrador con éxito!' });

    } catch (error) {
        if (transaction) await transaction.rollback();
        console.error('Error al crear cliente por admin:', error.message);
        res.status(500).json({ message: 'Error en el servidor al registrar el cliente.' });
    }
};

/**
 * [NUEVO] Actualiza los datos de un cliente.
 */
const actualizarClienteAdmin = async (req, res) => {
    const { clienteId } = req.params;
    const { nombre, email, celular, nacionalidad } = req.body;

    try {
        const pool = await connectDB();
        // NOTA: Esta es una actualización simple. Una versión más robusta
        // podría usar una transacción si se actualizan múltiples tablas.
        await pool.request()
            .input('clienteId', sql.Int, clienteId)
            .input('nombre', sql.NVarChar, nombre)
            .input('email', sql.VarChar, email)
            .input('celular', sql.VarChar, celular)
            .query('UPDATE Usuarios SET Nombre = @nombre, Email = @email, Celular = @celular, fecha_actualizacion = GETDATE() WHERE Id = @clienteId');

        // Podrías necesitar actualizar la tabla Clientes también si tiene campos adicionales
        // await pool.request()...

        res.status(200).json({ message: 'Datos del cliente actualizados correctamente.' });

    } catch (error) {
        console.error('Error al actualizar cliente:', error.message);
        res.status(500).json({ message: 'Error en el servidor al actualizar el cliente.' });
    }
};

/**
 * [NUEVO] Elimina a un cliente y su usuario asociado.
 */
const eliminarClienteAdmin = async (req, res) => {
    const { clienteId } = req.params;

    // Usaremos una transacción para asegurar que ambas eliminaciones (Cliente y Usuario)
    // se completen con éxito o ninguna lo haga.
    const transaction = new sql.Transaction(await connectDB());
    try {
        await transaction.begin();

        // Eliminar primero de la tabla Clientes
        const deleteClienteRequest = new sql.Request(transaction);
        await deleteClienteRequest.input('clienteId', sql.Int, clienteId)
            .query('DELETE FROM Clientes WHERE usuario_id = @clienteId');

        // Luego, eliminar de la tabla Usuarios
        const deleteUsuarioRequest = new sql.Request(transaction);
        const result = await deleteUsuarioRequest.input('clienteId', sql.Int, clienteId)
            .query('DELETE FROM Usuarios WHERE Id = @clienteId');

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

/**
 * [NUEVO] Actualiza los datos de un funcionario existente.
 */
const actualizarFuncionario = async (req, res) => {
    const { funcionarioId } = req.params;
    // Solo permitimos actualizar estos campos para evitar cambios no deseados
    const { nombre, email, celular, permisos } = req.body;

    if (!nombre || !email) {
        return res.status(400).json({ message: 'El nombre y el email son obligatorios.' });
    }

    try {
        const pool = await connectDB();
        const result = await pool.request()
            .input('id', sql.Int, funcionarioId)
            .input('nombre', sql.NVarChar, nombre)
            .input('email', sql.VarChar, email)
            .input('celular', sql.VarChar, celular || null)
            .input('perm_gestionar_clientes', sql.Bit, permisos?.gestionarClientes || false)
            .input('perm_publicar_noticias', sql.Bit, permisos?.publicarNoticias || false)
            .input('perm_ver_estadisticas', sql.Bit, permisos?.verEstadisticas || false)
            .query(`
                UPDATE Usuarios 
                SET Nombre = @nombre, Email = @email, Celular = @celular, 
                    perm_gestionar_clientes = @perm_gestionar_clientes,
                    perm_publicar_noticias = @perm_publicar_noticias,
                    perm_ver_estadisticas = @perm_ver_estadisticas,
                    fecha_actualizacion = SYSDATETIMEOFFSET()
                WHERE Id = @id AND rol = 'funcionario'
            `);

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ message: 'Funcionario no encontrado.' });
        }
        
        res.status(200).json({ message: 'Funcionario actualizado con éxito.' });
    } catch (error) {
        logger.error('Error al actualizar funcionario: %s', error.message);
        res.status(500).json({ message: 'Error en el servidor al actualizar el funcionario.' });
    }
};

/**
 * [NUEVO] Elimina un funcionario (usuario con rol 'funcionario').
 */
const eliminarFuncionario = async (req, res) => {
    const { funcionarioId } = req.params;
    
    // Medida de seguridad: No permitir que se elimine al usuario CEO principal
    if (parseInt(funcionarioId, 10) === 1) { // Asumiendo que el CEO tiene ID 1
        return res.status(403).json({ message: 'No se puede eliminar al administrador principal.' });
    }

    try {
        const pool = await connectDB();
        // Un funcionario no tiene datos en la tabla 'Clientes', así que solo borramos de 'Usuarios'
        const result = await pool.request()
            .input('id', sql.Int, funcionarioId)
            .query("DELETE FROM Usuarios WHERE Id = @id AND rol = 'funcionario'");

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ message: 'Funcionario no encontrado.' });
        }

        res.status(200).json({ message: 'Funcionario eliminado con éxito.' });
    } catch (error) {
        logger.error('Error al eliminar funcionario: %s', error.message);
        res.status(500).json({ message: 'Error del servidor al eliminar el funcionario.' });
    }
};


/**
 * [NUEVO CONTROLADOR AÑADIDO]
 * Obtiene todos los usuarios con el rol 'funcionario'.
 */
// En: src/controllers/adminController.js

const getFuncionarios = async (req, res) => {
    try {
        const pool = await connectDB();
        // SOLUCIÓN: Usamos alias (AS) en la consulta SQL para renombrar las columnas a camelCase.
        const result = await pool.request().query(`
            SELECT 
                Id AS id, 
                Nombre AS nombre, 
                Email AS email, 
                Celular AS celular, 
                rol
            FROM Usuarios 
            WHERE rol = 'funcionario' 
            ORDER BY Nombre
        `);
        res.status(200).json(result.recordset);
    } catch (error) {
        console.error('Error al obtener funcionarios:', error.message);
        res.status(500).json({ message: 'Error en el servidor al obtener la lista de funcionarios.' });
    }
};

export {
    crearFuncionario,
    listarClientes,
    asignarCliente,
    getFuncionarios, // <-- Se exporta la nueva función
    crearClienteAdmin,      // <-- NUEVO
    actualizarClienteAdmin, // <-- NUEVO
    eliminarClienteAdmin ,
    actualizarFuncionario, // <-- AÑADIR
    eliminarFuncionario    // <-- AÑADIR
};