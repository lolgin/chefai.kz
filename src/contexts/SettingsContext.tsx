/**
 * SettingsContext.tsx
 * 
 * Контекст для управления настройками приложения
 * Содержит:
 * - Тема оформления
 * - Настройки эквалайзера
 * - Пользовательские ноды (станции)
 * - Избранное и черный список
 * - Сохранение/загрузка из localStorage
 */

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { AppSettings, ThemeScheme, CustomNode, FavoriteNode, DisplaySettings, BlacklistedStream, SearchHistoryItem } from '../types';
import { THEMES } from '../constants';

interface SettingsContextType {
  settings: AppSettings;
  theme: ThemeScheme;
  updateSettings: (updates: Partial<AppSettings>) => void;
  resetSettings: () => void;
  addCustomNode: (node: CustomNode) => void;
  removeCustomNode: (id: string) => void;
  addFavorite: (node: FavoriteNode) => void;
  removeFavorite: (url: string) => void;
  updateDisplaySettings: (updates: Partial<DisplaySettings>) => void;
  addToBlacklist: (url: string, reason?: BlacklistedStream['reason']) => void;
  removeFromBlacklist: (url: string) => void;
  isBlacklisted: (url: string) => boolean;
  addToSearchHistory: (query: string, resultsCount?: number) => void;
  clearSearchHistory: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const DEFAULT_SETTINGS: AppSettings = {
  themeId: 'glass-frost',
  equalizer: {
    bands: { '32': 0, '64': 0, '125': 0, '250': 0, '500': 0, '1k': 0, '2k': 0, '4k': 0, '8k': 0, '16k': 0 },
    preamp: 1,
    stereoWidth: 1,
    limiterEnabled: true,
    eqBandCount: 10
  },
  customNodes: [],
  favorites: [],
  blacklist: [],
  blacklistedStreams: [],
  searchCache: [],
  searchHistory: [],
  display: {
    fontSize: 'lg',
    iconSize: 'lg',
    compactMode: false,
    glassEffect: true,
    randomColors: false,
    animationSpeed: 'normal',
    borderStyle: 'gradient',
    use3DCosmicView: true, // DEPRECATED: для обратной совместимости
    renderEngine: 'threejs', // По умолчанию Three.js движок
    spacing: 'normal',
    visualizationProvider: undefined, // Провайдер визуализации отключен по умолчанию
    visualizationEnabled: true, // Визуализация включена по умолчанию
    show3DLabels: true, // Показывать метки на 3D планетах
    limitTagLength: true, // Ограничивать длину названий
    maxTagWords: 3, // До 3 слов
    cloudSettings: {
      viewMode: 'cloud',
      cloudScale: 1.0,
      rotationSpeed: 1.0,
      showConnections: false,
      connectionStyle: 'threads',
      sortBy: 'popularity',
      filterTags: []
    }
  },
  moduleCustomizations: []
};

const STORAGE_KEY = 'aurawave_v31_settings'; // Добавлена история поисков

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      } catch (error) {
        console.warn('Failed to parse settings from localStorage, using defaults', error);
        return DEFAULT_SETTINGS;
      }
    }
    return DEFAULT_SETTINGS;
  });

  // Получаем текущую тему
  const theme: ThemeScheme = useMemo(
    () => THEMES.find(t => t.id === settings.themeId) || THEMES[0],
    [settings.themeId]
  );

  // Сохранение в localStorage при изменении настроек
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (updates: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  const updateDisplaySettings = (updates: Partial<DisplaySettings>) => {
    setSettings(prev => ({
      ...prev,
      display: { ...prev.display!, ...updates }
    }));
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
    localStorage.removeItem(STORAGE_KEY);
  };

  const addCustomNode = (node: CustomNode) => {
    setSettings(prev => ({
      ...prev,
      customNodes: [...prev.customNodes, node]
    }));
  };

  const removeCustomNode = (id: string) => {
    setSettings(prev => ({
      ...prev,
      customNodes: prev.customNodes.filter(n => n.id !== id)
    }));
  };

  const addFavorite = (node: FavoriteNode) => {
    setSettings(prev => ({
      ...prev,
      favorites: [...prev.favorites, node]
    }));
  };

  const removeFavorite = (url: string) => {
    setSettings(prev => ({
      ...prev,
      favorites: prev.favorites.filter(n => n.url !== url)
    }));
  };

  const addToBlacklist = (url: string, reason?: BlacklistedStream['reason']) => {
    setSettings(prev => {
      const blacklistedStreams = prev.blacklistedStreams || [];
      // Проверяем, нет ли уже в списке
      if (blacklistedStreams.some(b => b.url === url)) {
        return prev;
      }
      return {
        ...prev,
        blacklistedStreams: [
          ...blacklistedStreams,
          { url, reason: reason || 'user_ban', timestamp: Date.now() }
        ]
      };
    });
  };

  const removeFromBlacklist = (url: string) => {
    setSettings(prev => ({
      ...prev,
      blacklistedStreams: (prev.blacklistedStreams || []).filter(b => b.url !== url)
    }));
  };

  const isBlacklisted = (url: string): boolean => {
    const blacklistedStreams = settings.blacklistedStreams || [];
    return blacklistedStreams.some(b => b.url === url);
  };

  const addToSearchHistory = (query: string, resultsCount?: number) => {
    if (!query || query.trim().length < 2) return;
    
    setSettings(prev => {
      const searchHistory = prev.searchHistory || [];
      // Убираем дубли по query
      const filtered = searchHistory.filter(item => item.query !== query);
      // Добавляем новый в начало
      const updated = [
        { query, timestamp: Date.now(), resultsCount },
        ...filtered
      ].slice(0, 20); // Храним только 20 последних
      
      return {
        ...prev,
        searchHistory: updated
      };
    });
  };

  const clearSearchHistory = () => {
    setSettings(prev => ({
      ...prev,
      searchHistory: []
    }));
  };

  const value: SettingsContextType = {
    settings,
    theme,
    updateSettings,
    updateDisplaySettings,
    resetSettings,
    addCustomNode,
    removeCustomNode,
    addFavorite,
    removeFavorite,
    addToBlacklist,
    removeFromBlacklist,
    isBlacklisted,
    addToSearchHistory,
    clearSearchHistory
  };

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
};
