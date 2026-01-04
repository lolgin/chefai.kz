/**
 * withTheme.tsx
 * 
 * Higher Order Component для автоматического применения тем к модулям
 * Оборачивает компоненты и передаёт им динамические стили из активной темы
 */

import React from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { ThemeScheme } from '../types';

export interface WithThemeProps {
  theme: ThemeScheme;
  themeStyles: {
    container: React.CSSProperties;
    panel: React.CSSProperties;
    input: React.CSSProperties;
    button: React.CSSProperties;
    card: React.CSSProperties;
  };
}

/**
 * HOC для передачи темы и готовых стилей в компонент
 */
export function withTheme<P extends object>(
  Component: React.ComponentType<P & WithThemeProps>
) {
  return (props: P) => {
    const { theme } = useSettings();

    // Генерируем готовые стили на основе темы
    const themeStyles = {
      container: {
        backgroundColor: theme.surface,
        color: theme.text,
        borderRadius: theme.borderRadius || '24px',
        backdropFilter: theme.glass ? `blur(${theme.blur || '32px'})` : 'none',
        WebkitBackdropFilter: theme.glass ? `blur(${theme.blur || '32px'})` : 'none',
        boxShadow: theme.shadowIntensity 
          ? `0 10px 30px rgba(0, 0, 0, ${theme.shadowIntensity})` 
          : 'none'
      },
      panel: {
        backgroundColor: theme.isLight 
          ? 'rgba(0, 0, 0, 0.03)' 
          : 'rgba(255, 255, 255, 0.03)',
        color: theme.text,
        borderRadius: `calc(${theme.borderRadius || '24px'} * 1.5)`,
        border: `1px solid ${theme.isLight ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.05)'}`,
      },
      input: {
        backgroundColor: theme.isLight 
          ? 'rgba(0, 0, 0, 0.03)' 
          : 'rgba(255, 255, 255, 0.05)',
        color: theme.text,
        borderRadius: `calc(${theme.borderRadius || '24px'} * 1.5)`,
        border: `2px solid transparent`,
      },
      button: {
        backgroundColor: theme.accent,
        color: theme.isLight ? '#ffffff' : '#000000',
        borderRadius: theme.borderRadius || '24px',
      },
      card: {
        backgroundColor: theme.isLight 
          ? 'rgba(0, 0, 0, 0.02)' 
          : 'rgba(255, 255, 255, 0.02)',
        color: theme.text,
        borderRadius: theme.borderRadius || '24px',
        border: `1px solid ${theme.isLight ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.05)'}`,
      }
    };

    return <Component {...props} theme={theme} themeStyles={themeStyles} />;
  };
}
