import jwt from 'jsonwebtoken';
import { connectDB, sql } from '../config/db.js';
import logger from '../config/logger.js';

// ... La función 'protect' se mantiene exactamente igual ...
export const protect = async (req, res, next) => {
    // CÓDIGO SIN CAMBIOS
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            const pool = await connectDB();
            // IMPORTANTE: Nos aseguramos de traer las columnas de permisos
            const userResult = await pool.request()
                .input('id', sql.Int, decoded.id)
                .query('SELECT Id, Nombre, Email, Celular, rol, perm_gestionar_clientes, perm_publicar_noticias, perm_ver_estadisticas FROM Usuarios WHERE Id = @id');
            
            req.user = userResult.recordset[0];

            if (!req.user) {
                 return res.status(401).json({ message: 'Acceso no autorizado, usuario no encontrado.' });
            }

            next();

        } catch (error) {
            logger.error('Error de verificación de token: %s', error.message);
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({ message: 'Acceso no autorizado, el token ha expirado.' });
            }
            return res.status(401).json({ message: 'Acceso no autorizado, token falló.' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Acceso no autorizado, no se encontró token.' });
    }
};


/**
 * Middleware para autorizar basado en roles Y/O permisos específicos.
 * Debe usarse DESPUÉS del middleware 'protect'.
 * @param {...string} allowedAccess - Una lista de roles ('ceo', 'funcionario') o claves de permiso ('perm_publicar_noticias') permitidos.
 */
export const authorize = (...allowedAccess) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'No autenticado.' });
        }

        const { rol } = req.user;

        // El CEO siempre tiene acceso a todo.
        if (rol === 'ceo') {
            return next();
        }

        // Verificamos si el rol del usuario está en la lista de acceso permitido
        if (allowedAccess.includes(rol)) {
            return next();
        }
        
        // Verificamos si el usuario tiene alguno de los permisos específicos requeridos
        const hasPermission = allowedAccess.some(permission => req.user[permission] === true);

        if (hasPermission) {
            return next();
        }
        
        // Si no cumple ninguna condición, no tiene permiso.
        return res.status(403).json({ message: 'No tienes los permisos necesarios para realizar esta acción.' });
    };
};