import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Typography, Button, Paper, Alert } from '@mui/material';
import { ErrorOutline as ErrorIcon } from '@mui/icons-material';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary captura errores en cualquier componente hijo
 * y muestra un fallback UI en lugar de crashear toda la app
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    // Actualiza el estado para que el siguiente render muestre la UI alternativa
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // También puedes registrar el error en un servicio de reporte de errores
    console.error("Error capturado por ErrorBoundary:", error, errorInfo);
    
    // Llamar al callback onError si fue proporcionado
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // Si se proporciona un fallback personalizado, usarlo
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      // UI alternativa por defecto
      return (
        <Paper 
          elevation={3}
          sx={{ 
            p: 4, 
            m: 2, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            borderRadius: 2 
          }}
        >
          <ErrorIcon color="error" sx={{ fontSize: 60, mb: 2 }} />
          <Typography variant="h5" color="error" gutterBottom>
            Algo salió mal
          </Typography>
          
          <Alert severity="error" sx={{ width: '100%', my: 2 }}>
            {this.state.error?.message || 'Ha ocurrido un error inesperado.'}
          </Alert>
          
          <Box sx={{ mt: 2 }}>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={this.handleReset}
              sx={{ mr: 1 }}
            >
              Intentar de nuevo
            </Button>
            <Button 
              variant="outlined"
              onClick={() => window.location.reload()}
            >
              Recargar página
            </Button>
          </Box>
        </Paper>
      );
    }

    // Si no hay error, renderizar los children normalmente
    return this.props.children;
  }
}

export default ErrorBoundary;
