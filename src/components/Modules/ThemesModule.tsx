/**
 * ThemesModule.tsx
 * 
 * Модуль выбора тем оформления
 * Содержит:
 * - 3D облако доступных тем
 * - Превью каждой темы
 */

import React, { useMemo } from 'react';
import { Palette, Sparkles } from 'lucide-react';
import { useSettings } from '../../contexts/SettingsContext';
import { useIconSize } from '../../hocs/withDisplaySettings';
import { generateRandomColor } from '../../utils/colorUtils';
import { THEMES } from '../../constants';

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
  const { settings, theme } = useSettings();
  const iconSize = useIconSize();
  const fontSize = settings.display?.fontSize || 'lg';
  
  // Случайный цвет для модуля
  const moduleColor = useMemo(() => 
    settings.display?.randomColors ? generateRandomColor() : theme.accent,
  [settings.display?.randomColors, theme.accent]);
  
  const randomizeTheme = () => {
    const randomTheme = THEMES[Math.floor(Math.random() * THEMES.length)];
    onThemeSelect(randomTheme.id);
  };
  const textSizeClass = fontSize === 'xxl' ? 'text-2xl' :
                       fontSize === 'xl' ? 'text-xl' :
                       fontSize === 'lg' ? 'text-lg' :
                       fontSize === 'md' ? 'text-base' :
                       fontSize === 'sm' ? 'text-sm' : 'text-xs';
  
  return (
    <div className="flex-1 flex flex-col">
      {/* Кнопка случайной генерации */}
      <div className="flex justify-center mb-6">
        <button
          onClick={randomizeTheme}
          className="flex items-center gap-3 px-8 py-5 rounded-3xl font-black uppercase transition-all shadow-xl hover:scale-110"
          style={{
            backgroundColor: moduleColor,
            color: theme.isLight ? '#000' : '#fff',
            fontSize: fontSize === 'xs' ? '0.75rem' : fontSize === 'sm' ? '0.875rem' : '1rem'
          }}
        >
          <Sparkles size={iconSize} />
          Случайная Тема
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
                  className={`rounded-3xl border-2 transition-all flex flex-col items-center gap-3 shadow-lg`}
                  style={{
                    padding: iconSize / 2,
                    backgroundColor: currentThemeId === shard.data.id ? theme.accent : theme.surface,
                    color: currentThemeId === shard.data.id ? (theme.isLight ? '#000' : '#fff') : theme.text,
                    borderColor: currentThemeId === shard.data.id ? theme.accent : 'transparent'
                  }}
                >
                  <Palette size={iconSize} />
                  <span className={`font-black uppercase ${textSizeClass}`}>{shard.data.name}</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
