// Archivo: backend-migrators/src/config/db.js (Versión Unificada y Mejorada)

import sql from 'mssql';
import dotenv from 'dotenv';

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

/**
 * Establece y retorna un pool de conexiones a SQL Server.
 * Si el pool ya existe y está conectado, lo reutiliza.
 * Implementa reintentos en caso de fallo.
 */
export const connectDB = async () => {
  try {
    if (pool && pool.connected) {
      // console.log('✅ Pool de SQL Server ya está conectado.');
      return pool;
    }
    console.log('Attempting to connect to SQL Server...');
    pool = await sql.connect(dbConfig);
    console.log('✅ Conectado a SQL Server');
    return pool;
  } catch (err) {
    console.error('❌ Error al conectar con SQL Server:', err.message);
    // Liberar el pool si la conexión falló para permitir un nuevo intento
    pool = null; 
    console.log('Reintentando conexión en 5 segundos...');
    setTimeout(connectDB, 5000);
    throw err; // Relanzar el error para que la llamada inicial sepa que falló
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
    console.log(`HISTÓRICO REGISTRADO: Noticia ID ${noticiaId}, Acción: ${tipoAccion}`);
  } catch (err) {
    console.error(`Error al registrar acción '${tipoAccion}' para noticia ID ${noticiaId} en histórico:`, err.message);
    throw err; // Propagar el error para que la transacción principal pueda hacer rollback
  }
}

// Exportamos el objeto sql para usarlo en los controladores para definir tipos de datos
export { sql };