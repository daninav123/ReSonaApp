import React, { useEffect, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import { FiLogOut, FiTrash2, FiBell, FiSun, FiMoon, FiUpload } from 'react-icons/fi';
import '../styles/settings.css';

interface User {
  _id: string;
  name: string;
  email: string;
  roles: string[];
  avatar?: string;
  preferences: { notifications: { email: boolean; sms: boolean; push: boolean }; theme: 'light'|'dark' };
}

const SettingsPage: React.FC = () => {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [passwords, setPasswords] = useState({ oldPwd: '', newPwd: '' });
  const [prefs, setPrefs] = useState({ notifications: { email:true, sms:true, push:true }, theme:'light' as 'light'|'dark' });
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      setLoading(true); setError('');
      try {
        const res = await fetch('/api/users/me', { headers: { Authorization:`Bearer ${token}` } });
        if (!res.ok) throw new Error('Error cargando perfil');
        const data: User = await res.json();
        setUser(data);
        setEditName(data.name);
        setEditEmail(data.email);
        setPrefs(data.preferences);
        // actividad
        const act = await fetch(`/api/users/${data._id}/activity`, { headers:{ Authorization:`Bearer ${token}` } });
        const actJson = await act.json();
        setLogs(actJson.data);
      } catch(err) { setError((err as Error).message); }
      setLoading(false);
    })();
  }, [token]);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true); setError(''); setSuccess('');
    try {
      const res = await fetch(`/api/users/${user._id}`, { method:'PUT', headers:{'Content-Type':'application/json', Authorization:`Bearer ${token}`}, body:JSON.stringify({ name:editName, email:editEmail }) });
      if (!res.ok) throw new Error('Error actualizando datos');
      setSuccess('Datos actualizados');
      setUser({...user, name:editName, email:editEmail});
    } catch(err){ setError((err as Error).message); }
    setLoading(false);
  };

  const handleAvatar = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!user||!e.target.files?.[0]) return;
    const file = e.target.files[0];
    const form = new FormData(); form.append('avatar', file);
    setLoading(true); setError(''); setSuccess('');
    try {
      const res = await fetch(`/api/users/${user._id}/avatar`, { method:'PUT', headers:{ Authorization:`Bearer ${token}` }, body: form });
      if (!res.ok) throw new Error('Error subiendo avatar');
      const js = await res.json();
      setUser({...user, avatar:js.avatar});
      setSuccess('Avatar actualizado');
    } catch(err){ setError((err as Error).message); }
    setLoading(false);
  };

  const handleChangePwd = async (e: FormEvent) => {
    e.preventDefault(); if (!user) return;
    setLoading(true); setError(''); setSuccess('');
    try {
      const res = await fetch(`/api/users/${user._id}/password`, { method:'PUT', headers:{'Content-Type':'application/json', Authorization:`Bearer ${token}`}, body:JSON.stringify({ oldPassword:passwords.oldPwd, newPassword:passwords.newPwd }) });
      if (!res.ok) throw new Error('Error cambiando contraseña');
      setSuccess('Contraseña cambiada'); setPasswords({oldPwd:'',newPwd:''});
    } catch(err){ setError((err as Error).message); }
    setLoading(false);
  };

  const handlePrefs = async () => {
    if (!user) return;
    setLoading(true); setError(''); setSuccess('');
    try {
      const res = await fetch(`/api/users/${user._id}/preferences`, { method:'PUT', headers:{'Content-Type':'application/json', Authorization:`Bearer ${token}`}, body:JSON.stringify({ preferences:prefs }) });
      if (!res.ok) throw new Error('Error actualizando preferencias');
      setSuccess('Preferencias guardadas');
    } catch(err){ setError((err as Error).message); }
    setLoading(false);
  };

  const handleLogoutAll = async () => {
    if (!user) return;
    await fetch(`/api/users/${user._id}/logoutAll`, { method:'POST', headers:{ Authorization:`Bearer ${token}` } });
    logout(); navigate('/login');
  };

  const handleDelete = async () => {
    if (!user) return;
    if(!window.confirm('Confirmar eliminación de cuenta')) return;
    setLoading(true);
    try {
      await fetch(`/api/users/${user._id}`, { method:'DELETE', headers:{ Authorization:`Bearer ${token}` } });
      logout(); navigate('/login');
    } catch { setError('Error eliminando cuenta'); }
    setLoading(false);
  };

  const toggleNotif = (k:'email'|'sms'|'push') => setPrefs({...prefs, notifications:{...prefs.notifications, [k]:!prefs.notifications[k]}});
  const handleThemeChange = async (t:'light'|'dark') => {
    if (!user) return;
    setLoading(true); setError(''); setSuccess('');
    try {
      const res = await fetch(`/api/users/${user._id}/theme`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ theme: t })
      });
      if (!res.ok) throw new Error('Error actualizando tema');
      setPrefs(prev => ({ ...prev, theme: t }));
      document.body.className = t;
      setSuccess('Tema actualizado');
    } catch (err) {
      setError((err as Error).message);
    }
    setLoading(false);
  };

  return (
    <div className="settings-page">
      <h1>Perfil</h1>
      {loading&&<p>Cargando...</p>}
      {error&&<div className="error">{error}</div>}
      {success&&<div className="success">{success}</div>}
      {user&&(
        <>
          <div className="profile-header">
            <img src={user.avatar||'/default-avatar.png'} alt="Avatar" className="avatar" />
            <label className="avatar-upload"><FiUpload/> Subir
              <input type="file" accept="image/*" onChange={handleAvatar} hidden />
            </label>
            <div className="roles">{user.roles.map(r=><Badge key={r} variant="active">{r}</Badge>)}</div>
          </div>
          <form onSubmit={handleSave} className="profile-form">
            <input value={editName} onChange={e=>setEditName(e.target.value)} placeholder="Nombre" required />
            <input type="email" value={editEmail} onChange={e=>setEditEmail(e.target.value)} placeholder="Email" required />
            <Button type="submit">Actualizar perfil</Button>
          </form>
          <section>
            <h2>Contraseña</h2>
            <form onSubmit={handleChangePwd} className="profile-form">
              <input type="password" value={passwords.oldPwd} onChange={e=>setPasswords({...passwords,oldPwd:e.target.value})} placeholder="Actual" required />
              <input type="password" value={passwords.newPwd} onChange={e=>setPasswords({...passwords,newPwd:e.target.value})} placeholder="Nueva" required />
              <Button type="submit">Cambiar contraseña</Button>
            </form>
          </section>
          <section>
            <h2>Notificaciones</h2>
            <label><FiBell/> <input type="checkbox" checked={prefs.notifications.email} onChange={()=>toggleNotif('email')} /> Email</label>
            <label><FiBell/> <input type="checkbox" checked={prefs.notifications.sms} onChange={()=>toggleNotif('sms')} /> SMS</label>
            <label><FiBell/> <input type="checkbox" checked={prefs.notifications.push} onChange={()=>toggleNotif('push')} /> Push</label>
            <Button onClick={handlePrefs}>Guardar preferencias</Button>
          </section>
          <section>
            <h2>Tema</h2>
            <Button onClick={()=>handleThemeChange('light')}><FiSun/> Claro</Button>
            <Button onClick={()=>handleThemeChange('dark')}><FiMoon/> Oscuro</Button>
          </section>
          <section>
            <h2>Actividad reciente</h2>
            <ul className="activity-list">{logs.map((l,i)=><li key={i}>{new Date(l.createdAt).toLocaleString()} - {l.action} {l.entity}</li>)}</ul>
          </section>
          <section>
            <h2>Sesiones</h2>
            <Button onClick={handleLogoutAll}><FiLogOut/> Cerrar todas</Button>
          </section>
          <section>
            <h2>Eliminar cuenta</h2>
            <Button onClick={handleDelete} className="btn-danger"><FiTrash2/> Eliminar cuenta</Button>
          </section>
        </>
      )}
    </div>
  );
};

export default SettingsPage;

