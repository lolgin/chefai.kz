/**
 * skins/index.ts
 * 
 * Коллекция готовых скинов для приложения
 * Как в Winamp - каждый скин полностью меняет внешний вид
 */

import { AppSkin, createGradient, createNeonGlow } from '../types/skins';

// СКИН 1: CLASSIC WINAMP
export const classicWinampSkin: AppSkin = {
  id: 'classic-winamp',
  name: '🎵 Classic Winamp',
  author: 'AuraWave Team',
  description: 'Классический стиль Winamp - компактные окна, четкие границы',
  layout: 'classic',
  colors: {
    primary: '#00FF00',
    secondary: '#FF6600',
    background: createGradient(['#1a1a2e', '#16213e'], 180),
    surface: '#2a2a4e',
    text: '#00FF00',
    textSecondary: '#888888',
    accent: '#FF6600',
    border: '#00FF00',
    shadow: 'rgba(0, 255, 0, 0.3)',
    glow: '#00FF00',
  },
  geometry: {
    borderRadius: {
      small: '2px',
      medium: '4px',
      large: '6px',
    },
    spacing: {
      xs: '4px',
      sm: '6px',
      md: '12px',
      lg: '16px',
      xl: '20px',
    },
    fontSize: {
      xs: '8px',
      sm: '10px',
      base: '11px',
      lg: '12px',
      xl: '14px',
      xxl: '16px',
    },
    panelWidth: {
      left: '200px',
      right: '250px',
    },
  },
  effects: {
    blur: '0px',
    shadow: '0 2px 8px rgba(0, 0, 0, 0.5)',
    glow: createNeonGlow('#00FF00', 0.5),
    opacity: 1,
    glassEffect: false,
    neonEffect: true,
    scanlines: false,
    gridPattern: true,
    particles: false,
    animationSpeed: 0.8,
  },
  components: {
    header: {
      height: '40px',
      style: 'compact',
    },
    player: {
      position: 'bottom',
      size: 'compact',
      style: 'bar',
    },
    modules: {
      position: 'center',
      animation: 'scale',
      backdrop: true,
    },
    panels: {
      style: 'overlay',
      width: 'narrow',
    },
    visualizer: {
      style: '3d-cloud',
      intensity: 0.7,
    },
  },
};

// СКИН 2: MODERN MINIMALIST
export const modernMinimalistSkin: AppSkin = {
  id: 'modern-minimal',
  name: '⚪ Modern Minimalist',
  author: 'AuraWave Team',
  description: 'Современный минималистичный дизайн с плавными анимациями',
  layout: 'modern',
  colors: {
    primary: '#6366f1',
    secondary: '#8b5cf6',
    background: createGradient(['#f8fafc', '#f1f5f9', '#e2e8f0'], 135),
    surface: 'rgba(255, 255, 255, 0.8)',
    text: '#1e293b',
    textSecondary: '#64748b',
    accent: '#6366f1',
    border: 'rgba(100, 116, 139, 0.2)',
    shadow: 'rgba(0, 0, 0, 0.1)',
    glow: '#6366f1',
  },
  geometry: {
    borderRadius: {
      small: '12px',
      medium: '20px',
      large: '32px',
    },
    spacing: {
      xs: '8px',
      sm: '16px',
      md: '24px',
      lg: '32px',
      xl: '48px',
    },
    fontSize: {
      xs: '11px',
      sm: '13px',
      base: '15px',
      lg: '18px',
      xl: '24px',
      xxl: '32px',
    },
    panelWidth: {
      left: '280px',
      right: '320px',
    },
  },
  effects: {
    blur: '40px',
    shadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
    glow: '',
    opacity: 0.95,
    glassEffect: true,
    neonEffect: false,
    scanlines: false,
    gridPattern: false,
    particles: true,
    animationSpeed: 0.5,
  },
  components: {
    header: {
      height: '80px',
      style: 'spacious',
    },
    player: {
      position: 'bottom',
      size: 'large',
      style: 'card',
    },
    modules: {
      position: 'center',
      animation: 'fade',
      backdrop: true,
    },
    panels: {
      style: 'push',
      width: 'normal',
    },
    visualizer: {
      style: '3d-cloud',
      intensity: 0.8,
    },
  },
};

// СКИН 3: CYBERPUNK 2077
export const cyberpunkSkin: AppSkin = {
  id: 'cyberpunk-2077',
  name: '🌃 Cyberpunk 2077',
  author: 'AuraWave Team',
  description: 'Киберпанк стиль с неоновыми эффектами и футуристическим дизайном',
  layout: 'cyberpunk',
  colors: {
    primary: '#00ffff',
    secondary: '#ff00ff',
    background: createGradient(['#0a0a1a', '#1a0a2e', '#2d1b4e'], 135),
    surface: 'rgba(20, 10, 40, 0.7)',
    text: '#00ffff',
    textSecondary: '#ff00ff',
    accent: '#ffff00',
    border: '#00ffff',
    shadow: 'rgba(0, 255, 255, 0.5)',
    glow: '#00ffff',
  },
  geometry: {
    borderRadius: {
      small: '0px',
      medium: '2px',
      large: '4px',
    },
    spacing: {
      xs: '6px',
      sm: '12px',
      md: '20px',
      lg: '28px',
      xl: '36px',
    },
    fontSize: {
      xs: '9px',
      sm: '11px',
      base: '13px',
      lg: '16px',
      xl: '20px',
      xxl: '28px',
    },
    panelWidth: {
      left: '240px',
      right: '280px',
    },
  },
  effects: {
    blur: '10px',
    shadow: '0 0 20px rgba(0, 255, 255, 0.5)',
    glow: createNeonGlow('#00ffff', 1),
    opacity: 0.9,
    glassEffect: true,
    neonEffect: true,
    scanlines: true,
    gridPattern: true,
    particles: true,
    animationSpeed: 0.9,
  },
  components: {
    header: {
      height: '60px',
      style: 'compact',
    },
    player: {
      position: 'bottom',
      size: 'normal',
      style: 'bar',
    },
    modules: {
      position: 'center',
      animation: 'slide',
      backdrop: true,
    },
    panels: {
      style: 'overlay',
      width: 'normal',
    },
    visualizer: {
      style: '3d-cloud',
      intensity: 1,
    },
  },
};

// СКИН 4: RETRO TERMINAL
export const retroTerminalSkin: AppSkin = {
  id: 'retro-terminal',
  name: '📟 Retro Terminal',
  author: 'AuraWave Team',
  description: 'Ретро терминал в стиле 80-х с монохромной палитрой',
  layout: 'retro',
  colors: {
    primary: '#33ff33',
    secondary: '#33ff33',
    background: '#000000',
    surface: '#001100',
    text: '#33ff33',
    textSecondary: '#228822',
    accent: '#55ff55',
    border: '#33ff33',
    shadow: 'rgba(51, 255, 51, 0.3)',
    glow: '#33ff33',
  },
  geometry: {
    borderRadius: {
      small: '0px',
      medium: '0px',
      large: '0px',
    },
    spacing: {
      xs: '4px',
      sm: '8px',
      md: '16px',
      lg: '24px',
      xl: '32px',
    },
    fontSize: {
      xs: '10px',
      sm: '12px',
      base: '14px',
      lg: '16px',
      xl: '20px',
      xxl: '24px',
    },
    panelWidth: {
      left: '220px',
      right: '260px',
    },
  },
  effects: {
    blur: '0px',
    shadow: '0 0 10px rgba(51, 255, 51, 0.5)',
    glow: createNeonGlow('#33ff33', 0.8),
    opacity: 1,
    glassEffect: false,
    neonEffect: true,
    scanlines: true,
    gridPattern: false,
    particles: false,
    animationSpeed: 1,
  },
  components: {
    header: {
      height: '50px',
      style: 'minimal',
    },
    player: {
      position: 'bottom',
      size: 'compact',
      style: 'minimalist',
    },
    modules: {
      position: 'fullscreen',
      animation: 'none',
      backdrop: false,
    },
    panels: {
      style: 'sidebar',
      width: 'narrow',
    },
    visualizer: {
      style: '2d-bars',
      intensity: 0.6,
    },
  },
};

// Экспорт всех скинов
export const AVAILABLE_SKINS: AppSkin[] = [
  modernMinimalistSkin,
  classicWinampSkin,
  cyberpunkSkin,
  retroTerminalSkin,
];

// Получить скин по ID
export function getSkinById(id: string): AppSkin | undefined {
  return AVAILABLE_SKINS.find(skin => skin.id === id);
}

// Получить дефолтный скин
export function getDefaultSkin(): AppSkin {
  return modernMinimalistSkin;
}
