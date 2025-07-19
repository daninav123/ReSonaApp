import { useState, useCallback } from 'react';
import axios, { AxiosError } from 'axios';

interface ApiError {
  message: string;
  status?: number;
  details?: string | Record<string, any>;
  isApiError: boolean;
}

interface UseApiErrorReturn {
  error: ApiError | null;
  handleError: (error: unknown) => void;
  clearError: () => void;
}

/**
 * Hook para manejar errores de API de forma consistente
 * @returns Objeto con el error, función para manejar errores y función para limpiar errores
 */
const useApiError = (): UseApiErrorReturn => {
  const [error, setError] = useState<ApiError | null>(null);

  const handleError = useCallback((error: unknown) => {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<any>;
      
      const apiError: ApiError = {
        message: 'Error en la solicitud',
        isApiError: true,
      };
      
      // Establecer estado de error
      if (axiosError.response) {
        // El servidor respondió con un código de estado que no está en el rango 2xx
        apiError.status = axiosError.response.status;
        apiError.message = getErrorMessage(axiosError.response.status);
        
        // Si hay datos en la respuesta de error, añadirlos a los detalles
        if (axiosError.response.data) {
          if (typeof axiosError.response.data === 'string') {
            apiError.details = axiosError.response.data;
          } else if (axiosError.response.data.message) {
            apiError.message = axiosError.response.data.message;
            apiError.details = axiosError.response.data.error || axiosError.response.data;
          } else {
            apiError.details = axiosError.response.data;
          }
        }
      } else if (axiosError.request) {
        // La solicitud se realizó pero no se recibió respuesta
        apiError.message = 'No se recibió respuesta del servidor';
        apiError.details = 'El servidor no responde o hay problemas de conexión';
      } else {
        // Error al configurar la solicitud
        apiError.message = 'Error al configurar la solicitud';
        apiError.details = axiosError.message;
      }
      
      setError(apiError);
    } else if (error instanceof Error) {
      // Error de JavaScript estándar
      setError({
        message: 'Error en la aplicación',
        details: error.message,
        isApiError: false
      });
    } else {
      // Error desconocido
      setError({
        message: 'Error desconocido',
        details: String(error),
        isApiError: false
      });
    }
    
    // Registrar error en la consola
    console.error('API Error:', error);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return { error, handleError, clearError };
};

/**
 * Obtiene un mensaje de error descriptivo basado en el código de estado HTTP
 */
function getErrorMessage(status: number): string {
  switch (status) {
    case 400:
      return 'Solicitud incorrecta';
    case 401:
      return 'No autorizado';
    case 403:
      return 'Acceso prohibido';
    case 404:
      return 'Recurso no encontrado';
    case 409:
      return 'Conflicto en la solicitud';
    case 422:
      return 'Datos de solicitud inválidos';
    case 429:
      return 'Demasiadas solicitudes';
    case 500:
      return 'Error interno del servidor';
    case 502:
      return 'Error de puerta de enlace';
    case 503:
      return 'Servicio no disponible';
    default:
      return status >= 500
        ? 'Error en el servidor'
        : 'Error en la solicitud';
  }
}

export default useApiError;
