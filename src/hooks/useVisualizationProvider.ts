/**
 * useVisualizationProvider.ts
 * 
 * Хук для работы с провайдерами визуализации
 * Упрощает интеграцию в компоненты
 */

import { useMemo } from 'react';
import {
  VisualizationProvider,
  VisualizationItem,
  VisualizationConfig,
  LayoutPosition,
  getVisualizationProvider,
  getAllVisualizationProviders,
  generateVisualizationLayout,
  IVisualizationProvider
} from '../services/visualizationProviders';

interface UseVisualizationProviderProps {
  providerId: VisualizationProvider;
  items: VisualizationItem[];
  config?: Partial<VisualizationConfig>;
}

interface UseVisualizationProviderReturn {
  provider: IVisualizationProvider;
  layout: Map<string, LayoutPosition>;
  config: Partial<VisualizationConfig>;
  supportsRotation: boolean;
  supportsZoom: boolean;
}

/**
 * Основной хук для работы с провайдерами визуализации
 */
export function useVisualizationProvider({
  providerId,
  items,
  config
}: UseVisualizationProviderProps): UseVisualizationProviderReturn {
  const provider = useMemo(
    () => getVisualizationProvider(providerId),
    [providerId]
  );
  
  const defaultConfig = useMemo(
    () => provider.getDefaultConfig(),
    [provider]
  );
  
  const layout = useMemo(
    () => generateVisualizationLayout(providerId, items, config),
    [providerId, items, config]
  );
  
  return {
    provider,
    layout,
    config: { ...defaultConfig, ...config },
    supportsRotation: provider.supportsRotation,
    supportsZoom: provider.supportsZoom
  };
}

/**
 * Хук для получения списка всех провайдеров (для селектора)
 */
export function useVisualizationProviders() {
  return useMemo(() => getAllVisualizationProviders(), []);
}

/**
 * Хук для получения провайдеров по категории
 */
export function useVisualizationProvidersByCategory(category: 'threejs' | 'css3d' | 'd3' | '2d') {
  const allProviders = useVisualizationProviders();
  return useMemo(
    () => allProviders.filter(p => p.category === category),
    [allProviders, category]
  );
}
