/**
 * visualStyleEngine.ts
 * 
 * Движок для динамической генерации визуальных стилей
 * Позволяет применять кастомизацию к любому элементу интерфейса
 */

import React from 'react';
import { VisualStyleConfig, ThemeScheme } from '../types';

/**
 * Генерирует CSS стили из конфигурации
 */
export function generateStyleFromConfig(
  config: VisualStyleConfig | undefined,
  theme: ThemeScheme,
  baseClass?: string
): React.CSSProperties {
  if (!config) {
    return {};
  }

  const animationDuration = 
    config.animationSpeed === 'instant' ? '0ms' :
    config.animationSpeed === 'fast' ? '100ms' :
    config.animationSpeed === 'slow' ? '500ms' : '200ms';

  const style: React.CSSProperties = {
    backgroundColor: config.backgroundColor || theme.surface,
    color: config.textColor || theme.text,
    borderRadius: `${config.borderRadius || 24}px`,
    padding: `${config.padding || 0}px`,
    opacity: config.opacity !== undefined ? config.opacity : 1,
    transform: `scale(${config.scale || 1})`,
    transition: `all ${animationDuration} ease`,
    borderWidth: `${config.borderWidth || 0}px`,
    borderStyle: config.borderStyle === 'solid' ? 'solid' : 'none',
  };

  // Стеклянный эффект
  if (config.glassEffect) {
    style.backdropFilter = `blur(${config.blurAmount || 32}px)`;
    style.WebkitBackdropFilter = `blur(${config.blurAmount || 32}px)`;
  }

  // Тени
  if (config.shadowIntensity) {
    const shadowAlpha = Math.floor(config.shadowIntensity * 255).toString(16).padStart(2, '0');
    style.boxShadow = `0 10px 30px ${theme.text}${shadowAlpha}`;
  }

  // Градиентная граница
  if (config.borderStyle === 'gradient' && config.borderWidth) {
    style.borderImage = `linear-gradient(135deg, ${theme.accent}, ${theme.secondary}) 1`;
  }

  // Светящаяся граница
  if (config.borderStyle === 'glow' && config.borderWidth) {
    style.borderColor = theme.accent;
    style.boxShadow = `0 0 20px ${theme.accent}88, ${style.boxShadow || ''}`;
  }

  return style;
}

/**
 * Генерирует CSS классы для hover эффектов
 */
export function getHoverClass(hoverEffect?: 'none' | 'scale' | 'glow' | 'lift'): string {
  switch (hoverEffect) {
    case 'scale': return 'hover:scale-110';
    case 'glow': return 'hover:shadow-2xl hover:shadow-current';
    case 'lift': return 'hover:-translate-y-2 hover:shadow-xl';
    default: return '';
  }
}

/**
 * Объединяет глобальный стиль и стиль модуля
 */
export function mergeVisualStyles(
  globalStyle: VisualStyleConfig | undefined,
  moduleStyle: VisualStyleConfig | undefined
): VisualStyleConfig {
  return {
    ...globalStyle,
    ...moduleStyle
  };
}

/**
 * Получает стиль для конкретного модуля с учётом приоритета
 */
export function getModuleVisualStyle(
  moduleType: string,
  globalStyle: VisualStyleConfig | undefined,
  overrides: Array<{ moduleType: string; style: VisualStyleConfig; enabled: boolean }> | undefined
): VisualStyleConfig | undefined {
  if (!overrides) {
    return globalStyle;
  }

  const override = overrides.find(o => o.moduleType === moduleType && o.enabled);
  if (override) {
    return mergeVisualStyles(globalStyle, override.style);
  }

  return globalStyle;
}

/**
 * Конвертирует hex в rgba
 */
export function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Генерирует стиль для поверхности (панели, карточки)
 */
export function generateSurfaceStyle(
  visualStyle: VisualStyleConfig | undefined,
  theme: ThemeScheme
): React.CSSProperties {
  const baseStyle = generateStyleFromConfig(visualStyle, theme);
  
  return {
    ...baseStyle,
    backgroundColor: visualStyle?.surfaceColor || theme.surface,
  };
}

/**
 * Генерирует стиль для акцентных элементов (кнопки, активные элементы)
 */
export function generateAccentStyle(
  visualStyle: VisualStyleConfig | undefined,
  theme: ThemeScheme,
  isActive: boolean = false
): React.CSSProperties {
  const baseStyle = generateStyleFromConfig(visualStyle, theme);
  
  return {
    ...baseStyle,
    backgroundColor: visualStyle?.accentColor || theme.accent,
    color: theme.isLight ? '#000' : '#fff',
    fontWeight: 900,
  };
}
