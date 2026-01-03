/**
 * ThemesModule.tsx
 * 
 * Модуль выбора тем оформления
 * Содержит:
 * - 3D облако доступных тем
 * - Превью каждой темы
 */

import React from 'react';
import { Palette } from 'lucide-react';

interface ThemesModuleProps {
  currentThemeId: string;
  moduleRotation: { x: number; y: number };
  moduleCloudItems: any[];
  onThemeSelect: (themeId: string) => void;
  isDragging: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
}

export const ThemesModule: React.FC<ThemesModuleProps> = ({
  currentThemeId,
  moduleRotation,
  moduleCloudItems,
  onThemeSelect,
  isDragging,
  onDragStart,
  onDragEnd
}) => {
  return (
    <div
      className="flex-1 relative cursor-move overflow-hidden bg-black/5 rounded-[4rem] border border-white/5 shadow-inner"
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
          {moduleCloudItems.map((shard, i) => (
            <div
              key={i}
              className="shard-item pointer-events-auto"
              style={{
                transform: `translate3d(${shard.x}px, ${shard.y}px, ${shard.z}px) rotateY(${-moduleRotation.y}deg) rotateX(${-moduleRotation.x}deg)`
              }}
            >
              <button
                onClick={() => onThemeSelect(shard.data.id)}
                className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-2 ${
                  currentThemeId === shard.data.id
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-black/10 border-transparent hover:border-indigo-600'
                }`}
              >
                <Palette size={20} />
                <span className="text-[9px] font-black uppercase">{shard.data.name}</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
