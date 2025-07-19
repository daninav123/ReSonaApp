import axios from 'axios';
import type { CalendarEvent, CalendarEventFilters, ResourceAvailabilityRequest, BatchStatusUpdateRequest } from '../types/calendar';

const API_URL = '/api/calendar';

// Interfaz CalendarEventFilters importada desde ../types/calendar

// Interfaz ResourceAvailabilityRequest importada desde ../types/calendar

// Interfaz BatchStatusUpdateRequest importada desde ../types/calendar

const calendarApi = {
  /**
   * Get events with optional filtering
   */
  getEvents: async (filters?: CalendarEventFilters): Promise<CalendarEvent[]> => {
    const params = new URLSearchParams();
    
    // Convert filters to query parameters
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(item => params.append(`${key}[]`, item));
          } else {
            params.append(key, String(value));
          }
        }
      });
    }
    
    const response = await axios.get(`${API_URL}?${params.toString()}`);
    return response.data;
  },
  
  /**
   * Get a specific event by ID
   */
  getEventById: async (eventId: string): Promise<CalendarEvent> => {
    const response = await axios.get(`${API_URL}/${eventId}`);
    return response.data;
  },
  
  /**
   * Create a new event
   */
  createEvent: async (eventData: CalendarEvent): Promise<CalendarEvent> => {
    const response = await axios.post(API_URL, eventData);
    return response.data;
  },
  
  /**
   * Update an existing event
   */
  updateEvent: async (eventId: string, eventData: Partial<CalendarEvent>): Promise<CalendarEvent> => {
    const response = await axios.put(`${API_URL}/${eventId}`, eventData);
    return response.data;
  },
  
  /**
   * Delete an event
   */
  deleteEvent: async (eventId: string): Promise<{ success: boolean; message: string }> => {
    const response = await axios.delete(`${API_URL}/${eventId}`);
    return response.data;
  },
  
  /**
   * Get events in a specific date range
   */
  getEventsByDateRange: async (start: Date | string, end: Date | string, userId?: string): Promise<CalendarEvent[]> => {
    const startStr = typeof start === 'string' ? start : start.toISOString();
    const endStr = typeof end === 'string' ? end : end.toISOString();
    
    const url = userId 
      ? `${API_URL}/range/${startStr}/${endStr}?userId=${userId}`
      : `${API_URL}/range/${startStr}/${endStr}`;
    
    const response = await axios.get(url);
    return response.data;
  },
  
  /**
   * Get recurring event instances in a specific date range
   */
  getRecurringEventInstances: async (eventId: string, start: Date | string, end: Date | string): Promise<CalendarEvent[]> => {
    const startStr = typeof start === 'string' ? start : start.toISOString();
    const endStr = typeof end === 'string' ? end : end.toISOString();
    
    const response = await axios.get(`${API_URL}/recurring/${eventId}/${startStr}/${endStr}`);
    return response.data;
  },
  
  /**
   * Check resource availability for a given time period
   */
  checkResourceAvailability: async (
    data: ResourceAvailabilityRequest
  ): Promise<Record<string, boolean>> => {
    const response = await axios.post(`${API_URL}/check-availability`, data);
    return response.data;
  },
  
  /**
   * Update status of multiple events in batch
   */
  batchUpdateStatus: async (
    data: BatchStatusUpdateRequest
  ): Promise<{ success: boolean; updatedCount: number }> => {
    const response = await axios.put(`${API_URL}/status/batch`, data);
    return response.data;
  }
};

// Exportamos el objeto API por defecto
export default calendarApi;

// Re-exportar tipos para conveniencia
export type { CalendarEvent } from '../types/calendar';
