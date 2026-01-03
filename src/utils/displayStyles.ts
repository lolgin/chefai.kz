/**
 * displayStyles.ts
 * 
 * Утилиты для применения настроек отображения
 */

import { DisplaySettings } from '../types';

export const getFontSizeClass = (fontSize: string): string => {
  const sizeMap: Record<string, string> = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    xxl: 'text-2xl'
  };
  return sizeMap[fontSize] || 'text-base';
};

export const getIconSize = (iconSize: string): number => {
  const sizeMap: Record<string, number> = {
    sm: 16,
    md: 24,
    lg: 32,
    xl: 48
  };
  return sizeMap[iconSize] || 24;
};

export const getSpacingClass = (spacing: string): string => {
  const spacingMap: Record<string, string> = {
    tight: 'space-y-2',
    normal: 'space-y-4',
    relaxed: 'space-y-8'
  };
  return spacingMap[spacing] || 'space-y-4';
};

export const getAnimationDuration = (speed: string): string => {
  const durationMap: Record<string, string> = {
    slow: '500ms',
    normal: '300ms',
    fast: '150ms'
  };
  return durationMap[speed] || '300ms';
};

export const getGlassStyles = (enabled: boolean, surface: string): React.CSSProperties => {
  if (!enabled) return {};
  
  return {
    backdropFilter: 'blur(32px) saturate(180%)',
    WebkitBackdropFilter: 'blur(32px) saturate(180%)',
    backgroundColor: surface,
    border: '1px solid rgba(255, 255, 255, 0.18)',
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)'
  };
};

export const getBorderStyles = (borderStyle: string, accent: string): React.CSSProperties => {
  switch (borderStyle) {
    case 'none':
      return { border: 'none' };
    case 'solid':
      return { border: `2px solid ${accent}40` };
    case 'gradient':
      return {
        border: '2px solid transparent',
        backgroundImage: `linear-gradient(${accent}20, ${accent}20), linear-gradient(135deg, ${accent}, ${accent}80)`,
        backgroundOrigin: 'border-box',
        backgroundClip: 'padding-box, border-box'
      };
    case 'glow':
      return {
        border: `1px solid ${accent}`,
        boxShadow: `0 0 20px ${accent}50, inset 0 0 10px ${accent}20`
      };
    default:
      return {};
  }
};

export const applyDisplaySettings = (settings: DisplaySettings, theme: any): React.CSSProperties => {
  return {
    fontSize: settings.fontSize === 'xs' ? '0.75rem' :
              settings.fontSize === 'sm' ? '0.875rem' :
              settings.fontSize === 'md' ? '1rem' :
              settings.fontSize === 'lg' ? '1.125rem' :
              settings.fontSize === 'xl' ? '1.25rem' : '1.5rem',
    transition: `all ${getAnimationDuration(settings.animationSpeed)}`,
    ...getGlassStyles(settings.glassEffect, theme.surface)
  };
};
