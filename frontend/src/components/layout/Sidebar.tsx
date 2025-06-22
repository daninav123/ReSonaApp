import React from 'react'
import { NavLink } from 'react-router-dom'
import { FiHome, FiUsers, FiFileText, FiCalendar, FiBox, FiCheckSquare, FiBell, FiList } from 'react-icons/fi'     
import '../../styles/layout.css'

 

const Sidebar: React.FC = () => {
  const role = localStorage.getItem('role') || 'CEO';
  return (
    <aside className="sidebar">
    <img src="/logo.png" alt="Resona Events" className="sidebar-logo" />  
        
      <nav>
        <ul>
          <li><NavLink to="/dashboard" className={({ isActive }) => isActive ? 'active' : '' }><FiHome /> Dashboard</NavLink></li>
          <li><NavLink to="/clients" className={({ isActive }) => isActive ? 'active' : '' }><FiUsers /> Clientes</NavLink></li>
          <li><NavLink to="/budgets" className={({ isActive }) => isActive ? 'active' : '' }><FiFileText /> Presupuestos</NavLink></li>
          <li><NavLink to="/events" className={({ isActive }) => isActive ? 'active' : '' }><FiCalendar /> Calendario</NavLink></li>
          <li><NavLink to="/materials" className={({ isActive }) => isActive ? 'active' : '' }><FiBox /> Almacén</NavLink></li>
          <li><NavLink to="/tasks" className={({ isActive }) => isActive ? 'active' : '' }><FiCheckSquare /> Tareas</NavLink></li>
          <li><NavLink to="/notifications" className={({ isActive }) => isActive ? 'active' : '' }><FiBell /> Notificaciones</NavLink></li>
          
          {role === 'CEO' && (
            <>
              <li><NavLink to="/users" className={({ isActive }) => isActive ? 'active' : '' }><FiUsers /> Usuarios</NavLink></li>
              <li><NavLink to="/auditlogs" className={({ isActive }) => isActive ? 'active' : '' }><FiList /> Auditoría</NavLink></li>
            </>
          )}
        </ul>
      </nav>

    </aside>
  );
}

export default Sidebar;
