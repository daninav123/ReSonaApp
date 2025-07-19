import React from 'react';
import NotificationsList from '../notifications/NotificationsList';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store/store';
import { FiUser, FiLogOut } from 'react-icons/fi';

const Header: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  const handleLogout = () => {
    // Implementar lógica de logout
    console.log('Logout');
  };

  return (
    <header className="bg-white shadow py-3 px-6 flex items-center justify-between">
      <div className="text-xl font-semibold text-blue-600">ReSona CRM</div>
      
      <div className="flex items-center space-x-4">
        {/* Notificaciones */}
        {user && <NotificationsList maxItems={5} />}
        
        {/* Usuario y Logout */}
        <div className="flex items-center">
          <div className="flex items-center mr-3">
            <span className="bg-blue-100 rounded-full p-2 mr-2">
              <FiUser className="text-blue-600" />
            </span>
            <span className="hidden sm:inline">
              {user ? user.name || user.email : 'Usuario'}
            </span>
          </div>
          
          <button 
            onClick={handleLogout}
            className="text-gray-500 hover:text-red-500 flex items-center transition-colors"
          >
            <FiLogOut className="h-5 w-5" />
            <span className="hidden sm:inline ml-1">Salir</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
