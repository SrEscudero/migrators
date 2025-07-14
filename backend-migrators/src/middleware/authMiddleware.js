import jwt from 'jsonwebtoken';
import { connectDB, sql } from '../config/db.js';
import logger from '../config/logger.js';

export const protect = async (req, res, next) => {
    let token;

    if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
    }

    if (!token) {
        return res.status(401).json({ message: 'No autorizado, no se proporcionó token.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const pool = await connectDB();
        const result = await pool.request()
            .input('id', sql.Int, decoded.id)
            .query('SELECT id, Nombre, Email, rol, perm_gestionar_clientes, perm_publicar_noticias, perm_ver_estadisticas FROM Usuarios WHERE id = @id');
        
        const user = result.recordset[0];
        
        if (!user) {
            res.clearCookie('token');
            return res.status(401).json({ message: 'No autorizado, el usuario del token ya no existe.' });
        }
        
        req.user = user;
        next();

    } catch (error) {
        logger.error('Error de autenticación en middleware protect:', error.message);
        res.clearCookie('token');
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'La sesión ha expirado. Por favor, inicia sesión de nuevo.' });
        }
        
        return res.status(401).json({ message: 'No autorizado, el token no es válido.' });
    }
};

export const authorize = (...allowedRolesAndPermissions) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'No autenticado.' });
        }

        const { rol } = req.user;

        if (rol === 'ceo' || allowedRolesAndPermissions.includes(rol)) {
            return next();
        }

        const hasPermission = allowedRolesAndPermissions.some(permission => 
            permission.startsWith('perm_') && req.user[permission] === true
        );

        if (hasPermission) {
            return next();
        }
        
        logger.warn(`Acceso DENEGADO para usuario ${req.user.id} (rol: ${rol}).`);
        return res.status(403).json({ message: 'No tienes los permisos necesarios.' });
    };
};