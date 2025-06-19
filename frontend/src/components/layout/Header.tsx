import React from 'react';

const Header: React.FC = () => (
  <header className="header">
    <div className="logo">ReSona CRM</div>
    <div className="user-controls">
      <span>Usuario</span>
      <button>Logout</button>
    </div>
  </header>
);

export default Header;
