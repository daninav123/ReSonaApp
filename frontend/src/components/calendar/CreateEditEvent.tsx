import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Box,
  IconButton,
  Stack,
  Chip,
  Typography,
  InputAdornment,
  useTheme,
  Autocomplete
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { es } from 'date-fns/locale';
import type { CalendarEvent } from '../../api/calendarApi';

interface CreateEditEventProps {
  open: boolean;
  onClose: () => void;
  onSave: (event: CalendarEvent) => void;
  eventToEdit?: CalendarEvent | null;
  isEditMode?: boolean;
}

// Priority options
const priorityOptions = [
  { value: 'low', label: 'Baja' },
  { value: 'medium', label: 'Media' },
  { value: 'high', label: 'Alta' },
  { value: 'urgent', label: 'Urgente' }
];

// Status options
const statusOptions = [
  { value: 'draft', label: 'Borrador' },
  { value: 'scheduled', label: 'Programado' },
  { value: 'confirmed', label: 'Confirmado' },
  { value: 'cancelled', label: 'Cancelado' },
  { value: 'completed', label: 'Completado' }
];

// Visibility options
const visibilityOptions = [
  { value: 'private', label: 'Privado' },
  { value: 'team', label: 'Equipo' },
  { value: 'public', label: 'Público' }
];

// Event types (example list)
const eventTypeOptions = [
  'Reunión',
  'Cita',
  'Evento',
  'Conferencia',
  'Montaje',
  'Desmontaje',
  'Entrega',
  'Visita',
  'Inspección',
  'Presentación',
  'Formación',
  'Otros'
];

const initialEvent: CalendarEvent = {
  title: '',
  description: '',
  startDate: new Date(),
  endDate: new Date(new Date().getTime() + 60 * 60 * 1000), // +1 hour from now
  allDay: false,
  location: '',
  eventType: 'Evento',
  priority: 'medium',
  status: 'scheduled',
  visibility: 'team',
  color: '#3498db',
  tags: [],
  attachments: [],
  attendees: [],
  resources: []
};

const CreateEditEvent: React.FC<CreateEditEventProps> = ({
  open,
  onClose,
  onSave,
  eventToEdit,
  isEditMode = false
}) => {
  const theme = useTheme();
  const [event, setEvent] = useState<CalendarEvent>(initialEvent);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [tagInput, setTagInput] = useState<string>('');
  
  // Reset form when dialog opens/closes or when eventToEdit changes
  useEffect(() => {
    if (open) {
      if (eventToEdit) {
        setEvent({
          ...eventToEdit,
          // Ensure dates are Date objects
          startDate: new Date(eventToEdit.startDate),
          endDate: new Date(eventToEdit.endDate),
          createdAt: eventToEdit.createdAt ? new Date(eventToEdit.createdAt) : new Date(),
          updatedAt: new Date(),
        });
      } else {
        setEvent({
          ...initialEvent,
          startDate: new Date(),
          endDate: new Date(new Date().getTime() + 60 * 60 * 1000)
        });
      }
      setErrors({});
    }
  }, [open, eventToEdit]);

  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    
    setEvent(prev => ({
      ...prev,
      [name as string]: value
    }));
    
    // Clear error when field is changed
    if (errors[name as string]) {
      setErrors(prev => ({ ...prev, [name as string]: '' }));
    }
  };

  // Handle Select changes
  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    
    setEvent(prev => ({
      ...prev,
      [name as string]: value
    }));
    
    // Clear error when field is changed
    if (errors[name as string]) {
      setErrors(prev => ({ ...prev, [name as string]: '' }));
    }
  };

  // Handle date changes
  const handleDateChange = (field: 'startDate' | 'endDate', date: Date | null) => {
    if (!date) return;
    
    setEvent(prev => {
      let updatedEvent = { ...prev, [field]: date };
      
      // Adjust end date if it's before the new start date
      if (field === 'startDate' && updatedEvent.endDate < date) {
        updatedEvent.endDate = new Date(date.getTime() + 60 * 60 * 1000); // +1 hour from start
      }
      
      return updatedEvent;
    });
    
    // Clear date-related errors
    setErrors(prev => {
      const updated = { ...prev };
      delete updated[field];
      delete updated['dateRange'];
      return updated;
    });
  };

  // Handle checkbox changes
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    
    if (name === 'allDay') {
      setEvent(prev => {
        const updatedEvent = { ...prev, allDay: checked };
        
        // If switching to all-day, adjust times
        if (checked) {
          const startDate = new Date(updatedEvent.startDate);
          startDate.setHours(0, 0, 0, 0);
          
          const endDate = new Date(updatedEvent.endDate);
          endDate.setHours(23, 59, 59, 999);
          
          updatedEvent.startDate = startDate;
          updatedEvent.endDate = endDate;
        }
        
        return updatedEvent;
      });
    } else {
      setEvent(prev => ({
        ...prev,
        [name]: checked
      }));
    }
  };

  // Handle tag input
  const handleAddTag = () => {
    if (tagInput && (!event.tags || !event.tags.includes(tagInput))) {
      setEvent(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tagInput]
      }));
      setTagInput('');
    }
  };

  const handleDeleteTag = (tagToDelete: string) => {
    setEvent(prev => ({
      ...prev,
      tags: prev.tags ? prev.tags.filter(tag => tag !== tagToDelete) : []
    }));
  };

  // Validate form before submission
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Required fields
    if (!event.title.trim()) newErrors.title = 'El título es obligatorio';
    if (!event.startDate) newErrors.startDate = 'La fecha de inicio es obligatoria';
    if (!event.endDate) newErrors.endDate = 'La fecha de fin es obligatoria';
    
    // Date validation
    if (event.startDate && event.endDate && new Date(event.startDate) > new Date(event.endDate)) {
      newErrors.dateRange = 'La fecha de fin debe ser posterior a la fecha de inicio';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = () => {
    if (validateForm()) {
      // Update timestamps
      const finalEvent = {
        ...event,
        updatedAt: new Date()
      };
      
      onSave(finalEvent);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      scroll="paper"
      aria-labelledby="create-edit-event-dialog"
    >
      <DialogTitle 
        id="create-edit-event-dialog"
        sx={{ 
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderLeft: `6px solid ${event.color || theme.palette.primary.main}`
        }}
      >
        <Typography variant="h5">
          {eventToEdit ? 'Editar evento' : 'Crear nuevo evento'}
        </Typography>
        <IconButton 
          aria-label="cerrar"
          onClick={onClose}
          size="small"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <TextField
                name="title"
                label="Título"
                value={event.title}
                onChange={handleChange}
                fullWidth
                required
                error={!!errors.title}
                helperText={errors.title}
                autoFocus
                margin="normal"
              />
            </Grid>

            {/* Date and Time Row */}
            <Grid item xs={12}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={3}>
                  <DatePicker
                    label="Fecha de inicio"
                    value={event.startDate}
                    onChange={(date: Date | null) => handleDateChange('startDate', date)}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        margin: "normal",
                        error: !!errors.startDate || !!errors.dateRange,
                        helperText: errors.startDate
                      }
                    }}
                  />
                </Grid>
                {!event.allDay && (
                  <Grid item xs={12} md={3}>
                    <TimePicker
                      label="Hora de inicio"
                      value={event.startDate}
                      onChange={(date: Date | null) => handleDateChange('startDate', date)}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          margin: "normal"
                        }
                      }}
                    />
                  </Grid>
                )}
                <Grid item xs={12} md={3}>
                  <DatePicker
                    label="Fecha de fin"
                    value={event.endDate}
                    onChange={(date: Date | null) => handleDateChange('endDate', date)}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        margin: "normal",
                        error: !!errors.endDate || !!errors.dateRange,
                        helperText: errors.endDate || errors.dateRange
                      }
                    }}
                    minDate={event.startDate}
                  />
                </Grid>
                {!event.allDay && (
                  <Grid item xs={12} md={3}>
                    <TimePicker
                      label="Hora de fin"
                      value={event.endDate}
                      onChange={(date: Date | null) => handleDateChange('endDate', date)}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          margin: "normal"
                        }
                      }}
                    />
                  </Grid>
                )}
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox 
                        checked={event.allDay} 
                        onChange={handleCheckboxChange} 
                        name="allDay" 
                      />
                    }
                    label="Todo el día"
                  />
                </Grid>
              </Grid>
            </Grid>

            {/* Location and Event Type Row */}
            <Grid item xs={12}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    name="location"
                    label="Ubicación"
                    value={event.location}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Autocomplete
                    value={event.eventType}
                    onChange={(_, newValue) => {
                      setEvent(prev => ({
                        ...prev,
                        eventType: newValue || 'Evento'
                      }));
                    }}
                    options={eventTypeOptions}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        name="eventType"
                        label="Tipo de evento"
                        fullWidth
                        margin="normal"
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </Grid>

            {/* Description */}
            <Grid item xs={12}>
              <TextField
                name="description"
                label="Descripción"
                value={event.description}
                onChange={handleChange}
                fullWidth
                multiline
                rows={4}
                margin="normal"
              />
            </Grid>

            {/* Priority, Status and Visibility Row */}
            <Grid item xs={12}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel id="priority-label">Prioridad</InputLabel>
                    <Select
                      labelId="priority-label"
                      name="priority"
                      value={event.priority}
                      onChange={handleSelectChange}
                      label="Prioridad"
                    >
                      {priorityOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel id="status-label">Estado</InputLabel>
                    <Select
                      labelId="status-label"
                      name="status"
                      value={event.status}
                      onChange={handleSelectChange}
                      label="Estado"
                    >
                      {statusOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel id="visibility-label">Visibilidad</InputLabel>
                    <Select
                      labelId="visibility-label"
                      name="visibility"
                      value={event.visibility}
                      onChange={handleSelectChange}
                      label="Visibilidad"
                    >
                      {visibilityOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Grid>

            {/* Tags */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Etiquetas
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
                {event.tags?.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    onDelete={() => handleDeleteTag(tag)}
                    size="small"
                  />
                ))}
              </Stack>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                <TextField
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  label="Añadir etiqueta"
                  size="small"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                />
                <Button 
                  variant="outlined" 
                  onClick={handleAddTag}
                  sx={{ minWidth: '80px' }}
                >
                  Añadir
                </Button>
              </Box>
            </Grid>

            {/* Color */}
            <Grid item xs={12} md={6}>
              <TextField
                name="color"
                label="Color (código hexadecimal)"
                value={event.color}
                onChange={handleChange}
                fullWidth
                margin="normal"
                placeholder="#3788d8"
                InputProps={{
                  startAdornment: event.color ? (
                    <InputAdornment position="start">
                      <Box 
                        sx={{ 
                          width: 20, 
                          height: 20, 
                          backgroundColor: event.color,
                          borderRadius: '4px',
                          border: '1px solid #ccc'
                        }} 
                      />
                    </InputAdornment>
                  ) : undefined
                }}
              />
            </Grid>

            {/* File attachments placeholder */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Adjuntos
              </Typography>
              <Button
                variant="outlined"
                startIcon={<AttachFileIcon />}
                sx={{ mb: 2 }}
                // This would need additional implementation for file uploads
              >
                Añadir archivos
              </Button>
              {/* Display existing attachments if any */}
              {event.attachments && event.attachments.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  {event.attachments.map((file, index) => (
                    <Chip
                      key={index}
                      label={file.name}
                      icon={<AttachFileIcon />}
                      onDelete={() => {
                        // Handle deletion of attachments
                        setEvent(prev => ({
                          ...prev,
                          attachments: prev.attachments?.filter((_, i) => i !== index) || []
                        }));
                      }}
                      sx={{ m: 0.5 }}
                    />
                  ))}
                </Box>
              )}
            </Grid>
          </Grid>
        </LocalizationProvider>
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'space-between', px: 3, py: 2 }}>
        {eventToEdit && (
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => {/* TODO: Implement delete functionality */}}
          >
            Eliminar
          </Button>
        )}
        <Box>
          <Button onClick={onClose} sx={{ mr: 1 }}>
            Cancelar
          </Button>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleSubmit}
          >
            {eventToEdit ? 'Actualizar' : 'Crear'}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default CreateEditEvent;
