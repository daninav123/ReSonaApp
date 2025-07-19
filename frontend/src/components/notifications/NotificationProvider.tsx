import { NotificationsProvider } from '@mantine/notifications';
import { MantineProvider, createTheme } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { useAppSelector } from '../store';
import { useEffect, useState } from 'react';

const theme = createTheme({
  colorScheme: 'light',
  colors: {
    brand: [
      '#e6f3ff',
      '#b3e0ff',
      '#80ccff',
      '#4db8ff',
      '#00a2ff',
      '#0085e6',
      '#0068cc',
      '#004bb3',
      '#003099',
      '#001980',
    ],
  },
});

interface NotificationProviderProps {
  children: React.ReactNode;
}

interface WebSocketMessage {
  type: string;
  data: {
    title: string;
    message: string;
    type?: string;
  };
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const { user } = useAppSelector((state) => state.auth);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (user) {
      // Establecer conexión WebSocket
      const socket = new WebSocket(`${import.meta.env.VITE_WS_URL}/notifications/${user.id}`);
      
      socket.onopen = () => {
        console.log('✅ Conexión WebSocket establecida');
      };
      
      socket.onmessage = (event) => {
        const message: WebSocketMessage = JSON.parse(event.data);
        if (message.type === 'notification') {
          // Mostrar notificación
          showNotification({
            title: message.data.title,
            message: message.data.message,
            type: message.data.type || 'info'
          });
          
          // Actualizar estado de notificaciones
          setNotifications(prev => [...prev, message.data]);
        }
      };
      
      socket.onerror = (error) => {
        console.error('❌ Error en WebSocket:', error);
      };
      
      socket.onclose = () => {
        console.log('❌ Conexión WebSocket cerrada');
      };
      
      return () => {
        socket.close();
      };
    }
  }, [user]);

  return (
    <MantineProvider theme={theme} withGlobalStyles withNormalizeCSS>
      <ModalsProvider>
        <NotificationsProvider>
          {children}
        </NotificationsProvider>
      </ModalsProvider>
    </MantineProvider>
  );
};
