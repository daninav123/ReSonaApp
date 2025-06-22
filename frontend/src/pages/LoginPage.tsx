import React, { useState } from 'react';
import Button from '../components/common/Button';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      navigate('/dashboard');
      localStorage.setItem('token', data.token);
      window.location.href = '/';
    } catch (err) {
      setError((err as Error).message);
    }
    setLoading(false);
  };

  return (
    <div className="login-page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginTop: '4rem' }}>
      <h1>Login</h1>
      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minWidth: 300 }}>
        <label>
          Email
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        </label>
        <label>
          Contraseña
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        </label>
        <Button type="submit" disabled={loading}>{loading ? 'Entrando...' : 'Entrar'}</Button>
        {error && <div className="error" style={{ color: 'red' }}>{error}</div>}
      </form>
      <div style={{ marginTop: 24, color: '#888', fontSize: 14 }}>
        <div>Usuario demo: <b>admin@example.com</b></div>
        <div>Contraseña: <b>admin123</b></div>
      </div>
    </div>
  );
};

export default LoginPage;
