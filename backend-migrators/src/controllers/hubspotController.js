import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const HUBSPOT_API_URL = 'https://api.hubapi.com';
const HUBSPOT_TOKEN = process.env.HUBSPOT_ACCESS_TOKEN;

const hubspotAPI = axios.create({
  baseURL: HUBSPOT_API_URL,
  headers: {
    Authorization: `Bearer ${HUBSPOT_TOKEN}`,
    'Content-Type': 'application/json',
  },
});

export const getContacts = async (req, res) => {
  try {
    const { limit = 10, after } = req.query;
    const response = await hubspotAPI.get('/crm/v3/objects/contacts', {
      params: { limit, after, properties: 'email,firstname,lastname,phone' }
    });
    res.json({
      results: response.data.results,
      paging: response.data.paging
    });
  } catch (error) {
    console.error('Error al obtener contactos:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: 'Error al obtener contactos',
      details: error.response?.data || error.message
    });
  }
};

export const syncLead = async (req, res) => {
  try {
    const { properties } = req.body;
    
    if (!properties || !properties.email) {
      return res.status(400).json({ error: 'El email es requerido' });
    }

    // Primero verifica si el contacto ya existe
    const searchResponse = await hubspotAPI.post('/crm/v3/objects/contacts/search', {
      filterGroups: [{
        filters: [{
          propertyName: 'email',
          operator: 'EQ',
          value: properties.email
        }]
      }],
      limit: 1
    });

    let response;
    if (searchResponse.data.results.length > 0) {
      // Actualizar contacto existente
      const contactId = searchResponse.data.results[0].id;
      response = await hubspotAPI.patch(`/crm/v3/objects/contacts/${contactId}`, {
        properties
      });
    } else {
      // Crear nuevo contacto
      response = await hubspotAPI.post('/crm/v3/objects/contacts', {
        properties
      });
    }

    res.status(response.status === 201 ? 201 : 200).json(response.data);
  } catch (error) {
    console.error('Error al sincronizar lead:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: 'Error al sincronizar lead',
      details: error.response?.data || error.message
    });
  }
};