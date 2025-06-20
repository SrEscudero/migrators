import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const HUBSPOT_API_URL = 'https://api.hubapi.com';
const HUBSPOT_TOKEN = process.env.HUBSPOT_ACCESS_TOKEN;

// Creamos una instancia de Axios dedicada para HubSpot
const hubspotAPI = axios.create({
  baseURL: HUBSPOT_API_URL,
  headers: {
    Authorization: `Bearer ${HUBSPOT_TOKEN}`,
    'Content-Type': 'application/json',
  },
});

/**
 * Sincroniza un contacto en HubSpot.
 * Busca por email. Si existe, lo actualiza. Si no, lo crea.
 * @param {object} contactData - Datos del contacto, ej: { email, firstname, lastname, phone }
 */
export const syncHubspotContact = async (contactData) => {
  if (!contactData || !contactData.email) {
    console.error('[HubSpot Service] El email es requerido para sincronizar el contacto.');
    return;
  }

  try {
    // 1. Buscar si el contacto ya existe por email
    const searchResponse = await hubspotAPI.post('/crm/v3/objects/contacts/search', {
      filterGroups: [{
        filters: [{
          propertyName: 'email',
          operator: 'EQ',
          value: contactData.email
        }]
      }],
      properties: ['email'], // Solo necesitamos saber si existe
      limit: 1
    });

    const properties = {
        email: contactData.email,
        firstname: contactData.firstname,
        lastname: contactData.lastname || '', // HubSpot requiere a veces un valor, aunque sea vacío
        phone: contactData.phone,
        // Aquí puedes añadir más propiedades personalizadas que tengas en HubSpot
        // ej: lead_source: 'Plataforma Migrators'
    };

    if (searchResponse.data.total > 0) {
      // 2. Si existe, lo actualizamos (PATCH)
      const contactId = searchResponse.data.results[0].id;
      console.log(`[HubSpot Service] Actualizando contacto existente ID: ${contactId}`);
      await hubspotAPI.patch(`/crm/v3/objects/contacts/${contactId}`, { properties });
    } else {
      // 3. Si no existe, lo creamos (POST)
      console.log(`[HubSpot Service] Creando nuevo contacto para: ${contactData.email}`);
      await hubspotAPI.post('/crm/v3/objects/contacts', { properties });
    }
  } catch (error) {
    // Capturamos el error para que no detenga el flujo principal de la aplicación
    console.error('❌ Error al sincronizar contacto con HubSpot:', error.response?.data || error.message);
  }
};