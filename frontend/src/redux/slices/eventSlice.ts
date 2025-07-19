import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import type { IEvent, IEventFilters, IEventWithPopulated, IChecklistItem } from '../../types/event.types';
import axios from 'axios';

// Servicio API para llamadas HTTP
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para añadir token a las solicitudes
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Estado inicial
interface EventState {
  events: IEventWithPopulated[];
  selectedEvent: IEventWithPopulated | null;
  loading: boolean;
  error: string | null;
  totalEvents: number;
  currentPage: number;
  totalPages: number;
  monthEvents: IEvent[];
  monthEventsLoading: boolean;
  monthEventsError: string | null;
  syncStatus: {
    loading: boolean;
    success: boolean;
    error: string | null;
    lastSynced: string | null;
  };
}

const initialState: EventState = {
  events: [],
  selectedEvent: null,
  loading: false,
  error: null,
  totalEvents: 0,
  currentPage: 1,
  totalPages: 1,
  monthEvents: [],
  monthEventsLoading: false,
  monthEventsError: null,
  syncStatus: {
    loading: false,
    success: false,
    error: null,
    lastSynced: null
  }
};

// Thunks
export const fetchEvents = createAsyncThunk(
  'event/fetchEvents',
  async (filters: IEventFilters = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          if (Array.isArray(value)) {
            value.forEach(v => queryParams.append(key, v));
          } else {
            queryParams.append(key, String(value));
          }
        }
      });
      
      const response = await api.get(`/events?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      const err = error as AxiosError;
      return rejectWithValue(err.response?.data || 'Error al cargar eventos');
    }
  }
);

export const fetchEventById = createAsyncThunk(
  'event/fetchEventById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/events/${id}`);
      return response.data;
    } catch (error) {
      const err = error as AxiosError;
      return rejectWithValue(err.response?.data || 'Error al cargar evento');
    }
  }
);

export const createEvent = createAsyncThunk(
  'event/createEvent',
  async (eventData: Partial<IEvent>, { rejectWithValue }) => {
    try {
      const response = await api.post('/events', eventData);
      return response.data;
    } catch (error) {
      const err = error as AxiosError;
      return rejectWithValue(err.response?.data || 'Error al crear evento');
    }
  }
);

export const updateEvent = createAsyncThunk(
  'event/updateEvent',
  async ({ id, eventData }: { id: string, eventData: Partial<IEvent> }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/events/${id}`, eventData);
      return response.data;
    } catch (error) {
      const err = error as AxiosError;
      return rejectWithValue(err.response?.data || 'Error al actualizar evento');
    }
  }
);

export const deleteEvent = createAsyncThunk(
  'event/deleteEvent',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/events/${id}`);
      return { id, data: response.data };
    } catch (error) {
      const err = error as AxiosError;
      return rejectWithValue(err.response?.data || 'Error al eliminar evento');
    }
  }
);

export const addChecklistItem = createAsyncThunk(
  'event/addChecklistItem',
  async ({ eventId, text }: { eventId: string, text: string }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/events/${eventId}/checklist`, { text });
      return response.data;
    } catch (error) {
      const err = error as AxiosError;
      return rejectWithValue(err.response?.data || 'Error al añadir item a la checklist');
    }
  }
);

export const updateChecklistItem = createAsyncThunk(
  'event/updateChecklistItem',
  async ({ 
    eventId, 
    itemId, 
    data 
  }: { 
    eventId: string, 
    itemId: string, 
    data: Partial<IChecklistItem> 
  }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/events/${eventId}/checklist/${itemId}`, data);
      return response.data;
    } catch (error) {
      const err = error as AxiosError;
      return rejectWithValue(err.response?.data || 'Error al actualizar item de la checklist');
    }
  }
);

export const deleteChecklistItem = createAsyncThunk(
  'event/deleteChecklistItem',
  async ({ eventId, itemId }: { eventId: string, itemId: string }, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/events/${eventId}/checklist/${itemId}`);
      return response.data;
    } catch (error) {
      const err = error as AxiosError;
      return rejectWithValue(err.response?.data || 'Error al eliminar item de la checklist');
    }
  }
);

export const fetchMonthEvents = createAsyncThunk(
  'event/fetchMonthEvents',
  async ({ year, month }: { year: number, month: number }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/events/month/${year}/${month}`);
      return response.data;
    } catch (error) {
      const err = error as AxiosError;
      return rejectWithValue(err.response?.data || 'Error al cargar eventos del mes');
    }
  }
);

export const connectEventToGoogleCalendar = createAsyncThunk(
  'event/connectToGoogleCalendar',
  async (eventId: string, { rejectWithValue }) => {
    try {
      const response = await api.post(`/google-calendar/connect-event/${eventId}`);
      return response.data;
    } catch (error) {
      const err = error as AxiosError;
      return rejectWithValue(err.response?.data || 'Error al conectar evento con Google Calendar');
    }
  }
);

export const disconnectEventFromGoogleCalendar = createAsyncThunk(
  'event/disconnectFromGoogleCalendar',
  async (eventId: string, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/google-calendar/disconnect-event/${eventId}`);
      return response.data;
    } catch (error) {
      const err = error as AxiosError;
      return rejectWithValue(err.response?.data || 'Error al desconectar evento de Google Calendar');
    }
  }
);

export const syncGoogleCalendarEvents = createAsyncThunk(
  'event/syncGoogleCalendar',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.post('/google-calendar/sync');
      return response.data;
    } catch (error) {
      const err = error as AxiosError;
      return rejectWithValue(err.response?.data || 'Error al sincronizar eventos de Google Calendar');
    }
  }
);

export const getGoogleCalendarAuthUrl = createAsyncThunk(
  'event/getGoogleAuthUrl',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/google-calendar/auth-url');
      return response.data;
    } catch (error) {
      const err = error as AxiosError;
      return rejectWithValue(err.response?.data || 'Error al obtener URL de autorización');
    }
  }
);

export const submitGoogleCalendarAuthCode = createAsyncThunk(
  'event/submitGoogleAuthCode',
  async (code: string, { rejectWithValue }) => {
    try {
      const response = await api.post('/google-calendar/auth-callback', { code });
      return response.data;
    } catch (error) {
      const err = error as AxiosError;
      return rejectWithValue(err.response?.data || 'Error al procesar código de autorización');
    }
  }
);

export const disconnectGoogleCalendar = createAsyncThunk(
  'event/disconnectGoogleCalendar',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.delete('/google-calendar/disconnect');
      return response.data;
    } catch (error) {
      const err = error as AxiosError;
      return rejectWithValue(err.response?.data || 'Error al desconectar Google Calendar');
    }
  }
);

// Slice
const eventSlice = createSlice({
  name: 'event',
  initialState,
  reducers: {
    clearEventErrors: (state) => {
      state.error = null;
    },
    clearSelectedEvent: (state) => {
      state.selectedEvent = null;
    },
    resetSyncStatus: (state) => {
      state.syncStatus = {
        loading: false,
        success: false,
        error: null,
        lastSynced: state.syncStatus.lastSynced
      };
    }
  },
  extraReducers: (builder) => {
    builder
      // fetchEvents
      .addCase(fetchEvents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.loading = false;
        state.events = action.payload.events;
        state.totalEvents = action.payload.pagination.total;
        state.currentPage = action.payload.pagination.page;
        state.totalPages = action.payload.pagination.pages;
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // fetchEventById
      .addCase(fetchEventById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEventById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedEvent = action.payload;
      })
      .addCase(fetchEventById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // createEvent
      .addCase(createEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createEvent.fulfilled, (state, action) => {
        state.loading = false;
        state.events = [...state.events, action.payload];
        state.selectedEvent = action.payload;
      })
      .addCase(createEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // updateEvent
      .addCase(updateEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateEvent.fulfilled, (state, action) => {
        state.loading = false;
        state.events = state.events.map(event => 
          event._id === action.payload._id ? action.payload : event
        );
        state.selectedEvent = action.payload;
      })
      .addCase(updateEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // deleteEvent
      .addCase(deleteEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteEvent.fulfilled, (state, action) => {
        state.loading = false;
        state.events = state.events.filter(event => event._id !== action.payload.id);
        if (state.selectedEvent?._id === action.payload.id) {
          state.selectedEvent = null;
        }
      })
      .addCase(deleteEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Operaciones de checklist
      .addCase(addChecklistItem.fulfilled, (state, action) => {
        state.selectedEvent = action.payload;
        if (state.selectedEvent) {
          const index = state.events.findIndex(e => e._id === state.selectedEvent?._id);
          if (index !== -1) {
            state.events[index] = action.payload;
          }
        }
      })
      .addCase(updateChecklistItem.fulfilled, (state, action) => {
        state.selectedEvent = action.payload;
        if (state.selectedEvent) {
          const index = state.events.findIndex(e => e._id === state.selectedEvent?._id);
          if (index !== -1) {
            state.events[index] = action.payload;
          }
        }
      })
      .addCase(deleteChecklistItem.fulfilled, (state, action) => {
        state.selectedEvent = action.payload;
        if (state.selectedEvent) {
          const index = state.events.findIndex(e => e._id === state.selectedEvent?._id);
          if (index !== -1) {
            state.events[index] = action.payload;
          }
        }
      })
      
      // fetchMonthEvents
      .addCase(fetchMonthEvents.pending, (state) => {
        state.monthEventsLoading = true;
        state.monthEventsError = null;
      })
      .addCase(fetchMonthEvents.fulfilled, (state, action) => {
        state.monthEventsLoading = false;
        state.monthEvents = action.payload;
      })
      .addCase(fetchMonthEvents.rejected, (state, action) => {
        state.monthEventsLoading = false;
        state.monthEventsError = action.payload as string;
      })
      
      // Google Calendar integración
      .addCase(connectEventToGoogleCalendar.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(connectEventToGoogleCalendar.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedEvent = action.payload.event;
        if (state.selectedEvent) {
          const index = state.events.findIndex(e => e._id === state.selectedEvent?._id);
          if (index !== -1) {
            state.events[index] = action.payload.event;
          }
        }
      })
      .addCase(connectEventToGoogleCalendar.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      .addCase(disconnectEventFromGoogleCalendar.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(disconnectEventFromGoogleCalendar.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedEvent = action.payload.event;
        if (state.selectedEvent) {
          const index = state.events.findIndex(e => e._id === state.selectedEvent?._id);
          if (index !== -1) {
            state.events[index] = action.payload.event;
          }
        }
      })
      .addCase(disconnectEventFromGoogleCalendar.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      .addCase(syncGoogleCalendarEvents.pending, (state) => {
        state.syncStatus.loading = true;
        state.syncStatus.error = null;
        state.syncStatus.success = false;
      })
      .addCase(syncGoogleCalendarEvents.fulfilled, (state) => {
        state.syncStatus.loading = false;
        state.syncStatus.success = true;
        state.syncStatus.lastSynced = new Date().toISOString();
      })
      .addCase(syncGoogleCalendarEvents.rejected, (state, action) => {
        state.syncStatus.loading = false;
        state.syncStatus.error = action.payload as string;
      })
      
      .addCase(submitGoogleCalendarAuthCode.fulfilled, (state) => {
        state.syncStatus.lastSynced = new Date().toISOString();
      });
  }
});

// Acciones
export const { clearEventErrors, clearSelectedEvent, resetSyncStatus } = eventSlice.actions;

// Selector para seleccionar eventos para un día específico
export const selectEventsByDate = (state: { event: EventState }, date: Date) => {
  const dateStr = date.toISOString().split('T')[0];
  return state.event.events.filter(event => {
    const startDate = new Date(event.startDate).toISOString().split('T')[0];
    const endDate = new Date(event.endDate).toISOString().split('T')[0];
    
    // Evento es en el día seleccionado si:
    // - Empieza en ese día
    // - Termina en ese día
    // - Abarca ese día (comienza antes y termina después)
    return startDate === dateStr || 
           endDate === dateStr || 
           (startDate < dateStr && endDate > dateStr);
  });
};

export default eventSlice.reducer;
