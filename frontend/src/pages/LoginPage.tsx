import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { login, selectAuthStatus, selectAuthError, clearError } from '../store/slices/authSlice';
import Button from '../components/common/Button';

const LoginPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const status = useAppSelector(selectAuthStatus);
  const error = useAppSelector(selectAuthError);
  const loading = status === 'loading';

  // Clear any previous errors when component mounts
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      return;
    }
    
    const resultAction = await dispatch(login({ email, password }));
    
    if (login.fulfilled.match(resultAction)) {
      // Login successful, redirect is handled by the auth slice
      navigate('/dashboard');
    }
  };

  return (
    <div className="login-page" style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '1rem',
      backgroundColor: '#f5f5f5'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
        width: '100%',
        maxWidth: '400px'
      }}>
        <h1 style={{ 
          marginBottom: '1.5rem',
          textAlign: 'center',
          color: '#333'
        }}>
          Iniciar sesión
        </h1>
        
        <form 
          onSubmit={handleLogin} 
          style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '1.25rem',
            width: '100%'
          }}
        >
          <div>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '500',
              color: '#444'
            }}>
              Email
            </label>
            <input 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem',
                '&:focus': {
                  outline: 'none',
                  borderColor: '#4a90e2',
                  boxShadow: '0 0 0 2px rgba(74, 144, 226, 0.2)'
                },
                '&:disabled': {
                  backgroundColor: '#f5f5f5',
                  cursor: 'not-allowed'
                }
              }}
            />
          </div>
          
          <div>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '500',
              color: '#444'
            }}>
              Contraseña
            </label>
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem',
                '&:focus': {
                  outline: 'none',
                  borderColor: '#4a90e2',
                  boxShadow: '0 0 0 2px rgba(74, 144, 226, 0.2)'
                },
                '&:disabled': {
                  backgroundColor: '#f5f5f5',
                  cursor: 'not-allowed'
                }
              }}
            />
          </div>
          
          <Button 
            type="submit" 
            disabled={loading}
            style={{
              marginTop: '0.5rem',
              width: '100%',
              padding: '0.75rem',
              fontSize: '1rem',
              fontWeight: '600',
              backgroundColor: loading ? '#ccc' : '#4a90e2',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s',
              '&:hover:not(:disabled)': {
                backgroundColor: '#357abd'
              }
            }}
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </Button>
          
          {error && (
            <div style={{
              marginTop: '1rem',
              padding: '0.75rem',
              backgroundColor: '#fee2e2',
              color: '#b91c1c',
              borderRadius: '4px',
              fontSize: '0.875rem',
              borderLeft: '4px solid #ef4444'
            }}>
              {error}
            </div>
          )}
        </form>
        
        <div style={{ 
          marginTop: '1.5rem', 
          paddingTop: '1.5rem',
          borderTop: '1px solid #eee',
          fontSize: '0.875rem',
          color: '#666',
          textAlign: 'center'
        }}>
          <div style={{ marginBottom: '0.5rem' }}>
            <strong>Usuario demo:</strong> admin@example.com
          </div>
          <div>
            <strong>Contraseña:</strong> admin123
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
