// Archivo: backend-migrators/src/repositories/visitanteRepository.js

import { connectDB, sql } from '../config/db.js';

export const visitanteRepository = {
    async create(visitanteData) {
        const { ip_address, pais, ciudad, isp, is_proxy, is_vpn, is_tor, fraud_score, user_agent } = visitanteData;
        const pool = await connectDB();
        await pool.request()
            .input('ip_address', sql.NVarChar(45), ip_address)
            .input('pais', sql.NVarChar(100), pais)
            .input('ciudad', sql.NVarChar(100), ciudad)
            .input('isp', sql.NVarChar(255), isp)
            .input('is_proxy', sql.Bit, is_proxy || false)
            .input('is_vpn', sql.Bit, is_vpn || false)
            .input('is_tor', sql.Bit, is_tor || false)
            .input('fraud_score', sql.Int, fraud_score)
            .input('user_agent', sql.NVarChar(500), user_agent)
            .query(`
                INSERT INTO Visitantes (ip_address, pais, ciudad, isp, is_proxy, is_vpn, is_tor, fraud_score, user_agent)
                VALUES (@ip_address, @pais, @ciudad, @isp, @is_proxy, @is_vpn, @is_tor, @fraud_score, @user_agent);
            `);
    },
    async findAll() {
        const pool = await connectDB();
        const result = await pool.request().query("SELECT * FROM Visitantes ORDER BY fecha_visita DESC");
        return result.recordset || [];
    }
};