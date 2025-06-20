// backend-migrators/src/__tests__/admin.test.js (CORREGIDO)

import request from 'supertest';
import app from '../../server.js';
import { sql } from '../config/db.js';

describe('API de Admin - Rutas Protegidas', () => {
  let ceoToken; // Variable para guardar el token

  // Antes de todos los tests, nos logueamos como CEO para obtener un token válido
  beforeAll(async () => {
    const loginResponse = await request(app)
      .post('/api/usuarios/login')
      .send({
        email: 'kelvis@migrators.com.br', // <-- CORREGIDO
        password: 'Lipa.15250821'         // <-- CORREGIDO
      });
    ceoToken = loginResponse.body.token;
  });

  afterAll(async () => {
    await sql.close();
  });

  // --- Tests para /api/admin/clientes ---

  it('debería RECHAZAR el acceso a la lista de clientes sin un token', async () => {
    const res = await request(app).get('/api/admin/clientes');
    expect(res.statusCode).toEqual(401);
  });

  it('debería PERMITIR el acceso a la lista de clientes con un token de CEO válido', async () => {
    // Verificamos primero que obtuvimos un token. Si no, el login falló.
    expect(ceoToken).toBeDefined(); 
    expect(typeof ceoToken).toBe('string');

    const res = await request(app)
      .get('/api/admin/clientes')
      .set('Authorization', `Bearer ${ceoToken}`); // Usamos el token

    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});