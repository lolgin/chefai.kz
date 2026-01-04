/**
 * SkinContext.tsx
 * 
 * Контекст для управления скинами интерфейса
 * Применяет скины глобально ко всему приложению
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppSkin } from '../types/skins';
import { getDefaultSkin, getSkinById } from '../skins';

interface SkinContextType {
  currentSkin: AppSkin;
  setSkin: (skinId: string) => void;
  applySkinStyles: () => void;
}

const SkinContext = createContext<SkinContextType | undefined>(undefined);

const STORAGE_KEY = 'aurawave_skin_v1';

export const SkinProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentSkin, setCurrentSkin] = useState<AppSkin>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const skin = getSkinById(saved);
      if (skin) return skin;
    }
    return getDefaultSkin();
  });

  // Применить стили скина к документу
  const applySkinStyles = () => {
    const root = document.documentElement;
    const { colors, geometry, effects } = currentSkin;

    // Цвета
    root.style.setProperty('--color-primary', colors.primary);
    root.style.setProperty('--color-secondary', colors.secondary);
    root.style.setProperty('--color-background', colors.background);
    root.style.setProperty('--color-surface', colors.surface);
    root.style.setProperty('--color-text', colors.text);
    root.style.setProperty('--color-text-secondary', colors.textSecondary);
    root.style.setProperty('--color-accent', colors.accent);
    root.style.setProperty('--color-border', colors.border);
    root.style.setProperty('--color-shadow', colors.shadow);
    root.style.setProperty('--color-glow', colors.glow);

    // Геометрия
    root.style.setProperty('--radius-sm', geometry.borderRadius.small);
    root.style.setProperty('--radius-md', geometry.borderRadius.medium);
    root.style.setProperty('--radius-lg', geometry.borderRadius.large);
    
    root.style.setProperty('--spacing-xs', geometry.spacing.xs);
    root.style.setProperty('--spacing-sm', geometry.spacing.sm);
    root.style.setProperty('--spacing-md', geometry.spacing.md);
    root.style.setProperty('--spacing-lg', geometry.spacing.lg);
    root.style.setProperty('--spacing-xl', geometry.spacing.xl);
    
    root.style.setProperty('--font-xs', geometry.fontSize.xs);
    root.style.setProperty('--font-sm', geometry.fontSize.sm);
    root.style.setProperty('--font-base', geometry.fontSize.base);
    root.style.setProperty('--font-lg', geometry.fontSize.lg);
    root.style.setProperty('--font-xl', geometry.fontSize.xl);
    root.style.setProperty('--font-xxl', geometry.fontSize.xxl);

    // Эффекты
    root.style.setProperty('--effect-blur', effects.blur);
    root.style.setProperty('--effect-shadow', effects.shadow);
    root.style.setProperty('--effect-glow', effects.glow);
    root.style.setProperty('--effect-opacity', effects.opacity.toString());
    root.style.setProperty('--animation-speed', `${effects.animationSpeed}s`);

    // Фон body
    document.body.style.background = colors.background;
    document.body.style.color = colors.text;

    // Кастомный CSS если есть
    if (currentSkin.customCSS) {
      let styleEl = document.getElementById('custom-skin-styles');
      if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = 'custom-skin-styles';
        document.head.appendChild(styleEl);
      }
      styleEl.textContent = currentSkin.customCSS;
    }
  };

  // Применять стили при изменении скина
  useEffect(() => {
    applySkinStyles();
    localStorage.setItem(STORAGE_KEY, currentSkin.id);
  }, [currentSkin]);

  const setSkin = (skinId: string) => {
    const skin = getSkinById(skinId);
    if (skin) {
      setCurrentSkin(skin);
    }
  };

  return (
    <SkinContext.Provider value={{ currentSkin, setSkin, applySkinStyles }}>
      {children}
    </SkinContext.Provider>
  );
};

export const useSkin = () => {
  const context = useContext(SkinContext);
  if (!context) {
    throw new Error('useSkin must be used within SkinProvider');
  }
  return context;
};
