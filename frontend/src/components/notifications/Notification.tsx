import React from 'react';
import { useAppSelector } from '../store';
import {
  Snackbar,
  Alert,
  AlertTitle,
  IconButton,
  Collapse,
} from '@mui/material';
import {
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';

interface NotificationProps {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'info' | 'warning';
  onClose: () => void;
}

const iconMap = {
  success: <CheckCircleIcon sx={{ fontSize: 20 }} />,
  error: <ErrorIcon sx={{ fontSize: 20 }} />,
  info: <InfoIcon sx={{ fontSize: 20 }} />,
  warning: <WarningIcon sx={{ fontSize: 20 }} />,
};

export const Notification: React.FC<NotificationProps> = ({
  open,
  message,
  severity,
  onClose,
}) => {
  return (
    <Snackbar
      open={open}
      autoHideDuration={6000}
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <Alert
        severity={severity}
        action={
          <IconButton
            size="small"
            color="inherit"
            onClick={onClose}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        }
        sx={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        {iconMap[severity]}
        <AlertTitle>{severity.charAt(0).toUpperCase() + severity.slice(1)}</AlertTitle>
        {message}
      </Alert>
    </Snackbar>
  );
};
