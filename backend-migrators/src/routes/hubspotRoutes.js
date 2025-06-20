import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();

const HUBSPOT_API_URL = 'https://api.hubapi.com';
const HUBSPOT_TOKEN = process.env.HUBSPOT_ACCESS_TOKEN;

// Configuración de Axios para HubSpot
const hubspotAPI = axios.create({
  baseURL: HUBSPOT_API_URL,
  headers: {
    Authorization: `Bearer ${HUBSPOT_TOKEN}`,
    'Content-Type': 'application/json',
  },
});

// Middleware para log de solicitudes
router.use((req, res, next) => {
  console.log(`[HubSpot] ${req.method} ${req.path}`);
  next();
});

// Obtener lista de contactos con paginación
router.get('/contacts', async (req, res) => {
  try {
    const { limit = 10, after } = req.query;
    const response = await hubspotAPI.get('/crm/v3/objects/contacts', {
      params: {
        limit,
        after,
        properties: 'email,firstname,lastname,phone'
      }
    });
    
    res.json({
      results: response.data.results,
      paging: response.data.paging
    });
  } catch (error) {
    console.error('❌ Error al obtener contactos:', {
      message: error.message,
      response: error.response?.data
    });
    res.status(error.response?.status || 500).json({
      error: 'Error al obtener contactos de HubSpot',
      details: error.response?.data || error.message
    });
  }
});

// Obtener un contacto específico por ID
router.get('/contacts/:id', async (req, res) => {
  try {
    const response = await hubspotAPI.get(`/crm/v3/objects/contacts/${req.params.id}`, {
      params: {
        properties: 'email,firstname,lastname,phone'
      }
    });
    res.json(response.data);
  } catch (error) {
    console.error('❌ Error al obtener contacto:', error.response?.data || error.message);
    res.status(error.response?.status || 404).json({
      error: 'Contacto no encontrado',
      details: error.response?.data || error.message
    });
  }
});

// Crear nuevo contacto
router.post('/contacts', async (req, res) => {
  try {
    const { properties } = req.body;
    
    if (!properties || !properties.email) {
      return res.status(400).json({ error: 'El email es requerido' });
    }

    const response = await hubspotAPI.post('/crm/v3/objects/contacts', {
      properties
    });
    
    res.status(201).json(response.data);
  } catch (error) {
    console.error('❌ Error al crear contacto:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: 'Error al crear contacto',
      details: error.response?.data || error.message
    });
  }
});

// Actualizar contacto existente
router.patch('/contacts/:id', async (req, res) => {
  try {
    const { properties } = req.body;
    
    if (!properties) {
      return res.status(400).json({ error: 'Properties es requerido' });
    }

    const response = await hubspotAPI.patch(`/crm/v3/objects/contacts/${req.params.id}`, {
      properties
    });
    
    res.json(response.data);
  } catch (error) {
    console.error('❌ Error al actualizar contacto:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: 'Error al actualizar contacto',
      details: error.response?.data || error.message
    });
  }
});

// Eliminar contacto
router.delete('/contacts/:id', async (req, res) => {
  try {
    await hubspotAPI.delete(`/crm/v3/objects/contacts/${req.params.id}`);
    res.json({ message: 'Contacto eliminado correctamente' });
  } catch (error) {
    console.error('❌ Error al eliminar contacto:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: 'Error al eliminar contacto',
      details: error.response?.data || error.message
    });
  }
});

// Buscar contactos por email
router.get('/contacts/search/email', async (req, res) => {
  try {
    const { email } = req.query;
    
    if (!email) {
      return res.status(400).json({ error: 'El parámetro email es requerido' });
    }

    const response = await hubspotAPI.post('/crm/v3/objects/contacts/search', {
      filterGroups: [{
        filters: [{
          propertyName: 'email',
          operator: 'EQ',
          value: email
        }]
      }],
      properties: ['email', 'firstname', 'lastname', 'phone',],
      limit: 1
    });
    
    res.json(response.data.results[0] || null);
  } catch (error) {
    console.error('❌ Error al buscar contacto:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: 'Error al buscar contacto',
      details: error.response?.data || error.message
    });
  }
});

export default router;