import React from 'react';
import '../../styles/badge.css';

interface BadgeProps {
  variant: 'pending' | 'active' | 'warning';
  children: React.ReactNode;
}

const Badge: React.FC<BadgeProps> = ({ variant, children }) => (
  <span className={`badge ${variant}`}>{children}</span>
);

export default Badge;
