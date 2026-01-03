/**
 * withDisplaySettings.tsx
 * 
 * HOC для применения настроек отображения к компонентам
 */

import React from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { applyDisplaySettings, getIconSize } from '../utils/displayStyles';
import { generateRandomColor } from '../utils/colorUtils';

interface WithDisplayProps {
  className?: string;
  style?: React.CSSProperties;
}

export function withDisplaySettings<P extends WithDisplayProps>(
  Component: React.ComponentType<P>,
  options?: {
    allowRandomColor?: boolean;
    baseClassName?: string;
  }
) {
  return (props: P) => {
    const { settings, theme } = useSettings();
    const display = settings.display!;
    
    // Генерируем случайный цвет если включено
    const randomColor = React.useMemo(
      () => display.randomColors && options?.allowRandomColor 
        ? generateRandomColor() 
        : null,
      [display.randomColors, options?.allowRandomColor]
    );

    const enhancedStyle: React.CSSProperties = {
      ...applyDisplaySettings(display, theme),
      ...(randomColor ? { 
        '--accent-override': randomColor,
        borderColor: randomColor + '40'
      } as any : {}),
      ...props.style
    };

    const enhancedClassName = [
      options?.baseClassName,
      props.className,
      display.compactMode ? 'compact-mode' : ''
    ].filter(Boolean).join(' ');

    return (
      <Component
        {...props}
        style={enhancedStyle}
        className={enhancedClassName}
      />
    );
  };
}

// Hook для использования настроек иконок
export const useIconSize = () => {
  const { settings } = useSettings();
  return getIconSize(settings.display?.iconSize || 'md');
};

// Hook для генерации случайного цвета элемента
export const useRandomColor = (enabled: boolean = true) => {
  const { settings, theme } = useSettings();
  
  return React.useMemo(() => {
    if (!settings.display?.randomColors || !enabled) {
      return theme.accent;
    }
    return generateRandomColor();
  }, [settings.display?.randomColors, enabled, theme.accent]);
};
