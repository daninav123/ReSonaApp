import React, { useState, useEffect, forwardRef } from 'react';
import { 
  Snackbar, 
  Alert as MuiAlert, 
  Slide
} from '@mui/material';
import type { AlertProps, SlideProps } from '@mui/material';

// Componente Alert personalizado con ref forwarding
const Alert = forwardRef<HTMLDivElement, AlertProps>((props, ref) => {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

// Transición para la Snackbar
function SlideTransition(props: SlideProps) {
  return <Slide {...props} direction="up" />;
}

export type NotificationType = 'success' | 'info' | 'warning' | 'error';

export interface NotificationProps {
  open: boolean;
  message: string;
  type: NotificationType;
  duration?: number;
  onClose: () => void;
}

/**
 * Componente de notificación global para mostrar mensajes de estado
 */
const GlobalNotification: React.FC<NotificationProps> = ({
  open,
  message,
  type,
  duration = 5000,
  onClose
}) => {
  // Estado local para manejar la animación de cierre
  const [isOpen, setIsOpen] = useState<boolean>(false);
  
  // Actualizar el estado local cuando cambia el prop open
  useEffect(() => {
    setIsOpen(open);
  }, [open]);

  const handleClose = (_event?: React.SyntheticEvent | Event, reason?: string) => {
    // Evitar cerrar al hacer clic fuera
    if (reason === 'clickaway') {
      return;
    }
    
    setIsOpen(false);
    onClose();
  };

  return (
    <Snackbar
      open={isOpen}
      autoHideDuration={duration}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      TransitionComponent={SlideTransition}
    >
      <Alert 
        onClose={handleClose} 
        severity={type}
        sx={{ width: '100%' }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

export default GlobalNotification;
