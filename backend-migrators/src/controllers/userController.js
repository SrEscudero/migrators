import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { connectDB, sql } from '../config/db.js';
import { syncHubspotContact } from '../services/hubspotService.js';
import logger from '../config/logger.js';

/**
 * Registra un nuevo usuario cliente y su perfil en la tabla Clientes
 * usando una transacción para garantizar la integridad de los datos.
 */
export const registerUser = async (req, res) => {
    const { nombre, email, password, celular, nacionalidad } = req.body;

    const transaction = new sql.Transaction(await connectDB());
    try {
        await transaction.begin();
        const request = new sql.Request(transaction);

        // 1. Verificar si el email ya existe
        request.input('email', sql.VarChar, email);
        const userExistsResult = await request.query('SELECT Id FROM Usuarios WHERE Email = @email');
        if (userExistsResult.recordset.length > 0) {
            await transaction.rollback();
            return res.status(409).json({ message: 'El correo electrónico ya está registrado.' });
        }

        // 2. Hashear la contraseña
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        // 3. Insertar en la tabla Usuarios y obtener el nuevo ID
        const insertUserResult = await new sql.Request(transaction)
            .input('nombre', sql.NVarChar, nombre)
            .input('email', sql.VarChar, email)
            .input('password_hash', sql.NVarChar, password_hash)
            .input('celular', sql.VarChar, celular || null)
            .query(`INSERT INTO Usuarios (Nombre, Email, password_hash, Celular, rol) OUTPUT INSERTED.Id VALUES (@nombre, @email, @password_hash, @celular, 'cliente')`);
        
        const newUserId = insertUserResult.recordset[0].Id;

        // 4. Insertar en la tabla Clientes usando el nuevo ID
        await new sql.Request(transaction)
            .input('usuario_id', sql.Int, newUserId)
            .input('nacionalidad', sql.NVarChar, nacionalidad || null)
            .query(`INSERT INTO Clientes (usuario_id, estatus_documentos, Nacionalidad) VALUES (@usuario_id, 'Registro Completado', @nacionalidad)`);

        await transaction.commit();

        // --- 2. INICIA LA SINCRONIZACIÓN CON HUBSPOT ---
        // Se ejecuta en segundo plano para no demorar la respuesta al usuario.
        syncHubspotContact({
            email: email,
            firstname: nombre,
            phone: celular,
        });
        // ---------------------------------------------

        res.status(201).json({ message: 'Usuario registrado con éxito.' });

    } catch (error) {
        if (transaction) await transaction.rollback();
        logger.error('Error al registrar usuario: %s', error.message);
        res.status(500).json({ message: 'Error del servidor al registrar el usuario.' });
    }
};

/**
 * Autentica un usuario y devuelve un token JWT con sus datos.
 */
export const loginUser = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Email y contraseña son obligatorios.' });
    }
    try {
        const pool = await connectDB();
        const result = await pool.request()
            .input('email', sql.VarChar, email)
            .query('SELECT Id, Nombre, Email, Celular, rol, password_hash, perm_gestionar_clientes, perm_publicar_noticias, perm_ver_estadisticas FROM Usuarios WHERE Email = @email');

        const user = result.recordset[0];

        if (user && (await bcrypt.compare(password, user.password_hash))) {
            // Preparamos el payload del token y el objeto de usuario para la respuesta
            const userPayload = {
                id: user.Id,
                nombre: user.Nombre,
                rol: user.rol,
                perm_gestionar_clientes: user.perm_gestionar_clientes,
                perm_publicar_noticias: user.perm_publicar_noticias,
                perm_ver_estadisticas: user.perm_ver_estadisticas,
            };
            
            const token = jwt.sign(userPayload, process.env.JWT_SECRET, { expiresIn: '1d' });

            // El objeto 'user' que se envía al frontend no debe contener el hash de la contraseña
            const userResponse = {
                id: user.Id,
                nombre: user.Nombre,
                email: user.Email,
                rol: user.rol,
                perm_gestionar_clientes: user.perm_gestionar_clientes,
                perm_publicar_noticias: user.perm_publicar_noticias,
                perm_ver_estadisticas: user.perm_ver_estadisticas,
            };

            res.status(200).json({
                message: 'Login exitoso!',
                token,
                user: userResponse
            });
        } else {
            res.status(401).json({ message: 'Credenciales inválidas.' });
        }
    } catch (error) {
        logger.error('Error en el login: %s', error.message);
        res.status(500).json({ message: 'Error del servidor durante el login.' });
    }
};