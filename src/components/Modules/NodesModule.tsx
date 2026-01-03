/**
 * NodesModule.tsx
 * 
 * Модуль управления нодами (станциями)
 * Содержит:
 * - Список доступных станций
 * - 3D облако нод
 */

import React from 'react';
import { CustomNode } from '../../types';

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
                  className="p-4 bg-indigo-600/10 hover:bg-indigo-600 hover:text-white rounded-2xl text-[10px] font-black uppercase transition-all shadow-md"
                >
                  {isNodeStr ? shard.data : shard.data.name}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
