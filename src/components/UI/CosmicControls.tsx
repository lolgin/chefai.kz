/**
 * CosmicControls.tsx
 * 
 * Панель управления космической визуализацией
 */

import React from 'react';
import { Play, Pause, Circle, Sparkles, Wind, Orbit } from 'lucide-react';

interface CosmicControlsProps {
  cloudFormation: 'sphere' | 'spiral' | 'elliptical' | 'nebula';
  onFormationChange: (formation: 'sphere' | 'spiral' | 'elliptical' | 'nebula') => void;
  animationEnabled: boolean;
  onAnimationToggle: () => void;
  zoom: number;
  theme: any;
}

export const CosmicControls: React.FC<CosmicControlsProps> = ({
  cloudFormation,
  onFormationChange,
  animationEnabled,
  onAnimationToggle,
  zoom,
  theme
}) => {
  const formations = [
    { id: 'sphere' as const, icon: <Circle size={18} />, label: 'СФЕРА' },
    { id: 'spiral' as const, icon: <Sparkles size={18} />, label: 'СПИРАЛЬ' },
    { id: 'elliptical' as const, icon: <Orbit size={18} />, label: 'ЭЛЛИПС' },
    { id: 'nebula' as const, icon: <Wind size={18} />, label: 'ТУМАННОСТЬ' }
  ];

  return (
    <div
      className="fixed bottom-32 left-1/2 -translate-x-1/2 z-[400] flex items-center gap-3 px-6 py-3 rounded-2xl backdrop-blur-xl"
      style={{
        background: `${theme.surface}dd`,
        border: `2px solid ${theme.accent}40`,
        boxShadow: `0 8px 32px ${theme.accent}20`
      }}
    >
      {/* Кнопка анимации */}
      <button
        onClick={onAnimationToggle}
        className="p-2 rounded-lg transition-all hover:scale-110"
        style={{
          background: animationEnabled ? `${theme.accent}40` : 'transparent',
          border: `2px solid ${theme.accent}60`
        }}
        title={animationEnabled ? 'Отключить анимацию' : 'Включить анимацию'}
      >
        {animationEnabled ? (
          <Play size={18} style={{ color: theme.accent }} />
        ) : (
          <Pause size={18} style={{ color: theme.text, opacity: 0.5 }} />
        )}
      </button>

      <div className="w-px h-6" style={{ background: `${theme.text}20` }} />

      {/* Форматы облака */}
      <div className="flex gap-2">
        {formations.map(formation => (
          <button
            key={formation.id}
            onClick={() => onFormationChange(formation.id)}
            className="p-2 rounded-lg transition-all hover:scale-110 flex flex-col items-center gap-1"
            style={{
              background: cloudFormation === formation.id ? `${theme.accent}40` : 'transparent',
              border: `2px solid ${cloudFormation === formation.id ? theme.accent : `${theme.accent}30`}`
            }}
            title={formation.label}
          >
            <div style={{ color: cloudFormation === formation.id ? theme.accent : theme.text }}>
              {formation.icon}
            </div>
          </button>
        ))}
      </div>

      <div className="w-px h-6" style={{ background: `${theme.text}20` }} />

      {/* Индикатор зума */}
      <div className="flex items-center gap-2 px-3">
        <span className="text-xs font-bold opacity-50" style={{ color: theme.text }}>
          ZOOM
        </span>
        <span className="text-sm font-bold" style={{ color: theme.accent }}>
          {Math.round(zoom * 100)}%
        </span>
      </div>
    </div>
  );
};
