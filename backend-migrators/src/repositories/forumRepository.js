import { connectDB, sql } from '../config/db.js';

export const forumRepository = {
    async getAllForumsWithCounts() {
        const pool = await connectDB();
        const result = await pool.request().query(`
            SELECT f.*, 
            (SELECT COUNT(*) FROM Threads WHERE forum_id = f.id) AS threadCount,
            (SELECT COUNT(*) FROM Posts p JOIN Threads t ON p.thread_id = t.id WHERE t.forum_id = f.id) AS postCount
            FROM Forums f ORDER BY f.titulo ASC
        `);
        return result.recordset;
    },

    async getThreadsByForumId(forumId) {
        const pool = await connectDB();
        const result = await pool.request()
            .input('forumId', sql.Int, forumId)
            .query(`
                SELECT t.*, u.Nombre AS autorNombre,
                (SELECT COUNT(*) FROM Posts WHERE thread_id = t.id) AS replyCount
                FROM Threads t JOIN Usuarios u ON t.autor_id = u.id
                WHERE t.forum_id = @forumId ORDER BY t.fecha_creacion DESC
            `);
        return result.recordset;
    },
    
    async getThreadById(threadId) {
        const pool = await connectDB();
        const result = await pool.request()
            .input('threadId', sql.Int, threadId)
            .query(`SELECT t.*, u.Nombre AS autorNombre FROM Threads t JOIN Usuarios u ON t.autor_id = u.id WHERE t.id = @threadId`);
        return result.recordset[0];
    },

    async getPostsByThreadId(threadId) {
        const pool = await connectDB();
        const result = await pool.request()
            .input('threadId', sql.Int, threadId)
            .query(`SELECT p.*, u.Nombre AS autorNombre FROM Posts p JOIN Usuarios u ON p.autor_id = u.id WHERE p.thread_id = @threadId ORDER BY p.fecha_creacion ASC`);
        return result.recordset;
    },
    
    async incrementThreadView(threadId) {
        const pool = await connectDB();
        await pool.request()
            .input('threadId', sql.Int, threadId)
            .query('UPDATE Threads SET views = views + 1 WHERE id = @threadId');
    },

    async createThread(threadData) {
        const { titulo, contenido, autor_id, forum_id } = threadData;
        const pool = await connectDB();
        const result = await pool.request()
            .input('titulo', sql.NVarChar, titulo)
            .input('contenido', sql.NText, contenido)
            .input('autor_id', sql.Int, autor_id)
            .input('forum_id', sql.Int, forum_id)
            .query(`INSERT INTO Threads (titulo, contenido, autor_id, forum_id) OUTPUT INSERTED.* VALUES (@titulo, @contenido, @autor_id, @forum_id)`);
        return result.recordset[0];
    },

    async createPost(postData) {
        const { contenido, autor_id, thread_id } = postData;
        const pool = await connectDB();
        const result = await pool.request()
            .input('contenido', sql.NText, contenido)
            .input('autor_id', sql.Int, autor_id)
            .input('thread_id', sql.Int, thread_id)
            .query(`INSERT INTO Posts (contenido, autor_id, thread_id) OUTPUT INSERTED.* VALUES (@contenido, @autor_id, @thread_id)`);
        return result.recordset[0];
    },
    
    async findPostById(postId) {
        const pool = await connectDB();
        const result = await pool.request()
            .input('postId', sql.Int, postId)
            .query('SELECT * FROM Posts WHERE id = @postId');
        return result.recordset[0];
    },
    
    async updatePost(postId, contenido) {
        const pool = await connectDB();
        const result = await pool.request()
            .input('postId', sql.Int, postId)
            .input('contenido', sql.NText, contenido)
            .query('UPDATE Posts SET contenido = @contenido, fecha_edicion = GETDATE() WHERE id = @postId');
        return result.rowsAffected[0];
    },

    async deletePost(postId) {
        const pool = await connectDB();
        const result = await pool.request()
            .input('postId', sql.Int, postId)
            .query('DELETE FROM Posts WHERE id = @postId');
        return result.rowsAffected[0];
    },

    // --- NUEVO MÉTODO AÑADIDO ---
    async deleteThread(threadId) {
        const pool = await connectDB();
        const transaction = new sql.Transaction(pool);
        try {
            await transaction.begin();
            const request = new sql.Request(transaction);

            await request.input('threadIdForPosts', sql.Int, threadId).query('DELETE FROM Posts WHERE thread_id = @threadIdForPosts');
            
            const result = await request.input('threadIdForThread', sql.Int, threadId).query('DELETE FROM Threads WHERE id = @threadIdForThread');
            
            await transaction.commit();
            return result.rowsAffected[0];
        } catch (error) {
            await transaction.rollback();
            // Propagamos el error para que el controlador lo maneje
            throw error;
        }
    }
};