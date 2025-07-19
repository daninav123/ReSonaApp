import React, { useState, useEffect, useCallback } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import styles from './EventsPage.module.css';
import Button from "../components/common/Button";
import AdvancedSearch from "../components/common/AdvancedSearch";
import type { FilterOption, FilterState } from '../components/common/AdvancedSearch';
import { FiPlus, FiTrash2, FiCalendar, FiSettings, FiCheck } from 'react-icons/fi';
import ExportButton from '../components/common/ExportButton';
import { ExportService } from '../services/export';
import { useAppDispatch, useAppSelector } from '../store';
import { 
  fetchEvents,
  fetchMonthEvents,
  fetchEventById,
  addChecklistItem,
  updateChecklistItem,
  deleteChecklistItem,
  syncGoogleCalendarEvents
} from '../redux/slices/eventSlice';
import type { IEventWithPopulated, IChecklistItem } from '../types/event.types';
import GoogleCalendarIntegration from '../components/calendar/GoogleCalendarIntegration';
import EventCalendarConnect from '../components/calendar/EventCalendarConnect';

// Date-fns imports for date formatting
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const EventsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { events, selectedEvent, loading, error } = useAppSelector(state => state.event);
  const { user } = useAppSelector(state => state.auth);
  
  const [date, setDate] = useState<Date>(new Date());
  const [newTaskText, setNewTaskText] = useState<string>('');
  const [newFile, setNewFile] = useState<File | null>(null);
  const [showCalendarSettings, setShowCalendarSettings] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filters, setFilters] = useState<FilterState>({});
  
  // Definición de opciones de filtro para la búsqueda avanzada
  const filterOptions: FilterOption[] = [
    {
      id: 'status',
      label: 'Estado',
      type: 'select',
      options: [
        { value: 'all', label: 'Todos' },
        { value: 'draft', label: 'Borrador' },
        { value: 'confirmed', label: 'Confirmado' },
        { value: 'in-progress', label: 'En progreso' },
        { value: 'completed', label: 'Completado' },
        { value: 'cancelled', label: 'Cancelado' }
      ],
      defaultValue: 'all'
    },
    {
      id: 'startDateFrom',
      label: 'Desde',
      type: 'date',
      defaultValue: ''
    },
    {
      id: 'startDateTo',
      label: 'Hasta',
      type: 'date',
      defaultValue: ''
    },
    {
      id: 'client',
      label: 'Cliente',
      type: 'text',
      placeholder: 'Nombre del cliente',
      defaultValue: ''
    },
    {
      id: 'location',
      label: 'Ubicación',
      type: 'text',
      placeholder: 'Lugar del evento',
      defaultValue: ''
    },
    {
      id: 'withChecklist',
      label: 'Con lista de tareas',
      type: 'boolean',
      defaultValue: false
    },
    {
      id: 'withFiles',
      label: 'Con archivos adjuntos',
      type: 'boolean',
      defaultValue: false
    },
    {
      id: 'googleSync',
      label: 'Sincronizados con Google Calendar',
      type: 'boolean',
      defaultValue: false
    }
  ];

  // Maneja la búsqueda con filtros avanzados
  const handleAdvancedSearch = useCallback((query: string, filterValues: FilterState) => {
    setSearchTerm(query);
    setFilters(filterValues);
    
    // Preparamos los filtros para enviar al backend
    const eventFilters: any = {};
    
    // Aplicar filtro de texto general (título y descripción)
    if (query) {
      eventFilters.query = query;
    }
    
    // Aplicar filtro de estado
    if (filterValues.status && filterValues.status !== 'all') {
      eventFilters.status = String(filterValues.status);
    }
    
    // Aplicar filtros de fecha
    if (filterValues.startDateFrom) {
      eventFilters.start = String(filterValues.startDateFrom);
    }
    
    if (filterValues.startDateTo) {
      eventFilters.end = String(filterValues.startDateTo);
    }
    
    // Aplicar filtro de cliente
    if (filterValues.client) {
      eventFilters.client = String(filterValues.client);
    }
    
    // Aplicar filtro de ubicación
    if (filterValues.location) {
      eventFilters.location = String(filterValues.location || '');
    }
    
    // Otros filtros que se aplicarán localmente después de la respuesta
    
    // Ejecutar la búsqueda con los filtros
    dispatch(fetchEvents(eventFilters));
  }, [dispatch]);

  // Función para manejar la exportación de eventos
  const handleExport = (format: 'pdf' | 'excel' | 'csv') => {
    // Definir los campos a exportar
    const fields = [
      { key: 'title' as keyof IEventWithPopulated, header: 'Título' },
      { key: 'description' as keyof IEventWithPopulated, header: 'Descripción' },
      { key: 'start' as keyof IEventWithPopulated, header: 'Fecha inicio',
        formatter: (value: string | Date) => new Date(value).toLocaleString() },
      { key: 'end' as keyof IEventWithPopulated, header: 'Fecha fin',
        formatter: (value: string | Date) => new Date(value).toLocaleString() },
      { key: 'status' as keyof IEventWithPopulated, header: 'Estado' },
      { key: 'location' as keyof IEventWithPopulated, header: 'Ubicación' },
      { key: 'client' as keyof IEventWithPopulated, header: 'Cliente',
        formatter: (value: any) => value?.name || 'Sin cliente' }
    ];
    
    // Configurar opciones de exportación
    const exportOptions = {
      format,
      fileName: `eventos_${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : format}`,
      title: 'Listado de Eventos',
      sheetName: 'Eventos'
    };
    
    // Exportar los datos
    ExportService.exportList(events, fields, exportOptions);
  };
  
  // Cargar eventos del mes al montar el componente y cuando cambia el mes
  useEffect(() => {
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    
    dispatch(fetchMonthEvents({ month, year }));
  }, [date.getMonth(), date.getFullYear(), dispatch]);

  // Función para manejar cambios de fecha en el calendario
  const handleDateChange = useCallback((newDate: Date | Date[]) => {
    if (newDate instanceof Date) {
      setDate(newDate);
      // Los eventos se cargan automáticamente por el efecto anterior
    }
  }, []);

  // Seleccionar un evento
  const handleEventSelect = useCallback((eventId: string) => {
    dispatch(fetchEventById(eventId));
  }, [dispatch]);

  // Añadir una tarea a la lista de tareas
  const handleAddTask = useCallback(() => {
    if (newTaskText.trim() && selectedEvent) {
      dispatch(addChecklistItem({
        eventId: selectedEvent._id, 
        text: newTaskText.trim()
      }));
      setNewTaskText('');
    }
  }, [dispatch, newTaskText, selectedEvent]);

  // Cambiar estado de una tarea (completada/pendiente)
  const handleToggleTask = useCallback((task: IChecklistItem) => {
    if (selectedEvent) {
      dispatch(updateChecklistItem({
        eventId: selectedEvent._id,
        itemId: task._id,
        checked: !task.checked
      }));
    }
  }, [dispatch, selectedEvent]);

  // Eliminar una tarea
  const handleDeleteTask = useCallback((taskId: string) => {
    if (selectedEvent) {
      dispatch(deleteChecklistItem({
        eventId: selectedEvent._id,
        itemId: taskId
      }));
    }
  }, [dispatch, selectedEvent]);

  // Manejar cambio de archivo
  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setNewFile(event.target.files[0]);
    }
  }, []);

  // Subir archivo (mock, implementar con API real)
  const handleUploadFile = useCallback(() => {
    if (newFile && selectedEvent) {
      // TODO: Implementar subida real cuando se implemente el backend
      alert(`Archivo ${newFile.name} listo para subir (función no implementada)`); 
      setNewFile(null);
    }
  }, [newFile, selectedEvent]);

  // Eliminar archivo (mock, implementar con API real)
  const handleDeleteFile = useCallback((fileId: string) => {
    if (selectedEvent) {
      // TODO: Implementar eliminación real cuando se implemente el backend
      alert(`Eliminando archivo ${fileId} (función no implementada)`);
    }
  }, [selectedEvent]);

  // Formatear fecha del evento
  const formatEventDate = useCallback((dateString: string) => {
    const eventDate = new Date(dateString);
    return format(eventDate, "d 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es });
  }, []);

  // Determinar si el usuario tiene Google Calendar conectado
  const isGoogleCalendarConnected = useCallback(() => {
    // Acceso seguro, asumiendo una posible estructura de usuario
    return Boolean(user && (user as any).externalServices?.googleCalendar?.connected) || false;
  }, [user]);

  // Obtener fecha de última sincronización
  const getLastSyncDate = useCallback(() => {
    // Acceso seguro, asumiendo una posible estructura de usuario
    return (user && (user as any).externalServices?.googleCalendar?.lastSynced) || null;
  }, [user]);

  // Manejar sincronización manual
  // Esta función se usará en futuros componentes
  const handleSyncCalendar = useCallback(() => {
    dispatch(syncGoogleCalendarEvents());
  }, [dispatch]);
  
  // Para evitar errores de linting por variable no utilizada
  const triggerSync = () => {
    handleSyncCalendar();
  };

  // Filtrar eventos localmente con criterios avanzados
  const filterEvents = useCallback((eventsList: IEventWithPopulated[]) => {
    if (!filters) return eventsList;
    
    return eventsList.filter(event => {
      // Filtro por checklist
      if (filters.withChecklist && (!event.checklist || event.checklist.length === 0)) {
        return false;
      }
      
      // Filtro por archivos adjuntos
      if (filters.withFiles && (!event.files || event.files.length === 0)) {
        return false;
      }
      
      // Filtro por sincronización con Google Calendar
      if (filters.googleSync && (!event.externalCalendars || 
          !event.externalCalendars.some(cal => cal.provider === 'google'))) {
        return false;
      }
      
      // Filtro por ubicación
      if (filters.location && (!event.location || 
          !event.location.toLowerCase().includes(String(filters.location).toLowerCase()))) {
        return false;
      }
      
      // Todos los filtros pasaron
      return true;
    });
  }, [filters]);
  
  // Aplicar filtros locales
  const filteredEvents = filterEvents(events);

  return (
    <div className={styles.eventsPage}>
      <div className={styles.eventsHeader}>
        <h1>Eventos</h1>
        <div className={styles.eventPageActions}>
          <div className={styles.calendarControls}>
            <Button 
              onClick={() => setShowCalendarSettings(prev => !prev)}>
              <FiSettings /> Ajustes calendario
            </Button>
            <ExportButton 
              onExport={handleExport}
              disabled={events.length === 0}
              variant="outline"
              label="Exportar Eventos"
            />
          </div>
          <Button onClick={() => setShowEventModal(true)}>
            <FiPlus /> Nuevo evento
          </Button>
        </div>
      </div>
      
      <div className={styles.searchSection}>
        <AdvancedSearch
          onSearch={handleAdvancedSearch}
          filterOptions={filterOptions}
          initialQuery={searchTerm}
          initialFilters={filters}
        />
      </div>

      {showCalendarSettings && (
        <div className={styles.calendarSettings}>
          <GoogleCalendarIntegration 
            isConnected={isGoogleCalendarConnected()}
            lastSynced={getLastSyncDate()}
          />
        </div>
      )}

      {error && <div className={styles.errorMessage}>{error}</div>}

      <div className={styles.calendarContainer}>
        <div className={styles.calendarWrapper}>
          <Calendar
            onChange={(newDate) => {
              // Manejo seguro del tipo de fecha de react-calendar
              if (newDate instanceof Date) {
                handleDateChange(newDate);
              } else if (Array.isArray(newDate) && newDate.length > 0 && newDate[0] instanceof Date) {
                handleDateChange(newDate[0]);
              }
            }}
            value={date}
            locale="es-ES"
            className={styles.calendar}
          />
          <div className={styles.calendarLegend}>
            <div className={styles.legendItem}>
              <span className={`${styles.dot} ${styles.dotNormal}`}></span>
              <span>Evento</span>
            </div>
            <div className={styles.legendItem}>
              <span className={`${styles.dot} ${styles.dotSync}`}></span>
              <span>Sincronizado</span>
            </div>
          </div>
        </div>
        
        <div className={styles.eventsList}>
          <h2>Eventos {date ? `para ${format(date, "d 'de' MMMM", { locale: es })}` : ''}</h2>
          
          {loading ? (
            <div className={styles.loading}>Cargando eventos...</div>
          ) : filteredEvents.length === 0 ? (
            <div className={styles.noEvents}>No hay eventos para mostrar</div>
          ) : (
            filteredEvents.map(event => (
              <div 
                key={event._id} 
                className={`${styles.eventCard} ${selectedEvent?._id === event._id ? styles.selected : ''}`}
                onClick={() => handleEventSelect(event._id)}
              >
                <h3>{event.title}</h3>
                <p className={styles.eventDate}>{formatEventDate(event.startDate)}</p>
                {event.checklist && (
                  <div className={styles.eventMeta}>
                    <span className={styles.checklistStatus}>
                      {event.checklist.filter(task => task.checked).length}/{event.checklist.length} tareas
                    </span>
                    {event.externalCalendars && event.externalCalendars.some(cal => cal.provider === 'google') && (
                      <span className={styles.syncStatus}>
                        <FiCheck /> Google
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {selectedEvent && (
        <div className={styles.eventDetail}>
          <h2>{selectedEvent.title}</h2>
          <p className={styles.eventDetailDate}>
            <FiCalendar className={styles.icon} />
            {formatEventDate(String(selectedEvent.startDate))}
            {selectedEvent.endDate && ` - ${formatEventDate(String(selectedEvent.endDate))}`}
          </p>
          
          {selectedEvent.description && (
            <div className={styles.eventDescription}>
              <p>{selectedEvent.description}</p>
            </div>
          )}
          
          <EventCalendarConnect 
            eventId={selectedEvent._id}
            externalCalendars={selectedEvent.externalCalendars}
          />
          
          <div className={styles.section}>
            <h3>Lista de tareas</h3>
            <div className={styles.checklist}>
              {selectedEvent.checklist && selectedEvent.checklist.length > 0 ? (
                selectedEvent.checklist.map(task => (
                  <div key={task._id} className={styles.checklistItem}>
                    <label className={styles.checkbox}>
                      <input
                        type="checkbox"
                        checked={task.checked}
                        onChange={() => handleToggleTask(task)}
                      />
                      <span className={`${styles.checkboxText} ${task.checked ? styles.completed : ''}`}>
                        {task.text}
                      </span>
                    </label>
                    <button
                      className={styles.deleteButton}
                      onClick={() => handleDeleteTask(task._id)}
                      aria-label="Eliminar tarea"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                ))
              ) : (
                <p className={styles.emptyList}>No hay tareas para este evento</p>
              )}
              
              <div className={styles.addTask}>
                <input
                  type="text"
                  placeholder="Agregar tarea..."
                  value={newTaskText}
                  onChange={(e) => setNewTaskText(e.target.value)}
                />
                <Button 
                  variant="primary" 
                  onClick={handleAddTask}
                  disabled={!newTaskText.trim() || loading}
                >
                  <FiPlus /> Añadir
                </Button>
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <h3>Archivos adjuntos</h3>
            <div className={styles.fileList}>
              {selectedEvent.files && selectedEvent.files.length > 0 ? (
                selectedEvent.files.map(file => (
                  <div key={file._id} className={styles.fileItem}>
                    <span className={styles.fileName}>{file.name}</span>
                    <button
                      className={styles.deleteButton}
                      onClick={() => handleDeleteFile(file._id)}
                      aria-label="Eliminar archivo"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                ))
              ) : (
                <p className={styles.emptyList}>No hay archivos adjuntos</p>
              )}
              
              <div className={styles.addFile}>
                <input
                  type="file"
                  onChange={handleFileChange}
                  className={styles.fileInput}
                />
                <Button 
                  variant="primary" 
                  onClick={handleUploadFile}
                  disabled={!newFile || loading}
                >
                  <FiPlus /> Subir archivo
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventsPage;
