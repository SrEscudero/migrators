// Archivo: backend-migrators/src/config/db.js (Versión Unificada y Mejorada)

import sql from 'mssql';
import dotenv from 'dotenv';
import logger from './logger.js';


dotenv.config();

// Configuración de la base de datos leída desde las variables de entorno
const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  options: {
    encrypt: false, // Cambiar a true si usas Azure SQL
    trustServerCertificate: true, // Cambiar a false en producción con un certificado válido
  },
};

let pool;

export const connectDB = async () => {
  try {
    if (pool && pool.connected) {
      return pool;
    }
    logger.info('Attempting to connect to SQL Server...'); 
    pool = await sql.connect(dbConfig);
    logger.info('✅ Conectado a SQL Server'); 
    return pool;
  } catch (err) {
    logger.error('❌ Error al conectar con SQL Server: %s', err.message);
    pool = null; 
    logger.warn('Reintentando conexión en 5 segundos...'); 
    setTimeout(connectDB, 5000);
    throw err;
  }
};

/**
 * Obtiene el mes de referencia actual en formato 'YYYY-MM'.
 * @returns {string}
 */
export function obtenerMesReferenciaActual() {
  const ahora = new Date();
  const anio = ahora.getFullYear();
  const mes = (ahora.getMonth() + 1).toString().padStart(2, '0');
  return `${anio}-${mes}`;
}

/**
 * Registra una acción en la tabla de histórico.
 * IMPORTANTE: Debe ser llamada DENTRO de una transacción existente.
 * @param {sql.Request} transactionRequest - El objeto request de la transacción activa.
 * @param {number} noticiaId - ID de la noticia.
 * @param {string} tipoAccion - Tipo de acción (ej. 'PUBLICADA', 'ELIMINADA').
 * @param {string|null} detallesExtra - Detalles adicionales.
 */
export async function registrarAccionHistorico(transactionRequest, noticiaId, tipoAccion, detallesExtra = null) {
  if (!transactionRequest) {
    throw new Error('registrarAccionHistorico DEBE ser llamado con un objeto request de una transacción.');
  }

  const mesReferencia = obtenerMesReferenciaActual();
  const querySQL = `
    INSERT INTO dbo.Noticias_Acciones_Historico
      (noticia_id, tipo_accion, detalles_accion, mes_referencia, fecha_accion)
    VALUES
      (@reg_hist_noticia_id, @reg_hist_tipo_accion, @reg_hist_detalles_accion, @reg_hist_mes_referencia, GETDATE())
  `;
  try {
    // Usar prefijo 'reg_hist_' para evitar colisiones de nombres en los inputs del request
    const requestLog = transactionRequest; 
    requestLog.input('reg_hist_noticia_id', sql.Int, noticiaId);
    requestLog.input('reg_hist_tipo_accion', sql.VarChar(50), tipoAccion);
    requestLog.input('reg_hist_detalles_accion', sql.NVarChar(sql.MAX), detallesExtra);
    requestLog.input('reg_hist_mes_referencia', sql.VarChar(7), mesReferencia);

    await requestLog.query(querySQL);
    logger.info(`HISTÓRICO REGISTRADO: Noticia ID ${noticiaId}, Acción: ${tipoAccion}`); // <-- CAMBIO
  } catch (err) {
    logger.error(`Error al registrar acción '${tipoAccion}' para noticia ID ${noticiaId} en histórico: %s`, err.message); // <-- CAMBIO
    throw err; // Propagar el error para que la transacción principal pueda hacer rollback
  }
}

// Exportamos el objeto sql para usarlo en los controladores para definir tipos de datos
export { sql };