import express from 'express';
import { body, validationResult } from 'express-validator';
import rateLimit from 'express-rate-limit'; // <-- 1. IMPORTAMOS EL PAQUETE

import { loginUser, registerUser } from '../controllers/userController.js';

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

// --- 2. CONFIGURAMOS EL LÍMITE DE TASA PARA EL LOGIN ---
const loginLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutos
	max: 15, // Limita cada IP a 15 peticiones por ventana de tiempo
	standardHeaders: true, // Devuelve información del límite en las cabeceras `RateLimit-*`
	legacyHeaders: false, // Deshabilita las cabeceras `X-RateLimit-*`
    message: { message: 'Demasiados intentos de inicio de sesión desde esta IP, por favor intente de nuevo en 15 minutos.' },
});


// --- Rutas Públicas ---
router.post('/register', registerValidationRules, validate, registerUser);

// --- 3. APLICAMOS EL LIMITADOR A LA RUTA DE LOGIN ---
router.post('/login', loginLimiter, loginUser);


export default router;