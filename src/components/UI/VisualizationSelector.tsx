/**
 * VisualizationSelector.tsx
 * 
 * Компонент для выбора типа визуализации
 * Группирует провайдеры по категориям
 */

import React from 'react';
import { 
  Orbit, 
  Galaxy, 
  Cloud, 
  Network, 
  Grid3x3, 
  Sparkles,
  Layers,
  CircleDot
} from 'lucide-react';
import { VisualizationProvider } from '../../services/visualizationProviders';
import { useVisualizationProviders } from '../../hooks/useVisualizationProvider';

interface VisualizationSelectorProps {
  currentProvider: VisualizationProvider;
  onProviderChange: (provider: VisualizationProvider) => void;
  theme: { text: string; accent: string; surface: string };
}

// Иконки для провайдеров
const PROVIDER_ICONS: Record<VisualizationProvider, React.ReactNode> = {
  [VisualizationProvider.THREEJS_PLANETS]: <Orbit size={16} />,
  [VisualizationProvider.THREEJS_GALAXY]: <Galaxy size={16} />,
  [VisualizationProvider.THREEJS_NEBULA]: <Sparkles size={16} />,
  [VisualizationProvider.THREEJS_GRID]: <Grid3x3 size={16} />,
  [VisualizationProvider.CSS3D_CLOUD]: <Cloud size={16} />,
  [VisualizationProvider.CSS3D_SPHERE]: <CircleDot size={16} />,
  [VisualizationProvider.CSS3D_HELIX]: <Layers size={16} />,
  [VisualizationProvider.D3_FORCE]: <Network size={16} />,
  [VisualizationProvider.D3_TREE]: <Layers size={16} />,
  [VisualizationProvider.D3_SUNBURST]: <CircleDot size={16} />,
  [VisualizationProvider.GRID_LIST]: <Grid3x3 size={16} />,
  [VisualizationProvider.MASONRY]: <Grid3x3 size={16} />,
  [VisualizationProvider.CAROUSEL]: <Layers size={16} />
};

// Категории на русском
const CATEGORY_NAMES = {
  threejs: '3D (Three.js)',
  css3d: '3D (CSS)',
  d3: 'Графы (D3)',
  '2d': 'Списки'
};

export const VisualizationSelector: React.FC<VisualizationSelectorProps> = ({
  currentProvider,
  onProviderChange,
  theme
}) => {
  const providers = useVisualizationProviders();
  
  // Группировка по категориям
  const providersByCategory = providers.reduce((acc, provider) => {
    if (!acc[provider.category]) {
      acc[provider.category] = [];
    }
    acc[provider.category].push(provider);
    return acc;
  }, {} as Record<string, typeof providers>);
  
  return (
    <div className="space-y-4">
      <h4 
        className="text-xs font-black uppercase tracking-widest"
        style={{ color: theme.text }}
      >
        Тип визуализации
      </h4>
      
      {Object.entries(providersByCategory).map(([category, categoryProviders]) => (
        <div key={category} className="space-y-2">
          <div 
            className="text-[9px] font-bold uppercase tracking-wider opacity-60"
            style={{ color: theme.text }}
          >
            {CATEGORY_NAMES[category as keyof typeof CATEGORY_NAMES] || category}
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            {categoryProviders.map(provider => {
              const isActive = provider.id === currentProvider;
              
              return (
                <button
                  key={provider.id}
                  onClick={() => onProviderChange(provider.id)}
                  className="group relative p-3 rounded-lg transition-all duration-300 hover:scale-105"
                  style={{
                    backgroundColor: isActive ? theme.accent : theme.surface,
                    border: `1px solid ${isActive ? theme.accent : theme.text}22`,
                    color: isActive ? '#000' : theme.text
                  }}
                  title={provider.description}
                >
                  {/* Иконка */}
                  <div className="flex items-center justify-center mb-2">
                    {PROVIDER_ICONS[provider.id]}
                  </div>
                  
                  {/* Название */}
                  <div className="text-[8px] font-bold uppercase tracking-wide text-center leading-tight">
                    {provider.name.split(' ').map((word, i) => (
                      <div key={i}>{word}</div>
                    ))}
                  </div>
                  
                  {/* Бейджи возможностей */}
                  <div className="flex gap-1 mt-2 justify-center">
                    {provider.supportsRotation && (
                      <div 
                        className="text-[6px] px-1.5 py-0.5 rounded-full bg-black/20"
                        title="Поддерживает вращение"
                      >
                        ROT
                      </div>
                    )}
                    {provider.supportsZoom && (
                      <div 
                        className="text-[6px] px-1.5 py-0.5 rounded-full bg-black/20"
                        title="Поддерживает зум"
                      >
                        ZOOM
                      </div>
                    )}
                  </div>
                  
                  {/* Активный индикатор */}
                  {isActive && (
                    <div 
                      className="absolute top-1 right-1 w-2 h-2 rounded-full animate-pulse"
                      style={{ backgroundColor: '#000' }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}
      
      {/* Описание текущего провайдера */}
      <div 
        className="p-3 rounded-lg text-[9px] leading-relaxed"
        style={{ 
          backgroundColor: theme.surface,
          color: theme.text,
          border: `1px solid ${theme.text}22`
        }}
      >
        {providers.find(p => p.id === currentProvider)?.description}
      </div>
    </div>
  );
};
