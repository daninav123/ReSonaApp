import express from 'express';
import { param, body } from 'express-validator';
import { authenticate, IAuthRequest } from '../middlewares/authenticate';
import { validateRequest } from '../middlewares/validateRequest';
import { GoogleCalendarService } from '../services/googleCalendar';
import Event from '../models/Event';
import mongoose from 'mongoose';
import User from '../models/User';

const router = express.Router();

// Base de todas las rutas protegidas por autenticación
router.use(authenticate);

// Ruta para obtener URL de autorización
router.get('/auth-url', async (req: IAuthRequest, res) => {
  try {
    const googleCalendarService = new GoogleCalendarService();
    const authUrl = googleCalendarService.getAuthUrl();
    
    res.json({ authUrl });
  } catch (error) {
    console.error('Error al obtener URL de autorización:', error);
    res.status(500).json({ message: 'Error al obtener URL de autorización', error });
  }
});

// Ruta para procesar el código de autorización
router.post(
  '/auth-callback',
  [
    body('code').notEmpty().withMessage('El código de autorización es obligatorio'),
    validateRequest
  ],
  async (req: IAuthRequest, res) => {
    try {
      const { code } = req.body;
      const userId = req.user?._id;
      
      if (!userId) {
        return res.status(401).json({ message: 'Usuario no autenticado' });
      }
      
      const googleCalendarService = new GoogleCalendarService();
      const tokens = await googleCalendarService.getTokensFromCode(code);
      
      // Guardar tokens en el usuario
      await User.findByIdAndUpdate(userId, {
        $set: {
          'integrations.googleCalendar': {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            expiryDate: tokens.expiryDate,
            connected: true,
            lastSynced: new Date()
          }
        }
      });
      
      res.json({ message: 'Autorización completada correctamente' });
    } catch (error) {
      console.error('Error al procesar código de autorización:', error);
      res.status(500).json({ message: 'Error al procesar código de autorización', error });
    }
  }
);

// Ruta para sincronizar eventos desde Google Calendar
router.post('/sync', async (req: IAuthRequest, res) => {
  try {
    const userId = req.user?._id;
    
    if (!userId) {
      return res.status(401).json({ message: 'Usuario no autenticado' });
    }
    
    // Obtener credenciales del usuario
    const user = await User.findById(userId);
    
    if (!user?.integrations?.googleCalendar?.connected) {
      return res.status(400).json({ message: 'Google Calendar no está conectado' });
    }
    
    const { accessToken, refreshToken, expiryDate } = user.integrations.googleCalendar;
    
    // Inicializar servicio con credenciales
    const googleCalendarService = new GoogleCalendarService();
    googleCalendarService.setCredentials(accessToken, refreshToken, expiryDate);
    
    // Realizar sincronización
    await googleCalendarService.syncEvents(userId);
    
    // Actualizar fecha de última sincronización
    await User.findByIdAndUpdate(userId, {
      $set: { 'integrations.googleCalendar.lastSynced': new Date() }
    });
    
    res.json({ message: 'Sincronización completada correctamente' });
  } catch (error) {
    console.error('Error al sincronizar eventos:', error);
    res.status(500).json({ message: 'Error al sincronizar eventos', error });
  }
});

// Ruta para conectar un evento existente con Google Calendar
router.post(
  '/connect-event/:id',
  [
    param('id').isMongoId().withMessage('ID de evento inválido'),
    validateRequest
  ],
  async (req: IAuthRequest, res) => {
    try {
      const { id } = req.params;
      const userId = req.user?._id;
      
      if (!userId) {
        return res.status(401).json({ message: 'Usuario no autenticado' });
      }
      
      // Obtener el evento
      const event = await Event.findById(id);
      
      if (!event) {
        return res.status(404).json({ message: 'Evento no encontrado' });
      }
      
      // Obtener credenciales del usuario
      const user = await User.findById(userId);
      
      if (!user?.integrations?.googleCalendar?.connected) {
        return res.status(400).json({ message: 'Google Calendar no está conectado' });
      }
      
      const { accessToken, refreshToken, expiryDate } = user.integrations.googleCalendar;
      
      // Inicializar servicio con credenciales
      const googleCalendarService = new GoogleCalendarService();
      googleCalendarService.setCredentials(accessToken, refreshToken, expiryDate);
      
      // Comprobar si el evento ya está conectado a Google Calendar
      const existingGoogleCalendar = event.externalCalendars.find(cal => cal.provider === 'google');
      
      if (existingGoogleCalendar) {
        // Actualizar el evento existente
        await googleCalendarService.updateEvent(event, existingGoogleCalendar.externalId);
        
        // Actualizar la fecha de sincronización
        existingGoogleCalendar.lastSynced = new Date();
        await event.save();
      } else {
        // Crear evento en Google Calendar
        const { externalId, externalUrl } = await googleCalendarService.createEvent(event);
        
        // Guardar referencia en nuestro evento
        event.externalCalendars.push({
          provider: 'google',
          externalId,
          externalUrl,
          lastSynced: new Date()
        });
        
        await event.save();
      }
      
      res.json({ 
        message: 'Evento conectado correctamente con Google Calendar',
        event
      });
    } catch (error) {
      console.error('Error al conectar evento con Google Calendar:', error);
      res.status(500).json({ message: 'Error al conectar evento con Google Calendar', error });
    }
  }
);

// Ruta para desconectar un evento de Google Calendar
router.delete(
  '/disconnect-event/:id',
  [
    param('id').isMongoId().withMessage('ID de evento inválido'),
    validateRequest
  ],
  async (req: IAuthRequest, res) => {
    try {
      const { id } = req.params;
      const userId = req.user?._id;
      
      if (!userId) {
        return res.status(401).json({ message: 'Usuario no autenticado' });
      }
      
      // Obtener el evento
      const event = await Event.findById(id);
      
      if (!event) {
        return res.status(404).json({ message: 'Evento no encontrado' });
      }
      
      // Buscar la conexión con Google Calendar
      const googleCalendarIndex = event.externalCalendars.findIndex(cal => cal.provider === 'google');
      
      if (googleCalendarIndex === -1) {
        return res.status(400).json({ message: 'Evento no conectado con Google Calendar' });
      }
      
      const externalId = event.externalCalendars[googleCalendarIndex].externalId;
      
      // Obtener credenciales del usuario
      const user = await User.findById(userId);
      
      if (!user?.integrations?.googleCalendar?.connected) {
        return res.status(400).json({ message: 'Google Calendar no está conectado' });
      }
      
      const { accessToken, refreshToken, expiryDate } = user.integrations.googleCalendar;
      
      // Inicializar servicio con credenciales
      const googleCalendarService = new GoogleCalendarService();
      googleCalendarService.setCredentials(accessToken, refreshToken, expiryDate);
      
      // Eliminar evento de Google Calendar
      await googleCalendarService.deleteEvent(externalId);
      
      // Eliminar referencia en nuestro evento
      event.externalCalendars.splice(googleCalendarIndex, 1);
      await event.save();
      
      res.json({ 
        message: 'Evento desconectado correctamente de Google Calendar',
        event
      });
    } catch (error) {
      console.error('Error al desconectar evento de Google Calendar:', error);
      res.status(500).json({ message: 'Error al desconectar evento de Google Calendar', error });
    }
  }
);

// Ruta para desconectar Google Calendar
router.delete('/disconnect', async (req: IAuthRequest, res) => {
  try {
    const userId = req.user?._id;
    
    if (!userId) {
      return res.status(401).json({ message: 'Usuario no autenticado' });
    }
    
    // Actualizar usuario para eliminar la conexión
    await User.findByIdAndUpdate(userId, {
      $set: { 'integrations.googleCalendar.connected': false }
    });
    
    res.json({ message: 'Google Calendar desconectado correctamente' });
  } catch (error) {
    console.error('Error al desconectar Google Calendar:', error);
    res.status(500).json({ message: 'Error al desconectar Google Calendar', error });
  }
});

export default router;
