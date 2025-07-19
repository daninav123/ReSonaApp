import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  Divider,
  Grid,
  IconButton,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  useTheme
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import EventIcon from '@mui/icons-material/Event';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import GroupIcon from '@mui/icons-material/Group';
import PersonIcon from '@mui/icons-material/Person';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import LabelIcon from '@mui/icons-material/Label';
import LinkIcon from '@mui/icons-material/Link';
import EuroIcon from '@mui/icons-material/Euro';
import type { CalendarEvent } from '../../types/calendar';

interface EventDetailsProps {
  event: CalendarEvent;
  open: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const EventDetails: React.FC<EventDetailsProps> = ({
  event,
  open,
  onClose,
  onEdit,
  onDelete
}) => {
  const theme = useTheme();

  // Format dates for display
  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (date: Date | string) => {
    return new Date(date).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  // Get color based on priority
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low':
        return theme.palette.info.main;
      case 'medium':
        return theme.palette.warning.main;
      case 'high':
        return theme.palette.error.light;
      case 'urgent':
        return theme.palette.error.main;
      default:
        return theme.palette.info.main;
    }
  };

  // Get color based on status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return theme.palette.grey[500];
      case 'scheduled':
        return theme.palette.info.main;
      case 'confirmed':
        return theme.palette.success.main;
      case 'cancelled':
        return theme.palette.error.main;
      case 'completed':
        return theme.palette.success.dark;
      default:
        return theme.palette.info.main;
    }
  };

  // Get status label
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'draft':
        return 'Borrador';
      case 'scheduled':
        return 'Programado';
      case 'confirmed':
        return 'Confirmado';
      case 'cancelled':
        return 'Cancelado';
      case 'completed':
        return 'Completado';
      default:
        return status;
    }
  };

  return (
    <Dialog 
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      aria-labelledby="event-details-dialog-title"
    >
      <DialogTitle 
        id="event-details-dialog-title"
        sx={{ 
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderLeft: `6px solid ${event.color || theme.palette.primary.main}`
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h5" component="h2">
            {event.title}
          </Typography>
          <Chip 
            size="small"
            label={getStatusLabel(event.status)}
            sx={{ 
              bgcolor: getStatusColor(event.status),
              color: 'white'
            }}
          />
        </Box>
        <IconButton 
          aria-label="cerrar"
          onClick={onClose}
          size="small"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={3}>
          {/* Left column - Main event details */}
          <Grid item xs={12} md={8}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                Información del Evento
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {/* Date and Time */}
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  <EventIcon color="primary" />
                  <Box>
                    <Typography variant="body1" fontWeight="medium">Fecha</Typography>
                    {event.startDate && event.endDate && (
                      <>
                        {new Date(event.startDate).toDateString() === new Date(event.endDate).toDateString() ? (
                          <Typography variant="body2">
                            {formatDate(event.startDate)}
                          </Typography>
                        ) : (
                          <Typography variant="body2">
                            {formatDate(event.startDate)} - {formatDate(event.endDate)}
                          </Typography>
                        )}
                      </>
                    )}
                  </Box>
                </Box>
                
                {/* Time */}
                {!event.allDay && (
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <AccessTimeIcon color="primary" />
                    <Box>
                      <Typography variant="body1" fontWeight="medium">Hora</Typography>
                      <Typography variant="body2">
                        {formatTime(event.startDate)} - {formatTime(event.endDate)}
                      </Typography>
                    </Box>
                  </Box>
                )}
                
                {/* Location */}
                {event.location && (
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <LocationOnIcon color="primary" />
                    <Box>
                      <Typography variant="body1" fontWeight="medium">Ubicación</Typography>
                      <Typography variant="body2">{event.location}</Typography>
                    </Box>
                  </Box>
                )}
                
                {/* Description */}
                {event.description && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body1" fontWeight="medium">Descripción</Typography>
                    <Paper 
                      variant="outlined" 
                      sx={{ 
                        p: 2, 
                        mt: 1, 
                        bgcolor: theme.palette.background.default,
                        whiteSpace: 'pre-wrap'
                      }}
                    >
                      <Typography variant="body2">
                        {event.description}
                      </Typography>
                    </Paper>
                  </Box>
                )}
                
                {/* Tags */}
                {event.tags && event.tags.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body1" fontWeight="medium" gutterBottom>
                      Etiquetas
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {event.tags.map((tag, index) => (
                        <Chip 
                          key={index} 
                          icon={<LabelIcon />}
                          label={tag} 
                          size="small" 
                          variant="outlined" 
                        />
                      ))}
                    </Box>
                  </Box>
                )}
                
                {/* Attachments */}
                {event.attachments && event.attachments.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body1" fontWeight="medium" gutterBottom>
                      Adjuntos
                    </Typography>
                    <List dense sx={{ bgcolor: theme.palette.background.default }}>
                      {event.attachments.map((attachment, index) => (
                        <ListItem 
                          key={index}
                          component="a"
                          href={attachment.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          button
                        >
                          <ListItemIcon>
                            <AttachFileIcon />
                          </ListItemIcon>
                          <ListItemText 
                            primary={attachment.name}
                            secondary={attachment.fileType}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}
              </Box>
            </Box>
          </Grid>

          {/* Right column - Additional event details */}
          <Grid item xs={12} md={4}>
            <Paper 
              variant="outlined" 
              sx={{ 
                p: 2, 
                bgcolor: theme.palette.background.default 
              }}
            >
              {/* Event Type */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Tipo de Evento
                </Typography>
                <Typography variant="body2">{event.eventType}</Typography>
              </Box>
              
              {/* Priority */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Prioridad
                </Typography>
                <Chip 
                  size="small"
                  icon={<PriorityHighIcon />}
                  label={event.priority.charAt(0).toUpperCase() + event.priority.slice(1)}
                  sx={{ 
                    bgcolor: getPriorityColor(event.priority),
                    color: 'white'
                  }}
                />
              </Box>
              
              {/* Visibility */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Visibilidad
                </Typography>
                <Chip 
                  size="small"
                  icon={<GroupIcon />}
                  label={event.visibility === 'public' ? 'Público' : 
                         event.visibility === 'team' ? 'Equipo' : 'Privado'}
                />
              </Box>
              
              {/* Budget */}
              {event.budget && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Presupuesto
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <EuroIcon fontSize="small" />
                    <Typography variant="body2">
                      {event.budget.allocated.toLocaleString('es-ES')} {event.budget.currency}
                    </Typography>
                  </Box>
                  {event.budget.spent > 0 && (
                    <Typography variant="caption" color="text.secondary">
                      Gastado: {event.budget.spent.toLocaleString('es-ES')} {event.budget.currency}
                    </Typography>
                  )}
                </Box>
              )}
              
              {/* Attendees */}
              {event.attendees && event.attendees.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Asistentes
                  </Typography>
                  <List dense disablePadding>
                    {event.attendees.slice(0, 5).map((attendee, index) => (
                      <ListItem key={index} disableGutters>
                        <ListItemIcon sx={{ minWidth: '30px' }}>
                          <PersonIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText 
                          primary={`User ${attendee.userId.substring(0, 6)}...`}
                          secondary={attendee.role}
                        />
                        <Chip 
                          size="small"
                          label={attendee.responseStatus}
                          sx={{ 
                            height: '20px',
                            fontSize: '0.625rem'
                          }}
                        />
                      </ListItem>
                    ))}
                    {event.attendees.length > 5 && (
                      <Typography variant="caption" sx={{ pl: 4 }}>
                        + {event.attendees.length - 5} más
                      </Typography>
                    )}
                  </List>
                </Box>
              )}
              
              {/* Resources */}
              {event.resources && event.resources.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Recursos
                  </Typography>
                  <List dense disablePadding>
                    {event.resources.map((resource, index) => (
                      <ListItem key={index} disableGutters>
                        <ListItemIcon sx={{ minWidth: '30px' }}>
                          <LinkIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText 
                          primary={`${resource.resourceType} (${resource.quantity})`}
                          secondary={`ID: ${resource.resourceId.substring(0, 6)}...`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}

              {/* Recurring Pattern */}
              {event.recurringPattern && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Patrón de Repetición
                  </Typography>
                  <Typography variant="body2">
                    {event.recurringPattern.frequency} (cada {event.recurringPattern.interval})
                  </Typography>
                  {event.recurringPattern.endDate && (
                    <Typography variant="caption" display="block">
                      Hasta {formatDate(event.recurringPattern.endDate)}
                    </Typography>
                  )}
                  {event.recurringPattern.endAfterOccurrences && (
                    <Typography variant="caption" display="block">
                      {event.recurringPattern.endAfterOccurrences} ocurrencias
                    </Typography>
                  )}
                </Box>
              )}
              
              {/* Creation Info */}
              {event.createdAt && (
                <Box sx={{ mt: 4, pt: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Creado: {new Date(event.createdAt).toLocaleString('es-ES')}
                  </Typography>
                  {event.updatedAt && event.updatedAt !== event.createdAt && (
                    <Typography variant="caption" color="text.secondary" display="block">
                      Actualizado: {new Date(event.updatedAt).toLocaleString('es-ES')}
                    </Typography>
                  )}
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'space-between', p: 2 }}>
        <Button 
          variant="outlined" 
          color="error" 
          startIcon={<DeleteIcon />}
          onClick={onDelete}
          aria-label="eliminar evento"
        >
          Eliminar
        </Button>
        
        <Box>
          <Button 
            onClick={onClose}
            sx={{ mr: 1 }}
            aria-label="cerrar detalles"
          >
            Cerrar
          </Button>
          <Button 
            variant="contained" 
            startIcon={<EditIcon />}
            onClick={onEdit}
            color="primary"
            aria-label="editar evento"
          >
            Editar
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default EventDetails;
