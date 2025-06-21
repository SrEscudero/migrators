// src/config/logger.js

import winston from 'winston';

// Define los niveles de severidad de los logs
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Colores para cada nivel de severidad en la consola
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

winston.addColors(colors);

// Formato de los logs
const format = winston.format.combine(
    // Añade una marca de tiempo a cada log
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
    // Le da colores a los logs de la consola
    winston.format.colorize({ all: true }),
    // Define la estructura del mensaje del log
    winston.format.printf(
        (info) => `${info.timestamp} [${info.level}]: ${info.message}`,
    ),
);

// Define los "transportes" (dónde se guardarán los logs)
const transports = [
  // 1. Siempre mostrar todos los logs en la consola
  new winston.transports.Console(),
  // 2. Guardar todos los logs de nivel 'error' en un archivo `error.log`
  new winston.transports.File({
    filename: 'logs/error.log',
    level: 'error',
  }),
  // 3. Guardar todos los logs (de todos los niveles) en un archivo `all.log`
  new winston.transports.File({ filename: 'logs/all.log' }),
];

// Crea la instancia del logger
const logger = winston.createLogger({
  level: 'debug', // El nivel más bajo a registrar
  levels,
  format,
  transports,
});

export default logger;