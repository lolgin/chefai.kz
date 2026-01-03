/**
 * Button.tsx
 * 
 * Переиспользуемый компонент кнопки
 * Варианты: primary, secondary, danger
 * Поддержка иконок и разных размеров
 */

import React, { ReactNode } from 'react';

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
  disabled?: boolean;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  icon,
  disabled = false,
  className = ''
}) => {
  const baseStyles = 'font-black uppercase transition-all flex items-center justify-center gap-2';
  
  const variantStyles = {
    primary: 'bg-indigo-600 text-white hover:scale-105 active:scale-95 shadow-xl',
    secondary: 'bg-black/10 hover:bg-black/20',
    danger: 'bg-rose-600 text-white hover:scale-105 active:scale-95 shadow-xl'
  };
  
  const sizeStyles = {
    sm: 'px-4 py-2 text-xs rounded-lg',
    md: 'px-6 py-3 text-sm rounded-xl',
    lg: 'px-14 py-7 text-2xl rounded-[3rem]'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {icon && <span>{icon}</span>}
      {children}
    </button>
  );
};
