/**
 * IconButton.tsx
 * 
 * Кнопка только с иконкой (без текста)
 * Используется в панелях управления
 */

import React, { ReactNode } from 'react';
import { useSettings } from '../../contexts/SettingsContext';

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
  const { theme } = useSettings();
  const baseStyles = 'flex items-center justify-center transition-all';
  
  const sizeStyles = {
    sm: 'p-2 rounded-lg',
    md: 'p-3 rounded-xl',
    lg: 'p-4 rounded-2xl'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`${baseStyles} ${sizeStyles[size]} ${disabled ? 'opacity-20 cursor-not-allowed' : ''} ${className}`}
      style={{
        backgroundColor: active ? theme.accent : 'transparent',
        color: active ? (theme.isLight ? '#000' : '#fff') : theme.text,
        opacity: active ? 1 : 0.3,
        transform: active ? 'scale(1)' : 'scale(1)'
      }}
      onMouseEnter={e => !active && (e.currentTarget.style.opacity = '1', e.currentTarget.style.transform = 'scale(1.25)')}
      onMouseLeave={e => !active && (e.currentTarget.style.opacity = '0.3', e.currentTarget.style.transform = 'scale(1)')}
    >
      {icon}
    </button>
  );
};
