import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import GlobalNotification from '../components/feedback/GlobalNotification';
import type { NotificationType } from '../components/feedback/GlobalNotification';
import WebSocketService from '../services/WebSocketService';
import type { WebSocketMessage } from '../services/WebSocketService';
import { useSelector } from 'react-redux';
import type { RootState } from '../store/store';

interface NotificationContextType {
  showNotification: (message: string, type: NotificationType) => void;
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showInfo: (message: string) => void;
  showWarning: (message: string) => void;
  hideNotification: () => void;
  notifications: Notification[];
  connected: boolean;
}

export interface Notification {
  id: string;
  message: string;
  type: NotificationType;
  title?: string;
  read?: boolean;
  createdAt: Date;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

interface NotificationState {
  open: boolean;
  message: string;
  type: NotificationType;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notification, setNotification] = useState<NotificationState>({
    open: false,
    message: '',
    type: 'info'
  });
  
  // Estado para guardar todas las notificaciones recibidas
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  // Estado para la conexión WebSocket
  const [connected, setConnected] = useState<boolean>(false);
  
  // Obtener el usuario autenticado del store de Redux
  const { user } = useSelector((state: RootState) => state.auth);

  const showNotification = useCallback((message: string, type: NotificationType) => {
    setNotification({
      open: true,
      message,
      type
    });
  }, []);

  const showSuccess = useCallback((message: string) => {
    showNotification(message, 'success');
  }, [showNotification]);

  const showError = useCallback((message: string) => {
    showNotification(message, 'error');
  }, [showNotification]);

  const showInfo = useCallback((message: string) => {
    showNotification(message, 'info');
  }, [showNotification]);

  const showWarning = useCallback((message: string) => {
    showNotification(message, 'warning');
  }, [showNotification]);

  const hideNotification = useCallback(() => {
    setNotification(prev => ({
      ...prev,
      open: false
    }));
  }, []);
  
  // Manejador de mensajes WebSocket
  const handleWebSocketMessage = useCallback((message: WebSocketMessage) => {
    if (message.type === 'notification') {
      const { title, message: content, type = 'info' } = message.data;
      
      // Mostrar notificación UI
      showNotification(content, type as NotificationType);
      
      // Agregar a la lista de notificaciones
      const newNotification: Notification = {
        id: Math.random().toString(36).substring(2, 15),
        message: content,
        type: type as NotificationType,
        title,
        read: false,
        createdAt: new Date()
      };
      
      setNotifications(prev => [newNotification, ...prev]);
    }
  }, [showNotification]);
  
  // Efecto para conectar/desconectar WebSocket
  useEffect(() => {
    // Solo intentar conectar si hay un usuario autenticado
    if (user) {
      const wsService = WebSocketService.getInstance();
      
      // Conectar al WebSocket
      wsService.connect()
        .then(() => {
          console.log('WebSocket conectado exitosamente');
          setConnected(true);
          
          // Registrar manejador de mensajes
          wsService.addMessageHandler(handleWebSocketMessage);
        })
        .catch(error => {
          console.error('Error al conectar WebSocket:', error);
          setConnected(false);
        });
      
      // Limpieza al desmontar
      return () => {
        wsService.removeMessageHandler(handleWebSocketMessage);
        wsService.disconnect();
        setConnected(false);
      };
    }
  }, [user, handleWebSocketMessage]);

  return (
    <NotificationContext.Provider
      value={{
        showNotification,
        showSuccess,
        showError,
        showInfo,
        showWarning,
        hideNotification,
        notifications,
        connected
      }}
    >
      {children}
      <GlobalNotification
        open={notification.open}
        message={notification.message}
        type={notification.type}
        onClose={hideNotification}
      />
    </NotificationContext.Provider>
  );
};

export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  
  if (context === undefined) {
    throw new Error('useNotification debe ser usado dentro de un NotificationProvider');
  }
  
  return context;
};

export default NotificationContext;
