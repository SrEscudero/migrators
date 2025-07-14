import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { connectDB, sql } from '../config/db.js';
import { syncHubspotContact } from '../services/hubspotService.js';
import logger from '../config/logger.js';

// La función de registro no necesita cambios
export const registerUser = async (req, res) => {
    const { nombre, email, password, celular, nacionalidad } = req.body;
    const transaction = new sql.Transaction(await connectDB());
    try {
        await transaction.begin();
        const request = new sql.Request(transaction);
        request.input('email', sql.VarChar, email);
        const userExistsResult = await request.query('SELECT Id FROM Usuarios WHERE Email = @email');
        if (userExistsResult.recordset.length > 0) {
            await transaction.rollback();
            return res.status(409).json({ message: 'El correo electrónico ya está registrado.' });
        }
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);
        const insertUserResult = await new sql.Request(transaction)
            .input('nombre', sql.NVarChar, nombre)
            .input('email', sql.VarChar, email)
            .input('password_hash', sql.NVarChar, password_hash)
            .input('celular', sql.VarChar, celular)
            .query('INSERT INTO Usuarios (Nombre, Email, password_hash, Celular, rol) OUTPUT INSERTED.Id VALUES (@nombre, @email, @password_hash, @celular, \'cliente\');');
        const nuevoUsuarioId = insertUserResult.recordset[0].Id;
        await new sql.Request(transaction)
            .input('usuario_id', sql.Int, nuevoUsuarioId)
            .input('nacionalidad', sql.NVarChar, nacionalidad)
            .query('INSERT INTO Clientes (usuario_id, Nacionalidad, estatus_documentos) VALUES (@usuario_id, @nacionalidad, \'Pendiente\');');
        await transaction.commit();
        logger.info(`Usuario cliente registrado con éxito. ID: ${nuevoUsuarioId}`);
        try {
            await syncHubspotContact({ email, firstname: nombre, phone: celular });
            logger.info(`Contacto ${email} sincronizado con HubSpot.`);
        } catch (hubspotError) {
            logger.error(`Error al sincronizar con HubSpot para ${email}: ${hubspotError.message}`);
        }
        res.status(201).json({ message: 'Usuario registrado con éxito. Ahora puedes iniciar sesión.' });
    } catch (error) {
        if (transaction.rolledBack === false) {
          await transaction.rollback();
        }
        logger.error('Error durante el registro de usuario: %s', error.message);
        res.status(500).json({ message: 'Error en el servidor durante el registro.' });
    }
};

export const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const pool = await connectDB();
        const result = await pool.request()
            .input('email', sql.VarChar, email)
            .query('SELECT * FROM Usuarios WHERE Email = @email');

        const user = result.recordset[0];

        if (user && (await bcrypt.compare(password, user.password_hash))) {
            const userPayload = {
                id: user.id, // ¡LA CORRECCIÓN MÁS IMPORTANTE ESTÁ AQUÍ!
                nombre: user.Nombre,
                rol: user.rol,
                perm_gestionar_clientes: user.perm_gestionar_clientes,
                perm_publicar_noticias: user.perm_publicar_noticias,
                perm_ver_estadisticas: user.perm_ver_estadisticas,
            };
            
            const token = jwt.sign(userPayload, process.env.JWT_SECRET, { expiresIn: '1d' });

            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/',
            });

            const userResponse = {
                id: user.id,
                nombre: user.Nombre,
                email: user.Email,
                rol: user.rol,
                perm_gestionar_clientes: user.perm_gestionar_clientes,
                perm_publicar_noticias: user.perm_publicar_noticias,
                perm_ver_estadisticas: user.perm_ver_estadisticas,
            };

            res.status(200).json({
                message: 'Login exitoso!',
                user: userResponse
            });
        } else {
            res.status(401).json({ message: 'Credenciales inválidas.' });
        }
    } catch (error) {
        logger.error('Error en el login: %s', error.message);
        res.status(500).json({ message: 'Error del servidor al intentar iniciar sesión.' });
    }
};

// Añade esta función a tu userController.js
export const updateUserProfile = async (req, res) => {
    const { nombre, password } = req.body;
    const userId = req.user.id; // Obtenido del middleware 'protect'

    if (!nombre) {
        return res.status(400).json({ message: 'El nombre no puede estar vacío.' });
    }

    try {
        const pool = await connectDB();
        let query;
        const request = pool.request().input('nombre', sql.NVarChar, nombre).input('userId', sql.Int, userId);

        if (password) {
            const salt = await bcrypt.genSalt(10);
            const password_hash = await bcrypt.hash(password, salt);
            request.input('password_hash', sql.NVarChar, password_hash);
            query = 'UPDATE Usuarios SET Nombre = @nombre, password_hash = @password_hash WHERE Id = @userId';
        } else {
            query = 'UPDATE Usuarios SET Nombre = @nombre WHERE Id = @userId';
        }

        await request.query(query);

        // Devolvemos el usuario actualizado para actualizar el estado del frontend
        const result = await pool.request().input('id', sql.Int, userId).query('SELECT Id, Nombre, Email, rol FROM Usuarios WHERE Id = @id');
        
        res.status(200).json({ message: 'Perfil actualizado con éxito.', user: result.recordset[0] });

    } catch (error) {
        logger.error(`Error al actualizar perfil para usuario ${userId}: ${error.message}`);
        res.status(500).json({ message: 'Error del servidor al actualizar el perfil.' });
    }
};

export const logoutUser = (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0)
  });
  res.status(200).json({ message: 'Logout exitoso.' });
};