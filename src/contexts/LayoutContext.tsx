/**
 * LayoutContext.tsx
 * 
 * Контекст для управления положением и размерами элементов интерфейса
 * Позволяет перемещать элементы, менять их размеры, перемещать между панелями
 */

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface ElementLayout {
  id: string;
  panel: 'left' | 'right' | 'top' | 'bottom' | 'float'; // Где находится элемент
  position?: { x: number; y: number }; // Для float элементов
  size?: { width: number; height: number }; // Размер элемента
  order: number; // Порядок в панели
  visible: boolean;
  locked?: boolean; // Заблокирован от перемещения
  minSize?: { width: number; height: number };
  maxSize?: { width: number; height: number };
}

interface LayoutContextValue {
  layouts: Record<string, ElementLayout>;
  updateLayout: (id: string, updates: Partial<ElementLayout>) => void;
  moveElement: (id: string, targetPanel: ElementLayout['panel'], targetOrder?: number) => void;
  resetLayout: () => void;
  isDragging: string | null;
  setIsDragging: (id: string | null) => void;
  isResizing: string | null;
  setIsResizing: (id: string | null) => void;
}

const LayoutContext = createContext<LayoutContextValue | undefined>(undefined);

const DEFAULT_LAYOUTS: Record<string, ElementLayout> = {
  'streams-list': {
    id: 'streams-list',
    panel: 'left',
    order: 0,
    visible: true,
    minSize: { width: 280, height: 200 },
    maxSize: { width: 600, height: 800 }
  },
  'engine-selector': {
    id: 'engine-selector',
    panel: 'top',
    order: 0,
    visible: true,
    minSize: { width: 200, height: 40 },
    maxSize: { width: 400, height: 400 }
  },
  'custom-nodes': {
    id: 'custom-nodes',
    panel: 'right',
    order: 0,
    visible: true,
    minSize: { width: 280, height: 200 },
    maxSize: { width: 500, height: 800 }
  },
  'player-controls': {
    id: 'player-controls',
    panel: 'bottom',
    order: 0,
    visible: true,
    locked: true // Плеер всегда внизу
  },
  'track-info': {
    id: 'track-info',
    panel: 'bottom',
    order: 1,
    visible: true
  },
  'volume-control': {
    id: 'volume-control',
    panel: 'bottom',
    order: 2,
    visible: true
  }
};

const STORAGE_KEY = 'aurawave_layout_v1';

export const LayoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [layouts, setLayouts] = useState<Record<string, ElementLayout>>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Merge with defaults to handle new elements
        return { ...DEFAULT_LAYOUTS, ...parsed };
      }
    } catch (e) {
      console.error('Failed to load layout:', e);
    }
    return DEFAULT_LAYOUTS;
  });

  const [isDragging, setIsDragging] = useState<string | null>(null);
  const [isResizing, setIsResizing] = useState<string | null>(null);

  // Сохранение в localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(layouts));
    } catch (e) {
      console.error('Failed to save layout:', e);
    }
  }, [layouts]);

  const updateLayout = (id: string, updates: Partial<ElementLayout>) => {
    setLayouts(prev => ({
      ...prev,
      [id]: { ...prev[id], ...updates }
    }));
  };

  const moveElement = (id: string, targetPanel: ElementLayout['panel'], targetOrder?: number) => {
    const element = layouts[id];
    if (!element || element.locked) return;

    setLayouts(prev => {
      const newLayouts = { ...prev };
      
      // Обновляем порядок элементов в целевой панели
      Object.values(newLayouts).forEach((item: ElementLayout) => {
        if (item.panel === targetPanel && item.id !== id) {
          if (targetOrder !== undefined && item.order >= targetOrder) {
            item.order++;
          }
        }
      });

      // Перемещаем элемент
      newLayouts[id] = {
        ...element,
        panel: targetPanel,
        order: targetOrder ?? 0
      };

      return newLayouts;
    });
  };

  const resetLayout = () => {
    setLayouts(DEFAULT_LAYOUTS);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <LayoutContext.Provider value={{
      layouts,
      updateLayout,
      moveElement,
      resetLayout,
      isDragging,
      setIsDragging,
      isResizing,
      setIsResizing
    }}>
      {children}
    </LayoutContext.Provider>
  );
};

export const useLayout = () => {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayout must be used within LayoutProvider');
  }
  return context;
};
