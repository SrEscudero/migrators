import bcrypt from 'bcryptjs';
import { connectDB, sql } from '../config/db.js';
import { syncHubspotContact } from '../services/hubspotService.js';
import logger from '../config/logger.js';
import { usuarioRepository, clienteRepository } from '../repositories/usuarioRepository.js';

// --- Registro de un nuevo usuario/cliente ---
export const registerUser = async (req, res) => {
    const { nombre, email, password, celular, nacionalidad } = req.body;
    if (!nombre || !email || !password) {
        return res.status(400).json({ message: 'Nombre, email y contraseña son obligatorios.' });
    }

    const pool = await connectDB();
    const transaction = new sql.Transaction(pool);
    try {
        await transaction.begin();

        const userExistsRequest = new sql.Request(transaction);
        userExistsRequest.input('email', sql.VarChar, email);
        const userExistsResult = await userExistsRequest.query('SELECT Id FROM Usuarios WHERE Email = @email');

        if (userExistsResult.recordset.length > 0) {
            await transaction.rollback();
            return res.status(409).json({ message: 'El correo electrónico ya está registrado.' });
        }

        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        const newUserId = await usuarioRepository.createCliente({ nombre, email, password_hash, celular }, transaction);

        await clienteRepository.create({
            usuario_id: newUserId,
            nacionalidad: nacionalidad,
            estatus_documentos: 'Registro Inicial'
        }, transaction);

        await transaction.commit();

        syncHubspotContact({ email, firstname: nombre, phone: celular });

        res.status(201).json({ message: 'Usuario registrado con éxito!' });
    } catch (error) {
        if (transaction) await transaction.rollback();
        logger.error('Error al registrar usuario: %s', error.message);
        res.status(500).json({ message: 'Error en el servidor al registrar el usuario.' });
    }
};

// --- Inicio de sesión ---
export const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await usuarioRepository.findByEmail(email);
        if (user && (await bcrypt.compare(password, user.password_hash))) {
            
            const userPayload = {
                id: user.id,
                nombre: user.Nombre,
                email: user.Email,
                rol: user.rol,
                perm_gestionar_clientes: user.perm_gestionar_clientes,
                perm_publicar_noticias: user.perm_publicar_noticias,
                perm_ver_estadisticas: user.perm_ver_estadisticas,
            };

            // La única línea necesaria para el login: guardar el usuario en la sesión.
            // express-session se encarga de crear la cookie y enviarla al navegador.
            req.session.user = userPayload;
            
            res.json({ user: userPayload });

        } else {
            res.status(401).json({ message: 'Credenciales inválidas.' });
        }
    } catch (error) {
        logger.error('Error en el login: %s', error.message);
        res.status(500).json({ message: 'Error en el servidor durante el login.' });
    }
};

// --- Obtener perfil del usuario autenticado ---
export const getMe = async (req, res) => {
    // Esta función ahora funcionará porque el middleware 'protect' ya ha puesto req.user
    if (!req.user || !req.user.id) {
        return res.status(401).json({ message: 'No autenticado.' });
    }
    try {
        const user = await usuarioRepository.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }
        res.json(user);
    } catch (error) {
        logger.error('Error en getMe para usuario ID %s: %s', req.user.id, error.message);
        res.status(500).json({ message: 'Error del servidor.' });
    }
};

// --- Actualizar el perfil del usuario autenticado ---
export const updateUserProfile = async (req, res) => {
    const { id: userId } = req.user;
    const { nombre, password } = req.body;

    if (!nombre || nombre.trim() === '') {
        return res.status(400).json({ message: 'El nombre no puede estar vacío.' });
    }

    try {
        const pool = await connectDB();
        let query;
        const request = pool.request().input('nombre', sql.NVarChar, nombre).input('userId', sql.Int, userId);

        if (password) {
            if (password.length < 8) {
                return res.status(400).json({ message: 'La nueva contraseña debe tener al menos 8 caracteres.' });
            }
            const salt = await bcrypt.genSalt(10);
            const password_hash = await bcrypt.hash(password, salt);
            request.input('password_hash', sql.NVarChar, password_hash);
            query = 'UPDATE Usuarios SET Nombre = @nombre, password_hash = @password_hash, fecha_actualizacion = SYSDATETIMEOFFSET() WHERE Id = @userId';
        } else {
            query = 'UPDATE Usuarios SET Nombre = @nombre, fecha_actualizacion = SYSDATETIMEOFFSET() WHERE Id = @userId';
        }

        await request.query(query);

        const updatedUser = await usuarioRepository.findById(userId);
        
        // Actualizamos también la sesión con los nuevos datos
        req.session.user = { ...req.session.user, ...updatedUser };

        res.status(200).json({ message: 'Perfil actualizado con éxito.', user: updatedUser });

    } catch (error) {
        logger.error(`Error al actualizar perfil para usuario ${userId}: ${error.message}`);
        res.status(500).json({ message: 'Error del servidor al actualizar el perfil.' });
    }
};

// --- Cerrar sesión ---
export const logoutUser = (req, res) => {
    // Destruye la sesión del servidor
    req.session.destroy((err) => {
        if (err) {
            logger.error('Error al destruir la sesión:', err);
            return res.status(500).json({ message: 'No se pudo cerrar la sesión.' });
        }
        // Limpia la cookie del navegador (el nombre por defecto de la cookie de express-session es 'connect.sid')
        res.clearCookie('connect.sid'); 
        res.status(200).json({ message: 'Logout exitoso.' });
    });
};