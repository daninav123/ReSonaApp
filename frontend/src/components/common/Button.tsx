import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'warning' | 'success';
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', className = '', ...props }) => {
  const getButtonClasses = () => {
    let baseClasses = 'py-2 px-4 rounded font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 ';
    
    switch (variant) {
      case 'secondary':
        return `${baseClasses} bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-500 ${className}`;
      case 'danger':
        return `${baseClasses} bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 ${className}`;
      case 'warning':
        return `${baseClasses} bg-yellow-500 text-white hover:bg-yellow-600 focus:ring-yellow-500 ${className}`;
      case 'success':
        return `${baseClasses} bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 ${className}`;
      default:
        return `${baseClasses} bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 ${className}`;
    }
  };

  return (
    <button className={getButtonClasses()} {...props}>
      {children}
    </button>
  );
};

export default Button;
