/**
 * Obtiene el token de autenticación del localStorage
 */
export const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken');
};

/**
 * Guarda el token de autenticación en localStorage
 */
export const setAuthToken = (token: string): void => {
  localStorage.setItem('authToken', token);
};

/**
 * Elimina el token de autenticación de localStorage
 */
export const removeAuthToken = (): void => {
  localStorage.removeItem('authToken');
};

/**
 * Verifica si hay un token de autenticación
 */
export const isAuthenticated = (): boolean => {
  return !!getAuthToken();
};
