import React from 'react';
import { Outlet } from 'react-router-dom';

import Sidebar from './Sidebar';
import '../../styles/layout.css';
import '../../styles/page.css';
import { Link } from 'react-router-dom';
import { FiUser } from 'react-icons/fi';

const Layout: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <div className="layout">

  
    <div className="layout-content">
      <Sidebar />
      <main className="main-content">
        <div className="page-container">
          {children ?? <Outlet />}
        </div>
      </main>
    </div>
  </div>
);

export default Layout;
