/**
 * NodesModule.tsx
 * 
 * Модуль управления нодами (станциями)
 * Содержит:
 * - Список доступных станций
 * - 3D облако нод
 */

import React, { useMemo } from 'react';
import { Database, Sparkles } from 'lucide-react';
import { CustomNode } from '../../types';
import { useSettings } from '../../contexts/SettingsContext';
import { useIconSize } from '../../hocs/withDisplaySettings';
import { generateRandomColor } from '../../utils/colorUtils';

interface NodesModuleProps {
  moduleRotation: { x: number; y: number };
  moduleCloudItems: any[];
  onNodeClick: (node: any) => void;
  isDragging: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
}

export const NodesModule: React.FC<NodesModuleProps> = ({
  moduleRotation,
  moduleCloudItems,
  onNodeClick,
  isDragging,
  onDragStart,
  onDragEnd
}) => {
  const { settings, theme } = useSettings();
  const iconSize = useIconSize();
  
  const moduleColor = useMemo(() => 
    settings.display?.randomColors ? generateRandomColor() : theme.accent,
  [settings.display?.randomColors, theme.accent]);
  
  const randomizeNodes = () => {
    const randomNode = moduleCloudItems[Math.floor(Math.random() * moduleCloudItems.length)];
    if (randomNode) onNodeClick(randomNode.data);
  };
  return (
    <div className="flex-1 flex flex-col">
      <div className="flex justify-center mb-6">
        <button
          onClick={randomizeNodes}
          className="flex items-center gap-3 px-8 py-5 rounded-3xl font-black uppercase transition-all shadow-xl hover:scale-110"
          style={{
            backgroundColor: moduleColor,
            color: theme.isLight ? '#000' : '#fff'
          }}
        >
          <Sparkles size={iconSize} />
          Случайная Станция
        </button>
      </div>
      
      <div
        className="flex-1 relative cursor-move overflow-hidden rounded-[4rem] border shadow-inner"
        style={{
          backgroundColor: settings.display?.glassEffect ? theme.surface : 'rgba(0,0,0,0.05)',
          backdropFilter: settings.display?.glassEffect ? 'blur(32px)' : 'none',
          borderColor: `${theme.text}11`
        }}
        onMouseDown={onDragStart}
        onMouseUp={onDragEnd}
      >
      <div className="scene-3d w-full h-full">
        <div
          className="cloud-3d"
          style={{
            transform: `rotateX(${moduleRotation.x}deg) rotateY(${moduleRotation.y}deg)`
          }}
        >
          {moduleCloudItems.map((shard, i) => {
            const isNodeStr = typeof shard.data === 'string';
            
            return (
              <div
                key={i}
                className="shard-item pointer-events-auto"
                style={{
                  transform: `translate3d(${shard.x}px, ${shard.y}px, ${shard.z}px) rotateY(${-moduleRotation.y}deg) rotateX(${-moduleRotation.x}deg)`
                }}
              >
                <button
                  onClick={() => onNodeClick(shard.data)}
                  className="rounded-3xl border-2 transition-all flex flex-col items-center gap-3 shadow-lg hover:scale-110"
                  style={{
                    padding: iconSize / 2,
                    backgroundColor: theme.surface,
                    color: theme.text,
                    borderColor: settings.display?.randomColors ? generateRandomColor() : `${theme.accent}40`
                  }}
                >
                  <Database size={iconSize} />
                  <span className="font-black uppercase text-lg">
                    {isNodeStr ? shard.data : shard.data.name}
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
