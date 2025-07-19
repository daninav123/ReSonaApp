import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import Event, { IEvent } from '../models/Event';
import mongoose from 'mongoose';

export class GoogleCalendarService {
  private oAuth2Client: OAuth2Client;
  
  constructor() {
    // Las credenciales deberían cargarse desde variables de entorno en producción
    const credentials = {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      redirectUri: process.env.GOOGLE_REDIRECT_URI
    };
    
    this.oAuth2Client = new google.auth.OAuth2(
      credentials.clientId,
      credentials.clientSecret,
      credentials.redirectUri
    );
  }
  
  /**
   * Genera una URL para que el usuario autorice el acceso a su calendario
   */
  public getAuthUrl(): string {
    const scopes = [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events'
    ];
    
    return this.oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent' // Para asegurar que siempre se reciba un refresh_token
    });
  }
  
  /**
   * Intercambia el código de autorización por tokens de acceso y refresco
   */
  public async getTokensFromCode(code: string): Promise<{
    accessToken: string;
    refreshToken: string;
    expiryDate: number;
  }> {
    const { tokens } = await this.oAuth2Client.getToken(code);
    
    if (!tokens.access_token) {
      throw new Error('No se pudo obtener el token de acceso');
    }
    
    return {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token || '',
      expiryDate: tokens.expiry_date || 0
    };
  }
  
  /**
   * Configura el cliente OAuth2 con los tokens del usuario
   */
  public setCredentials(accessToken: string, refreshToken?: string, expiryDate?: number): void {
    this.oAuth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
      expiry_date: expiryDate
    });
  }
  
  /**
   * Crea un evento en Google Calendar
   */
  public async createEvent(event: IEvent): Promise<{ externalId: string; externalUrl?: string }> {
    const calendar = google.calendar({ version: 'v3', auth: this.oAuth2Client });
    
    const googleEvent = this.convertToGoogleEvent(event);
    
    try {
      const response = await calendar.events.insert({
        calendarId: 'primary', // Usa el calendario principal del usuario
        requestBody: googleEvent
      });
      
      if (!response.data.id) {
        throw new Error('No se pudo crear el evento en Google Calendar');
      }
      
      return {
        externalId: response.data.id,
        externalUrl: response.data.htmlLink
      };
    } catch (error) {
      console.error('Error al crear evento en Google Calendar:', error);
      throw error;
    }
  }
  
  /**
   * Actualiza un evento existente en Google Calendar
   */
  public async updateEvent(event: IEvent, externalId: string): Promise<void> {
    const calendar = google.calendar({ version: 'v3', auth: this.oAuth2Client });
    
    const googleEvent = this.convertToGoogleEvent(event);
    
    try {
      await calendar.events.update({
        calendarId: 'primary',
        eventId: externalId,
        requestBody: googleEvent
      });
    } catch (error) {
      console.error('Error al actualizar evento en Google Calendar:', error);
      throw error;
    }
  }
  
  /**
   * Elimina un evento de Google Calendar
   */
  public async deleteEvent(externalId: string): Promise<void> {
    const calendar = google.calendar({ version: 'v3', auth: this.oAuth2Client });
    
    try {
      await calendar.events.delete({
        calendarId: 'primary',
        eventId: externalId
      });
    } catch (error) {
      console.error('Error al eliminar evento de Google Calendar:', error);
      throw error;
    }
  }
  
  /**
   * Sincroniza eventos de Google Calendar a nuestra aplicación
   */
  public async syncEvents(userId: mongoose.Types.ObjectId): Promise<void> {
    const calendar = google.calendar({ version: 'v3', auth: this.oAuth2Client });
    
    try {
      // Obtener eventos de los próximos 30 días
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 30);
      
      const response = await calendar.events.list({
        calendarId: 'primary',
        timeMin: startDate.toISOString(),
        timeMax: endDate.toISOString(),
        singleEvents: true,
        orderBy: 'startTime'
      });
      
      const events = response.data.items;
      
      if (!events || events.length === 0) {
        return;
      }
      
      // Obtener IDs de eventos externos ya sincronizados
      const existingEvents = await Event.find({
        'externalCalendars.provider': 'google',
        'externalCalendars.externalId': { $in: events.map(event => event.id) }
      }).select('externalCalendars.externalId');
      
      const existingIds = existingEvents.flatMap(event => 
        event.externalCalendars
          .filter(cal => cal.provider === 'google')
          .map(cal => cal.externalId)
      );
      
      // Procesar solo eventos nuevos
      for (const googleEvent of events) {
        if (!googleEvent.id || existingIds.includes(googleEvent.id)) {
          continue;
        }
        
        await this.createEventFromGoogleEvent(googleEvent, userId);
      }
    } catch (error) {
      console.error('Error al sincronizar eventos desde Google Calendar:', error);
      throw error;
    }
  }
  
  /**
   * Convierte un evento de nuestra aplicación a formato Google Calendar
   */
  private convertToGoogleEvent(event: IEvent): any {
    return {
      summary: event.title,
      description: event.description || '',
      location: event.location || '',
      start: {
        dateTime: event.startDate.toISOString(),
        timeZone: 'Europe/Madrid'
      },
      end: {
        dateTime: event.endDate.toISOString(),
        timeZone: 'Europe/Madrid'
      },
      // Se podrían añadir reminders, attendees, etc.
      reminders: {
        useDefault: true
      }
    };
  }
  
  /**
   * Crea un evento en nuestra aplicación a partir de un evento de Google Calendar
   */
  private async createEventFromGoogleEvent(googleEvent: any, userId: mongoose.Types.ObjectId): Promise<IEvent> {
    const newEvent = new Event({
      title: googleEvent.summary || 'Evento sin título',
      description: googleEvent.description || '',
      startDate: googleEvent.start.dateTime || googleEvent.start.date,
      endDate: googleEvent.end.dateTime || googleEvent.end.date,
      location: googleEvent.location || '',
      createdBy: userId,
      status: 'confirmed',
      isAllDay: !googleEvent.start.dateTime,
      externalCalendars: [{
        provider: 'google',
        externalId: googleEvent.id as string,
        externalUrl: googleEvent.htmlLink,
        lastSynced: new Date()
      }]
    });
    
    return await newEvent.save();
  }
}
