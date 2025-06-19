import React from 'react'
import { NavLink } from 'react-router-dom'
import { FiHome, FiUsers, FiFileText, FiCalendar, FiBox, FiCheckSquare, FiBell, FiSettings } from 'react-icons/fi'
import '../../styles/layout.css' 

const Sidebar: React.FC = () => (
  <aside className="sidebar">
    <nav>
      <ul>
        <li><NavLink to="/dashboard" className={({ isActive }) => isActive ? 'active' : '' }><FiHome /> Dashboard</NavLink></li>
        <li><NavLink to="/clients" className={({ isActive }) => isActive ? 'active' : '' }><FiUsers /> Clientes</NavLink></li>
        <li><NavLink to="/budgets" className={({ isActive }) => isActive ? 'active' : '' }><FiFileText /> Presupuestos</NavLink></li>
        <li><NavLink to="/events" className={({ isActive }) => isActive ? 'active' : '' }><FiCalendar /> Eventos</NavLink></li>
        <li><NavLink to="/materials" className={({ isActive }) => isActive ? 'active' : '' }><FiBox /> Almacén</NavLink></li>
        <li><NavLink to="/tasks" className={({ isActive }) => isActive ? 'active' : '' }><FiCheckSquare /> Tareas</NavLink></li>
        <li><NavLink to="/notifications" className={({ isActive }) => isActive ? 'active' : '' }><FiBell /> Notificaciones</NavLink></li>
        <li><NavLink to="/settings" className={({ isActive }) => isActive ? 'active' : '' }><FiSettings /> Configuración</NavLink></li>
      </ul>
    </nav>
  </aside>
)

export default Sidebar;
