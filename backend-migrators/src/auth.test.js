// backend-migrators/src/auth.test.js (VERSIÓN FINAL CORREGIDA)

import request from 'supertest';
import app from '../server.js';
import { sql } from './config/db.js'; // <-- RUTA CORREGIDA

describe('API de Autenticación - /api/usuarios', () => {

  afterAll(async () => {
    await sql.close();
  });

  const ceoUser = {
    email: 'kelvis@migrators.com.br',
    password: 'Lipa.15250821'
  };

  it('Debería loguear a un usuario con credenciales correctas y devolver un token', async () => {
    const res = await request(app)
      .post('/api/usuarios/login')
      .send({
        email: ceoUser.email,
        password: ceoUser.password
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('user');
    expect(res.body.user.email).toBe(ceoUser.email);
  });

  it('No debería loguear a un usuario con contraseña incorrecta', async () => {
    const res = await request(app)
      .post('/api/usuarios/login')
      .send({
        email: ceoUser.email,
        password: 'password-incorrecta-123'
      });

    expect(res.statusCode).toEqual(401);
    expect(res.body.message).toBe('Credenciales inválidas.');
  });
});