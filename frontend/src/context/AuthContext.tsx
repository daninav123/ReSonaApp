import React, { createContext, useEffect, useContext, useCallback } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { login as loginAction, logout as logoutAction, selectCurrentToken } from '../store/slices/authSlice';

interface AuthContextType {
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  token: null,
  login: async () => {},
  logout: () => {}
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const dispatch = useAppDispatch();
  const token = useAppSelector(selectCurrentToken);
  const navigate = useNavigate();

  // Initialize token from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken && !token) {
      // If we have a token in localStorage but not in Redux, update Redux
      dispatch({ type: 'auth/setToken', payload: { token: storedToken } });
    }
  }, [dispatch, token]);

  const login = useCallback(async (email: string, password: string) => {
    console.log('Attempting login with:', { email });
    try {
      const resultAction = await dispatch(loginAction({ email, password }));
      
      if (loginAction.fulfilled.match(resultAction)) {
        console.log('Login successful, token received');
        const token = resultAction.payload.token;
        localStorage.setItem('token', token);
        console.log('Token stored, redirecting...');
        navigate('/dashboard');
      } else {
        throw new Error(resultAction.error.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }, [dispatch, navigate]);

  const logout = useCallback(() => {
    dispatch(logoutAction());
    localStorage.removeItem('token');
    navigate('/login');
  }, [dispatch, navigate]);

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
