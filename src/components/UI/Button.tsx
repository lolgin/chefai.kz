/**
 * Button.tsx
 * 
 * Переиспользуемый компонент кнопки
 * Варианты: primary, secondary, danger
 * Поддержка иконок и разных размеров
 */

import React, { ReactNode } from 'react';
import { useSettings } from '../../contexts/SettingsContext';

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
  const { theme } = useSettings();
  
  const baseStyles = 'font-black uppercase transition-all flex items-center justify-center gap-2';
  
  const sizeStyles = {
    sm: 'px-4 py-2 text-xs rounded-lg',
    md: 'px-6 py-3 text-sm rounded-xl',
    lg: 'px-14 py-7 text-2xl rounded-[3rem]'
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: theme.accent,
          color: theme.isLight ? '#000' : '#fff'
        };
      case 'secondary':
        return {
          backgroundColor: theme.surface,
          color: theme.text
        };
      case 'danger':
        return {
          backgroundColor: '#f43f5e',
          color: '#fff'
        };
    }
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${sizeStyles[size]} hover:scale-105 active:scale-95 shadow-xl ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      style={getVariantStyles()}
    >
      {icon && <span>{icon}</span>}
      {children}
    </button>
  );
};
