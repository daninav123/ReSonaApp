import React, { useState, useEffect, useCallback } from 'react';
import { Calendar as BigCalendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/es';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Box, Paper, Typography, Alert, CircularProgress } from '@mui/material';
import calendarApi from '../../api/calendarApi';
import type { CalendarEvent } from '../../types/calendar';
import EventDetails from './EventDetails';
import CreateEditEvent from './CreateEditEvent';
import useApiError from '../../hooks/useApiError';
import { useNotification } from '../../contexts/NotificationContext';
import CalendarToolbar from './CalendarToolbar';
import EventItem from './EventItem';

// Set up the localizer for react-big-calendar using moment
moment.locale('es');
const localizer = momentLocalizer(moment);

// Map between our CalendarEvent and react-big-calendar's Event
interface RBCEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
  resource?: any;
  eventType: string;
  status: string;
  color: string;
  originalEvent: CalendarEvent;
}

const CalendarView: React.FC = () => {
  // const theme = useTheme(); // Uncomment if theming is needed later
  const [events, setEvents] = useState<RBCEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [view, setView] = useState<string>(Views.MONTH);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState<boolean>(false);
  const [isCreateEditOpen, setIsCreateEditOpen] = useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Hooks para manejo de errores y notificaciones
  const { error, handleError, clearError } = useApiError();
  const { showSuccess, showError } = useNotification();
  const [dateRange, setDateRange] = useState<{start: Date, end: Date}>({
    start: moment().startOf('month').toDate(),
    end: moment().endOf('month').toDate()
  });

  // Function to convert CalendarEvent to RBCEvent
  const mapToRBCEvent = useCallback((event: CalendarEvent): RBCEvent => {
    return {
      id: event._id || '',
      title: event.title,
      start: new Date(event.startDate),
      end: new Date(event.endDate),
      allDay: event.allDay,
      eventType: event.eventType,
      status: event.status,
      color: event.color || '#3498db',
      originalEvent: event
    };
  }, []);

  // Fetch events for the current view range
  const fetchEvents = useCallback(async () => {
    try {
      clearError(); // Limpiar cualquier error previo
      
      setIsLoading(true);
      const calendarEvents = await calendarApi.getEventsByDateRange(
        dateRange.start,
        dateRange.end
      );
      
      const mappedEvents = calendarEvents.map(mapToRBCEvent);
      setEvents(mappedEvents);
    } catch (err) {
      handleError(err); // Usar nuestro manejador de errores
      showError('No se pudieron cargar los eventos. Intente nuevamente más tarde.');
    } finally {
      setIsLoading(false);
    }
  }, [dateRange, mapToRBCEvent]);

  // Load events when date range changes
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Handle range change in the calendar
  const handleRangeChange = (range: Date[] | { start: Date; end: Date }) => {
    if (Array.isArray(range)) {
      // Week/day view returns an array of dates
      const start = new Date(Math.min(...range.map(date => date.getTime())));
      const end = new Date(Math.max(...range.map(date => date.getTime())));
      setDateRange({ start, end });
    } else {
      // Month view returns an object with start and end dates
      setDateRange({
        start: range.start,
        end: range.end
      });
    }
  };

  // Handle navigation (prev, next, today)
  const handleNavigate = (newDate: Date) => {
    setSelectedDate(newDate);
  };

  // Handle view change (month, week, day, agenda)
  const handleViewChange = (newView: string) => {
    setView(newView);
  };

  // Handle event selection
  const handleSelectEvent = (event: RBCEvent) => {
    setSelectedEvent(event.originalEvent);
    setIsDetailsOpen(true);
  };

  // Handle slot selection (clicking an empty slot)
  const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
    // Create a new event draft
    const newEvent: CalendarEvent = {
      title: '',
      startDate: start,
      endDate: end,
      allDay: false,
      eventType: 'default',
      visibility: 'team',
      priority: 'medium',
      status: 'draft'
    };
    
    setSelectedEvent(newEvent);
    setIsEditMode(false);
    setIsCreateEditOpen(true);
  };

  // Handle create or update event
  const handleSaveEvent = async (eventData: CalendarEvent) => {
    try {
      clearError(); // Limpiar cualquier error previo
      
      if (eventData._id) {
        // Update existing event
        await calendarApi.updateEvent(eventData._id, eventData);
        showSuccess('Evento actualizado correctamente');
      } else {
        // Create new event
        await calendarApi.createEvent(eventData);
        showSuccess('Evento creado correctamente');
      }
      
      setIsCreateEditOpen(false);
      fetchEvents();
    } catch (err) {
      handleError(err);
      showError('No se pudo guardar el evento. Intente nuevamente.');
    }
  };

  // Handle edit button click from event details
  const handleEditEvent = () => {
    if (selectedEvent) {
      setIsDetailsOpen(false);
      setIsEditMode(true);
      setIsCreateEditOpen(true);
    }
  };

  // Handle delete event
  const handleDeleteEvent = async () => {
    if (!selectedEvent?._id) return;
    
    try {
      clearError(); // Limpiar cualquier error previo
      
      await calendarApi.deleteEvent(selectedEvent._id);
      showSuccess('Evento eliminado correctamente');
      setIsDetailsOpen(false);
      fetchEvents();
    } catch (err) {
      handleError(err);
      showError('No se pudo eliminar el evento. Intente nuevamente.');
    }
  };

  // Close event details modal
  const handleCloseDetails = () => {
    setIsDetailsOpen(false);
    setSelectedEvent(null);
  };

  // Close create/edit event modal
  const handleCloseCreateEdit = () => {
    setIsCreateEditOpen(false);
    // If we were in edit mode, reopen the details view
    if (isEditMode && selectedEvent) {
      setIsDetailsOpen(true);
      setIsEditMode(false);
    } else {
      setSelectedEvent(null);
    }
  };

  // Custom event renderer
  const eventPropGetter = (event: RBCEvent) => {
    return {
      style: {
        backgroundColor: event.color,
        borderRadius: '4px',
        opacity: event.status === 'cancelled' ? 0.5 : 1,
        border: 'none'
      }
    };
  };

  return (
    <Paper elevation={3} sx={{ p: 2, height: 'calc(100vh - 150px)', overflow: 'hidden' }}>
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h6" gutterBottom>
          Calendario de Eventos
        </Typography>
        
        {/* Mostrar alerta de error si existe */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={clearError}>
            {error.message}
          </Alert>
        )}
        
        {/* Mostrar indicador de carga */}
        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
            <CircularProgress />
          </Box>
        )}
        
        <Box sx={{ flexGrow: 1 }}>
          <BigCalendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '100%' }}
            views={['month', 'week', 'day', 'agenda']}
            step={30}
            showMultiDayTimes
            defaultDate={selectedDate}
            defaultView={view}
            onNavigate={handleNavigate}
            onView={handleViewChange}
            onRangeChange={handleRangeChange}
            onSelectEvent={handleSelectEvent}
            onSelectSlot={handleSelectSlot}
            selectable
            eventPropGetter={eventPropGetter}
            components={{
              toolbar: (props: any) => <CalendarToolbar {...props} />,
              event: (props: any) => <EventItem event={props.event} />
            }}
            messages={{
              today: 'Hoy',
              previous: 'Anterior',
              next: 'Siguiente',
              month: 'Mes',
              week: 'Semana',
              day: 'Día',
              agenda: 'Agenda'
            }}
          />
        </Box>
      </Box>

      {/* Event details dialog */}
      {selectedEvent && (
        <EventDetails
          event={selectedEvent}
          open={isDetailsOpen}
          onClose={handleCloseDetails}
          onEdit={handleEditEvent}
          onDelete={handleDeleteEvent}
        />
      )}

      {/* Create/Edit event dialog */}
      {selectedEvent && (
        <CreateEditEvent
          eventToEdit={selectedEvent}
          open={isCreateEditOpen}
          isEditMode={isEditMode}
          onClose={handleCloseCreateEdit}
          onSave={handleSaveEvent}
        />
      )}
    </Paper>
  );
};

export default CalendarView;
