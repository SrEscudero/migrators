import express from 'express';
import { body, validationResult } from 'express-validator';
import rateLimit from 'express-rate-limit';

// --- INICIO DE LA CORRECCIÓN ---
// Se añade 'updateUserProfile' a la lista de importaciones.
import { 
    loginUser, 
    registerUser, 
    logoutUser, 
    updateUserProfile,
    getMe 
} from '../controllers/userController.js';
// --- FIN DE LA CORRECCIÓN ---

import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// --- Middleware para manejar errores de validación ---
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        return next();
    }
    const extractedErrors = [];
    errors.array().map(err => extractedErrors.push({ [err.path]: err.msg }));

    return res.status(422).json({
        message: 'Error de validación. Por favor, revisa los datos enviados.',
        errors: extractedErrors,
    });
};

// --- Reglas de validación para el registro ---
const registerValidationRules = [
    body('email').isEmail().withMessage('Debe ser un correo electrónico válido.').normalizeEmail(),
    body('password').isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres.').trim(),
    body('nombre').not().isEmpty().withMessage('El nombre es obligatorio.').trim().escape(),
    body('celular').optional({ checkFalsy: true }).isMobilePhone('any', { strictMode: false }).withMessage('Debe ser un número de celular válido.').trim().escape()
];

// --- Límite de tasa para el login ---
const loginLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutos
	max: 15, 
	standardHeaders: true, 
	legacyHeaders: false, 
    message: { message: 'Demasiados intentos de inicio de sesión desde esta IP, por favor intente de nuevo en 15 minutos.' },
});

// --- RUTAS PÚBLICAS ---
router.post('/login', loginLimiter, loginUser);
router.post('/register', registerValidationRules, validate, registerUser);
router.post('/logout', logoutUser);

// --- RUTA PROTEGIDA PARA EL PERFIL ---
// Ruta para que el usuario logueado actualice su propio perfil.
router.put('/me', protect, updateUserProfile);

// --- NUEVA RUTA PROTEGIDA ---
// Ruta para que el usuario logueado obtenga sus propios datos.
router.get('/me', protect, getMe);

export default router;