import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import '../../styles/layout.css';

const Layout: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <div className="layout">
    <Header />
    <div className="layout-content">
      <Sidebar />
      <main className="main-content">
        {children ?? <Outlet />}
      </main>
    </div>
  </div>
);

export default Layout;
