import React, { useMemo } from 'react';
import { FiLink, FiX, FiExternalLink, FiCheck, FiLoader } from 'react-icons/fi';
import Button from '../common/Button';
import styles from './EventCalendarConnect.module.css';
import { useAppDispatch, useAppSelector } from '../../store';
import { 
  connectEventToGoogleCalendar, 
  disconnectEventFromGoogleCalendar 
} from '../../redux/slices/eventSlice';
import type { IExternalCalendar } from '../../types/event.types';

interface EventCalendarConnectProps {
  eventId: string;
  externalCalendars?: IExternalCalendar[];
}

const EventCalendarConnect: React.FC<EventCalendarConnectProps> = ({
  eventId,
  externalCalendars = []
}) => {
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector(state => state.event);
  
  // Buscar conexión con Google Calendar
  const googleCalendar = useMemo(() => {
    return externalCalendars.find(cal => cal.provider === 'google');
  }, [externalCalendars]);
  
  // Manejar conexión con Google Calendar
  const handleConnect = async () => {
    try {
      await dispatch(connectEventToGoogleCalendar(eventId)).unwrap();
    } catch (error) {
      console.error('Error al conectar con Google Calendar:', error);
    }
  };
  
  // Manejar desconexión de Google Calendar
  const handleDisconnect = async () => {
    if (window.confirm('¿Estás seguro de que quieres desconectar este evento de Google Calendar?')) {
      try {
        await dispatch(disconnectEventFromGoogleCalendar(eventId)).unwrap();
      } catch (error) {
        console.error('Error al desconectar de Google Calendar:', error);
      }
    }
  };
  
  // Si no hay conexión con Google Calendar, mostrar botón para conectar
  if (!googleCalendar) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h4>Calendario externo</h4>
        </div>
        <div className={styles.content}>
          <p className={styles.info}>Este evento no está sincronizado con ningún calendario externo.</p>
          <Button
            onClick={handleConnect}
            disabled={loading}
            className={styles.connectButton}
          >
            {loading ? <FiLoader className={styles.spinner} /> : <FiLink className={styles.icon} />}
            {loading ? 'Conectando...' : 'Conectar con Google Calendar'}
          </Button>
        </div>
      </div>
    );
  }
  
  // Si hay conexión, mostrar información y botón para desconectar
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h4>Calendario externo</h4>
      </div>
      <div className={styles.content}>
        <div className={styles.connectedInfo}>
          <div className={styles.statusBadge}>
            <FiCheck className={styles.checkIcon} /> Conectado con Google Calendar
          </div>
          
          {googleCalendar.lastSynced && (
            <div className={styles.lastSynced}>
              Última sincronización: {new Date(googleCalendar.lastSynced).toLocaleString('es-ES')}
            </div>
          )}
          
          {googleCalendar.externalUrl && (
            <a 
              href={googleCalendar.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.externalLink}
            >
              <FiExternalLink className={styles.icon} />
              Ver en Google Calendar
            </a>
          )}
        </div>
        
        <Button
          onClick={handleDisconnect}
          disabled={loading}
          variant="danger"
          className={styles.disconnectButton}
        >
          {loading ? <FiLoader className={styles.spinner} /> : <FiX className={styles.icon} />}
          {loading ? 'Desconectando...' : 'Desconectar de Google Calendar'}
        </Button>
      </div>
    </div>
  );
};

export default EventCalendarConnect;
