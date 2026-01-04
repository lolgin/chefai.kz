/**
 * ShardCloud.tsx
 * 
 * Компонент 3D облака тегов на фоне
 * Содержит:
 * - Вращающееся 3D облако
 * - Интерактивные теги
 * - Анимация
 */

import React from 'react';

interface ShardCloudProps {
  rotation: { x: number; y: number };
  shards: Array<{
    data: any; // Может быть строка или объект (DiscoveredStream, Theme, Node, etc)
    x: number;
    y: number;
    z: number;
    size: number;
  }>;
  onShardClick: (item: any) => void; // Передаём весь объект или строку
  isDragging: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
  theme: { accent: string };
}

export const ShardCloud: React.FC<ShardCloudProps> = ({
  rotation,
  shards,
  onShardClick,
  isDragging,
  onDragStart,
  onDragEnd,
  theme
}) => {
  return (
    <div
      className="scene-3d flex-1 pointer-events-none"
      onMouseDown={onDragStart}
      onMouseUp={onDragEnd}
    >
      <div
        className="cloud-3d"
        style={{
          transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`
        }}
      >
        {shards.map((shard, i) => {
          // Извлекаем текст для отображения
          const displayText = typeof shard.data === 'string' 
            ? shard.data 
            : (shard.data?.name || shard.data?.title || 'UNKNOWN');
          
          return (
            <div
              key={i}
              className="shard-item pointer-events-auto"
              style={{
                transform: `translate3d(${shard.x}px, ${shard.y}px, ${shard.z}px) rotateY(${-rotation.y}deg) rotateX(${-rotation.x}deg)`
              }}
              onClick={() => onShardClick(shard.data)}
            >
              <span
                className="font-black uppercase tracking-widest transition-all hover:scale-150 block"
                style={{
                  fontSize: `${shard.size}rem`,
                  color: i % 5 === 0 ? theme.accent : 'inherit',
                  opacity: 0.15 + (shard.z + 340) / 680
                }}
              >
                {displayText}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
