import React, { useState, useEffect, useCallback } from 'react';
import { FiLink, FiRefreshCw, FiX, FiCalendar, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { useAppDispatch, useAppSelector } from '../../store';
import { 
  getGoogleCalendarAuthUrl, 
  submitGoogleCalendarAuthCode, 
  syncGoogleCalendarEvents,
  disconnectGoogleCalendar,
  resetSyncStatus
} from '../../redux/slices/eventSlice';
import Button from '../common/Button';
import styles from './GoogleCalendarIntegration.module.css';

interface GoogleCalendarIntegrationProps {
  isConnected: boolean;
  lastSynced: string | null;
}

const GoogleCalendarIntegration: React.FC<GoogleCalendarIntegrationProps> = ({
  isConnected,
  lastSynced
}) => {
  const dispatch = useAppDispatch();
  const [authCode, setAuthCode] = useState('');
  const [showAuthInput, setShowAuthInput] = useState(false);
  
  const { syncStatus } = useAppSelector(state => state.event);
  
  // Resetear mensajes de estado después de 5 segundos
  useEffect(() => {
    if (syncStatus.success || syncStatus.error) {
      const timer = setTimeout(() => {
        dispatch(resetSyncStatus());
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [syncStatus.success, syncStatus.error, dispatch]);
  
  // Manejar click en "Conectar"
  const handleConnectClick = useCallback(async () => {
    try {
      const resultAction = await dispatch(getGoogleCalendarAuthUrl()).unwrap();
      
      // Abrir la URL de autorización en una nueva pestaña
      if (resultAction?.authUrl) {
        window.open(resultAction.authUrl, '_blank', 'width=600,height=700');
        setShowAuthInput(true);
      }
    } catch (error) {
      console.error('Error al obtener URL de autorización:', error);
    }
  }, [dispatch]);
  
  // Manejar envío de código de autorización
  const handleSubmitAuthCode = useCallback(async () => {
    if (!authCode.trim()) return;
    
    try {
      await dispatch(submitGoogleCalendarAuthCode(authCode)).unwrap();
      setAuthCode('');
      setShowAuthInput(false);
    } catch (error) {
      console.error('Error al procesar código de autorización:', error);
    }
  }, [authCode, dispatch]);
  
  // Manejar sincronización
  const handleSync = useCallback(() => {
    dispatch(syncGoogleCalendarEvents());
  }, [dispatch]);
  
  // Manejar desconexión
  const handleDisconnect = useCallback(() => {
    if (window.confirm('¿Estás seguro de que quieres desconectar Google Calendar?')) {
      dispatch(disconnectGoogleCalendar());
    }
  }, [dispatch]);
  
  // Formatear fecha de última sincronización
  const formattedLastSynced = lastSynced
    ? new Date(lastSynced).toLocaleString('es-ES')
    : 'Nunca';
  
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <FiCalendar className={styles.icon} />
        <h3>Integración con Google Calendar</h3>
      </div>
      
      {/* Mensajes de estado */}
      {syncStatus.success && (
        <div className={styles.successMessage}>
          <FiCheckCircle /> Sincronización completada correctamente
        </div>
      )}
      
      {syncStatus.error && (
        <div className={styles.errorMessage}>
          <FiAlertCircle /> {syncStatus.error}
        </div>
      )}
      
      {/* Estado de conexión */}
      <div className={styles.statusContainer}>
        <div className={styles.statusLabel}>
          Estado:
        </div>
        <div className={`${styles.statusValue} ${isConnected ? styles.connected : styles.disconnected}`}>
          {isConnected ? 'Conectado' : 'Desconectado'}
        </div>
      </div>
      
      {isConnected && (
        <div className={styles.syncInfo}>
          <div className={styles.lastSyncedContainer}>
            <div className={styles.lastSyncedLabel}>Última sincronización:</div>
            <div className={styles.lastSyncedValue}>{formattedLastSynced}</div>
          </div>
        </div>
      )}
      
      {/* Acciones */}
      <div className={styles.actions}>
        {isConnected ? (
          <>
            <Button 
              onClick={handleSync}
              disabled={syncStatus.loading}
              className={styles.syncButton}
            >
              <FiRefreshCw className={`${styles.buttonIcon} ${syncStatus.loading ? styles.rotating : ''}`} />
              {syncStatus.loading ? 'Sincronizando...' : 'Sincronizar eventos'}
            </Button>
            
            <Button 
              onClick={handleDisconnect}
              variant="danger"
              className={styles.disconnectButton}
            >
              <FiX className={styles.buttonIcon} />
              Desconectar
            </Button>
          </>
        ) : (
          <>
            <Button 
              onClick={handleConnectClick}
              className={styles.connectButton}
            >
              <FiLink className={styles.buttonIcon} />
              Conectar con Google Calendar
            </Button>
            
            {showAuthInput && (
              <div className={styles.authInputContainer}>
                <input
                  type="text"
                  value={authCode}
                  onChange={(e) => setAuthCode(e.target.value)}
                  placeholder="Pega el código de autorización aquí"
                  className={styles.authInput}
                />
                <Button 
                  onClick={handleSubmitAuthCode}
                  disabled={!authCode.trim()}
                >
                  Enviar
                </Button>
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Información */}
      <div className={styles.infoContainer}>
        <p className={styles.infoText}>
          {isConnected
            ? 'Tus eventos se sincronizarán automáticamente con Google Calendar.'
            : 'Conecta tu cuenta para sincronizar eventos con Google Calendar.'}
        </p>
      </div>
    </div>
  );
};

export default GoogleCalendarIntegration;
