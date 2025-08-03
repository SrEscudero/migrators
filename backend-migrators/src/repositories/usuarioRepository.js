import { connectDB, sql } from '../config/db.js';

export const usuarioRepository = {
    async findByEmail(email) {
        const pool = await connectDB();
        const result = await pool.request()
            .input('email', sql.VarChar, email)
            .query('SELECT * FROM Usuarios WHERE Email = @email');
        return result.recordset[0];
    },

    async findById(id) {
        const pool = await connectDB();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query('SELECT id, Nombre, Email, rol, perm_gestionar_clientes, perm_publicar_noticias, perm_ver_estadisticas FROM Usuarios WHERE id = @id');
        return result.recordset[0];
    },

    async createCliente(userData, transaction) {
        const { nombre, email, password_hash, celular } = userData;
        const request = transaction.request(); // Usa la transacción pasada
        const result = await request
            .input('nombre', sql.NVarChar, nombre)
            .input('email', sql.VarChar, email)
            .input('password_hash', sql.NVarChar, password_hash)
            .input('celular', sql.VarChar, celular)
            .query(`
                INSERT INTO Usuarios (Nombre, Email, password_hash, Celular, rol) 
                OUTPUT INSERTED.Id 
                VALUES (@nombre, @email, @password_hash, @celular, 'cliente')
            `);
        return result.recordset[0].Id;
    },

    async createFuncionario(funcionarioData) {
        const { nombre, email, password_hash, celular, permisos } = funcionarioData;
        const pool = await connectDB();
        const result = await pool.request()
            .input('nombre', sql.NVarChar, nombre)
            .input('email', sql.VarChar, email)
            .input('password_hash', sql.NVarChar, password_hash)
            .input('celular', sql.VarChar, celular)
            .input('perm_gestionar_clientes', sql.Bit, permisos?.gestionarClientes || false)
            .input('perm_publicar_noticias', sql.Bit, permisos?.publicarNoticias || false)
            .input('perm_ver_estadisticas', sql.Bit, permisos?.verEstadisticas || false)
            .query(`
                INSERT INTO Usuarios (Nombre, Email, password_hash, Celular, rol, perm_gestionar_clientes, perm_publicar_noticias, perm_ver_estadisticas) 
                OUTPUT INSERTED.Id, INSERTED.Nombre, INSERTED.Email, INSERTED.rol
                VALUES (@nombre, @email, @password_hash, @celular, 'funcionario', @perm_gestionar_clientes, @perm_publicar_noticias, @perm_ver_estadisticas)
            `);
        return result.recordset[0];
    },

    async updateFuncionario(id, funcionarioData) {
        const { nombre, email, celular, permisos } = funcionarioData;
        const pool = await connectDB();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .input('nombre', sql.NVarChar, nombre)
            .input('email', sql.VarChar, email)
            .input('celular', sql.VarChar, celular || null)
            .input('perm_gestionar_clientes', sql.Bit, permisos?.gestionarClientes || false)
            .input('perm_publicar_noticias', sql.Bit, permisos?.publicarNoticias || false)
            .input('perm_ver_estadisticas', sql.Bit, permisos?.verEstadisticas || false)
            .query(`
                UPDATE Usuarios SET Nombre = @nombre, Email = @email, Celular = @celular, 
                perm_gestionar_clientes = @perm_gestionar_clientes, perm_publicar_noticias = @perm_publicar_noticias,
                perm_ver_estadisticas = @perm_ver_estadisticas, fecha_actualizacion = SYSDATETIMEOFFSET()
                WHERE Id = @id AND rol = 'funcionario'
            `);
        return result.rowsAffected[0];
    },
    
    async deleteFuncionarioById(id) {
        const pool = await connectDB();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query("DELETE FROM Usuarios WHERE Id = @id AND rol = 'funcionario'");
        return result.rowsAffected[0];
    },

    async findAllFuncionarios() {
        const pool = await connectDB();
        const result = await pool.request().query(`
            SELECT Id AS id, Nombre AS nombre, Email AS email, Celular AS celular, rol
            FROM Usuarios WHERE rol = 'funcionario' ORDER BY Nombre
        `);
        return result.recordset;
    }
};

export const clienteRepository = {
    async create(clienteData, transaction) {
        const { usuario_id, nacionalidad, estatus_documentos } = clienteData;
        const request = transaction.request();
        await request
            .input('usuario_id', sql.Int, usuario_id)
            .input('nacionalidad', sql.NVarChar, nacionalidad)
            .input('estatus_documentos', sql.NVarChar, estatus_documentos)
            .query(`
                INSERT INTO Clientes (usuario_id, estatus_documentos, Nacionalidad) 
                VALUES (@usuario_id, @estatus_documentos, @nacionalidad)
            `);
    },
    
    async findAll(baseQuery) {
        const pool = await connectDB();
        const result = await pool.request().query(baseQuery);
        return result.recordset;
    },

    async assignFuncionario(clienteId, funcionarioId) {
        const pool = await connectDB();
        const result = await pool.request()
            .input('clienteId', sql.Int, clienteId)
            .input('funcionarioId', sql.Int, funcionarioId)
            .query(`UPDATE Clientes SET funcionario_asignado_id = @funcionarioId, fecha_asignacion = GETDATE() WHERE usuario_id = @clienteId`);
        return result.rowsAffected[0];
    },
    
    async deleteByUsuarioId(usuarioId, transaction) {
        const request = transaction.request();
        const result = await request
            .input('usuarioId', sql.Int, usuarioId)
            .query('DELETE FROM Clientes WHERE usuario_id = @usuarioId');
        return result.rowsAffected[0];
    }
};