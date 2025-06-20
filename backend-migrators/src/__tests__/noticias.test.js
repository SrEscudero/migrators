// backend-migrators/src/__tests__/noticias.test.js

import request from 'supertest';
import app from '../../server.js'; // Asegúrate que la ruta sea correcta
import { sql } from '../config/db.js';

// Describe el conjunto de pruebas para la API de Noticias
describe('API de Noticias - /api/noticias', () => {

  // Hook que se ejecuta después de que TODOS los tests en este archivo terminen
  afterAll(async () => {
    await sql.close(); // Cierra la conexión a la base de datos para que Jest pueda terminar
  });

  // Test para el "camino feliz": todo funciona como se espera
  it('debería crear una nueva noticia con datos válidos y devolver un estado 201', async () => {
    const nuevaNoticia = {
      titulo: `Noticia de Prueba - ${Date.now()}`, // Título único para cada test
      autor: 'Tester Automatizado',
      contenido: 'Este es el contenido de nuestra noticia de prueba.',
      link: 'https://example.com/test',
      fecha_expiracion: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Expira en 24h
      estado: 'publicado',
      fecha_publicacion: new Date().toISOString(),
      destacada: false
    };

    const res = await request(app)
      .post('/api/noticias')
      .send(nuevaNoticia);

    // Verificamos que el código de estado sea 201 (Creado)
    expect(res.statusCode).toEqual(201);
    // Verificamos que el mensaje de respuesta sea el esperado
    expect(res.body.message).toContain('Noticia agregada con estado');
  });

  // Test para el caso de error: faltan datos
  it('no debería crear una noticia si faltan campos obligatorios y debería devolver 400', async () => {
    const noticiaInvalida = {
      autor: 'Tester',
      // A propósito faltan 'titulo', 'contenido', etc.
    };

    const res = await request(app)
      .post('/api/noticias')
      .send(noticiaInvalida);

    // Verificamos que el código de estado sea 400 (Petición incorrecta)
    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toBe('Faltan campos obligatorios.');
  });
});