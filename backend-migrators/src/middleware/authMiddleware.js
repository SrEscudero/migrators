import logger from '../config/logger.js';

export const protect = (req, res, next) => {
    // La lógica ahora es mucho más simple:
    // ¿Existe una sesión y esa sesión tiene un objeto de usuario?
    if (req.session && req.session.user) {
        // Si es así, adjuntamos el usuario de la sesión al objeto de la petición
        req.user = req.session.user;
        // Y continuamos a la siguiente función (el controlador de la ruta)
        next();
    } else {
        // Si no hay sesión o no hay usuario en la sesión, no está autorizado.
        logger.warn(`Intento de acceso no autorizado sin sesión válida a: ${req.originalUrl}`);
        res.status(401).json({ message: 'No autorizado. Por favor, inicia sesión.' });
    }
};

export const authorize = (...allowedRolesAndPermissions) => {
    return (req, res, next) => {
        // Esta función ya es compatible con la sesión, no necesita cambios.
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