import request from 'supertest';
import app from '../../server.js';
import { sql } from '../config/db.js';

describe('API de Admin - Rutas Protegidas', () => {
  let sessionCookie; // Variable para guardar la cookie de sesión

  // Antes de todos los tests, nos logueamos como CEO para obtener una cookie de sesión válida
  beforeAll(async () => {
    const loginResponse = await request(app)
      .post('/api/usuarios/login')
      .send({
        email: 'kelvis@migrators.com.br',
        password: 'Lipa.15250821'
      });

    // Verificamos que el login fue exitoso antes de continuar
    expect(loginResponse.statusCode).toBe(200);

    // Extraemos la cookie de la cabecera 'set-cookie' de la respuesta
    const cookies = loginResponse.headers['set-cookie'];
    
    // Guardamos la cookie 'connect.sid' para usarla en las siguientes peticiones
    sessionCookie = cookies.find(cookie => cookie.startsWith('connect.sid'));
  });

  afterAll(async () => {
    await sql.close();
  });

  // --- Tests para /api/admin/clientes ---

  it('debería RECHAZAR el acceso a la lista de clientes sin una cookie de sesión', async () => {
    const res = await request(app).get('/api/admin/clientes');
    expect(res.statusCode).toEqual(401);
  });

  it('debería PERMITIR el acceso a la lista de clientes con una cookie de sesión de CEO válida', async () => {
    // Verificamos primero que obtuvimos la cookie.
    expect(sessionCookie).toBeDefined();

    const res = await request(app)
      .get('/api/admin/clientes')
      .set('Cookie', sessionCookie);

    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});