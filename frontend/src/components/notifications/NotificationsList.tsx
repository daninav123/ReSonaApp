import React, { useState, useEffect } from 'react';
import { useNotification } from '../../contexts/NotificationContext';
// La importación del tipo Notification está implícita en useNotification
import { FiBell } from 'react-icons/fi';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface NotificationsListProps {
  maxItems?: number;
}

const NotificationsList: React.FC<NotificationsListProps> = ({ maxItems = 5 }) => {
  const { notifications, connected } = useNotification();
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Calcular notificaciones no leídas
  useEffect(() => {
    const count = notifications.filter(n => !n.read).length;
    setUnreadCount(count);
    
    // Opcional: Actualizar el título de la página para mostrar número de notificaciones
    if (count > 0) {
      document.title = `(${count}) ReSona Events`;
    } else {
      document.title = 'ReSona Events';
    }
  }, [notifications]);
  
  const toggleNotifications = () => {
    setIsOpen(!isOpen);
  };

  const formatDate = (date: Date): string => {
    return format(date, 'HH:mm - d MMM', { locale: es });
  };
  
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      default:
        return 'ℹ️';
    }
  };

  return (
    <div className="relative">
      <button 
        className="flex items-center rounded-full p-1 focus:outline-none"
        onClick={toggleNotifications}
      >
        <FiBell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full text-xs px-1 min-w-[18px] h-[18px] flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white border rounded-md shadow-lg z-50">
          <div className="flex justify-between items-center px-4 py-2 border-b">
            <div className="font-medium">Notificaciones</div>
            <div className="text-xs flex items-center">
              <span className={`w-2 h-2 rounded-full mr-1 ${connected ? 'bg-green-500' : 'bg-red-500'}`}></span>
              {connected ? 'Conectado' : 'Desconectado'}
            </div>
          </div>
          
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-gray-500 text-sm">
              No hay notificaciones
            </div>
          ) : (
            <div className="max-h-[400px] overflow-y-auto">
              {notifications.slice(0, maxItems).map(notification => (
                <div 
                  key={notification.id}
                  className={`p-3 border-b hover:bg-gray-50 ${notification.read ? 'opacity-70' : ''}`}
                >
                  <div className="flex items-start">
                    <div className="mr-2 text-xl">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                      {notification.title && (
                        <div className="font-medium">{notification.title}</div>
                      )}
                      <div className={`${notification.title ? 'text-sm' : ''}`}>
                        {notification.message}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {formatDate(notification.createdAt)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {notifications.length > maxItems && (
                <div className="p-2 text-center border-t">
                  <button className="text-sm text-blue-600 hover:text-blue-800">
                    Ver todas ({notifications.length})
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationsList;
