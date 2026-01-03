/**
 * IconButton.tsx
 * 
 * Кнопка только с иконкой (без текста)
 * Используется в панелях управления
 */

import React, { ReactNode } from 'react';

interface IconButtonProps {
  icon: ReactNode;
  onClick?: () => void;
  active?: boolean;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  title?: string;
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  onClick,
  active = false,
  disabled = false,
  size = 'md',
  className = '',
  title
}) => {
  const baseStyles = 'flex items-center justify-center transition-all';
  
  const sizeStyles = {
    sm: 'p-2 rounded-lg',
    md: 'p-3 rounded-xl',
    lg: 'p-4 rounded-2xl'
  };

  const stateStyles = active
    ? 'bg-indigo-600 text-white shadow-xl'
    : 'opacity-30 hover:opacity-100 hover:scale-125';

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`${baseStyles} ${sizeStyles[size]} ${stateStyles} ${disabled ? 'opacity-20 cursor-not-allowed' : ''} ${className}`}
    >
      {icon}
    </button>
  );
};
