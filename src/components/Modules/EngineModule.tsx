/**
 * EngineModule.tsx
 * 
 * Модуль выбора движка рендеринга
 * Содержит:
 * - Список доступных движков
 * - Информацию о производительности
 * - Индикацию активного движка
 */

import React from 'react';
import { RenderEngine, RENDER_ENGINES } from '../../constants/renderEngines';

interface EngineModuleProps {
  currentEngine: RenderEngine;
  onEngineChange: (engine: RenderEngine) => void;
  theme: { text: string; accent: string; surface: string };
}

export const EngineModule: React.FC<EngineModuleProps> = ({
  currentEngine,
  onEngineChange,
  theme
}) => {
  return (
    <div 
      className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none"
      onWheel={(e) => e.stopPropagation()}
    >
      <div 
        className="w-full max-w-md mx-4 bg-black/5 backdrop-blur-2xl border rounded-2xl shadow-2xl pointer-events-auto"
        style={{ borderColor: `${theme.text}10` }}
      >
        <div className="p-6 space-y-4">
          <div className="text-center">
            <h3 className="text-xl font-bold uppercase tracking-wider" style={{ color: theme.text }}>
              Render Engine
            </h3>
            <p className="text-xs opacity-50 mt-1" style={{ color: theme.text }}>
              Select visualization renderer
            </p>
          </div>
          
          <div className="space-y-2">
            {RENDER_ENGINES.map(engine => {
              const isActive = currentEngine === engine.id;
              const isAvailable = engine.id === RenderEngine.CSS3D || engine.id === RenderEngine.THREEJS;
              
              return (
                <button
                  key={engine.id}
                  onClick={() => {
                    if (isAvailable) {
                      onEngineChange(engine.id);
                    }
                  }}
                  disabled={!isAvailable}
                  className="w-full p-4 flex items-center gap-4 rounded-xl transition-all text-left"
                  style={{
                    backgroundColor: isActive ? `${theme.accent}20` : 'rgba(255,255,255,0.05)',
                    borderLeft: isActive ? `3px solid ${theme.accent}` : '3px solid transparent',
                    opacity: isAvailable ? 1 : 0.3,
                    cursor: isAvailable ? 'pointer' : 'not-allowed'
                  }}
                >
                  <span className="text-3xl">{engine.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div 
                      className="text-sm font-bold uppercase truncate" 
                      style={{ color: isActive ? theme.accent : theme.text }}
                    >
                      {engine.name}
                    </div>
                    <div className="text-xs opacity-50 truncate" style={{ color: theme.text }}>
                      {engine.performance}
                    </div>
                  </div>
                  {!isAvailable && (
                    <span className="text-[10px] px-2 py-1 rounded bg-yellow-500/20 text-yellow-400 font-bold">
                      SOON
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
